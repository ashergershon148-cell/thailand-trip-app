-sm" data-nav="apps" data-apps-cat="food">GrabFood / אוכל רחוב</button></p>`;
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
