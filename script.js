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

  // 各單元最後的教學內容。之後在這裡填入 HTML，例如：
  // TUTORIALS.binary = '<p>二進位只有 0 和 1……</p>';
  const TUTORIALS = {};

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
  const store = {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { records: [] };
        const data = JSON.parse(raw);
        return data && Array.isArray(data.records) ? data : { records: [] };
      } catch (e) {
        return { records: [] };
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
      data.records.push(record);
      if (data.records.length > 500) data.records.splice(0, data.records.length - 500);
      return this.save(data);
    },
    clear() {
      return this.save({ records: [] });
    }
  };

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
  function renderHome() {
    const played = playedIds();
    main.innerHTML = `
      <section class="intro">
        <h1>用玩的，搞懂電腦與網路</h1>
        <p>不需要任何基礎。挑一個主題，動手玩幾分鐘，就能看懂平常用的東西是怎麼運作的。</p>
      </section>
      <div class="area-grid">
        ${AREAS.map((area) => {
          const acts = ACTIVITIES.filter((a) => a.area === area.id);
          const done = acts.filter((a) => played.has(a.id)).length;
          const pct = Math.round((done / acts.length) * 100);
          return `
            <a class="area-card" href="#/area/${area.id}">
              <span class="icon-box">${ICONS[area.icon]}</span>
              <h2>${area.title}</h2>
              <p>${area.desc}</p>
              <div class="area-foot"><span>共 ${acts.length} 個活動</span><span>已玩過 ${done} 個</span></div>
              <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
            </a>`;
        }).join('')}
      </div>`;
    return APP_NAME;
  }

  function renderArea(areaId) {
    const area = findArea(areaId);
    const acts = ACTIVITIES.filter((a) => a.area === areaId);
    main.innerHTML = `
      <a class="back" href="#/">${ICONS.back}回到首頁</a>
      <header class="page-head">
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
    main.innerHTML = `
      <a class="back" href="#/area/${area.id}">${ICONS.back}回到${area.title}</a>
      <header class="page-head">
        <h1>${act.title}</h1>
        <p>${act.desc}</p>
      </header>
      <section class="stage" id="stage"></section>
      <section class="tutorial">
        <h2>教學</h2>
        ${TUTORIALS[act.id] || '<p class="muted">教學內容準備中，之後會放在這裡。</p>'}
      </section>`;

    const stage = $('#stage');
    if (act.ready && GAMES[act.id]) {
      GAMES[act.id](stage);
    } else {
      stage.innerHTML = '<h2 class="stage-title">製作中</h2><p class="muted">這個單元還在準備，請稍後再來。</p>';
    }
    return act.title;
  }

  function renderProfile() {
    const records = store.load().records;

    if (!records.length) {
      main.innerHTML = `
        <header class="page-head"><h1>個人檔案</h1></header>
        <div class="empty">
          <h2>還沒有任何紀錄</h2>
          <p>玩完一個活動後，成績會自動存在這裡。</p>
          <a class="btn btn-primary" href="#/">去挑一個活動</a>
        </div>
        ${CREDIT_HTML}`;
      return '個人檔案';
    }

    const scored = records.filter((r) => !r.noScore);
    const totalScore = scored.reduce((s, r) => s + r.score, 0);
    const totalQ = scored.reduce((s, r) => s + r.total, 0);
    const accuracy = totalQ ? `${Math.round((totalScore / totalQ) * 100)}%` : '—';
    const last = records[records.length - 1];

    const summaryRows = ACTIVITIES.map((a) => {
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
        <td>${esc(act ? act.title : r.activityId)}（${esc(r.modeLabel || '')}）</td>
        <td>${scoreText(r)}</td>
      </tr>`;
    }).join('');

    main.innerHTML = `
      <header class="page-head"><h1>個人檔案</h1></header>

      <div class="stat-grid">
        <div class="stat"><div class="muted">遊玩次數</div><div class="stat-n">${records.length}</div></div>
        <div class="stat"><div class="muted">整體正確率</div><div class="stat-n">${accuracy}</div></div>
        <div class="stat"><div class="muted">最近一次</div><div class="stat-n">${formatTime(last.ts)}</div></div>
      </div>

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
        body: '清除後無法復原，這台裝置上的所有成績都會被刪除。',
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
    const PLACES = [256, 128, 64, 32, 16, 8, 4, 2, 1];
    const MODES = {
      d2b: { label: '十進位轉二進位', desc: '看到 13，輸入 1101' },
      b2d: { label: '二進位轉十進位', desc: '看到 1101，選出 13' }
    };
    let state = null;

    // 位值表：bits 為二進位字串，空字串代表尚未輸入
    function placeTable(bits) {
      const padded = bits ? bits.padStart(PLACES.length, '0') : '';
      const lead = bits ? PLACES.length - bits.length : 0;
      return `<div class="place" role="group" aria-label="位值表">${PLACES.map((v, i) => {
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
      const pool = shuffle([n + 1, n - 1, n + 2, n - 2, n + 8, n - 8, n ^ 1, n ^ 2, n ^ 4, n ^ 8]
        .filter((v) => v > 0 && v < 512 && v !== n));
      const picked = new Set();
      for (const v of pool) {
        if (picked.size >= 3) break;
        picked.add(v);
      }
      while (picked.size < 3) {
        const v = 1 + Math.floor(Math.random() * 499);
        if (v !== n) picked.add(v);
      }
      return shuffle([n, ...picked]);
    }

    function showMenu() {
      state = null;
      stage.innerHTML = `
        <h2 class="stage-title">選擇玩法</h2>
        <p class="muted">每一輪 ${TOTAL} 題，數字都在 500 以內。</p>
        <div class="choice-grid">
          ${Object.entries(MODES).map(([key, m]) => `
            <button type="button" class="choice" data-mode="${key}">
              <strong>${m.label}</strong><span>${m.desc}</span>
            </button>`).join('')}
        </div>`;
      $$('.choice', stage).forEach((b) => b.addEventListener('click', () => begin(b.dataset.mode)));
    }

    function begin(mode) {
      const used = new Set();
      const qs = [];
      while (qs.length < TOTAL) {
        const n = 1 + Math.floor(Math.random() * 499); // 1 ~ 499
        if (used.has(n)) continue;
        used.add(n);
        qs.push({ n, bin: n.toString(2), options: mode === 'b2d' ? makeOptions(n) : null });
      }
      state = { mode, qs, i: 0, score: 0, answers: [], answered: false, hint: false };
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
                   spellcheck="false" maxlength="9" placeholder="只能輸入 0 和 1">
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
        modeLabel: MODES[state.mode].label,
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
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  window.addEventListener('hashchange', route);
  route();
})();