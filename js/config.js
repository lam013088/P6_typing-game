/**
 * =========================================================================
 * ⚙️ CONFIG.JS - 系統全域設定、段位與技能樹常數
 * 🤖 AI 迭代維護指南：
 *    - GAS_WEBHOOK_URL：更換 Google Apps Script Webhook 網址
 *    - GITHUB_PRIVACY_MODE：發布至 GitHub 時設為 true (去識別化純學號)
 *    - SPEED_WEEK_SCHEDULES：每週更換開放排程區間
 * =========================================================================
 */

const CONFIG = {
  // ⚡ Google Webhook 端點 (支援跨電腦即時連動，留空或未設定時自動回退本機單機模式)
  GAS_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbwxj19pHessAM78xDpVijGi8e6LwSKg8eTt5dJ8iNsjMWzexmoyfshCwp-Rj_eGmQA2/exec',
  // 隱私保護模式：GitHub 公開版強制隱藏姓名，僅展示「班別 學號號」
  GITHUB_PRIVACY_MODE: true,
  // 系統版本識別碼
  VERSION: '2026.09.30-modular-v1.0'
};

// 🌟 段位稱號門檻對照表 (0 ~ 5,000分以上)
const TIERS = [
  { min: 0, title: "新手訓練家", badge: "🥉", color: "#B45309", bg: "#FEF3C7" },
  { min: 50, title: "見習訓練家", badge: "🥈", color: "#475569", bg: "#F1F5F9" },
  { min: 150, title: "原野遊俠", badge: "🥇", color: "#1D4ED8", bg: "#EFF6FF" },
  { min: 300, title: "道館館主", badge: "⚡", color: "#7C3AED", bg: "#F5F3FF" },
  { min: 600, title: "四大天王", badge: "🔥", color: "#C2410C", bg: "#FFF7ED" },
  { min: 1200, title: "聯盟冠軍", badge: "🏆", color: "#B91C1C", bg: "#FEF2F2" },
  { min: 2500, title: "傳奇大師", badge: "👑", color: "#047857", bg: "#ECFDF5" },
  { min: 5000, title: "神域至尊", badge: "🌌", color: "#4C1D95", bg: "#F3E8FF" }
];

// ⚔️ 5大解鎖技能樹
const SKILLS = [
  { id: "focus", name: "精準直覺", desc: "戰鬥開局 25% 概率感應正確精靈球，令其發出神聖光暈！", reqPts: 200, rate: 0.25 },
  { id: "shield", name: "聖盾防護", desc: "捕捉錯誤時 35% 概率格擋失誤，保留當前連擊！", reqPts: 450, rate: 0.35 },
  { id: "crit", name: "烈焰爆擊", desc: "成功通關時 30% 概率觸發爆擊，額外獲得 +5 點傷害分！", reqPts: 800, rate: 0.30 },
  { id: "chain", name: "極限連擊", desc: "連擊達 2 Hit 以上時，每次命中額外獎勵 +3 點連擊分！", reqPts: 1500, rate: 0.50 },
  { id: "divine", name: "神域天罰", desc: "擊破魔王時 20% 概率降下九天神雷，額外獎勵 +10 分！", reqPts: 3000, rate: 0.20 }
];

// 📅 每周排程時間表 (2026/2027學年上學期)
const SPEED_WEEK_SCHEDULES = [
  { week: 'w2', name: '第 2 周', title: '【第2周】字根複合與首尾特訓 (9/7 - 9/13)', start: new Date('2026-09-07T00:00:00+08:00'), end: new Date('2026-09-13T23:59:59+08:00') },
  { week: 'w3', name: '第 3 周', title: '【第 3 周】難字與分體字高頻特訓 (9/14 - 9/20)', start: new Date('2026-09-14T00:00:00+08:00'), end: new Date('2026-09-20T23:59:59+08:00') },
  { week: 'w4', name: '第 4 周', title: '【第 4 周】期初實力排位激戰 (9/21 - 9/27)', start: new Date('2026-09-21T00:00:00+08:00'), end: new Date('2026-09-27T23:59:59+08:00') },
  { week: 'w5', name: '第 5 周', title: '【第 5 周】手速極限突破爭霸 (9/28 - 10/04)', start: new Date('2026-09-28T00:00:00+08:00'), end: new Date('2026-10-04T23:59:59+08:00') }
];
