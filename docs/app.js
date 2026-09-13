const formatDuration = (milliseconds) => milliseconds < 1000
  ? `${milliseconds}ms`
  : `${(milliseconds / 1000).toFixed(1)}s`;

function renderLayer(layer) {
  const rate = layer.total ? Math.round((layer.passed / layer.total) * 100) : 0;
  return `<div class="layer">
    <div class="layer-head"><b>${layer.name}</b><span>${layer.passed}/${layer.total} passed</span></div>
    <div class="bar" aria-label="${layer.name} ${rate}% passed"><span style="width:${rate}%"></span></div>
  </div>`;
}

function renderTest(test) {
  return `<div class="test-row" role="row">
    <span class="layer-badge">${test.suite}</span>
    <span>${test.title}</span>
    <span>${formatDuration(test.duration)}</span>
    <span class="status ${test.status}">${test.status}</span>
  </div>`;
}

async function loadDashboard() {
  const response = await fetch('data/latest.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Dashboard data unavailable');
  const data = await response.json();
  const state = document.querySelector('.run-state');
  state.dataset.status = data.status;
  document.getElementById('run-label').textContent = data.status === 'healthy' ? 'Latest run healthy' : 'Latest run needs attention';
  document.getElementById('pass-rate').textContent = `${data.summary.passRate}%`;
  document.getElementById('total-tests').textContent = data.summary.total;
  document.getElementById('passed-tests').textContent = data.summary.passed;
  document.getElementById('failed-tests').textContent = data.summary.failed;
  document.getElementById('duration').textContent = formatDuration(data.summary.duration);
  document.getElementById('layers').innerHTML = data.layers.map(renderLayer).join('');
  document.getElementById('test-results').innerHTML = data.tests.map(renderTest).join('');
}

loadDashboard().catch(() => {
  document.getElementById('run-label').textContent = 'Run data unavailable';
  document.querySelector('.run-state').dataset.status = 'attention';
});
