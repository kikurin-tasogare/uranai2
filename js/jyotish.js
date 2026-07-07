/* ============================================================
   jyotish.js — インド占星術(ジョーティシュ)
   トロピカル視黄経 − ラヒリ・アヤナーンシャ = 恒星黄経。
   月のナクシャトラ、九惑星、ラグナ、
   ヴィムショッタリ・ダシャー(120年法)を算出する。
   ============================================================ */

(() => {
  /* ---------- アヤナーンシャ(ラヒリ近似: J2000=23.853度, 歳差50.29秒/年) ---------- */
  function ayanamsa(date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    return 23.853 + (jd - 2451545.0) / 365.25 * (50.29 / 3600);
  }

  // 平均月交点(ラーフ)の黄経
  function meanRahu(date) {
    const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
    return ((125.0445479 - 0.0529538083 * d) % 360 + 360) % 360;
  }

  const sidereal = (tropical, ay) => ((tropical - ay) % 360 + 360) % 360;

  /* ---------- ナクシャトラ(二十七宿) ---------- */
  const DASHA_LORDS = ["ケートゥ", "金星", "太陽", "月", "火星", "ラーフ", "木星", "土星", "水星"];
  const DASHA_YEARS = { "ケートゥ": 7, "金星": 20, "太陽": 6, "月": 10, "火星": 7, "ラーフ": 18, "木星": 16, "土星": 19, "水星": 17 };

  const NAKSHATRA = [
    { n: "アシュヴィニー", sym: "馬の頭", text: "双子の馬神アシュヴィンの宿。抜群のスピードと癒やしの力を併せ持ち、誰より早く駆けつけて人を助ける、はじまりの星です。" },
    { n: "バラニー", sym: "産道", text: "生と死を司る宿。命を産み出し、締めくくる強靭なエネルギーを秘め、忍耐の先に大きな創造を成し遂げます。" },
    { n: "クリッティカー", sym: "剃刀・炎", text: "火神アグニの宿。曖昧なものを焼き切る鋭さと情熱を持ち、真実を見極める批評眼は二十七宿一とされます。" },
    { n: "ローヒニー", sym: "牛車", text: "月がもっとも愛した妃の宿。豊穣と美と魅力に恵まれ、人と富を自然に惹き寄せる、最も華やかな星の一つです。" },
    { n: "ムリガシラー", sym: "鹿の頭", text: "森をさまよう鹿の宿。好奇心のままに探しつづける探求者で、その柔らかな感受性は美しいものを見つける名人です。" },
    { n: "アールドラー", sym: "涙の雫", text: "嵐の神ルドラの宿。激しい感情の嵐を通り抜けて生まれ変わる、変容の星。涙の後に、緑がいっそう濃くなる人です。" },
    { n: "プナルヴァス", sym: "矢筒", text: "「再びの光」の名を持つ宿。何度失っても回復し、帰ってくる再生力が身上。その楽天性は周囲の希望になります。" },
    { n: "プシュヤ", sym: "牝牛の乳房", text: "二十七宿で最も吉祥とされる宿。養い、育て、繁栄させる力に満ち、信頼という財産を積み上げていく人です。" },
    { n: "アーシュレーシャー", sym: "とぐろを巻く蛇", text: "蛇神ナーガの宿。人の心の深層を見抜く神秘の知恵を持ち、その洞察は絡みつくように離れません。秘めた力の人です。" },
    { n: "マガー", sym: "玉座", text: "祖霊の宿。王の玉座を象徴し、生まれながらの威厳と誇りを備えます。先祖や伝統との縁が深く、受け継ぐ者の風格があります。" },
    { n: "プールヴァ・パールグニー", sym: "寝台の前脚", text: "愛と休息の宿。人生を楽しむ才能に恵まれ、その快活な魅力は場を華やがせます。愛されることが運の源泉です。" },
    { n: "ウッタラ・パールグニー", sym: "寝台の後脚", text: "契約と友情の宿。頼まれたら断らない義侠心と、結んだ約束を守り抜く誠実さで、揺るがぬ信頼を築きます。" },
    { n: "ハスタ", sym: "手のひら", text: "「手」の名を持つ宿。手先の器用さと機知に恵まれ、掴んだ機会を形に変える職人的な才能があります。" },
    { n: "チトラー", sym: "輝く宝石", text: "天の建築家ヴィシュヴァカルマンの宿。造形と装いのセンスが光り、自分の人生そのものを美しく設計していく人です。" },
    { n: "スヴァーティー", sym: "風に揺れる若芽", text: "風の宿。しなやかに揺れながら決して折れない独立の星で、自分の力で立つことに深い誇りを持ちます。" },
    { n: "ヴィシャーカー", sym: "凱旋門", text: "目標の宿。定めた的への集中力は二十七宿随一で、時間がかかっても必ず門をくぐる執念の人です。" },
    { n: "アヌラーダー", sym: "蓮の花", text: "友情と献身の宿。異なる立場の人々を結びつける才があり、泥の中でも咲く蓮のように、逆境で美しさを増します。" },
    { n: "ジェーシュター", sym: "耳飾り", text: "「最年長」の名を持つ宿。守るべきものを守る長の器で、困難な役目ほど燃える保護者の星です。" },
    { n: "ムーラ", sym: "根の束", text: "「根」の宿。物事の根源まで掘り下げずにいられない探究の星で、破壊の女神ニルリティの力を借りて本質だけを残します。" },
    { n: "プールヴァ・アーシャーダー", sym: "扇", text: "「不敗」の名を持つ宿。水のように押し寄せる情熱と自信で、退かず、諦めず、道を押し開いていきます。" },
    { n: "ウッタラ・アーシャーダー", sym: "象の牙", text: "「最終的な勝利」の宿。短距離走ではなく長い戦いで勝つ星で、普遍的な正しさを味方につけたとき無敵になります。" },
    { n: "シュラヴァナ", sym: "耳", text: "「聴く」宿。学びの星で、聴き、学び、伝えることで人生が開けます。ヴィシュヌ神の三歩に守られた知の旅人です。" },
    { n: "ダニシュター", sym: "太鼓", text: "富とリズムの宿。音楽のような拍子感覚で時流を掴み、名声と豊かさを打ち鳴らします。グループの中で輝く星です。" },
    { n: "シャタビシャー", sym: "百の星の円", text: "「百人の癒やし手」の宿。既存の枠に収まらない独創性と探究心で、隠された真実や新しい治療法を見つけ出します。" },
    { n: "プールヴァ・バードラパダー", sym: "二本の柱(前)", text: "変革の炎の宿。深遠な思想と激しい理想主義を秘め、世界の矛盾を焼いて浄化しようとする哲学の星です。" },
    { n: "ウッタラ・バードラパダー", sym: "水中の蛇", text: "深海の静けさの宿。怒りを制御する深い落ち着きと包容力があり、聖者の器と呼ばれます。静かな人ほど深いのです。" },
    { n: "レーヴァティー", sym: "魚", text: "二十七宿の最後、旅路の守り手の宿。迷った人や動物を安全な場所へ導く優しさに満ち、豊かさと安寧に恵まれます。" },
  ];

  /* ---------- ラーシ(恒星基準の十二宮) ---------- */
  const RASHI = ["メーシャ(牡羊)", "ヴリシャバ(牡牛)", "ミトゥナ(双子)", "カルカ(蟹)", "シンハ(獅子)", "カニヤー(乙女)",
    "トゥラー(天秤)", "ヴリシュチカ(蠍)", "ダヌ(射手)", "マカラ(山羊)", "クンバ(水瓶)", "ミーナ(魚)"];

  /* ---------- ダシャー期の意味 ---------- */
  const DASHA_TEXT = {
    "太陽": "自己確立の季節。名誉・責任・父性に光が当たり、表舞台へ押し出されます。",
    "月": "心が主役の季節。住まい・家族・人気運が動き、感受性が豊かになります。",
    "火星": "攻めの季節。行動力と闘争心が高まり、勝負事と開拓に向きます。怪我と短気にだけ注意。",
    "ラーフ": "霧の中の大勝負の季節。野心が膨らみ、海外・異分野など「枠の外」との縁が生じます。実像を見失わないこと。",
    "木星": "恵みの季節。学び・結婚・出産・昇進など、人生が自然に拡大していく吉期とされます。",
    "土星": "鍛錬の季節。重い荷を担ぐ代わりに、生涯ものの土台と実力が築かれます。急がば回れの十九年。",
    "水星": "知性の季節。商売・学問・執筆・交渉が冴え、頭を使うほど実りが増えます。",
    "ケートゥ": "手放しの季節。物質より精神性に関心が向かい、本当に要るものだけが残ります。内なる旅の時。",
    "金星": "人生の華の季節。愛情・芸術・豊かさに恵まれる、二十年続く最長の甘い時間です。",
  };

  const GRAHAS = [
    { key: "Sun", n: "太陽(スーリヤ)" }, { key: "Moon", n: "月(チャンドラ)" },
    { key: "Mars", n: "火星(マンガラ)" }, { key: "Mercury", n: "水星(ブダ)" },
    { key: "Jupiter", n: "木星(グル)" }, { key: "Venus", n: "金星(シュクラ)" },
    { key: "Saturn", n: "土星(シャニ)" },
  ];

  /* ---------- ダシャー計算 ---------- */
  function buildDasha(moonSid, birth) {
    const nakSize = 360 / 27;
    const nak = Math.floor(moonSid / nakSize);
    const frac = (moonSid - nak * nakSize) / nakSize; // 宿内の経過割合
    const startLordIdx = nak % 9;
    const list = [];
    let t = birth.getTime();
    for (let i = 0; i < 9; i++) {
      const lord = DASHA_LORDS[(startLordIdx + i) % 9];
      let years = DASHA_YEARS[lord];
      if (i === 0) years = years * (1 - frac); // 初回は残り期間のみ
      const end = t + years * 365.25 * 86400000;
      list.push({ lord, start: new Date(t), end: new Date(end) });
      t = end;
    }
    return { nak, frac, list };
  }

  function fmtY(date) { return `${date.getFullYear()}年${date.getMonth() + 1}月`; }

  /* ---------- 鑑定 ---------- */
  function divine(p) {
    const area = document.getElementById("result-area");
    const birth = Almanac.jst(p.y, p.m, p.d, p.hh, p.mi);
    const ay = ayanamsa(birth);

    const moonSid = sidereal(Almanac.moonLon(birth), ay);
    const { nak, frac, list } = buildDasha(moonSid, birth);
    const nk = NAKSHATRA[nak];
    const pada = Math.floor((moonSid % (360 / 27)) / (360 / 108)) + 1;
    const moonRashi = Math.floor(moonSid / 30);

    // 九惑星
    const rows = GRAHAS.map(g => {
      const lon = sidereal(Almanac.planetLon(g.key, birth), ay);
      return { n: g.n, lon };
    });
    const rahu = sidereal(meanRahu(birth), 0) - ay; // 平均交点は黄経そのもの
    const rahuLon = ((rahu % 360) + 360) % 360;
    rows.push({ n: "ラーフ(昇交点)", lon: rahuLon });
    rows.push({ n: "ケートゥ(降交点)", lon: (rahuLon + 180) % 360 });

    // ラグナ
    let lagna = null;
    if (p.timeKnown) {
      lagna = sidereal(Almanac.ascendant(birth, p.lat, p.lon), ay);
    }

    // 現在のダシャー
    const now = Date.now();
    const currentIdx = list.findIndex(d => now >= d.start.getTime() && now < d.end.getTime());

    const grahaRows = rows.map(r => `
      <div class="planet-row">
        <span class="p-name" style="width:11em;">${r.n}</span>
        <span class="p-sign">${RASHI[Math.floor(r.lon / 30)]}</span>
        <span class="p-deg">${(r.lon % 30).toFixed(1)}°</span>
      </div>`).join("");

    const dashaRows = list.map((d, i) => `
      <tr style="${i === currentIdx ? "background:rgba(95,191,154,0.12);" : ""}">
        <td style="white-space:nowrap;"><b style="color:${i === currentIdx ? "var(--gold-bright)" : "var(--text)"}">${d.lord}期</b>${i === currentIdx ? '<span style="font-size:10px;color:var(--shu-bright)"> ◀ いま</span>' : ""}</td>
        <td style="white-space:nowrap; font-size:12px; color:var(--text-dim);">${fmtY(d.start)} 〜 ${fmtY(d.end)}</td>
        <td style="font-size:12px; color:var(--text-dim);">${DASHA_TEXT[d.lord]}</td>
      </tr>`).join("");

    const sunSid = rows[0].lon;

    area.innerHTML = `
      <div class="result">
        <div class="result-head"><div class="for">${Uranai.esc(p.name)} の星図</div></div>
        <div class="result-main">
          <div class="label">月 の ナ ク シ ャ ト ラ</div>
          <div class="value" style="font-size:${nk.n.length > 8 ? 24 : 34}px;">${nk.n}</div>
          <div class="value-sub">象意:${nk.sym} ・ 第${pada}パダ ・ 支配星 ${DASHA_LORDS[nak % 9]}</div>
          <div class="result-text">${nk.text}</div>
        </div>

        <div class="result-block">
          <h3>月のラーシ(ジャンマ・ラーシ)</h3>
          <p>あなたの月は恒星基準で <b style="color:var(--gold-bright)">${RASHI[moonRashi]}</b> にあります。インドでは太陽星座よりこの「月の星座」が、その人の心の在り処として重視されます。</p>
          ${p.timeKnown ? "" : `<p class="dim">※出生時刻不明のため正午で計算。月は一日で約13度動くため、宿の境目付近では前後にずれる可能性があります。</p>`}
        </div>

        ${lagna !== null ? `
        <div class="result-block">
          <h3>ラグナ(アセンダント)</h3>
          <p>生まれた瞬間、東の地平線に昇っていたのは <b style="color:var(--gold-bright)">${RASHI[Math.floor(lagna / 30)]}</b>(${(lagna % 30).toFixed(1)}°)。人生という建物の一階、土台となる気質です。</p>
        </div>` : `
        <div class="result-block">
          <h3>ラグナ(アセンダント)</h3>
          <p class="dim">出生時刻が分かると、人生の土台を示すラグナまで読めます。</p>
        </div>`}

        <div class="result-block">
          <h3>九惑星(ナヴァグラハ)の配置 ── 恒星基準</h3>
          ${grahaRows}
          <p class="dim" style="margin-top:10px;">西洋占星術(春分点基準)とは約${ay.toFixed(1)}度ずれるため、太陽の星座はおよそ一つ手前になります(本図鑑の西洋占星術ページと見比べてみてください。太陽は恒星基準で${RASHI[Math.floor(sunSid / 30)]}です)。</p>
        </div>

        <div class="result-block">
          <h3>ヴィムショッタリ・ダシャー ── 人生の時計</h3>
          <p class="dim">九惑星が順番に人生を支配する120年周期。生まれた瞬間の月がナクシャトラ内を${(frac * 100).toFixed(0)}%進んでいたため、最初の${list[0].lord}期は短縮されています。</p>
          <table class="meishiki" style="text-align:left;">
            <tr><th style="text-align:left;">支配星</th><th style="text-align:left;">期間</th><th style="text-align:left;">その季節の気配</th></tr>
            ${dashaRows}
          </table>
        </div>

        ${Uranai.glossary([
          ["ナクシャトラ", "月の通り道を27等分した星宿。インド独自の体系で、宿曜占星術の二十七宿の生みの親です。"],
          ["パダ", "一つのナクシャトラをさらに4等分した区画。同じ宿でも第何パダかで色合いが変わります。"],
          ["ラーシ", "恒星基準の十二星座。メーシャ(牡羊)からミーナ(魚)まで、西洋の十二星座と同じ区分を実際の星空に沿って使います。"],
          ["ラグナ", "生まれた瞬間に東の地平線から昇っていた星座。西洋占星術のアセンダントに当たり、人生の土台を示します。"],
          ["ナヴァグラハ(九惑星)", "太陽・月・火星・水星・木星・金星・土星と、影の星ラーフ・ケートゥの九つ。インドの寺院には九惑星の祭壇があります。"],
          ["ラーフ/ケートゥ", "月の軌道と太陽の通り道が交わる点(日食・月食が起こる場所)。実体のない「影の惑星」ですが、強力な作用を持つとされます。"],
          ["アヤナーンシャ", "恒星基準と春分点基準のずれ(約24度)。地球の首振り運動(歳差)で年々広がっています。本図鑑はラヒリ方式を採用。"],
          ["ヴィムショッタリ・ダシャー", "人生120年を九惑星が順に支配する運気の時刻表。「いつ、どの星の季節が来るか」を年単位で読む、ジョーティシュの看板技法です。"],
        ])}
      </div>
    `;
    area.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  Uranai.renderForm(
    document.getElementById("form-area"),
    { timeNote: "ラグナと月の精度が上がります", placeNote: "ラグナの計算に使います" },
    divine
  );
  Uranai.initTabs();
})();
