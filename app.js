/* Thailand Trip App — interactive logic */
(function () {
  'use strict';
  const D = window.TH_DATA;
  const KEY = D.storageKey;

  const defaultState = () => ({
    dna: null,
    quiz: { step: 0, answers: {} },
    interestFilter: 'all',
    regionSort: 'match',
    regionSearch: '',
    decideTab: 'beach',
    decideAnswers: {},
    itinerary: [],
    budget: {
      days: 10,
      style: 'mid',
      fx: D.thbToIls,
      lodging: 1200,
      food: 600,
      transport: 300,
      activities: 400,
      visas: 0,
      buffer: 15
    },
    packing: {},
    appsCat: 'all',
    appsSearch: '',
    guideTab: 'season',
    guideSearch: ''
  });

  let state = load() || defaultState();

  const styleRates = {
    backpacker: { lodging: 500, food: 350, transport: 200, activities: 200 },
    mid: { lodging: 1200, food: 600, transport: 300, activities: 400 },
    comfort: { lodging: 2500, food: 1000, transport: 500, activities: 800 },
    luxury: { lodging: 5500, food: 2000, transport: 900, activities: 1500 }
  };

  const quizSteps = [
    {
      key: 'length',
      q: 'כמה ימים הטיול?',
      options: [
        { id: '3-7', he: '3–7 ימים', score: 1 },
        { id: '8-14', he: '8–14 ימים', score: 2 },
        { id: '15-21', he: '15–21 ימים', score: 3 },
        { id: '22+', he: '22+ ימים', score: 4 }
      ]
    },
    {
      key: 'budget',
      q: 'מה רמת התקציב?',
      options: [
        { id: 'backpacker', he: '🎒 באקפקר — הוסטלים ואוכל רחוב' },
        { id: 'mid', he: '💚 בינוני — מלון נעים + תערובת' },
        { id: 'comfort', he: '✨ נוחות — בוטיק / ריזורט' },
        { id: 'luxury', he: '👑 לוקס — וילות ופרמיום' }
      ]
    },
    {
      key: 'pace',
      q: 'קצב הטיול?',
      options: [
        { id: 'chill', he: '😌 רגוע — מעט יעדים, הרבה צ׳יל' },
        { id: 'balanced', he: '⚖️ מאוזן — תנועה + מנוחה' },
        { id: 'packed', he: '⚡ עמוס — לראות כמה שיותר' }
      ]
    },
    {
      key: 'interests',
      q: 'מה מעניין אתכם? (בחירה מרובה)',
      multi: true,
      options: D.interests.map(i => ({ id: i.id, he: `${i.icon} ${i.he}` }))
    },
    {
      key: 'season',
      q: 'מתי מתכננים להגיע?',
      options: [
        { id: 'nov-feb', he: 'נוב׳–פבר׳ (שיא / יבש ברוב האזורים)' },
        { id: 'mar-may', he: 'מרץ–מאי (חם; עשן בצפון)' },
        { id: 'jun-oct', he: 'יוני–אוק׳ (גשם מונסון — מחירים טובים)' },
        { id: 'flexible', he: 'גמישים / עדיין לא יודעים' }
      ]
    },
    {
      key: 'group',
      q: 'עם מי נוסעים?',
      options: [
        { id: 'solo', he: '🧍 לבד' },
        { id: 'couple', he: '💑 זוגי' },
        { id: 'friends', he: '👯 חברים' },
        { id: 'family', he: '👨‍👩‍👧‍👦 משפחה' }
      ]
    }
  ];

  const decideConfigs = {
    beach: {
      title: 'חוף צפון מפרץ מול דרום מול איים',
      prompt: 'מה הכי חשוב לכם בחופשה הימית?',
      options: [
        { id: 'easy', he: 'נגישות ונוחות (שדה, תשתיות)' },
        { id: 'drama', he: 'נופים דרמטיים וצוקים' },
        { id: 'party', he: 'מסיבות וויב צעיר' },
        { id: 'quiet', he: 'שקט, משפחה, שקיעות' },
        { id: 'dive', he: 'צלילה / סנורקל בראש' }
      ]
    },
    party: {
      title: 'איי מסיבות מול איי צ׳יל',
      prompt: 'כמה מסיבות אתם באמת רוצים?',
      options: [
        { id: 'fullmoon', he: 'Full Moon / מסיבות גדולות' },
        { id: 'some', he: 'קצת בארים, לא חובה כל לילה' },
        { id: 'none', he: 'בלי מסיבות — רק ים וטבע' }
      ]
    },
    route: {
      title: 'מסלול כללי לטיול',
      prompt: 'מה הסגנון הכללי?',
      options: [
        { id: 'north', he: 'לולאת צפון (תרבות + הרים)' },
        { id: 'beach', he: 'פוקוס חופים ואיים' },
        { id: 'classic', he: 'קלאסי: בנגקוק → צפון → דרום' },
        { id: 'food', he: 'אוכל בבנגקוק + צ׳יאנג מאי' }
      ]
    },
    rain: {
      title: 'עונת גשם — מה עושים?',
      prompt: 'מתי אתם מגיעים / כמה גמישים?',
      options: [
        { id: 'peak', he: 'נוב׳–פבר׳ — רוצה מזג אוויר בטוח' },
        { id: 'shoulder', he: 'מוכן להתפשר על מחיר מול גשם' },
        { id: 'must', he: 'חייבים לבוא ביוני–אוק׳' }
      ]
    },
    transit: {
      title: 'רכבת / אוטובוס / טיסה / מעבורת',
      prompt: 'מה עדיף לכם במעברים ארוכים?',
      options: [
        { id: 'fly', he: 'טיסה — לחסוך זמן' },
        { id: 'train', he: 'רכבת לילה — חוויה וחיסכון במלון' },
        { id: 'bus', he: 'אוטובוס/מיניוואן — זול וגמיש' },
        { id: 'ferry', he: 'איים — מעבורות / Lomprayah' }
      ]
    }
  };

  const guideTabs = [
    { id: 'season', he: 'מתי לבקר' },
    { id: 'visa', he: 'ויזה' },
    { id: 'sim', he: 'SIM / אינטרנט' },
    { id: 'transport', he: 'תחבורה' },
    { id: 'safety', he: 'בטיחות' },
    { id: 'etiquette', he: 'נימוסים' },
    { id: 'money', he: 'כסף' },
    { id: 'packing', he: 'ציוד' },
    { id: 'food', he: 'אוכל' },
    { id: 'emergency', he: 'חירום' }
  ];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function fmt(n) { return Math.round(n).toLocaleString('he-IL'); }
  function ils(thb, fx) { return fmt(thb * (fx || state.budget.fx)); }
  function regionById(id) { return D.regions.find(r => r.id === id); }

  function navigate(view, opts) {
    opts = opts || {};
    $all('.view').forEach(v => v.classList.toggle('active', v.dataset.view === view));
    $all('.tab').forEach(t => t.classList.toggle('active', t.dataset.nav === view));
    const titles = {
      home: ['תאילנד שלי', 'לוח בקרה'],
      dna: ['Trip DNA', 'חידון סגנון טיול'],
      explore: ['גלו תאילנד', 'אזורים ויעדים'],
      decide: ['מרכז החלטות', 'השוואות חכמות'],
      itin: ['מסלול', 'יום־אחר־יום'],
      budget: ['תקציב', 'THB + ILS'],
      apps: ['אפליקציות', 'שירותים מקומיים'],
      guide: ['מדריך מעשי', 'הכל במקום אחד']
    };
    const t = titles[view] || titles.home;
    $('#headerTitle').textContent = t[0];
    $('#headerSub').textContent = t[1];
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (opts.appsCat) {
      state.appsCat = opts.appsCat;
      save();
    }
    render();
  }

  function computeDNA(answers) {
    const interests = answers.interests || [];
    const scores = {};
    D.regions.forEach(r => {
      let s = 0;
      interests.forEach(i => { if (r.interests.includes(i)) s += 2; });
      if (answers.budget === 'backpacker' && r.budget.low < 1000) s += 1;
      if (answers.budget === 'luxury' && r.budget.high > 4000) s += 1;
      if (answers.group === 'family' && r.interests.includes('family')) s += 2;
      if (answers.group === 'solo' && (r.id === 'bangkok' || r.id === 'chiangmai' || r.id === 'tao')) s += 1;
      if (answers.pace === 'chill' && ['lanta','huahin','pai','samui'].includes(r.id)) s += 2;
      if (answers.pace === 'packed') s += 0.5;
      if (answers.season === 'mar-may' && ['chiangmai','chiangrai','pai'].includes(r.id)) s -= 3;
      if (answers.season === 'jun-oct' && ['chang','samet','phuket'].includes(r.id)) s -= 1;
      if (answers.season === 'jun-oct' && ['samui','phangan','tao','bangkok','chiangmai'].includes(r.id)) s += 1;
      scores[r.id] = s;
    });
    const ranked = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const top = ranked.slice(0, 5).map(id => regionById(id));

    let skeleton = '';
    const len = answers.length;
    if (len === '3-7') skeleton = 'בנגקוק (2) + יעד אחד חזק (צ׳יאנג מאי או חוף/סמוי)';
    else if (len === '8-14') skeleton = 'בנגקוק (2–3) → צפון או איים (5–8) לפי ה־DNA';
    else if (len === '15-21') skeleton = 'קלאסי: בנגקוק → צפון → דרום/איים, עם יום מעבר ריאליסטי';
    else skeleton = 'גרנד טור + יעד משני (קנצ׳נבורי / קאו סוק / איסאן)';

    if ((interests.includes('nightlife') || answers.group === 'friends') && interests.includes('beaches')) {
      skeleton += ' · שקלו סמוי–פנגן–טאו';
    }
    if (interests.includes('food') && !interests.includes('beaches')) {
      skeleton = 'בנגקוק אוכל־אינטנסיבי + צ׳יאנג מאי (khao soi) + שווקים';
    }

    return {
      answers,
      topRegions: top.map(r => r.id),
      scores,
      skeleton,
      label: buildDnaLabel(answers)
    };
  }

  function buildDnaLabel(a) {
    const budgetMap = { backpacker: 'באקפקר', mid: 'בינוני', comfort: 'נוחות', luxury: 'לוקס' };
    const paceMap = { chill: 'רגוע', balanced: 'מאוזן', packed: 'עמוס' };
    const groupMap = { solo: 'סולו', couple: 'זוגי', friends: 'חברים', family: 'משפחה' };
    return `${budgetMap[a.budget] || ''} · ${paceMap[a.pace] || ''} · ${groupMap[a.group] || ''} · ${a.length || ''}`;
  }

  function matchScore(region) {
    if (!state.dna || !state.dna.scores) return 0;
    return state.dna.scores[region.id] || 0;
  }

  /* ========== RENDERERS ========== */
  function render() {
    renderHome();
    renderQuiz();
    renderExplore();
    renderDecide();
    renderItin();
    renderBudget();
    renderApps();
    renderGuide();
  }

  function renderHome() {
    const dna = state.dna;
    const itin = state.itinerary;
    const b = state.budget;
    $('#homeStatus').textContent = dna
      ? `DNA מוכן: ${dna.label}. המשיכו להחלטות ולמסלול.`
      : 'התחילו ב־Trip DNA כדי לקבל המלצות מותאמות.';

    const days = itin.length || b.days;
    const daily = b.lodging + b.food + b.transport + b.activities;
    const total = daily * (itin.length || b.days) + (b.visas || 0);
    const withBuf = total * (1 + (b.buffer || 0) / 100);

    $('#homeStats').innerHTML = `
      <div class="stat"><div class="n">${itin.length || '—'}</div><div class="l">ימים במסלול</div></div>
      <div class="stat"><div class="n">${dna ? dna.topRegions.length : '—'}</div><div class="l">אזורים מומלצים</div></div>
      <div class="stat"><div class="n">${itin.length ? fmt(withBuf) : '—'}</div><div class="l">תקציב ≈ THB</div></div>
      <div class="stat"><div class="n">${Object.keys(state.packing).filter(k => state.packing[k]).length}</div><div class="l">פריטי ציוד ✓</div></div>`;

    if (dna) {
      const tags = (dna.answers.interests || []).map(id => {
        const i = D.interests.find(x => x.id === id);
        return i ? `<span class="tag">${i.icon} ${i.he}</span>` : '';
      }).join('');
      const recs = dna.topRegions.map(id => {
        const r = regionById(id);
        return `<li>${r.emoji} <strong>${r.he}</strong> <span class="muted">(${r.name})</span></li>`;
      }).join('');
      $('#homeDnaBody').innerHTML = `
        <p><strong>${dna.label}</strong></p>
        <div class="dna-tags">${tags}</div>
        <p class="muted">שלד מומלץ: ${dna.skeleton}</p>
        <ul class="rec-list">${recs}</ul>`;
    } else {
      $('#homeDnaBody').innerHTML = '<div class="empty-hint">עדיין לא מולא — עברו לטאב DNA</div>';
    }

    if (itin.length) {
      const regions = [...new Set(itin.map(d => d.region).filter(Boolean))];
      const names = regions.map(id => (regionById(id) || {}).he || id).join(' ← ');
      $('#homeItinBody').innerHTML = `<p><strong>${itin.length} ימים</strong></p><p class="muted">${names || 'ללא אזורים'}</p>`;
    } else {
      $('#homeItinBody').innerHTML = '<div class="empty-hint">אין מסלול שמור עדיין</div>';
    }

    $('#homeBudgetBody').innerHTML = `
      <p class="big" style="font-size:1.2rem;font-weight:800;color:var(--teal-800);margin:0">
        ≈ ${fmt(withBuf)} THB · ${ils(withBuf, b.fx)} ₪
      </p>
      <p class="muted">${itin.length || b.days} ימים · סגנון ${b.style} · שער ${b.fx}</p>`;

    const next = [];
    if (!dna) next.push({ t: 'מלאו Trip DNA', v: 'dna' });
    if (!itin.length) next.push({ t: 'בנו או טענו מסלול', v: 'itin' });
    next.push({ t: 'השוו אפשרויות במרכז ההחלטות', v: 'decide' });
    next.push({ t: 'התקינו Grab + LINE', v: 'apps' });
    next.push({ t: 'עברו על ציוד ובטיחות', v: 'guide' });
    $('#homeNext').innerHTML = next.map(n =>
      `<li><span>${n.t}</span><button type="button" data-nav="${n.v}">פתח ←</button></li>`
    ).join('');
  }

  function renderQuiz() {
    if (state.dna && state.quiz.step >= quizSteps.length) {
      $('#quizCard').classList.add('hidden');
      $('#dnaResult').classList.remove('hidden');
      const dna = state.dna;
      const tags = (dna.answers.interests || []).map(id => {
        const i = D.interests.find(x => x.id === id);
        return i ? `<span class="tag">${i.icon} ${i.he}</span>` : '';
      }).join('');
      const recs = dna.topRegions.map(id => {
        const r = regionById(id);
        return `<li>${r.emoji} <strong>${r.he}</strong> — ${r.bestFor}</li>`;
      }).join('');
      $('#dnaResultBody').innerHTML = `
        <p><span class="tag gold">${dna.label}</span></p>
        <div class="dna-tags">${tags}</div>
        <div class="detail-block"><h4>שלד מסלול</h4><p>${dna.skeleton}</p></div>
        <div class="detail-block"><h4>אזורים מומלצים</h4><ul class="rec-list">${recs}</ul></div>
        <p class="muted">סננו לפי תחומי עניין במסך "גלה", או טענו מסלול מוכן.</p>`;
      return;
    }
    $('#quizCard').classList.remove('hidden');
    $('#dnaResult').classList.add('hidden');
    const step = state.quiz.step;
    const s = quizSteps[step];
    const pct = ((step + 1) / quizSteps.length) * 100;
    $('#quizProgress').style.width = pct + '%';
    $('#quizStepLabel').textContent = `שלב ${step + 1}/${quizSteps.length}`;
    $('#quizBack').hidden = step === 0;

    let html = `<p class="quiz-q">${s.q}</p>`;
    if (s.multi) {
      const selected = state.quiz.answers.interests || [];
      html += `<div class="option-multi">${s.options.map(o =>
        `<button type="button" class="option ${selected.includes(o.id) ? 'selected' : ''}" data-multi="${o.id}">${o.he}</button>`
      ).join('')}</div>`;
    } else {
      const cur = state.quiz.answers[s.key];
      html += `<div class="option-grid">${s.options.map(o =>
        `<button type="button" class="option ${cur === o.id ? 'selected' : ''}" data-single="${o.id}">${o.he}</button>`
      ).join('')}</div>`;
    }
    $('#quizBody').innerHTML = html;
    $('#quizNext').textContent = step === quizSteps.length - 1 ? 'חשבו DNA' : 'המשך';
  }

  function renderExplore() {
    const wrap = $('#interestFilters');
    const chips = [{ id: 'all', he: 'הכל', icon: '✨' }].concat(D.interests);
    wrap.innerHTML = chips.map(c =>
      `<button type="button" class="chip ${state.interestFilter === c.id ? 'active' : ''}" data-ifilter="${c.id}">${c.icon || ''} ${c.he}</button>`
    ).join('');

    $('#regionSort').value = state.regionSort;
    $('#regionSearch').value = state.regionSearch || '';

    let list = D.regions.slice();
    if (state.interestFilter !== 'all') {
      list = list.filter(r => r.interests.includes(state.interestFilter));
    }
    if (state.dna && state.dna.answers && state.dna.answers.interests) {
      /* boost already applied via sort */
    }
    const q = (state.regionSearch || '').trim().toLowerCase();
    if (q) {
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) || r.he.includes(q) ||
        r.vibe.some(v => v.includes(q)) || (r.bestFor || '').includes(q)
      );
    }
    list.sort((a, b) => {
      if (state.regionSort === 'budget-asc') return a.budget.mid - b.budget.mid;
      if (state.regionSort === 'budget-desc') return b.budget.mid - a.budget.mid;
      if (state.regionSort === 'name') return a.he.localeCompare(b.he, 'he');
      return matchScore(b) - matchScore(a);
    });

    $('#regionList').innerHTML = list.map(r => {
      const ms = matchScore(r);
      const badge = state.dna && ms > 0 ? `<span class="match-badge">התאמה ${Math.min(99, Math.round(ms * 12))}%</span>` : '';
      return `<button type="button" class="region-card" data-region="${r.id}">
        <div class="region-top">
          <div>
            <h3>${r.emoji} ${r.he}</h3>
            <div class="region-meta">${r.name} · ${r.bestMonths.split('.')[0]}</div>
          </div>
          ${badge}
        </div>
        <div class="vibe-row">${r.vibe.map(v => `<span class="vibe">${v}</span>`).join('')}</div>
        <div class="budget-pill">≈ ${fmt(r.budget.low)}–${fmt(r.budget.high)} THB/יום · ${ils(r.budget.mid)} ₪</div>
      </button>`;
    }).join('') || '<div class="card empty-hint">אין תוצאות — נקו סינון</div>';
  }

  function openRegion(id) {
    const r = regionById(id);
    if (!r) return;
    const fx = state.budget.fx;
    $('#regionDetail').innerHTML = `
      <h2>${r.emoji} ${r.he}</h2>
      <p class="muted">${r.name}</p>
      <div class="vibe-row">${r.vibe.map(v => `<span class="vibe">${v}</span>`).join('')}</div>
      <div class="detail-block"><h4>מתאים ל</h4><p>${r.bestFor}</p></div>
      <div class="detail-block"><h4>חודשים מומלצים</h4><p>${r.bestMonths}</p></div>
      <div class="detail-block"><h4>תקציב יומי</h4>
        <p>באקפקר ${fmt(r.budget.low)} · בינוני ${fmt(r.budget.mid)} · גבוה ${fmt(r.budget.high)} THB
        (≈ ${ils(r.budget.low, fx)}–${ils(r.budget.high, fx)} ₪)</p></div>
      <div class="detail-block"><h4>חובה לעשות</h4><ul>${r.mustDos.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="detail-block"><h4>דלגו אם</h4><p>${r.skipIf}</p></div>
      <div class="detail-block"><h4>תחבורה</h4><p>${r.transit}</p></div>
      <div class="detail-block"><h4>אוכל</h4><p>${r.food}</p></div>
      <div class="quick-links">
        <button type="button" class="btn btn-primary btn-sm" data-add-region-day="${r.id}">הוסף יום למסלול</button>
        <button type="button" class="btn btn-secondary btn-sm" data-nav="apps" data-apps-cat="stays">הזמנת לינה</button>
        <button type="button" class="btn btn-ghost btn-sm" data-nav="apps" data-apps-cat="activities">אטרקציות</button>
      </div>`;
    $('#regionSheet').classList.remove('hidden');
  }

  function renderDecide() {
    $all('#decideTabs .chip').forEach(c => c.classList.toggle('active', c.dataset.decide === state.decideTab));
    const cfg = decideConfigs[state.decideTab];
    const ans = state.decideAnswers[state.decideTab];
    $('#decideBody').innerHTML = `
      <h3>${cfg.title}</h3>
      <p class="muted">${cfg.prompt}</p>
      <div class="compare-grid">${cfg.options.map(o =>
        `<button type="button" class="compare-opt ${ans === o.id ? 'selected' : ''}" data-dopt="${o.id}">${o.he}</button>`
      ).join('')}</div>`;
    const res = ans ? decideRecommendation(state.decideTab, ans) : null;
    if (res) {
      $('#decideResult').classList.remove('hidden');
      $('#decideResult').innerHTML = `
        <h3>ההמלצה</h3>
        <div class="result-box">
          <p><strong>${res.title}</strong></p>
          <p>${res.body}</p>
          <ul>${res.reasons.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>
        <div class="quick-links" style="margin-top:10px">
          <button type="button" class="btn btn-secondary btn-sm" data-nav="explore">לפתיחת אזורים</button>
          <button type="button" class="btn btn-secondary btn-sm" data-nav="apps" data-apps-cat="${res.appsCat || 'transport'}">${res.appsLabel || 'אפליקציות רלוונטיות'}</button>
        </div>`;
    } else {
      $('#decideResult').classList.add('hidden');
    }
  }

  function decideRecommendation(tab, ans) {
    const map = {
      beach: {
        easy: { title: 'Phuket או Koh Samui', body: 'תשתיות, שדות תעופה, Grab, ומגוון מלונות.', reasons: ['טיסות ישירות יחסית קלות', 'בחירת חוף לפי ויב (Kata/Nai Harn או Lamai/Maenam)', 'בסיס לטיולי יום לאיים'], appsCat: 'stays', appsLabel: 'Agoda / Booking' },
        drama: { title: 'Krabi + Railay (+ אולי Phi Phi)', body: 'צוקי ליים־סטון, Phra Nang, 4 Islands — הדרמה של הדרום.', reasons: ['Railay רק בסירה — שווה את המאמץ', 'Ao Nang כבסיס נוח', 'צילום ברמה אחרת'], appsCat: 'activities', appsLabel: 'Klook / טיולי יום' },
        party: { title: 'Koh Phangan (+ Samui/Tao)', body: 'Full Moon ב־Haad Rin — או בארים ב־Sairee בטאו.', reasons: ['פנגן = מסיבות; בצפון האי יש גם צ׳יל', 'סמוי נוח ככניסה/יציאה', 'Grab מוגבל — סקוטר + מעבורות'], appsCat: 'transport', appsLabel: '12Go / מעבורות' },
        quiet: { title: 'Koh Lanta / Hua Hin / צד רגוע בסמוי', body: 'שקיעות, משפחות, פחות המונים.', reasons: ['לנטה מצוינת לצ׳יל ארוך', 'הואה הין קרובה לבנגקוק', 'הימנעו מ־Patong ו־Haad Rin'], appsCat: 'stays', appsLabel: 'לינה רגועה' },
        dive: { title: 'Koh Tao (ואז Phangan/Samui)', body: 'קורסי PADI מהמשתלמים בעולם + סנורקל נגיש.', reasons: ['Shark Bay עדין למתחילים', 'Sairee כמרכז חיים', 'בדקו מזג ים לפני מעבורת'], appsCat: 'activities', appsLabel: 'הזמנת צלילה' }
      },
      party: {
        fullmoon: { title: 'Phangan ל־3–4 לילות + מנוחה אחרי', body: 'תכננו לינה לפי מסיבה — והתאוששות בחוף שקט.', reasons: ['בדקו תאריך ירח מלא', 'שמרו תיקים / אל תיקחו דרכון למסיבה', 'יום אחרי: יוגה / חוף צפוני'], appsCat: 'rides', appsLabel: 'GrabFood אחרי' },
        some: { title: 'Samui או Phuket (לא Patong חובה)', body: 'ברים וחיי לילה בלי Full Moon מלא.', reasons: ['Chaweng / Bangla לפי טעם', 'אפשר יום לאי שקט', 'שמרו על בטיחות במשקאות'], appsCat: 'stays', appsLabel: 'מיקום מלון' },
        none: { title: 'Lanta / Railay / צפון פנגן / Maenam', body: 'ים בלי רמקולים.', reasons: ['בחרו צד מערבי/צפוני של האיים', 'Khao Sok אם בא ג׳ונגל', 'ספא ויוגה במחירים טובים'], appsCat: 'stays', appsLabel: 'ריזורט רגוע' }
      },
      route: {
        north: { title: 'בנגקוק → צ׳יאנג מאי → (פאי / צ׳יאנג ראי)', body: 'תרבות, קפה, מקדשים, הרים.', reasons: ['הימנעו ממרץ–אפריל (עשן)', 'מיניוואן לפאי מפותל', 'טיסה חזרה מבנגקוק או CM'], appsCat: 'transport', appsLabel: '12Go / טיסות' },
        beach: { title: 'כניסה לפוקט/קרבי או סמוי ואז איים', body: 'מינימום יבשה, מקסימום ים.', reasons: ['יום מעבר בין איים = לא יום מלא לחוף', 'Lomprayah לסמוי־פנגן־טאו', 'הזמינו מעבורות מראש בעונה'], appsCat: 'transport', appsLabel: 'מעבורות' },
        classic: { title: 'Bangkok → North → Islands', body: 'המסלול הישראלי הקלאסי — ועדיין עובד.', reasons: ['2–3 בנגקוק, 4–5 צפון, 5–7 דרום', 'אל תדחסו יותר מדי מעברי יום', 'טענו "גרנד טור" או "צפון+חוף" בבונה המסלול'], appsCat: 'transport', appsLabel: '12Go לתכנון מעברים' },
        food: { title: 'Foodie Bangkok + Chiang Mai', body: 'Yaowarat, Ari, khao soi, שווקים.', reasons: ['שיעור בישול שווה לפחות פעם אחת', 'GrabFood לימי גשם', 'טענו מסלול Foodie'], appsCat: 'food', appsLabel: 'GrabFood / מדריך אוכל' }
      },
      rain: {
        peak: { title: 'נוב׳–פבר׳ — כמעט כל האזורים פתוחים', body: 'הזמינו לינה מראש באזורים חמים.', reasons: ['תאילנד עמוסה יותר', 'מחירים גבוהים', 'מזג אוויר נוח יחסית'], appsCat: 'stays', appsLabel: 'הזמנת לינה' },
        shoulder: { title: 'שילובי כתף + גמישות מעבורות', body: 'מחירים טובים יותר; תכננו באפר לימים.', reasons: ['מפרץ סמוי לפעמים יבש בזמן שפוקט רטוב', 'Windy לפני סירות', 'ריזורטים משתלמים'], appsCat: 'other', appsLabel: 'Windy / מזג אוויר' },
        must: { title: 'יוני–אוק׳: העדיפו סמוי/פנגן/טאו או בנגקוק+צפון', body: 'הצד המערבי (פוקט/קרבי) גשום יותר בממוצע.', reasons: ['גשם לרוב שוטף — לא כל היום', 'בדקו ביטוח וביטולי מעבורת', 'קאו סוק ירוק ומדהים'], appsCat: 'transport', appsLabel: '12Go + באפר' }
      },
      transit: {
        fly: { title: 'טיסות פנימיות קצרות', body: 'AirAsia / Bangkok Airways — חוסכים ימים.', reasons: ['Don Mueang לזולות', 'שימו לב למשקל כבודה', 'אל תצמידו מעבורת→טיסה'], appsCat: 'transport', appsLabel: 'AirAsia / Bangkok Air' },
        train: { title: 'רכבת לילה לבנגקוק↔צ׳יאנג מאי', body: 'חוויה + חיסכון בלילה במלון.', reasons: ['הזמינו מחלקה 2 מזגן', '12Go או אתר הרכבות', 'קחו אוזניות ומנעול קטן'], appsCat: 'transport', appsLabel: 'רכבות / 12Go' },
        bus: { title: 'מיניוואנים ואוטובוסים', body: 'זולים וגמישים — במיוחד בצפון ובמעברי איים.', reasons: ['12Go מסכם אפשרויות', 'בחרו חברות עם דירוג טוב', 'שמרו מים ותנוחות רגליים'], appsCat: 'transport', appsLabel: '12Go' },
        ferry: { title: 'מעבורות ולונגטייל', body: 'Lomprayah לסמוי־פנגן־טאו; לונגטייל לריילי.', reasons: ['בעונת גשם — ביטולים', 'תיק יבש חובה', 'הזמנה מראש בעונה'], appsCat: 'transport', appsLabel: 'Lomprayah / 12Go' }
      }
    };
    return (map[tab] && map[tab][ans]) || { title: 'המשיכו לחקור', body: '', reasons: [], appsCat: 'all' };
  }

  function renderItin() {
    const sel = $('#sampleSelect');
    if (!sel.options.length) {
      sel.innerHTML = D.sampleItineraries.map(s =>
        `<option value="${s.id}">${s.name} — ${s.he} (${s.days.length} ימים)</option>`
      ).join('');
    }
    const days = state.itinerary;
    if (!days.length) {
      $('#itinDays').innerHTML = '<div class="card empty-hint">אין ימים עדיין — טענו מסלול מוכן או לחצו ״+ יום״</div>';
      return;
    }
    $('#itinDays').innerHTML = days.map((d, i) => {
      const prev = days[i - 1];
      let transit = '';
      if (prev && prev.region && d.region && prev.region !== d.region) {
        transit = `<div class="transit-note">🚌 יום מעבר: ${(regionById(prev.region) || {}).he} → ${(regionById(d.region) || {}).he} — שיריינו זמן (טיסה/אוטובוס/מעבורת). <button type="button" class="btn btn-ghost btn-sm" data-nav="apps" data-apps-cat="transport">12Go</button></div>`;
      }
      const acts = D.activities[d.region] || [];
      const regionOpts = D.regions.map(r =>
        `<option value="${r.id}" ${d.region === r.id ? 'selected' : ''}>${r.emoji} ${r.he}</option>`
      ).join('');
      const actHtml = (d.activities || []).map((a, ai) =>
        `<div class="act-item"><span>${a}</span><button type="button" data-del-act="${i}:${ai}" aria-label="הסר">✕</button></div>`
      ).join('');
      return `<div class="day-card" data-day="${i}">
        ${transit}
        <div class="day-head">
          <span class="day-title">יום ${i + 1}</span>
          <div class="day-actions">
            <button type="button" data-move="${i}:up" title="למעלה" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" data-move="${i}:down" title="למטה" ${i === days.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" data-del-day="${i}" title="מחק">🗑</button>
          </div>
        </div>
        <label class="label">אזור</label>
        <select class="input select" data-day-region="${i}"><option value="">— בחרו —</option>${regionOpts}</select>
        <label class="label">הערה</label>
        <input class="input" data-day-note="${i}" value="${escapeAttr(d.note || '')}" placeholder="למשל: הגעה, צ׳יל, טיול יום..." />
        <label class="label">פעילויות</label>
        <select class="input select" data-add-act="${i}">
          <option value="">+ הוסף מפעילות מוצעת</option>
          ${acts.map(a => `<option value="${escapeAttr(a)}">${a}</option>`).join('')}
        </select>
        <div class="act-list">${actHtml}</div>
      </div>`;
    }).join('');
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }

  function renderBudget() {
    const b = state.budget;
    $('#fxRate').value = b.fx;
    $('#rateLabel').textContent = `(כעת ${b.fx})`;
    $('#daysRange').value = b.days;
    $('#daysVal').textContent = b.days;
    $all('#budgetStyle .seg-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.style === b.style));

    const fields = [
      { key: 'lodging', he: 'לינה' },
      { key: 'food', he: 'אוכל' },
      { key: 'transport', he: 'תחבורה מקומית' },
      { key: 'activities', he: 'אטרקציות' },
      { key: 'visas', he: 'ויזה / חד־פעמי (סה״כ)' },
      { key: 'buffer', he: 'באפר %' }
    ];
    $('#budgetFields').innerHTML = fields.map(f => `
      <div class="field">
        <div class="field-row"><span class="label" style="margin:0">${f.he}</span>
          <strong>${f.key === 'buffer' ? b[f.key] + '%' : fmt(b[f.key]) + ' THB'}</strong>
        </div>
        <input type="range" class="range" data-bf="${f.key}"
          min="${f.key === 'buffer' ? 0 : 0}"
          max="${f.key === 'buffer' ? 40 : f.key === 'visas' ? 5000 : 8000}"
          step="${f.key === 'buffer' ? 1 : 50}"
          value="${b[f.key]}" />
      </div>`).join('');

    const days = state.itinerary.length || b.days;
    const daily = b.lodging + b.food + b.transport + b.activities;
    const sub = daily * days + (b.visas || 0);
    const total = sub * (1 + (b.buffer || 0) / 100);
    $('#budgetSummary').innerHTML = `
      <p class="muted">${days} ימים · ${b.style}</p>
      <div class="big">${fmt(total)} THB</div>
      <p>≈ <strong>${ils(total, b.fx)} ₪</strong> · יומי ממוצע ${fmt(daily)} THB (${ils(daily, b.fx)} ₪)</p>
      <p class="muted">שער ידני: 1 THB = ${b.fx} ILS — עדכנו לפי שער עדכני</p>`;

    const parts = [
      { he: 'לינה', v: b.lodging * days, c: '#1a8a8a' },
      { he: 'אוכל', v: b.food * days, c: '#ff6b5a' },
      { he: 'תחבורה', v: b.transport * days, c: '#e8c36a' },
      { he: 'אטרקציות', v: b.activities * days, c: '#5ec4c4' },
      { he: 'ויזה', v: b.visas || 0, c: '#9b7bb8' }
    ];
    const max = Math.max(...parts.map(p => p.v), 1);
    $('#budgetBars').innerHTML = parts.map(p => `
      <div class="bar-row">
        <div class="bar-label"><span>${p.he}</span><span>${fmt(p.v)} THB</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${(p.v / max) * 100}%;background:${p.c}"></div></div>
      </div>`).join('');
  }

  function renderApps() {
    const cats = D.appCategories;
    $('#appsCats').innerHTML = cats.map(c =>
      `<button type="button" class="chip ${state.appsCat === c.id ? 'active' : ''}" data-acat="${c.id}">${c.he}</button>`
    ).join('');
    $('#appsSearch').value = state.appsSearch || '';
    const q = (state.appsSearch || '').trim().toLowerCase();
    let list = D.apps.slice();
    if (state.appsCat !== 'all') list = list.filter(a => a.cat === state.appsCat);
    if (q) {
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) || a.he.includes(q) ||
        a.when.includes(q) || a.tips.includes(q)
      );
    }
    const catHe = id => (cats.find(c => c.id === id) || {}).he || id;
    $('#appsList').innerHTML = list.map(a => `
      <article class="app-card">
        <div class="app-card-top">
          <div class="app-icon">${a.icon}</div>
          <div>
            <h3>${a.he}</h3>
            <div class="muted" style="font-size:0.8rem">${a.name}</div>
            <span class="cat-pill">${catHe(a.cat)}</span>
          </div>
        </div>
        <p class="app-when"><strong>מתי:</strong> ${a.when}</p>
        <div class="app-tips"><strong>טיפ מהשטח:</strong> ${a.tips}</div>
        <div class="app-links">${
          a.urls.length
            ? a.urls.map(u => `<a href="${u.url}" target="_blank" rel="noopener noreferrer">${u.label}</a>`).join('')
            : '<span class="muted" style="font-size:0.85rem">אין קישור — השתמשו לפי הטיפים למעלה</span>'
        }</div>
      </article>`).join('') || '<div class="card empty-hint">אין תוצאות</div>';
  }

  function renderGuide() {
    $('#guideTabs').innerHTML = guideTabs.map(t =>
      `<button type="button" class="chip ${state.guideTab === t.id ? 'active' : ''}" data-gtab="${t.id}">${t.he}</button>`
    ).join('');
    $('#guideSearch').value = state.guideSearch || '';
    const q = (state.guideSearch || '').trim();
    let html = guideContent(state.guideTab);
    if (q) {
      /* simple filter: show all tabs snippets that match */
      const matched = guideTabs.filter(t => {
        const c = guideContent(t.id);
        return c.includes(q) || t.he.includes(q);
      });
      if (matched.length && !guideContent(state.guideTab).includes(q)) {
        html = matched.map(t => `<div class="card guide-section"><h3>${t.he}</h3>${guideContent(t.id)}</div>`).join('');
        $('#guideBody').innerHTML = html;
        return;
      }
    }
    $('#guideBody').innerHTML = `<div class="card guide-section">${html}</div>`;
  }

  function guideContent(tab) {
    switch (tab) {
      case 'season':
        return `<h3>מתי לבקר לפי אזור</h3>
          <p><strong>נוב׳–פבר׳:</strong> השיא ברוב הארץ — מזג נוח יחסית, מחירים גבוהים.</p>
          <p><strong>מרץ–מאי:</strong> חם מאוד. בצפון (CM/CR/Pai) — עונת שריפות ו־AQI גרוע. הימנעו אם רגישים לאוויר.</p>
          <p><strong>מאי–אוק׳:</strong> מונסון. פוקט/קרבי/פי פי רטובים יותר; מפרץ סמוי לפעמים עדיף. גשם לרוב שוטף. מעבורות עלולות להתבטל.</p>
          <p class="muted">בדקו Windy לפני ימי סירות. ראו גם טאב אפליקציות ← מזג אוויר.</p>`;
      case 'visa':
        return `<h3>ויזה לתיירים (סקירה)</h3>
          <p>ישראלים לרוב נכנסים ב־Visa Exemption / פטור לתיירים לתקופה מוגבלת (בדקו את מספר הימים העדכני — הכללים משתנים).</p>
          <p><strong>חשוב:</strong> זו סקירה כללית בלבד — אמתו תמיד מול שגרירות תאילנד / אתר Immigration לפני הטיסה. כרטיס יציאה / הוכחת המשך עשויים להישאל.</p>
          <p>שהייה ארוכה יותר: ויזת תייר (TR) / הארכות — ייעוץ מקצועי מומלץ.</p>`;
      case 'sim':
        return `<h3>SIM ואינטרנט</h3>
          <p>AIS / True / dtac — דוכנים בשדה התעופה נוחים. eSIM דרך Airalo / Holafly / Klook גם עובד.</p>
          <p>חבילות 7–30 יום עם Data בשפע זולות. Wi‑Fi במלונות בדרך כלל טוב בערים; באיים קטנים — lap.</p>
          <p>התקינו Grab ו־LINE על Wi‑Fi לפני היציאה מהשדה.</p>`;
      case 'transport':
        return `<h3>תחבורה ואפליקציות</h3>
          <ul>
            <li><strong>Grab / Bolt</strong> — מוניות ומסירות אוכל</li>
            <li><strong>12Go</strong> — רכבות, אוטובוסים, מעבורות</li>
            <li><strong>BTS/MRT</strong> — בנגקוק</li>
            <li><strong>Lomprayah</strong> — סמוי/פנגן/טאו</li>
            <li>טוק־טוק: מחיר מראש; העדיפו Grab כשאפשר</li>
          </ul>
          <button type="button" class="btn btn-secondary btn-sm" data-nav="apps" data-apps-cat="transport">פתחו מרכז אפליקציות תחבורה</button>`;
      case 'safety':
        return `<h3>בטיחות והונאות</h3>
          <ul>
            <li>סקוטר: קסדה תמיד; כבישים חלקלקים בגשם; ביטוח</li>
            <li>"המקדש סגור, בואו לשוק של אחי" — סרבו בנימוס</li>
            <li>תכשיטי אבני חן / gems scam בבנגקוק — הימנעו</li>
            <li>אל תשאירו דרכון על החוף במסיבות</li>
            <li>שמרו על משקאות; לכו עם חברים בלילה</li>
            <li>בעלי חיים: אל תרכבו על פילים — בחרו מקלטי אתיקה</li>
          </ul>`;
      case 'etiquette':
        return `<h3>נימוסים ומקדשים</h3>
          <ul>
            <li>כתפיים וברכיים מכוסים במקדשים; לפעמים דוחים סארונג בכניסה</li>
            <li>הסירו נעליים בכניסה לבתים/מקדשים מסוימים</li>
            <li>אל תגעו בראש של אנשים; כפות רגליים — לא לכוון לבודהה</li>
            <li>המלך והמשפחה המלכותית — כבוד מוחלט</li>
            <li>חיוך וטון רגוע פותרים הרבה</li>
          </ul>`;
      case 'money':
        return `<h3>כסף, כרטיסים ו־ATM</h3>
          <p>מזומן עדיין מלך בשווקים ובדוכנים. ATM נפוצים — יש עמלת משיכה מקומית (~220 THB) + עמלת כרטיס שלכם.</p>
          <p>כרטיסים עם החזר עמלות / Wise / Revolut חוסכים. PromptPay (QR) נפוץ אצל מקומיים — תיירים לרוב משלמים במזומן/כרטיס.</p>
          <p>שימרו שטרות קטנים לטוק־טוק, סירות ומקדשים.</p>`;
      case 'packing': {
        const cats = {};
        D.packingItems.forEach(p => {
          cats[p.cat] = cats[p.cat] || [];
          cats[p.cat].push(p);
        });
        return `<h3>רשימת ציוד (נשמרת במכשיר)</h3>` +
          Object.keys(cats).map(cat => `
            <h4 style="margin:12px 0 4px;color:var(--teal-700)">${cat}</h4>
            ${cats[cat].map(p => `
              <label class="check-item ${state.packing[p.id] ? 'done' : ''}">
                <input type="checkbox" data-pack="${p.id}" ${state.packing[p.id] ? 'checked' : ''}/>
                <span>${p.he}</span>
              </label>`).join('')}
          `).join('');
      }
      case 'food':
        return `<h3>חובה לטעום</h3>` +
          D.foodMustTries.map(f => `
            <div class="food-item"><strong>${f.he}</strong><div class="muted">${f.note}</div></div>`
          ).join('') +
          `<p style="margin-top:12px"><button type="button" class="btn btn-secondary btn-sm" data-nav="apps" data-apps-cat="food">GrabFood / אוכל רחוב</button></p>`;
      case 'emergency':
        return `<h3>מספרי חירום</h3>
          <div class="emergency"><span>משטרה תיירות</span><a href="tel:1155">1155</a></div>
          <div class="emergency"><span>חירום כללי</span><a href="tel:191">191</a></div>
          <div class="emergency"><span>אמבולנס</span><a href="tel:1669">1669</a></div>
          <div class="emergency"><span>כבאות</span><a href="tel:199">199</a></div>
          <p class="muted">שמרו גם את פרטי ביטוח הנסיעות והשגרירות הישראלית בבנגקוק. בדקו מספרים עדכניים לפני הנסיעה.</p>`;
      default:
        return '';
    }
  }

  /* ========== EVENTS ========== */
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      const view = nav.dataset.nav;
      const appsCat = nav.dataset.appsCat;
      if (view === 'itin' && appsCat === undefined && nav.id === undefined) {
        /* ok */
      }
      navigate(view, appsCat ? { appsCat } : {});
      const sheet = $('#regionSheet');
      if (sheet && !sheet.classList.contains('hidden') && view !== 'explore') {
        sheet.classList.add('hidden');
      }
      return;
    }

    if (e.target.closest('#resetBtn')) {
      if (confirm('לאפס את כל נתוני הטיול השמורים במכשיר?')) {
        state = defaultState();
        save();
        navigate('home');
      }
      return;
    }

    if (e.target.closest('[data-close-sheet]')) {
      $('#regionSheet').classList.add('hidden');
      return;
    }
    if (e.target.closest('[data-close-export]')) {
      $('#exportSheet').classList.add('hidden');
      return;
    }

    const single = e.target.closest('[data-single]');
    if (single) {
      const step = quizSteps[state.quiz.step];
      state.quiz.answers[step.key] = single.dataset.single;
      save(); renderQuiz();
      return;
    }
    const multi = e.target.closest('[data-multi]');
    if (multi) {
      const id = multi.dataset.multi;
      const arr = state.quiz.answers.interests || [];
      const idx = arr.indexOf(id);
      if (idx >= 0) arr.splice(idx, 1); else arr.push(id);
      state.quiz.answers.interests = arr;
      save(); renderQuiz();
      return;
    }
    if (e.target.closest('#quizNext')) {
      const step = quizSteps[state.quiz.step];
      if (step.multi) {
        if (!(state.quiz.answers.interests || []).length) { alert('בחרו לפחות תחום עניין אחד'); return; }
      } else if (!state.quiz.answers[step.key]) {
        alert('בחרו אפשרות'); return;
      }
      if (state.quiz.step >= quizSteps.length - 1) {
        state.dna = computeDNA(state.quiz.answers);
        state.quiz.step = quizSteps.length;
        if (state.dna.answers.budget) {
          state.budget.style = state.dna.answers.budget;
          const rates = styleRates[state.budget.style];
          if (rates) Object.assign(state.budget, rates);
        }
        save(); render(); return;
      }
      state.quiz.step++;
      save(); renderQuiz();
      return;
    }
    if (e.target.closest('#quizBack')) {
      if (state.quiz.step > 0) { state.quiz.step--; save(); renderQuiz(); }
      return;
    }
    if (e.target.closest('#quizRestart')) {
      state.quiz = { step: 0, answers: {} };
      state.dna = null;
      save(); renderQuiz();
      return;
    }

    const ifilter = e.target.closest('[data-ifilter]');
    if (ifilter) { state.interestFilter = ifilter.dataset.ifilter; save(); renderExplore(); return; }

    const regionBtn = e.target.closest('[data-region]');
    if (regionBtn) { openRegion(regionBtn.dataset.region); return; }

    const addReg = e.target.closest('[data-add-region-day]');
    if (addReg) {
      state.itinerary.push({ region: addReg.dataset.addRegionDay, note: '', activities: [] });
      save(); $('#regionSheet').classList.add('hidden'); navigate('itin');
      return;
    }

    const dtab = e.target.closest('#decideTabs [data-decide]');
    if (dtab) { state.decideTab = dtab.dataset.decide; save(); renderDecide(); return; }
    const dopt = e.target.closest('[data-dopt]');
    if (dopt) {
      state.decideAnswers[state.decideTab] = dopt.dataset.dopt;
      save(); renderDecide();
      return;
    }

    if (e.target.closest('#loadSample')) {
      const id = $('#sampleSelect').value;
      const sample = D.sampleItineraries.find(s => s.id === id);
      if (sample) {
        state.itinerary = sample.days.map(d => ({ region: d.region, note: d.note || '', activities: [] }));
        save(); renderItin(); renderHome();
      }
      return;
    }
    if (e.target.closest('#addDay')) {
      const last = state.itinerary[state.itinerary.length - 1];
      state.itinerary.push({ region: last ? last.region : 'bangkok', note: '', activities: [] });
      save(); renderItin();
      return;
    }
    if (e.target.closest('#exportItin')) {
      const lines = ['מסלול תאילנד', '=========='];
      state.itinerary.forEach((d, i) => {
        const r = regionById(d.region);
        lines.push(`יום ${i + 1}: ${r ? r.he + ' (' + r.name + ')' : '—'}`);
        if (d.note) lines.push(`  הערה: ${d.note}`);
        (d.activities || []).forEach(a => lines.push(`  • ${a}`));
      });
      lines.push('', `תקציב משוער לפי מחשבון — ראו באפליקציה`);
      $('#exportText').value = lines.join('\n');
      $('#exportSheet').classList.remove('hidden');
      return;
    }
    if (e.target.closest('#copyExport')) {
      const ta = $('#exportText');
      ta.select();
      navigator.clipboard.writeText(ta.value).then(() => alert('הועתק!')).catch(() => document.execCommand('copy'));
      return;
    }
    if (e.target.closest('#printExport')) { window.print(); return; }

    const delDay = e.target.closest('[data-del-day]');
    if (delDay) {
      state.itinerary.splice(+delDay.dataset.delDay, 1);
      save(); renderItin(); return;
    }
    const move = e.target.closest('[data-move]');
    if (move) {
      const [iStr, dir] = move.dataset.move.split(':');
      const i = +iStr;
      const j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= state.itinerary.length) return;
      const t = state.itinerary[i];
      state.itinerary[i] = state.itinerary[j];
      state.itinerary[j] = t;
      save(); renderItin(); return;
    }
    const delAct = e.target.closest('[data-del-act]');
    if (delAct) {
      const [di, ai] = delAct.dataset.delAct.split(':').map(Number);
      state.itinerary[di].activities.splice(ai, 1);
      save(); renderItin(); return;
    }

    const styleBtn = e.target.closest('#budgetStyle [data-style]');
    if (styleBtn) {
      state.budget.style = styleBtn.dataset.style;
      const rates = styleRates[state.budget.style];
      if (rates) Object.assign(state.budget, rates);
      save(); renderBudget(); renderHome();
      return;
    }

    const acat = e.target.closest('[data-acat]');
    if (acat) { state.appsCat = acat.dataset.acat; save(); renderApps(); return; }

    const gtab = e.target.closest('[data-gtab]');
    if (gtab) { state.guideTab = gtab.dataset.gtab; save(); renderGuide(); return; }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'regionSort') { state.regionSort = t.value; save(); renderExplore(); }
    if (t.id === 'regionSearch') { /* input event below */ }
    if (t.dataset.dayRegion !== undefined) {
      state.itinerary[+t.dataset.dayRegion].region = t.value;
      save(); renderItin();
    }
    if (t.dataset.addAct !== undefined) {
      const i = +t.dataset.addAct;
      if (t.value) {
        state.itinerary[i].activities = state.itinerary[i].activities || [];
        state.itinerary[i].activities.push(t.value);
        t.value = '';
        save(); renderItin();
      }
    }
    if (t.dataset.pack) {
      state.packing[t.dataset.pack] = t.checked;
      save(); renderGuide(); renderHome();
    }
    if (t.id === 'fxRate') {
      state.budget.fx = parseFloat(t.value) || D.thbToIls;
      save(); renderBudget(); renderHome();
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'regionSearch') { state.regionSearch = t.value; renderExplore(); }
    if (t.id === 'appsSearch') { state.appsSearch = t.value; renderApps(); }
    if (t.id === 'guideSearch') { state.guideSearch = t.value; renderGuide(); }
    if (t.id === 'daysRange') {
      state.budget.days = +t.value;
      $('#daysVal').textContent = t.value;
      save(); renderBudget(); renderHome();
    }
    if (t.dataset.bf) {
      state.budget[t.dataset.bf] = +t.value;
      save(); renderBudget(); renderHome();
    }
    if (t.dataset.dayNote !== undefined) {
      state.itinerary[+t.dataset.dayNote].note = t.value;
      save();
    }
  });

  /* init */
  render();
})();
