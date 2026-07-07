/* ============================================================
   shichu.js — 四柱推命
   節入り(天文計算)で年柱・月柱、JDNで日柱、
   真太陽時で時柱を立て、日主・通変星・五行を読む。
   ============================================================ */

(() => {
  const STEMS = Almanac.STEMS, BRANCHES = Almanac.BRANCHES;
  const STEMS_YOMI = Almanac.STEMS_YOMI, BRANCHES_YOMI = Almanac.BRANCHES_YOMI;

  // 十干 → 五行(0木1火2土3金4水)/ 陰陽(true=陽)
  const stemElem = s => Math.floor(s / 2);
  const stemYang = s => s % 2 === 0;
  // 地支の本気蔵干(支 → 十干インデックス)
  const BRANCH_MAIN = { 0: 9, 1: 5, 2: 0, 3: 1, 4: 4, 5: 2, 6: 3, 7: 5, 8: 6, 9: 7, 10: 4, 11: 8 };
  const ELEMS = ["木", "火", "土", "金", "水"];
  const ELEM_COLOR = ["#4e8a5a", "#b34733", "#c9a24b", "#a8a29a", "#4a6d9e"];

  /* ---------- 日主(十干)の解釈 ---------- */
  const DAY_MASTER = [
    { sym: "大樹", text: "そびえ立つ一本の大樹。まっすぐ天に向かって伸びようとする、向上心と気骨の人です。曲がったことが嫌いで、一度根を張った場所では簡単に折れません。成長には時間がかかりますが、年輪を重ねるほどに風格を増し、やがて多くの人がその木陰に集まります。頑固さは玉に瑕――ときには風に枝をしならせる柔らかさを。" },
    { sym: "草花", text: "野に咲く草花、しなやかな蔓草。環境に合わせて姿を変えられる、柔軟さと社交性の人です。踏まれてもまた立ち上がる粘り強さは、大樹の甲よりむしろ上。人あたりが柔らかく、どんな場所にも根を下ろせます。ただし寄りかかる支柱は選ぶこと――誰に絡んで伸びるかで、咲く花の色が変わります。" },
    { sym: "太陽", text: "空にただ一つ輝く太陽。明るく開けっぴろげで、いるだけで場を照らす陽気の人です。細かいことにこだわらない大らかさと、分け隔てなく注がれる温かさが持ち味。隠しごとは苦手で、感情も顔に出ます。曇りの日があっても大丈夫――雲の上では、あなたはいつも変わらず燃えています。" },
    { sym: "灯火", text: "夜を照らす灯火、囲炉裏の焔。太陽のような派手さはなくとも、近くにいる人の心を温める繊細な火の人です。感受性が鋭く、芸術や人の機微に通じ、闇が深いほどその光は際立ちます。風に揺れやすいのが玉に瑕。あなたの火を絶やさぬ風よけ――安心できる場所と人を、大切にしてください。" },
    { sym: "山岳", text: "どっしりと動かぬ山。寡黙で忍耐強く、簡単には心を動かさない安定の人です。信頼は岩のように固く、頼られれば黙って背中を貸す度量があります。動きは遅くとも、積み上げたものは崩れません。ただ、山は自分からは動かないもの――チャンスの時だけは、自ら一歩踏み出す勇気を。" },
    { sym: "田畑", text: "作物を育てる田畑の土。面倒見がよく、人を育て、支えることに喜びを見出す滋養の人です。目立つことは苦手でも、あなたが耕した場所からは必ず何かが実ります。誰かのために動くうち、気づけば周囲があなたなしでは回らなくなっている――そんな静かな不可欠さが、あなたの勲章です。" },
    { sym: "鋼鉄", text: "鍛え抜かれた鋼、断ち切る刃。決断力と行動力に富み、白黒を明快につける鋼の人です。困難に打たれるほど強くなる、生まれながらの闘士。義理堅く、仲間のためなら火中の栗も拾います。切れ味が良すぎて、言葉が人を切ることも――刃は鞘に納めてこそ、名刀と呼ばれます。" },
    { sym: "宝石", text: "磨かれて輝く宝石。繊細な美意識と品格を備え、細部まで神経の行き届いた洗練の人です。感性が鋭く、批評眼は一級品。雑に扱われることを何より嫌い、自分にも他人にも高い水準を求めます。原石のままでは輝けないのが宝石の宿命――あなたを磨いてくれる環境と出会いを、恐れずに。" },
    { sym: "大河", text: "滔々と流れる大河、広い海。器が大きく、こだわりなく万物を呑み込んで流れる自由の人です。知恵が回り、行動は大胆。ひとところに留まることを嫌い、常に新しい流れを求めます。その奔放さは周囲には読みにくいもの――行き先だけは時々、岸辺の人に告げてあげてください。" },
    { sym: "雨露", text: "しとしとと降る雨、草木を潤す朝露。物静かで優しく、気づかぬうちに人の心へ染み込んでいく浸透の人です。知性はひそやかに深く、観察眼は水面のように澄んでいます。激流のような強さはなくとも、雨だれは石をも穿つ――静かな継続こそが、あなたの最強の武器です。" },
  ];

  /* ---------- 通変星 ---------- */
  const TSUHEN = {
    "比肩": "独立と自尊の星。人に頼らず自分の足で立つ力を示します。",
    "劫財": "野心と社交の星。表は柔らかく、内に強い競争心を秘めます。",
    "食神": "衣食と楽しみの星。おおらかな福分と、遊び心・食の縁を示します。",
    "傷官": "才気と美意識の星。鋭い感性は、芸術や専門技能で輝きます。",
    "偏財": "回転する財の星。人脈と商才、気前の良さがお金を呼びます。",
    "正財": "堅実な財の星。こつこつ築く信用と、誠実な蓄えを示します。",
    "偏官": "行動と侠気の星。じっとしていられない突破力を示します。",
    "正官": "名誉と規律の星。責任を果たし、社会に認められる力です。",
    "偏印": "探究と型破りの星。独自の知恵、副業や趣味の才を示します。",
    "印綬": "学問と庇護の星。知識を愛し、目上から引き立てられます。",
  };

  function tsuhen(dayStem, otherStem) {
    const diff = (stemElem(otherStem) - stemElem(dayStem) + 5) % 5;
    const same = stemYang(dayStem) === stemYang(otherStem);
    const table = [
      ["比肩", "劫財"], ["食神", "傷官"], ["偏財", "正財"], ["偏官", "正官"], ["偏印", "印綬"],
    ];
    return table[diff][same ? 0 : 1];
  }

  /* ---------- 五行バランスの寸評 ---------- */
  const ELEM_NOTE = {
    "木": "伸びる力・成長と創造",
    "火": "輝く力・情熱と表現",
    "土": "支える力・信用と安定",
    "金": "断つ力・決断と洗練",
    "水": "巡る力・知恵と柔軟",
  };

  /* ---------- 命式の計算 ---------- */
  function buildMeishiki(p) {
    // 出生日時(JST)
    const birth = Almanac.jst(p.y, p.m, p.d, p.hh, p.mi);

    // 年柱: 立春前は前年
    const ris = Almanac.risshun(p.y);
    const gy = birth < ris ? p.y - 1 : p.y;
    const yearStem = ((gy - 4) % 10 + 10) % 10;
    const yearBranch = ((gy - 4) % 12 + 12) % 12;

    // 月柱: 直前の節から月を決める(0=立春→寅月)
    const setsu = Almanac.lastSetsu(birth);
    const monthBranch = (setsu.index + 2) % 12; // 寅=2から
    const monthNum = setsu.index + 1;           // 寅月=1…丑月=12
    const monthStem = ((yearStem % 5) * 2 + 2 + (monthNum - 1)) % 10; // 五虎遁

    // 日柱(0時切り・JST暦日)
    const dayIdx = Almanac.dayKanshi(p.y, p.m, p.d);
    const dayStem = dayIdx % 10;
    const dayBranch = dayIdx % 12;

    // 時柱: 真太陽時で刻を判定(五鼠遁)
    let hourStem = null, hourBranch = null, tsCorrMin = null;
    if (p.timeKnown) {
      tsCorrMin = Almanac.trueSolarOffsetMin(p.y, p.m, p.d, p.lon);
      const totalMin = ((p.hh * 60 + p.mi + Math.round(tsCorrMin)) % 1440 + 1440) % 1440;
      hourBranch = Math.floor(((totalMin + 60) % 1440) / 120);
      hourStem = ((dayStem % 5) * 2 + hourBranch) % 10;
    }

    return { birth, setsu, gy, yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch, tsCorrMin };
  }

  /* ---------- 大運(10年ごとの運気) ---------- */
  // 陽年干×男・陰年干×女 → 順行 / それ以外 → 逆行
  function buildDaiun(p, ms) {
    if (!p.sex) return null;
    const yang = ms.yearStem % 2 === 0;
    const forward = (yang && p.sex === "M") || (!yang && p.sex === "F");

    // 立運: 生まれてから次の節まで(順行)/ 前の節から生まれるまで(逆行)の日数 ÷ 3
    let boundary;
    if (forward) {
      const nextLon = Almanac.SETSU_LON[(ms.setsu.index + 1) % 12];
      boundary = Almanac.searchSunLon(nextLon, ms.birth, 40);
    } else {
      boundary = ms.setsu.time;
    }
    const days = Math.abs(ms.birth - boundary) / 86400000;
    const startAge = Math.max(1, Math.round(days / 3));

    // 月柱の六十干支番号から順/逆に進める
    const monthIdx = ((6 * ms.monthStem - 5 * ms.monthBranch) % 60 + 60) % 60;
    const list = [];
    for (let i = 1; i <= 8; i++) {
      const idx = ((monthIdx + (forward ? i : -i)) % 60 + 60) % 60;
      list.push({
        from: startAge + (i - 1) * 10,
        to: startAge + i * 10 - 1,
        stem: idx % 10,
        branch: idx % 12,
        tsuhen: tsuhen(ms.dayStem, idx % 10),
      });
    }
    return { forward, startAge, list };
  }

  /* ---------- 描画 ---------- */
  function kanshiCell(stem, branch, tsuhenName) {
    if (stem === null) {
      return `<td><span class="kanji-big" style="color:var(--text-faint)">─</span><span class="kanji-note">時刻不明</span></td>`;
    }
    return `<td>
      <span class="kanji-big">${STEMS[stem]}${BRANCHES[branch]}</span>
      <span class="kanji-note">${STEMS_YOMI[stem]}・${BRANCHES_YOMI[branch]}</span>
      ${tsuhenName ? `<span class="tsuhen">${tsuhenName}</span>` : `<span class="tsuhen" style="color:var(--gold-bright)">日主</span>`}
    </td>`;
  }

  function divine(p) {
    const area = document.getElementById("result-area");
    let ms;
    try { ms = buildMeishiki(p); }
    catch (e) { area.innerHTML = `<div class="result"><p>計算に失敗しました: ${Uranai.esc(e.message)}</p></div>`; return; }

    const dm = DAY_MASTER[ms.dayStem];
    const tYear = tsuhen(ms.dayStem, ms.yearStem);
    const tMonth = tsuhen(ms.dayStem, ms.monthStem);
    const tHour = ms.hourStem !== null ? tsuhen(ms.dayStem, ms.hourStem) : null;

    // 五行カウント(天干+地支本気)
    const counts = [0, 0, 0, 0, 0];
    const pillars = [[ms.yearStem, ms.yearBranch], [ms.monthStem, ms.monthBranch], [ms.dayStem, ms.dayBranch]];
    if (ms.hourStem !== null) pillars.push([ms.hourStem, ms.hourBranch]);
    for (const [s, b] of pillars) {
      counts[stemElem(s)]++;
      counts[stemElem(BRANCH_MAIN[b])]++;
    }
    const maxC = Math.max(...counts);
    const strongest = ELEMS[counts.indexOf(maxC)];
    const missing = ELEMS.filter((e, i) => counts[i] === 0);

    const bars = ELEMS.map((e, i) => `
      <div class="bar-row">
        <span class="bar-label">${e}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${counts[i] / Math.max(maxC,1) * 100}%; background:${ELEM_COLOR[i]}"></div></div>
        <span class="bar-num">${counts[i]}</span>
      </div>`).join("");

    // 大運
    const daiun = buildDaiun(p, ms);
    let daiunBlock;
    if (daiun) {
      const rows = daiun.list.map(d => `
        <tr>
          <td style="font-size:12px;color:var(--text-dim);white-space:nowrap;">${d.from}〜${d.to}歳</td>
          <td><span style="font-size:18px;color:var(--gold-bright);">${STEMS[d.stem]}${BRANCHES[d.branch]}</span></td>
          <td><span class="tsuhen">${d.tsuhen}</span></td>
          <td style="font-size:12px;color:var(--text-dim);">${TSUHEN[d.tsuhen]}</td>
        </tr>`).join("");
      daiunBlock = `
        <div class="result-block">
          <h3>大運 ── 10年ごとの運の潮目</h3>
          <p class="dim">${daiun.forward ? "順行" : "逆行"}・立運およそ${daiun.startAge}歳(節入りまでの日数から算出)。それぞれの10年に巡る気を通変星で読みます。</p>
          <table class="meishiki" style="text-align:left;">
            <tr><th style="text-align:left;">年代</th><th style="text-align:left;">干支</th><th style="text-align:left;">星</th><th style="text-align:left;">その10年の気配</th></tr>
            ${rows}
          </table>
        </div>`;
    } else {
      daiunBlock = `
        <div class="result-block">
          <h3>大運 ── 10年ごとの運の潮目</h3>
          <p class="dim">性別を選ぶと、大運(10年ごとに巡る運気の流れ)まで読めます。大運の進み方(順行・逆行)が生年の干と性別の組み合わせで決まる伝統ルールのためです。</p>
        </div>`;
    }

    const setsuJst = Almanac.toJst(ms.setsu.time);
    const corrStr = ms.tsCorrMin === null ? "" :
      `真太陽時補正 ${ms.tsCorrMin >= 0 ? "+" : ""}${ms.tsCorrMin.toFixed(0)}分(${p.pref})`;

    area.innerHTML = `
      <div class="result">
        <div class="result-head"><div class="for">${Uranai.esc(p.name)} の命式</div></div>
        <div class="result-main">
          <div class="label">日 主</div>
          <div class="value">${STEMS[ms.dayStem]}</div>
          <div class="value-sub">${STEMS_YOMI[ms.dayStem]} ── ${dm.sym}の人</div>
          <div class="result-text">${dm.text}</div>
        </div>

        <div class="result-block">
          <h3>命式(四つの柱)</h3>
          <table class="meishiki">
            <tr><th>時柱</th><th>日柱</th><th>月柱</th><th>年柱</th></tr>
            <tr>
              ${kanshiCell(ms.hourStem, ms.hourBranch, tHour)}
              ${kanshiCell(ms.dayStem, ms.dayBranch, null)}
              ${kanshiCell(ms.monthStem, ms.monthBranch, tMonth)}
              ${kanshiCell(ms.yearStem, ms.yearBranch, tYear)}
            </tr>
          </table>
          <p class="dim">月柱の節入り:${ms.setsu.name}(${setsuJst.y}/${setsuJst.m}/${setsuJst.d} ${setsuJst.hh}:${String(setsuJst.mm).padStart(2,"0")} JST)を天文計算で判定。${corrStr}</p>
        </div>

        <div class="result-block">
          <h3>通変星が示す持ち味</h3>
          <p><b style="color:var(--shu-bright)">年柱・${tYear}</b> ── ${TSUHEN[tYear]}<span class="dim">(家系・若年期に現れやすい気質)</span></p>
          <p><b style="color:var(--shu-bright)">月柱・${tMonth}</b> ── ${TSUHEN[tMonth]}<span class="dim">(仕事・社会での顔。命式の要)</span></p>
          ${tHour ? `<p><b style="color:var(--shu-bright)">時柱・${tHour}</b> ── ${TSUHEN[tHour]}<span class="dim">(晩年・内面の深部に現れる気質)</span></p>` : `<p class="dim">時柱は出生時刻が分かると読めます。</p>`}
        </div>

        <div class="result-block">
          <h3>五行のバランス</h3>
          ${bars}
          <p style="margin-top:10px;">最も強い気は<b style="color:var(--gold-bright)">「${strongest}」</b>――${ELEM_NOTE[strongest]}の気が、あなたの土台です。
          ${missing.length ? `いっぽう<b style="color:var(--shu-bright)">「${missing.join("・")}」</b>の気が命式に見当たりません。${missing.map(e => ELEM_NOTE[e]).join("、")}は、意識して補うとよい伸びしろです。` : "五行がまんべんなく揃った、バランスの良い命式です。"}</p>
        </div>

        ${daiunBlock}
      </div>
    `;
    area.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  Uranai.renderForm(
    document.getElementById("form-area"),
    { timeNote: "時柱まで立てるには出生時刻が必要です", placeNote: "真太陽時の補正に使います" },
    divine
  );
  Uranai.initTabs();
})();
