/**
 * =========================================================================
 * 🎮 APP.JS - 遊戲業務邏輯、UI 互動與跨電腦雲端同步核心
 * 🤖 AI 迭代維護指南：
 *    - 本模組包含完整遊戲狀態機 (三大討伐模式 + 極速手速賽)
 *    - 包含排行榜渲染 (renderLeaderboardTable, renderSpeedLeaderboardTable)
 *    - 包含 Webhook 雙向資料傳輸 (sendReliableWebhook, fetchCloudLeaderboard)
 * =========================================================================
 */

const SafeStorage = {
      _mem: {},
      getItem(key) {
        try {
          if (window.localStorage) {
            const v = window.localStorage.getItem(key);
            if (v !== null) return v;
          }
        } catch(e) {}
        return this._mem[key] !== undefined ? this._mem[key] : null;
      },
      setItem(key, val) {
        const strVal = String(val);
        this._mem[key] = strVal;
        try {
          if (window.localStorage) window.localStorage.setItem(key, strVal);
        } catch(e) {}
      },
      removeItem(key) {
        delete this._mem[key];
        try {
          if (window.localStorage) window.localStorage.removeItem(key);
        } catch(e) {}
      },
      getAllKeys() {
        const keysSet = new Set(Object.keys(this._mem));
        try {
          if (window.localStorage) {
            for (let i = 0; i < window.localStorage.length; i++) {
              keysSet.add(window.localStorage.key(i));
            }
          }
        } catch(e) {}
        return Array.from(keysSet);
      }
    };

    // State Variables
    let activeTab = 'top40';
    let currentClass = 'P6A';
    let currentStudent = null;       // { cls, num, name }
    let activeSkills = [];           // 當前已解鎖技能清單
    let gameStage = 1;               // 1..5 關卡循環
    let sessionScore = 0;            // 當前輪次得分
    let sessionCorrectCount = 0;     // 當前輪次答對關數
    let comboCount = 0;              // 連擊數
    let roundMistakeCount = 0;       // 當前關卡累積失誤次數 (>=5次觸發提示)
    let currentGameMode = 'connected'; // 'connected' | 'split' | 'special'
    let currentQuiz = null;          // 當前題目物件
    let selectedCodes = [];          // 模式1與3已捕捉字碼
    let selectedPrefix = [];         // 模式2已捕捉字首碼
    let selectedBody = [];           // 模式2已捕捉字身碼
    let activeOrbs = [];             // 畫面上的遊行球集合
    let wanderingSpeedMultiplier = 0.85;
    let animationFrameId = null;
    let autoNextTimer = null;
    let roundShieldActive = false;
    let isKiosk = false;
    let kioskInterval = null;

    // 題目佇列 (確保每輪5關隨機抽取且不重複)
    let modeQuizQueues = {
      connected: [],
      split: [],
      special: []
    };

    function getNextQuiz(mode) {
      if (!modeQuizQueues[mode] || modeQuizQueues[mode].length === 0) {
        let pool = [];
        if (mode === 'connected') pool = [...DATA.connected_words];
        else if (mode === 'split') pool = [...DATA.split_words];
        else if (mode === 'special') pool = [...DATA.special_words];
        modeQuizQueues[mode] = pool.sort(() => 0.5 - Math.random());
      }
      return modeQuizQueues[mode].pop();
    }

    // Confetti Engine
    function burstConfetti() {
      const canvas = document.getElementById('confetti-canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const pieces = [];
      const colors = ['#FACC15', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#F97316'];
      for (let i = 0; i < 95; i++) {
        pieces.push({
          x: canvas.width * 0.5,
          y: canvas.height * 0.35,
          vx: (Math.random() - 0.5) * 18,
          vy: (Math.random() - 0.7) * 18,
          size: Math.random() * 8 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vrot: (Math.random() - 0.5) * 14,
          gravity: 0.35,
          opacity: 1
        });
      }
      
      function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        pieces.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.rotation += p.vrot;
          p.opacity -= 0.009;
          if (p.opacity > 0) {
            alive = true;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
          }
        });
        if (alive) requestAnimationFrame(render);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      render();
    }

    // Tier and Skills Engine
    

    

    function triggerSkillToast(icon, text) {
      const toast = document.getElementById('skill-toast');
      document.getElementById('skill-toast-icon').textContent = icon;
      document.getElementById('skill-toast-text').textContent = text;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    }

    function triggerStagePassToast(modeLabel, stageNum, scoreEarned, nextStageNum) {
      const toast = document.getElementById('stage-pass-toast');
      const icon = document.getElementById('stage-pass-toast-icon');
      const text = document.getElementById('stage-pass-toast-text');
      if (!toast) return;

      icon.textContent = nextStageNum ? '🎉' : '🏆';
      if (nextStageNum) {
        text.innerHTML = `<strong>${modeLabel}</strong> 第 ${stageNum} 關 通關成功！<span style="color:#FEF08A;font-weight:900;">+${scoreEarned} 分</span> ➔ 自動進入第 ${nextStageNum} 關...`;
      } else {
        text.innerHTML = `<strong>${modeLabel}</strong> 5 關挑戰全數通關！<span style="color:#FEF08A;font-weight:900;">+${scoreEarned} 分</span> ➔ 正在進行總結算...`;
      }
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 1600);
    }

    // Local Storage & Stats Management
    function getStudentStats(cls, num) {
      const key = `p6_score_${cls}_${num}`;
      const val = SafeStorage.getItem(key);
      if (val) {
        try { return JSON.parse(val); } catch(e) {}
      }
      return { totalScore: 0, kills: 0, mode1Score: 0, mode2Score: 0, mode3Score: 0 };
    }

    // =========================================================================
    // 🛡️ 雲端上傳可靠性引擎 (冪等性 requestId + 離線補送隊列 + 結算批次發送)
    // =========================================================================
    function generateRequestId() {
      return 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    async function sendReliableWebhook(payload) {
      const url = (typeof CONFIG !== 'undefined' && CONFIG.GAS_WEBHOOK_URL) ? CONFIG.GAS_WEBHOOK_URL : '';
      if (!url || url.includes('YourDeploymentIdHere')) {
        return;
      }

      if (!payload.requestId) {
        payload.requestId = generateRequestId();
      }

      try {
        const res = await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        // 觸發雲端刷新
        setTimeout(() => {
          if (typeof fetchCloudLeaderboard === 'function') fetchCloudLeaderboard(true);
        }, 1500);
      } catch (err) {
        console.warn('雲端上傳暫時失敗，已移入待補送清單:', err);
        try {
          const rawPending = SafeStorage.getItem('p6_pending_uploads');
          const queue = rawPending ? JSON.parse(rawPending) : [];
          queue.push({ payload, time: Date.now() });
          SafeStorage.setItem('p6_pending_uploads', JSON.stringify(queue.slice(-20))); // 最多保留最近20筆
        } catch(e) {}
      }
    }

    // 當網路暢通時自動清空待補送隊列
    async function flushPendingUploads() {
      try {
        const rawPending = SafeStorage.getItem('p6_pending_uploads');
        if (!rawPending) return;
        const queue = JSON.parse(rawPending);
        if (!Array.isArray(queue) || queue.length === 0) return;

        SafeStorage.removeItem('p6_pending_uploads');
        for (const item of queue) {
          if (item && item.payload) {
            await sendReliableWebhook(item.payload);
          }
        }
      } catch(e) {}
    }

    function saveStudentStats(cls, num, scoreDelta, isKill, mode, bestTime = null, wordCount = 10, weekKey = 'w5_hw1') {
      const key = `p6_score_${cls}_${num}`;
      const stats = getStudentStats(cls, num);
      stats.totalScore += scoreDelta;
      if (isKill) stats.kills++;
      if (mode === 'connected') stats.mode1Score = (stats.mode1Score || 0) + scoreDelta;
      else if (mode === 'split') stats.mode2Score = (stats.mode2Score || 0) + scoreDelta;
      else if (mode === 'special') stats.mode3Score = (stats.mode3Score || 0) + scoreDelta;
      stats.lastUpdate = new Date().toISOString();
      SafeStorage.setItem(key, JSON.stringify(stats));

      // 若為手速賽或關卡結算，發送可靠上傳
      sendReliableWebhook({
        grade: 6,
        cls: cls,
        num: num,
        roundScore: scoreDelta,
        scoreDelta: scoreDelta,
        gameMode: mode,
        mode: mode,
        bestTime: bestTime,
        wordCount: wordCount,
        weekKey: weekKey,
        totalScore: stats.totalScore,
        kills: stats.kills,
        timestamp: stats.lastUpdate
      });
    }

    // ==========================================
    // 📊 統計棒形圖 (Bar Chart) 生成組件
    // ==========================================
    function buildBarChartHtml(title, subtitle, dataList, maxVal, barGradient, totalBadge) {
      const barsHtml = dataList.map(item => {
        const pct = Math.max(12, Math.round((item.val / Math.max(1, maxVal)) * 100));
        return `
          <div class="chart-bar-col">
            <div class="chart-bar-val">${item.val} 人</div>
            <div class="chart-bar-pillar" style="height: ${pct}%; background: ${barGradient};" title="${item.cls}：${item.val} 人"></div>
            <div class="chart-bar-label">${item.cls}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="chart-container-card">
          <div class="chart-header">
            <div>
              <div class="chart-title">${title}</div>
              <div style="font-size: 12px; color: #64748B; margin-top: 2px;">${subtitle}</div>
            </div>
            <div class="stat-pill" style="font-size: 12px; padding: 3px 10px; background: #F8FAFC; border-color: #CBD5E1;">
              <strong>${totalBadge}</strong>
            </div>
          </div>
          <div class="chart-bars-wrap">
            ${barsHtml}
          </div>
        </div>
      `;
    }

    function renderClassBarCharts() {
      const classes = ['P6A', 'P6B', 'P6C', 'P6D', 'P6E', 'P6F'];

      // 1. 各班入選前 40 名人數分佈統計
      const top40Counts = {};
      DATA.top40.forEach(s => top40Counts[s.cls] = (top40Counts[s.cls] || 0) + 1);
      let maxTop40 = 1;
      classes.forEach(c => {
        if ((top40Counts[c] || 0) > maxTop40) maxTop40 = top40Counts[c];
      });
      const top40Data = classes.map(c => ({ cls: c, val: top40Counts[c] || 0 }));
      const chartTop40El = document.getElementById('chart-top40-container');
      if (chartTop40El) {
        chartTop40El.innerHTML = buildBarChartHtml(
          '📊 各班入選全級前 40 名人數分佈 (統計棒形圖)',
          '統計 P6A 至 P6F 各班在全級前 40 名龍虎榜中所佔之傑出訓練家人數',
          top40Data,
          maxTop40,
          'linear-gradient(180deg, #60A5FA 0%, #2563EB 100%)',
          '全級前40名合計：40 人'
        );
      }

      // 2. 各班 400 分大滿貫人數分佈統計
      let maxPerf = 1;
      let totalPerf = 0;
      const perfData = classes.map(c => {
        const count = (DATA.perfect_students[c] || []).length;
        if (count > maxPerf) maxPerf = count;
        totalPerf += count;
        return { cls: c, val: count };
      });
      const chartPerfEl = document.getElementById('chart-perfect-container');
      if (chartPerfEl) {
        chartPerfEl.innerHTML = buildBarChartHtml(
          '📊 各班 400 分大滿貫滿分人數分佈 (統計棒形圖)',
          '統計各班達成 4 次作業 400 分全滿分榮譽之訓練家人數',
          perfData,
          maxPerf,
          'linear-gradient(180deg, #FDE047 0%, #D97706 100%)',
          `全級滿分合計：${totalPerf} 人`
        );
      }
    }

    // ==========================================
    // TAB 1: 🏆 全級前 40 名龍虎榜 (頒獎台 + 角色卡)
    // ==========================================
    function renderTop40() {
      const top3 = DATA.top40.slice(0, 3);
      const rest = DATA.top40.slice(3);
      
      const podiumArea = document.getElementById('podium-area');
      podiumArea.innerHTML = `
        <div class="podium-step podium-2">
          <div class="crown-banner">🥈</div>
          <img class="podium-pokemon-img" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" alt="小火龍" title="小火龍 (Charmander) 🔥" onerror="handlePodiumImgError(this, '🔥')">
          <div class="podium-name">${top3[1].name}</div>
          <div class="podium-class">${top3[1].cls} (${top3[1].num}號) · 小火龍之火</div>
          <div class="podium-badge-score">400分 · 5印章</div>
          <div class="podium-time">⏱️ ${top3[1].date.replace('2026-', '')}</div>
        </div>
        <div class="podium-step podium-1">
          <div class="crown-banner">👑</div>
          <img class="podium-pokemon-img" style="width:88px; height:88px;" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="皮卡丘" title="皮卡丘 (Pikachu) ⚡" onerror="handlePodiumImgError(this, '⚡')">
          <div class="podium-name">${top3[0].name}</div>
          <div class="podium-class">${top3[0].cls} (${top3[0].num}號) · 皮卡丘雷霆</div>
          <div class="podium-badge-score">400分 · 5印章</div>
          <div class="podium-time">⏱️ ${top3[0].date.replace('2026-', '')}</div>
        </div>
        <div class="podium-step podium-3">
          <div class="crown-banner">🥉</div>
          <img class="podium-pokemon-img" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" alt="妙蛙種子" title="妙蛙種子 (Bulbasaur) 🍃" onerror="handlePodiumImgError(this, '🍃')">
          <div class="podium-name">${top3[2].name}</div>
          <div class="podium-class">${top3[2].cls} (${top3[2].num}號) · 妙蛙飛葉</div>
          <div class="podium-badge-score">400分 · 5印章</div>
          <div class="podium-time">⏱️ ${top3[2].date.replace('2026-', '')}</div>
        </div>
      `;
      
      const restPool = DATA.pokemon_pool.slice(3);
      const listArea = document.getElementById('top40-list');
      listArea.innerHTML = rest.map((s, idx) => {
        const pm = restPool[idx % restPool.length];
        const isElite = (s.rank >= 4 && s.rank <= 10);
        return `
          <div class="rank-card ${isElite ? 'rank-card-elite-flash' : ''}" data-student="${s.cls}-${s.num}-${s.name}">
            <div class="rank-left">
              <div class="rank-poke-avatar" style="background:${pm.color}; border-color:${pm.border};" title="${pm.name}">
                <img class="rank-poke-img" src="${pm.img}" alt="${pm.name}" onerror="handleRankImgError(this, '${pm.icon || '⚡'}')">
              </div>
              <div>
                <div class="st-name">
                  #${s.rank} ${s.name} <span class="st-poke-tag">${pm.name}</span>
                  ${isElite ? '<span class="badge-elite-top10">✨ TOP 10 菁英</span>' : ''}
                </div>
                <div class="st-class">${s.cls} · ${s.num}號 · 夥伴：${pm.name} (${pm.tag})</div>
              </div>
            </div>
            <div class="rank-right">
              <div class="st-score">${s.total} 分</div>
              <div class="st-date">交齊: ${s.date.replace('2026-', '')}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // ==========================================
    // TAB 2: 🌟 各班前 10 名榮譽榜 (角色卡展示)
    // ==========================================
    function switchClass(cls) {
      currentClass = cls;
      document.querySelectorAll('.cls-chip').forEach(c => {
        c.classList.toggle('active', c.textContent.includes(cls));
      });
      renderClassCards();
    }

    function renderClassCards() {
      const container = document.getElementById('class-cards');
      const students = DATA.class_top10[currentClass] || [];
      const classOffset = ['P6A', 'P6B', 'P6C', 'P6D', 'P6E', 'P6F'].indexOf(currentClass) * 14;
      
      container.innerHTML = students.map((s, idx) => {
        const pm = DATA.pokemon_pool[(classOffset + idx) % DATA.pokemon_pool.length];
        let medal = '';
        let cardClass = 'rank-card';
        let honorBadge = '';

        // 各班前 10 名榮譽榜：前 3 名配置冠軍、亞軍、季軍專屬流光閃爍特效
        if (idx === 0) {
          medal = '🥇 ';
          cardClass += ' rank-card-class-champion';
          honorBadge = '<span class="badge-class-honor gold">👑 班級冠軍</span>';
        } else if (idx === 1) {
          medal = '🥈 ';
          cardClass += ' rank-card-class-runnerup';
          honorBadge = '<span class="badge-class-honor silver">🥈 班級亞軍</span>';
        } else if (idx === 2) {
          medal = '🥉 ';
          cardClass += ' rank-card-class-third';
          honorBadge = '<span class="badge-class-honor bronze">🥉 班級季軍</span>';
        }

        return `
          <div class="${cardClass}" data-student="${currentClass}-${s.num}-${s.name}">
            <div class="rank-left">
              <div class="rank-poke-avatar" style="background:${pm.color}; border-color:${pm.border};" title="${pm.name}">
                <img class="rank-poke-img" src="${pm.img}" alt="${pm.name}" onerror="handleRankImgError(this, '${pm.icon || '⚡'}')">
              </div>
              <div>
                <div class="st-name">
                  ${medal}#${s.rank} ${s.name} <span class="st-poke-tag">${pm.name}</span>
                  ${honorBadge}
                </div>
                <div class="st-class">${currentClass} · ${s.num}號 · 夥伴：${pm.name} (${pm.tag})</div>
              </div>
            </div>
            <div class="rank-right">
              <div class="st-score">${s.total} 分</div>
              <div class="st-date">⏱️ ${s.date.replace('2026-', '')}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // ==========================================
    // TAB 3: 🎉 400分滿分星光榜 (107人全員展示)
    // ==========================================
    function renderPerfectScorers() {
      const container = document.getElementById('perfect-class-groups');
      const classes = ['P6A', 'P6B', 'P6C', 'P6D', 'P6E', 'P6F'];
      let globalCounter = 0;
      
      container.innerHTML = classes.map(cls => {
        const members = DATA.perfect_students[cls] || [];
        return `
          <div style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 17px; font-weight: 900; color: #1E3A8A;">● ${cls} 班</span>
              <span style="background: #DBEAFE; color: #1D4ED8; font-size: 12px; font-weight: 800; padding: 2px 10px; border-radius: 12px;">共 ${members.length} 位滿分</span>
            </div>
            <div class="perfect-grid">
              ${members.map((m) => {
                const pm = DATA.pokemon_pool[(globalCounter++) % DATA.pokemon_pool.length];
                return `
                  <div class="star-card" data-student="${cls}-${m}">
                    <div class="star-avatar" title="${pm.name}">
                      <img class="star-poke-img" src="${pm.img}" alt="${pm.name}" onerror="handleRankImgError(this, '${pm.icon || '⭐'}')">
                    </div>
                    <div class="star-name">${m}</div>
                    <div class="star-cls">${pm.name} · 400分</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    // ==========================================
    // TAB 5: 📖 Top 12 錯字寶典與診斷
    // ==========================================
    function renderVocabTable() {
      const tbody = document.getElementById('vocab-tbody');
      const typos = [
        { rank: "第 1 名", char: "兔", count: "77 人次", hw: "功課3", code: "弓日戈 (NAI)", secret: "【分體字】字首「勹」取折筆【弓(N)】；字身「口」取【日(A)】，末筆撇彎鉤連點取【戈(I)】。切勿誤取「竹」或「口」！" },
        { rank: "第 2 名", char: "術", count: "60 人次", hw: "功課4", code: "竹人戈木 (HOID)", secret: "【行部包圍】字首左側「彳」取【竹人(HO)】；字身右側「术」取【戈木(ID)】。六年級是倉頡全碼，切勿按速成只取首尾！" },
        { rank: "第 3 名", char: "卵", count: "55 人次", hw: "功課3", code: "竹竹尸中戈 (HHSLI)", secret: "【分體字】左側首筆取撇【竹(H)】；右側撇取【竹(H)】，末筆點取【戈(I)】。" },
        { rank: "第 4 名", char: "錄", count: "54 人次", hw: "功課2", code: "金女弓水 (CVNE)", secret: "【左右分體】字首【金(C)】；字身「录」上部彑取【女弓(NV)】，下部氺取【水(E)】。" },
        { rank: "第 5 名", char: "卑", count: "54 人次", hw: "功課3", code: "竹竹十 (HHJ)", secret: "【上下分體】頂端撇筆取【竹(H)】；中間框筆取【竹(H)】，底端懸針十字取【十(J)】。" },
        { rank: "第 6 名", char: "歷", count: "54 人次", hw: "功課4", code: "一木卜中一 (MDYLM)", secret: "【半包圍全碼】外廓「厂」取【一(M)】；字身取禾【木(D)】＋止部【卜中一(YLM)】。標準全碼：一木卜中一 (MDYLM)。速成碼：一一 (MM)！" },
        { rank: "第 7 名", char: "究", count: "50 人次", hw: "功課3", code: "十金大弓 (JCKN)", secret: "【上下分體】字首穴部取寶蓋與八【十金(JC)】；字身九部取首筆【大(K)】與末筆彎折【弓(N)】。速成碼：十弓 (JN)！" },
        { rank: "第 8 名", char: "亞", count: "49 人次", hw: "功課4", code: "一中廿 (MLT)", secret: "【連體字】首筆頂橫【一(M)】；貫穿雙豎取【中(L)】；底端封口橫折取【廿(T)】。" },
        { rank: "第 9 名", char: "鬼", count: "46 人次", hw: "功課3", code: "竹戈竹山 (HIHU)", secret: "【連體字】頂端撇點取【竹戈(HI)】；字身下部兒與厶取【竹山(HU)】。" },
        { rank: "第 10 名", char: "演", count: "44 人次", hw: "功課1", code: "水十一金 (EJMC)", secret: "【左右分體】三點水取【水(E)】；字身「寅」取首碼寶蓋【十(J)】、次碼一橫【一(M)】與尾碼底筆【金(C)】。" },
        { rank: "第 11 名", char: "郵", count: "44 人次", hw: "功課4", code: "竹一弓中 (HMNL)", secret: "【左右分體】字首左側「垂」取首撇【竹(H)】與末橫【一(M)】；字身右側耳旁「阝」取【弓中(NL)】。速成碼：竹中 (HL)！" },
        { rank: "第 12 名", char: "潑", count: "43 人次", hw: "功課2", code: "水弓人水 (ENOE)", secret: "【左右分體】三點水取【水(E)】；字身「發」取登字頭【弓(N)】、撇點【戈(I)】及末筆又【水(E)】。" }
      ];

      tbody.innerHTML = typos.map(t => `
        <tr>
          <td style="font-weight: 800; text-align: center; color: #1E3A8A;">${t.rank}</td>
          <td style="font-size: 20px; font-weight: 900; text-align: center; color: #EF4444;">${t.char}</td>
          <td style="text-align: center; font-weight: 700; color: #D97706;">${t.count}</td>
          <td style="text-align: center; color: #64748B;">${t.hw}</td>
          <td style="font-weight: 800; color: #2563EB;">${t.code}</td>
          <td style="font-size: 13px; color: #334155; line-height: 1.4;">${t.secret}</td>
        </tr>
      `).join('');
    }

    // ==========================================
    // 搜尋與 Kiosk 輪播
    // ==========================================
    function handleSearch(keyword) {
      const q = keyword.trim().toLowerCase();
      document.querySelectorAll('.rank-card, .star-card').forEach(card => {
        const info = card.getAttribute('data-student') || '';
        if (!q) {
          card.classList.remove('highlight');
          card.style.display = '';
        } else if (info.toLowerCase().includes(q)) {
          card.classList.add('highlight');
          card.style.display = '';
        } else {
          card.classList.remove('highlight');
          card.style.display = 'none';
        }
      });
    }

    function toggleKioskMode() {
      const btn = document.getElementById('kiosk-btn');
      if (isKiosk) {
        clearInterval(kioskInterval);
        isKiosk = false;
        btn.textContent = '🖥️ 投影輪播';
        btn.style.background = 'white';
        btn.style.color = '#2563EB';
      } else {
        isKiosk = true;
        btn.textContent = '⏸️ 停止輪播';
        btn.style.background = '#2563EB';
        btn.style.color = 'white';
        const tabs = ['top40', 'class', 'perfect'];
        let idx = 0;
        kioskInterval = setInterval(() => {
          idx = (idx + 1) % tabs.length;
          switchTab(tabs[idx]);
        }, 6000);
      }
    }

    function switchTab(tabId) {
      activeTab = tabId;
      document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        const ids = ['top40', 'class', 'perfect', 'game', 'vocab'];
        btn.classList.toggle('active', ids[idx] === tabId);
      });
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
      const activePanel = document.getElementById(`panel-${tabId}`);
      if (activePanel) activePanel.classList.add('active');

      if (tabId === 'top40') {
        try { renderTop40(); renderClassBarCharts(); } catch(e){}
      } else if (tabId === 'class') {
        try { renderClassCards(); } catch(e){}
      } else if (tabId === 'perfect') {
        try { renderPerfectScorers(); renderClassBarCharts(); } catch(e){}
      } else if (tabId === 'game') {
        if (!currentQuiz) loadRound();
      }
    }

    // ==========================================
    // 學生身份登入 (下拉式選單選擇班別與學號 1-36)
    // ==========================================
    function submitStudentLogin() {
      const cls = document.getElementById('login-class-select').value;
      const numVal = document.getElementById('login-num-select').value;
      if (!numVal) {
        alert('請從下拉選單選擇你的學號 (1 ~ 36 號)！');
        return;
      }
      const num = parseInt(numVal);
      const padNum = num < 10 ? '0' + num : num;
      currentStudent = { cls, num, name: `${cls} ${padNum}號` };
      SafeStorage.setItem('p6_last_login', JSON.stringify(currentStudent));
      
      document.getElementById('identity-section').style.display = 'none';
      document.getElementById('battle-section').style.display = 'block';
      loadStudentProfile();
      startNewSession();
    }

    function switchIdentity() {
      currentStudent = null;
      activeSkills = [];
      SafeStorage.removeItem('p6_last_login');
      document.getElementById('battle-section').style.display = 'none';
      document.getElementById('identity-section').style.display = 'block';
    }

    function loadStudentProfile() {
      if (!currentStudent) return;
      const stats = getStudentStats(currentStudent.cls, currentStudent.num);
      const { currentTier, unlockedSkills } = evalTierAndSkills(stats.totalScore);
      activeSkills = unlockedSkills || [];

      document.getElementById('trainer-display-name').textContent = currentStudent.name;
      document.getElementById('trainer-display-title').textContent = currentTier.title;
      document.getElementById('trainer-current-badge').textContent = currentTier.badge;
      document.getElementById('trainer-display-kills').textContent = stats.kills;
      document.getElementById('trainer-display-score').textContent = stats.totalScore.toLocaleString();
    }

    // ==========================================
    // 🎮 GAME ENGINE: 方案 B【教學難點攻堅方案】
    // ==========================================
    
    // ==========================================
    // 🎲 Fisher-Yates 標準隨機洗牌演算法
    // ==========================================
    function setGameMode(mode) {
      if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }
      if (speedTimerInterval) clearInterval(speedTimerInterval);
      if (speedHintTimer) clearTimeout(speedHintTimer);
      window.removeEventListener('keydown', handleSpeedKeydown, true);

      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }

      currentQuiz = null;
      currentGameMode = mode;

      document.querySelectorAll('.mode-tab-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById(`mode-tab-${mode}`);
      if (activeBtn) activeBtn.classList.add('active');

      const speedSection = document.getElementById('speed-arena-section');
      const wildArena = document.getElementById('capture-arena');
      const targetWord = document.getElementById('target-char');
      const monsterIcon = document.getElementById('monster-icon');
      const targetSubHint = document.getElementById('target-sub-hint');
      const standardSlots = document.getElementById('standard-slots-row');
      const splitSlots = document.getElementById('split-slots-row');
      const secretBox = document.getElementById('secret-box');

      if (mode === 'speed') {
        // ⚡ 進入模式 2：展示備戰大廳，不直接開始計時
        if (speedSection) speedSection.style.display = 'block';
        if (wildArena) wildArena.style.display = 'none';
        if (targetWord) targetWord.style.display = 'none';
        if (monsterIcon) monsterIcon.style.display = 'none';
        if (targetSubHint) targetSubHint.style.display = 'none';
        if (standardSlots) standardSlots.style.display = 'none';
        if (splitSlots) splitSlots.style.display = 'none';
        if (secretBox) secretBox.style.display = 'none';

        document.getElementById('game-prompt').style.display = 'none';
        initSpeedWeekDropdown();
        returnToSpeedReadyStage();

        window.addEventListener('keydown', handleSpeedKeydown, true);
      } else {
        // 模式 1 或 模式 3
        if (speedSection) speedSection.style.display = 'none';
        if (wildArena) wildArena.style.display = 'block';
        if (targetWord) targetWord.style.display = 'block';
        if (monsterIcon) monsterIcon.style.display = 'block';
        if (targetSubHint) targetSubHint.style.display = 'block';
        if (standardSlots) standardSlots.style.display = 'flex';
        if (splitSlots) splitSlots.style.display = 'none';
        document.getElementById('game-prompt').style.display = 'block';

        modeQuizQueues[mode] = [];
        startNewSession();
      }
    }

    
    // ==========================================
    // 🔔 速度與通行提示框 (showPassToast)
    // ==========================================
    function setArenaSpeed(speed, activeBtnId) {
      wanderingSpeedMultiplier = speed;
      document.querySelectorAll('.arena-speed-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById(activeBtnId);
      if (activeBtn) activeBtn.classList.add('active');

      let tip = '';
      if (speed > 1.2) {
        tip = '⚡ 切換為【敏捷速度】：精靈球高速遊行，答對享有 1.4x (+40%) 速度積分加成！';
      } else if (speed === 0) {
        tip = '⏸️ 切換為【定點輔助】：精靈球靜止不動，簡易模式得分為 0.6x 折減。';
      } else {
        tip = '🟢 切換為【悠閒模式】：標準遊行速度，答對獲取 1.0x 標準分數。';
      }
      showPassToast(tip);
    }

    function startNewSession() {
      if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }
      gameStage = 1;
      sessionScore = 0;
      sessionCorrectCount = 0;
      comboCount = 0;
      modeQuizQueues[currentGameMode] = [];
      currentQuiz = null;

      document.getElementById('session-summary-box').style.display = 'none';
      document.getElementById('active-play-area').style.display = 'block';
      loadRound();
    }

    function loadRound() {
      if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }

      selectedCodes = [];
      selectedPrefix = [];
      selectedBody = [];
      roundMistakeCount = 0;
      roundShieldActive = false;

      document.getElementById('secret-box').style.display = 'none';
      document.getElementById('game-stage-tag').textContent = `關卡 ${gameStage} / 5`;
      document.getElementById('game-combo-tag').textContent = `連擊：${comboCount} Hit 🔥`;
      document.getElementById('game-score-tag').textContent = `本輪得分：${sessionScore} 分`;

      const stdRow = document.getElementById('standard-slots-row');
      const splitRow = document.getElementById('split-slots-row');

      if (currentGameMode === 'connected') {
        // 模式 1：連體字全碼突破戰
        stdRow.style.display = 'flex';
        splitRow.style.display = 'none';
        document.getElementById('monster-icon').textContent = '⚔️';

        if (!currentQuiz) {
          currentQuiz = getNextQuiz('connected');
        }

        document.getElementById('target-char').textContent = currentQuiz.char;
        document.getElementById('target-sub-hint').textContent = `【連體字全碼取碼】 取碼長度：${currentQuiz.codes.length} 碼 ｜ 依筆順連擊突破！`;
        document.getElementById('game-prompt').textContent = `請依筆順依序捕捉【 ${currentQuiz.char} 】的完整 ${currentQuiz.codes.length} 碼倉頡字根！`;
        document.getElementById('game-prompt').style.color = '#1E3A8A';

        for (let i = 1; i <= 4; i++) {
          const slot = document.getElementById(`slot-${i}`);
          const val = document.getElementById(`val-${i}`);
          const label = document.getElementById(`label-slot-${i}`);
          if (i <= currentQuiz.codes.length) {
            slot.style.display = 'flex';
            slot.className = 'code-slot';
            val.textContent = '？';
            const labels = ['① 首碼', '② 次碼', '③ 三碼', '④ 尾碼'];
            label.textContent = labels[i - 1];
          } else {
            slot.style.display = 'none';
          }
        }

        let options = [];
        currentQuiz.codes.forEach((c, idx) => {
          options.push({ code: c, isCorrect: true, stepIdx: idx, orbId: `corr-${idx}` });
        });

        const distractors = DATA.cangjie_clean_letters
          .filter(l => !currentQuiz.codes.includes(l.code))
          .sort(() => 0.5 - Math.random());

        let distCount = 0;
        while (options.length < 8 && distractors.length > 0) {
          const item = distractors.pop();
          distCount++;
          options.push({ code: item.code, isCorrect: false, orbId: `dist-${distCount}` });
        }
        options = fisherYatesShuffle(options);
        setupWanderingOrbs(options);

      } else if (currentGameMode === 'split') {
        // 模式 2：分體字結構挑戰戰
        stdRow.style.display = 'none';
        splitRow.style.display = 'flex';
        document.getElementById('monster-icon').textContent = '🧩';

        if (!currentQuiz) {
          currentQuiz = getNextQuiz('split');
        }

        document.getElementById('target-char').textContent = currentQuiz.char;
        document.getElementById('target-sub-hint').textContent = `【分體字取碼：字首最多2碼取首尾，字身最多3碼取首二尾】 總碼長度：${currentQuiz.prefix_codes.length + currentQuiz.body_codes.length} 碼！`;
        document.getElementById('game-prompt').textContent = `先捕捉【字首區】(${currentQuiz.prefix_codes.length}碼)，再捕捉【字身區】(${currentQuiz.body_codes.length}碼)！`;
        document.getElementById('game-prompt').style.color = '#7C3AED';

        const pre1 = document.getElementById('slot-pre-1');
        const pre2 = document.getElementById('slot-pre-2');
        pre1.className = 'code-slot'; document.getElementById('val-pre-1').textContent = '？';
        if (currentQuiz.prefix_codes.length > 1) {
          pre2.style.display = 'flex';
          pre2.className = 'code-slot';
          document.getElementById('val-pre-2').textContent = '？';
          document.getElementById('label-pre-1').textContent = '字首首碼';
          document.getElementById('label-pre-2').textContent = '字首尾碼';
        } else {
          pre2.style.display = 'none';
          document.getElementById('label-pre-1').textContent = '字首碼';
        }

        for (let i = 1; i <= 3; i++) {
          const bSlot = document.getElementById(`slot-body-${i}`);
          const bVal = document.getElementById(`val-body-${i}`);
          const bLabel = document.getElementById(`label-body-${i}`);
          if (i <= currentQuiz.body_codes.length) {
            bSlot.style.display = 'flex';
            bSlot.className = 'code-slot';
            bVal.textContent = '？';
            if (currentQuiz.body_codes.length === 1) {
              if (bLabel) bLabel.textContent = '字身碼';
            } else if (currentQuiz.body_codes.length === 2) {
              if (bLabel) bLabel.textContent = i === 1 ? '字身首碼' : '字身尾碼';
            } else if (currentQuiz.body_codes.length === 3) {
              if (bLabel) bLabel.textContent = i === 1 ? '字身首碼' : (i === 2 ? '字身次碼' : '字身尾碼');
            }
          } else {
            bSlot.style.display = 'none';
          }
        }

        let options = [];
        currentQuiz.prefix_codes.forEach((c, idx) => {
          options.push({ code: c, part: 'prefix', partIdx: idx, isCorrect: true, orbId: `pre-${idx}` });
        });
        currentQuiz.body_codes.forEach((c, idx) => {
          options.push({ code: c, part: 'body', partIdx: idx, isCorrect: true, orbId: `body-${idx}` });
        });

        const allTargetCodes = [...currentQuiz.prefix_codes, ...currentQuiz.body_codes];
        const distractors = DATA.cangjie_clean_letters
          .filter(l => !allTargetCodes.includes(l.code))
          .sort(() => 0.5 - Math.random());

        let distCount = 0;
        while (options.length < 8 && distractors.length > 0) {
          const item = distractors.pop();
          distCount++;
          options.push({ code: item.code, isCorrect: false, orbId: `dist-${distCount}` });
        }
        options = fisherYatesShuffle(options);
        setupWanderingOrbs(options);

      } else if (currentGameMode === 'special') {
        // 模式 3：難字與複合字特訓
        stdRow.style.display = 'flex';
        splitRow.style.display = 'none';
        document.getElementById('monster-icon').textContent = '🔮';

        if (!currentQuiz) {
          currentQuiz = getNextQuiz('special');
        }

        document.getElementById('target-char').textContent = currentQuiz.char;
        document.getElementById('target-sub-hint').textContent = `【${currentQuiz.type}】 特殊取碼規則特訓！`;
        document.getElementById('game-prompt').textContent = `捕捉【 ${currentQuiz.char} 】的特殊字根球（注意難字 X 鍵或複合字碼）！`;
        document.getElementById('game-prompt').style.color = '#059669';

        for (let i = 1; i <= 4; i++) {
          const slot = document.getElementById(`slot-${i}`);
          const val = document.getElementById(`val-${i}`);
          const label = document.getElementById(`label-slot-${i}`);
          if (i <= currentQuiz.codes.length) {
            slot.style.display = 'flex';
            slot.className = 'code-slot';
            val.textContent = '？';
            const labels = ['① 首碼', '② 次碼', '③ 尾碼', '④ 末碼'];
            label.textContent = labels[i - 1];
          } else {
            slot.style.display = 'none';
          }
        }

        let options = [];
        currentQuiz.codes.forEach((c, idx) => {
          options.push({ code: c, isCorrect: true, stepIdx: idx, orbId: `spec-${idx}` });
        });

        const distractors = DATA.cangjie_clean_letters
          .filter(l => !currentQuiz.codes.includes(l.code))
          .sort(() => 0.5 - Math.random());

        let distCount = 0;
        while (options.length < 8 && distractors.length > 0) {
          const item = distractors.pop();
          distCount++;
          options.push({ code: item.code, isCorrect: false, orbId: `dist-${distCount}` });
        }
        options = fisherYatesShuffle(options);
        setupWanderingOrbs(options);
      }

      // 戰鬥隨機技能觸發：精準直覺
      const focusSkill = activeSkills.find(s => s.name.includes('精準直覺'));
      if (focusSkill && Math.random() < focusSkill.rate) {
        activeOrbs.forEach(orb => {
          if (orb.isCorrect) orb.el.classList.add('highlight-focus');
        });
        triggerSkillToast('⚡', '觸發【精準直覺】！感應到正確字根精靈球發出強烈能量光暈！');
      }
    }

    // 精靈球物理遊行引擎 (純粹精靈球，無提示，無灰色殘留)
    function setupWanderingOrbs(options) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      const arena = document.getElementById('capture-arena');
      const orbsContainer = document.getElementById('orbs-container');
      orbsContainer.innerHTML = '';

      const arenaW = arena.clientWidth || 600;
      const arenaH = arena.clientHeight || 250;
      const orbSize = 72;

      const padX = 14;
      const padTop = 44;
      const padBottom = 14;
      const minX = padX;
      const maxX = Math.max(minX + 10, arenaW - orbSize - padX);
      const minY = padTop;
      const maxY = Math.max(minY + 10, arenaH - orbSize - padBottom);

      activeOrbs = [];

      options.forEach((opt, idx) => {
        const el = document.createElement('div');
        el.className = 'poke-orb';
        el.id = `orb-${idx}`;

        el.innerHTML = `
          <div class="poke-orb-center-ring"></div>
          <div class="poke-orb-content">
            <div class="poke-orb-char">${opt.code}</div>
          </div>
        `;

        const cols = 4;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cellW = (maxX - minX) / cols;
        const cellH = (maxY - minY) / 2;
        const initX = minX + col * cellW + Math.random() * (cellW * 0.35);
        const initY = minY + row * cellH + Math.random() * (cellH * 0.35);

        const angle = Math.random() * Math.PI * 2;
        const baseSpeed = 0.85 + Math.random() * 0.4;
        const vx = Math.cos(angle) * baseSpeed;
        const vy = Math.sin(angle) * baseSpeed;

        const orbObj = {
          el: el,
          ...opt,
          x: Math.max(minX, Math.min(maxX, initX)),
          y: Math.max(minY, Math.min(maxY, initY)),
          vx: vx,
          vy: vy,
          isHovered: false
        };

        el.addEventListener('mouseenter', () => { orbObj.isHovered = true; });
        el.addEventListener('mouseleave', () => { orbObj.isHovered = false; });
        el.addEventListener('click', () => { catchOrb(orbObj); });

        orbsContainer.appendChild(el);
        activeOrbs.push(orbObj);
      });

      runWanderingPhysics();
    }

    function runWanderingPhysics() {
      const arena = document.getElementById('capture-arena');
      const arenaW = arena.clientWidth || 600;
      const arenaH = arena.clientHeight || 250;
      const orbSize = 72;

      const padX = 14;
      const padTop = 44;
      const padBottom = 14;
      const minX = padX;
      const maxX = Math.max(minX + 10, arenaW - orbSize - padX);
      const minY = padTop;
      const maxY = Math.max(minY + 10, arenaH - orbSize - padBottom);

      activeOrbs.forEach(o => {
        if (!o.isHovered && wanderingSpeedMultiplier > 0) {
          o.x += o.vx * wanderingSpeedMultiplier;
          o.y += o.vy * wanderingSpeedMultiplier;

          if (o.x <= minX) { o.x = minX; o.vx = Math.abs(o.vx); }
          else if (o.x >= maxX) { o.x = maxX; o.vx = -Math.abs(o.vx); }

          if (o.y <= minY) { o.y = minY; o.vy = Math.abs(o.vy); }
          else if (o.y >= maxY) { o.y = maxY; o.vy = -Math.abs(o.vy); }
        }
        o.el.style.transform = `translate3d(${o.x}px, ${o.y}px, 0)`;
      });

      animationFrameId = requestAnimationFrame(runWanderingPhysics);
    }

    // ==========================================
    // 點選捕捉判定 (修復：錯誤時不消失、連續5次失誤提示)
    // ==========================================
    function catchOrb(orbObj) {
      let currentNeededCode = '';

      if (currentGameMode === 'connected' || currentGameMode === 'special') {
        const neededIdx = selectedCodes.length;
        currentNeededCode = currentQuiz.codes[neededIdx];

        if (orbObj.code === currentNeededCode) {
          orbObj.el.classList.add('caught');
          orbObj.el.classList.remove('highlight-hint');
          selectedCodes.push(orbObj.code);
          const currentSlot = document.getElementById(`slot-${neededIdx + 1}`);
          currentSlot.className = 'code-slot filled';
          document.getElementById(`val-${neededIdx + 1}`).textContent = orbObj.code;

          if (selectedCodes.length < currentQuiz.codes.length) {
            document.getElementById('game-prompt').innerHTML = `🎯 <span style="color:#2563EB;font-weight:900;">成功捕捉第 ${neededIdx + 1} 碼【${orbObj.code}】！快捕捉下一碼！</span>`;
          } else {
            checkAnswer(true);
          }
        } else {
          triggerMistake(orbObj, `捕捉錯誤！【${orbObj.code}】不是當前所需字碼，請再試！`);
        }

      } else if (currentGameMode === 'split') {
        const preLen = currentQuiz.prefix_codes.length;
        const bodyLen = currentQuiz.body_codes.length;

        if (selectedPrefix.length < preLen) {
          currentNeededCode = currentQuiz.prefix_codes[selectedPrefix.length];
          if (orbObj.code === currentNeededCode) {
            orbObj.el.classList.add('caught');
            orbObj.el.classList.remove('highlight-hint');
            selectedPrefix.push(orbObj.code);
            const slot = document.getElementById(`slot-pre-${selectedPrefix.length}`);
            slot.className = 'code-slot filled';
            document.getElementById(`val-pre-${selectedPrefix.length}`).textContent = orbObj.code;

            if (selectedPrefix.length < preLen) {
              document.getElementById('game-prompt').innerHTML = `🔵 <span style="color:#1D4ED8;font-weight:900;">字首首碼命中！接著捕捉字首尾碼！</span>`;
            } else {
              document.getElementById('game-prompt').innerHTML = `🟣 <span style="color:#6D28D9;font-weight:900;">字首完成！接著捕捉【字身區】字碼！</span>`;
            }
          } else {
            triggerMistake(orbObj, `捕捉錯誤！這是字首區，【${orbObj.code}】不屬於字首，請再試！`);
          }

        } else if (selectedBody.length < bodyLen) {
          currentNeededCode = currentQuiz.body_codes[selectedBody.length];
          if (orbObj.code === currentNeededCode) {
            orbObj.el.classList.add('caught');
            orbObj.el.classList.remove('highlight-hint');
            selectedBody.push(orbObj.code);
            const slot = document.getElementById(`slot-body-${selectedBody.length}`);
            slot.className = 'code-slot filled';
            document.getElementById(`val-body-${selectedBody.length}`).textContent = orbObj.code;

            if (selectedBody.length < bodyLen) {
              document.getElementById('game-prompt').innerHTML = `🟣 <span style="color:#6D28D9;font-weight:900;">字身命中 (${selectedBody.length}/${bodyLen})，快找出下一碼！</span>`;
            } else {
              checkAnswer(true);
            }
          } else {
            triggerMistake(orbObj, `捕捉錯誤！【${orbObj.code}】不是當前字身所需碼，請再試！`);
          }
        }
      }
    }

    
    // 🎈 浮動扣分與罰時標籤動畫生成器
    function triggerFloatingNotice(targetEl, text) {
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const tag = document.createElement('div');
      tag.className = 'floating-deduct-tag';
      tag.textContent = text;
      tag.style.left = (rect.left + rect.width / 2) + 'px';
      tag.style.top = rect.top + 'px';
      document.body.appendChild(tag);
      setTimeout(() => tag.remove(), 850);
    }

    function triggerMistake(orbObj, alertMsg) {
      roundMistakeCount++;

      // 錯誤搖晃動效，不隱藏球體
      orbObj.el.classList.add('mistake-shake');
      setTimeout(() => {
        orbObj.el.classList.remove('mistake-shake');
      }, 500);

      const shieldSkill = activeSkills.find(s => s.name.includes('聖盾防護'));
      if (!roundShieldActive && shieldSkill && Math.random() < shieldSkill.rate) {
        roundShieldActive = true;
        triggerSkillToast('🛡️', '觸發【聖盾防護】！成功格擋失誤，保留連擊！');
        document.getElementById('game-prompt').innerHTML = `🛡️ <span style="color:#2563EB;font-weight:900;">聖盾格擋成功！失誤已免除，連擊保留，請再試！</span>`;
      } else {
        comboCount = 0;
        document.getElementById('game-combo-tag').textContent = `連擊：0 Hit 🔥`;
        
        // 🎯 依使用者需求：按錯選項按比例扣減得分 (-2 分)
        const deductPts = 2;
        sessionScore = Math.max(0, sessionScore - deductPts);
        document.getElementById('game-score-tag').textContent = `本輪得分：${sessionScore} 分 (-${deductPts})`;
        
        // 浮動扣分紅字提示
        if (typeof triggerFloatingNotice === 'function' && orbObj && orbObj.el) {
          triggerFloatingNotice(orbObj.el, `-${deductPts} 分 ⚠️`);
        }
        
        document.getElementById('game-prompt').innerHTML = `⚠️ <span style="color:#DC2626;font-weight:900;">${alertMsg} (扣減 ${deductPts} 分)</span>`;
      }

      // ★ 連續選錯超過 5 次：給予強烈提示與答案展開
      if (roundMistakeCount >= 5) {
        let needed = '';
        if (currentGameMode === 'connected' || currentGameMode === 'special') {
          needed = currentQuiz.codes[selectedCodes.length];
        } else if (currentGameMode === 'split') {
          if (selectedPrefix.length < currentQuiz.prefix_codes.length) {
            needed = currentQuiz.prefix_codes[selectedPrefix.length];
          } else {
            needed = currentQuiz.body_codes[selectedBody.length];
          }
        }

        // 原野中將該正確字碼球高亮金光環繞
        activeOrbs.forEach(o => {
          if (o.code === needed && !o.el.classList.contains('caught')) {
            o.el.classList.add('highlight-hint');
          }
        });

        document.getElementById('game-prompt').innerHTML = `💡 <span style="color:#D97706;font-weight:900;">【提示模式已啟動（已失誤 ${roundMistakeCount} 次）】：目標字根為金光閃爍的【${needed}】球！</span>`;
        
        // 展開拆碼解析秘笈供學生學習
        document.getElementById('secret-box').style.display = 'block';
        document.getElementById('secret-char-badge').textContent = `標準倉頡全碼：${currentQuiz.full}`;
        document.getElementById('secret-desc').textContent = currentQuiz.secret;

        triggerSkillToast('💡', `連續失誤 5 次！雷達已為你感應並鎖定目標字根【${needed}】！`);
      }
    }

    // 通關結算
    function checkAnswer(isCorrect) {
      if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }

      const secretBox = document.getElementById('secret-box');
      secretBox.style.display = 'block';

      let baseScore = 15;
      if (currentGameMode === 'special') baseScore = 10;
      
      // 🎯 依失誤次數按比例扣減結算基礎分 (每次失誤扣 2 分，模式1保底3分，模式3保底2分)
      const minBase = (currentGameMode === 'special') ? 2 : 3;
      const penalty = Math.min(baseScore - minBase, roundMistakeCount * 2);
      baseScore = Math.max(minBase, baseScore - penalty);

      document.getElementById('secret-char-badge').textContent = `標準倉頡全碼：${currentQuiz.full}`;
      document.getElementById('secret-desc').textContent = currentQuiz.secret;

      if (isCorrect) {
        comboCount++;
        sessionCorrectCount++;

        // 🎯 游行速度不同選擇對得分的影響 (定點最容易得分最低，敏捷最高)
        let speedMultiplier = 1.0;
        let speedNotice = '';
        if (wanderingSpeedMultiplier > 1.2) {
          speedMultiplier = 1.4; // 敏捷模式獎勵 +40%
          speedNotice = '⚡敏捷1.4x';
        } else if (wanderingSpeedMultiplier === 0) {
          speedMultiplier = 0.6; // 定點簡易模式扣減至 60%
          speedNotice = '⏸️定點0.6x';
        } else {
          speedMultiplier = 1.0; // 悠閒標準模式 100%
          speedNotice = '🟢悠閒1.0x';
        }

        let roundEarned = Math.max(1, Math.round(baseScore * speedMultiplier));

        let comboBonus = 0;
        if (comboCount === 2) comboBonus = 2;
        else if (comboCount === 3) comboBonus = 4;
        else if (comboCount === 4) comboBonus = 6;
        else if (comboCount >= 5) comboBonus = 10;

        roundEarned += comboBonus;

        let skillBonus = 0;
        const critSkill = activeSkills.find(s => s.name.includes('烈焰爆擊'));
        if (critSkill && Math.random() < critSkill.rate) {
          skillBonus += 5;
          triggerSkillToast('💥', '觸發【烈焰爆擊】！傷害提升，額外獲得 +5 分！');
        }

        const divineSkill = activeSkills.find(s => s.name.includes('神域天罰'));
        if (divineSkill && Math.random() < divineSkill.rate) {
          skillBonus += 10;
          triggerSkillToast('🌌', '觸發【神域天罰】！天雷降臨，額外獲得 +10 分！');
        }

        const chainSkill = activeSkills.find(s => s.name.includes('極限連擊'));
        if (chainSkill && comboCount >= 2 && Math.random() < chainSkill.rate) {
          skillBonus += 3;
          triggerSkillToast('🌊', '觸發【極限連擊】！連擊增益額外獲得 +3 分！');
        }

        roundEarned += skillBonus;
        sessionScore += roundEarned;

        document.getElementById('game-score-tag').textContent = `本輪得分：${sessionScore} 分 (+${roundEarned} ${speedNotice})`;
        document.getElementById('game-combo-tag').textContent = `連擊：${comboCount} Hit 🔥`;
        document.getElementById('monster-icon').textContent = '💥';

        if (currentStudent) {
          saveStudentStats(currentStudent.cls, currentStudent.num, roundEarned, true, currentGameMode);
          loadStudentProfile();
        }

        burstConfetti();

        let modeName = currentGameMode === 'connected' ? '連體字突破' : currentGameMode === 'split' ? '分體字挑戰' : '難字特訓';
        let clearMsg = `🎉 <span style="color:#15803D;font-weight:900;">完美通關！全碼擊破【${currentQuiz.char}】！(+${roundEarned}分)</span>`;

        if (gameStage < 5) {
          document.getElementById('game-prompt').innerHTML = `${clearMsg} <span style="color:#2563EB;font-weight:800;margin-left:8px;">➔ 即將自動進入第 ${gameStage + 1} 關...</span>`;
          triggerStagePassToast(modeName, gameStage, roundEarned, gameStage + 1);
          autoNextTimer = setTimeout(() => nextRound(), 1400);
        } else {
          document.getElementById('game-prompt').innerHTML = `🏆 <span style="color:#D97706;font-weight:900;">太強了！5 關挑戰全數通關！(+${roundEarned}分) ➔ 正在進行總結算...</span>`;
          triggerStagePassToast(modeName, 5, roundEarned, null);
          autoNextTimer = setTimeout(() => nextRound(), 1400);
        }
      }
    }

    function nextRound() {
      currentQuiz = null;
      if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }

      if (gameStage >= 5) {
        document.getElementById('active-play-area').style.display = 'none';
        const summaryBox = document.getElementById('session-summary-box');
        summaryBox.style.display = 'block';

        let clearBonus = 0;
        if (sessionCorrectCount === 5) {
          clearBonus = 20;
          sessionScore += clearBonus;
          if (currentStudent) {
            saveStudentStats(currentStudent.cls, currentStudent.num, clearBonus, false, currentGameMode);
            loadStudentProfile();
          }
          document.getElementById('summary-congrats-text').innerHTML = `🌟 <strong>大滿貫！5 關全中！</strong> 額外獎勵 <strong>+${clearBonus}</strong> 點通關積分！`;
        } else {
          document.getElementById('summary-congrats-text').textContent = `本輪挑戰完成！答對 ${sessionCorrectCount} 關，繼續挑戰突破極限！`;
        }

        const stats = currentStudent ? getStudentStats(currentStudent.cls, currentStudent.num) : { totalScore: sessionScore };
        const { currentTier } = evalTierAndSkills(stats.totalScore);

        document.getElementById('summary-correct-stat').textContent = `${sessionCorrectCount} / 5 關`;
        document.getElementById('summary-earned-stat').textContent = `+${sessionScore} 分`;
        document.getElementById('summary-total-stat').textContent = `${stats.totalScore.toLocaleString()} 分`;
        document.getElementById('summary-title-stat').textContent = currentTier.title;

        burstConfetti();
      } else {
        gameStage++;
        loadRound();
      }
    }

    // Leaderboard Modal
    let currentLeaderboardFilter = 'ALL';
    function openLeaderboardModal(defaultType) {
      if (defaultType === 'speed') {
        switchLeaderboardType('speed');
      } else {
        switchLeaderboardType('score');
      }
      openModal('modal-leaderboard');
    }

    function filterLeaderboard(cls) {
      currentLeaderboardFilter = cls;
      document.querySelectorAll('.lb-filter-btn').forEach(b => {
        b.classList.toggle('active', b.textContent.includes(cls) || (cls === 'ALL' && b.textContent === '全級總榜'));
      });
      renderLeaderboardTable();
    }

    
    // =========================================================================
    // 🌐 全級跨電腦即時天梯連動引擎 (Cloud Real-Time Sync)
    // =========================================================================
    let isFetchingCloudLeaderboard = false;
    let lastCloudSyncTime = null;

    function updateSyncStatus(msg, isError = false) {
      try {
        const dot = document.getElementById('lb-cloud-dot');
        const text = document.getElementById('lb-cloud-status');
        if (text) text.textContent = msg;
        if (dot) dot.style.background = isError ? '#EF4444' : '#10B981';
      } catch(e) {}
    }

    async function fetchCloudLeaderboard(silent = false) {
      if (isFetchingCloudLeaderboard) return;
      const url = (typeof CONFIG !== 'undefined' && CONFIG.GAS_WEBHOOK_URL) ? CONFIG.GAS_WEBHOOK_URL : '';
      if (!url || url.includes('YourDeploymentIdHere')) {
        if (!silent) updateSyncStatus('⚠️ 尚未部署 Google Webhook 網址 (目前為離線示範模式)', true);
        return;
      }

      try {
        isFetchingCloudLeaderboard = true;
        if (!silent) updateSyncStatus('⏳ 正在同步 Google 雲端試算表最新題庫與榮譽榜...');

        // 🛡️ 方案 A 錯峰防護：隨機等待 0~600ms (打散電腦室全班併發請求)
        await new Promise(r => setTimeout(r, Math.random() * 600));

        // 🚀 方案 A：向 GAS 請求完整動態題庫與天梯戰況 (支援 CacheService 記憶體秒級回傳)
        const queryUrl = url + (url.includes('?') ? '&' : '?') + 'action=get_data&t=' + Date.now();
        const res = await fetch(queryUrl, { method: 'GET' });
        if (!res.ok) throw new Error('伺服器連線狀態碼: ' + res.status);

        const data = await res.json();
        if (data && data.status === 'success') {
          // 1. 動態更新名冊與天梯榜單
          if (Array.isArray(data.combatLeaderboard) && data.combatLeaderboard.length > 0) {
            DATA.benchmark_leaderboard = data.combatLeaderboard.map(item => {
              const pts = (typeof item.grandTotal === 'number') ? item.grandTotal : 
                          ((typeof item.score === 'number') ? item.score : (parseInt(item.totalScore, 10) || 0));
              const badge = item.badge || item.title || '🥉【新手訓練家】';
              return {
                ...item,
                score: pts,
                grandTotal: pts,
                title: badge,
                badge: badge,
                kills: (typeof item.kills === 'number') ? item.kills : 0
              };
            });
          }
          if (data.speedLeaderboard || data.speedByWeek) {
            DATA.cloud_speed_records = data.speedLeaderboard || data.speedByWeek;
          }
          if (Array.isArray(data.top40) && data.top40.length > 0) {
            DATA.top40 = data.top40;
          }
          if (data.class_top10) DATA.class_top10 = data.class_top10;
          if (data.perfect_students) DATA.perfect_students = data.perfect_students;

          // 2. 🛡️ 方案 A 核心：動態由雲端載入本週及全部正式題庫 (GitHub 完全不公開)
          if (data.weeklyBanks && typeof data.weeklyBanks === 'object' && Object.keys(data.weeklyBanks).length > 0) {
            window.MODE2_WEEKLY_BANKS = data.weeklyBanks;
            // 自動校準鍵位
            Object.values(window.MODE2_WEEKLY_BANKS).forEach(b => {
              if (b && Array.isArray(b.words)) {
                b.words.forEach(w => {
                  if (typeof autoDeriveWordKeys === 'function') autoDeriveWordKeys(w);
                });
              }
            });
          }
          if (Array.isArray(data.cangjieWords) && data.cangjieWords.length > 0) {
            DATA.cangjie_words = data.cangjieWords;
          }
          if (Array.isArray(data.connectedWords) && data.connectedWords.length > 0) {
            DATA.connected_words = data.connectedWords;
          }
          if (Array.isArray(data.splitWords) && data.splitWords.length > 0) {
            DATA.split_words = data.splitWords;
          }
          if (Array.isArray(data.specialWords) && data.specialWords.length > 0) {
            DATA.special_words = data.specialWords;
          }

          // 3. 刷新頁面天梯排行榜渲染
          renderLeaderboardTable();
          renderSpeedLeaderboardTable();

          // 4. 更新頂部數據統計條
          if (data.stats) {
            const pCountEl = document.querySelector('.stat-pill:nth-child(1)');
            if (pCountEl && data.stats.perfectCount !== undefined) {
              pCountEl.innerHTML = `🎉 滿分訓練家：<strong>${data.stats.perfectCount} 位同學獲得 400 分！</strong>`;
            }
            const avgEl = document.querySelector('.stat-pill:nth-child(2)');
            if (avgEl && data.stats.avgScore !== undefined) {
              avgEl.innerHTML = `⭐ 全級平均分：<strong>${data.stats.avgScore} 分</strong>`;
            }
            const speedKingEl = document.querySelector('.stat-pill:nth-child(3)');
            if (speedKingEl && data.stats.speedKing) {
              speedKingEl.innerHTML = `⚡ 速度神捕：<strong>${data.stats.speedKing}</strong>`;
            }
          }

          lastCloudSyncTime = new Date();
          const timeStr = lastCloudSyncTime.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          updateSyncStatus(`✅ 雲端題庫與天梯戰況已同步 (${timeStr})`);
          showPassToast('⚡ 雲端試算表最新題庫與榮譽榜已即時同步！');
        }
      } catch (err) {
        console.warn('雲端載入提醒 (自動維持本機安全離線模式):', err);
        if (!silent) updateSyncStatus('⚠️ 雲端連線失敗，已自動啟用本機離線模式');
      } finally {
        isFetchingCloudLeaderboard = false;
      }
    }

    function renderLeaderboardTable() {
      if (currentLeaderboardType === 'speed') {
        renderSpeedLeaderboardTable();
        return;
      }

      // 恢復討伐累積總分榜表頭 (7欄)
      const thead = document.querySelector('#modal-leaderboard thead tr');
      if (thead) {
        thead.innerHTML = `
          <th>排名</th>
          <th>班別</th>
          <th>學號</th>
          <th>訓練家代號</th>
          <th>勳章稱號</th>
          <th>討伐總分</th>
          <th>擊倒魔王</th>
        `;
      }

      const scoreLabel = document.getElementById('lb-my-score-label');
      const rankLabel = document.getElementById('lb-my-rank-label');
      if (scoreLabel) scoreLabel.textContent = '累計討伐總分';
      if (rankLabel) rankLabel.textContent = (currentLeaderboardFilter === 'ALL') ? '全級討伐排名' : '班內討伐排名';

      // 1. 雙軌智能合併：整合 Google 試算表最新真實數據與本地 localStorage
      const allMap = {};

      if (DATA.benchmark_leaderboard && Array.isArray(DATA.benchmark_leaderboard)) {
        DATA.benchmark_leaderboard.forEach(item => {
          const rawScore = (typeof item.grandTotal === 'number') ? item.grandTotal : 
                           ((typeof item.score === 'number') ? item.score : (parseInt(item.totalScore, 10) || 0));
          const rawTitle = item.badge || item.title || '🥉【新手訓練家】';
          const rawKills = (typeof item.kills === 'number') ? item.kills : 0;
          allMap[`${item.cls}_${item.num}`] = {
            cls: item.cls,
            num: item.num,
            name: `${item.cls} ${(item.num < 10 ? '0' : '') + item.num}號`,
            score: rawScore,
            grandTotal: rawScore,
            kills: rawKills,
            title: rawTitle,
            badge: rawTitle
          };
        });
      }

      const allKeys = SafeStorage.getAllKeys ? SafeStorage.getAllKeys() : [];
      allKeys.forEach(key => {
        if (key.startsWith('p6_score_')) {
          const parts = key.replace('p6_score_', '').split('_');
          const cls = parts[0];
          const num = parseInt(parts[1], 10);
          try {
            const parsed = JSON.parse(SafeStorage.getItem(key));
            if (parsed && typeof parsed.totalScore === 'number' && parsed.totalScore > 0) {
              const mapKey = `${cls}_${num}`;
              const cur = allMap[mapKey];
              const localScore = parsed.totalScore;
              const localKills = parsed.kills || 0;
              const { currentTier } = evalTierAndSkills(localScore);
              if (!cur || localScore > cur.score) {
                allMap[mapKey] = {
                  cls, num,
                  name: `${cls} ${(num < 10 ? '0' : '') + num}號`,
                  score: localScore,
                  kills: Math.max(localKills, cur ? cur.kills : 0),
                  title: currentTier.title
                };
              }
            }
          } catch(e) {}
        }
      });

      const fullList = Object.values(allMap);
      fullList.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.kills !== a.kills) return b.kills - a.kills;
        if (a.cls !== b.cls) return a.cls.localeCompare(b.cls);
        return a.num - b.num;
      });
      fullList.forEach((item, idx) => {
        item.overallRank = idx + 1;
      });

      const classGroups = {};
      ['P6A', 'P6B', 'P6C', 'P6D', 'P6E', 'P6F'].forEach(c => {
        classGroups[c] = fullList.filter(s => s.cls === c);
        classGroups[c].forEach((item, idx) => {
          item.classRank = idx + 1;
        });
      });

      if (currentStudent) {
        const myKey = `${currentStudent.cls}_${currentStudent.num}`;
        const myEntry = allMap[myKey] || {
          cls: currentStudent.cls,
          num: currentStudent.num,
          name: `${currentStudent.cls} ${(currentStudent.num < 10 ? '0' : '') + currentStudent.num}號`,
          score: 0,
          kills: 0,
          overallRank: fullList.length,
          classRank: (classGroups[currentStudent.cls] || []).length
        };
        const { currentTier } = evalTierAndSkills(myEntry.score);

        document.getElementById('lb-my-name').textContent = myEntry.name;
        document.getElementById('lb-my-title').textContent = `當前境界：${currentTier.title}`;
        document.getElementById('lb-my-score').textContent = `${myEntry.score.toLocaleString()} 分`;
        document.getElementById('lb-my-badge').textContent = currentTier.badge;

        if (currentLeaderboardFilter === 'ALL') {
          document.getElementById('lb-my-rank').innerHTML = `<span style="color:#B45309; font-weight:900;">全級第 ${myEntry.overallRank} 名</span> <span style="font-size:12px;color:#64748B;">(全級共 ${fullList.length} 人)</span>`;
        } else {
          if (currentStudent.cls === currentLeaderboardFilter) {
            document.getElementById('lb-my-rank').innerHTML = `<span style="color:#2563EB; font-weight:900;">${currentLeaderboardFilter} 班內第 ${myEntry.classRank} 名</span> <span style="font-size:12px;color:#64748B;">(全級第 ${myEntry.overallRank} 名)</span>`;
          } else {
            document.getElementById('lb-my-rank').innerHTML = `<span style="color:#64748B;">原班 (${currentStudent.cls}) 第 ${myEntry.classRank} 名</span> <span style="font-size:11px;color:#94A3B8;">(正在瀏覽 ${currentLeaderboardFilter})</span>`;
          }
        }
      }

      const tbody = document.getElementById('leaderboard-tbody');
      const isClassFilter = currentLeaderboardFilter !== 'ALL';
      const limit = isClassFilter ? 15 : 20;
      const sourceList = isClassFilter ? (classGroups[currentLeaderboardFilter] || []) : fullList;
      const scoredList = sourceList.filter(s => s.score > 0);
      const displayList = (scoredList.length > 0 ? scoredList : sourceList).slice(0, limit);

      let myInDisplay = false;
      if (currentStudent) {
        if (!isClassFilter || currentStudent.cls === currentLeaderboardFilter) {
          myInDisplay = displayList.some(s => s.cls === currentStudent.cls && s.num === currentStudent.num);
        }
      }

      let rowsHtml = displayList.map(s => {
        const rankNum = isClassFilter ? s.classRank : s.overallRank;
        const medal = rankNum === 1 ? '🥇 1' : rankNum === 2 ? '🥈 2' : rankNum === 3 ? '🥉 3' : `${rankNum}`;
        const isMe = currentStudent && s.cls === currentStudent.cls && s.num === currentStudent.num;
        return `
          <tr style="${isMe ? 'background: #FEF3C7; font-weight: bold; border-left: 4px solid #D97706;' : ''}">
            <td style="padding: 7px; text-align: center; font-weight: 800; color: #1E3A8A;">${medal}</td>
            <td style="padding: 7px; text-align: center;">${s.cls}</td>
            <td style="padding: 7px; text-align: center;">${(s.num < 10 ? '0' : '') + s.num}號</td>
            <td style="padding: 7px; text-align: center; font-weight: 800;">${s.name} ${isMe ? '⭐(我)' : ''}</td>
            <td style="padding: 7px; text-align: center; font-size: 11px;">${s.title}</td>
            <td style="padding: 7px; text-align: center; font-weight: 900; color: #D97706;">${s.score.toLocaleString()}</td>
            <td style="padding: 7px; text-align: center;">${s.kills} 隻</td>
          </tr>
        `;
      }).join('');

      if (displayList.length === 0) {
        rowsHtml = `
          <tr>
            <td colspan="7" style="padding: 24px; text-align: center; color: #64748B; font-weight: 800; font-size: 13.5px;">
              🎮 該班尚無同學完成討伐破關，快登入挑戰成為第一位班級先鋒！
            </td>
          </tr>
        `;
      }

      if (currentStudent && !myInDisplay) {
        const myKey = `${currentStudent.cls}_${currentStudent.num}`;
        const myEntry = allMap[myKey];
        if (myEntry && (!isClassFilter || currentStudent.cls === currentLeaderboardFilter)) {
          const myRank = isClassFilter ? myEntry.classRank : myEntry.overallRank;
          const cutoffRank = isClassFilter ? 15 : 20;
          const targetStudent = sourceList[cutoffRank - 1];
          const gap = targetStudent ? Math.max(0, targetStudent.score - myEntry.score + 10) : 0;
          rowsHtml += `
            <tr style="background: #FFFBEB; border-top: 2px dashed #D97706; font-weight: bold;">
              <td style="padding: 9px; text-align: center; font-weight: 900; color: #B45309;">第 ${myRank} 名</td>
              <td style="padding: 9px; text-align: center;">${myEntry.cls}</td>
              <td style="padding: 9px; text-align: center;">${(myEntry.num < 10 ? '0' : '') + myEntry.num}號</td>
              <td style="padding: 9px; text-align: center; color: #B45309; font-weight: 900;">
                ${myEntry.name} ⭐ (我的目前排名)
                <div style="font-size: 11px; font-weight: 600; color: #D97706; margin-top: 2px;">
                  ⚡ 距離進榜 (第${cutoffRank}名) 還差 ${gap.toLocaleString()} 分，立即開戰追趕！
                </div>
              </td>
              <td style="padding: 9px; text-align: center; font-size: 11px;">${myEntry.title}</td>
              <td style="padding: 9px; text-align: center; font-weight: 900; color: #D97706;">${myEntry.score.toLocaleString()}</td>
              <td style="padding: 9px; text-align: center;">${myEntry.kills} 隻</td>
            </tr>
          `;
        }
      }

      tbody.innerHTML = rowsHtml;
    }

    // Skills Hall Modal
    function openSkillsModal() {
      openModal('modal-skills');
    }

    function renderSkillsHall() {
      const tiersContainer = document.getElementById('tiers-grid-container');
      tiersContainer.innerHTML = TIERS.map(t => `
        <div class="tier-card" style="border: 2px solid ${t.color}40; background: ${t.bg};">
          <div style="font-size: 28px; margin-bottom: 4px;">${t.badge}</div>
          <div style="font-weight: 900; font-size: 14px; color: ${t.color};">${t.title}</div>
          <div style="font-size: 11.5px; color: #64748B; font-weight: 700;">${t.min.toLocaleString()} 分解鎖</div>
        </div>
      `).join('');

      const skillsContainer = document.getElementById('skills-grid-container');
      skillsContainer.innerHTML = SKILLS.map(s => `
        <div class="skill-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 900; font-size: 14.5px; color: #1E3A8A;">${s.name}</span>
            <span style="font-size: 11px; font-weight: 800; color: #7E22CE; background: #F3E8FF; padding: 2px 8px; border-radius: 10px;">${s.reqPts} 分解鎖</span>
          </div>
          <p style="font-size: 12px; color: #475569; line-height: 1.4;">${s.desc}</p>
        </div>
      `).join('');
    }

    function openModal(id) { document.getElementById(id).style.display = 'flex'; }
    function closeModal(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

    // 快捷鍵：按下 Escape 鍵隨時關閉所有彈窗
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeModal('modal-skills');
        closeModal('modal-leaderboard');
        const confirmModal = document.getElementById('modal-confirm');
        if (confirmModal) confirmModal.style.display = 'none';
      }
    });


    // Window Load Initialization
    window.addEventListener('DOMContentLoaded', () => {
      renderTop40();
      renderClassBarCharts();
      renderClassCards();
      renderPerfectScorers();
      renderVocabTable();
      renderSkillsHall();

      const lastLogin = SafeStorage.getItem('p6_last_login');
      if (lastLogin) {
        try {
          currentStudent = JSON.parse(lastLogin);
          document.getElementById('identity-section').style.display = 'none';
          document.getElementById('battle-section').style.display = 'block';
          loadStudentProfile();
        } catch(e) {}
      }
    });
  
    // =========================================================================
    // ⚡ 模式 2：倉頡 10 字極速鍵盤手速賽核心引擎 (完全忽略作業系統輸入法)
    // =========================================================================

    // 每周固定 10 個核心字庫 (每周更換，開局全隨機洗牌)
    ;

    
    // =========================================================================
    // 🔤 倉頡字碼來源單一化：由字根陣列自動動態生成按鍵字母串 (防止人為轉寫錯漏)
    // =========================================================================
    

    

    function getActiveSpeedWeek() {
      // 支援網址參數手動切換測試 (例如 ?week=w2, ?week=w3, ?week=w4, ?week=w5)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const qWk = urlParams.get('week');
        if (qWk && ['w2', 'w3', 'w4', 'w5'].includes(qWk.toLowerCase())) {
          return qWk.toLowerCase();
        }
      } catch (e) {}

      const now = new Date();
      for (const s of SPEED_WEEK_SCHEDULES) {
        if (now >= s.start && now <= s.end) {
          return s.week;
        }
      }
      if (now < SPEED_WEEK_SCHEDULES[0].start) return 'w2';
      // 超過最後排程區間時，自動返回最新一週 (w5)，永不鎖死在舊週次
      return SPEED_WEEK_SCHEDULES[SPEED_WEEK_SCHEDULES.length - 1].week;
    }

    function initSpeedWeekDropdown() {
      const activeWk = getActiveSpeedWeek();
      const select = document.getElementById('speed-ready-week-select');
      if (!select) return;

      select.innerHTML = '';
      const hwKeys = [1, 2, 3, 4].map(idx => `${activeWk}_hw${idx}`);
      hwKeys.forEach((k, idx) => {
        const bank = MODE2_WEEKLY_BANKS[k];
        if (bank) {
          const opt = document.createElement('option');
          opt.value = k;
          opt.textContent = bank.title; // 顯示為「第4周功課1」等
          if (idx === 0) opt.selected = true;
          select.appendChild(opt);
        }
      });

      currentSpeedWeek = select.value || `${activeWk}_hw1`;
      updateSpeedLeaderboardButtons(activeWk);
    }

    function updateSpeedLeaderboardButtons(activeWk) {
      const container = document.getElementById('speed-lb-week-buttons');
      if (!container) return;
      container.innerHTML = '';

      const hwKeys = [1, 2, 3, 4].map(idx => `${activeWk}_hw${idx}`);
      if (!hwKeys.includes(speedLeaderboardWeek)) {
        speedLeaderboardWeek = hwKeys[0];
      }

      hwKeys.forEach(k => {
        const bank = MODE2_WEEKLY_BANKS[k];
        const btn = document.createElement('button');
        btn.className = 'lb-sub-pill' + (k === speedLeaderboardWeek ? ' active' : '');
        btn.id = `lb-week-${k}`;
        btn.textContent = bank ? bank.title : k; // 顯示為「第4周功課1」等
        btn.onclick = () => filterSpeedLeaderboardWeek(k);
        container.appendChild(btn);
      });
    }

    let currentSpeedWeek = 'w3';
    let currentSpeedWordCount = 10; // 10 或 20
    let isSpeedPracticeMode = false;
    let speedWordList = [];
    let speedWordIdx = 0;
    let speedInputCodes = [];
    let speedStartTime = null;
    let speedTimerInterval = null;
    let speedPenaltySeconds = 0.0;
    let speedMistakes = 0;
    let speedTotalKeys = 0;
    let speedCorrectKeys = 0;
    let speedHintTimer = null;
    let speedActive = false;
    let speedWordReadyForSpace = false; // 鍵盤打完該字後，等待按空白鍵才進下一關

    // 手速排行榜專用獨立篩選器
    let currentLeaderboardType = 'score'; // 'score' | 'speed'
    let speedLeaderboardWordCount = 10;   // 10 | 20
    let speedLeaderboardWeek = 'w3';      // 'w3' | 'w2' | 'w4' | 'w5' | 'ALL'

    // 🎯 核心演算法：等效競賽總耗時計算公式 (秒數制 · 擊鍵準確率二次方加權罰時)
    function calculateEffectiveSpeedTime(rawTime, mistakes, accuracy, wordCount) {
      // 1. 即時按錯鍵罰時：每次按錯加計 +0.3 秒
      const keyPenalty = mistakes * 0.3;
      
      // 2. 擊鍵準確率二次方加權罰時：
      // 基準因子：10字基準為 15 秒，20字基準為 30 秒 (即每題 1.5 秒基準)
      const baseFactor = (wordCount === 20) ? 30.0 : 15.0;
      const accRatio = Math.max(0, Math.min(100, accuracy)) / 100;
      // 依 (1 - (Acc/100)^2) 計算，準確率越低罰時急劇增加，懲罰盲目亂敲
      const accPenalty = Math.round(baseFactor * (1 - Math.pow(accRatio, 2)) * 100) / 100;
      
      // 3. 零失誤神手獎勵 (100% 準確率)
      const bonus = (accuracy >= 100) ? ((wordCount === 20) ? 2.0 : 1.0) : 0.0;
      
      // 4. 等效競賽總耗時 (秒)
      const effectiveTime = parseFloat((rawTime + keyPenalty + accPenalty - bonus).toFixed(2));
      
      return {
        keyPenalty: parseFloat(keyPenalty.toFixed(2)),
        accPenalty: parseFloat(accPenalty.toFixed(2)),
        bonus: parseFloat(bonus.toFixed(2)),
        effectiveTime: Math.max(1.0, effectiveTime)
      };
    }

    // 榮譽手速段位計算 (依題量與等效秒數評判)
    function onSpeedSettingChange() {
      const wcSelect = document.getElementById('speed-word-count-select');
      const wkSelect = document.getElementById('speed-ready-week-select');
      if (wcSelect) currentSpeedWordCount = parseInt(wcSelect.value, 10) || 10;
      if (wkSelect) currentSpeedWeek = wkSelect.value || 'w3';
    }

    // 雙模式共存切換 (選項 3：競技排位 vs 練習提示)
    function toggleSpeedPracticeMode() {
      isSpeedPracticeMode = !isSpeedPracticeMode;
      const btn = document.getElementById('speed-mode-toggle-btn');
      if (btn) {
        if (isSpeedPracticeMode) {
          btn.innerHTML = '💡 練習模式 (全程字根可見)';
          btn.style.color = '#34D399';
          btn.style.borderColor = '#10B981';
          btn.style.background = '#0F172A';
        } else {
          btn.innerHTML = '⚔️ 競技排位賽 (停頓3秒提燈)';
          btn.style.color = '#FDE047';
          btn.style.borderColor = '#FACC15';
          btn.style.background = '#0F172A';
        }
      }
      if (speedActive) {
        renderSpeedTargetWord();
      }
    }

    // 返回備戰大廳
    function returnToSpeedReadyStage() {
      const mainStage = document.getElementById('speed-main-stage');
      const finishBox = document.getElementById('speed-finish-box');
      const readyStage = document.getElementById('speed-ready-stage');
      if (mainStage) mainStage.style.display = 'none';
      if (finishBox) finishBox.style.display = 'none';
      if (readyStage) readyStage.style.display = 'block';
    }

    // 🚀 核心入口：按下開始按鈕才真正啟動比賽與碼表計時
    function launchSpeedMatch() {
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }

      onSpeedSettingChange();

      if (speedTimerInterval) clearInterval(speedTimerInterval);
      if (speedHintTimer) clearTimeout(speedHintTimer);

      const bank = MODE2_WEEKLY_BANKS[currentSpeedWeek] || MODE2_WEEKLY_BANKS["w3"];
      const rawWords = [...bank.words];
      const shuffled = [...rawWords].sort(() => Math.random() - 0.5);
      speedWordList = shuffled.slice(0, currentSpeedWordCount);

      speedWordIdx = 0;
      speedInputCodes = [];
      speedMistakes = 0;
      speedPenaltySeconds = 0.0;
      speedTotalKeys = 0;
      speedCorrectKeys = 0;
      speedActive = true;
      speedWordReadyForSpace = false;

      // 切換舞台：隱藏備戰大廳與結算卡，展示輸入主舞台
      document.getElementById('speed-ready-stage').style.display = 'none';
      document.getElementById('speed-finish-box').style.display = 'none';
      document.getElementById('speed-main-stage').style.display = 'block';

      // 更新頂部標籤與計時器
      document.getElementById('speed-total-count-text').textContent = speedWordList.length;
      document.getElementById('speed-timer-val').textContent = '00.00s';
      document.getElementById('speed-penalty-display').innerHTML = `⚠️ 失誤 0 次 (+0.0s 罰時)`;
      
      const badgeTag = document.getElementById('speed-active-badge-tag');
      if (badgeTag) {
        const bankObj = MODE2_WEEKLY_BANKS[currentSpeedWeek] || Object.values(MODE2_WEEKLY_BANKS)[0];
        badgeTag.textContent = `⚡ ${currentSpeedWordCount} 字賽 · ${bankObj.title}`;
      }

      const spacePrompt = document.getElementById('speed-space-prompt');
      if (spacePrompt) spacePrompt.style.display = 'none';

      renderSpeedProgressDots();
      renderSpeedTargetWord();

      // 真正啟動高精度即時碼表
      speedStartTime = performance.now();
      speedTimerInterval = setInterval(updateSpeedClock, 30);

      // 監聽鍵盤原生事件
      window.removeEventListener('keydown', handleSpeedKeydown, true);
      window.addEventListener('keydown', handleSpeedKeydown, true);
    }

    // 放棄比賽返回備戰大廳
    function abortSpeedMatchToReady() {
      if (speedTimerInterval) clearInterval(speedTimerInterval);
      if (speedHintTimer) clearTimeout(speedHintTimer);
      speedActive = false;
      speedWordReadyForSpace = false;
      window.removeEventListener('keydown', handleSpeedKeydown, true);

      initSpeedWeekDropdown();
        returnToSpeedReadyStage();
    }

    // 更新即時碼表
    function updateSpeedClock() {
      if (!speedStartTime || !speedActive) return;
      const now = performance.now();
      const elapsed = ((now - speedStartTime) / 1000) + speedPenaltySeconds;
      document.getElementById('speed-timer-val').textContent = elapsed.toFixed(2) + 's';
    }

    // 渲染進度圓點
    function renderSpeedProgressDots() {
      const container = document.getElementById('speed-progress-dots');
      if (!container) return;
      container.innerHTML = '';
      const total = speedWordList.length;
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'speed-dot' + (i === speedWordIdx ? ' active' : (i < speedWordIdx ? ' done' : ''));
        container.appendChild(dot);
      }
    }

    // 渲染當前目標中文字與字碼卡槽
    function renderSpeedTargetWord() {
      if (speedWordIdx >= speedWordList.length) return;
      const currentWord = speedWordList[speedWordIdx];

      speedWordReadyForSpace = false;
      const spacePrompt = document.getElementById('speed-space-prompt');
      if (spacePrompt) spacePrompt.style.display = 'none';

      document.getElementById('speed-target-char').textContent = currentWord.char;
      document.getElementById('speed-current-idx-text').textContent = speedWordIdx + 1;
      document.getElementById('speed-bottom-tip').innerHTML = `💡 規則：按錯鍵每次加計 <strong>+0.3 秒罰時</strong> · 停頓 <strong>3 秒</strong> 未按鍵自動亮起字碼提示 · <strong>打完字碼請按【空白鍵 Space】送出</strong>`;

      renderSpeedProgressDots();

      const slotsContainer = document.getElementById('speed-slots-row');
      slotsContainer.innerHTML = '';

      const neededIdx = speedInputCodes.length;

      currentWord.codes.forEach((code, idx) => {
        const slot = document.createElement('div');
        slot.id = `speed-slot-${idx}`;
        slot.className = 'speed-key-slot';

        if (idx < speedInputCodes.length) {
          slot.classList.add('filled');
          slot.innerHTML = `
            <div class="speed-slot-code" style="color: #34D399;">${speedInputCodes[idx].code}</div>
            <div class="speed-slot-sub" style="color: #A7F3D0;">${speedInputCodes[idx].key}</div>
          `;
        } else if (idx === neededIdx) {
          slot.classList.add('current');
          if (isSpeedPracticeMode) {
            slot.innerHTML = `
              <div class="speed-slot-hint-text">${code}</div>
              <div class="speed-slot-sub" style="color: #FACC15; font-weight: 900;">${currentWord.keys[idx]}</div>
            `;
          } else {
            slot.innerHTML = `
              <div class="speed-slot-code" style="color: #94A3B8;">？</div>
              <div class="speed-slot-sub">第${idx + 1}碼</div>
            `;
          }
        } else {
          slot.innerHTML = `
            <div class="speed-slot-code" style="color: #475569;">·</div>
            <div class="speed-slot-sub">第${idx + 1}碼</div>
          `;
        }
        slotsContainer.appendChild(slot);
      });

      startSpeedHintTimer();
    }

    // 3 秒未輸入自動提燈提示
    function startSpeedHintTimer() {
      if (speedHintTimer) clearTimeout(speedHintTimer);
      if (isSpeedPracticeMode || !speedActive || speedWordReadyForSpace) return;

      const currentWord = speedWordList[speedWordIdx];
      const neededIdx = speedInputCodes.length;
      if (!currentWord || neededIdx >= currentWord.codes.length) return;

      speedHintTimer = setTimeout(() => {
        const targetSlot = document.getElementById(`speed-slot-${neededIdx}`);
        if (targetSlot) {
          targetSlot.classList.add('hint-glow');
          targetSlot.innerHTML = `
            <div class="speed-slot-hint-text">${currentWord.codes[neededIdx]}</div>
            <div class="speed-slot-sub" style="color: #FACC15; font-weight: 900;">${currentWord.keys[neededIdx]}</div>
          `;
          document.getElementById('speed-bottom-tip').innerHTML = `💡 <span style="color:#FACC15;font-weight:900;">【提燈指引啟動】：目標字根為【${currentWord.codes[neededIdx]}】(按鍵 ${currentWord.keys[neededIdx]})！</span>`;
        }
      }, 3000);
    }

    // ⌨️ 鍵盤原生事件監聽 (徹底解決按空白鍵重開問題，完全忽略輸入法)
    function handleSpeedKeydown(e) {
      if (currentGameMode !== 'speed') return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // 🛑 情況 1：在備戰大廳，按下 Space 或 Enter 允許快速啟動
      const readyStage = document.getElementById('speed-ready-stage');
      if (readyStage && readyStage.style.display !== 'none') {
        if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          launchSpeedMatch();
        }
        return;
      }

      if (!speedActive) return;

      // 🛑 情況 2：比賽進行中按下了空白鍵 (Space) —— 全局嚴格攔截，絕不允許觸發瀏覽器預設按鈕點擊！
      if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32) {
        e.preventDefault();
        e.stopPropagation();

        if (speedWordReadyForSpace) {
          // 正確狀態：字碼已完成，按下空白鍵確認送出並進入下一題
          confirmSpeedWordSpace();
        } else {
          // 學生在尚未敲完全部字碼時誤按空白鍵 —— 溫和提醒，絕不重開題目！
          const stage = document.getElementById('speed-main-stage');
          triggerFloatingNotice(stage, '請先敲完字碼再按空白鍵！⚠️');
          const currentWord = speedWordList[speedWordIdx];
          if (currentWord) {
            const neededIdx = speedInputCodes.length;
            const targetSlot = document.getElementById(`speed-slot-${neededIdx}`);
            if (targetSlot) {
              targetSlot.classList.add('shake-error');
              setTimeout(() => targetSlot.classList.remove('shake-error'), 400);
            }
          }
        }
        return;
      }

      // 情況 3：支援 Backspace 退回上一碼
      if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        if (speedWordReadyForSpace) {
          speedWordReadyForSpace = false;
          speedInputCodes.pop();
          renderSpeedTargetWord();
        } else if (speedInputCodes.length > 0) {
          speedInputCodes.pop();
          renderSpeedTargetWord();
        }
        return;
      }

      // 情況 4：已打完字碼等待按空白鍵時，若按其他英文字母，提醒按下空白鍵
      if (speedWordReadyForSpace) {
        e.preventDefault();
        e.stopPropagation();
        const spacePrompt = document.getElementById('speed-space-prompt');
        if (spacePrompt) {
          spacePrompt.classList.add('shake-error');
          setTimeout(() => spacePrompt.classList.remove('shake-error'), 400);
        }
        return;
      }

      // 情況 5：攔截英文字母鍵 A ~ Z (完全忽略輸入法)
      const keyUpper = e.key.toUpperCase();
      if (keyUpper.length === 1 && keyUpper >= 'A' && keyUpper <= 'Z') {
        e.preventDefault(); // 阻止瀏覽器組字上屏
        e.stopPropagation();
        processSpeedKeyInput(keyUpper);
      }
    }

    // 處理手速賽按鍵
    function processSpeedKeyInput(pressedKey) {
      if (speedWordReadyForSpace) return;
      const currentWord = speedWordList[speedWordIdx];
      if (!currentWord) return;

      const neededIdx = speedInputCodes.length;
      const targetKey = currentWord.keys[neededIdx];
      const targetCode = currentWord.codes[neededIdx];

      speedTotalKeys++;

      if (pressedKey === targetKey) {
        // 正確按鍵
        speedCorrectKeys++;
        speedInputCodes.push({ key: pressedKey, code: targetCode });

        // 檢查該字是否全部碼位完成
        if (speedInputCodes.length === currentWord.keys.length) {
          speedWordReadyForSpace = true;
          if (speedHintTimer) clearTimeout(speedHintTimer);

          // 更新卡槽為全綠成功狀態
          const slotsContainer = document.getElementById('speed-slots-row');
          if (slotsContainer) {
            slotsContainer.innerHTML = '';
            currentWord.codes.forEach((code, idx) => {
              const slot = document.createElement('div');
              slot.className = 'speed-key-slot filled';
              slot.style.borderColor = '#10B981';
              slot.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.5)';
              slot.innerHTML = `
                <div class="speed-slot-code" style="color: #34D399;">${code}</div>
                <div class="speed-slot-sub" style="color: #A7F3D0;">${currentWord.keys[idx]} ✓</div>
              `;
              slotsContainer.appendChild(slot);
            });
          }

          // 浮現空白鍵確認送出提示列
          const spacePrompt = document.getElementById('speed-space-prompt');
          if (spacePrompt) {
            spacePrompt.style.display = 'flex';
          }
          document.getElementById('speed-bottom-tip').innerHTML = `✨ <strong style="color:#34D399;">【${currentWord.char}】字碼全對！</strong>請按下鍵盤<strong>【Space 空白鍵】</strong>送出並進入下一題 ➔`;
        } else {
          renderSpeedTargetWord();
        }
      } else {
        // 按錯鍵：按要求嚴格加計 +0.3 秒罰時
        speedMistakes++;
        speedPenaltySeconds += 0.3;

        // 畫面抖動與泛紅
        const targetSlot = document.getElementById(`speed-slot-${neededIdx}`);
        if (targetSlot) {
          targetSlot.classList.add('shake-error');
          setTimeout(() => targetSlot.classList.remove('shake-error'), 400);
        }

        // 浮動紅字標籤
        const stage = document.getElementById('speed-main-stage');
        triggerFloatingNotice(stage, '+0.3s 罰時 ⚠️');

        document.getElementById('speed-penalty-display').innerHTML = `⚠️ 失誤 <strong style="color:#EF4444;">${speedMistakes}</strong> 次 (+<strong style="color:#EF4444;">${speedPenaltySeconds.toFixed(1)}s</strong> 罰時)`;
      }
    }

    // 學生按下空白鍵送出此字並進入下一關
    function confirmSpeedWordSpace() {
      if (!speedWordReadyForSpace || !speedActive) return;
      speedWordReadyForSpace = false;

      const spacePrompt = document.getElementById('speed-space-prompt');
      if (spacePrompt) spacePrompt.style.display = 'none';

      burstConfetti();
      speedWordIdx++;
      speedInputCodes = [];

      if (speedWordIdx < speedWordList.length) {
        renderSpeedTargetWord();
      } else {
        // 全部題目完成！進入結算
        onSpeedMatchComplete();
      }
    }

    // 手速賽圓滿結算 (秒數制 · 擊鍵準確率二次方加權罰時)
    function onSpeedMatchComplete() {
      speedActive = false;
      speedWordReadyForSpace = false;
      if (speedTimerInterval) clearInterval(speedTimerInterval);
      if (speedHintTimer) clearTimeout(speedHintTimer);
      window.removeEventListener('keydown', handleSpeedKeydown, true);

      const endTime = performance.now();
      const rawElapsed = parseFloat(((endTime - speedStartTime) / 1000).toFixed(2));
      const accuracy = Math.max(10, Math.round((speedCorrectKeys / Math.max(1, speedTotalKeys)) * 100));

      // 計算等效競賽總耗時 (秒)
      const penaltyObj = calculateEffectiveSpeedTime(rawElapsed, speedMistakes, accuracy, currentSpeedWordCount);
      const effectiveFinalTime = penaltyObj.effectiveTime;

      const cpm = Math.round(currentSpeedWordCount / (effectiveFinalTime / 60)); // 等效中文字速
      const speedTier = getSpeedTier(effectiveFinalTime, currentSpeedWordCount);

      // 展示結算卡
      document.getElementById('speed-main-stage').style.display = 'none';
      document.getElementById('speed-finish-box').style.display = 'block';

      document.getElementById('speed-finish-title').textContent = `${currentSpeedWordCount} 字極速鍵盤手速賽完成！`;
      document.getElementById('speed-stat-final-time').textContent = effectiveFinalTime.toFixed(2) + 's';
      document.getElementById('speed-stat-raw-time').textContent = rawElapsed.toFixed(2) + 's';
      document.getElementById('speed-stat-acc').textContent = accuracy + '%';
      document.getElementById('speed-stat-acc-penalty').textContent = (penaltyObj.accPenalty >= 0 ? '+' : '') + penaltyObj.accPenalty.toFixed(2) + 's';
      document.getElementById('speed-stat-cpm').textContent = cpm + ' 字/分';
      document.getElementById('speed-stat-tier').textContent = speedTier;

      // 儲存至本地 SafeStorage (依周次與題量獨立儲存個人最佳秒數紀錄)
      if (currentStudent) {
        const speedKey = `p6_speed_${currentStudent.cls}_${currentStudent.num}_${currentSpeedWordCount}_${currentSpeedWeek}`;
        const prev = SafeStorage.getItem(speedKey);
        let bestRecord = {
          cls: currentStudent.cls,
          num: currentStudent.num,
          wordCount: currentSpeedWordCount,
          weekKey: currentSpeedWeek,
          bestTime: effectiveFinalTime, // 核心天梯排名依據 (秒數越小越前)
          rawTime: rawElapsed,
          accuracy: accuracy,
          cpm: cpm,
          accPenalty: penaltyObj.accPenalty,
          tier: speedTier,
          date: new Date().toISOString()
        };

        if (prev) {
          try {
            const parsed = JSON.parse(prev);
            if (parsed && typeof parsed.bestTime === 'number' && parsed.bestTime < effectiveFinalTime) {
              bestRecord = parsed; // 保留歷史最快紀錄
            }
          } catch(e) {}
        }
        SafeStorage.setItem(speedKey, JSON.stringify(bestRecord));

        // 向下相容舊鍵 (10字 w3)
        if (currentSpeedWordCount === 10) {
          const prevOverall = SafeStorage.getItem(`p6_speed_${currentStudent.cls}_${currentStudent.num}`);
          let shouldUpdateOverall = true;
          if (prevOverall) {
            try {
              const parsedPrev = JSON.parse(prevOverall);
              if (parsedPrev && parsedPrev.bestTime <= effectiveFinalTime) {
                shouldUpdateOverall = false;
              }
            } catch (e) {}
          }
          if (shouldUpdateOverall) {
            SafeStorage.setItem(`p6_speed_${currentStudent.cls}_${currentStudent.num}`, JSON.stringify(bestRecord));
          }
        }

        // 同步手速獎勵至總分 (依完成題目量與用時換算)
        let roundScore = Math.max(20, Math.round(150 - effectiveFinalTime * 2));
        if (currentSpeedWordCount === 20) roundScore = Math.round(roundScore * 1.8);
        // 手速賽純秒數天梯，不加總分，只回傳最佳秒數與周次
        saveStudentStats(currentStudent.cls, currentStudent.num, 0, false, 'speed', effectiveFinalTime, 10, currentSpeedWeek);
        loadStudentProfile();
      }

              // 同步手速榜篩選器與按鈕狀態至當前挑戰項目
        speedLeaderboardWordCount = currentSpeedWordCount;
        speedLeaderboardWeek = currentSpeedWeek;
        document.querySelectorAll('#speed-lb-sub-filters .lb-sub-pill[id^="lb-wc-"]').forEach(p => {
          p.classList.toggle('active', p.id === `lb-wc-${speedLeaderboardWordCount}`);
        });
        document.querySelectorAll('#speed-lb-week-buttons .lb-sub-pill').forEach(p => {
          p.classList.toggle('active', p.id === `lb-week-${speedLeaderboardWeek}`);
        });

      burstConfetti();
    }

    // 重玩手速賽 (同配置全新亂序)
    function restartSpeedMatch() {
      launchSpeedMatch();
    }

    // =========================================================================
    // 🏆 排行榜雙軌切換：討伐累積總分榜 vs 獨立手速天梯榜 (題量/周次/秒數升序)
    // =========================================================================
    function switchLeaderboardType(type) {
      currentLeaderboardType = type;
      document.querySelectorAll('.lb-sub-nav-btn').forEach(b => {
        b.classList.toggle('active', (type === 'score' && b.id === 'lb-type-score') || (type === 'speed' && b.id === 'lb-type-speed'));
      });
      
      const subFilters = document.getElementById('speed-lb-sub-filters');
      if (subFilters) {
        subFilters.style.display = (type === 'speed') ? 'block' : 'none';
        const select = document.getElementById('speed-lb-week-select');
        if (select && speedLeaderboardWeek) {
          select.value = speedLeaderboardWeek;
        }
      }

      const modalTitle = document.getElementById('lb-modal-main-title');
      if (modalTitle) {
        modalTitle.textContent = (type === 'speed') ? '⚡ 六年級寶可夢倉頡手速天梯榜 (秒數升序)' : '🏆 六年級寶可夢倉頡討伐龍虎榜';
      }

      renderLeaderboardTable();
    }

    // 題量子篩選器
    function filterSpeedLeaderboardWordCount(wc) {
      speedLeaderboardWordCount = wc;
      document.querySelectorAll('#speed-lb-sub-filters .lb-sub-pill[id^="lb-wc-"]').forEach(p => {
        p.classList.toggle('active', p.id === `lb-wc-${wc}`);
      });
      renderSpeedLeaderboardTable();
    }

    // 周次子篩選器
    function filterSpeedLeaderboardWeek(weekKey) {
      speedLeaderboardWeek = weekKey;
      const select = document.getElementById('speed-lb-week-select');
      if (select && select.value !== weekKey) {
        select.value = weekKey;
      }
      if (typeof fetchCloudLeaderboard === 'function') {
        fetchCloudLeaderboard(true);
      }
      renderSpeedLeaderboardTable();
    }



    // 獨立手速天梯榜渲染函數 (秒數升序 ASC · 擊鍵準確率二次加權罰時已計入)
    function renderSpeedLeaderboardTable() {
      // 1. 替換表頭為純10字秒數制各項指標
      const thead = document.querySelector('#modal-leaderboard thead tr');
      if (thead) {
        thead.innerHTML = `
          <th>排名</th>
          <th>班別</th>
          <th>學號</th>
          <th>訓練家代號</th>
          <th>周次功課</th>
          <th style="color:#0284C7;">⏱️ 10字等效耗時 (秒)</th>
          <th>原始碼表耗時</th>
          <th>擊鍵準確率</th>
          <th>準確率加權罰時</th>
          <th>等效中文字速</th>
          <th>手速段位</th>
        `;
      }

      const scoreLabel = document.getElementById('lb-my-score-label');
      const rankLabel = document.getElementById('lb-my-rank-label');
      if (scoreLabel) scoreLabel.textContent = '10字等效總耗時';
      if (rankLabel) rankLabel.textContent = (currentLeaderboardFilter === 'ALL') ? '全級手速名次' : '班內手速名次';

      const bankObj = MODE2_WEEKLY_BANKS[speedLeaderboardWeek];
      const wkTitle = bankObj ? bankObj.title : (speedLeaderboardWeek === 'ALL' ? '全部周次' : speedLeaderboardWeek);

      const allSpeedMap = {};

      // 1. 初始化全級名冊 (預設全部未參賽，不入榜)
      if (DATA.benchmark_leaderboard && Array.isArray(DATA.benchmark_leaderboard)) {
        DATA.benchmark_leaderboard.forEach(item => {
          let hasRec = false;
          let timeVal = 9999.0;

          if (item.weekly_speed && item.weekly_speed[speedLeaderboardWeek]) {
            timeVal = item.weekly_speed[speedLeaderboardWeek];
            hasRec = true;
          } else if (speedLeaderboardWeek === 'ALL' && item.best10) {
            timeVal = item.best10;
            hasRec = true;
          }

          const cpmVal = hasRec ? Math.round(10 / (timeVal / 60)) : 0;
          const tierVal = hasRec ? getSpeedTier(timeVal, 10) : '--';

          allSpeedMap[`${item.cls}_${item.num}`] = {
            cls: item.cls,
            num: item.num,
            name: `${item.cls} ${(item.num < 10 ? '0' : '') + item.num}號`,
            bestTime: timeVal,
            rawTime: timeVal,
            cpm: cpmVal,
            accuracy: 100,
            accPenalty: 0,
            tier: tierVal,
            weekKey: speedLeaderboardWeek,
            hasRecord: hasRec
          };
        });
      }

      // 2. 從本地 SafeStorage 讀取該周次功課之真實手速紀錄 (優先採用本機最新最佳)
      const allKeys = SafeStorage.getAllKeys ? SafeStorage.getAllKeys() : [];
      allKeys.forEach(key => {
        if (key.startsWith('p6_speed_')) {
          if (!/^p6_speed_[A-Za-z0-9]+_\d{1,2}_10_\w+$/.test(key)) return;
          const parts = key.replace('p6_speed_', '').split('_');
          const cls = String(parts[0] || '').trim().toUpperCase();
          const num = parseInt(parts[1], 10);
          if (!cls || isNaN(num) || num < 1 || num > 36) return;
          const recWc = parts[2] ? parseInt(parts[2], 10) : 10;
          const recWk = parts.slice(3).join('_') || 'w5_hw1';

          if (recWc !== 10) return; // 鎖定純10字
          if (speedLeaderboardWeek !== 'ALL' && recWk !== speedLeaderboardWeek) return;

          try {
            const parsed = JSON.parse(SafeStorage.getItem(key));
            if (parsed && typeof parsed.bestTime === 'number' && parsed.bestTime > 0 && parsed.bestTime < 900) {
              const mapKey = `${cls}_${num}`;
              const time = parsed.bestTime;
              const raw = parsed.rawTime || time;
              const acc = (typeof parsed.accuracy === 'number') ? parsed.accuracy : 100;
              const cpm = parsed.cpm || Math.round(10 / (time / 60));
              const penalty = parsed.accPenalty || 0;
              const tier = parsed.tier || getSpeedTier(time, 10);

              if (!allSpeedMap[mapKey] || !allSpeedMap[mapKey].hasRecord || allSpeedMap[mapKey].bestTime > time) {
                allSpeedMap[mapKey] = {
                  cls, num,
                  name: `${cls} ${(num < 10 ? '0' : '') + num}號`,
                  bestTime: time,
                  rawTime: raw,
                  cpm: cpm,
                  accuracy: acc,
                  accPenalty: penalty,
                  tier: tier,
                  weekKey: recWk,
                  hasRecord: true
                };
              }
            }
          } catch(e) {}
        }
      });

      // 3. 從雲端即時手速榜 (GAS doGet) 合併該周次功課跨電腦成績
      if (DATA.cloud_speed_records) {
        let cloudList = [];
        if (Array.isArray(DATA.cloud_speed_records)) {
          cloudList = DATA.cloud_speed_records;
        } else if (DATA.cloud_speed_records[speedLeaderboardWeek]) {
          cloudList = DATA.cloud_speed_records[speedLeaderboardWeek];
        } else if (speedLeaderboardWeek === 'ALL' && DATA.cloud_speed_records['overall']) {
          cloudList = DATA.cloud_speed_records['overall'];
        }

        cloudList.forEach(cs => {
          const mapKey = `${cs.cls}_${cs.num}`;
          const time = cs.bestTime || cs.best10;
          if (time && typeof time === 'number' && time > 0 && time < 900) {
            const curEntry = allSpeedMap[mapKey];
            if (!curEntry || !curEntry.hasRecord || curEntry.bestTime > time) {
              const cpm = cs.cpm || Math.round(10 / (time / 60));
              allSpeedMap[mapKey] = {
                cls: cs.cls,
                num: cs.num,
                name: cs.name || `${cs.cls} ${(cs.num < 10 ? '0' : '') + cs.num}號`,
                bestTime: time,
                rawTime: cs.rawTime || time,
                cpm: cpm,
                accuracy: cs.accuracy || 100,
                accPenalty: cs.accPenalty || 0,
                tier: cs.tier || getSpeedTier(time, 10),
                weekKey: speedLeaderboardWeek,
                hasRecord: true
              };
            }
          }
        });
      }

      // 4. 嚴格過濾：未參與本項手速遊戲者直接不入榜！
      const speedList = Object.values(allSpeedMap).filter(s => s.hasRecord && s.bestTime < 900);
      speedList.sort((a, b) => {
        if (a.bestTime !== b.bestTime) return a.bestTime - b.bestTime;
        return b.accuracy - a.accuracy;
      });
      speedList.forEach((item, idx) => item.overallRank = idx + 1);

      // 分班計算班內名次 (僅限有成績者)
      const classGroups = {};
      ['P6A', 'P6B', 'P6C', 'P6D', 'P6E', 'P6F'].forEach(c => {
        classGroups[c] = speedList.filter(s => s.cls === c);
        classGroups[c].forEach((item, idx) => item.classRank = idx + 1);
      });

      // 5. 更新頂部我的個人戰報
      if (currentStudent) {
        const myKey = `${currentStudent.cls}_${currentStudent.num}`;
        const myEntry = allSpeedMap[myKey];
        document.getElementById('lb-my-name').textContent = `${currentStudent.cls} ${(currentStudent.num < 10 ? '0' : '') + currentStudent.num}號`;
        
        if (myEntry && myEntry.hasRecord) {
          document.getElementById('lb-my-title').textContent = `分類：10字賽 · ${wkTitle} ｜ 字速：${myEntry.cpm} 字/分`;
          document.getElementById('lb-my-score').textContent = `${myEntry.bestTime.toFixed(2)} 秒 (準確率 ${myEntry.accuracy}%)`;
          document.getElementById('lb-my-badge').textContent = '⚡';
          if (currentLeaderboardFilter === 'ALL') {
            document.getElementById('lb-my-rank').innerHTML = `<span style="color:#B45309;font-weight:900;">全級手速第 ${myEntry.overallRank} 名 (共 ${speedList.length} 人上榜)</span>`;
          } else {
            const classTotal = (classGroups[currentLeaderboardFilter] || []).length;
            document.getElementById('lb-my-rank').innerHTML = `<span style="color:#2563EB;font-weight:900;">${currentLeaderboardFilter} 班內手速第 ${myEntry.classRank} 名 (共 ${classTotal} 人上榜)</span>`;
          }
        } else {
          document.getElementById('lb-my-title').textContent = `分類：10字賽 · ${wkTitle}`;
          document.getElementById('lb-my-score').textContent = '-- 秒';
          document.getElementById('lb-my-badge').textContent = '⏱️';
          document.getElementById('lb-my-rank').textContent = '未參加本周次手速挑戰 (未入榜)';
        }
      }

      // 6. 渲染表格
      const isClassFilter = currentLeaderboardFilter !== 'ALL';
      const displayList = isClassFilter ? (classGroups[currentLeaderboardFilter] || []) : speedList;

      const tbody = document.getElementById('leaderboard-tbody');
      if (displayList.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="11" style="padding: 26px; text-align: center; color: #64748B; font-weight: 800; font-size: 13.5px;">
              ⚡ 該組分類 (10字賽 · ${wkTitle}) 尚無同學完成，快成為第一位手速神手！
            </td>
          </tr>
        `;
        return;
      }

      let rowsHtml = displayList.map(s => {
        const rankNum = isClassFilter ? s.classRank : s.overallRank;
        let medal = `${rankNum}`;
        if (rankNum === 1) medal = '🥇 1';
        else if (rankNum === 2) medal = '🥈 2';
        else if (rankNum === 3) medal = '🥉 3';

        const isMe = currentStudent && s.cls === currentStudent.cls && s.num === currentStudent.num;
        const rowBank = MODE2_WEEKLY_BANKS[s.weekKey || speedLeaderboardWeek];
        const rowWkTitle = rowBank ? rowBank.title : (s.weekKey || speedLeaderboardWeek);

        return `
          <tr style="${isMe ? 'background: #EFF6FF; font-weight: bold; border-left: 4px solid #2563EB;' : ''}">
            <td style="padding: 7px; text-align: center; font-weight: 900; color: ${rankNum <= 3 ? '#B45309' : '#1E293B'};">${medal}</td>
            <td style="padding: 7px; text-align: center;"><span class="st-poke-tag" style="background:#DBEAFE;color:#1E40AF;font-weight:800;">${s.cls}</span></td>
            <td style="padding: 7px; text-align: center; font-weight: 700;">${(s.num < 10 ? '0' : '') + s.num}號</td>
            <td style="padding: 7px; text-align: center; font-weight: 800;">${s.name} ${isMe ? '⭐(我)' : ''}</td>
            <td style="padding: 7px; text-align: center;"><span style="color:#2563EB;font-weight:800;font-size:12px;">${rowWkTitle}</span></td>
            <td style="padding: 7px; text-align: center; font-weight: 900; color: #0284C7; font-size: 14.5px;">⏱️ ${s.bestTime.toFixed(2)}s</td>
            <td style="padding: 7px; text-align: center; color: #64748B; font-size: 12px;">${s.rawTime.toFixed(2)}s</td>
            <td style="padding: 7px; text-align: center; font-weight: 800; color: ${s.accuracy >= 95 ? '#059669' : (s.accuracy >= 80 ? '#2563EB' : '#DC2626')};">${s.accuracy}%</td>
            <td style="padding: 7px; text-align: center; color: ${s.accPenalty > 0 ? '#EF4444' : '#059669'}; font-weight: 700; font-size: 12px;">${s.accPenalty > 0 ? '+' : ''}${s.accPenalty.toFixed(2)}s</td>
            <td style="padding: 7px; text-align: center; font-weight: 800; color: #D97706;">${s.cpm} 字/分</td>
            <td style="padding: 7px; text-align: center; font-size: 11px; font-weight: 800; color: #7C3AED;">${s.tier}</td>
          </tr>
        `;
      }).join('');

      tbody.innerHTML = rowsHtml;
    }
    // 頁面載入時依日期自動初始化手速字庫下拉選單與排行榜篩選器
    window.addEventListener('DOMContentLoaded', () => {
      initSpeedWeekDropdown();
    });
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      try { initSpeedWeekDropdown(); } catch(e) {}
    }