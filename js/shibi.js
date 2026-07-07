/* ============================================================
   shibi.js — 紫微斗数(三合派の基本法)
   旧暦(Almanac.kyureki)+時辰(真太陽時)から
   命宮・身宮・五行局・十四主星を配置する。
   ============================================================ */

(() => {
  const BRANCHES = Almanac.BRANCHES; // 子丑寅卯辰巳午未申酉戌亥
  const HOUR_NAME = BRANCHES.map(b => b + "の刻");

  /* ---------- 納音五行(60干支の対ごと) → 五行局 ---------- */
  const NAYIN_ELEM = [
    "金","火","木","土","金","火","水","土","金","木",
    "水","土","火","木","水","金","火","木","土","金",
    "火","水","土","金","木","水","土","火","木","水",
  ];
  const KYOKU = { "水": 2, "木": 3, "金": 4, "土": 5, "火": 6 };
  const KYOKU_NAME = { 2: "水二局", 3: "木三局", 4: "金四局", 5: "土五局", 6: "火六局" };

  /* ---------- 十四主星 ---------- */
  const STARS = {
    "紫微": { tag: "帝王の星", line: "尊厳と統率。人の上に立つ器",
      text: "北天の帝、すべての星の主。生まれながらの品格と統率力を備え、どんな場所でも自然と「長」の役割が回ってくる人です。プライドの高さは帝王の証ですが、良い家臣(仲間)に恵まれたとき、その器は最大に発揮されます。" },
    "天機": { tag: "知恵の星", line: "頭脳と企画。回転の速い軍師",
      text: "帝を支える軍師の星。頭の回転が速く、アイデアと戦略が泉のように湧きます。変化を好み、一つの場所に留まるより動きの中で輝くたち。考えすぎて動けなくなる時は、六割の見通しで走り出すのが吉です。" },
    "太陽": { tag: "博愛の星", line: "発信と公明。分け隔てなく照らす",
      text: "空に輝く太陽そのものの星。明るく公明正大で、自分より人のために動くことで運が回ります。注目を集める発信力は十四主星随一。ただし太陽は自分の光を自分では見られません――与えた恩を数えないことが、この星の品格です。" },
    "武曲": { tag: "剛毅と財の星", line: "実行力と金銭感覚。寡黙な武人",
      text: "武人の星にして財星。口数少なく、行動と結果で語るタイプです。金銭感覚が鋭く、コツコツと財を築く力は抜群。硬派すぎて融通が利かない場面もありますが、その堅さこそが信用の源泉です。" },
    "天同": { tag: "福徳の星", line: "温和と人徳。愛される福の人",
      text: "十四主星でいちばんの福の星。穏やかで争いを好まず、いるだけで場が和む人徳の持ち主です。幸運に恵まれやすい反面、ハングリーさは薄め。「楽しく続けられる仕組み」を作れたとき、福星は本領を発揮します。" },
    "廉貞": { tag: "情と変革の星", line: "複雑な魅力。清濁を併せ呑む",
      text: "十四主星でもっとも複雑で、もっとも魅力的な星。理性と情熱、清と濁が同居し、置かれた環境で善にも険にも転じます。人を惹きつける色気と勝負強さは天性のもの。情の使い道を定めたとき、大きく化ける星です。" },
    "天府": { tag: "財庫の星", line: "包容と安定。蓄える南の帝",
      text: "紫微が北の帝なら、天府は南の帝。争いより安定を、拡大より充実を選ぶ包容の星です。財庫(金庫)の星とも呼ばれ、蓄え、守り、育てることに長けます。その安心感が、人とお金を自然と集めます。" },
    "太陰": { tag: "月の星", line: "繊細と静けさ。夜を照らす",
      text: "夜空の月の星。物静かで思慮深く、細やかな気配りと美意識に恵まれます。母性・住まい・蓄財と縁が深く、静かな環境でこそ輝くたち。感情の満ち欠けはあれど、それは月が生きている証です。" },
    "貪狼": { tag: "桃花の星", line: "欲望と多才。人生を味わい尽くす",
      text: "第一の桃花星(魅力の星)。多芸多才で、遊びも仕事も恋も、人生のすべてを味わい尽くそうとする欲望のエネルギーに満ちています。その欲は才能の燃料。品よく燃やせば、誰より豊かな人生になります。" },
    "巨門": { tag: "弁舌の星", line: "言葉と探究。暗闇を照らす問い",
      text: "「大きな門」の名を持つ、言葉の星。弁が立ち、物事の裏側を探る観察眼と批評精神に優れます。その舌は人を導く灯にも、疑心の闇にもなる諸刃の剣。言葉を職業にすると大成しやすい星です。" },
    "天相": { tag: "宰相の星", line: "補佐と調停。信頼の要",
      text: "帝を支える宰相の星。公平で品位があり、対立する者の間を取り持つ調停の才に恵まれます。トップより二番手・参謀で真価を発揮するタイプ。あなたの「はんこ」(承認)には、人を安心させる力があります。" },
    "天梁": { tag: "長老の星", line: "庇護と面倒見。困った人を放っておけない",
      text: "老成した長老の星。困っている人を放っておけない面倒見のよさと、危機を乗り越える不思議な強運を持ちます。教える・守る・癒やす仕事と好相性。お節介と紙一重の優しさが、この星の勲章です。" },
    "七殺": { tag: "将軍の星", line: "果断と挑戦。単騎で敵陣へ",
      text: "戦場の先鋒を切る将軍の星。決断は速く、リスクを恐れず、安定より挑戦を選びます。人生に一度は大勝負を仕掛ける星と言われ、逆境でこそ目が輝くたち。刃の向け先だけ、くれぐれも見誤らぬように。" },
    "破軍": { tag: "開拓の星", line: "破壊と再生。古きを壊し新しきを創る",
      text: "先陣で城壁を打ち破る破壊と再生の星。古いものを壊して新しいものを打ち立てる、開拓者のエネルギーに満ちています。人生に波は多いものの、壊した分だけ必ず何かを創り出す。変化を恐れないことが、この星の生きる道です。" },
  };

  /* ---------- 十二宮 ---------- */
  const PALACES = ["命宮","兄弟宮","夫妻宮","子女宮","財帛宮","疾厄宮","遷移宮","交友宮","官禄宮","田宅宮","福徳宮","父母宮"];
  const PALACE_NOTE = {
    "夫妻宮": "恋愛・結婚のかたち",
    "財帛宮": "お金の稼ぎ方・使い方",
    "官禄宮": "仕事・天職のかたち",
  };

  /* ---------- 命盤計算 ---------- */
  function buildMeiban(p) {
    const k = Almanac.kyureki(p.y, p.m, p.d); // 閏月は前月扱い(k.monthをそのまま使う)

    // 時辰(真太陽時)
    let hourIdx = 0;
    let tsCorr = 0;
    if (p.timeKnown) {
      tsCorr = Almanac.trueSolarOffsetMin(p.y, p.m, p.d, p.lon);
      const totalMin = ((p.hh * 60 + p.mi + Math.round(tsCorr)) % 1440 + 1440) % 1440;
      hourIdx = Math.floor(((totalMin + 60) % 1440) / 120);
    }

    // 命宮・身宮(寅=2から旧暦月を順数、時辰を逆数/順数)
    const monthPalace = (2 + (k.month - 1)) % 12;
    const meigu = ((monthPalace - hourIdx) % 12 + 12) % 12;
    const shingu = (monthPalace + hourIdx) % 12;

    // 年干(立春切り)→ 命宮の干 → 納音五行局
    const ris = Almanac.risshun(p.y);
    const birth = Almanac.jst(p.y, p.m, p.d, p.hh, p.mi);
    const gy = birth < ris ? p.y - 1 : p.y;
    const yearStem = ((gy - 4) % 10 + 10) % 10;
    const toraStem = ((yearStem % 5) * 2 + 2) % 10;            // 寅宮の干(五虎遁)
    const meiguStem = (toraStem + ((meigu - 2) % 12 + 12) % 12) % 10;
    const k60 = ((6 * meiguStem - 5 * meigu) % 60 + 60) % 60;   // 命宮の六十干支
    const elem = NAYIN_ELEM[Math.floor(k60 / 2)];
    const g = KYOKU[elem];

    // 紫微星の位置
    const q = Math.ceil(k.day / g);
    const r = q * g - k.day;
    let ziwei = r % 2 === 0 ? 2 + (q - 1) + r : 2 + (q - 1) - r;
    ziwei = ((ziwei % 12) + 12) % 12;

    // 十四主星の配置
    const pos = {}; // 星名 → 宮支index
    const put = (name, idx) => { pos[name] = ((idx % 12) + 12) % 12; };
    put("紫微", ziwei);
    put("天機", ziwei - 1);
    put("太陽", ziwei - 3);
    put("武曲", ziwei - 4);
    put("天同", ziwei - 5);
    put("廉貞", ziwei - 8);
    const tianfu = ((16 - ziwei) % 12 + 12) % 12;
    put("天府", tianfu);
    put("太陰", tianfu + 1);
    put("貪狼", tianfu + 2);
    put("巨門", tianfu + 3);
    put("天相", tianfu + 4);
    put("天梁", tianfu + 5);
    put("七殺", tianfu + 6);
    put("破軍", tianfu + 10);

    // 宮支index → 星名リスト / 宮名
    const starsAt = Array.from({ length: 12 }, () => []);
    for (const [name, idx] of Object.entries(pos)) starsAt[idx].push(name);
    const palaceAt = {}; // 宮支index → 宮名
    for (let i = 0; i < 12; i++) palaceAt[((meigu - i) % 12 + 12) % 12] = PALACES[i];

    return { k, hourIdx, tsCorr, meigu, shingu, g, elem, starsAt, palaceAt, timeKnown: p.timeKnown };
  }

  /* ---------- 描画 ---------- */
  const GRID = [ // 伝統的な命盤レイアウト(4×4、中央2×2は情報欄)
    5, 6, 7, 8,
    4, -1, -1, 9,
    3, -1, -1, 10,
    2, 1, 0, 11,
  ];

  function divine(p) {
    const area = document.getElementById("result-area");
    let m;
    try { m = buildMeiban(p); }
    catch (e) { area.innerHTML = `<div class="result"><p>計算に失敗しました: ${Uranai.esc(e.message)}</p></div>`; return; }

    // 命宮の星(空宮なら対宮=遷移宮から借りる)
    let mainStars = m.starsAt[m.meigu];
    let borrowed = false;
    if (mainStars.length === 0) {
      mainStars = m.starsAt[(m.meigu + 6) % 12];
      borrowed = true;
    }

    // 命盤グリッド
    let cells = "";
    let centerDone = false;
    for (const b of GRID) {
      if (b === -1) {
        if (!centerDone) {
          centerDone = true;
          cells += `<div class="mb-center">
            <div style="font-size:15px;color:var(--gold-bright);letter-spacing:0.2em;">${Uranai.esc(p.name)}</div>
            <div style="font-size:11px;color:var(--text-dim);margin-top:6px;">旧暦${m.k.leap ? "閏" : ""}${m.k.month}月${m.k.day}日<br>${m.timeKnown ? HOUR_NAME[m.hourIdx] + "生まれ" : "時刻不明(子の刻扱い)"}<br><b style="color:var(--shu-bright)">${KYOKU_NAME[m.g]}</b></div>
          </div>`;
        }
        continue;
      }
      const isMei = b === m.meigu, isShin = b === m.shingu;
      cells += `<div class="mb-cell${isMei ? " mb-mei" : ""}">
        <div class="mb-branch">${BRANCHES[b]}</div>
        <div class="mb-palace">${m.palaceAt[b]}${isShin ? '<span style="color:var(--murasaki)">・身</span>' : ""}</div>
        <div class="mb-stars">${m.starsAt[b].join("・") || "<span style='opacity:0.35'>─</span>"}</div>
      </div>`;
    }

    const mainTexts = mainStars.map(s => `
      <div class="result-block">
        <h3>${s} ── ${STARS[s].tag}</h3>
        <p>${STARS[s].text}</p>
      </div>`).join("");

    // 夫妻・財帛・官禄の三領域
    const domains = ["夫妻宮", "財帛宮", "官禄宮"].map(pn => {
      const idx = Object.keys(m.palaceAt).find(i => m.palaceAt[i] === pn);
      let ss = m.starsAt[idx];
      let note = "";
      if (ss.length === 0) { ss = m.starsAt[(Number(idx) + 6) % 12]; note = "(空宮のため対宮から借星)"; }
      const lines = ss.length
        ? ss.map(s => `<b style="color:var(--gold-bright)">${s}</b>(${STARS[s].line})`).join("、")
        : "─";
      return `<p><b style="color:var(--shu-bright)">${pn}</b><span class="dim">〔${PALACE_NOTE[pn]}〕</span> ── ${lines} ${note}</p>`;
    }).join("");

    area.innerHTML = `
      <div class="result">
        <div class="result-head"><div class="for">${Uranai.esc(p.name)} の命盤</div></div>
        <div class="result-main">
          <div class="label">命 宮 の 主 星</div>
          <div class="value" style="font-size:${mainStars.length > 1 ? 30 : 40}px;">${mainStars.join("・")}</div>
          <div class="value-sub">${mainStars.map(s => STARS[s].tag).join(" × ")}${borrowed ? " (空宮・対宮より借星)" : ""}</div>
        </div>

        ${mainTexts}

        <div class="result-block">
          <h3>命盤 ── 十二宮</h3>
          <div class="meiban">${cells}</div>
          <p class="dim" style="margin-top:10px;">枠が光っているのが命宮(この人生の主舞台)、「身」の印は身宮(中年以降に重みを増す第二の自分)です。</p>
        </div>

        <div class="result-block">
          <h3>人生の三領域</h3>
          ${domains}
        </div>

        ${Uranai.glossary([
          ["命盤(めいばん)", "十二の宮に星を配した、紫微斗数の人生の見取り図。この鑑定の中心です。"],
          ["十二宮", "人生を12の領域(自分・兄弟・結婚・子ども・お金・健康・外出・友人・仕事・住まい・心・親)に分けた区画。"],
          ["命宮(めいきゅう)", "十二宮の起点で、あなた自身を表す最重要の宮。ここに入る主星が「人生の主人公」です。"],
          ["身宮(しんきゅう)", "もう一つの自分を表す宮。年を重ねるほど、この宮の性質が濃く出てくるとされます。"],
          ["五行局", "命宮の干支から定まる五つの型(水二局〜火六局)。紫微星の位置を決め、人生の歩幅を表すとも言われます。"],
          ["十四主星", "紫微・天府を筆頭とする14の主役級の星。実在の星ではなく、暦から生まれる「仮想の星」です。"],
          ["時辰(じしん)", "一日を十二支で12分割した2時間刻みの時刻。紫微斗数では出生時刻をこの単位で使います。"],
          ["空宮と借星", "宮に主星が入らないこと。その場合は向かい(対宮)の星を借りて読みます。空宮は弱いのではなく「向かいの景色が映る窓」です。"],
        ])}
      </div>
    `;
    area.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  Uranai.renderForm(
    document.getElementById("form-area"),
    { timeNote: "命宮の位置に時辰(2時間刻み)を使います", placeNote: "真太陽時の補正に使います" },
    divine
  );
  Uranai.initTabs();
})();
