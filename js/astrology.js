/* ============================================================
   astrology.js — 西洋占星術
   astronomy-engine で出生時刻の視黄経を求め、
   トロピカル方式で十二星座に配置する。
   ============================================================ */

(() => {
  /* ---------- 十二星座 ---------- */
  const SIGNS = [
    { n: "牡羊座", sym: "♈", elem: "火", quality: "活動", ruler: "火星",
      style: "考えるより先に体が動く、まっすぐで嘘のない熱さ",
      text: "十二星座の先頭を切る、始まりの星座。思い立ったら即行動、道なき道へ真っ先に飛び込む開拓者です。駆け引きのないまっすぐさは、それだけで人を動かす力になります。負けず嫌いで着火は早いけれど、根に持たないのも美点。あなたの「最初の一歩」が、いつも誰かの勇気になっています。" },
    { n: "牡牛座", sym: "♉", elem: "地", quality: "不動", ruler: "金星",
      style: "本物を見抜く五感と、急かされても崩れないマイペース",
      text: "豊かな大地の星座。美味しいもの、心地よいもの、本物の質感を見抜く五感の鋭さは十二星座随一です。じっくり時間をかけて築いたものは、簡単には手放さない粘り強さも。急かされるのは苦手ですが、あなたの「ゆっくり」は怠慢ではなく、確かめながら進む誠実さです。" },
    { n: "双子座", sym: "♊", elem: "風", quality: "柔軟", ruler: "水星",
      style: "好奇心のおもむくまま二つのことを同時にこなす軽やかさ",
      text: "知的好奇心の翼を持つ星座。新しい情報、新しい人、新しい遊び――「新しい」と聞くだけで心が跳ねます。言葉のセンスと機転で、どんな場にもすっと溶け込む社交の名手。飽きっぽいと言われがちですが、それは世界が広すぎるせい。複数の顔を持てることこそ、あなたの豊かさです。" },
    { n: "蟹座", sym: "♋", elem: "水", quality: "活動", ruler: "月",
      style: "身内と認めた相手をとことん守り抜く、情の深さ",
      text: "月に守られた、情愛の星座。一度「身内」と認めた相手への面倒見と忠誠心は、十二星座で最も深いもの。共感力が高く、人の痛みを自分の痛みとして感じ取ります。殻に籠もるのは弱さではなく、大切なものを守る知恵。あなたの作る「安心できる場所」に、人は帰ってきます。" },
    { n: "獅子座", sym: "♌", elem: "火", quality: "不動", ruler: "太陽",
      style: "堂々と主役を張り、そばにいる人まで輝かせる華",
      text: "太陽を主星に持つ、百獣の王の星座。生まれながらの華と存在感で、いるだけで場の中心になります。ドラマチックなことが好きで、認められるほど燃えるたち。実は繊細で、拍手が途切れると不安になる一面も。でも大丈夫――王の風格とは、周りを輝かせる気前の良さのことです。" },
    { n: "乙女座", sym: "♍", elem: "地", quality: "柔軟", ruler: "水星",
      style: "誰も気づかない細部まで整えずにいられない、完璧への愛",
      text: "細部に神が宿ることを知っている星座。観察力と分析力に優れ、乱れたものを整え、欠けたものに気づく目を持ちます。批判的に見えるその指摘は、実は「もっと良くなるはず」という愛情の裏返し。人知れず積み重ねた気配りは、必ず見ている人がいます。自分にだけは、少し甘くてもいいのですよ。" },
    { n: "天秤座", sym: "♎", elem: "風", quality: "活動", ruler: "金星",
      style: "その場の空気を美しく釣り合わせる、天性のバランス感覚",
      text: "調和と美を司る星座。人と人との間に流れる空気を読み、場を美しく釣り合わせる天性の外交官です。センスが良く、立ち居振る舞いはどこか優雅。「優柔不断」と言われるのは、すべての側の言い分が見えてしまうから。あなたの公平さは、対立した世界に必要な橋です。" },
    { n: "蠍座", sym: "♏", elem: "水", quality: "不動", ruler: "冥王星",
      style: "浅い付き合いでは満足できない、底の見えない一途さ",
      text: "深く、静かに、燃える星座。感情の井戸は十二星座で最も深く、一度心を許した相手とは魂ごと結びつこうとします。秘密を守る力、物事の裏側を見抜く洞察力は並外れたもの。全か無か、の激しさを内に秘めながら表情には出さない――その静かな凄みが、あなたの磁力です。" },
    { n: "射手座", sym: "♐", elem: "火", quality: "柔軟", ruler: "木星",
      style: "地平線の向こうに矢を放つ、束縛知らずの楽天主義",
      text: "遥かな的を狙う、旅人の星座。今いる場所より遠くへ――知らない土地、知らない思想、より高い真理へと、心は常に地平線の彼方にあります。楽天的で細かいことは気にせず、失敗さえ旅の土産話に変えてしまう強さが魅力。その矢は、放たれてこそ。飼い慣らされない自由が、あなたの命です。" },
    { n: "山羊座", sym: "♑", elem: "地", quality: "活動", ruler: "土星",
      style: "遠い頂を見据えて一歩ずつ登りきる、執念の計画性",
      text: "険しい山を登りきる、達成の星座。目標までの道のりを現実的に見積もり、時間をかけて確実に登頂する力は十二星座一です。若い頃は苦労が多くとも、年を重ねるほど強く、豊かになっていく大器晩成型。ふざけているようで、実はいちばん責任感が強い人。あなたの登った高さは、裏切りません。" },
    { n: "水瓶座", sym: "♒", elem: "風", quality: "不動", ruler: "天王星",
      style: "みんなと同じ、が一番苦手な自由と革新の精神",
      text: "未来から吹く風の星座。常識や前例より「本当にそれでいいの?」を優先する、生まれながらの改革者です。友愛の精神が強く、立場や肩書きに関係なくフラットに付き合える稀有な人。変わり者と呼ばれたら、それは勲章。あなたの「普通じゃない」視点が、明日の当たり前を作ります。" },
    { n: "魚座", sym: "♓", elem: "水", quality: "柔軟", ruler: "海王星",
      style: "境界線が溶けるほどの共感力と、現実を超えて夢を見る力",
      text: "十二星座の最後を締めくくる、大海の星座。自他の境界が薄く、人の感情も場の空気も、まるごと感じ取ってしまう共感の人です。想像力は現実の枠を軽々と超え、芸術や癒やしの世界で不思議な力を発揮します。流されやすさは、どんな器にもなれる証。あなたの優しさは、理屈より深いところで人を救っています。" },
  ];

  /* ---------- 天体 ---------- */
  const PLANETS = [
    { key: "Sun",     sym: "☉", name: "太陽", lens: "人生の軸・本質", intro: "あなたという物語の主題は", personal: true },
    { key: "Moon",    sym: "☽", name: "月",   lens: "素顔・感情",     intro: "親しい人にだけ見せる素顔には", personal: true },
    { key: "Mercury", sym: "☿", name: "水星", lens: "知性・言葉",     intro: "頭の働き方と言葉の選び方には", personal: true },
    { key: "Venus",   sym: "♀", name: "金星", lens: "愛・美意識",     intro: "愛し方と喜びの感じ方には", personal: true },
    { key: "Mars",    sym: "♂", name: "火星", lens: "情熱・闘い方",   intro: "情熱の燃やし方には", personal: true },
    { key: "Jupiter", sym: "♃", name: "木星", lens: "幸運・拡大",     intro: "人生が大きく膨らむ場面では", personal: true },
    { key: "Saturn",  sym: "♄", name: "土星", lens: "課題・成熟",     intro: "時間をかけて成熟していく課題には", personal: true },
    { key: "Uranus",  sym: "♅", name: "天王星", lens: "変革(世代)", intro: "", personal: false },
    { key: "Neptune", sym: "♆", name: "海王星", lens: "夢想(世代)", intro: "", personal: false },
    { key: "Pluto",   sym: "♇", name: "冥王星", lens: "変容(世代)", intro: "", personal: false },
  ];

  /* ---------- アスペクト(座相) ---------- */
  const ASPECTS = [
    { deg: 0,   orb: 8, n: "合(コンジャンクション)", tag: "一体化", text: "二つの星の力が混ざり合い、強く増幅されます。" },
    { deg: 60,  orb: 4, n: "六分(セクスタイル)",     tag: "好機",   text: "軽やかに助け合う角度。意識して使うと伸びる才能です。" },
    { deg: 90,  orb: 6, n: "矩(スクエア)",           tag: "緊張",   text: "摩擦を生む角度。しかしその葛藤こそが成長のバネになります。" },
    { deg: 120, orb: 6, n: "三分(トライン)",         tag: "調和",   text: "自然に流れる調和の角度。努力なしに働く生まれつきの才能です。" },
    { deg: 180, orb: 8, n: "衝(オポジション)",       tag: "対峙",   text: "引っ張り合う角度。二極を行き来しながらバランスを学びます。" },
  ];

  function findAspects(rows) {
    const found = [];
    const targets = rows.filter(r => ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"].includes(r.key));
    for (let i = 0; i < targets.length; i++) {
      for (let j = i + 1; j < targets.length; j++) {
        let sep = Math.abs(targets[i].lon - targets[j].lon) % 360;
        if (sep > 180) sep = 360 - sep;
        for (const a of ASPECTS) {
          if (Math.abs(sep - a.deg) <= a.orb) {
            found.push({ p1: targets[i], p2: targets[j], a, exact: Math.abs(sep - a.deg) });
            break;
          }
        }
      }
    }
    return found.sort((x, y) => x.exact - y.exact);
  }

  const ELEM_COLOR = { "火": "#e0708f", "地": "#7fb069", "風": "#69c3da", "水": "#6a8fd8" };
  const ELEM_NOTE = { "火": "直感と情熱", "地": "感覚と現実", "風": "思考と言葉", "水": "感情と共感" };

  function signOf(lon) {
    const idx = Math.floor((((lon % 360) + 360) % 360) / 30);
    const deg = (((lon % 360) + 360) % 360) - idx * 30;
    return { idx, deg };
  }

  function divine(p) {
    const area = document.getElementById("result-area");
    const birth = Almanac.jst(p.y, p.m, p.d, p.hh, p.mi);

    // 各天体の黄経
    const rows = PLANETS.map(pl => {
      const lon = Almanac.planetLon(pl.key, birth);
      const s = signOf(lon);
      return { ...pl, lon, sign: SIGNS[s.idx], deg: s.deg };
    });

    // アセンダント(時刻既知のみ)
    let asc = null;
    if (p.timeKnown) {
      const lonAsc = Almanac.ascendant(birth, p.lat, p.lon);
      const s = signOf(lonAsc);
      asc = { sign: SIGNS[s.idx], deg: s.deg };
    }

    const sun = rows[0], moon = rows[1];

    const planetRows = rows.map(r => `
      <div class="planet-row">
        <span class="p-glyph">${r.sym}</span>
        <span class="p-name">${r.name}<span style="color:var(--text-faint)">・${r.lens}</span></span>
        <span class="p-sign">${r.sign.sym} ${r.sign.n}</span>
        <span class="p-deg">${r.deg.toFixed(1)}°</span>
        ${r.personal && r.key !== "Sun" ? `<span class="p-text">${r.intro}、${r.sign.style}が現れます。</span>` : ""}
      </div>`).join("");

    area.innerHTML = `
      <div class="result">
        <div class="result-head"><div class="for">${Uranai.esc(p.name)} のホロスコープ</div></div>
        <div class="result-main">
          <div class="label">太 陽 星 座</div>
          <div class="value">${sun.sign.sym} ${sun.sign.n}</div>
          <div class="value-sub">${sun.sign.elem}の${sun.sign.quality}宮 ・ 守護星 ${sun.sign.ruler}</div>
          <div class="result-text">${sun.sign.text}</div>
        </div>

        <div class="result-block">
          <h3>月星座 ── あなたの素顔</h3>
          <p><b style="color:var(--gold-bright)">${moon.sign.sym} ${moon.sign.n}</b> の月。${moon.sign.style}――それが、鎧を脱いだときのあなたです。</p>
          ${p.timeKnown ? "" : `<p class="dim">※出生時刻が不明のため正午で計算しています。月は一日に約13度動くため、星座の境目付近の生まれの場合、前後の星座の可能性があります。</p>`}
        </div>

        ${asc ? `
        <div class="result-block">
          <h3>アセンダント ── まとう雰囲気</h3>
          <p>生まれた瞬間、東の地平線から昇っていたのは <b style="color:var(--gold-bright)">${asc.sign.sym} ${asc.sign.n}</b>(${asc.deg.toFixed(1)}°)。初対面の人にはまず、${asc.sign.style}という印象を与えます。</p>
        </div>` : `
        <div class="result-block">
          <h3>アセンダント</h3>
          <p class="dim">出生時刻が分かると、生まれた瞬間の東の地平線=アセンダント(第一印象・まとう雰囲気)まで読めます。</p>
        </div>`}

        <div class="result-block">
          <h3>十天体の配置</h3>
          ${planetRows}
          <p class="dim" style="margin-top:10px;">天王星・海王星・冥王星は動きが遅く、同世代が共有する「時代の気分」を表します。</p>
        </div>

        <div class="result-block">
          <h3>主要アスペクト ── 星々の対話</h3>
          ${(() => {
            const asp = findAspects(rows);
            if (!asp.length) return `<p class="dim">主要な角度を作る組み合わせはありませんでした。星々がそれぞれ独立に働く、一匹狼型の配置です。</p>`;
            return asp.slice(0, 6).map(x => `
              <p><b style="color:var(--gold-bright)">${x.p1.sym}${x.p1.name} × ${x.p2.sym}${x.p2.name}</b> ── <b style="color:var(--shu-bright)">${x.a.n}・${x.a.tag}</b><br>
              <span style="font-size:13px;">${x.p1.lens}と${x.p2.lens}のあいだの角度。${x.a.text}</span></p>`).join("");
          })()}
          <p class="dim">誤差(オーブ)の小さい順に最大6つまで表示しています。</p>
        </div>

        <div class="result-block">
          <h3>エレメントバランス ── 四大元素</h3>
          ${(() => {
            const counts = { "火": 0, "地": 0, "風": 0, "水": 0 };
            rows.forEach(r => counts[r.sign.elem]++);
            if (asc) counts[asc.sign.elem]++;
            const max = Math.max(...Object.values(counts), 1);
            const bars = Object.entries(counts).map(([e, c]) => `
              <div class="bar-row">
                <span class="bar-label">${e}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${c / max * 100}%; background:${ELEM_COLOR[e]}"></div></div>
                <span class="bar-num">${c}</span>
              </div>`).join("");
            const strongest = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            const missing = Object.entries(counts).filter(([, c]) => c === 0).map(([e]) => e);
            return bars + `<p style="margin-top:10px;">最も強い元素は<b style="color:var(--gold-bright)">「${strongest[0]}」</b>――${ELEM_NOTE[strongest[0]]}の気質が土台です。${missing.length ? `<b style="color:var(--shu-bright)">「${missing.join("・")}」</b>が欠けており、${missing.map(e => ELEM_NOTE[e]).join("、")}は意識して補う伸びしろです。` : "四元素がすべて揃ったバランス型です。"}</p>`;
          })()}
        </div>

        ${Uranai.glossary([
          ["アスペクト", "天体どうしが作る特定の角度(0・60・90・120・180度)。星と星の「会話の調子」を表し、調和角は才能、緊張角は成長課題として読みます。"],
          ["オーブ", "アスペクト成立とみなす角度の許容誤差。誤差が小さいほど、その対話は強く働きます。"],
          ["エレメント(四大元素)", "12星座を火・地・風・水に4分類したもの。天体がどの元素に多く集まるかで、その人の基本気質が見えます。"],
          ["ホロスコープ", "生まれた瞬間の天体の配置を写し取った天空の図。この鑑定全体が、あなたのホロスコープを読んだものです。"],
          ["太陽星座", "生まれたとき太陽が入っていた星座。雑誌の「○○座のあなた」はこれ。人生の目的や生き方の軸を表します。"],
          ["月星座", "生まれたとき月が入っていた星座。素顔・感情・安心のかたちなど、親しい人にだけ見せる内面を表します。"],
          ["アセンダント(ASC)", "生まれた瞬間に東の地平線から昇っていた星座。まとう雰囲気や第一印象を表し、出生時刻と出生地から計算します。"],
          ["サイン(星座)", "太陽の通り道(黄道)を春分点から30度ずつ12分割した区分。実際の星の並びではなく、天の「区画」です。"],
          ["度数(°)", "その天体が星座の中のどのあたりにいるかを示す位置。0度が星座の入口、29度が出口です。"],
          ["活動・不動・柔軟宮", "12星座のもう一つの分類。活動=始める力、不動=続ける力、柔軟=変わり身の力。"],
          ["守護星", "各星座を司るとされる天体。その星座の気質の源です。"],
          ["トロピカル方式", "春分点を牡羊座0度とする、西洋占星術の標準的な座標の取り方。実際の星座の位置基準(インド占星術)とは約24度ずれます。"],
        ])}
      </div>
    `;
    area.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  Uranai.renderForm(
    document.getElementById("form-area"),
    { timeNote: "月とアセンダントの精度が上がります", placeNote: "アセンダントの計算に使います" },
    divine
  );
  Uranai.initTabs();
})();
