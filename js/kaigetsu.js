/* ============================================================
   kaigetsu.js — 海月占術(占蔵オリジナル)
   誕生日(通し日数)を20で割った余りから、
   四つの水域に棲む生き物を一体割り当てる。
   歴史的根拠のない、占蔵だけの創作占い。
   ============================================================ */

(() => {
  const ZONES = ["渚エリア", "サンゴ礁エリア", "深海エリア", "大海エリア"];
  const ZONE_NOTE = [
    "岸に近い、まったりとした水域",
    "色とりどりの、賑やかな水域",
    "光の届かぬ、静かで神秘の水域",
    "果てのない、開かれた水域",
  ];

  const CREATURES = [
    // 渚エリア
    { n: "ラッコ", key: "くつろぎと工夫", text: "貝を割る石を手放さない、道具上手な渚の住人。忙しない波間でも仰向けに浮かんでまったりする達人です。安心できる相手となら、腹の上でご飯を食べるくらいの隙を見せられる人。工夫と余裕を両立させる、渚いちばんの生活の匠です。" },
    { n: "ウミガメ", key: "悠久の歩み", text: "何十年もかけて同じ浜へ帰る、気の長い旅人。急かされても歩みは変えず、自分の速度で確実に進みます。甲羅の下には見た目以上の芯の強さを秘め、荒波の中でも沈まない浮力があります。ゆっくりが、実はいちばん遠くまで行ける人です。" },
    { n: "ペンギン", key: "群れと一途", text: "陸ではよちよち、水中では魚も逃げ出す俊敏さに変わる、ギャップの住人。一度つがいになった相手には驚くほど一途で、群れの中の絆を何より大切にします。不器用に見える瞬間こそ、実は本気の証拠という人です。" },
    { n: "アザラシ", key: "脱力と警戒", text: "岩の上でとろけるように寝そべりながら、水音ひとつで一瞬にして海へ消える。緩んでいるようで、実は誰よりも周囲を感じ取っている用心深さの持ち主。力を抜くことと油断しないことを両立できる、渚の名手です。" },
    { n: "イソギンチャク", key: "根を張る受容", text: "一つの岩に根を張り、訪れるものを拒まず受け入れる懐の深さ。派手に動かずとも、そこにいるだけで小さな命の避難所になります。動かない強さ、待つ豊かさを知っている、渚の静かな主です。" },
    // サンゴ礁エリア
    { n: "クマノミ", key: "縄張りと絆", text: "イソギンチャクという小さな家を命がけで守る、健気な守護者。群れの中の序列をわきまえながらも、自分の居場所だけは誰にも譲りません。小さな体に見合わない気概を持つ、サンゴ礁の頑張り屋です。" },
    { n: "タツノオトシゴ", key: "不器用な誠実", text: "泳ぎは決して上手くないのに、尾で海藻に掴まって流されまいと踏ん張る不器用な誠実さ。オスが子を育てるという役割の逆転も持つ、常識にとらわれない生き方の持ち主です。ゆっくり、けれど離れない人。" },
    { n: "マンタ", key: "悠然たる大器", text: "大きな翼のようなヒレで、海中をまるで飛ぶように進む悠然とした存在感。争わず、騒がず、それでいて誰よりも目を引く。器の大きさとは、力を誇示しないことだと知っている大物です。" },
    { n: "ウミウシ", key: "個性という彩り", text: "殻を脱ぎ捨て、色と模様だけで自分を主張する変わり者。地味な岩陰にも、思いがけない色彩を宿しています。人と違う見た目を恥じない、むしろそれを武器にする、サンゴ礁いちばんの個性派です。" },
    { n: "チンアナゴ", key: "臆病な仲間意識", text: "砂から顔だけ出し、危険を感じるとさっと引っ込む臆病者。けれど隣にはいつも仲間がずらり――一人では出てこられなくても、みんなとなら顔を出せる。臆病さは、仲間がいれば勇気に変わります。" },
    // 深海エリア
    { n: "クラゲ(海月)", key: "漂う透明な心", text: "骨も脳もないのに、潮の流れひとつで美しく形を変えていく透明な心の持ち主。争わず、流れに身を任せながらも、触れた者には忘れられない印象を残します。柔らかさこそが、いちばんの強さという生き方です。" },
    { n: "タコ", key: "変幻自在の知恵", text: "岩にも海藻にも、なんにでも姿を変えられる知恵者。八本の腕でいくつもの問題を同時に抱えながら、器用に切り抜けていきます。正体を隠す賢さと、いざという時の大胆さを併せ持つ深海の策士です。" },
    { n: "チョウチンアンコウ", key: "静かな誘い", text: "自ら光を灯し、暗闇の中でじっと獲物を待つ忍耐の主。声高に叫ばずとも、その静かな灯りに引き寄せられる者は多い。焦らず、自分の光だけを信じて待てる人です。" },
    { n: "ダイオウグソクムシ", key: "省エネの哲人", text: "何年も食べずに深海でじっと動かずにいられる、驚異の省エネ体質。無駄なエネルギーを使わず、ここぞという時のためだけに力を蓄えます。焦らない胆力を持つ、深海の哲学者です。" },
    { n: "リュウグウノツカイ", key: "神話めいた孤高", text: "銀色にきらめく長い体で、深海を静かに漂う伝説の使者。滅多に姿を見せないその神秘性ゆえ、古くから吉兆にも凶兆にも語られてきました。人前に出ないからこそ、語り草になる孤高の存在です。" },
    // 大海エリア
    { n: "イルカ", key: "遊び心と知性", text: "誰よりも賢く、誰よりもよく遊ぶ、知性と陽気さを兼ね備えた海の人気者。仲間を思いやる社会性は群を抜き、困った仲間がいれば助けに向かう情の深さも。遊ぶことと考えることを両立できる才人です。" },
    { n: "シャチ", key: "統率する家族愛", text: "海の頂点に立つ力を持ちながら、その力を家族のために使う統率者。群れの絆は生涯続き、年長者の知恵が若い世代に受け継がれていきます。強さとは、守るために使うものだと知っている王者です。" },
    { n: "ジンベエザメ", key: "大らかな包容", text: "海最大の魚でありながら、性格は驚くほど穏やか。小さな魚たちを気にせず泳がせる、争わない大らかさの持ち主です。大きいことは威圧することではなく、受け入れる余白を持つことだと教えてくれます。" },
    { n: "マグロ", key: "止まらない情熱", text: "泳ぎを止めると呼吸すらままならない、生涯泳ぎ続ける宿命の持ち主。立ち止まることを恐れるより、動き続けることで自分を保つタイプです。休みなく前進する、大海の情熱家です。" },
    { n: "ザトウクジラ", key: "歌う遠い記憶", text: "何千キロも離れた仲間に届くほどの声で歌う、大海の吟遊詩人。その歌は世代を超えて少しずつ形を変えながら伝わっていきます。声にすることを恐れない人、思いを届けようとする人です。" },
  ];

  const REL_TEXT = [
    { name: "同じ水槽の群れ", luck: "◎", text: "同じ水域を泳ぐ、息の合った群れです。似た呼吸で泳げるので、一緒にいるだけで自然と歩調が合います。何も言わなくても隣を泳いでいる、それだけで安心できる相性です。" },
    { name: "隣り合う水域の顔なじみ", luck: "○", text: "隣り合う水域に暮らす、顔なじみの間柄。時々境界を越えて行き来しながら、程よい距離で泳ぎ続けられます。似すぎず離れすぎず、ちょうどいい潮目の相性です。" },
    { name: "めったに出会わない水域どうし", luck: "△", text: "普段は別々の水域を泳ぐ、めったに出会わない組み合わせ。会うたびに新鮮な発見があり、互いの知らない顔を見せ合える相性です。たまに覗く隣の水槽は、いつも新鮮に映ります。" },
  ];

  // 誕生日(月日)→ その年の通し日数(閏日の扱いは気にしない簡易計算)
  const CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  function dayOfYear(m, d) { return CUM[m - 1] + d; }

  function creatureOf(m, d) {
    return (dayOfYear(m, d) - 1) % 20;
  }

  function divine(p) {
    const area = document.getElementById("result-area");
    const idx = creatureOf(p.m, p.d);
    const c = CREATURES[idx];
    const zoneIdx = Math.floor(idx / 5);

    area.innerHTML = `
      <div class="result">
        <div class="result-head"><div class="for">${Uranai.esc(p.name)} の水槽</div></div>
        <div class="result-main">
          <div class="label">あ な た の 生 き 物</div>
          <div class="value">${c.n}</div>
          <div class="value-sub">${c.key} ── ${ZONES[zoneIdx]}</div>
          <div class="result-text">${c.text}</div>
        </div>

        <div class="result-block">
          <h3>棲む水域 ── ${ZONES[zoneIdx]}</h3>
          <p>${ZONE_NOTE[zoneIdx]}。あなたはこの水域を泳ぐ${CREATURES.length}分の1、${c.n}です。</p>
        </div>

        <div class="result-block">
          <h3>ふたりの水槽相性</h3>
          <p class="dim">もう一人の生年月日を入れると、二つの水域の距離から相性を観ます。</p>
          <div class="field-row" style="margin-top:10px;">
            <div class="field" style="flex:1 1 120px;">
              <label>お相手の呼び名</label>
              <input type="text" id="k-name2" placeholder="例:ゆきちゃん">
            </div>
            <div class="field" style="flex:2 1 240px;">
              <label>お相手の生年月日</label>
              ${Uranai.dateSelectsHTML("k-date2")}
            </div>
          </div>
          <button class="btn-sub" id="k-check" style="width:100%; padding:10px;">水 槽 を の ぞ く</button>
          <div id="kaigetsu-out"></div>
        </div>

        ${Uranai.glossary([
          ["海月(かいげつ)", "クラゲを表す古い言葉。海に浮かぶ月のような姿から、この字が当てられました。占い名の由来です。"],
          ["水域(すいいき)", "本占いで生き物を4つに分類した棲み処。渚・サンゴ礁・深海・大海の4エリアがあります。"],
          ["占蔵オリジナル", "実在する伝統や暦学的根拠を持たない、この図鑑のために作られた創作の占いという意味です。"],
        ])}
      </div>
    `;

    Uranai.wireDateSelects(area, "k-date2");
    area.querySelector("#k-check").addEventListener("click", () => {
      const ymd = Uranai.readDateSelects(area, "k-date2");
      if (!ymd) { alert("お相手の生年月日(年・月・日)を選んでください"); return; }
      const idx2 = creatureOf(ymd.m, ymd.d);
      const c2 = CREATURES[idx2];
      const zone2 = Math.floor(idx2 / 5);
      const name2 = area.querySelector("#k-name2").value.trim() || "お相手";
      const dist = Math.min(Math.abs(zoneIdx - zone2), 4 - Math.abs(zoneIdx - zone2));
      const rel = REL_TEXT[dist];

      area.querySelector("#kaigetsu-out").innerHTML = `
        <div style="margin-top:16px; padding:16px 18px; border:1px solid var(--gold-dim); border-radius:6px; background:var(--ink-2);">
          <p style="text-align:center; margin-bottom:10px;">
            <b style="color:var(--gold-bright)">${c.n}</b>(${Uranai.esc(p.name)})×
            <b style="color:var(--gold-bright)">${c2.n}</b>(${Uranai.esc(name2)})<br>
            <span style="font-size:19px; color:var(--shu-bright); letter-spacing:0.1em;">${rel.name} ${rel.luck}</span>
          </p>
          <p style="font-size:13.5px;">${rel.text}</p>
          <p class="dim" style="margin-top:8px;">${Uranai.esc(name2)}は${ZONES[zone2]}に棲む${c2.n}(${c2.key})です。</p>
        </div>`;
    });

    area.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  Uranai.renderForm(
    document.getElementById("form-area"),
    { timeNote: "海月占術は誕生日だけで占うため時刻は不要です", placeNote: "海月占術では使いません" },
    divine
  );
  Uranai.initTabs();
})();
