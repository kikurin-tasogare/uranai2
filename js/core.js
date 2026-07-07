/* ============================================================
   core.js — プロフィール管理と共通UI
   生年月日などの入力を localStorage に保存し、
   全占術ページで使い回せるようにする。
   ============================================================ */

const Uranai = (() => {
  const LS_KEY = "uranai2.profiles";

  // HTMLエスケープ(ユーザー入力をinnerHTMLに混ぜる際は必ず通す)
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  /* ---------- 都道府県(県庁所在地の概略緯度経度) ---------- */
  const PREFS = [
    ["北海道", 43.06, 141.35], ["青森県", 40.82, 140.74], ["岩手県", 39.70, 141.15],
    ["宮城県", 38.27, 140.87], ["秋田県", 39.72, 140.10], ["山形県", 38.24, 140.36],
    ["福島県", 37.75, 140.47], ["茨城県", 36.34, 140.45], ["栃木県", 36.57, 139.88],
    ["群馬県", 36.39, 139.06], ["埼玉県", 35.86, 139.65], ["千葉県", 35.61, 140.12],
    ["東京都", 35.69, 139.69], ["神奈川県", 35.45, 139.64], ["新潟県", 37.90, 139.02],
    ["富山県", 36.70, 137.21], ["石川県", 36.59, 136.63], ["福井県", 36.07, 136.22],
    ["山梨県", 35.66, 138.57], ["長野県", 36.65, 138.18], ["岐阜県", 35.39, 136.72],
    ["静岡県", 34.98, 138.38], ["愛知県", 35.18, 136.91], ["三重県", 34.73, 136.51],
    ["滋賀県", 35.00, 135.87], ["京都府", 35.02, 135.76], ["大阪府", 34.69, 135.52],
    ["兵庫県", 34.69, 135.18], ["奈良県", 34.69, 135.83], ["和歌山県", 34.23, 135.17],
    ["鳥取県", 35.50, 134.24], ["島根県", 35.47, 133.05], ["岡山県", 34.66, 133.93],
    ["広島県", 34.40, 132.46], ["山口県", 34.19, 131.47], ["徳島県", 34.07, 134.56],
    ["香川県", 34.34, 134.04], ["愛媛県", 33.84, 132.77], ["高知県", 33.56, 133.53],
    ["福岡県", 33.61, 130.42], ["佐賀県", 33.25, 130.30], ["長崎県", 32.74, 129.87],
    ["熊本県", 32.79, 130.74], ["大分県", 33.24, 131.61], ["宮崎県", 31.91, 131.42],
    ["鹿児島県", 31.56, 130.56], ["沖縄県", 26.21, 127.68],
  ];

  /* ---------- プロフィール保存 ---------- */
  function loadProfiles() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveProfiles(list) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }
  function upsertProfile(p) {
    const list = loadProfiles();
    const i = list.findIndex(x => x.name === p.name);
    if (i >= 0) list[i] = p; else list.push(p);
    saveProfiles(list);
  }
  function removeProfile(name) {
    saveProfiles(loadProfiles().filter(x => x.name !== name));
  }

  /* ---------- 生年月日プルダウン(年・月・日を一発選択) ---------- */
  function dateSelectsHTML(prefix, startYear = 1920, endYear = 2035) {
    const ys = [];
    for (let y = endYear; y >= startYear; y--) ys.push(`<option value="${y}">${y}</option>`);
    const ms = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("");
    const ds = Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("");
    return `<div style="display:flex; gap:8px; align-items:center;">
      <select id="${prefix}-y" style="flex:1.5; width:auto;"><option value="">年</option>${ys.join("")}</select><span style="color:var(--text-faint);font-size:12px;">年</span>
      <select id="${prefix}-m" style="flex:1; width:auto;"><option value="">月</option>${ms}</select><span style="color:var(--text-faint);font-size:12px;">月</span>
      <select id="${prefix}-d" style="flex:1; width:auto;"><option value="">日</option>${ds}</select><span style="color:var(--text-faint);font-size:12px;">日</span>
    </div>`;
  }

  // 月に応じて日の選択肢(29〜31日)を無効化する
  function wireDateSelects(root, prefix) {
    const $y = root.querySelector(`#${prefix}-y`);
    const $m = root.querySelector(`#${prefix}-m`);
    const $d = root.querySelector(`#${prefix}-d`);
    function adjust() {
      const y = Number($y.value) || 2000;
      const m = Number($m.value) || 1;
      const max = new Date(y, m, 0).getDate();
      [...$d.options].forEach(o => { if (o.value) o.disabled = Number(o.value) > max; });
      if (Number($d.value) > max) $d.value = "";
    }
    $y.addEventListener("change", adjust);
    $m.addEventListener("change", adjust);
  }

  function readDateSelects(root, prefix) {
    const y = Number(root.querySelector(`#${prefix}-y`).value);
    const m = Number(root.querySelector(`#${prefix}-m`).value);
    const d = Number(root.querySelector(`#${prefix}-d`).value);
    if (!y || !m || !d) return null;
    return { y, m, d };
  }

  function setDateSelects(root, prefix, y, m, d) {
    root.querySelector(`#${prefix}-y`).value = String(y);
    root.querySelector(`#${prefix}-m`).value = String(m);
    root.querySelector(`#${prefix}-d`).value = String(d);
  }

  /* ---------- 入力フォーム ---------- */
  // opts: { timeNote, placeNote } 説明文の差し替え用
  // onDivine(profile) が「占う」押下時に呼ばれる
  function renderForm(container, opts, onDivine) {
    const prefOptions = PREFS.map((p, i) => `<option value="${i}">${p[0]}</option>`).join("");
    container.innerHTML = `
      <div class="form-panel">
        <div class="form-title">生 年 月 日 を 納 め よ</div>
        <div class="profile-chips" id="u-chips"></div>
        <div class="field-row">
          <div class="field" style="flex:1.2 1 160px;">
            <label>名前(呼び名)</label>
            <input type="text" id="u-name" placeholder="例:きくりん">
          </div>
          <div class="field" style="flex:2 1 240px;">
            <label>生年月日</label>
            ${dateSelectsHTML("u-date")}
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>出生時刻</label>
            <input type="time" id="u-time" value="12:00">
            <div class="hint">${opts.timeNote || "分かる範囲でOK"}</div>
          </div>
          <div class="field">
            <label>出生地</label>
            <select id="u-pref">${prefOptions}</select>
            <div class="hint">${opts.placeNote || ""}</div>
          </div>
          <div class="field" style="flex:0.7 1 110px;">
            <label>性別</label>
            <select id="u-sex">
              <option value="">未指定</option>
              <option value="F">女性</option>
              <option value="M">男性</option>
            </select>
            <div class="hint">四柱推命の大運で使用</div>
          </div>
        </div>
        <div class="check-row">
          <input type="checkbox" id="u-notime">
          <label for="u-notime">出生時刻が分からない(正午として扱い、時刻を使う判定は省略)</label>
        </div>
        <button class="btn-divine" id="u-divine">占 う</button>
        <div style="text-align:center; margin-top:12px;">
          <button class="btn-sub" id="u-save">この人を記憶しておく</button>
        </div>
      </div>
    `;
    const $ = id => container.querySelector(id);
    $("#u-pref").value = "12"; // 東京都を初期値に
    wireDateSelects(container, "u-date");

    function readForm() {
      const ymd = readDateSelects(container, "u-date");
      if (!ymd) { alert("生年月日(年・月・日)を選んでください"); return null; }
      const { y, m, d } = ymd;
      const noTime = $("#u-notime").checked;
      let hh = 12, mi = 0;
      if (!noTime && $("#u-time").value) {
        [hh, mi] = $("#u-time").value.split(":").map(Number);
      }
      const prefIdx = Number($("#u-pref").value);
      return {
        name: $("#u-name").value.trim() || "名無しの旅人",
        y, m, d, hh, mi,
        timeKnown: !noTime,
        pref: PREFS[prefIdx][0],
        lat: PREFS[prefIdx][1],
        lon: PREFS[prefIdx][2],
        sex: $("#u-sex").value,
      };
    }

    function fillForm(p) {
      $("#u-name").value = p.name;
      setDateSelects(container, "u-date", p.y, p.m, p.d);
      $("#u-time").value = `${String(p.hh).padStart(2, "0")}:${String(p.mi).padStart(2, "0")}`;
      $("#u-notime").checked = !p.timeKnown;
      $("#u-sex").value = p.sex || "";
      const i = PREFS.findIndex(x => x[0] === p.pref);
      if (i >= 0) $("#u-pref").value = String(i);
    }

    function renderChips() {
      const chips = $("#u-chips");
      const list = loadProfiles();
      chips.innerHTML = list.length
        ? list.map(p => `<button class="chip" data-name="${esc(p.name)}">${esc(p.name)}<span class="x" title="削除">×</span></button>`).join("")
        : `<span style="font-size:11.5px;color:var(--text-faint);">よく占う人は「記憶」しておくと、次からワンタップで呼び出せます</span>`;
      chips.querySelectorAll(".chip").forEach(btn => {
        btn.addEventListener("click", e => {
          const p = loadProfiles().find(x => x.name === btn.dataset.name);
          if (e.target.classList.contains("x")) {
            if (confirm(`「${btn.dataset.name}」を忘れますか?`)) { removeProfile(btn.dataset.name); renderChips(); }
            return;
          }
          if (p) fillForm(p);
        });
      });
    }
    renderChips();

    $("#u-save").addEventListener("click", () => {
      const p = readForm();
      if (!p) return;
      upsertProfile(p);
      renderChips();
    });
    $("#u-divine").addEventListener("click", () => {
      const p = readForm();
      if (!p) return;
      onDivine(p);
    });
  }

  /* ---------- PWA: サービスワーカー登録(オフライン対応) ---------- */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* 非対応環境では静かに諦める */ });
  }

  /* ---------- 漂うクラゲ(祐希ちゃんが好きなので全ページに) ---------- */
  function jellySVG(main, spots) {
    return `<svg viewBox="0 0 64 88" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="${main}" fill="none" stroke-width="2" stroke-linecap="round">
        <path d="M10 34 C10 12 54 12 54 34 C54 41 48 44 32 44 C16 44 10 41 10 34 Z" fill="${main}" fill-opacity="0.12"/>
        <path d="M18 46 C16 58 22 62 18 74"/>
        <path d="M26 46 C28 60 22 66 26 80"/>
        <path d="M34 46 C32 58 38 64 34 78"/>
        <path d="M42 46 C44 58 38 64 42 74"/>
        <path d="M48 44 C50 52 46 56 48 64"/>
      </g>
      <g fill="${spots}" fill-opacity="0.8">
        <circle cx="24" cy="28" r="2.6"/>
        <circle cx="34" cy="23" r="2"/>
        <circle cx="42" cy="30" r="2.2"/>
      </g>
    </svg>`;
  }

  function scatterJellyfish() {
    const jade = "#5fbf9a", cyan = "#69c3da", pink = "#ef93bd";
    const jellies = [
      { top: "16%", right: "6%",  w: 64, main: cyan, spots: pink, op: 0.4,  dur: "13s" },
      { top: "46%", left:  "4%",  w: 44, main: pink, spots: cyan, op: 0.32, dur: "17s" },
      { top: "72%", right: "10%", w: 52, main: jade, spots: pink, op: 0.34, dur: "15s" },
      { top: "8%",  left:  "14%", w: 30, main: cyan, spots: pink, op: 0.26, dur: "11s" },
    ];
    for (const j of jellies) {
      const el = document.createElement("div");
      el.className = "jelly";
      el.style.cssText =
        `width:${j.w}px; opacity:${j.op}; --dur:${j.dur};` +
        (j.top ? `top:${j.top};` : "") + (j.left ? `left:${j.left};` : "") + (j.right ? `right:${j.right};` : "");
      el.innerHTML = jellySVG(j.main, j.spots);
      document.body.appendChild(el);
    }
  }
  scatterJellyfish();

  /* ---------- タブ切り替え ---------- */
  function initTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  /* ---------- 用語のしおり ---------- */
  // items: [[用語, 説明], ...] → 折りたたみ式の用語解説ブロック
  function glossary(items) {
    return `<details class="glossary">
      <summary>用語のしおり ── この鑑定に出てくる言葉</summary>
      <dl>${items.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl>
    </details>`;
  }

  return {
    PREFS, esc, glossary,
    dateSelectsHTML, wireDateSelects, readDateSelects, setDateSelects,
    loadProfiles, upsertProfile, removeProfile, renderForm, initTabs,
  };
})();
