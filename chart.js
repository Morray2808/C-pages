(function () {

  function sweetnessToRadius(s) {
    return 7 + s * 3.2;
  }

  function buildDataset(items, isRed) {
    const families = [...new Set(items.map(i => i.fruitFamily))];
    return families.map(fam => ({
      label: FRUIT_FAMILY_LABELS[fam],
      data: items.filter(i => i.fruitFamily === fam).map(i => ({
        x: i.body, y: i.acidity, r: sweetnessToRadius(i.sweetness),
        grape: i.grape, sweetness: i.sweetness, tannin: i.tannin
      })),
      backgroundColor: FRUIT_FAMILY_COLORS[fam] + 'B3',
      borderColor: FRUIT_FAMILY_COLORS[fam],
      borderWidth: isRed
        ? items.filter(i => i.fruitFamily === fam).map(i => 1.5 + (i.tannin || 0) * 2.5)
        : 1.5
    }));
  }

  let chart;

  function render(mode) {
    const items = mode === 'whites' ? WHITES : REDS;
    const isRed = mode === 'reds';
    const datasets = buildDataset(items, isRed);

    document.getElementById('btn-whites').classList.toggle('active', mode === 'whites');
    document.getElementById('btn-reds').classList.toggle('active', mode === 'reds');
    document.getElementById('tannin-legend').style.display = isRed ? 'flex' : 'none';

    const legendEl = document.getElementById('legend');
    legendEl.innerHTML = datasets.map(ds => `
      <span class="legend-item">
        <span class="legend-dot" style="background:${ds.borderColor};"></span>
        ${ds.label}
      </span>
    `).join('');

    if (chart) chart.destroy();
    const ctx = document.getElementById('grapeChart');
    const gridColor = '#E8DFD2';
    const textColor = '#5B5048';

    chart = new Chart(ctx, {
      type: 'bubble',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 24 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1C1714',
            titleFont: { family: 'Source Serif 4', size: 14 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            callbacks: {
              label: (ctx) => {
                const d = ctx.raw;
                const lines = [
                  'Body: ' + (d.x > 0 ? '+' : '') + d.x.toFixed(1),
                  'Acidity: ' + (d.y > 0 ? '+' : '') + d.y.toFixed(1),
                  'Sweetness: ' + d.sweetness.toFixed(1) + ' / 5'
                ];
                if (d.tannin !== undefined) lines.push('Tannin: ' + d.tannin.toFixed(1) + ' / 2');
                return lines;
              },
              title: (items) => items[0].raw.grape
            }
          }
        },
        scales: {
          x: {
            min: -2, max: 2,
            title: { display: true, text: 'Body  (light \u2190     \u2192 full)', color: textColor, font: { family: 'Inter', size: 12 } },
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
          },
          y: {
            min: -2, max: 2,
            title: { display: true, text: 'Acidity  (low \u2190     \u2192 high)', color: textColor, font: { family: 'Inter', size: 12 } },
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
          }
        }
      }
    });
  }

  document.getElementById('btn-whites').onclick = () => render('whites');
  document.getElementById('btn-reds').onclick = () => render('reds');
  render('whites');
})();
