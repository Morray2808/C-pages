(function () {
  const app = document.getElementById('app');

  let mode = 'full'; // 'full' or 'quick' (10 questions)
  let order = [];
  let qIndex = 0;
  let score = 0;
  let answered = false;
  let wrongLog = [];
  let currentOptions = [];

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightTriggers(desc, triggers) {
    // Sort longest-first so overlapping substrings don't get double-wrapped
    const sorted = [...triggers].sort((a, b) => b.length - a.length);
    let result = escapeHtml(desc);
    sorted.forEach(trigger => {
      const escaped = escapeHtml(trigger);
      // Word-boundary-safe replace on the escaped string, case-sensitive exact match
      const idx = result.indexOf(escaped);
      if (idx !== -1) {
        result = result.slice(0, idx) + '<mark class="trigger">' + escaped + '</mark>' + result.slice(idx + escaped.length);
      }
    });
    return result;
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
    const all = shuffle([...QUESTIONS.keys()]);
    return mode === 'quick' ? all.slice(0, 10) : all;
  }

  function renderIntro() {
    app.innerHTML = `
      <div class="intro">
        <h2>Tasting note, meet grape.</h2>
        <p>You're handed a written tasting note. Match it to the grape variety it most likely describes &mdash; the same instinct the WSET&nbsp;3 exam tests under time pressure.</p>
        <div class="mode-grid">
          <button class="mode-card" id="mode-quick">
            <i class="ti ti-clock" aria-hidden="true"></i>
            <div class="mode-title">Quick drill</div>
            <div class="mode-desc">10 questions, a few minutes</div>
          </button>
          <button class="mode-card" id="mode-full">
            <i class="ti ti-notebook" aria-hidden="true"></i>
            <div class="mode-title">Full drill</div>
            <div class="mode-desc">${QUESTIONS.length} questions, full set</div>
          </button>
        </div>
        <button class="start-btn" id="start-btn">Start drilling</button>
      </div>
    `;

    document.getElementById('mode-quick').onclick = () => { mode = 'quick'; highlightMode(); };
    document.getElementById('mode-full').onclick = () => { mode = 'full'; highlightMode(); };
    document.getElementById('start-btn').onclick = startDrill;
    highlightMode();
  }

  function highlightMode() {
    const quick = document.getElementById('mode-quick');
    const full = document.getElementById('mode-full');
    if (!quick || !full) return;
    quick.style.borderColor = mode === 'quick' ? 'var(--garnet)' : 'var(--line)';
    full.style.borderColor = mode === 'full' ? 'var(--garnet)' : 'var(--line)';
  }

  function startDrill() {
    order = buildOrder();
    qIndex = 0;
    score = 0;
    answered = false;
    wrongLog = [];
    renderQuiz();
  }

  function renderQuiz() {
    const q = QUESTIONS[order[qIndex]];
    if (!answered) currentOptions = shuffle(q.options);
    const pct = Math.round((qIndex / order.length) * 100);

    app.innerHTML = `
      <div class="quiz-meta">
        <span>Question ${qIndex + 1} of ${order.length}</span>
        <span class="tally">${score} correct</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>

      <div class="note-card">
        <div class="note-label">Tasting note</div>
        <p class="note-text" id="note-text">${escapeHtml(q.desc)}</p>
      </div>

      <div class="options-grid" id="options"></div>
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
    else wrongLog.push({ desc: q.desc, given: chosen, correct: q.answer, region: q.region });

    document.querySelectorAll('.opt-btn').forEach(btn => {
      const opt = btn.dataset.opt;
      btn.disabled = true;
      if (opt === q.answer) btn.classList.add('correct');
      else if (opt === chosen) btn.classList.add('incorrect');
    });

    const noteTextEl = document.getElementById('note-text');
    if (noteTextEl) noteTextEl.innerHTML = highlightTriggers(q.desc, q.triggers);

    const isLast = qIndex + 1 >= order.length;
    document.getElementById('feedback').innerHTML = `
      <p class="feedback-text">
        <span class="${correct ? 'verdict-correct' : 'verdict-incorrect'}">${correct ? 'Correct.' : 'Not quite.'}</span>
        ${q.answer} &mdash; <span class="region">classic example: ${q.region}</span>
      </p>
      <div class="why-box">
        <div class="why-label"><i class="ti ti-bulb" aria-hidden="true"></i> What gave it away</div>
        <p class="why-text">${q.why}</p>
      </div>
      <button class="next-btn" id="next-btn">${isLast ? 'See results' : 'Next question'}</button>
    `;
    document.getElementById('next-btn').onclick = () => {
      qIndex++;
      answered = false;
      if (qIndex >= order.length) renderResults();
      else renderQuiz();
    };
  }

  function renderResults() {
    const pct = Math.round((score / order.length) * 100);
    let reviewHtml = '';
    if (wrongLog.length) {
      reviewHtml = `
        <div class="review-heading">To review</div>
        ${wrongLog.map(w => `
          <div class="review-item">
            <div class="review-desc">${w.desc}</div>
            <div class="review-answers">Your answer: <span class="given">${w.given}</span> &middot; Correct: <span class="correct">${w.correct}</span> (${w.region})</div>
          </div>
        `).join('')}
      `;
    } else {
      reviewHtml = `<p class="clean-sweep">Clean sweep &mdash; nothing to review.</p>`;
    }

    // Leaderboard submit block — only shown if Supabase support is present on the page.
    const lbAvailable = typeof submitScore === 'function';
    const savedName = (function () {
      try { return localStorage.getItem('cepage_name') || ''; } catch (e) { return ''; }
    })();
    const lbHtml = lbAvailable ? `
      <div class="lb-submit" id="lb-submit">
        <div class="lb-submit-label">Post to the leaderboard</div>
        <div class="lb-submit-row">
          <input type="text" id="lb-name" class="lb-input" placeholder="Your name" maxlength="24" value="${savedName.replace(/"/g, '&quot;')}" autocomplete="off">
          <button class="next-btn" id="lb-submit-btn">Submit</button>
        </div>
        <div class="lb-submit-status" id="lb-status"></div>
      </div>
    ` : '';

    app.innerHTML = `
      <div class="results">
        <div class="results-label">Drill complete</div>
        <div class="results-score">${score} / ${order.length}</div>
        <div class="results-pct">${pct}% correct</div>
      </div>
      ${lbHtml}
      <div style="text-align:left;">${reviewHtml}</div>
      <div class="results-actions">
        <button class="start-btn" id="retry-btn">Drill again</button>
        <button class="btn-secondary" id="home-btn">Change mode</button>
      </div>
    `;

    document.getElementById('retry-btn').onclick = startDrill;
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

      const ok = await submitScore(name, score, order.length, mode, 'drill');
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
