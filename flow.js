(function () {
  const LINKED_SELECTION_KEY = 'lcdimm-linked-selection';
  const titles = {
    grain: '颗粒测试',
    board: '板型匹配',
    cost: '成本核算',
  };
  const buttons = Array.from(document.querySelectorAll('[data-flow-target]'));
  const panels = Array.from(document.querySelectorAll('[data-flow-panel]'));
  const title = document.querySelector('#flowTitle');
  const grainFrame = document.querySelector('[data-grain-frame]');
  const costFrame = document.querySelector('[data-cost-frame]');
  const summary = {
    planName: document.querySelector('#planName'),
    planPath: document.querySelector('#planPath'),
    planStatus: document.querySelector('#planStatus'),
    grain: document.querySelector('#summaryGrain'),
    yield: document.querySelector('#summaryYield'),
    market: document.querySelector('#summaryMarket'),
    partNumber: document.querySelector('#summaryPartNumber'),
    sku: document.querySelector('#summarySku'),
    cost: document.querySelector('#summaryCost'),
    quantity: document.querySelector('#summaryQuantity'),
  };

  function readSelection() {
    try {
      return JSON.parse(localStorage.getItem(LINKED_SELECTION_KEY) || 'null');
    } catch (error) {
      localStorage.removeItem(LINKED_SELECTION_KEY);
      return null;
    }
  }

  function saveMessage(message) {
    const grain = message.grain || null;
    const hasGrain = Boolean(grain?.brand || grain?.grade || grain?.density || grain?.pn || grain?.grainPartNumber);
    if (message.type === 'sorting-module-selected' && !message.modulePartNumber && !hasGrain) {
      localStorage.removeItem(LINKED_SELECTION_KEY);
      renderSummary(null);
      return;
    }
    const previous = readSelection() || {};
    const next = {
      ...previous,
      source: message.type === 'sorting-module-selected' ? 'grain-test' : (previous.source || 'cost'),
      updatedAt: new Date().toISOString(),
      modulePartNumber: message.modulePartNumber || previous.modulePartNumber || '',
      grain: grain || previous.grain || null,
      sorting: message.sorting || previous.sorting || null,
    };
    localStorage.setItem(LINKED_SELECTION_KEY, JSON.stringify(next));
    renderSummary(next);
  }

  function sendSelectionToCost() {
    const selection = readSelection();
    if (!selection?.modulePartNumber) return;
    costFrame?.contentWindow?.postMessage({
      type: 'set-cost-context',
      modulePartNumber: selection.modulePartNumber,
      yieldRate: selection.sorting?.overallYield || null,
      quantity: selection.sorting?.totalGood || null,
    }, '*');
  }

  function fmt(value) {
    if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '-';
    return Number(value).toLocaleString('zh-CN');
  }

  function pct(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return `${(Number(value) * 100).toFixed(2)}%`;
  }

  function usd(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
  }

  function costRecord(partNumber) {
    return window.DIMM_COST_DATA?.summaryRecords?.find((record) => record.partNumber === partNumber) || null;
  }

  function estimateCost(selection) {
    const record = costRecord(selection?.modulePartNumber);
    const sorting = selection?.sorting;
    if (!record || !sorting?.overallYield) return null;
    const exchangeRate = Number(window.DIMM_COST_DATA?.exchangeRate || 1);
    const bomCostUsd = Number(record.bomCostRmb || 0) / exchangeRate;
    return Number(sorting.yieldedGrainCost || 0) +
      Number(sorting.yieldedTestCost || 0) +
      bomCostUsd;
  }

  function renderSummary(selection = readSelection()) {
    const grain = selection?.grain || {};
    const sorting = selection?.sorting || {};
    const record = costRecord(selection?.modulePartNumber);
    const market = [selection?.su || 'UDIMM', selection?.capacity || '16GB'].join(' / ');
    const grainText = [grain.brand, grain.grade, grain.density].filter(Boolean).join(' / ') || '-';
    const cost = estimateCost(selection);

    summary.grain.textContent = grainText;
    summary.yield.textContent = sorting.overallYield ? `综合良率 ${pct(sorting.overallYield)} / 可产颗粒 ${fmt(sorting.totalGood)}` : '选择颗粒后显示良率';
    summary.market.textContent = market;
    summary.partNumber.textContent = selection?.modulePartNumber || '-';
    summary.sku.textContent = record?.sku || selection?.boardName || '-';
    summary.cost.textContent = cost === null ? '-' : usd(cost);
    summary.quantity.textContent = sorting.moduleQuantity ? `可生产 ${fmt(sorting.moduleQuantity)} 条` : '-';

    if (selection?.modulePartNumber && sorting.overallYield) {
      summary.planName.textContent = `${selection.modulePartNumber} / ${record?.sku || selection.board || ''}`;
      summary.planPath.textContent = `${grainText} -> ${market} -> ${selection.board || record?.partNumber || '-'}`;
      summary.planStatus.textContent = '已生成';
    } else if (grainText !== '-') {
      summary.planName.textContent = '已选择颗粒，待选择产品和容量';
      summary.planPath.textContent = `${grainText} -> ${market}`;
      summary.planStatus.textContent = '待匹配';
    } else {
      summary.planName.textContent = '请选择颗粒测试数据';
      summary.planPath.textContent = '先选颗粒并输入成本，再选 S/U 和容量，系统生成半成品料号与成本。';
      summary.planStatus.textContent = '待选择';
    }
  }

  function showStep(step) {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.flowPanel !== step;
    });
    buttons.forEach((button) => {
      button.classList.toggle('nav-button-active', button.dataset.flowTarget === step);
    });
    if (title) title.textContent = titles[step] || titles.grain;
    if (step === 'board') window.applyLinkedSelectionFromStorage?.();
    if (step === 'cost') {
      window.applyLinkedSelectionFromStorage?.();
      sendSelectionToCost();
      window.setTimeout(sendSelectionToCost, 120);
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => showStep(button.dataset.flowTarget));
  });

  grainFrame?.addEventListener('load', () => {
    grainFrame.contentWindow?.postMessage({ type: 'request-sorting-selection' }, '*');
  });
  costFrame?.addEventListener('load', sendSelectionToCost);

  window.addEventListener('lcdimm-selection-updated', sendSelectionToCost);
  window.addEventListener('lcdimm-selection-updated', (event) => renderSummary(event.detail));
  window.addEventListener('message', (event) => {
    const message = event.data || {};
    if (message.type !== 'sorting-module-selected' && message.type !== 'cost-module-selected') return;
    saveMessage(message);
  });

  showStep('grain');
  renderSummary();
})();
