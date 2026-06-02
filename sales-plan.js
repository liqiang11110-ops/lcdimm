(function () {
  const nf0 = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
  const usd = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });

  function $(id) {
    return document.getElementById(id);
  }

  function text(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function money(value) {
    return '$' + usd.format(Number(value || 0));
  }

  function qty(value) {
    return nf0.format(Number(value || 0));
  }

  function rate(value) {
    return nf2.format(Number(value || 0) * 100) + '%';
  }

  function addFact(container, label, value, note) {
    const item = document.createElement('div');
    item.className = 'coverage-row';
    item.innerHTML = '<span></span><strong></strong><small></small>';
    item.querySelector('span').textContent = label;
    item.querySelector('strong').textContent = value;
    item.querySelector('small').textContent = note || '';
    container.appendChild(item);
  }

  function renderVolume(volume) {
    const h1 = volume.h1_total || {};
    const actual = volume.actual_1_5 || {};
    const june = (volume.monthly || []).find((row) => row.month === '2026-06') || {};

    text('kpiH1Qty', qty(h1.qty_by_pn));
    text('kpiActualQty', qty(actual.qty_by_pn));
    text('kpiActualRevenue', money(actual.revenue_usd));
    text('kpiJuneQty', qty(june.qty_by_pn));
    text('kpiJuneRevenue', money(june.revenue_usd));
    text('kpiStatus', '部分可用');
    text('salesCheck', volume.checks && volume.checks.qty_match ? '数量对上' : '需复核');
    text('salesSource', `${volume.source_sheet || '业绩情况'} · ${volume.source_mtime || ''} · ${volume.basis || ''}`);

    const rows = $('salesVolumeRows');
    rows.innerHTML = '';
    (volume.monthly || []).forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.month || '-'}</td>
        <td>${row.scope || '-'}</td>
        <td>${money(row.revenue_usd)}</td>
        <td>${money(row.gross_margin_usd)}</td>
        <td>${qty(row.qty_by_pn)}</td>
        <td>${nf2.format(Number(row.qty_by_host || 0))}</td>
        <td>${rate(row.gross_margin_rate)}</td>
        <td><span class="sales-badge ${row.status === 'plan' ? 'sales-badge-plan' : ''}">${row.status || '-'}</span></td>
      `;
      rows.appendChild(tr);
    });
  }

  function renderCoverage(data) {
    const coverage = $('coverageRows');
    coverage.innerHTML = '';
    (data.coverage || []).forEach((row) => {
      const label = row.module || '-';
      const status = row.status === 'available' ? '可用' : row.status === 'partial' ? '部分可用' : '缺失';
      addFact(coverage, label, status, row.evidence || '');
    });

    const lcdimm = $('lcdimmRows');
    lcdimm.innerHTML = '';
    const finished = data.lcdimm && data.lcdimm.finished_goods_summary;
    const particle = data.lcdimm && data.lcdimm.particle_ddr5_total;
    if (particle) addFact(lcdimm, 'DDR5 颗粒余量', `${nf2.format(particle.remaining_k)}K`, `${money(particle.amount_usd)} 余量金额`);
    if (finished) {
      addFact(lcdimm, '成品库存', `${qty(finished.qty)} 条`, `${nf2.format(finished.avg_cost_rmb)} RMB/条均值`);
      addFact(lcdimm, '库存金额', `${nf2.format(finished.amount_rmb)} RMB`, `${finished.rows || 0} 行来源`);
    }

    const lexar = $('lexarRows');
    lexar.innerHTML = '';
    const balance = data.lexar && data.lexar.fg_balance_total;
    const overage = data.lexar && data.lexar.overage_by_age;
    const quotes = data.lexar && data.lexar.d5_cost_quotes;
    if (balance) addFact(lexar, '库存结余', `${qty(balance.balance_qty)} 条`, `需求 ${qty(balance.demand_qty)} 条`);
    if (overage) addFact(lexar, '超期库存金额', `${nf2.format(Object.values(overage).reduce((sum, row) => sum + Number(row.amount_rmb || 0), 0))} RMB`, '2025 来源，需刷新');
    if (quotes) addFact(lexar, 'D5 成本报价', `${quotes.length || 0} 条`, '美元报价表');
  }

  function renderActions(data) {
    const target = $('salesActions');
    target.innerHTML = '';
    const volume = data.sales_volume || {};
    const actions = [
      {
        title: '补 SKU / 区域明细',
        body: '当前只有 H1 汇总，可做经营趋势；要做销售区域和客户策略，需要上传半年已出货明细。',
      },
      {
        title: '把 plan 和 actual 分开',
        body: '6月预计只能进入预测，不能混入实际销量；已接单未出货只进入订单池。',
      },
      {
        title: '接入成交价流水',
        body: '现有销售额能推均价，但无法判断渠道价格压力；后续上传客户、区域、SKU、单价。',
      },
      {
        title: '联动成本和良率',
        body: '销售建议需要同时看生产成本、良率批次和可用库存，低良率或低于成本的 SKU 不建议放量。',
      },
    ];
    if (volume.checks && volume.checks.qty_match) {
      const june = (volume.monthly || []).find((row) => row.month === '2026-06') || {};
      actions.unshift({ title: 'H1 数量校验通过', body: `1-5月实际 ${qty(volume.actual_1_5.qty_by_pn)} + 6月预计 ${qty(june.qty_by_pn)} = H1 ${qty(volume.h1_total.qty_by_pn)}。` });
    }
    actions.forEach((action) => {
      const item = document.createElement('div');
      item.className = 'sales-action';
      item.innerHTML = '<strong></strong><p></p>';
      item.querySelector('strong').textContent = action.title;
      item.querySelector('p').textContent = action.body;
      target.appendChild(item);
    });
  }

  async function init() {
    try {
      const response = await fetch('/sales-plan-data.json?v=202606021645');
      const data = await response.json();
      if (data.sales_volume) renderVolume(data.sales_volume);
      renderCoverage(data);
      renderActions(data);
    } catch (error) {
      text('kpiStatus', '读取失败');
      text('salesCheck', '数据失败');
      const rows = $('salesVolumeRows');
      if (rows) rows.innerHTML = `<tr><td colspan="8">销售计划数据读取失败：${error.message}</td></tr>`;
    }
  }

  init();
})();
