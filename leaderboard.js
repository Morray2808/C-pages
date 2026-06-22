(function () {
  const content = document.getElementById('lb-content');

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function timeAgo(iso) {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    return hrs + 'h ago';
  }

  function renderRows(rows) {
    if (!rows.length) {
      content.innerHTML = `
        <div class="lb-empty">
          <i class="ti ti-glass" aria-hidden="true"></i>
          <p>No scores yet today. Be the first &mdash; head to the <a href="index.html">drill</a>.</p>
        </div>`;
      return;
    }

    const medals = ['lb-gold', 'lb-silver', 'lb-bronze'];
    content.innerHTML = `
      <ol class="lb-list">
        ${rows.map((r, i) => `
          <li class="lb-row ${i < 3 ? medals[i] : ''}">
            <span class="lb-rank">${i + 1}</span>
            <span class="lb-name">${escapeHtml(r.name)}</span>
            <span class="lb-meta">
              <span class="lb-mode">${r.mode === 'quick' ? 'Quick' : 'Full'}</span>
              <span class="lb-time">${timeAgo(r.created_at)}</span>
            </span>
            <span class="lb-score">${r.score}<span class="lb-total">/${r.total}</span></span>
          </li>
        `).join('')}
      </ol>`;
  }

  async function load() {
    const client = getSupabase();
    if (!client) {
      content.innerHTML = `
        <div class="lb-empty">
          <i class="ti ti-plug-connected-x" aria-hidden="true"></i>
          <p>Leaderboard isn't configured yet. Add your Supabase credentials in <code>supabase-config.js</code> (see README).</p>
        </div>`;
      return;
    }
    const rows = await fetchLeaderboard();
    if (rows === null) {
      content.innerHTML = `
        <div class="lb-empty">
          <i class="ti ti-alert-triangle" aria-hidden="true"></i>
          <p>Couldn't load the leaderboard. Check your connection and try again.</p>
          <button class="btn-secondary" id="lb-retry">Retry</button>
        </div>`;
      const retry = document.getElementById('lb-retry');
      if (retry) retry.onclick = load;
      return;
    }
    renderRows(rows);
  }

  load();
})();
