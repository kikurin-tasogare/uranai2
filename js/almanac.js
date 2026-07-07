/* ============================================================
   almanac.js — 暦・天文計算コア
   astronomy-engine (MIT) を土台に、
   太陽黄経 / 二十四節気 / 干支 / 旧暦(天保暦準拠) /
   真太陽時 / 月・惑星の黄経 / アセンダント を提供する。
   時刻はすべて日本標準時(JST)で扱う。
   ============================================================ */

const Almanac = (() => {
  const A = Astronomy;
  const DEG = Math.PI / 180;

  /* ---------- 時刻ユーティリティ ---------- */

  // JSTの年月日時分 → Dateオブジェクト(内部UTC)
  function jst(y, m, d, hh = 12, mm = 0) {
    return new Date(Date.UTC(y, m - 1, d, hh - 9, mm));
  }

  // Date → JSTの暦日 {y, m, d, hh, mm}
  function toJst(date) {
    const t = new Date(date.getTime() + 9 * 3600 * 1000);
    return {
      y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(),
      hh: t.getUTCHours(), mm: t.getUTCMinutes(),
    };
  }

  // グレゴリオ暦(暦日)→ ユリウス通日(その日の正午のJDN)
  function jdn(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 +
      Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
  }

  /* ---------- 太陽・月・惑星 ---------- */

  // 太陽の視黄経(その日付時点の分点基準)
  function sunLon(date) { return A.SunPosition(date).elon; }

  // 月の地心黄経
  function moonLon(date) { return A.EclipticGeoMoon(date).lon; }

  // 惑星の地心黄経(光行差補正あり・分点は日付時点)
  function planetLon(bodyName, date) {
    if (bodyName === "Sun") return sunLon(date);
    if (bodyName === "Moon") return moonLon(date);
    const vec = A.GeoVector(A.Body[bodyName], date, true);
    return A.Ecliptic(vec).elon;
  }

  // 太陽黄経がtargetLonになる瞬間を探索(startからlimitDays以内)
  function searchSunLon(targetLon, start, limitDays) {
    const t = A.SearchSunLongitude(targetLon, start, limitDays);
    return t ? t.date : null;
  }

  /* ---------- 二十四節気 ---------- */

  // 「節」(月の切り替わり)の黄経: 立春315から30度刻み
  const SETSU_LON = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
  const SETSU_NAME = ["立春","啓蟄","清明","立夏","芒種","小暑","立秋","白露","寒露","立冬","大雪","小寒"];

  // ある年の立春(JST)
  function risshun(year) {
    return searchSunLon(315, jst(year, 1, 25, 0), 20);
  }

  // birth(Date)直前の「節」を返す → {index(0=立春月/寅月), name, time}
  function lastSetsu(birth) {
    // 40日前から探索し、birth以前で最後の節を拾う
    let best = null;
    for (let k = 0; k < SETSU_LON.length; k++) {
      // birthの前後45日窓で該当黄経の通過を探す(前後2回分チェック)
      for (const back of [50, 400]) {
        const start = new Date(birth.getTime() - back * 86400 * 1000);
        let t = searchSunLon(SETSU_LON[k], start, back / 365 > 0.5 ? 370 : 60);
        while (t && t <= birth) {
          if (!best || t > best.time) best = { index: k, name: SETSU_NAME[k], time: t };
          // 同じ黄経の次の通過(約1年後)がまだbirth以前の可能性
          const nt = searchSunLon(SETSU_LON[k], new Date(t.getTime() + 300 * 86400 * 1000), 130);
          if (nt && nt <= birth) { t = nt; } else break;
        }
        if (best) break; // 直近50日窓で見つかればそれ以上遡らない
      }
    }
    return best;
  }

  /* ---------- 干支(六十干支) ---------- */

  const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const STEMS_YOMI = ["きのえ","きのと","ひのえ","ひのと","つちのえ","つちのと","かのえ","かのと","みずのえ","みずのと"];
  const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const BRANCHES_YOMI = ["ね","うし","とら","う","たつ","み","うま","ひつじ","さる","とり","いぬ","い"];

  // 日柱干支番号(0=甲子)。JST暦日基準・0時切替。
  // 検証アンカー: 2000-01-01 = 戊午(54)
  function dayKanshi(y, m, d) {
    return ((jdn(y, m, d) + 49) % 60 + 60) % 60;
  }

  /* ---------- 旧暦(天保暦の置閏法に準拠) ---------- */
  // 朔(新月)で月が始まり、冬至を含む月を11月とする。
  // 11月から次の11月の間に13ヶ月ある場合、中気を含まない最初の月を閏月とする。

  // JST暦日番号(JDN)を返す新月列: fromDate以降、n個
  function newMoonsFrom(fromDate, count) {
    const list = [];
    let t = A.SearchMoonPhase(0, fromDate, 40);
    while (t && list.length < count) {
      list.push(t.date);
      t = A.SearchMoonPhase(0, new Date(t.date.getTime() + 20 * 86400 * 1000), 40);
    }
    return list;
  }

  // JDN(JST暦日) → その日の0時(JST)のDate
  // 正午UTC = (j - 2440587.5)日 なので、JST 0時はそこから21時間前
  function jdnToJstMidnight(j) {
    return new Date((j - 2440588) * 86400000 - 9 * 3600000);
  }

  // 旧暦月 [朔日JDN, 翌朔日JDN) の暦日内に中気(太陽黄経30の倍数)の日が含まれるか
  // ※判定は瞬間ではなく「中気がどのJST暦日に落ちるか」で行う(旧暦の月界は暦日)
  function hasChuki(startJdn, endJdn) {
    const start = jdnToJstMidnight(startJdn);
    const end = jdnToJstMidnight(endJdn);
    const lonS = sunLon(start);
    let next = (Math.ceil(lonS / 30) * 30) % 360;
    if (Math.abs(lonS - Math.round(lonS / 30) * 30) < 1e-9) next = (Math.round(lonS / 30) * 30 + 30) % 360;
    let t = searchSunLon(next, start, (endJdn - startJdn) + 2);
    while (t) {
      const j = toJst(t);
      const tj = jdn(j.y, j.m, j.d);
      if (tj >= endJdn) return false;
      if (tj >= startJdn) return true;
      // 中気の瞬間が朔日より前の暦日に落ちた → 次の中気を見る
      t = searchSunLon((next + 30) % 360, t, 40);
      next = (next + 30) % 360;
    }
    return false;
  }

  // グレゴリオ暦(JST) y/m/d → 旧暦 {month, day, leap}
  function kyureki(y, m, d) {
    const targetJdn = jdn(y, m, d);
    // 前年と当年の冬至
    const ws1 = searchSunLon(270, jst(y - 1, 12, 1, 0), 40);
    const ws2 = searchSunLon(270, jst(y, 12, 1, 0), 40);
    // 前年冬至の40日前から新月を17個収集(13ヶ月+余裕)
    const start = new Date(ws1.getTime() - 45 * 86400 * 1000);
    const moons = newMoonsFrom(start, 18);
    // 各月の朔日(JST暦日)
    const monthStartJdn = moons.map(t => { const j = toJst(t); return jdn(j.y, j.m, j.d); });
    // 冬至を含む月のインデックス
    function monthIndexOf(dateJdnVal) {
      for (let i = 0; i < monthStartJdn.length - 1; i++) {
        if (monthStartJdn[i] <= dateJdnVal && dateJdnVal < monthStartJdn[i + 1]) return i;
      }
      return -1;
    }
    const wj1 = toJst(ws1), wj2 = toJst(ws2);
    const iA = monthIndexOf(jdn(wj1.y, wj1.m, wj1.d)); // 前年11月
    const iB = monthIndexOf(jdn(wj2.y, wj2.m, wj2.d)); // 当年11月
    if (iA < 0 || iB < 0) throw new Error("旧暦計算: 冬至月の特定に失敗");

    const nMonths = iB - iA; // 12なら平年、13なら閏年
    // 月番号の割り当て
    const numbers = {}; // index -> {num, leap}
    let leapUsed = false;
    let num = 11;
    numbers[iA] = { num: 11, leap: false };
    for (let i = iA + 1; i <= iB + 2 && i < monthStartJdn.length - 1; i++) {
      if (nMonths === 13 && !leapUsed && i <= iB) {
        // 中気を含まない最初の月を閏月に
        if (!hasChuki(monthStartJdn[i], monthStartJdn[i + 1])) {
          numbers[i] = { num: num, leap: true }; // 直前の月と同じ番号
          leapUsed = true;
          continue;
        }
      }
      num = num % 12 + 1;
      numbers[i] = { num: num, leap: false };
    }
    // 前年11月より前の月にも番号を振る(10月, 9月…と遡る)
    let back = 11;
    for (let i = iA - 1; i >= 0; i--) {
      back = (back + 10) % 12 + 1; // 11→10→9…
      numbers[i] = { num: back, leap: false };
    }
    const idx = monthIndexOf(targetJdn);
    if (idx < 0 || !numbers[idx]) throw new Error("旧暦計算: 対象月の特定に失敗");
    return {
      month: numbers[idx].num,
      leap: numbers[idx].leap,
      day: targetJdn - monthStartJdn[idx] + 1,
    };
  }

  /* ---------- 均時差・真太陽時 ---------- */

  // 均時差(分) NOAA近似式
  function equationOfTime(y, m, d, hh = 12) {
    const start = Date.UTC(y, 0, 0);
    const doy = (Date.UTC(y, m - 1, d) - start) / 86400000;
    const g = 2 * Math.PI / 365 * (doy - 1 + (hh - 12) / 24);
    return 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
      - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  }

  // JSTの時刻を真太陽時(分単位のオフセット)に補正
  // lonDeg: 出生地の東経。JST基準子午線=135度
  function trueSolarOffsetMin(y, m, d, lonDeg) {
    return (lonDeg - 135) * 4 + equationOfTime(y, m, d);
  }

  /* ---------- アセンダント ---------- */

  // 平均黄道傾斜角(度)
  function obliquity(date) {
    const T = (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
    return 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T;
  }

  // アセンダント黄経(度) lat/lon: 度
  function ascendant(date, latDeg, lonDeg) {
    const gast = A.SiderealTime(date); // 時
    const ramc = ((gast * 15 + lonDeg) % 360 + 360) % 360;
    const eps = obliquity(date) * DEG;
    const phi = latDeg * DEG;
    const ra = ramc * DEG;
    let asc = Math.atan2(Math.cos(ra), -(Math.sin(ra) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / DEG;
    return ((asc % 360) + 360) % 360;
  }

  return {
    jst, toJst, jdn,
    sunLon, moonLon, planetLon, searchSunLon,
    SETSU_LON, SETSU_NAME, risshun, lastSetsu,
    STEMS, STEMS_YOMI, BRANCHES, BRANCHES_YOMI, dayKanshi,
    kyureki, equationOfTime, trueSolarOffsetMin, ascendant, obliquity,
  };
})();
