(() => {
  'use strict';

  /* =====================================================
   * 1. 資料設定
   *    之後新增單元：在 ACTIVITIES 加一筆，ready 改成 true，
   *    並在 GAMES 註冊對應的函式即可。
   * ===================================================== */
  const APP_NAME = '資訊小教室';
  const CREDIT_HTML = '<p class="credit">製作人　Jeremy</p>';
  const STORAGE_KEY = 'infoClassroom.v1';

  const ICONS = {
    chip: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    back: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
  };

  const AREAS = [
    { id: 'hardware', title: '硬體', icon: 'chip', desc: '認識 CPU、記憶體，以及電腦如何用 0 和 1 運作。' },
    { id: 'network', title: '網路', icon: 'globe', desc: '看懂網址如何變成 IP，以及資料怎麼在網路上旅行。' },
    { id: 'security', title: '資安', icon: 'shield', desc: '學會辨認釣魚郵件與詐騙簡訊，並了解相關法律。' }
  ];

  const ACTIVITIES = [
    { id: 'pc-build', area: 'hardware', ready: true, title: 'CPU、記憶體與電腦組裝', desc: '把零件拖進電腦裡，看懂每個零件負責什麼。' },
    { id: 'binary', area: 'hardware', ready: true, title: '二進位', desc: '練習在十進位與二進位之間轉換，電腦就是用 0 和 1 在運作。' },
    { id: 'dns', area: 'network', ready: true, title: 'DNS 轉 IP', desc: '跟著查詢路線，看網址怎麼變成 IP 位址。' },
    { id: 'http', area: 'network', ready: true, title: 'HTTP 與 HTTPS', desc: '五道題目，搞懂網頁傳輸與加密的差別。' },
    { id: 'packet', area: 'network', ready: true, title: '封包冒險', desc: '用打電話的三句對話，看懂 TCP 三次握手。' },
    { id: 'phish-mail', area: 'security', ready: true, title: '釣魚郵件判斷', desc: '檢查寄件人與內容，判斷這封信可不可信。' },
    { id: 'phish-sms', area: 'security', ready: true, title: '詐騙簡訊判斷', desc: '從網址與語氣找出詐騙簡訊的破綻。' }
  ];

  // 各單元的教學內容（會顯示在遊戲上方的「先看重點」，可展開收合）
  const BIN_REF = `
    <div class="table-wrap"><table class="table">
      <thead><tr><th>十進位</th><th>二進位</th><th>怎麼算</th></tr></thead>
      <tbody>${Array.from({ length: 15 }, (_, k) => {
        const n = k + 1;
        const parts = [8, 4, 2, 1].filter((p) => n & p);
        return `<tr><td>${n}</td><td class="big-n">${n.toString(2).padStart(4, '0')}</td><td>${parts.join(' + ')}</td></tr>`;
      }).join('')}</tbody>
    </table></div>`;

  const TUTORIALS = {
    binary: `
      <p>電腦裡的電路只有兩種狀態：有電（1）和沒電（0）。所以電腦把所有東西，包含文字、照片和影片，都用 0 和 1 來記。這種只用 0 和 1 的數字寫法，叫做「二進位」。</p>
      <h3>關鍵：每一格都是前一格的兩倍</h3>
      <p>從最右邊開始，位值依序是 <strong>1、2、4、8、16、32……</strong>。寫 1 的格子，就把它的位值加進總和；寫 0 的格子不算。</p>
      <p class="tip">例子：<strong>1101</strong>　→　8 + 4 + 0 + 1 = <strong>13</strong></p>
      <h3>十進位轉二進位的小技巧</h3>
      <ol class="flow">
        <li>從最大的位值開始看，這個位值放得進去嗎？</li>
        <li>放得進去就寫 1，並把數字減掉這個位值；放不進去就寫 0。</li>
        <li>一路做到最右邊的 1 為止。</li>
      </ol>
      <h3>1 到 15 速查表</h3>
      ${BIN_REF}
      <p class="muted">先從「入門」開始，把 1 到 15 熟了，再挑戰更大的數字。</p>`,

    'pc-build': `
      <p>電腦做事的流程可以記成四個字：<strong>輸入 → 處理 → 儲存 → 輸出</strong>。</p>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>零件</th><th>好比是</th><th>關機後資料還在嗎</th></tr></thead>
        <tbody>
          <tr><td>CPU</td><td>大腦，負責計算</td><td>—</td></tr>
          <tr><td>記憶體（RAM）</td><td>工作桌，放正在用的東西</td><td>消失</td></tr>
          <tr><td>硬碟／SSD</td><td>檔案櫃，長期保存</td><td>還在</td></tr>
        </tbody>
      </table></div>
      <p class="tip">為什麼不全部都用硬碟？因為記憶體比硬碟快很多。CPU 會先把要用的資料搬到記憶體，處理起來才不會卡。</p>
      <p>主機板像一座城市的道路，所有零件都靠它連在一起；電源供應器則負責把插座的電分給每個零件。</p>`,

    dns: `
      <p>人記得住 <span class="url">www.example.com</span>，但電腦要的是 IP 位址（例如 <span class="ip">203.0.113.25</span>）。DNS 就像一本網路電話簿，負責把網址翻譯成 IP。</p>
      <h3>查詢的順序</h3>
      <ol class="flow">
        <li><strong>快取</strong>：先看電腦以前有沒有查過，有就直接用。</li>
        <li><strong>Root 伺服器</strong>：起點，告訴你網址結尾（.com、.tw…）該去哪一區問。</li>
        <li><strong>TLD 伺服器</strong>：管理同一種結尾的網址，告訴你誰負責這個網站。</li>
        <li><strong>權威伺服器</strong>：保管正式紀錄，直接給出 IP。</li>
      </ol>
      <p class="tip">查到之後會暫存起來（快取），下次就不用再跑一趟，所以第二次開同一個網站通常比較快。</p>`,

    http: `
      <p>HTTP 是瀏覽器和網站伺服器之間的「說話規則」，一來一往：瀏覽器發出<strong>請求</strong>，伺服器回傳<strong>回應</strong>。</p>
      <div class="table-wrap"><table class="table">
        <thead><tr><th></th><th>HTTP</th><th>HTTPS</th></tr></thead>
        <tbody>
          <tr><td>傳輸內容</td><td>明文，別人攔到就看得懂</td><td>加密，攔到也看不懂</td></tr>
          <tr><td>網址開頭</td><td>http://</td><td>https://（有小鎖頭）</td></tr>
          <tr><td>加密靠</td><td>無</td><td>SSL / TLS</td></tr>
        </tbody>
      </table></div>
      <h3>常見狀態碼</h3>
      <ul class="plain">
        <li><strong>200</strong>：成功。</li>
        <li><strong>404</strong>：找不到你要的頁面。</li>
        <li><strong>500</strong>：伺服器自己出問題。</li>
      </ul>
      <p class="tip">小鎖頭只代表「連線有加密」，不代表網站可信。詐騙網站也能有 HTTPS。</p>`,

    packet: `
      <p>網路上的資料會被切成很多小包，叫做「封包」，分別送過去，到了再拼回來。但在開始傳資料之前，雙方要先確認彼此都連得上，這就是 TCP 的「三次握手」。</p>
      <ol class="flow">
        <li><strong>SYN</strong>：電腦說「喂，你在嗎？」</li>
        <li><strong>SYN + ACK</strong>：伺服器說「我在，你聽得到我嗎？」</li>
        <li><strong>ACK</strong>：電腦說「聽得到，開始吧。」</li>
      </ol>
      <p class="tip">記法：SYN 是「我想連線」，ACK 是「我收到了」。第 2 步把兩句話合在一起說。</p>`,

    'phish-mail': `
      <p>釣魚郵件想騙的是你的密碼、驗證碼或錢。看信時依序檢查這四件事：</p>
      <ol class="flow">
        <li><strong>寄件網域</strong>：名字像不代表是真的。看 @ 後面，有沒有多一個字、少一個字，或結尾怪怪的（.top、.cc、.vip）。</li>
        <li><strong>語氣</strong>：「24 小時內」「帳戶將被停用」這類製造恐慌或催促的話，要提高警覺。</li>
        <li><strong>要求</strong>：要你輸入密碼、驗證碼、卡號，幾乎一定有問題。</li>
        <li><strong>連結</strong>：看連結實際會去哪裡，不要只看按鈕上寫的字。</li>
      </ol>
      <p class="tip">不確定時，不點信裡的連結，自己打開官方 App 或官網去查。</p>`,

    'phish-sms': `
      <p>詐騙簡訊的套路很固定，抓住這幾個特徵就不容易上當：</p>
      <ol class="flow">
        <li><strong>來源</strong>：機構通常用固定的簡訊名稱，不會用陌生的一般手機號碼或國外號碼。</li>
        <li><strong>小金額加限時</strong>：「補繳 NT$25」「今日內繳費」，目的是讓你沒時間想。</li>
        <li><strong>陌生短網址</strong>：結尾是 .top、.cc、.vip 的網址要特別小心。</li>
        <li><strong>假冒親友</strong>：「我換新號碼，快幫我匯錢」，先用原本的電話確認。</li>
      </ol>
      <p class="tip">收到可疑簡訊：不點、不回，不確定就撥 165 問。</p>`
  };

  // 小辭典
  const GLOSSARY = [
    { area: 'hardware', term: 'CPU（處理器）', def: '電腦的大腦，負責計算和下指令。' },
    { area: 'hardware', term: 'RAM（記憶體）', def: '暫時放著正在使用的資料，速度快，關機後內容消失。' },
    { area: 'hardware', term: 'SSD（硬碟）', def: '長期保存檔案和程式，關機後資料還在。' },
    { area: 'hardware', term: '主機板', def: '連接所有零件的大電路板。' },
    { area: 'hardware', term: '位元（bit）', def: '電腦資料的最小單位，只有 0 或 1 兩種值。' },
    { area: 'hardware', term: '二進位', def: '只用 0 和 1 的數字寫法，每一位的位值是前一位的兩倍。' },
    { area: 'network', term: 'IP 位址', def: '網路上每台裝置的號碼，像家裡的門牌。' },
    { area: 'network', term: 'DNS', def: '把網址翻譯成 IP 位址的系統，像網路電話簿。' },
    { area: 'network', term: '網域名稱', def: '好記的網站名字，例如 example.com。' },
    { area: 'network', term: 'TLD', def: '網址最後面的類別，例如 .com、.org、.tw。' },
    { area: 'network', term: '快取（Cache）', def: '把查過的結果暫時存起來，下次就不用重新查。' },
    { area: 'network', term: 'HTTP / HTTPS', def: '瀏覽器與網站溝通的規則；HTTPS 多了加密保護。' },
    { area: 'network', term: 'SSL / TLS', def: '替網路傳輸加密的技術。' },
    { area: 'network', term: '封包', def: '網路上傳送的小塊資料。' },
    { area: 'network', term: 'TCP 三次握手', def: '傳資料前，雙方用 SYN、SYN+ACK、ACK 確認彼此連得上。' },
    { area: 'network', term: '狀態碼', def: '伺服器回應時附上的數字，例如 200 成功、404 找不到。' },
    { area: 'security', term: '釣魚（Phishing）', def: '假冒可信的單位，騙你輸入密碼或個資。' },
    { area: 'security', term: '驗證碼（OTP）', def: '一次性的確認碼，絕對不要告訴別人。' },
    { area: 'security', term: '人頭帳戶', def: '把自己的帳戶借給別人使用，常被詐騙集團利用，是違法行為。' },
    { area: 'security', term: '165 專線', def: '台灣的反詐騙諮詢專線，收到可疑訊息可以打去問。' }
  ];

  /* =====================================================
   * 2. 小工具
   * ===================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const main = $('#main');

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleString('zh-TW', {
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  let toastTimer = null;
  function toast(message) {
    const t = $('#toast');
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  // 取代 confirm()：回傳 Promise<boolean>
  function confirmDialog({ title, body, confirmText }) {
    const dlg = $('#dialog');
    $('#dlg-title').textContent = title;
    $('#dlg-body').textContent = body;
    $('#dlg-ok').textContent = confirmText;
    dlg.returnValue = '';
    return new Promise((resolve) => {
      const onClose = () => {
        dlg.removeEventListener('close', onClose);
        resolve(dlg.returnValue === 'ok');
      };
      dlg.addEventListener('close', onClose);
      dlg.showModal();
    });
  }

  /* =====================================================
   * 3. 本機紀錄（localStorage，每台裝置各自保存）
   * ===================================================== */
  const blankData = () => ({ v: 2, records: [], xp: 0, badges: {}, days: [] });

  const store = {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return blankData();
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.records)) return blankData();
        if (data.v !== 2) {
          // 舊版紀錄：依過去的成績補算經驗值、天數與徽章（不會跳出慶祝）
          const seen = new Set();
          data.xp = 0;
          data.days = [];
          data.records.forEach((r) => {
            data.xp += calcXp(r, !seen.has(r.activityId));
            seen.add(r.activityId);
            const k = dayKey(r.ts);
            if (!data.days.includes(k)) data.days.push(k);
          });
          data.badges = {};
          const stamp = data.records.length ? data.records[data.records.length - 1].ts : Date.now();
          BADGES.forEach((b) => { if (b.test(data)) data.badges[b.id] = stamp; });
          data.v = 2;
        }
        data.xp = Number(data.xp) || 0;
        if (!data.badges || typeof data.badges !== 'object') data.badges = {};
        if (!Array.isArray(data.days)) data.days = [];
        return data;
      } catch (e) {
        return blankData();
      }
    },
    save(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        return false;
      }
    },
    add(record) {
      const data = this.load();
      const first = !data.records.some((r) => r.activityId === record.activityId);
      data.records.push(record);
      if (data.records.length > 500) data.records.splice(0, data.records.length - 500);

      const levelBefore = levelOf(data.xp);
      const gain = calcXp(record, first);
      data.xp += gain;

      const key = dayKey(record.ts);
      if (!data.days.includes(key)) data.days.push(key);
      data.days = data.days.slice(-120);

      const fresh = BADGES.filter((b) => !data.badges[b.id] && b.test(data));
      fresh.forEach((b) => { data.badges[b.id] = record.ts; });

      const ok = this.save(data);
      if (ok) {
        const levelAfter = levelOf(data.xp);
        showReward({
          gain,
          perfect: isPerfect(record),
          levelUp: levelAfter > levelBefore ? levelAfter : 0,
          badges: fresh,
          streak: streakOf(data.days)
        });
      }
      return ok;
    },
    clear() {
      return this.save(blankData());
    }
  };

  /* =====================================================
   * 3b. 遊戲化：經驗值、等級、連續天數、徽章、彩帶
   * ===================================================== */
  const LEVEL_TITLES = ['新手上路', '好奇寶寶', '小小工程師', '網路探險家', '資安小衛士', '位元魔法師', '系統大師', '資訊傳奇'];
  const MAX_LEVEL = LEVEL_TITLES.length;
  const xpAt = (lv) => 40 * (lv - 1) * (lv - 1); // 升到某一級需要的總經驗值

  function levelOf(xp) {
    return Math.min(MAX_LEVEL, Math.floor(Math.sqrt(Math.max(0, xp) / 40)) + 1);
  }

  function levelInfo(xp) {
    const lv = levelOf(xp);
    const floor = xpAt(lv);
    const next = lv < MAX_LEVEL ? xpAt(lv + 1) : null;
    return {
      lv,
      title: LEVEL_TITLES[lv - 1],
      next,
      left: next ? next - xp : 0,
      pct: next ? Math.round(((xp - floor) / (next - floor)) * 100) : 100
    };
  }

  function dayKey(ts) {
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  // 連續學習天數：今天或昨天有玩，就從那天往前數
  function streakOf(days) {
    const set = new Set(days);
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    if (!set.has(dayKey(d))) {
      d.setDate(d.getDate() - 1);
      if (!set.has(dayKey(d))) return 0;
    }
    let n = 0;
    while (set.has(dayKey(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  const isPerfect = (r) => !r.noScore && r.total > 0 && r.score === r.total;

  // 每次完成活動得到的經驗值：基本分 + 滿分加成 + 第一次玩加成 + 每日挑戰加成
  function calcXp(r, first) {
    let xp = r.noScore ? 12 : 8 + Math.round(12 * (r.score / r.total));
    if (isPerfect(r)) xp += 10;
    if (first) xp += 15;
    if (r.activityId === 'daily') xp += 10;
    return xp;
  }

  const BADGES = [
    { id: 'first', icon: '🌱', name: '第一步', desc: '完成第一個活動', test: (d) => d.records.length >= 1 },
    { id: 'perfect', icon: '⭐', name: '滿分達人', desc: '任何活動拿到滿分', test: (d) => d.records.some(isPerfect) },
    { id: 'perfect5', icon: '🌟', name: '滿分收藏家', desc: '累積 5 次滿分', test: (d) => d.records.filter(isPerfect).length >= 5 },
    { id: 'explorer', icon: '🧭', name: '三領域探險家', desc: '硬體、網路、資安都玩過',
      test: (d) => AREAS.every((a) => d.records.some((r) => (findActivity(r.activityId) || {}).area === a.id)) },
    { id: 'all', icon: '🏆', name: '全勤學員', desc: '7 個活動全部玩過',
      test: (d) => ACTIVITIES.every((a) => d.records.some((r) => r.activityId === a.id)) },
    { id: 'bin', icon: '🔢', name: '二進位高手', desc: '二進位「挑戰」級拿到滿分',
      test: (d) => d.records.some((r) => r.activityId === 'binary' && isPerfect(r) && String(r.modeLabel).includes('挑戰')) },
    { id: 'phish', icon: '🎣', name: '釣魚剋星', desc: '釣魚郵件和詐騙簡訊都拿滿分',
      test: (d) => ['phish-mail', 'phish-sms'].every((id) => d.records.some((r) => r.activityId === id && isPerfect(r))) },
    { id: 'daily', icon: '📅', name: '每日挑戰者', desc: '完成一次每日挑戰', test: (d) => d.records.some((r) => r.activityId === 'daily') },
    { id: 'streak3', icon: '🔥', name: '三天不間斷', desc: '連續 3 天學習', test: (d) => streakOf(d.days) >= 3 },
    { id: 'streak7', icon: '🚀', name: '一週堅持', desc: '連續 7 天學習', test: (d) => streakOf(d.days) >= 7 },
    { id: 'plays10', icon: '💪', name: '勤奮學習', desc: '累積完成 10 次活動', test: (d) => d.records.length >= 10 },
    { id: 'lv5', icon: '👑', name: '資訊達人', desc: '升到 5 級', test: (d) => levelOf(d.xp) >= 5 }
  ];

  const dailyDone = () => store.load().records.some((r) => r.activityId === 'daily' && dayKey(r.ts) === dayKey(Date.now()));

  // 彩帶（使用者設定「減少動態效果」時不播放）
  function confetti() {
    if (reducedMotion()) return;
    const cv = document.createElement('canvas');
    cv.className = 'confetti';
    cv.setAttribute('aria-hidden', 'true');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const colors = ['#2457D6', '#7440D0', '#E0701A', '#17A06B', '#F2B134'];
    const ps = Array.from({ length: 90 }, (_, i) => ({
      x: cv.width / 2 + (Math.random() - 0.5) * cv.width * 0.4,
      y: cv.height * 0.35,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 12 - 4,
      s: 6 + Math.random() * 6,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[i % colors.length]
    }));
    const t0 = performance.now();
    (function frame(t) {
      const el = t - t0;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach((p) => {
        p.vy += 0.38; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - el / 2600);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (el < 2600) requestAnimationFrame(frame);
      else cv.remove();
    })(t0);
  }

  // 完成活動後的獎勵彈窗
  let rewardTimer = null;
  function showReward({ gain, perfect, levelUp, badges, streak }) {
    let box = $('#reward');
    if (!box) {
      box = document.createElement('div');
      box.id = 'reward';
      box.className = 'reward';
      box.dataset.theme = 'daily';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      box.addEventListener('click', () => box.classList.remove('show'));
      document.body.appendChild(box);
    }
    const lines = [];
    if (perfect) lines.push('⭐ 滿分！');
    if (levelUp) lines.push(`🎉 升級了！現在是 ${levelUp} 級「${LEVEL_TITLES[levelUp - 1]}」`);
    badges.forEach((b) => lines.push(`${b.icon} 解鎖徽章「${esc(b.name)}」`));
    if (streak >= 2 && !levelUp && !badges.length) lines.push(`🔥 連續 ${streak} 天學習`);
    box.innerHTML = `<div class="rw-xp">+${gain} 經驗值</div>${lines.map((l) => `<div class="rw-line">${l}</div>`).join('')}`;
    box.classList.add('show');
    clearTimeout(rewardTimer);
    rewardTimer = setTimeout(() => box.classList.remove('show'), lines.length > 1 ? 6000 : 4200);
    if (perfect || levelUp || badges.length) confetti();
    updateNav();
  }

  function playedIds() {
    return new Set(store.load().records.map((r) => r.activityId));
  }

  function bestOf(activityId) {
    const recs = store.load().records.filter((r) => r.activityId === activityId);
    if (!recs.length) return null;
    return recs.reduce((best, r) => (
      !r.noScore && !best.noScore && r.score / r.total > best.score / best.total ? r : best
    ));
  }

  // 只有「看動畫」這類沒有分數的紀錄，顯示為「已完成」
  const scoreText = (r) => (r.noScore ? '已完成' : `${r.score} / ${r.total}`);

  const findActivity = (id) => ACTIVITIES.find((a) => a.id === id);
  const findArea = (id) => AREAS.find((a) => a.id === id);

  /* =====================================================
   * 4. 頁面：首頁、區域、活動、個人檔案
   * ===================================================== */
  function setTheme(theme) {
    if (theme) main.dataset.theme = theme;
    else delete main.dataset.theme;
  }

  /* ---------- 吉祥物「位元」、冷知識 ---------- */
  const MASCOT = `
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <line x1="40" y1="16" x2="40" y2="8" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="6" r="4.5" fill="var(--flame)"/>
      <g fill="var(--accent)">
        <rect x="7" y="27" width="12" height="5" rx="2.5"/><rect x="7" y="39" width="12" height="5" rx="2.5"/><rect x="7" y="51" width="12" height="5" rx="2.5"/>
        <rect x="61" y="27" width="12" height="5" rx="2.5"/><rect x="61" y="39" width="12" height="5" rx="2.5"/><rect x="61" y="51" width="12" height="5" rx="2.5"/>
        <rect x="16" y="16" width="48" height="54" rx="15"/>
      </g>
      <rect x="23" y="24" width="34" height="28" rx="10" fill="#fff"/>
      <g class="m-eyes" fill="#141C2B"><circle cx="33" cy="38" r="4"/><circle cx="47" cy="38" r="4"/></g>
      <path d="M33 60 q7 7 14 0" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    </svg>`;

  const FACTS = [
    '世界上第一個網站在 1991 年上線，內容只是在介紹網站本身是什麼。',
    '1 個位元組（byte）有 8 個位元（bit），可以表示 256 種不同的值，從 0 到 255。',
    '英文字母 A 在電腦裡其實是數字 65，寫成二進位就是 01000001。',
    '1947 年，工程師在電腦裡抓到一隻真的飛蛾，貼進紀錄本還寫上「第一個真的被抓到的 bug」。',
    '第一封電子郵件在 1971 年寄出，而 @ 符號就是從那時開始用在信箱位址裡。',
    'IPv4 位址大約只有 43 億個，因為不夠用，才發明了位址多到數不完的 IPv6。',
    '跨海的網路，絕大部分是靠鋪在海底的光纜在傳遞，不是靠衛星。',
    '第一個電腦滑鼠是用木頭做的，在 1960 年代由工程師 Douglas Engelbart 發明。',
    'https 最後的 s 是 secure（安全）的意思，代表資料在傳輸時有加密。',
    '現在的 CPU 時脈常見是 3 GHz，也就是每秒可以處理大約 30 億個運算週期。',
    '「123456」這種簡單密碼，年年都名列最常被破解的密碼榜。',
    '台灣的反詐騙諮詢專線是 165，收到可疑訊息不確定時，可以打去問。'
  ];
  let factIdx = Math.floor(Math.random() * FACTS.length);

  /* ---------- 玩家卡（首頁、個人檔案共用） ---------- */
  function playerCard(withFact) {
    const d = store.load();
    const info = levelInfo(d.xp);
    const streak = streakOf(d.days);
    const isNew = !d.records.length;
    const xpLine = info.next
      ? `${d.xp} / ${info.next} 經驗值，再 ${info.left} 就升級`
      : `${d.xp} 經驗值，已達最高等級`;
    const say = isNew
      ? '嗨，我是「位元」！從任何一個活動開始吧，每玩一次都會拿到經驗值，還能解鎖徽章。'
      : `你知道嗎？<span id="fact-text">${FACTS[factIdx]}</span>`;
    return `
      <section class="player">
        <div class="mascot">${MASCOT}</div>
        <div class="player-main">
          <div class="player-top">
            <div><span class="lv-badge">${info.lv} 級</span><strong>${info.title}</strong></div>
            <span class="streak">${streak >= 2 ? `🔥 連續 ${streak} 天` : streak === 1 ? '🔥 今天已學習' : '今天來學一點吧'}</span>
          </div>
          <div class="bar xp-bar" role="progressbar" aria-label="升級進度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${info.pct}"><i style="width:${info.pct}%"></i></div>
          <div class="muted xp-text">${xpLine}</div>
          ${withFact ? `<div class="fact"><p>${say}</p>${isNew ? '' : '<button type="button" class="btn btn-ghost" id="fact-next">再來一個</button>'}</div>` : ''}
        </div>
      </section>`;
  }

  function badgesPanel() {
    const d = store.load();
    const got = BADGES.filter((b) => d.badges[b.id]).length;
    return `
      <section class="panel">
        <h2>我的徽章（${got} / ${BADGES.length}）</h2>
        <p class="muted">完成對應的挑戰就會解鎖，灰色的是還沒拿到的。</p>
        <div class="badge-grid" data-theme="daily">
          ${BADGES.map((b) => {
            const at = d.badges[b.id];
            return `<div class="badge ${at ? 'on' : 'off'}">
              <span class="badge-ic">${at ? b.icon : '🔒'}</span>
              <strong>${b.name}</strong>
              <small>${b.desc}</small>
              ${at ? `<small class="when">${new Date(at).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })} 解鎖</small>` : ''}
            </div>`;
          }).join('')}
        </div>
      </section>`;
  }

  function renderHome() {
    setTheme('');
    const played = playedIds();
    const next = ACTIVITIES.find((a) => a.ready && !played.has(a.id));
    const nextCard = next ? `
      <a class="next-card" data-theme="${next.area}" href="#/activity/${next.id}">
        <div>
          <div class="kicker-t">推薦你接著玩</div>
          <h2>${next.title}</h2>
          <p>${next.desc}</p>
        </div>
        <span class="pill pill-go">開始</span>
      </a>` : `
      <div class="next-card is-done">
        <div>
          <div class="kicker-t" style="color:var(--good)">全部都玩過了</div>
          <h2>太厲害了！</h2>
          <p>挑一個領域再玩一次，把成績刷高。</p>
        </div>
      </div>`;
    const done = dailyDone();
    const dailyCard = `
      <a class="next-card" data-theme="daily" href="#/daily">
        <div>
          <div class="kicker-t">📅 每日挑戰</div>
          <h2>${done ? '今天已完成，明天見！' : '今天的 5 題快問快答'}</h2>
          <p>${done ? '想再練習的話，可以玩練習模式。' : '每天題目都不同，答對連續題還有連對加油。'}</p>
        </div>
        <span class="pill pill-go">${done ? '練習' : '開始'}</span>
      </a>`;
    main.innerHTML = `
      <section class="intro">
        <h1>用玩的，搞懂電腦與網路</h1>
        <p>不需要任何基礎。玩活動、拿經驗值、升級、解鎖徽章，幾分鐘就能看懂平常用的東西是怎麼運作的。</p>
      </section>
      ${playerCard(true)}
      <div class="promo-row">${dailyCard}${nextCard}</div>
      <div class="area-grid">
        ${AREAS.map((area) => {
          const acts = ACTIVITIES.filter((a) => a.area === area.id);
          const done = acts.filter((a) => played.has(a.id)).length;
          const pct = Math.round((done / acts.length) * 100);
          return `
            <a class="area-card" data-theme="${area.id}" href="#/area/${area.id}">
              <span class="icon-box">${ICONS[area.icon]}</span>
              <h2>${area.title}</h2>
              <p>${area.desc}</p>
              <div class="area-foot"><span>共 ${acts.length} 個活動</span><span>已玩過 ${done} 個</span></div>
              <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
            </a>`;
        }).join('')}
      </div>`;
    const factBtn = $('#fact-next');
    if (factBtn) {
      factBtn.addEventListener('click', () => {
        factIdx = (factIdx + 1) % FACTS.length;
        $('#fact-text').textContent = FACTS[factIdx];
      });
    }
    return APP_NAME;
  }

  function renderArea(areaId) {
    const area = findArea(areaId);
    const acts = ACTIVITIES.filter((a) => a.area === areaId);
    setTheme(areaId);
    main.innerHTML = `
      <a class="back" href="#/">${ICONS.back}回到首頁</a>
      <header class="page-head">
        <span class="kicker">${ICONS[area.icon]}${area.title}</span>
        <h1>${area.title}</h1>
        <p>${area.desc}</p>
      </header>
      <ul class="act-list">
        ${acts.map((a) => {
          if (!a.ready) {
            return `
              <li><div class="act-card is-off">
                <div><h2>${a.title}</h2><p>${a.desc}</p></div>
                <span class="pill">製作中</span>
              </div></li>`;
          }
          const best = bestOf(a.id);
          return `
            <li><a class="act-card" href="#/activity/${a.id}">
              <div><h2>${a.title}</h2><p>${a.desc}</p></div>
              <span class="act-side">
                <span class="pill pill-go">開始</span>
                ${best ? `<span class="act-best">${best.noScore ? '已完成' : `最佳成績 ${best.score} / ${best.total}`}</span>` : ''}
              </span>
            </a></li>`;
        }).join('')}
      </ul>`;
    return area.title;
  }

  function renderActivity(activityId) {
    const act = findActivity(activityId);
    const area = findArea(act.area);
    setTheme(area.id);
    const siblings = ACTIVITIES.filter((a) => a.area === area.id && a.ready);
    const idx = siblings.findIndex((a) => a.id === act.id);
    const prev = siblings[idx - 1];
    const nextAct = siblings[idx + 1];
    const firstTime = !playedIds().has(act.id);
    main.innerHTML = `
      <a class="back" href="#/area/${area.id}">${ICONS.back}回到${area.title}</a>
      <header class="page-head">
        <span class="kicker">${ICONS[area.icon]}${area.title}</span>
        <h1>${act.title}</h1>
        <p>${act.desc}</p>
      </header>
      <details class="tutorial"${firstTime ? ' open' : ''}>
        <summary>先看重點${firstTime ? '' : '（點一下展開複習）'}</summary>
        <div class="tutorial-body">
          ${TUTORIALS[act.id] || '<p class="muted">教學內容準備中。</p>'}
        </div>
      </details>
      <section class="stage" id="stage"></section>
      <nav class="act-nav" aria-label="其他活動">
        ${prev ? `<a href="#/activity/${prev.id}"><small>← 上一個</small><span>${prev.title}</span></a>` : ''}
        ${nextAct ? `<a class="nx" href="#/activity/${nextAct.id}"><small>下一個 →</small><span>${nextAct.title}</span></a>` : ''}
      </nav>`;

    const stage = $('#stage');
    if (act.ready && GAMES[act.id]) {
      GAMES[act.id](stage);
    } else {
      stage.innerHTML = '<h2 class="stage-title">製作中</h2><p class="muted">這個單元還在準備，請稍後再來。</p>';
    }
    return act.title;
  }

  /* ---------- 每日挑戰 ---------- */
  // 每題第一個選項是正確答案，出題時會自動打亂
  const QBANK = [
    { a: 'hardware', q: '哪個零件被稱為電腦的「大腦」？', o: ['CPU', '記憶體', '電源供應器', '散熱風扇'], why: 'CPU 負責計算和下指令，就像大腦。' },
    { a: 'hardware', q: '電腦關機之後，哪一種裡面的資料會消失？', o: ['記憶體（RAM）', 'SSD', '硬碟', '隨身碟'], why: '記憶體是暫時的工作桌，關機就清空；SSD、硬碟、隨身碟會長期保存。' },
    { a: 'hardware', q: '二進位 1010 等於十進位多少？', o: ['10', '8', '12', '5'], why: '8 + 2 = 10。1 的位置是 8 和 2，0 的位置不算。' },
    { a: 'hardware', q: '二進位 111 等於十進位多少？', o: ['7', '3', '5', '8'], why: '4 + 2 + 1 = 7。' },
    { a: 'hardware', q: '十進位 9 的二進位是哪一個？', o: ['1001', '1010', '1100', '0111'], why: '9 = 8 + 1，所以 8 和 1 的位置寫 1，其他寫 0，就是 1001。' },
    { a: 'hardware', q: '1 個位元組（byte）等於幾個位元（bit）？', o: ['8 個', '2 個', '4 個', '16 個'], why: '1 byte = 8 bits，可以表示 0 到 255 共 256 種值。' },
    { a: 'hardware', q: '負責把插座的電分給各個零件的是？', o: ['電源供應器', '主機板', 'CPU', '硬碟'], why: '電源供應器把插座的交流電轉成電腦零件能用的電。' },
    { a: 'hardware', q: '同時開很多程式變得很卡，增加哪個最直接有幫助？', o: ['記憶體', '鍵盤', '螢幕', '滑鼠'], why: '記憶體不夠，電腦就沒有足夠的「工作桌」放正在用的東西。' },
    { a: 'hardware', q: '所有零件都要插在哪個電路板上互相連接？', o: ['主機板', '顯示卡', '電源供應器', '散熱器'], why: '主機板就像道路，把所有零件連在一起。' },
    { a: 'hardware', q: '電腦裡的資料為什麼都用 0 和 1 來記？', o: ['電路只有「有電」和「沒電」兩種狀態', '因為 0 和 1 比較好看', '因為電腦不會算其他數字', '因為網路只能傳 0 和 1'], why: '有電代表 1、沒電代表 0，這樣最簡單、最不容易出錯。' },

    { a: 'network', q: 'DNS 的工作是什麼？', o: ['把網址翻譯成 IP 位址', '把網頁加密', '防止電腦中毒', '加快網路速度'], why: 'DNS 像網路電話簿，把好記的網址查成電腦要的 IP。' },
    { a: 'network', q: '下面哪一個長得像 IP 位址？', o: ['192.168.1.1', 'www.example.com', '12:30:45', 'abc@mail.com'], why: 'IPv4 位址是四組數字，中間用點隔開。' },
    { a: 'network', q: '網址開頭的 https 比 http 多了什麼？', o: ['傳輸時會加密', '速度更快', '不會有廣告', '一定是官方網站'], why: 'HTTPS 的 s 是 secure，資料會加密，別人攔到也看不懂。' },
    { a: 'network', q: '網頁出現「404」代表什麼？', o: ['找不到這個頁面', '連線成功', '伺服器壞掉了', '需要付費'], why: '404 是「Not Found」，網址可能打錯或頁面被刪掉。' },
    { a: 'network', q: 'TCP 三次握手的第一句話是什麼？', o: ['SYN', 'ACK', 'SYN + ACK', 'FIN'], why: '第一句 SYN 是「我想連線」，伺服器再回 SYN + ACK，最後你回 ACK。' },
    { a: 'network', q: '為什麼第二次打開同一個網站通常比較快？', o: ['有快取，不用重新查和重新下載', '網站自己變快了', '因為網路變粗了', '因為電腦重新開機了'], why: '快取會把查過、下載過的東西暫存起來，下次直接用。' },
    { a: 'network', q: '網路上傳送的資料會被切成許多小塊，叫做什麼？', o: ['封包', '磁區', '像素', '指令'], why: '資料切成封包分別傳送，到了目的地再拼回來。' },
    { a: 'network', q: '瀏覽器向網站伺服器要網頁，這個動作叫做？', o: ['請求（Request）', '回應（Response）', '快取（Cache）', '加密（Encrypt）'], why: '瀏覽器發出請求，伺服器再回傳回應。' },
    { a: 'network', q: '網頁的狀態碼 200 代表什麼？', o: ['成功', '找不到', '伺服器出錯', '被擋下來'], why: '200 是 OK，請求順利完成。' },
    { a: 'network', q: 'www.example.com 最後面的「.com」叫做什麼？', o: ['頂級網域（TLD）', '通訊協定', 'IP 位址', '檔案格式'], why: '.com、.org、.tw 這類網址結尾，都是頂級網域。' },

    { a: 'security', q: '收到訊息說「帳戶 24 小時內停用，請立刻點連結登入」，最可能是什麼？', o: ['釣魚詐騙', '正常的通知', '朋友的玩笑', '系統更新'], why: '製造恐慌、催你馬上行動，是詐騙最常見的手法。' },
    { a: 'security', q: '有人要你報出手機收到的簡訊驗證碼，你應該？', o: ['絕對不要給任何人', '確認對方是客服再給', '只給朋友', '給一半就好'], why: '驗證碼等於一把一次性的鑰匙，誰要都不能給。' },
    { a: 'security', q: '台灣的反詐騙諮詢專線是幾號？', o: ['165', '110', '119', '104'], why: '165 反詐騙專線，不確定時可以打去問。' },
    { a: 'security', q: '怎麼知道信裡的按鈕真正會連到哪裡？', o: ['看實際的網址，不是只看按鈕上的字', '看按鈕的顏色', '看信寫得有沒有禮貌', '直接點點看'], why: '按鈕寫的字可以隨便編，真正的連結要看實際網址。' },
    { a: 'security', q: '網址旁邊有小鎖頭，代表這個網站一定可信嗎？', o: ['不一定，只代表連線有加密', '一定可信', '一定是官方網站', '一定沒有廣告'], why: '詐騙網站也可以有 HTTPS，所以還是要看網址是不是正確。' },
    { a: 'security', q: '朋友突然傳訊說換了新號碼，要你先幫忙匯錢，你應該先做什麼？', o: ['用原本的電話號碼打給他確認', '馬上匯，朋友有急用', '請他先傳身分證照片', '問他今天吃什麼'], why: '假冒親友是常見詐騙，先用原本的聯絡方式確認。' },
    { a: 'security', q: '信箱顯示「某某銀行客服」，但寄件網域是 x8f2k.top，最可能是什麼？', o: ['冒充的釣魚信', '銀行的新信箱', '系統自動轉寄', '正常通知'], why: '正式機構通常使用固定的官方網域，亂碼加怪結尾很可疑。' },
    { a: 'security', q: '簡訊說「包裹地址有誤，補繳 NT$25」並附陌生短網址，應該怎麼做？', o: ['不點、不回，向官方確認', '趕快點進去繳', '回覆說你不是收件人', '轉傳給朋友'], why: '小金額加限時，目的是讓你沒時間想。' },
    { a: 'security', q: '不同網站的密碼，最好怎麼設定？', o: ['每個網站不一樣，而且夠長', '全部都用同一組', '用生日就好', '用 123456 最好記'], why: '同一組密碼被偷一個，所有帳號都危險。' },
    { a: 'security', q: '把自己的銀行帳戶借給陌生人「幫忙收款」，會發生什麼事？', o: ['可能變成詐騙的人頭帳戶，自己也違法', '可以賺錢，沒有風險', '銀行會給獎勵', '對方會負全責'], why: '人頭帳戶是詐騙集團常用的工具，提供帳戶的人也會被追究。' },
    { a: 'security', q: '兩步驟驗證的好處是什麼？', o: ['密碼被偷了，還需要第二道驗證才能登入', '不用再設密碼', '可以更快登入', '網路會變快'], why: '多一道關卡，壞人光知道密碼還是進不來。' }
  ];

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderDaily() {
    setTheme('daily');
    main.innerHTML = `
      <a class="back" href="#/">${ICONS.back}回到首頁</a>
      <header class="page-head">
        <span class="kicker">📅 每日挑戰</span>
        <h1>今天的 5 題快問快答</h1>
        <p>每天的題目都不一樣，涵蓋硬體、網路、資安。答對越多，拿到的經驗值越多；連續答對還會有連對加油。</p>
      </header>
      <section class="stage" id="stage"></section>`;
    startDaily($('#stage'));
    return '每日挑戰';
  }

  function startDaily(stage) {
    const TOTAL = 5;
    const key = dayKey(Date.now());
    const todayRec = store.load().records.filter((r) => r.activityId === 'daily' && dayKey(r.ts) === key).pop();
    let practice = false;
    let st = null;

    function pickQuestions() {
      const list = practice ? shuffle(QBANK) : seededShuffle(QBANK, mulberry32(hashStr(key)));
      return list.slice(0, TOTAL).map((q) => ({
        ...q,
        opts: shuffle(q.o.map((t, i) => ({ t, ok: i === 0 })))
      }));
    }

    function begin(isPractice) {
      practice = isPractice;
      st = { qs: pickQuestions(), i: 0, score: 0, combo: 0, best: 0, answers: [] };
      show();
    }

    function intro() {
      stage.innerHTML = `
        <h2 class="stage-title">今天已經完成了</h2>
        <p class="muted">今天的成績是 ${todayRec.score} / ${TOTAL}，明天會有新的 5 題。想再玩的話，可以來一輪練習模式：題目不同，不計入經驗值。</p>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="dq-practice">練習一輪</button>
          <a class="btn" href="#/">回首頁</a>
        </div>`;
      $('#dq-practice').addEventListener('click', () => begin(true));
    }

    function show() {
      const q = st.qs[st.i];
      const area = findArea(q.a);
      stage.innerHTML = `
        <div class="game-top">
          <strong>第 ${st.i + 1} / ${TOTAL} 題${practice ? '（練習）' : ''}</strong>
          <span class="combo">${st.combo >= 2 ? `🔥 連對 ${st.combo} 題` : ''}</span>
        </div>
        <div class="bar" aria-hidden="true"><i style="width:${(st.i / TOTAL) * 100}%"></i></div>
        <div data-theme="${q.a}">
          <span class="kicker dq-area">${ICONS[area.icon]}${area.title}</span>
          <h2 class="question">${esc(q.q)}</h2>
          <div class="opt-list">
            ${q.opts.map((o, k) => `<button type="button" class="opt" data-k="${k}">${esc(o.t)}</button>`).join('')}
          </div>
          <div id="dq-fb"></div>
        </div>`;
      $$('.opt', stage).forEach((b) => b.addEventListener('click', () => answer(Number(b.dataset.k))));
    }

    function answer(k) {
      const q = st.qs[st.i];
      const ok = q.opts[k].ok;
      if (ok) {
        st.score++;
        st.combo++;
        st.best = Math.max(st.best, st.combo);
      } else {
        st.combo = 0;
      }
      st.answers.push({ q, ok });
      $$('.opt', stage).forEach((b, i) => {
        b.disabled = true;
        if (q.opts[i].ok) b.classList.add('is-correct');
        else if (i === k) b.classList.add('is-wrong');
      });
      const last = st.i === TOTAL - 1;
      $('#dq-fb').innerHTML = `
        <div class="feedback ${ok ? 'good' : 'bad'}">
          <strong>${ok ? (st.combo >= 3 ? `答對了，連對 ${st.combo} 題！` : '答對了！') : '差一點，看看解釋'}</strong>
          ${esc(q.why)}
          <div><button type="button" class="btn btn-primary" id="dq-next">${last ? '看結果' : '下一題'}</button></div>
        </div>`;
      const next = $('#dq-next');
      next.focus();
      next.addEventListener('click', () => {
        if (last) finish();
        else { st.i++; show(); }
      });
    }

    function finish() {
      let saved = true;
      if (!practice) {
        saved = store.add({ activityId: 'daily', mode: 'daily', modeLabel: '每日挑戰', score: st.score, total: TOTAL, ts: Date.now() });
      }
      const msg = st.score === TOTAL ? '全對！你今天的資訊腦袋滿格。'
        : st.score >= 3 ? '不錯喔，看看答錯的解釋，明天再拿滿分。'
        : '沒關係，每天練一點就會進步。看看下面的解釋吧。';
      stage.innerHTML = `
        <h2 class="stage-title">${practice ? '練習結束' : '今天的挑戰完成了'}</h2>
        <div class="score"><span class="score-n">${st.score}</span><span class="score-t">/ ${TOTAL}</span></div>
        <p class="muted">${msg}${st.best >= 2 ? `　最高連對 ${st.best} 題。` : ''}</p>
        ${practice ? '<p class="note">練習模式不計入經驗值。</p>' : (saved ? '' : '<p class="note">這個瀏覽器無法儲存紀錄。</p>')}
        <ol class="review">
          ${st.answers.map((a) => `
            <li><strong class="${a.ok ? 'ok' : 'no'}">${a.ok ? '答對' : '答錯'}</strong>　${esc(a.q.q)}
              <div class="muted">${a.ok ? '' : `正確答案：${esc(a.q.o[0])}。`}${esc(a.q.why)}</div>
            </li>`).join('')}
        </ol>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="dq-again">練習一輪</button>
          <a class="btn" href="#/">回首頁</a>
          <a class="btn" href="#/profile">看我的徽章</a>
        </div>`;
      $('#dq-again').addEventListener('click', () => begin(true));
    }

    if (todayRec) intro();
    else begin(false);
  }

  function renderGlossary() {
    setTheme('');
    main.innerHTML = `
      <header class="page-head">
        <h1>小辭典</h1>
        <p>看到不懂的名詞，來這裡查。可以直接搜尋。</p>
      </header>
      <label class="sr-only" for="gloss-q">搜尋名詞</label>
      <input id="gloss-q" class="gloss-search" type="search" placeholder="搜尋，例如 DNS、封包" autocomplete="off">
      <div id="gloss-list"></div>`;

    const list = $('#gloss-list');
    const draw = (q) => {
      const kw = q.trim().toLowerCase();
      const html = AREAS.map((area) => {
        const items = GLOSSARY.filter((g) => g.area === area.id &&
          (!kw || g.term.toLowerCase().includes(kw) || g.def.toLowerCase().includes(kw)));
        if (!items.length) return '';
        return `
          <section class="gloss-group" data-theme="${area.id}">
            <h2><span class="icon-box">${ICONS[area.icon]}</span>${area.title}</h2>
            <dl>${items.map((g) => `<div class="gloss-item"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join('')}</dl>
          </section>`;
      }).join('');
      list.innerHTML = html || '<p class="muted">找不到符合的名詞。</p>';
    };
    draw('');
    $('#gloss-q').addEventListener('input', (e) => draw(e.target.value));
    return '小辭典';
  }

  function renderProfile() {
    setTheme('');
    const records = store.load().records;

    if (!records.length) {
      main.innerHTML = `
        <header class="page-head"><h1>個人檔案</h1></header>
        ${playerCard(false)}
        <div class="empty">
          <h2>還沒有任何紀錄</h2>
          <p>玩完一個活動後，成績和經驗值會自動存在這裡。</p>
          <a class="btn btn-primary" href="#/">去挑一個活動</a>
        </div>
        ${badgesPanel()}
        ${CREDIT_HTML}`;
      return '個人檔案';
    }

    const scored = records.filter((r) => !r.noScore);
    const totalScore = scored.reduce((s, r) => s + r.score, 0);
    const totalQ = scored.reduce((s, r) => s + r.total, 0);
    const accuracy = totalQ ? `${Math.round((totalScore / totalQ) * 100)}%` : '—';
    const last = records[records.length - 1];

    const summaryRows = [...ACTIVITIES, { id: 'daily', title: '每日挑戰' }].map((a) => {
      const recs = records.filter((r) => r.activityId === a.id);
      if (!recs.length) return '';
      const best = bestOf(a.id);
      const sr = recs.filter((r) => !r.noScore);
      const sc = sr.reduce((s, r) => s + r.score, 0);
      const tq = sr.reduce((s, r) => s + r.total, 0);
      return `<tr>
        <td>${esc(a.title)}</td>
        <td>${recs.length} 次</td>
        <td>${scoreText(best)}</td>
        <td>${tq ? `${Math.round((sc / tq) * 100)}%` : '—'}</td>
      </tr>`;
    }).join('');

    const history = records.slice(-20).reverse().map((r) => {
      const act = findActivity(r.activityId);
      return `<tr>
        <td>${formatTime(r.ts)}</td>
        <td>${esc(act ? act.title : (r.activityId === 'daily' ? '每日挑戰' : r.activityId))}${r.activityId === 'daily' ? '' : `（${esc(r.modeLabel || '')}）`}</td>
        <td>${scoreText(r)}</td>
      </tr>`;
    }).join('');

    main.innerHTML = `
      <header class="page-head"><h1>個人檔案</h1></header>
      ${playerCard(false)}

      <div class="stat-grid">
        <div class="stat" data-theme="hardware"><div class="muted">遊玩次數</div><div class="stat-n">${records.length}</div></div>
        <div class="stat" data-theme="network"><div class="muted">整體正確率</div><div class="stat-n">${accuracy}</div></div>
        <div class="stat" data-theme="security"><div class="muted">最近一次</div><div class="stat-n">${formatTime(last.ts)}</div></div>
      </div>

      ${badgesPanel()}

      <section class="panel">
        <h2>各活動成績</h2>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>活動</th><th>玩過</th><th>最佳成績</th><th>平均正確率</th></tr></thead>
          <tbody>${summaryRows}</tbody>
        </table></div>
      </section>

      <section class="panel">
        <h2>最近紀錄</h2>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>時間</th><th>活動</th><th>成績</th></tr></thead>
          <tbody>${history}</tbody>
        </table></div>
      </section>

      <div class="profile-foot">
        <p>紀錄只存在這台裝置的這個瀏覽器裡。換裝置，或清除瀏覽資料後，紀錄就會消失。</p>
        <button type="button" class="btn" id="clear-records">清除所有紀錄</button>
      </div>
      ${CREDIT_HTML}`;

    $('#clear-records').addEventListener('click', async () => {
      const yes = await confirmDialog({
        title: '清除所有紀錄？',
        body: '清除後無法復原，這台裝置上的成績、經驗值、等級和徽章都會被刪除。',
        confirmText: '清除紀錄'
      });
      if (!yes) return;
      store.clear();
      toast('已清除所有紀錄');
      route();
    });
    return '個人檔案';
  }

  /* =====================================================
   * 5. 單元：二進位（範本）
   * ===================================================== */
  function startBinary(stage) {
    const TOTAL = 5;
    const ALL_PLACES = [32, 16, 8, 4, 2, 1];
    const LEVELS = {
      easy: { label: '入門', max: 15, bits: 4, desc: '1 到 15，4 格' },
      mid: { label: '進階', max: 31, bits: 5, desc: '1 到 31，5 格' },
      hard: { label: '挑戰', max: 63, bits: 6, desc: '1 到 63，6 格' }
    };
    const MODES = {
      d2b: { label: '十進位轉二進位', desc: '看到 13，輸入 1101' },
      b2d: { label: '二進位轉十進位', desc: '看到 1101，選出 13' }
    };
    let level = 'easy';
    let PLACES = ALL_PLACES.slice(-LEVELS[level].bits);
    let state = null;

    // 位值表：bits 為二進位字串，空字串代表尚未輸入
    function placeTable(bits) {
      const padded = bits ? bits.padStart(PLACES.length, '0') : '';
      const lead = bits ? PLACES.length - bits.length : 0;
      return `<div class="place" style="--cols:${PLACES.length}" role="group" aria-label="位值表">${PLACES.map((v, i) => {
        const cls = ['place-cell'];
        if (padded && padded[i] === '1') cls.push('on');
        if (padded && i < lead) cls.push('lead');
        return `<div class="${cls.join(' ')}"><span class="place-v">${v}</span><span class="place-b">${padded ? padded[i] : ''}</span></div>`;
      }).join('')}</div>`;
    }

    function usedPlaces(n) {
      return PLACES.filter((p) => n & p);
    }

    function explain(q) {
      const parts = usedPlaces(q.n);
      if (state.mode === 'd2b') {
        const sum = parts.length > 1
          ? `${q.n} = ${parts.join(' + ')}`
          : `${q.n} 剛好就是一個位值`;
        return `${sum}。用到的位值寫 1，沒用到的寫 0，所以是 ${q.bin}。`;
      }
      return parts.length > 1
        ? `${q.bin} 裡寫 1 的位置，位值是 ${parts.join('、')}，加起來是 ${q.n}。`
        : `${q.bin} 只有一個 1，它的位值是 ${q.n}，所以答案是 ${q.n}。`;
    }

    function makeOptions(n) {
      const max = LEVELS[level].max;
      const pool = shuffle([n + 1, n - 1, n + 2, n - 2, n + 4, n - 4, n ^ 1, n ^ 2, n ^ 4, n ^ 8]
        .filter((v) => v > 0 && v <= max && v !== n));
      const picked = new Set();
      for (const v of pool) {
        if (picked.size >= 3) break;
        picked.add(v);
      }
      while (picked.size < 3) {
        const v = 1 + Math.floor(Math.random() * max);
        if (v !== n) picked.add(v);
      }
      return shuffle([n, ...picked]);
    }

    function showMenu() {
      state = null;
      stage.innerHTML = `
        <h2 class="stage-title">選擇難度與玩法</h2>
        <p class="muted">每一輪 ${TOTAL} 題。第一次玩建議從「入門」開始，數字很小，還會幫你打開位值提示。</p>
        <div class="seg" role="group" aria-label="難度">
          ${Object.entries(LEVELS).map(([key, l]) => `
            <button type="button" data-level="${key}" aria-pressed="${key === level}">${l.label}<small>${l.desc}</small></button>`).join('')}
        </div>
        <div class="choice-grid">
          ${Object.entries(MODES).map(([key, m]) => `
            <button type="button" class="choice" data-mode="${key}">
              <strong>${m.label}</strong><span>${m.desc}</span>
            </button>`).join('')}
        </div>`;
      $$('.choice', stage).forEach((b) => b.addEventListener('click', () => begin(b.dataset.mode)));
      $$('.seg button', stage).forEach((b) => b.addEventListener('click', () => {
        level = b.dataset.level;
        $$('.seg button', stage).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      }));
    }

    function begin(mode) {
      const max = LEVELS[level].max;
      PLACES = ALL_PLACES.slice(-LEVELS[level].bits);
      const used = new Set();
      const qs = [];
      while (qs.length < TOTAL) {
        const n = 1 + Math.floor(Math.random() * max); // 1 ~ max
        if (used.has(n)) continue;
        used.add(n);
        qs.push({ n, bin: n.toString(2), options: mode === 'b2d' ? makeOptions(n) : null });
      }
      state = { mode, level, qs, i: 0, score: 0, answers: [], answered: false, hint: level === 'easy' };
      showQuestion();
    }

    function showQuestion() {
      const q = state.qs[state.i];
      const d2b = state.mode === 'd2b';
      state.answered = false;

      stage.innerHTML = `
        <div class="game-top">
          <div><strong>第 ${state.i + 1} 題</strong><span class="muted"> / 共 ${TOTAL} 題</span></div>
          <div class="muted">已答對 ${state.score} 題</div>
        </div>
        <div class="bar" aria-hidden="true"><i style="width:${(state.i / TOTAL) * 100}%"></i></div>

        <p class="prompt">${d2b ? '把這個十進位數字轉成二進位' : '這串二進位代表哪個十進位數字？'}</p>
        <div class="big${d2b ? '' : ' mono'}" aria-label="${d2b ? q.n : q.bin.split('').join(' ')}">${d2b ? q.n : q.bin}</div>

        ${d2b ? `
          <div class="answer-row">
            <label class="sr-only" for="bin">你的二進位答案</label>
            <input id="bin" class="bin-input" type="text" inputmode="numeric" autocomplete="off"
                   spellcheck="false" maxlength="${LEVELS[state.level].bits}" placeholder="只能輸入 0 和 1">
            <button type="button" class="btn btn-primary" id="check">確認答案</button>
          </div>` : `
          <div class="options">
            ${q.options.map((o) => `<button type="button" class="option" data-v="${o}">${o}</button>`).join('')}
          </div>`}

        <div class="hint-wrap">
          <button type="button" class="btn btn-ghost" id="hint-toggle" aria-expanded="false" aria-controls="hint">看位值提示</button>
          <div id="hint" hidden></div>
        </div>
        <div id="feedback"></div>`;

      $('#hint-toggle').addEventListener('click', () => {
        state.hint = !state.hint;
        syncHint();
      });
      syncHint();

      if (d2b) {
        const input = $('#bin');
        input.addEventListener('input', () => {
          input.value = input.value.replace(/[^01]/g, '');
          $('#feedback').innerHTML = '';
          renderHint();
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') submit(input.value);
        });
        $('#check').addEventListener('click', () => submit(input.value));
        input.focus({ preventScroll: true });
      } else {
        $$('.option', stage).forEach((btn) => btn.addEventListener('click', () => submit(btn.dataset.v, btn)));
      }
    }

    function syncHint() {
      const box = $('#hint');
      const toggle = $('#hint-toggle');
      box.hidden = !state.hint;
      toggle.setAttribute('aria-expanded', String(state.hint));
      toggle.textContent = state.hint ? '收起位值提示' : '看位值提示';
      renderHint();
    }

    function renderHint() {
      const box = $('#hint');
      if (!box || box.hidden) return;
      const q = state.qs[state.i];
      if (state.mode === 'd2b') {
        const val = $('#bin') ? $('#bin').value : '';
        const sum = val ? parseInt(val, 2) : 0;
        box.innerHTML = `
          <p>每個格子是一個位值：最右邊是 1，每往左一格就變成兩倍。要寫 1 的格子，位值就會被加進總和。</p>
          ${placeTable(val)}
          <p class="muted">你目前輸入的數字，加起來是 ${sum}。</p>`;
      } else {
        box.innerHTML = `
          <p>把寫 1 的格子上方的位值加起來，就是答案。</p>
          ${placeTable(q.bin)}`;
      }
    }

    function showNote(message) {
      $('#feedback').innerHTML = `<p class="note" role="status">${esc(message)}</p>`;
    }

    function submit(raw, clickedBtn) {
      if (state.answered) return;
      const q = state.qs[state.i];
      const d2b = state.mode === 'd2b';

      if (d2b && !raw) {
        showNote('先輸入你的答案，只能使用 0 和 1。');
        return;
      }

      const correct = d2b ? parseInt(raw, 2) === q.n : Number(raw) === q.n;
      state.answered = true;
      if (correct) state.score++;
      state.answers.push({
        q,
        user: d2b ? raw.replace(/^0+(?=.)/, '') : raw,
        ok: correct
      });

      if (d2b) {
        const input = $('#bin');
        input.disabled = true;
        input.classList.add(correct ? 'is-correct' : 'is-wrong');
        $('#check').disabled = true;
      } else {
        $$('.option', stage).forEach((btn) => {
          btn.disabled = true;
          if (Number(btn.dataset.v) === q.n) btn.classList.add('is-correct');
          else if (btn === clickedBtn) btn.classList.add('is-wrong');
        });
      }

      const last = state.i === TOTAL - 1;
      const answerText = d2b ? q.bin : q.n;
      $('#feedback').innerHTML = `
        <div class="feedback ${correct ? 'good' : 'bad'}" role="status">
          <strong>${correct ? '答對了' : `答錯了，正確答案是 ${answerText}`}</strong>
          <p>${explain(q)}</p>
          ${placeTable(q.bin)}
        </div>
        <button type="button" class="btn btn-primary" id="next">${last ? '看結果' : '下一題'}</button>`;

      const next = $('#next');
      next.addEventListener('click', () => {
        if (last) finish();
        else { state.i++; showQuestion(); }
      });
      next.focus({ preventScroll: true });
    }

    function finish() {
      const ok = store.add({
        activityId: 'binary',
        mode: state.mode,
        modeLabel: `${MODES[state.mode].label}・${LEVELS[state.level].label}`,
        score: state.score,
        total: TOTAL,
        ts: Date.now()
      });
      toast(ok ? '成績已存到這台裝置' : '這個瀏覽器無法儲存紀錄');

      const d2b = state.mode === 'd2b';
      const message = state.score === TOTAL ? '全對！二進位已經難不倒你。'
        : state.score >= 4 ? '很接近了，再玩一輪就能拿滿分。'
        : state.score >= 2 ? '已經抓到概念了。打開位值提示，再試一次。'
        : '沒關係，先打開位值提示，一格一格拆開來看。';

      stage.innerHTML = `
        <h2 class="stage-title">這一輪結束</h2>
        <div class="score"><span class="score-n">${state.score}</span><span class="score-t">/ ${TOTAL}</span></div>
        <p class="muted">${message}</p>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>題目</th><th>你的答案</th><th>正確答案</th><th>結果</th></tr></thead>
          <tbody>
            ${state.answers.map((a) => `
              <tr>
                <td class="num">${d2b ? a.q.n : a.q.bin}</td>
                <td class="num">${esc(a.user)}</td>
                <td class="num">${d2b ? a.q.bin : a.q.n}</td>
                <td class="${a.ok ? 'ok' : 'no'}">${a.ok ? '答對' : '答錯'}</td>
              </tr>`).join('')}
          </tbody>
        </table></div>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="again">再玩一次</button>
          <button type="button" class="btn" id="menu">換個玩法</button>
          <a class="btn" href="#/profile">查看個人檔案</a>
        </div>`;

      const mode = state.mode;
      $('#again').addEventListener('click', () => begin(mode));
      const lv = state.level;
      if (state.score === TOTAL && lv !== 'hard') {
        const nextLv = lv === 'easy' ? 'mid' : 'hard';
        $('#menu').insertAdjacentHTML('beforebegin', `<button type="button" class="btn" id="levelup">挑戰「${LEVELS[nextLv].label}」</button>`);
        $('#levelup').addEventListener('click', () => { level = nextLv; begin(mode); });
      }
      $('#menu').addEventListener('click', showMenu);
    }

    showMenu();
  }

  /* =====================================================
   * 6. 共用小工具（新增單元使用）
   * ===================================================== */
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (n) => Math.floor(Math.random() * n);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================
   * 7. 單元：CPU、記憶體與電腦組裝
   * ===================================================== */
  function startPcBuild(stage) {
    const PARTS = {
      mouse: { name: '滑鼠', info: '輸入裝置。你移動、點擊，電腦才知道你想做什麼。' },
      keyboard: { name: '鍵盤', info: '輸入裝置。把你打的字變成電腦看得懂的訊號。' },
      monitor: { name: '螢幕', info: '輸出裝置。把電腦算好的結果用畫面顯示出來。' },
      speaker: { name: '喇叭', info: '輸出裝置。把聲音播放出來。' },
      board: { name: '主機板', info: '一塊大電路板，所有零件都插在上面，靠它互相傳遞資料。' },
      cpu: { name: 'CPU（處理器）', info: '電腦的大腦，負責計算與下指令。速度越快，電腦反應越快。' },
      ram: { name: '記憶體（RAM）', info: '像一張工作桌，暫時放著正在使用的程式和資料。速度很快，但關機後內容就消失。' },
      ssd: { name: '硬碟／SSD', info: '像一個檔案櫃，長期保存檔案和程式。關機後資料還在，但速度比記憶體慢。' },
      psu: { name: '電源供應器', info: '把插座的電轉成各個零件能用的電。' }
    };
    const SLOTS = [
      { id: 'out', label: '輸出', hint: '把結果呈現給你的裝置', accepts: ['monitor', 'speaker'], cap: 2, zone: true },
      { id: 'board', label: '主機板位置', accepts: ['board'], cap: 1 },
      { id: 'cpu', label: 'CPU 插槽', accepts: ['cpu'], cap: 1 },
      { id: 'ram', label: '記憶體插槽', accepts: ['ram'], cap: 1 },
      { id: 'ssd', label: '儲存空間', accepts: ['ssd'], cap: 1 },
      { id: 'psu', label: '電源', accepts: ['psu'], cap: 1 },
      { id: 'in', label: '輸入', hint: '把你的操作送進電腦的裝置', accepts: ['mouse', 'keyboard'], cap: 2, zone: true }
    ];
    const TOTAL = Object.keys(PARTS).length;
    const slotById = (id) => SLOTS.find((s) => s.id === id);
    const homeOf = (partId) => SLOTS.find((s) => s.accepts.includes(partId));

    let state;
    let drag = null;
    let lastDragEnd = 0;

    function begin() {
      state = { order: shuffle(Object.keys(PARTS)), placed: {}, wrong: {}, selected: null, msg: '', done: false };
      render();
    }

    function slotHtml(s) {
      const items = Object.keys(state.placed).filter((id) => state.placed[id] === s.id);
      return `
        <div class="slot" data-slot="${s.id}" tabindex="0" role="button" aria-label="放進${s.label}">
          <div class="slot-head"><strong>${s.label}</strong>${s.hint ? `<span class="muted">${s.hint}</span>` : ''}</div>
          <div class="slot-items">
            ${items.length
              ? items.map((id) => `<span class="placed">${PARTS[id].name}</span>`).join('')
              : '<span class="slot-empty">放這裡</span>'}
          </div>
        </div>`;
    }

    function render() {
      const placedCount = Object.keys(state.placed).length;
      const free = state.order.filter((id) => !state.placed[id]);
      const firstTry = Object.keys(PARTS).filter((id) => !state.wrong[id]).length;

      stage.innerHTML = `
        <div class="game-top">
          <strong>已安裝 ${placedCount} / ${TOTAL}</strong>
          <button type="button" class="btn btn-ghost" id="restart">重新開始</button>
        </div>
        <div class="bar" aria-hidden="true"><i style="width:${(placedCount / TOTAL) * 100}%"></i></div>
        <p class="prompt">把左邊的零件拖進右邊的電腦。也可以先點零件，再點要放的位置。</p>

        <div class="build">
          <div class="build-parts">
            <div class="parts">
              ${free.map((id) => `<button type="button" class="part${state.selected === id ? ' is-selected' : ''}" data-part="${id}">${PARTS[id].name}</button>`).join('')}
            </div>
            ${free.length ? '' : '<p class="muted">零件都裝好了。</p>'}
          </div>
          <div class="build-pc">
            ${slotHtml(slotById('out'))}
            <div class="case">
              <div class="case-label">主機內部</div>
              <div class="case-grid">
                ${['board', 'cpu', 'ram', 'ssd', 'psu'].map((id) => slotHtml(slotById(id))).join('')}
              </div>
            </div>
            ${slotHtml(slotById('in'))}
          </div>
        </div>

        <div id="build-msg">${state.msg}</div>

        ${state.done ? `
          <section class="recap">
            <h2>組裝完成</h2>
            <p>第一次就放對的零件：${firstTry} / ${TOTAL}</p>
            <p class="muted">這些零件是這樣合作的：</p>
            <ol class="flow">
              <li>你用滑鼠和鍵盤下指令，這是「輸入」。</li>
              <li>CPU 負責計算，並指揮其他零件。</li>
              <li>正在處理的資料，暫時放在記憶體，因為它夠快。</li>
              <li>要長期保存的檔案，存進 SSD。</li>
              <li>結果透過螢幕和喇叭呈現，這是「輸出」。</li>
            </ol>
            <p class="muted">主機板負責把這些零件連在一起，電源供應器則負責供電。</p>
            <div class="btn-row">
              <button type="button" class="btn btn-primary" id="again">再組一台</button>
              <a class="btn" href="#/profile">查看個人檔案</a>
            </div>
          </section>` : ''}`;

      $$('.part', stage).forEach(bindPart);
      $$('.slot', stage).forEach((el) => {
        el.addEventListener('click', () => onSlot(el.dataset.slot));
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSlot(el.dataset.slot);
          }
        });
      });
      $('#restart').addEventListener('click', begin);
      const again = $('#again');
      if (again) again.addEventListener('click', begin);
    }

    function onSlot(slotId) {
      if (state.done) return;
      if (!state.selected) {
        state.msg = '<p class="note" role="status">先點選左邊的一個零件，或直接把零件拖過來。</p>';
        render();
        return;
      }
      attempt(state.selected, slotId);
    }

    function attempt(partId, slotId) {
      const slot = slotById(slotId);
      const part = PARTS[partId];
      const count = Object.values(state.placed).filter((v) => v === slotId).length;

      if (slot.accepts.includes(partId) && count < slot.cap) {
        state.placed[partId] = slotId;
        state.selected = null;
        state.msg = `
          <div class="feedback good" role="status">
            <strong>${part.name} 裝好了</strong>
            <p>${part.info}</p>
          </div>`;
        if (Object.keys(state.placed).length === TOTAL) finish();
      } else {
        state.wrong[partId] = (state.wrong[partId] || 0) + 1;
        state.selected = null;
        state.msg = `
          <div class="feedback bad" role="status">
            <strong>這裡放不了「${part.name}」</strong>
            <p>${part.name}應該放在「${homeOf(partId).label}」。換個位置再試試看。</p>
          </div>`;
      }
      render();
    }

    function finish() {
      state.done = true;
      const firstTry = Object.keys(PARTS).filter((id) => !state.wrong[id]).length;
      const ok = store.add({
        activityId: 'pc-build',
        mode: 'drag',
        modeLabel: '拖曳組裝',
        score: firstTry,
        total: TOTAL,
        ts: Date.now()
      });
      toast(ok ? '成績已存到這台裝置' : '這個瀏覽器無法儲存紀錄');
    }

    /* ---- 拖曳（Pointer Events，滑鼠與觸控都能用） ---- */
    function makeGhost(id) {
      const g = document.createElement('div');
      g.className = 'drag-ghost';
      g.textContent = PARTS[id].name;
      return g;
    }
    function slotAt(x, y) {
      const el = document.elementFromPoint(x, y);
      return el ? el.closest('.slot') : null;
    }
    function clearOver() {
      $$('.slot.is-over', stage).forEach((e) => e.classList.remove('is-over'));
    }
    function endDrag() {
      if (drag && drag.ghost) drag.ghost.remove();
      clearOver();
      drag = null;
    }

    function bindPart(el) {
      const id = el.dataset.part;

      el.addEventListener('click', () => {
        if (Date.now() - lastDragEnd < 400) return; // 剛拖完，不當成點擊
        state.selected = state.selected === id ? null : id;
        state.msg = state.selected
          ? `<p class="note" role="status">已選取「${PARTS[id].name}」，再點一下要放的位置。</p>`
          : '';
        render();
        const again = stage.querySelector(`.part[data-part="${id}"]`);
        if (again) again.focus({ preventScroll: true });
      });

      el.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        drag = { id, startX: e.clientX, startY: e.clientY, moved: false, ghost: null };
        el.setPointerCapture(e.pointerId);
      });

      el.addEventListener('pointermove', (e) => {
        if (!drag || drag.id !== id) return;
        if (!drag.moved) {
          if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 6) return;
          drag.moved = true;
          drag.ghost = makeGhost(id);
          document.body.appendChild(drag.ghost);
          el.classList.add('is-dragging');
        }
        drag.ghost.style.left = `${e.clientX}px`;
        drag.ghost.style.top = `${e.clientY}px`;
        clearOver();
        const over = slotAt(e.clientX, e.clientY);
        if (over) over.classList.add('is-over');
      });

      el.addEventListener('pointerup', (e) => {
        if (!drag || drag.id !== id) return;
        const moved = drag.moved;
        const target = moved ? slotAt(e.clientX, e.clientY) : null;
        endDrag();
        if (!moved) return;
        lastDragEnd = Date.now();
        el.classList.remove('is-dragging');
        if (target && !state.done) attempt(id, target.dataset.slot);
      });

      el.addEventListener('pointercancel', () => {
        endDrag();
        el.classList.remove('is-dragging');
      });
    }

    begin();
  }

  /* =====================================================
   * 8. 單元：DNS 轉 IP
   * ===================================================== */
  function startDns(stage) {
    const TLDS = ['.com', '.org', '.net', '.io', '.tw'];
    const NAMES = ['sunny-cafe', 'book-garden', 'night-market', 'happy-pets', 'study-lab'];
    const TRAIL = ['快取', 'Root', 'TLD', '權威伺服器', '完成'];
    const STEP_INDEX = { cache: 0, root: 1, tld: 2, auth: 3, done: 4 };
    let s;

    function newRound() {
      const tld = pick(TLDS);
      const doors = shuffle(TLDS);
      const pos = doors.indexOf(tld);
      const fromLeft = Math.random() < 0.5;
      s = {
        step: 'cache',
        flipped: false,
        hit: false,
        domain: `www.${pick(NAMES)}${tld}`,
        tld,
        doors,
        fromLeft,
        hintNo: fromLeft ? pos + 1 : doors.length - pos,
        revealed: [],
        mistakes: 0,
        askedAgain: false,
        msg: '',
        ip: `203.0.113.${10 + randInt(200)}`
      };
      render();
    }

    const rootSays = () => `
      <blockquote class="say">「結尾是 <strong>${s.tld}</strong> 的網址，請到 TLD 大廳，從${s.fromLeft ? '左' : '右'}邊數來第 <strong>${s.hintNo}</strong> 道門。」</blockquote>`;

    function cacheView() {
      const url = `<span class="url">${s.domain}</span>`;
      if (!s.flipped) {
        return `
          <p>你在瀏覽器輸入了 ${url}。但電腦只看得懂 IP 位址（一串數字），所以要先查出這個網址的 IP。</p>
          <p>第一步，先翻開電腦的記憶體（快取），看看以前有沒有查過。</p>
          <button type="button" class="flipcard" id="flip">
            <span class="flip-title">記憶體（快取）</span><span>點一下翻開</span>
          </button>`;
      }
      if (s.hit) {
        return `
          <button type="button" class="flipcard is-hit" disabled>
            <span class="flip-title">成功！快取命中</span><span>找到 ${s.domain} 的紀錄了</span>
          </button>
          <p>電腦之前查過這個網址，答案還留在記憶體裡，直接拿到 IP，馬上就能連上網站。這就是快取的好處：不用每次都從頭問起。</p>
          <p class="muted">這次運氣很好，不用查詢。再試一次，看看快取落空時會發生什麼事。</p>
          <div class="btn-row"><button type="button" class="btn btn-primary" id="retry">再試一次</button></div>`;
      }
      return `
        <button type="button" class="flipcard is-miss" disabled>
          <span class="flip-title">失敗！快取落空</span><span>沒有 ${s.domain} 的紀錄</span>
        </button>
        <p>記憶體裡沒有 ${url} 的紀錄，電腦得一站一站去問，才能查到 IP。</p>
        <div class="btn-row"><button type="button" class="btn btn-primary" id="go-root">開始查詢</button></div>`;
    }

    function rootView() {
      return `
        <h2>第一站：Root 伺服器</h2>
        <p>這是 DNS 查詢的起點，網址最後面看不見的那個「.」，就代表它。它不知道 ${s.domain} 的 IP，但知道各種網址結尾該往哪裡走。</p>
        ${rootSays()}
        <p class="muted">等一下的門上不會寫字，請把這句話記起來。</p>
        <div class="btn-row"><button type="button" class="btn btn-primary" id="go-tld">我記住了，前往 TLD 大廳</button></div>`;
    }

    function tldView() {
      return `
        <h2>第二站：TLD 大廳</h2>
        <p>TLD 是網址的結尾類別。大廳裡有 ${s.doors.length} 道門，每一道通往一種結尾，但門上沒有標示。憑剛才聽到的路線，選一道門。</p>
        <div class="door-row">
          <span class="side">左</span>
          <div class="doors">
            ${s.doors.map((d, i) => (s.revealed.includes(i)
              ? `<button type="button" class="door is-wrong" disabled>${d}</button>`
              : `<button type="button" class="door" data-i="${i}" aria-label="從左數來第 ${i + 1} 道門">？</button>`)).join('')}
          </div>
          <span class="side">右</span>
        </div>
        ${s.msg}
        ${s.mistakes > 0 ? `
          <div class="btn-row"><button type="button" class="btn" id="ask-again">回頭再問 Root 一次</button></div>
          ${s.askedAgain ? rootSays() : ''}` : ''}`;
    }

    function authView() {
      return `
        <h2>第三站：權威伺服器</h2>
        <p>門打開了，門上寫著 <strong>${s.tld}</strong>。TLD 伺服器知道 ${s.domain} 的資料交給哪一台權威網域名稱伺服器保管，帶你過去。</p>
        <p>權威伺服器保管著這個網址的正式紀錄，它告訴你：</p>
        <blockquote class="say">「${s.domain} 的 IP 位址是 <strong class="ip">${s.ip}</strong>。」</blockquote>
        <div class="btn-row"><button type="button" class="btn btn-primary" id="finish">把 IP 帶回電腦</button></div>`;
    }

    function doneView() {
      return `
        <h2>查詢完成</h2>
        <p>你把 <span class="ip">${s.ip}</span> 帶回電腦，瀏覽器就能用它連上 ${s.domain}。電腦也會把這筆紀錄存進快取，下次就能直接命中。</p>
        <ol class="flow">
          <li>先看快取：沒有紀錄（快取落空）。</li>
          <li>問 Root 伺服器：它告訴你往 ${s.tld} 的 TLD 大廳走。</li>
          <li>到 TLD 伺服器：它指向負責這個網址的權威伺服器。</li>
          <li>問權威伺服器：拿到 IP ${s.ip}。</li>
        </ol>
        <p class="muted">${s.mistakes === 0 ? '路線一次就記對了。' : `中途走錯了 ${s.mistakes} 次，下次試著把 Root 說的話記清楚。`}</p>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="again">再玩一次</button>
          <a class="btn" href="#/profile">查看個人檔案</a>
        </div>`;
    }

    function render() {
      const idx = STEP_INDEX[s.step];
      const trail = `<ol class="trail" aria-label="查詢進度">${TRAIL.map((t, i) =>
        `<li class="${i < idx ? 'is-done' : i === idx ? 'is-now' : ''}"${i === idx ? ' aria-current="step"' : ''}>${t}</li>`).join('')}</ol>`;
      const views = { cache: cacheView, root: rootView, tld: tldView, auth: authView, done: doneView };
      stage.innerHTML = `${trail}<div class="scene">${views[s.step]()}</div>`;

      const on = (sel, fn) => {
        const el = $(sel, stage);
        if (el) el.addEventListener('click', fn);
      };
      on('#flip', () => { s.flipped = true; s.hit = Math.random() < 0.35; render(); });
      on('#retry', newRound);
      on('#go-root', () => { s.step = 'root'; render(); });
      on('#go-tld', () => { s.step = 'tld'; render(); });
      on('#ask-again', () => { s.askedAgain = true; render(); });
      on('#finish', finish);
      on('#again', newRound);
      $$('.door[data-i]', stage).forEach((b) => b.addEventListener('click', () => pickDoor(Number(b.dataset.i))));
    }

    function pickDoor(i) {
      if (s.doors[i] === s.tld) {
        s.step = 'auth';
      } else {
        s.revealed.push(i);
        s.mistakes++;
        s.msg = `<p class="note" role="status">這道門通往 ${s.doors[i]}，不是你要找的 ${s.tld}。再想想 Root 說的話。</p>`;
      }
      render();
    }

    function finish() {
      s.step = 'done';
      const ok = store.add({
        activityId: 'dns',
        mode: 'full',
        modeLabel: '完整查詢',
        score: s.mistakes === 0 ? 1 : 0,
        total: 1,
        ts: Date.now()
      });
      toast(ok ? '成績已存到這台裝置' : '這個瀏覽器無法儲存紀錄');
      render();
    }

    newRound();
  }

  /* =====================================================
   * 9. 共用：選擇題引擎
   * ===================================================== */
  function runQuiz(stage, cfg) {
    const qs = shuffle(cfg.questions).map((q) => ({
      q: q.q,
      explain: q.explain,
      opts: shuffle(q.options.map((t, i) => ({ t, ok: i === q.answer })))
    }));
    const TOTAL = qs.length;
    let i = 0;
    let score = 0;
    const answers = [];

    function show() {
      const q = qs[i];
      stage.innerHTML = `
        <div class="game-top">
          <div><strong>第 ${i + 1} 題</strong><span class="muted"> / 共 ${TOTAL} 題</span></div>
          <div class="muted">已答對 ${score} 題</div>
        </div>
        <div class="bar" aria-hidden="true"><i style="width:${(i / TOTAL) * 100}%"></i></div>
        <h2 class="question">${esc(q.q)}</h2>
        <div class="opt-list">
          ${q.opts.map((o, k) => `<button type="button" class="opt" data-k="${k}">${esc(o.t)}</button>`).join('')}
        </div>
        <div id="feedback"></div>`;
      $$('.opt', stage).forEach((b) => b.addEventListener('click', () => answer(Number(b.dataset.k), b)));
    }

    function answer(k, btn) {
      const q = qs[i];
      const ok = q.opts[k].ok;
      if (ok) score++;
      answers.push({ q: q.q, mine: q.opts[k].t, right: q.opts.find((o) => o.ok).t, ok });

      $$('.opt', stage).forEach((b, idx) => {
        b.disabled = true;
        if (q.opts[idx].ok) b.classList.add('is-correct');
        else if (b === btn) b.classList.add('is-wrong');
      });

      const last = i === TOTAL - 1;
      $('#feedback').innerHTML = `
        <div class="feedback ${ok ? 'good' : 'bad'}" role="status">
          <strong>${ok ? '答對了' : '答錯了'}</strong>
          <p>${esc(q.explain)}</p>
        </div>
        <button type="button" class="btn btn-primary" id="next">${last ? '看結果' : '下一題'}</button>`;
      const next = $('#next');
      next.addEventListener('click', () => {
        if (last) finish();
        else { i++; show(); }
      });
      next.focus({ preventScroll: true });
    }

    function finish() {
      const ok = store.add({
        activityId: cfg.id,
        mode: 'quiz',
        modeLabel: cfg.label,
        score,
        total: TOTAL,
        ts: Date.now()
      });
      toast(ok ? '成績已存到這台裝置' : '這個瀏覽器無法儲存紀錄');

      const message = score === TOTAL ? '全對！這些觀念你都掌握了。'
        : score >= TOTAL - 1 ? '很接近了，再玩一輪就能拿滿分。'
        : score >= 2 ? '已經抓到不少了，看看下面答錯的題目再試一次。'
        : '沒關係，看看下面的解釋，再玩一輪。';

      stage.innerHTML = `
        <h2 class="stage-title">這一輪結束</h2>
        <div class="score"><span class="score-n">${score}</span><span class="score-t">/ ${TOTAL}</span></div>
        <p class="muted">${message}</p>
        <ol class="review">
          ${answers.map((a) => `
            <li>
              <span class="${a.ok ? 'ok' : 'no'}">${a.ok ? '答對' : '答錯'}</span>　${esc(a.q)}
              ${a.ok ? '' : `<div class="muted">你選了「${esc(a.mine)}」，正確答案是「${esc(a.right)}」。</div>`}
            </li>`).join('')}
        </ol>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="again">再玩一次</button>
          <a class="btn" href="#/profile">查看個人檔案</a>
        </div>`;
      $('#again').addEventListener('click', () => runQuiz(stage, cfg));
    }

    show();
  }

  /* =====================================================
   * 10. 單元：HTTP 與 HTTPS
   * ===================================================== */
  function startHttp(stage) {
    runQuiz(stage, {
      id: 'http',
      label: '五題測驗',
      questions: [
        {
          q: 'HTTPS 比 HTTP 多了一層加密保護，這層保護機制叫什麼？',
          options: ['SSL / TLS', 'DNS', 'SMTP', 'CSS'],
          answer: 0,
          explain: 'SSL / TLS 負責把傳輸的資料加密。SSL 是早期的名稱，現在實際使用的是它的後繼版本 TLS，所以常看到兩個名字連在一起寫。'
        },
        {
          q: '網址列出現小鎖頭（HTTPS），代表什麼？',
          options: [
            '你和網站之間傳送的資料有加密',
            '這個網站一定安全可信',
            '這個網站沒有任何病毒',
            '這個網站已經過政府審查'
          ],
          answer: 0,
          explain: '鎖頭只代表連線有加密，不代表網站背後的人是好人。詐騙網站也可以申請 HTTPS，所以還是要檢查網址。'
        },
        {
          q: '在公共 Wi-Fi 上，用只有 HTTP 的網站輸入密碼，最大的風險是什麼？',
          options: [
            '密碼可能被同一個網路上的人看到',
            '網速會變慢',
            '電腦會當機',
            '網站會自動登出'
          ],
          answer: 0,
          explain: 'HTTP 傳送的內容沒有加密（明文），在同一個 Wi-Fi 裡有人側錄，就可能看到你輸入的帳號密碼。HTTPS 會把內容加密，就算被攔到也看不懂。'
        },
        {
          q: '瀏覽網頁時，你的瀏覽器向網站「要資料」，這個動作在 HTTP 裡叫什麼？',
          options: ['請求（Request）', '回應（Response）', '快取（Cache）', '加密（Encryption）'],
          answer: 0,
          explain: 'HTTP 是一來一往：瀏覽器送出「請求」，伺服器回傳「回應」，回應裡就有網頁的內容。'
        },
        {
          q: '看到「404 Not Found」這個錯誤，代表什麼？',
          options: [
            '伺服器找不到你要的頁面',
            '網站的伺服器壞掉了',
            '你的網路斷線了',
            '你輸入的密碼錯誤'
          ],
          answer: 0,
          explain: '404 是 HTTP 回應的狀態碼，代表伺服器有回應，但找不到你要的那一頁，常見原因是網址打錯或頁面已被移除。伺服器本身出問題，通常是 5 開頭的狀態碼（例如 500）。'
        }
      ]
    });
  }

  /* =====================================================
   * 11. 單元：封包冒險（TCP 三次握手）
   * ===================================================== */
  function startPacket(stage) {
    const STEPS = [
      { from: 'client', who: '你的電腦', tag: 'SYN', say: '喂？你在嗎？我想跟你說話。', note: '第 1 次：電腦先打招呼，告訴伺服器「我想建立連線」。' },
      { from: 'server', who: '網站伺服器', tag: 'SYN + ACK', say: '我在！我聽得到你。你聽得到我嗎？', note: '第 2 次：伺服器回覆「我收到了」，同時也問「你收得到我嗎？」' },
      { from: 'client', who: '你的電腦', tag: 'ACK', say: '聽得到！那我們開始吧。', note: '第 3 次：電腦確認「我也收到了」，雙方都確定能互相溝通。' }
    ];
    let n = 0;
    let busy = false;
    let playing = false;
    let run = 0;

    function build() {
      run++;
      n = 0;
      busy = false;
      playing = false;
      stage.innerHTML = `
        <p class="muted">你的電腦想連上網站，雙方要先像打電話一樣，確認彼此都聽得到。這個過程叫「TCP 三次握手」。</p>
        <div class="call" aria-hidden="true">
          <span class="avatar">你的電腦</span>
          <div class="call-track"><div class="packet" id="packet"></div></div>
          <span class="avatar">網站伺服器</span>
        </div>
        <div class="chat" id="chat" aria-live="polite">
          <p class="muted" id="chat-empty">按下「下一步」，開始第一通電話。</p>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="next">開始第一通電話</button>
          <button type="button" class="btn" id="auto">自動播放</button>
          <button type="button" class="btn btn-ghost" id="replay">重來</button>
        </div>
        <div id="recap"></div>`;
      $('#next').addEventListener('click', nextStep);
      $('#auto').addEventListener('click', autoPlay);
      $('#replay').addEventListener('click', build);
      setButtons();
    }

    function setButtons() {
      const next = $('#next', stage);
      const auto = $('#auto', stage);
      if (!next || !auto) return;
      const off = busy || playing || n >= STEPS.length;
      next.disabled = off;
      auto.disabled = off;
      next.textContent = n === 0 ? '開始第一通電話' : n >= STEPS.length ? '已完成' : '下一步';
    }

    function sendPacket(step) {
      return new Promise((resolve) => {
        const p = $('#packet', stage);
        if (!p) { resolve(); return; }
        const fromLeft = step.from === 'client';
        p.textContent = step.tag;
        p.style.transition = 'none';
        p.style.opacity = '1';
        p.style.left = fromLeft ? '0%' : '100%';
        void p.offsetWidth; // 強制重新計算，讓下面的動畫從起點開始
        if (reducedMotion()) {
          p.style.left = fromLeft ? '100%' : '0%';
          setTimeout(resolve, 60);
          return;
        }
        p.style.transition = 'left .9s ease-in-out';
        p.style.left = fromLeft ? '100%' : '0%';
        setTimeout(resolve, 950);
      });
    }

    function addBubble(step) {
      const empty = $('#chat-empty', stage);
      if (empty) empty.remove();
      const chat = $('#chat', stage);
      chat.insertAdjacentHTML('beforeend', `
        <div class="bubble from-${step.from}">
          <span class="tag">${step.tag}</span>
          <strong>${step.who}：「${step.say}」</strong>
          <p class="muted">${step.note}</p>
        </div>`);
    }

    function complete() {
      $('#recap', stage).innerHTML = `
        <div class="feedback good" role="status">
          <strong>三次握手完成，連線建立了</strong>
          <p>現在雙方才開始真正傳送網頁的資料。為什麼要三次？因為兩邊都要確認「我說得出去，也聽得到對方」：</p>
          <ul class="plain">
            <li>第 1 次之後，伺服器知道：你說得出來。</li>
            <li>第 2 次之後，你知道：伺服器聽得到，也說得出來。</li>
            <li>第 3 次之後，伺服器知道：你也聽得到它。</li>
          </ul>
        </div>`;
      const ok = store.add({
        activityId: 'packet',
        mode: 'view',
        modeLabel: '動畫',
        score: 1,
        total: 1,
        noScore: true,
        ts: Date.now()
      });
      toast(ok ? '已記錄你看完了這個動畫' : '這個瀏覽器無法儲存紀錄');
    }

    async function nextStep() {
      if (busy || n >= STEPS.length) return;
      const my = run;
      busy = true;
      setButtons();
      const step = STEPS[n];
      await sendPacket(step);
      if (my !== run) return; // 中途按了「重來」
      addBubble(step);
      n++;
      busy = false;
      if (n === STEPS.length) complete();
      setButtons();
    }

    async function autoPlay() {
      if (playing || busy || n >= STEPS.length) return;
      const my = run;
      playing = true;
      setButtons();
      while (n < STEPS.length && my === run && stage.isConnected) {
        await nextStep();
        if (my !== run) return;
        await sleep(700);
      }
      if (my === run) {
        playing = false;
        setButtons();
      }
    }

    build();
  }

  /* =====================================================
   * 12. 資安：相關法規（以台灣法規為主）
   * ===================================================== */
  const LAWS_HTML = `
    <section class="laws">
      <h2>相關法律（台灣）</h2>
      <p class="muted">以下是用白話整理的重點，不是法律意見。條文可能修正，實際內容請以全國法規資料庫（law.moj.gov.tw）為準。</p>
      <dl class="law-list">
        <dt>刑法第 339 條　詐欺取財罪</dt>
        <dd>用騙術讓別人交出財物或財產上的利益，最重可處 5 年有期徒刑，也可能併科罰金。</dd>

        <dt>刑法第 339 條之 4　加重詐欺罪</dt>
        <dd>冒用政府機關或公務員名義、三人以上共同犯案、透過網路或簡訊等方式向大眾散布，或用科技偽造他人的影像聲音來詐騙，處 1 年以上 7 年以下有期徒刑，並可併科 100 萬元以下罰金。大量寄送釣魚信與詐騙簡訊，就可能落在這一類。</dd>

        <dt>詐欺犯罪危害防制條例第 43 條</dt>
        <dd>犯加重詐欺罪，且騙到的金額達 100 萬元以上，刑度會提高到 3 年以上 10 年以下有期徒刑；達 1,000 萬元以上是 5 年以上 12 年以下；達 1 億元以上則是 7 年以上有期徒刑。這條在 2026 年 1 月修正過，金額門檻比以前低。</dd>

        <dt>刑法第 358 條　無故入侵電腦</dt>
        <dd>無故輸入別人的帳號密碼，登入別人的電腦或系統，也是犯罪。拿釣魚網站騙來的密碼去登入，就屬於這一種。</dd>

        <dt>洗錢防制法第 22 條　人頭帳戶</dt>
        <dd>不可以無正當理由，把自己的銀行帳戶或帳號交給別人使用。違反時警察會先告誡，帳戶也可能被限制或關閉；如果有收取報酬，或一次交出 3 個以上帳戶，就可能有刑事責任。</dd>
      </dl>

      <h3>收到可疑訊息時怎麼辦</h3>
      <ul class="plain">
        <li>不點連結、不回覆，也不要提供驗證碼、密碼或個人資料。</li>
        <li>用自己原本就有的方式聯絡對方：官方 App、官網，或卡片背面的客服電話。</li>
        <li>不確定時，撥打 165 反詐騙諮詢專線詢問。</li>
        <li>如果已經轉帳或提供資料，立刻撥 165 或 110，並保留對話和轉帳紀錄。</li>
      </ul>
    </section>`;

  /* =====================================================
   * 13. 共用：真假判斷引擎（釣魚郵件、詐騙簡訊）
   * ===================================================== */
  function runJudge(stage, cfg) {
    const TOTAL = 5;
    const items = shuffle(cfg.items).slice(0, TOTAL);
    let i = 0;
    let score = 0;
    const answers = [];

    function show() {
      const it = items[i];
      stage.innerHTML = `
        <div class="game-top">
          <div><strong>第 ${i + 1} 題</strong><span class="muted"> / 共 ${TOTAL} 題</span></div>
          <div class="muted">已答對 ${score} 題</div>
        </div>
        <div class="bar" aria-hidden="true"><i style="width:${(i / TOTAL) * 100}%"></i></div>
        <p class="prompt">${cfg.prompt}</p>
        ${cfg.render(it)}
        <div class="verdict-row">
          <button type="button" class="btn verdict" data-v="ok">${cfg.okLabel}</button>
          <button type="button" class="btn verdict" data-v="bad">${cfg.badLabel}</button>
        </div>
        <div id="feedback"></div>`;
      $$('.verdict', stage).forEach((b) => b.addEventListener('click', () => answer(b.dataset.v)));
    }

    function answer(v) {
      const it = items[i];
      const isBad = !(it.senderOk && it.contentOk);
      const correct = (v === 'bad') === isBad;
      if (correct) score++;
      answers.push({ it, mine: v, isBad, ok: correct });

      $$('.verdict', stage).forEach((b) => {
        b.disabled = true;
        if ((b.dataset.v === 'bad') === isBad) b.classList.add('is-correct');
        else if (b.dataset.v === v) b.classList.add('is-wrong');
      });

      const chk = (ok, label, note) => `
        <li><span class="chk ${ok ? 'ok' : 'no'}">${ok ? '正常' : '可疑'}</span><span><strong>${label}：</strong>${esc(note)}</span></li>`;

      const last = i === TOTAL - 1;
      $('#feedback').innerHTML = `
        <div class="feedback ${correct ? 'good' : 'bad'}" role="status">
          <strong>${correct ? '答對了' : '答錯了'}，這是${isBad ? cfg.badLabel : cfg.okLabel}</strong>
          <ul class="checks">
            ${chk(it.senderOk, cfg.senderLabel, it.senderNote)}
            ${chk(it.contentOk, cfg.contentLabel, it.contentNote)}
          </ul>
        </div>
        <button type="button" class="btn btn-primary" id="next">${last ? '看結果' : '下一題'}</button>`;
      const next = $('#next');
      next.addEventListener('click', () => {
        if (last) finish();
        else { i++; show(); }
      });
      next.focus({ preventScroll: true });
    }

    function finish() {
      const ok = store.add({
        activityId: cfg.id,
        mode: 'judge',
        modeLabel: cfg.label,
        score,
        total: TOTAL,
        ts: Date.now()
      });
      toast(ok ? '成績已存到這台裝置' : '這個瀏覽器無法儲存紀錄');

      const message = score === TOTAL ? '全對！你的警覺性很高。'
        : score >= 4 ? '很接近了，再玩一輪就能拿滿分。'
        : score >= 2 ? '已經抓到一些重點了，看看下面答錯的題目再試一次。'
        : '沒關係，詐騙本來就是設計來騙人的。看看下面的重點再玩一輪。';

      stage.innerHTML = `
        <h2 class="stage-title">這一輪結束</h2>
        <div class="score"><span class="score-n">${score}</span><span class="score-t">/ ${TOTAL}</span></div>
        <p class="muted">${message}</p>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>題目</th><th>你的判斷</th><th>正確答案</th><th>結果</th></tr></thead>
          <tbody>
            ${answers.map((a) => `
              <tr>
                <td>${esc(cfg.summary(a.it))}</td>
                <td>${a.mine === 'bad' ? cfg.badLabel : cfg.okLabel}</td>
                <td>${a.isBad ? cfg.badLabel : cfg.okLabel}</td>
                <td class="${a.ok ? 'ok' : 'no'}">${a.ok ? '答對' : '答錯'}</td>
              </tr>`).join('')}
          </tbody>
        </table></div>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="again">再玩一次</button>
          <a class="btn" href="#/profile">查看個人檔案</a>
        </div>
        ${LAWS_HTML}`;
      $('#again').addEventListener('click', () => runJudge(stage, cfg));
    }

    show();
  }

  /* =====================================================
   * 14. 單元：釣魚郵件判斷
   * ===================================================== */
  const MAIL_ITEMS = [
    {
      name: '星河銀行客服中心', addr: 'service@starbank-secure.com',
      subject: '【緊急】您的帳戶異常，請於 24 小時內驗證',
      body: ['親愛的客戶您好：', '系統偵測到您的帳戶有異常登入，為保障資金安全，我們將於 24 小時後暫停您的帳戶。', '請立即點擊下方連結登入，並輸入密碼完成驗證。'],
      link: { text: '立即驗證帳戶', url: 'https://starbank-verify.top/login' },
      senderOk: false, senderNote: '寄件網域 starbank-secure.com 不是星河銀行的官方網域（官方是 starbank.com.tw），只是名字看起來很像。',
      contentOk: false, contentNote: '用「帳戶將被暫停」製造恐慌，要你限時點連結並輸入密碼。銀行不會用信件要你登入驗證。'
    },
    {
      name: '購購網', addr: 'no-reply@gogo-shop.com.tw',
      subject: '您的訂單 GG20261008 已出貨',
      body: ['王同學您好：', '您在 10 月 8 日訂購的商品已交給物流公司，預計 2 到 3 天內送達。', '若想查詢進度，請開啟購購網 App，到「我的訂單」查看。本信不需要回覆，也不會要求您提供密碼或信用卡資料。'],
      link: null,
      senderOk: true, senderNote: 'gogo-shop.com.tw 是購購網官方網站的網域（你平常購物的網址），沒有多餘或拼錯的字。',
      contentOk: true, contentNote: '只通知訂單進度，沒有要你點連結或輸入個資，查詢方式是回到官方 App。'
    },
    {
      name: '順達物流', addr: 'delivery@sd-express.help',
      subject: '包裹配送失敗，請補繳運費',
      body: ['您的包裹因地址不完整，無法投遞。', '請於今日內補繳運費 NT$25，逾期包裹將被退回。'],
      link: { text: '立即補繳', url: 'https://sd-pay.cc/fee' },
      senderOk: false, senderNote: '順達物流的官方網域是 sd-express.com.tw，這個 .help 結尾的網域只是借用了名字。',
      contentOk: false, contentNote: '小額費用加上「今日內」的期限，是常見的詐騙手法，目的是讓你沒時間思考就輸入信用卡資料。'
    },
    {
      name: '雲端辦公室 IT 部門', addr: 'notice@cloudoffice.com.tw',
      subject: '週六凌晨系統例行維護通知',
      body: ['各位同仁好：', '本週六凌晨 02:00 到 04:00，系統將進行例行維護，期間會暫時無法登入。', '維護完成後即可正常使用，不需要任何操作。'],
      link: null,
      senderOk: true, senderNote: '網域 cloudoffice.com.tw 和公司平常使用的一致。',
      contentOk: true, contentNote: '只是公告時間，不需要你點連結、回覆或提供任何資料。'
    },
    {
      name: '幸運大贈獎活動小組', addr: 'promo@gift-center88.net',
      subject: '恭喜！您抽中最新款手機一支',
      body: ['恭喜您從 10 萬名會員中被幸運抽中！', '請在 2 小時內填寫姓名、身分證字號、手機號碼與信用卡號，以便寄送獎品。'],
      link: { text: '領取獎品', url: 'http://gift-center88.net/claim' },
      senderOk: false, senderNote: '沒聽過的單位，網域是一串雜亂的名字加數字，無法確認是誰寄的。',
      contentOk: false, contentNote: '你根本沒參加抽獎卻中獎，還要求提供身分證字號與信用卡號，並限時 2 小時，是典型的詐騙。'
    },
    {
      name: '林總經理', addr: 'ceo@cloudoffice.co',
      subject: '急！幫我處理一件事',
      body: ['我現在在開會，不方便講電話。', '請你立刻去買 5 張 5,000 元的點數卡，把序號拍照回信給我，我晚點回公司再報帳，先不要告訴別人。'],
      link: null,
      senderOk: false, senderNote: '名字是主管，但網域是 cloudoffice.co，和公司真正的 cloudoffice.com.tw 不一樣。',
      contentOk: false, contentNote: '要你買點數卡、拍序號，還叫你保密，這是「假冒主管」詐騙的典型手法。有急事，真的主管會打電話或當面說。'
    },
    {
      name: '星河銀行', addr: 'security@starbank.com.tw',
      subject: '【密碼重設】您剛剛申請了重設密碼',
      body: ['王同學您好：', '您剛剛在 App 上按了「忘記密碼」，我們收到了重設網路銀行密碼的申請。請回到星河銀行 App，依畫面指示完成設定。', '如果不是您本人操作，請忽略這封信，並撥打官方客服電話（卡片背面或官網上的號碼）。本信不含任何連結。'],
      link: null,
      senderOk: true, senderNote: 'starbank.com.tw 就是星河銀行官網的網域，拼字完全正確。',
      contentOk: true, contentNote: '沒有連結，引導你回到 App 或撥打自己找到的官方電話，不要你在信裡輸入密碼。'
    },
    {
      name: '稅務退費中心', addr: 'refund@tax-return.gov-tw.cc',
      subject: '您有一筆退稅款 NT$ 8,640 尚未領取',
      body: ['依據系統審核，您今年度有退稅款尚未領取。', '請於本週內提供銀行帳號與提款卡密碼，以便匯款。'],
      link: { text: '申請退稅', url: 'http://tax-return.gov-tw.cc' },
      senderOk: false, senderNote: '台灣政府網站的網域是以 .gov.tw 結尾，這個網址結尾是 .cc，只是把 gov-tw 放進名字裡冒充。',
      contentOk: false, contentNote: '任何機構都不會要你提供提款卡密碼。一旦要密碼，就一定有問題。'
    }
  ];

  function renderMail(m) {
    return `
      <div class="mail">
        <div class="mail-head">
          <div class="mail-row"><span class="mail-k">寄件人</span><span class="mail-v"><strong>${esc(m.name)}</strong> <span class="addr">&lt;${esc(m.addr)}&gt;</span></span></div>
          <div class="mail-row"><span class="mail-k">主旨</span><span class="mail-v">${esc(m.subject)}</span></div>
        </div>
        <div class="mail-body">
          ${m.body.map((p) => `<p>${esc(p)}</p>`).join('')}
          ${m.link ? `<p><span class="fake-link">${esc(m.link.text)}</span></p><p class="link-real">連結實際網址：${esc(m.link.url)}</p>` : ''}
        </div>
      </div>`;
  }

  function startPhishMail(stage) {
    runJudge(stage, {
      id: 'phish-mail',
      label: '辨別郵件',
      items: MAIL_ITEMS,
      prompt: '先看寄件人的電子郵件地址，再讀內容，判斷這封信可不可信。',
      render: renderMail,
      okLabel: '正常信件',
      badLabel: '可疑信件（釣魚）',
      senderLabel: '寄件人',
      contentLabel: '內容',
      summary: (m) => m.subject
    });
  }

  /* =====================================================
   * 15. 單元：詐騙簡訊判斷
   * ===================================================== */
  const SMS_ITEMS = [
    {
      from: '+63 917 555 0142',
      text: '【順達物流】您的包裹配送失敗，請於 24 小時內至 https://sd-pay.cc/fee 補填地址，逾期將退回。',
      senderOk: false, senderNote: '這是海外手機號碼（+63 開頭），不是物流公司平常使用的簡訊代號，來源可疑。',
      contentOk: false, contentNote: '網址是陌生的 sd-pay.cc，又限定 24 小時內處理，是常見的假包裹簡訊。'
    },
    {
      from: '星河銀行',
      text: '【星河銀行】您的驗證碼是 582913，10 分鐘內有效。請勿將驗證碼告訴任何人，包含銀行人員。',
      senderOk: true, senderNote: '是銀行平常發驗證碼的簡訊名稱。不過簡訊的顯示名稱有可能被偽造，所以內容比名稱更重要。',
      contentOk: true, contentNote: '只提供驗證碼，沒有連結，還提醒你不要告訴別人。前提是你剛好在操作銀行 App；如果你沒有操作卻收到，要小心有人在嘗試登入你的帳號。'
    },
    {
      from: '0966-000-123',
      text: '【高速公路電子收費】您有一筆通行費 NT$36 尚未繳納，請於今日內至 https://etc-pay.top 繳費，逾期將加收罰款並影響車籍。',
      senderOk: false, senderNote: '收費機構用一般手機號碼寄通知，來源不合理。',
      contentOk: false, contentNote: '金額很小、期限很短，附上陌生網址 etc-pay.top，還用「罰款」施壓，是常見的假通行費簡訊。'
    },
    {
      from: '康健牙醫診所',
      text: '【康健牙醫】王同學您好，提醒您明天 14:30 回診。如需改期，請直接撥打診所電話 02-2345-6789。',
      senderOk: true, senderNote: '是診所平常使用的簡訊名稱，和你看診時留下的資料相符。',
      contentOk: true, contentNote: '只是預約提醒，沒有連結，也沒有要你提供資料。要改期是請你打診所電話。'
    },
    {
      from: '0988-777-666',
      text: '【電信客服】您的帳單已逾期，今晚 12 點將停止服務。請立即點擊 http://tel-bill.vip 繳費。',
      senderOk: false, senderNote: '電信公司的客服通知不會用一般手機號碼寄送。',
      contentOk: false, contentNote: '「今晚 12 點停話」是在製造時間壓力，加上陌生網址 tel-bill.vip，很可能是要騙你輸入信用卡資料。'
    },
    {
      from: '0912-000-111',
      text: '媽，我手機掉了，這是新號碼。我現在急需付款，你先匯 3 萬到這個帳戶，晚點再跟你說。',
      senderOk: false, senderNote: '一組你沒存過的新號碼，卻自稱是家人。',
      contentOk: false, contentNote: '急著要錢、不讓你有時間確認，是「假冒親友」詐騙。先打原本的電話，或問一個只有本人知道的問題。'
    },
    {
      from: '購購網',
      text: '【購購網】您的訂單 GG20261008 已送達您選擇的門市，取貨代碼 7K3M9。請於 7 天內取貨，逾期將退回。',
      senderOk: true, senderNote: '是購購網平常使用的簡訊名稱。',
      contentOk: true, contentNote: '沒有連結，也沒有要你付款或提供個資，只是取貨通知。前提是你真的有訂這筆訂單；如果你沒買東西，就要小心。'
    },
    {
      from: '0920-555-888',
      text: '老師帶你穩賺不賠！每月保證 30% 報酬，名額有限，加入 LINE 群組 https://line-vip.cc/join 領取內線資料。',
      senderOk: false, senderNote: '陌生手機號碼群發訊息，你根本沒有聯絡過對方。',
      contentOk: false, contentNote: '沒有人能保證獲利。「穩賺不賠」「保證報酬」是投資詐騙的警訊，還要你加入陌生群組。'
    }
  ];

  function renderSms(m) {
    return `
      <div class="sms">
        <div class="sms-from">${esc(m.from)}</div>
        <div class="sms-bubble">${esc(m.text)}</div>
      </div>`;
  }

  function startPhishSms(stage) {
    runJudge(stage, {
      id: 'phish-sms',
      label: '辨別簡訊',
      items: SMS_ITEMS,
      prompt: '先看發送來源，再讀簡訊內容，判斷這則簡訊可不可信。',
      render: renderSms,
      okLabel: '正常簡訊',
      badLabel: '詐騙簡訊',
      senderLabel: '發送來源',
      contentLabel: '內容',
      summary: (m) => (m.text.length > 22 ? `${m.text.slice(0, 22)}…` : m.text)
    });
  }

  const GAMES = {
    binary: startBinary,
    'pc-build': startPcBuild,
    dns: startDns,
    http: startHttp,
    packet: startPacket,
    'phish-mail': startPhishMail,
    'phish-sms': startPhishSms
  };

  /* =====================================================
   * 16. 路由（用網址的 # 切換頁面，適合 GitHub Pages）
   * ===================================================== */
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    let title;
    let nav = 'home';

    if (parts[0] === 'area' && findArea(parts[1])) {
      title = renderArea(parts[1]);
    } else if (parts[0] === 'activity' && findActivity(parts[1])) {
      title = renderActivity(parts[1]);
    } else if (parts[0] === 'daily') {
      title = renderDaily();
      nav = 'daily';
    } else if (parts[0] === 'glossary') {
      title = renderGlossary();
      nav = 'glossary';
    } else if (parts[0] === 'profile') {
      title = renderProfile();
      nav = 'profile';
    } else {
      title = renderHome();
    }

    document.title = title === APP_NAME ? APP_NAME : `${title}｜${APP_NAME}`;
    $$('.topbar nav a').forEach((a) => {
      if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    updateNav();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  // 頂部選單：個人檔案旁顯示等級，每日挑戰還沒玩時顯示小紅點
  function updateNav() {
    const prof = $('.topbar nav a[data-nav="profile"]');
    if (prof) prof.innerHTML = `個人檔案<span class="lv">${levelOf(store.load().xp)} 級</span>`;
    const daily = $('.topbar nav a[data-nav="daily"]');
    if (daily) daily.classList.toggle('has-dot', !dailyDone());
  }

  window.addEventListener('hashchange', route);
  route();
})();