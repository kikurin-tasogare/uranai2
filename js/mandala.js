/* ============================================================
   mandala.js — 占曼荼羅(七流派・横断鑑定)
   各占術ページと同じ計算法のコンパクト版で、
   七つの「あなた」を一枚の曼荼羅に描く。
   ============================================================ */

(() => {
  /* ---------- 宿曜(二十七宿) ---------- */
  const NAK27 = ["昴宿","畢宿","觜宿","参宿","井宿","鬼宿","柳宿","星宿","張宿","翼宿","軫宿","角宿","亢宿","氐宿","房宿","心宿","尾宿","箕宿","斗宿","女宿","虚宿","危宿","室宿","壁宿","奎宿","婁宿","胃宿"];
  const NAK_KEY = ["気品と光彩","堅実と蓄え","言葉と知恵","豪胆と開拓","探究と理知","無邪気と天啓","情熱と勝負気","孤高と大成","陽気と人望","飛翔と理想","静謐と実務","社交と華","気骨と正道","度量と根気","福徳と気前","愛嬌と人心","一途と底力","豪放と自由","大志と器量","勤勉と誠","感性と幽玄","才気と波乱","闘志と気迫","誠実と学芸","文才と品行","世渡りと才覚","胆力と一番槍"];
  const MSTART = { 1: 22, 2: 24, 3: 26, 4: 1, 5: 3, 6: 5, 7: 8, 8: 11, 9: 13, 10: 15, 11: 18, 12: 20 };

  /* ---------- 四柱推命(日主) ---------- */
  const STEM_TAG = ["大樹","草花","太陽","灯火","山岳","田畑","鋼鉄","宝石","大河","雨露"];

  /* ---------- 西洋占星術(十二星座) ---------- */
  const SIGNS = ["♈牡羊座","♉牡牛座","♊双子座","♋蟹座","♌獅子座","♍乙女座","♎天秤座","♏蠍座","♐射手座","♑山羊座","♒水瓶座","♓魚座"];
  const SIGN_KEY = ["開拓の熱","五感の確かさ","知の翼","情の深さ","王の華","完璧への愛","調和の美","底なしの一途","自由の矢","登頂の執念","革新の風","溶ける共感"];

  /* ---------- マヤ暦(二十紋章) ---------- */
  const SEALS = ["イミシュ","イク","アクバル","カン","チクチャン","キミ","マニク","ラマト","ムルク","オク","チュエン","エブ","ベン","イーシュ","メン","キーブ","カバン","エツナブ","カウアク","アハウ"];
  const SEAL_KEY = ["原初の水","風の便り","夜の夢見","眠れる種","蛇の生命力","再生の扉","癒やしの手","豊穣の星","感情の月","忠実な心","遊びの創造","歩む道","支える柱","森の王","鷲の眼","古の知恵","動く大地","真実の鏡","恵みの嵐","太陽の完成"];

  /* ---------- インド占星術(ナクシャトラ) ---------- */
  const NAKSHATRA = ["アシュヴィニー","バラニー","クリッティカー","ローヒニー","ムリガシラー","アールドラー","プナルヴァス","プシュヤ","アーシュレーシャー","マガー","プールヴァ・パールグニー","ウッタラ・パールグニー","ハスタ","チトラー","スヴァーティー","ヴィシャーカー","アヌラーダー","ジェーシュター","ムーラ","プールヴァ・アーシャーダー","ウッタラ・アーシャーダー","シュラヴァナ","ダニシュター","シャタビシャー","プールヴァ・バードラパダー","ウッタラ・バードラパダー","レーヴァティー"];

  /* ---------- 紫微斗数(十四主星) ---------- */
  const NAYIN_ELEM = ["金","火","木","土","金","火","水","土","金","木","水","土","火","木","水","金","火","木","土","金","火","水","土","金","木","水","土","火","木","水"];
  const KYOKU = { "水": 2, "木": 3, "金": 4, "土": 5, "火": 6 };
  const STAR_TAG = { "紫微": "帝王", "天機": "軍師", "太陽": "博愛", "武曲": "剛毅", "天同": "福徳", "廉貞": "変革", "天府": "財庫", "太陰": "月光", "貪狼": "桃花", "巨門": "弁舌", "天相": "宰相", "天梁": "長老", "七殺": "将軍", "破軍": "開拓" };

  function shibiMainStars(p, k) {
    let hourIdx = 0;
    if (p.timeKnown) {
      const corr = Almanac.trueSolarOffsetMin(p.y, p.m, p.d, p.lon);
      const totalMin = ((p.hh * 60 + p.mi + Math.round(corr)) % 1440 + 1440) % 1440;
      hourIdx = Math.floor(((totalMin + 60) % 1440) / 120);
    }
    const monthPalace = (2 + (k.month - 1)) % 12;
    const meigu = ((monthPalace - hourIdx) % 12 + 12) % 12;
    const birth = Almanac.jst(p.y, p.m, p.d, p.hh, p.mi);
    const gy = birth < Almanac.risshun(p.y) ? p.y - 1 : p.y;
    const yearStem = ((gy - 4) % 10 + 10) % 10;
    const meiguStem = (((yearStem % 5) * 2 + 2) + ((meigu - 2) % 12 + 12) % 12) % 10;
    const k60 = ((6 * meiguStem - 5 * meigu) % 60 + 60) % 60;
    const g = KYOKU[NAYIN_ELEM[Math.floor(k60 / 2)]];
    const q = Math.ceil(k.day / g), r = q * g - k.day;
    const ziwei = (((r % 2 === 0 ? 2 + (q - 1) + r : 2 + (q - 1) - r) % 12) + 12) % 12;
    const tianfu = ((16 - ziwei) % 12 + 12) % 12;
    const pos = {
      "紫微": ziwei, "天機": ziwei - 1, "太陽": ziwei - 3, "武曲": ziwei - 4, "天同": ziwei - 5, "廉貞": ziwei - 8,
      "天府": tianfu, "太陰": tianfu + 1, "貪狼": tianfu + 2, "巨門": tianfu + 3, "天相": tianfu + 4,
      "天梁": tianfu + 5, "七殺": tianfu + 6, "破軍": tianfu + 10,
    };
    let stars = Object.entries(pos).filter(([, i]) => ((i % 12) + 12) % 12 === meigu).map(([n]) => n);
    if (!stars.length) stars = Object.entries(pos).filter(([, i]) => ((i % 12) + 12) % 12 === (meigu + 6) % 12).map(([n]) => n);
    return stars;
  }

  /* ---------- 易経(いまの卦) ---------- */
  const TRIGRAM = { "111": "天", "110": "沢", "101": "火", "100": "雷", "011": "風", "010": "水", "001": "山", "000": "地" };
  const KING_WEN = { "天|天":1,"地|地":2,"水|雷":3,"山|水":4,"水|天":5,"天|水":6,"地|水":7,"水|地":8,"風|天":9,"天|沢":10,"地|天":11,"天|地":12,"天|火":13,"火|天":14,"地|山":15,"雷|地":16,"沢|雷":17,"山|風":18,"地|沢":19,"風|地":20,"火|雷":21,"山|火":22,"山|地":23,"地|雷":24,"天|雷":25,"山|天":26,"山|雷":27,"沢|風":28,"水|水":29,"火|火":30,"沢|山":31,"雷|風":32,"天|山":33,"雷|天":34,"火|地":35,"地|火":36,"風|火":37,"火|沢":38,"水|山":39,"雷|水":40,"山|沢":41,"風|雷":42,"沢|天":43,"天|風":44,"沢|地":45,"地|風":46,"沢|水":47,"水|風":48,"沢|火":49,"火|風":50,"雷|雷":51,"山|山":52,"風|山":53,"雷|沢":54,"雷|火":55,"火|山":56,"風|風":57,"沢|沢":58,"風|水":59,"水|沢":60,"風|沢":61,"雷|山":62,"水|火":63,"火|水":64 };
  const HEX_NAME = { 1:"乾為天",2:"坤為地",3:"水雷屯",4:"山水蒙",5:"水天需",6:"天水訟",7:"地水師",8:"水地比",9:"風天小畜",10:"天沢履",11:"地天泰",12:"天地否",13:"天火同人",14:"火天大有",15:"地山謙",16:"雷地予",17:"沢雷随",18:"山風蠱",19:"地沢臨",20:"風地観",21:"火雷噬嗑",22:"山火賁",23:"山地剥",24:"地雷復",25:"天雷无妄",26:"山天大畜",27:"山雷頤",28:"沢風大過",29:"坎為水",30:"離為火",31:"沢山咸",32:"雷風恒",33:"天山遯",34:"雷天大壮",35:"火地晋",36:"地火明夷",37:"風火家人",38:"火沢睽",39:"水山蹇",40:"雷水解",41:"山沢損",42:"風雷益",43:"沢天夬",44:"天風姤",45:"沢地萃",46:"地風升",47:"沢水困",48:"水風井",49:"沢火革",50:"火風鼎",51:"震為雷",52:"艮為山",53:"風山漸",54:"雷沢帰妹",55:"雷火豊",56:"火山旅",57:"巽為風",58:"兌為沢",59:"風水渙",60:"水沢節",61:"風沢中孚",62:"雷山小過",63:"水火既済",64:"火水未済" };
  const HEX_KEY = { 1:"剛健な創造",2:"受容と包容",3:"産みの苦しみ",4:"学びの始まり",5:"待つ時",6:"争いの兆し",7:"戦いの統率",8:"親しみ結ぶ",9:"小さな蓄え",10:"虎の尾を踏む",11:"天地泰平",12:"塞がりの時",13:"志を同じくする",14:"大いなる所有",15:"謙虚の徳",16:"喜びの予感",17:"従い随う",18:"腐敗を正す",19:"臨む好機",20:"観る時",21:"噛み砕く",22:"飾りの美",23:"剥がれ落ちる",24:"一陽来復",25:"無心自然",26:"大きな蓄え",27:"養いの道",28:"重荷の時",29:"険難重なる",30:"輝きつく",31:"感応の兆し",32:"恒常の道",33:"退く知恵",34:"盛んな勢い",35:"昇る朝日",36:"光を隠す",37:"家の和",38:"背き合う",39:"行き悩む",40:"解ける時",41:"損して得取る",42:"益される時",43:"決断の時",44:"思わぬ出会い",45:"集まる時",46:"昇り進む",47:"困窮の時",48:"汲めど尽きぬ井戸",49:"改革の時",50:"新を煮る鼎",51:"震え動く",52:"止まる山",53:"漸く進む",54:"順を誤る",55:"豊かの極み",56:"旅の身",57:"風のように従う",58:"喜び交わす",59:"散らして開く",60:"節度の徳",61:"まことの心",62:"小さく過ぎる",63:"完成の後",64:"未完の希望" };

  function castNow() {
    const buf = new Uint8Array(6);
    crypto.getRandomValues(buf);
    const bits = [...buf].map(b => (b % 2 === 0 ? "1" : "0"));
    const lower = TRIGRAM[bits.slice(0, 3).join("")];
    const upper = TRIGRAM[bits.slice(3, 6).join("")];
    return KING_WEN[`${upper}|${lower}`];
  }

  /* ---------- 曼荼羅の描画 ---------- */
  function nodeText(value) {
    // 長い名前は縮小・分割して円に収める
    if (value.length > 9 && value.includes("・")) {
      const i = value.indexOf("・");
      return { lines: [value.slice(0, i + 1), value.slice(i + 1)], size: 9 };
    }
    if (value.length > 9) return { lines: [value.slice(0, Math.ceil(value.length / 2)), value.slice(Math.ceil(value.length / 2))], size: 9 };
    if (value.length > 6) return { lines: [value], size: 10.5 };
    return { lines: [value], size: 13.5 };
  }

  function divine(p) {
    const area = document.getElementById("result-area");
    let k;
    try { k = Almanac.kyureki(p.y, p.m, p.d); }
    catch (e) { area.innerHTML = `<div class="result"><p>計算に失敗しました: ${Uranai.esc(e.message)}</p></div>`; return; }

    const birth = Almanac.jst(p.y, p.m, p.d, p.hh, p.mi);

    // 1. 宿曜
    const nakIdx = (MSTART[k.month] + k.day - 1) % 27;
    // 2. 四柱(日主)
    const dayStem = Almanac.dayKanshi(p.y, p.m, p.d) % 10;
    // 3. 西洋(太陽星座)
    const sunLon = Almanac.planetLon("Sun", birth);
    const sunSign = Math.floor(((sunLon % 360) + 360) % 360 / 30);
    // 4. マヤ(KIN)
    const days = Almanac.jdn(p.y, p.m, p.d) - 584283;
    const seal = ((days + 19) % 20 + 20) % 20;
    const tone = ((days + 3) % 13 + 13) % 13 + 1;
    // 5. インド(ナクシャトラ)
    const jd = birth.getTime() / 86400000 + 2440587.5;
    const ay = 23.853 + (jd - 2451545.0) / 365.25 * (50.29 / 3600);
    const moonSid = ((Almanac.moonLon(birth) - ay) % 360 + 360) % 360;
    const jNak = Math.floor(moonSid / (360 / 27));
    // 6. 紫微斗数(命宮主星)
    const shibi = shibiMainStars(p, k);
    // 7. 易経(いまの卦)
    const hex = castNow();

    const NODES = [
      { label: "宿曜", value: NAK27[nakIdx], key: NAK_KEY[nakIdx], href: "sukuyo.html" },
      { label: "四柱推命", value: STEMS_J[dayStem], key: STEM_TAG[dayStem] + "の人", href: "shichusuimei.html" },
      { label: "西洋占星術", value: SIGNS[sunSign], key: SIGN_KEY[sunSign], href: "astrology.html" },
      { label: "マヤ暦", value: `KIN${kinNumber(seal, tone)}`, key: SEALS[seal] + "・" + SEAL_KEY[seal], href: "maya.html" },
      { label: "インド占星術", value: NAKSHATRA[jNak], key: "月の宿", href: "jyotish.html" },
      { label: "紫微斗数", value: shibi.join("・"), key: shibi.map(s => STAR_TAG[s]).join("と") + "の宮", href: "shibi.html" },
      { label: "易経(いま)", value: HEX_NAME[hex], key: HEX_KEY[hex], href: "ekikyo.html" },
    ];

    // SVG曼荼羅
    const cx = 210, cy = 210, R = 145, r = 47;
    let svgNodes = "", svgLines = "";
    NODES.forEach((n, i) => {
      const ang = (-90 + i * (360 / 7)) * Math.PI / 180;
      const x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang);
      svgLines += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#24463c" stroke-dasharray="2 4"/>`;
      const t = nodeText(n.value);
      const valueLines = t.lines.map((ln, li) =>
        `<text x="${x.toFixed(1)}" y="${(y - 2 + li * (t.size + 1) - (t.lines.length - 1) * (t.size / 2)).toFixed(1)}" text-anchor="middle" fill="#93e6c3" font-size="${t.size}" font-weight="600">${ln}</text>`).join("");
      svgNodes += `<a href="${n.href}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#0f231d" stroke="#3c8f6e"/>
        <text x="${x.toFixed(1)}" y="${(y - 22).toFixed(1)}" text-anchor="middle" fill="#8fada1" font-size="8.5" letter-spacing="1">${n.label}</text>
        ${valueLines}
        <text x="${x.toFixed(1)}" y="${(y + 26).toFixed(1)}" text-anchor="middle" fill="#ef93bd" font-size="8">${n.key.length > 12 ? n.key.slice(0, 12) : n.key}</text>
      </a>`;
    });

    const svg = `
      <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg" style="width:100%; max-width:520px; display:block; margin:0 auto;" font-family="serif">
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#24463c"/>
        <circle cx="${cx}" cy="${cy}" r="${R - 55}" fill="none" stroke="#24463c" stroke-dasharray="3 6"/>
        ${svgLines}
        <circle cx="${cx}" cy="${cy}" r="52" fill="#153029" stroke="#5fbf9a"/>
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#93e6c3" font-size="15" letter-spacing="2">${Uranai.esc(p.name).slice(0, 8)}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="#8fada1" font-size="9">${p.y}.${p.m}.${p.d}</text>
        ${svgNodes}
      </svg>`;

    const rows = NODES.map(n => `
      <div class="planet-row">
        <span class="p-name" style="width:7.5em;">${n.label}</span>
        <span class="p-sign" style="width:auto; min-width:7em;">${n.value}</span>
        <span class="p-deg">${n.key}</span>
        <a href="${n.href}" style="font-size:11.5px; margin-left:auto;">くわしく観る →</a>
      </div>`).join("");

    area.innerHTML = `
      <div class="result">
        <div class="result-head"><div class="for">${Uranai.esc(p.name)} の曼荼羅</div></div>
        <div class="result-main" style="padding:26px 8px 20px;">
          ${svg}
          <p class="dim" style="font-size:11.5px; margin-top:10px;">それぞれの円をタップすると、その占術の本鑑定へ飛べます。</p>
        </div>
        <div class="result-block">
          <h3>七つの流儀が観たあなた</h3>
          ${rows}
          <p class="dim" style="margin-top:12px;">七つの文明は互いを知らないまま、同じ一日に生まれたあなたを別々の言葉で言い当てようとしました。重なるところが、あなたの芯。矛盾するところは、あなたの奥行きです。</p>
        </div>
      </div>
    `;
    area.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // KIN番号(紋章と音から260周期内の位置)
  function kinNumber(seal, tone) {
    let kin = seal + 1;
    while ((kin - 1) % 13 + 1 !== tone) kin += 20;
    return kin;
  }

  const STEMS_J = Almanac.STEMS;

  Uranai.renderForm(
    document.getElementById("form-area"),
    { timeNote: "時刻が分かると紫微斗数などの精度が上がります", placeNote: "真太陽時の補正に使います" },
    divine
  );
  Uranai.initTabs();
})();
