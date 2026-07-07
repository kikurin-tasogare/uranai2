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
          <div class="field">
            <label>生年月日</label>
            <input type="date" id="u-date" min="1900-01-01" max="2035-12-31">
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

    function readForm() {
      const dateStr = $("#u-date").value;
      if (!dateStr) { alert("生年月日を入れてください"); return null; }
      const [y, m, d] = dateStr.split("-").map(Number);
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
      };
    }

    function fillForm(p) {
      $("#u-name").value = p.name;
      $("#u-date").value = `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
      $("#u-time").value = `${String(p.hh).padStart(2, "0")}:${String(p.mi).padStart(2, "0")}`;
      $("#u-notime").checked = !p.timeKnown;
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

  return { PREFS, esc, loadProfiles, upsertProfile, removeProfile, renderForm, initTabs };
})();
