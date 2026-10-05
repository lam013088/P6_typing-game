/**
 * =========================================================================
 * 📦 DATA.JS - 六年級倉頡打字【GitHub 公開安全版 · 方案 A】
 * 🛡️ 隱私安全承諾 (Zero-PII & Zero-Leakage)：
 *    - 本檔案公開於 GitHub，完全不包含任何學生真實成績數據與全級名冊！
 *    - 完全不包含未來週次的功課題庫與標準答案！
 *    - 網頁啟動時會透過 Webhook 自動向老師的 Google 試算表同步最新天梯戰況。
 *    - 本檔案僅保留離線單機備用之基本字根字典與示範題庫，確保離線不崩潰。
 * =========================================================================
 */

const DATA = {
  "benchmark_leaderboard": [],
  "top40": [],
  "class_top10": {},
  "perfect_students": {},
  "roster": {},
  "tiers_config": [],
  "cangjie_clean_letters": [
    {
      "code": "日",
      "key": "A",
      "category": "哲理類",
      "aux": "日、曰",
      "examples": "明、早、最、星、普"
    },
    {
      "code": "月",
      "key": "B",
      "category": "哲理類",
      "aux": "月、爫、夕、冂、冖",
      "examples": "朋、受、同、名、然、采"
    },
    {
      "code": "金",
      "key": "C",
      "category": "哲理類",
      "aux": "金、八、丷、儿",
      "examples": "錯、分、益、兒、公、曾"
    },
    {
      "code": "木",
      "key": "D",
      "category": "哲理類",
      "aux": "木、寸、才、十",
      "examples": "李、村、材、導、柴"
    },
    {
      "code": "水",
      "key": "E",
      "category": "哲理類",
      "aux": "水、氵、又、氺",
      "examples": "冰、江、友、取、求、泉"
    },
    {
      "code": "火",
      "key": "F",
      "category": "哲理類",
      "aux": "火、灬、⺌、小",
      "examples": "伙、焦、堂、尖、炎、照"
    },
    {
      "code": "土",
      "key": "G",
      "category": "哲理類",
      "aux": "土、士",
      "examples": "地、吉、志、社、城"
    },
    {
      "code": "竹",
      "key": "H",
      "category": "筆畫類",
      "aux": "竹、丿、⺮",
      "examples": "竹、笑、自、白、生、毛"
    },
    {
      "code": "戈",
      "key": "I",
      "category": "筆畫類",
      "aux": "戈、丶、厶、广",
      "examples": "找、主、台、府、應、底"
    },
    {
      "code": "十",
      "key": "J",
      "category": "筆畫類",
      "aux": "十、宀、穴",
      "examples": "汁、安、空、家、針、究"
    },
    {
      "code": "大",
      "key": "K",
      "category": "筆畫類",
      "aux": "大、乂、ナ、疒、犭",
      "examples": "天、病、左、狗、痛、猛"
    },
    {
      "code": "中",
      "key": "L",
      "category": "筆畫類",
      "aux": "中、丨、亅、川、衤",
      "examples": "巾、川、被、初、申、州"
    },
    {
      "code": "一",
      "key": "M",
      "category": "筆畫類",
      "aux": "一、厂、工、刁",
      "examples": "旦、原、巧、石、可、刁"
    },
    {
      "code": "弓",
      "key": "N",
      "category": "筆畫類",
      "aux": "弓、フ、勹、ク、乙、ㄋ、⺄",
      "examples": "引、句、包、乙、乃、風、弱"
    },
    {
      "code": "人",
      "key": "O",
      "category": "人體類",
      "aux": "人、亻、入、𠆢",
      "examples": "你、他、合、內、全、休"
    },
    {
      "code": "心",
      "key": "P",
      "category": "人體類",
      "aux": "心、忄、匕、七",
      "examples": "快、情、北、七、化、怨"
    },
    {
      "code": "手",
      "key": "Q",
      "category": "人體類",
      "aux": "手、扌、龵",
      "examples": "打、提、拜、看、拳、持"
    },
    {
      "code": "口",
      "key": "R",
      "category": "人體類",
      "aux": "口",
      "examples": "唱、叫、品、器、味、台"
    },
    {
      "code": "尸",
      "key": "S",
      "category": "字形類",
      "aux": "尸、コ、匚、阝、卩",
      "examples": "居、局、區、巨、都、節"
    },
    {
      "code": "廿",
      "key": "T",
      "category": "字形類",
      "aux": "廿、艹、龷",
      "examples": "花、草、共、黃、茶、英"
    },
    {
      "code": "山",
      "key": "U",
      "category": "字形類",
      "aux": "山、凵、屮、乚",
      "examples": "出、歲、凶、幽、逆、岳"
    },
    {
      "code": "女",
      "key": "V",
      "category": "字形類",
      "aux": "女、ㄑ、巛",
      "examples": "好、如、巡、巢、委、妹"
    },
    {
      "code": "田",
      "key": "W",
      "category": "字形類",
      "aux": "田、毌",
      "examples": "男、畏、果、思、甲、申、貫"
    },
    {
      "code": "卜",
      "key": "Y",
      "category": "字形類",
      "aux": "卜、亠、辶、冫",
      "examples": "外、高、這、道、冰、交"
    },
    {
      "code": "難",
      "key": "X",
      "category": "特殊類",
      "aux": "難字專用鍵",
      "examples": "身、慶、龜、鹿、兼"
    }
  ],
  "pokemon_pool": [
    {
      "id": 25,
      "name": "皮卡丘",
      "tag": "⚡ 電氣",
      "icon": "⚡",
      "color": "#FEF08A",
      "border": "#FACC15",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
    },
    {
      "id": 4,
      "name": "小火龍",
      "tag": "🔥 火焰",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#FB923C",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png"
    },
    {
      "id": 1,
      "name": "妙蛙種子",
      "tag": "🍃 草系",
      "icon": "🍃",
      "color": "#DCFCE7",
      "border": "#4ADE80",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
    },
    {
      "id": 7,
      "name": "傑尼龜",
      "tag": "💧 水系",
      "icon": "💧",
      "color": "#E0F2FE",
      "border": "#38BDF8",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png"
    },
    {
      "id": 6,
      "name": "噴火龍",
      "tag": "🔥 飛火",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#EA580C",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
    },
    {
      "id": 9,
      "name": "水箭龜",
      "tag": "💧 巨浪",
      "icon": "💧",
      "color": "#E0F2FE",
      "border": "#0284C7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png"
    },
    {
      "id": 26,
      "name": "雷丘",
      "tag": "⚡ 雷霆",
      "icon": "⚡",
      "color": "#FEF9C3",
      "border": "#EAB308",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png"
    },
    {
      "id": 35,
      "name": "皮皮",
      "tag": "✨ 妖精",
      "icon": "✨",
      "color": "#FCE7F3",
      "border": "#F472B6",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png"
    },
    {
      "id": 37,
      "name": "六尾",
      "tag": "🔥 狐火",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#F97316",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png"
    },
    {
      "id": 38,
      "name": "九尾",
      "tag": "🔥 幻火",
      "icon": "🔥",
      "color": "#FEF3C7",
      "border": "#F59E0B",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png"
    },
    {
      "id": 39,
      "name": "胖丁",
      "tag": "🎵 音律",
      "icon": "🎵",
      "color": "#FCE7F3",
      "border": "#EC4899",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png"
    },
    {
      "id": 52,
      "name": "喵喵",
      "tag": "💰 聚寶",
      "icon": "💰",
      "color": "#FFF7ED",
      "border": "#FDBA74",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png"
    },
    {
      "id": 54,
      "name": "可達鴨",
      "tag": "🧠 念力",
      "icon": "🧠",
      "color": "#FEF9C3",
      "border": "#FACC15",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png"
    },
    {
      "id": 58,
      "name": "卡蒂狗",
      "tag": "🔥 忠勇",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#FB923C",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png"
    },
    {
      "id": 59,
      "name": "風速狗",
      "tag": "🔥 烈焰",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#EA580C",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png"
    },
    {
      "id": 65,
      "name": "胡地",
      "tag": "🔮 超能",
      "icon": "🔮",
      "color": "#FEF08A",
      "border": "#CA8A04",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png"
    },
    {
      "id": 68,
      "name": "怪力",
      "tag": "🥊 格鬥",
      "icon": "🥊",
      "color": "#E2E8F0",
      "border": "#64748B",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png"
    },
    {
      "id": 77,
      "name": "小火馬",
      "tag": "🔥 疾馳",
      "icon": "🔥",
      "color": "#FFF1F2",
      "border": "#FB7185",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/77.png"
    },
    {
      "id": 79,
      "name": "呆呆獸",
      "tag": "💤 悠閒",
      "icon": "💤",
      "color": "#FDF2F8",
      "border": "#F472B6",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png"
    },
    {
      "id": 94,
      "name": "耿鬼",
      "tag": "👻 幽靈",
      "icon": "👻",
      "color": "#F3E8FF",
      "border": "#9333EA",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
    },
    {
      "id": 130,
      "name": "暴鯉龍",
      "tag": "🌊 狂瀾",
      "icon": "🌊",
      "color": "#DBEAFE",
      "border": "#1D4ED8",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png"
    },
    {
      "id": 131,
      "name": "拉普拉斯",
      "tag": "❄️ 乘浪",
      "icon": "❄️",
      "color": "#E0F2FE",
      "border": "#0284C7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png"
    },
    {
      "id": 132,
      "name": "百變怪",
      "tag": "⭐ 變身",
      "icon": "⭐",
      "color": "#F5F3FF",
      "border": "#A855F7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png"
    },
    {
      "id": 133,
      "name": "伊布",
      "tag": "⭐ 潛力",
      "icon": "⭐",
      "color": "#FEF3C7",
      "border": "#F59E0B",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
    },
    {
      "id": 134,
      "name": "水伊布",
      "tag": "💧 水華",
      "icon": "💧",
      "color": "#E0F2FE",
      "border": "#06B6D4",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png"
    },
    {
      "id": 135,
      "name": "雷伊布",
      "tag": "⚡ 迅雷",
      "icon": "⚡",
      "color": "#FEF08A",
      "border": "#EAB308",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png"
    },
    {
      "id": 136,
      "name": "火伊布",
      "tag": "🔥 炎熱",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#EF4444",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png"
    },
    {
      "id": 143,
      "name": "卡比獸",
      "tag": "💤 泰山",
      "icon": "💤",
      "color": "#E2E8F0",
      "border": "#475569",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png"
    },
    {
      "id": 144,
      "name": "急凍鳥",
      "tag": "❄️ 冰風",
      "icon": "❄️",
      "color": "#E0F2FE",
      "border": "#38BDF8",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png"
    },
    {
      "id": 145,
      "name": "閃電鳥",
      "tag": "⚡ 雷鳴",
      "icon": "⚡",
      "color": "#FEF08A",
      "border": "#EAB308",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png"
    },
    {
      "id": 146,
      "name": "火焰鳥",
      "tag": "🔥 火羽",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#EA580C",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png"
    },
    {
      "id": 147,
      "name": "迷你龍",
      "tag": "🐉 龍裔",
      "icon": "🐉",
      "color": "#E0E7FF",
      "border": "#6366F1",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png"
    },
    {
      "id": 149,
      "name": "快龍",
      "tag": "🐉 龍威",
      "icon": "🐉",
      "color": "#FEF3C7",
      "border": "#F59E0B",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png"
    },
    {
      "id": 150,
      "name": "超夢",
      "tag": "🔮 絕頂",
      "icon": "🔮",
      "color": "#F3E8FF",
      "border": "#7C3AED",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
    },
    {
      "id": 151,
      "name": "夢幻",
      "tag": "✨ 傳奇",
      "icon": "✨",
      "color": "#FDF2F8",
      "border": "#F43F5E",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png"
    },
    {
      "id": 152,
      "name": "菊草葉",
      "tag": "🍃 香氣",
      "icon": "🍃",
      "color": "#DCFCE7",
      "border": "#22C55E",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png"
    },
    {
      "id": 155,
      "name": "火球鼠",
      "tag": "🔥 火花",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#F97316",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png"
    },
    {
      "id": 158,
      "name": "小鋸鱷",
      "tag": "💧 巨顎",
      "icon": "💧",
      "color": "#E0F2FE",
      "border": "#0284C7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png"
    },
    {
      "id": 172,
      "name": "皮丘",
      "tag": "⚡ 電氣",
      "icon": "⚡",
      "color": "#FEF08A",
      "border": "#FACC15",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/172.png"
    },
    {
      "id": 175,
      "name": "波克比",
      "tag": "🥚 幸運",
      "icon": "🥚",
      "color": "#FFFBEB",
      "border": "#FCD34D",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/175.png"
    },
    {
      "id": 179,
      "name": "咩利羊",
      "tag": "⚡ 棉絨",
      "icon": "⚡",
      "color": "#FEF9C3",
      "border": "#FACC15",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/179.png"
    },
    {
      "id": 183,
      "name": "瑪力露",
      "tag": "💧 水球",
      "icon": "💧",
      "color": "#DBEAFE",
      "border": "#3B82F6",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/183.png"
    },
    {
      "id": 196,
      "name": "太陽伊布",
      "tag": "🔮 晨曦",
      "icon": "🔮",
      "color": "#F3E8FF",
      "border": "#A855F7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png"
    },
    {
      "id": 197,
      "name": "月亮伊布",
      "tag": "🌙 月夜",
      "icon": "🌙",
      "color": "#F1F5F9",
      "border": "#334155",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png"
    },
    {
      "id": 202,
      "name": "果然翁",
      "tag": "🛡️ 反擊",
      "icon": "🛡️",
      "color": "#DBEAFE",
      "border": "#2563EB",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/202.png"
    },
    {
      "id": 246,
      "name": "由基拉",
      "tag": "🪨 岩石",
      "icon": "🪨",
      "color": "#ECFCCB",
      "border": "#65A30D",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/246.png"
    },
    {
      "id": 248,
      "name": "班基拉斯",
      "tag": "🪨 霸主",
      "icon": "🪨",
      "color": "#ECFCCB",
      "border": "#4D7C0F",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png"
    },
    {
      "id": 249,
      "name": "洛奇亞",
      "tag": "🌊 海神",
      "icon": "🌊",
      "color": "#EFF6FF",
      "border": "#1D4ED8",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png"
    },
    {
      "id": 250,
      "name": "鳳王",
      "tag": "🌈 彩虹",
      "icon": "🌈",
      "color": "#FEF2F2",
      "border": "#DC2626",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png"
    },
    {
      "id": 251,
      "name": "雪拉比",
      "tag": "🌲 森林",
      "icon": "🌲",
      "color": "#DCFCE7",
      "border": "#16A34A",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/251.png"
    },
    {
      "id": 252,
      "name": "木守宮",
      "tag": "🍃 拍擊",
      "icon": "🍃",
      "color": "#DCFCE7",
      "border": "#15803D",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/252.png"
    },
    {
      "id": 255,
      "name": "火稚雞",
      "tag": "🔥 暖心",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#EA580C",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/255.png"
    },
    {
      "id": 258,
      "name": "水躍魚",
      "tag": "💧 潮汐",
      "icon": "💧",
      "color": "#E0F2FE",
      "border": "#0284C7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png"
    },
    {
      "id": 280,
      "name": "拉魯拉絲",
      "tag": "✨ 感知",
      "icon": "✨",
      "color": "#ECFDF5",
      "border": "#059669",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/280.png"
    },
    {
      "id": 282,
      "name": "沙奈朵",
      "tag": "✨ 守護",
      "icon": "✨",
      "color": "#ECFDF5",
      "border": "#10B981",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png"
    },
    {
      "id": 300,
      "name": "向尾喵",
      "tag": "🐾 萌萌",
      "icon": "🐾",
      "color": "#FCE7F3",
      "border": "#F472B6",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/300.png"
    },
    {
      "id": 359,
      "name": "阿勃梭魯",
      "tag": "⚔️ 災難",
      "icon": "⚔️",
      "color": "#F8FAFC",
      "border": "#475569",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/359.png"
    },
    {
      "id": 384,
      "name": "烈空坐",
      "tag": "🐉 蒼空",
      "icon": "🐉",
      "color": "#DCFCE7",
      "border": "#047857",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png"
    },
    {
      "id": 385,
      "name": "基拉祈",
      "tag": "⭐ 願望",
      "icon": "⭐",
      "color": "#FEF9C3",
      "border": "#FACC15",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/385.png"
    },
    {
      "id": 387,
      "name": "草苗龜",
      "tag": "🍃 苗木",
      "icon": "🍃",
      "color": "#DCFCE7",
      "border": "#15803D",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/387.png"
    },
    {
      "id": 390,
      "name": "小火焰猴",
      "tag": "🔥 靈巧",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#EA580C",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/390.png"
    },
    {
      "id": 393,
      "name": "波加曼",
      "tag": "🐧 驕傲",
      "icon": "🐧",
      "color": "#E0E7FF",
      "border": "#6366F1",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/393.png"
    },
    {
      "id": 403,
      "name": "小貓怪",
      "tag": "⚡ 閃光",
      "icon": "⚡",
      "color": "#E0F2FE",
      "border": "#0284C7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/403.png"
    },
    {
      "id": 446,
      "name": "小卡比獸",
      "tag": "🍙 活力",
      "icon": "🍙",
      "color": "#ECFDF5",
      "border": "#059669",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/446.png"
    },
    {
      "id": 448,
      "name": "路卡利歐",
      "tag": "🥊 波導",
      "icon": "🥊",
      "color": "#E0F2FE",
      "border": "#2563EB",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png"
    },
    {
      "id": 470,
      "name": "葉伊布",
      "tag": "🍃 綠意",
      "icon": "🍃",
      "color": "#DCFCE7",
      "border": "#16A34A",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/470.png"
    },
    {
      "id": 471,
      "name": "冰伊布",
      "tag": "❄️ 霜雪",
      "icon": "❄️",
      "color": "#E0F2FE",
      "border": "#06B6D4",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/471.png"
    },
    {
      "id": 492,
      "name": "謝米",
      "tag": "🌸 感恩",
      "icon": "🌸",
      "color": "#F0FDF4",
      "border": "#22C55E",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/492.png"
    },
    {
      "id": 493,
      "name": "阿爾宙斯",
      "tag": "🌟 創世",
      "icon": "🌟",
      "color": "#FFFBEB",
      "border": "#D97706",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/493.png"
    },
    {
      "id": 495,
      "name": "藤藤蛇",
      "tag": "🍃 優雅",
      "icon": "🍃",
      "color": "#DCFCE7",
      "border": "#15803D",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/495.png"
    },
    {
      "id": 501,
      "name": "水水獺",
      "tag": "💧 扇貝",
      "icon": "💧",
      "color": "#E0F2FE",
      "border": "#0284C7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/501.png"
    },
    {
      "id": 570,
      "name": "索羅亞",
      "tag": "🦊 幻影",
      "icon": "🦊",
      "color": "#F1F5F9",
      "border": "#1E293B",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/570.png"
    },
    {
      "id": 571,
      "name": "索羅亞克",
      "tag": "🦊 魘幻",
      "icon": "🦊",
      "color": "#F1F5F9",
      "border": "#0F172A",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/571.png"
    },
    {
      "id": 653,
      "name": "火狐狸",
      "tag": "🔥 魔導",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#F97316",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/653.png"
    },
    {
      "id": 658,
      "name": "甲賀忍蛙",
      "tag": "🌊 飛水",
      "icon": "🌊",
      "color": "#DBEAFE",
      "border": "#1D4ED8",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png"
    },
    {
      "id": 700,
      "name": "仙子伊布",
      "tag": "🎀 曼妙",
      "icon": "🎀",
      "color": "#FDF2F8",
      "border": "#F472B6",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png"
    },
    {
      "id": 702,
      "name": "咚咚鼠",
      "tag": "⚡ 頰囊",
      "icon": "⚡",
      "color": "#FEF3C7",
      "border": "#F59E0B",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/702.png"
    },
    {
      "id": 719,
      "name": "蒂安希",
      "tag": "💎 晶瑩",
      "icon": "💎",
      "color": "#FDF2F8",
      "border": "#FB7185",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/719.png"
    },
    {
      "id": 722,
      "name": "木木梟",
      "tag": "🍃 飛葉",
      "icon": "🍃",
      "color": "#FEF3C7",
      "border": "#84CC16",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/722.png"
    },
    {
      "id": 778,
      "name": "謎擬Ｑ",
      "tag": "👻 謎裝",
      "icon": "👻",
      "color": "#FEFCE8",
      "border": "#CA8A04",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/778.png"
    },
    {
      "id": 802,
      "name": "瑪夏多",
      "tag": "🥊 暗影",
      "icon": "🥊",
      "color": "#F1F5F9",
      "border": "#334155",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/802.png"
    },
    {
      "id": 807,
      "name": "捷拉奧拉",
      "tag": "⚡ 疾雷",
      "icon": "⚡",
      "color": "#FEF9C3",
      "border": "#EAB308",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/807.png"
    },
    {
      "id": 810,
      "name": "敲音猴",
      "tag": "🥁 節拍",
      "icon": "🥁",
      "color": "#DCFCE7",
      "border": "#16A34A",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/810.png"
    },
    {
      "id": 813,
      "name": "炎兔兒",
      "tag": "🔥 蹴擊",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#EF4444",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/813.png"
    },
    {
      "id": 816,
      "name": "淚眼蜥",
      "tag": "💧 水狙",
      "icon": "💧",
      "color": "#E0F2FE",
      "border": "#0284C7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/816.png"
    },
    {
      "id": 888,
      "name": "蒼響",
      "tag": "⚔️ 劍聖",
      "icon": "⚔️",
      "color": "#DBEAFE",
      "border": "#2563EB",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/888.png"
    },
    {
      "id": 906,
      "name": "新葉喵",
      "tag": "🍃 花草",
      "icon": "🍃",
      "color": "#DCFCE7",
      "border": "#22C55E",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/906.png"
    },
    {
      "id": 909,
      "name": "呆火鱷",
      "tag": "🔥 歌唱",
      "icon": "🔥",
      "color": "#FFEDD5",
      "border": "#EA580C",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/909.png"
    },
    {
      "id": 912,
      "name": "潤水鴨",
      "tag": "💧 舞者",
      "icon": "💧",
      "color": "#E0F2FE",
      "border": "#0284C7",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/912.png"
    },
    {
      "id": 921,
      "name": "布撥",
      "tag": "⚡ 電氣",
      "icon": "⚡",
      "color": "#FEF3C7",
      "border": "#F97316",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/921.png"
    },
    {
      "id": 1008,
      "name": "密勒頓",
      "tag": "⚡ 未來",
      "icon": "⚡",
      "color": "#EDE9FE",
      "border": "#7C3AED",
      "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1008.png"
    }
  ],
  "connected_words": [
    {
      "char": "車",
      "codes": [
        "十",
        "田",
        "十"
      ],
      "keys": [
        "J",
        "W",
        "J"
      ],
      "full": "十田十 (JWJ)",
      "secret": "【連體字】全字取首二尾【十田十】。"
    },
    {
      "char": "重",
      "codes": [
        "竹",
        "十",
        "田",
        "土"
      ],
      "keys": [
        "H",
        "J",
        "W",
        "G"
      ],
      "full": "竹十田土 (HJWG)",
      "secret": "【連體字】全字取首二三尾【竹十田土】。"
    }
  ],
  "split_words": [
    {
      "char": "明",
      "codes": [
        "日",
        "月"
      ],
      "keys": [
        "A",
        "B"
      ],
      "full": "日月 (AB)",
      "secret": "【分體字】字首【日】，字身【月】。"
    },
    {
      "char": "聽",
      "codes": [
        "尸",
        "土",
        "十",
        "田",
        "心"
      ],
      "keys": [
        "S",
        "G",
        "J",
        "W",
        "P"
      ],
      "full": "尸土十田心 (SGJWP)",
      "secret": "【分體字】字首【尸土】，字身【十田心】。"
    }
  ],
  "special_words": [
    {
      "char": "鬼",
      "codes": [
        "竹",
        "戈"
      ],
      "keys": [
        "H",
        "I"
      ],
      "full": "竹戈 (HI)",
      "secret": "【複合字】「鬼」為三代倉頡九大複合字之一，固定取【竹(H)】＋【戈(I)】。"
    },
    {
      "char": "門",
      "codes": [
        "日",
        "弓"
      ],
      "keys": [
        "A",
        "N"
      ],
      "full": "日弓 (AN)",
      "secret": "【複合字】固定取【日(A)】＋【弓(N)】。"
    }
  ]
};

