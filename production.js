(function () {
  const state = {
    step: 'grain',
    boards: [],
    materials: [],
    quotes: [],
    selectedBoardCode: '',
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const els = {
    metricBoards: $('#metricBoards'),
    metricComplete: $('#metricComplete'),
    metricMaterials: $('#metricMaterials'),
    metricQuotes: $('#metricQuotes'),
    stepBadge: $('#stepBadge'),
    flowStatus: $('#flowStatus'),
    grainBrand: $('#grainBrand'),
    grainGrade: $('#grainGrade'),
    grainDensity: $('#grainDensity'),
    grainPrice: $('#grainPrice'),
    testQty: $('#testQty'),
    yieldRate: $('#yieldRate'),
    sortingCost: $('#sortingCost'),
    moduleType: $('#moduleType'),
    capacity: $('#capacity'),
    matchMode: $('#matchMode'),
    matchCount: $('#matchCount'),
    boardList: $('#decisionBoardList'),
    costStatus: $('#costStatus'),
    summaryBoard: $('#summaryBoard'),
    summaryModules: $('#summaryModules'),
    summaryUnitCost: $('#summaryUnitCost'),
    summaryTotalCost: $('#summaryTotalCost'),
    grainCostPerModule: $('#grainCostPerModule'),
    sortingCostPerModule: $('#sortingCostPerModule'),
    bomCostPerModule: $('#bomCostPerModule'),
    pcbDecision: $('#pcbDecision'),
  };

  const stepOrder = ['grain', 'board', 'cost'];

  function safe(value) {
    if (value === null || value === undefined || String(value).trim() === '') return '-';
    return String(value);
  }

  function money(value) {
    if (!Number.isFinite(value)) return '-';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
  }

  function number(value) {
    if (!Number.isFinite(value)) return '-';
    return Math.floor(value).toLocaleString('zh-CN');
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean))).sort();
  }

  function optionHtml(values, selected = '') {
    return values.map((value) => `<option value="${value}"${value === selected ? ' selected' : ''}>${value}</option>`).join('');
  }

  function grainCatalog() {
    return (window.GRAIN_SORTING_DATA?.grainCatalog || []).filter((row) => row.generation === 'DDR5');
  }

  function selectedGrain() {
    return {
      brand: els.grainBrand.value,
      grade: els.grainGrade.value,
      density: els.grainDensity.value,
      price: Number(els.grainPrice.value || 0),
      testQty: Number(els.testQty.value || 0),
      yieldRate: Number(els.yieldRate.value || 0) / 100,
      sortingCost: Number(els.sortingCost.value || 0),
    };
  }

  function dramOrgFromDensity(density) {
    if (String(density).includes('16')) return 'x16';
    if (String(density).includes('8')) return 'x8';
    return '';
  }

  function boardMaterials(boardCode) {
    return state.materials.filter((row) => row.board_code === boardCode);
  }

  function hasPcb(boardCode) {
    return boardMaterials(boardCode).some((row) => row.type_code === 'PCB');
  }

  function costRecordFor(board) {
    const records = window.DIMM_COST_DATA?.summaryRecords || [];
    return records.find((record) => {
      const sku = `${record.partNumber} ${record.sku} ${record.description} ${record.pcbPn}`.toLowerCase();
      return sku.includes(String(board.board_code).toLowerCase()) ||
        sku.includes(String(board.board_name).toLowerCase()) ||
        String(board.board_name).toLowerCase().includes(String(record.pcbPn || '').toLowerCase()) ||
        String(board.board_name).toLowerCase().includes(String(record.sku || '').split('：').pop().toLowerCase());
    }) || null;
  }

  function quoteFor(boardCode) {
    const rows = state.quotes.filter((row) => row.board_code === boardCode);
    return rows.find((row) => String(row.price_label).includes('PCBA')) || rows[0] || null;
  }

  function boardBomCostUsd(board) {
    const exchange = Number(window.DIMM_COST_DATA?.exchangeRate || 6.865);
    const costRecord = costRecordFor(board);
    if (costRecord?.bomCostRmb) return Number(costRecord.bomCostRmb) / exchange;
    const quote = quoteFor(board.board_code);
    if (quote?.price_value) return Number(quote.price_value) / exchange;
    return NaN;
  }

  function matchedBoards() {
    const grain = selectedGrain();
    const org = dramOrgFromDensity(grain.density);
    const type = els.moduleType.value;
    const capacity = Number(els.capacity.value);
    const strict = els.matchMode.value === 'strict';
    return state.boards.filter((board) => {
      if (!hasPcb(board.board_code)) return false;
      if (safe(board.form_factor_code) !== type) return false;
      if (Number(board.capacity_gb) !== capacity) return false;
      if (strict && org && safe(board.dram_organization).toLowerCase() !== org.toLowerCase()) return false;
      return true;
    });
  }

  function selectedBoard() {
    return state.boards.find((board) => board.board_code === state.selectedBoardCode) || matchedBoards()[0] || null;
  }

  function fillGrainSelects() {
    const catalog = grainCatalog();
    els.grainBrand.innerHTML = `<option value="">请选择</option>${optionHtml(unique(catalog.map((row) => row.brand)))}`;
    updateGrainGrades();
  }

  function updateGrainGrades() {
    const catalog = grainCatalog().filter((row) => !els.grainBrand.value || row.brand === els.grainBrand.value);
    els.grainGrade.innerHTML = `<option value="">请选择</option>${optionHtml(unique(catalog.map((row) => row.grade)))}`;
    updateGrainDensities();
  }

  function updateGrainDensities() {
    const catalog = grainCatalog().filter((row) => (
      (!els.grainBrand.value || row.brand === els.grainBrand.value) &&
      (!els.grainGrade.value || row.grade === els.grainGrade.value)
    ));
    els.grainDensity.innerHTML = `<option value="">请选择</option>${optionHtml(unique(catalog.map((row) => row.density)))}`;
  }

  function renderMetrics() {
    const complete = new Set(state.materials.filter((row) => row.type_code === 'PCB').map((row) => row.board_code)).size;
    els.metricBoards.textContent = state.boards.length || '-';
    els.metricComplete.textContent = complete || '-';
    els.metricMaterials.textContent = state.materials.length || '-';
    els.metricQuotes.textContent = state.quotes.length || '-';
  }

  function renderStep() {
    const index = stepOrder.indexOf(state.step) + 1;
    els.stepBadge.textContent = `步骤 ${index}/3`;
    els.flowStatus.textContent = state.step === 'cost' && selectedBoard() ? '已生成' : '待输入';
    $$('[data-decision-panel]').forEach((panel) => {
      panel.classList.toggle('decision-hidden', panel.dataset.decisionPanel !== state.step);
    });
    $$('.decision-step').forEach((button) => {
      button.classList.toggle('decision-step-active', button.dataset.step === state.step);
    });
    if (state.step === 'board') renderBoards();
    if (state.step === 'cost') renderCost();
  }

  function renderBoards() {
    const boards = matchedBoards();
    if (!boards.some((board) => board.board_code === state.selectedBoardCode)) {
      state.selectedBoardCode = boards[0]?.board_code || '';
    }
    els.matchCount.textContent = `${boards.length} 个`;
    els.boardList.innerHTML = boards.length ? boards.map((board) => {
      const selected = board.board_code === state.selectedBoardCode ? ' decision-board-active' : '';
      const bomUsd = boardBomCostUsd(board);
      return `
        <button class="decision-board${selected}" type="button" data-board="${board.board_code}">
          <span>${safe(board.board_code)}</span>
          <strong>${safe(board.board_name)}</strong>
          <small>${safe(board.form_factor_code)} / ${safe(board.capacity_gb)}GB / ${safe(board.rank)} / ${safe(board.dram_organization)}</small>
          <em>BOM ${money(bomUsd)} · 颗粒 ${safe(board.dram_count)} 颗</em>
        </button>
      `;
    }).join('') : '<div class="decision-empty">当前条件没有匹配板型，可切换匹配策略或调整容量。</div>';
  }

  function renderCost() {
    const board = selectedBoard();
    if (!board) {
      els.costStatus.textContent = '待选择板型';
      return;
    }
    const grain = selectedGrain();
    const dramCount = Number(board.dram_count || 0);
    const goodGrains = grain.testQty * grain.yieldRate;
    const moduleQty = dramCount > 0 ? Math.floor(goodGrains / dramCount) : 0;
    const grainCost = grain.yieldRate > 0 ? (grain.price * dramCount) / grain.yieldRate : NaN;
    const sortingCost = grain.yieldRate > 0 ? (grain.sortingCost * dramCount) / grain.yieldRate : NaN;
    const bomCost = boardBomCostUsd(board);
    const unitCost = grainCost + sortingCost + (Number.isFinite(bomCost) ? bomCost : 0);
    const totalCost = unitCost * moduleQty;
    els.costStatus.textContent = moduleQty > 0 ? '可生产' : '需补数据';
    els.summaryBoard.textContent = safe(board.board_code);
    els.summaryModules.textContent = `${number(moduleQty)} 条`;
    els.summaryUnitCost.textContent = money(unitCost);
    els.summaryTotalCost.textContent = money(totalCost);
    els.grainCostPerModule.textContent = money(grainCost);
    els.sortingCostPerModule.textContent = money(sortingCost);
    els.bomCostPerModule.textContent = money(bomCost);
    els.pcbDecision.textContent = hasPcb(board.board_code) ? 'PCB完整' : '缺PCB';
  }

  async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(path);
    return response.json();
  }

  async function loadData() {
    const isLocalApi = ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port === '8787';
    if (isLocalApi) {
      try {
        const [boards, materials, quotes] = await Promise.all([
          fetchJson('/api/boards'),
          fetchJson('/api/material-usage'),
          fetchJson('/api/price-quotes'),
        ]);
        state.boards = boards;
        state.materials = materials;
        state.quotes = quotes;
        return;
      } catch (error) {
        // Static fallback below.
      }
    }
    const data = await fetchJson('/database-data.json');
    state.boards = data.boards || [];
    state.materials = data.materials || [];
    state.quotes = data.quotes || [];
  }

  function bindEvents() {
    els.grainBrand.addEventListener('change', () => {
      updateGrainGrades();
      renderBoards();
    });
    els.grainGrade.addEventListener('change', () => {
      updateGrainDensities();
      renderBoards();
    });
    [els.grainDensity, els.grainPrice, els.testQty, els.yieldRate, els.sortingCost, els.moduleType, els.capacity, els.matchMode].forEach((el) => {
      el.addEventListener('input', () => {
        renderBoards();
        renderCost();
      });
      el.addEventListener('change', () => {
        renderBoards();
        renderCost();
      });
    });
    $$('.decision-step').forEach((button) => {
      button.addEventListener('click', () => {
        state.step = button.dataset.step;
        renderStep();
      });
    });
    $$('[data-next-step]').forEach((button) => {
      button.addEventListener('click', () => {
        state.step = button.dataset.nextStep;
        renderStep();
      });
    });
    els.boardList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-board]');
      if (!button) return;
      state.selectedBoardCode = button.dataset.board;
      renderBoards();
      renderCost();
    });
  }

  async function init() {
    fillGrainSelects();
    bindEvents();
    await loadData();
    renderMetrics();
    renderStep();
  }

  init().catch((error) => {
    els.boardList.innerHTML = `<div class="decision-empty">数据读取失败：${safe(error.message)}</div>`;
  });
})();
