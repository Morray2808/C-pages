(function () {
  const app = document.getElementById('theory-app');

  let setLength = 20;
  let order = [];
  let qIndex = 0;
  let score = 0;
  let answered = false;
  let currentOptions = [];
  let wrongLog = [];

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildOrder() {
    const all = shuffle([...THEORY_QUESTIONS.keys()]);
    return all.slice(0, Math.min(setLength, all.length));
  }

  function renderIntro() {
    app.innerHTML = `
      <div class="intro">
        <h2>The whole syllabus, one question at a time.</h2>
        <p>A mixed set drawn from every Unit&nbsp;1 topic &mdash; viticulture, winemaking, the world's regions, sparkling and fortified wines, and service. Weighted like the real exam, regions heaviest. Each answer explains itself.</p>
        <div class="mode-grid">
          <button class="mode-card" id="mode-short">
            <i class="ti ti-bolt" aria-hidden="true"></i>
            <div class="mode-title">Short set</div>
            <div class="mode-desc">20 questions</div>
          </button>
          <button class="mode-card" id="mode-exam">
            <i class="ti ti-clipboard-list" aria-hidden="true"></i>
            <div class="mode-title">Exam length</div>
            <div class="mode-desc">50 questions, like Unit 1</div>
          </button>
        </div>
        <button class="start-btn" id="start-btn">Start quiz</button>
      </div>
    `;
    document.getElementById('mode-short').onclick = () => { setLength = 20; highlightMode(); };
    document.getElementById('mode-exam').onclick = () => { setLength = 50; highlightMode(); };
    document.getElementById('start-btn').onclick = start;
    highlightMode();
  }

  function highlightMode() {
    const s = document.getElementById('mode-short');
    const e = document.getElementById('mode-exam');
    if (!s || !e) return;
    s.style.borderColor = setLength === 20 ? 'var(--garnet)' : 'var(--line)';
    e.style.borderColor = setLength === 50 ? 'var(--garnet)' : 'var(--line)';
  }

  function start() {
    order = buildOrder();
    qIndex = 0; score = 0; answered = false; wrongLog = [];
    renderQuestion();
  }

  function renderQuestion() {
    const q = THEORY_QUESTIONS[order[qIndex]];
    if (!answered) currentOptions = shuffle(q.options);
    const pct = Math.round((qIndex / order.length) * 100);

    app.innerHTML = `
      <div class="quiz-meta">
        <span>Question ${qIndex + 1} of ${order.length}</span>
        <span class="tally">${score} correct</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>

      <div class="note-card">
        <div class="note-label">${THEORY_CATEGORY_LABELS[q.category]}</div>
        <p class="theory-q">${escapeHtml(q.q)}</p>
      </div>

      <div class="options-grid options-grid-1" id="options"></div>
      <div class="feedback" id="feedback"></div>
    `;

    const optionsEl = document.getElementById('options');
    currentOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn';
      btn.textContent = opt;
      btn.dataset.opt = opt;
      btn.onclick = () => selectAnswer(opt, q);
      optionsEl.appendChild(btn);
    });
  }

  function selectAnswer(chosen, q) {
    if (answered) return;
    answered = true;
    const correct = chosen === q.answer;
    if (correct) score++;
    else wrongLog.push({ q: q.q, given: chosen, correct: q.answer, category: q.category, why: q.why });

    document.querySelectorAll('.opt-btn').forEach(btn => {
      const opt = btn.dataset.opt;
      btn.disabled = true;
      if (opt === q.answer) btn.classList.add('correct');
      else if (opt === chosen) btn.classList.add('incorrect');
    });

    const isLast = qIndex + 1 >= order.length;
    document.getElementById('feedback').innerHTML = `
      <p class="feedback-text">
        <span class="${correct ? 'verdict-correct' : 'verdict-incorrect'}">${correct ? 'Correct.' : 'Not quite.'}</span>
        ${escapeHtml(q.answer)}
      </p>
      <div class="why-box">
        <div class="why-label"><i class="ti ti-bulb" aria-hidden="true"></i> Why</div>
        <p class="why-text">${escapeHtml(q.why)}</p>
      </div>
      <button class="next-btn" id="next-btn">${isLast ? 'See results' : 'Next question'}</button>
    `;
    document.getElementById('next-btn').onclick = () => {
      qIndex++;
      answered = false;
      if (qIndex >= order.length) renderResults();
      else renderQuestion();
    };
  }

  function renderResults() {
    const pct = Math.round((score / order.length) * 100);

    // Tally wrong answers by category to surface weak spots.
    const weakByCat = {};
    wrongLog.forEach(w => { weakByCat[w.category] = (weakByCat[w.category] || 0) + 1; });
    const weakCats = Object.keys(weakByCat).sort((a, b) => weakByCat[b] - weakByCat[a]);

    let weakHtml = '';
    if (weakCats.length) {
      weakHtml = `
        <div class="weak-summary">
          <div class="review-heading">Where you lost points</div>
          <div class="weak-tags">
            ${weakCats.map(c => `<span class="weak-tag">${THEORY_CATEGORY_LABELS[c]} <span class="weak-count">${weakByCat[c]}</span></span>`).join('')}
          </div>
        </div>
      `;
    }

    let reviewHtml = '';
    if (wrongLog.length) {
      reviewHtml = `
        <div class="review-heading">To review</div>
        ${wrongLog.map(w => `
          <div class="review-item">
            <div class="review-desc">${escapeHtml(w.q)}</div>
            <div class="review-answers">Your answer: <span class="given">${escapeHtml(w.given)}</span> &middot; Correct: <span class="correct">${escapeHtml(w.correct)}</span></div>
            <div class="review-why">${escapeHtml(w.why)}</div>
          </div>
        `).join('')}
      `;
    } else {
      reviewHtml = `<p class="clean-sweep">Clean sweep &mdash; nothing to review.</p>`;
    }

    // Leaderboard submit — only if Supabase support is present on the page.
    const lbAvailable = typeof submitScore === 'function';
    const savedName = (function () {
      try { return localStorage.getItem('cepage_name') || ''; } catch (e) { return ''; }
    })();
    const lbHtml = lbAvailable ? `
      <div class="lb-submit" id="lb-submit">
        <div class="lb-submit-label">Post your theory score</div>
        <div class="lb-submit-row">
          <input type="text" id="lb-name" class="lb-input" placeholder="Your name" maxlength="24" value="${savedName.replace(/"/g, '&quot;')}" autocomplete="off">
          <button class="next-btn" id="lb-submit-btn">Submit</button>
        </div>
        <div class="lb-submit-status" id="lb-status"></div>
      </div>
    ` : '';

    app.innerHTML = `
      <div class="results">
        <div class="results-label">Quiz complete</div>
        <div class="results-score">${score} / ${order.length}</div>
        <div class="results-pct">${pct}% correct${pct >= 55 ? ' &middot; above the 55% pass mark' : ''}</div>
      </div>
      ${lbHtml}
      ${weakHtml}
      <div style="text-align:left;">${reviewHtml}</div>
      <div class="results-actions">
        <button class="start-btn" id="retry-btn">New quiz</button>
        <button class="btn-secondary" id="home-btn">Change length</button>
      </div>
    `;

    document.getElementById('retry-btn').onclick = start;
    document.getElementById('home-btn').onclick = renderIntro;

    if (lbAvailable) wireLeaderboardSubmit();
  }

  function wireLeaderboardSubmit() {
    const btn = document.getElementById('lb-submit-btn');
    const input = document.getElementById('lb-name');
    const status = document.getElementById('lb-status');
    if (!btn || !input) return;

    btn.onclick = async () => {
      const name = input.value.trim();
      if (!name) {
        status.textContent = 'Enter a name first.';
        status.className = 'lb-submit-status error';
        return;
      }
      try { localStorage.setItem('cepage_name', name); } catch (e) {}
      btn.disabled = true;
      status.textContent = 'Submitting\u2026';
      status.className = 'lb-submit-status';

      const lengthMode = setLength === 50 ? 'exam' : 'short';
      const ok = await submitScore(name, score, order.length, lengthMode, 'theory');
      if (ok) {
        status.innerHTML = 'Posted. <a href="leaderboard.html">See the leaderboard &rarr;</a>';
        status.className = 'lb-submit-status success';
        input.disabled = true;
      } else {
        status.textContent = "Couldn't submit \u2014 check the leaderboard setup, or try again.";
        status.className = 'lb-submit-status error';
        btn.disabled = false;
      }
    };
  }

  renderIntro();
})();
