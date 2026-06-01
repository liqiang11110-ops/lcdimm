(function () {
  const latestSummary = document.querySelector('#latestSummary');
  const reviewList = document.querySelector('#reviewList');
  const uploadForm = document.querySelector('#uploadForm');
  const refreshBtn = document.querySelector('#refreshBtn');
  const dataType = document.querySelector('#dataType');
  const dataFile = document.querySelector('#dataFile');
  const adminLogin = document.querySelector('#adminLogin');
  const adminShell = document.querySelector('#adminShell');
  const loginForm = document.querySelector('#loginForm');
  const adminPasswordInput = document.querySelector('#adminPassword');
  const loginError = document.querySelector('#loginError');
  const logoutBtn = document.querySelector('#logoutBtn');
  const cloudApiOrigin = 'https://d5-d2gzyrjkz1d3d265f-1437410927.ap-shanghai.app.tcloudbase.com';
  const apiOrigin = /^(127\.0\.0\.1|localhost)$/.test(location.hostname) ? '' : cloudApiOrigin;
  const passwordKey = 'ddr5_admin_password';
  let adminPassword = sessionStorage.getItem(passwordKey) || '';

  function safe(value) {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  function countCards(summary) {
    const counts = summary?.counts || {};
    const params = summary?.params || {};
    return `
      <div><span>板型</span><strong>${safe(counts.boards)}</strong></div>
      <div><span>BOM 报价行</span><strong>${safe(counts.bom)}</strong></div>
      <div><span>批次良率</span><strong>${safe(counts.batches)}</strong></div>
      <div><span>汇率</span><strong>${safe(params.usd_cny)}</strong></div>
      <div><span>加工费</span><strong>${safe(params.proc_fee_fixed)}</strong></div>
      <div><span>缺 BOM</span><strong>${safe(params.bom_placeholder)}</strong></div>
    `;
  }

  function warningHtml(warnings) {
    if (!warnings?.length) return '<p class="admin-ok">未发现明显问题。</p>';
    return `<ul>${warnings.map((item) => `<li>${safe(item)}</li>`).join('')}</ul>`;
  }

  function comparisonHtml(comparison) {
    const groups = comparison?.groups || {};
    const rows = Object.entries(groups).filter(([, item]) => item.added || item.removed || item.changed || item.before !== item.after);
    if (!rows.length) return '<p class="admin-ok">与当前正式数据无明显差异。</p>';
    return `
      <div class="admin-compare">
        ${rows.map(([name, item]) => `
          <div>
            <strong>${safe(name)}</strong>
            <span>${safe(item.before)} → ${safe(item.after)}</span>
            <em>新增 ${safe(item.added)} / 删除 ${safe(item.removed)} / 修改 ${safe(item.changed)}</em>
          </div>
        `).join('')}
      </div>
    `;
  }

  function decisionHtml(review) {
    const decision = review.decision || {};
    const status = decision.status || review.ai_review?.recommendation || '待系统核算';
    const reasons = decision.reasons || review.ai_review?.warnings || [];
    const className = status === '建议发布' ? 'admin-decision-ok' : status === '禁止发布' ? 'admin-decision-stop' : 'admin-decision-warn';
    return `
      <div class="admin-decision ${className}">
        <strong>系统把关：${safe(status)}</strong>
        <ul>${reasons.slice(0, 6).map((item) => `<li>${safe(item)}</li>`).join('')}</ul>
      </div>
    `;
  }

  async function fetchJson(url, options) {
    const requestOptions = { ...(options || {}) };
    const headers = new Headers(requestOptions.headers || {});
    if (adminPassword) headers.set('x-ddr5-admin-password', adminPassword);
    requestOptions.headers = headers;
    const response = await fetch(`${apiOrigin}${url}`, requestOptions);
    const data = await response.json();
    if (response.status === 401) {
      sessionStorage.removeItem(passwordKey);
      adminPassword = '';
      showLogin(data.error || '维护密码不正确');
    }
    if (!response.ok) throw new Error(data.error || response.statusText);
    return data;
  }

  function showLogin(message = '') {
    adminLogin.hidden = false;
    adminShell.classList.add('admin-locked');
    loginError.textContent = message;
    adminPasswordInput.focus();
  }

  function showApp() {
    adminLogin.hidden = true;
    adminShell.classList.remove('admin-locked');
    loginError.textContent = '';
  }

  async function loadLatest() {
    const data = await fetchJson('/api/production/decision-inputs/latest');
    latestSummary.innerHTML = `
      <div class="admin-count-grid">${countCards(data.summary)}</div>
      <p class="admin-note">来源：${data.source === 'approved_upload' ? '已发布上传数据' : '初始数据/默认参数'}</p>
      <div class="admin-warnings">${warningHtml(data.summary.warnings)}</div>
    `;
  }

  async function loadReviews() {
    const data = await fetchJson('/api/production/imports');
    reviewList.innerHTML = data.reviews.length ? data.reviews.map((review) => `
      <article class="admin-review">
        <div>
          <strong>${safe(review.filename)}</strong>
          <span>${safe(review.detected_type || review.data_type)} · ${safe(review.status)} · ${safe(review.created_at)}</span>
        </div>
        <div class="admin-count-grid">${countCards(review.summary)}</div>
        ${decisionHtml(review)}
        ${comparisonHtml(review.comparison)}
        <div class="admin-warnings">${warningHtml(review.ai_review?.warnings || review.summary?.warnings)}</div>
        <div class="admin-actions">
          <button type="button" data-ai="${review.upload_id}">系统核算</button>
          <button type="button" data-approve="${review.upload_id}">确认发布</button>
        </div>
      </article>
    `).join('') : '<p class="admin-note">暂无上传记录。</p>';
  }

  uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!dataFile.files[0]) return;
    const form = new FormData();
    form.append('file', dataFile.files[0]);
    await fetchJson(`/api/production/import?data_type=${encodeURIComponent(dataType.value)}`, {
      method: 'POST',
      body: form,
    });
    dataFile.value = '';
    await loadReviews();
  });

  reviewList.addEventListener('click', async (event) => {
    const aiId = event.target.dataset.ai;
    const approveId = event.target.dataset.approve;
    if (aiId) {
      await fetchJson(`/api/production/imports/${encodeURIComponent(aiId)}/ai-review`, { method: 'POST' });
      await loadReviews();
    }
    if (approveId) {
      await fetchJson(`/api/production/reviews/${encodeURIComponent(approveId)}/approve`, { method: 'POST' });
      await loadLatest();
      await loadReviews();
    }
  });

  refreshBtn.addEventListener('click', async () => {
    await loadLatest();
    await loadReviews();
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    adminPassword = adminPasswordInput.value.trim();
    if (!adminPassword) return;
    sessionStorage.setItem(passwordKey, adminPassword);
    try {
      await Promise.all([loadLatest(), loadReviews()]);
      showApp();
    } catch (error) {
      sessionStorage.removeItem(passwordKey);
      adminPassword = '';
      showLogin(error.message);
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(passwordKey);
    adminPassword = '';
    showLogin('');
  });

  if (adminPassword) {
    Promise.all([loadLatest(), loadReviews()]).then(showApp).catch((error) => {
      reviewList.innerHTML = `<p class="admin-error">${safe(error.message)}</p>`;
    });
  } else {
    showLogin('');
  }
})();