const MODE2_WEEKLY_BANKS = {
  "demo": {
    "key": "demo",
    "week": "demo",
    "weekName": "練習示範",
    "hwName": "基礎體驗",
    "title": "【練習示範】基礎字根熱身",
    "dateRange": "隨時開放",
    "startDate": "2026-09-01T00:00:00+08:00",
    "endDate": "2027-06-30T23:59:59+08:00",
    "words": [
      {
        "char": "明",
        "codes": [
          "日",
          "月"
        ],
        "keys": [
          "A",
          "B"
        ],
        "full": "日月 (AB)",
        "secret": "明：日月 (AB)"
      },
      {
        "char": "鬼",
        "codes": [
          "竹",
          "戈"
        ],
        "keys": [
          "H",
          "I"
        ],
        "full": "竹戈 (HI)",
        "secret": "鬼：竹戈 (HI) 【三代倉頡九大複合字之一】"
      },
      {
        "char": "車",
        "codes": [
          "十",
          "田",
          "十"
        ],
        "keys": [
          "J",
          "W",
          "J"
        ],
        "full": "十田十 (JWJ)",
        "secret": "車：十田十 (JWJ)"
      },
      {
        "char": "早",
        "codes": [
          "日",
          "十"
        ],
        "keys": [
          "A",
          "J"
        ],
        "full": "日十 (AJ)",
        "secret": "早：日十 (AJ)"
      },
      {
        "char": "森",
        "codes": [
          "木",
          "木",
          "木"
        ],
        "keys": [
          "D",
          "D",
          "D"
        ],
        "full": "木木木 (DDD)",
        "secret": "森：木木木 (DDD)"
      }
    ]
  }
};

// 啟動時對全題庫執行自動校驗與鍵位映射歸一化
(function sanitizeAllQuestionBanks() {
  try {
    if (typeof MODE2_WEEKLY_BANKS !== 'undefined') {
      Object.values(MODE2_WEEKLY_BANKS).forEach(b => {
        if (b && Array.isArray(b.words)) {
          b.words.forEach(w => {
            if (typeof autoDeriveWordKeys === 'function') autoDeriveWordKeys(w);
          });
        }
      });
    }
  } catch(e) {
    console.warn('字庫字根映射自動校準提醒:', e);
  }
})();
