(function () {
  const state = {
    boards: [],
    materials: [],
    substitutes: [],
    quotes: [],
    standards: [],
    selectedBoard: '',
    filters: {
      scope: 'pcb-complete',
      search: '',
      formFactor: 'all',
      risk: 'all',
      materialType: 'all',
    },
  };

  const $ = (selector) => document.querySelector(selector);
  const els = {
    scope: $('#scopeFilter'),
    search: $('#dbSearch'),
    formFactor: $('#formFactorFilter'),
    risk: $('#riskFilter'),
    materialType: $('#materialTypeFilter'),
    statBoards: $('#statBoards'),
    statBoardsNote: $('#statBoardsNote'),
    statMaterials: $('#statMaterials'),
    statSubstitutes: $('#statSubstitutes'),
    statQuotes: $('#statQuotes'),
    statRisk: $('#statRisk'),
    boardCount: $('#boardCount'),
    boardList: $('#boardList'),
    selectedBoardName: $('#selectedBoardName'),
    selectedBoardCode: $('#selectedBoardCode'),
    selectedRisk: $('#selectedRisk'),
    boardMeta: $('#boardMeta'),
    pcbJudgeSummary: $('#pcbJudgeSummary'),
    pcbJudgeStatus: $('#pcbJudgeStatus'),
    pcbJudgeCards: $('#pcbJudgeCards'),
    pcbJudgeRows: $('#pcbJudgeRows'),
    materialRows: $('#materialRows'),
    materialCount: $('#materialCount'),
    substituteRows: $('#substituteRows'),
    substituteCount: $('#substituteCount'),
    quoteRows: $('#quoteRows'),
    quoteCount: $('#quoteCount'),
    standardRows: $('#standardRows'),
    standardCount: $('#standardCount'),
  };

  function safe(value) {
    if (value === null || value === undefined || String(value).trim() === '') return '待补充';
    return String(value);
  }

  function num(value, suffix = '') {
    if (value === null || value === undefined || value === '') return '待补充';
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return safe(value);
    return `${parsed.toLocaleString('zh-CN')}${suffix}`;
  }

  function money(row) {
    if (row.price_value === null || row.price_value === undefined || row.price_value === '') return '待补充';
    return `${Number(row.price_value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${safe(row.currency)}`;
  }

  function normalize(value) {
    return safe(value).toLowerCase();
  }

  function includesText(row, text, fields) {
    if (!text) return true;
    return fields.some((field) => normalize(row[field]).includes(text));
  }

  function riskTone(value) {
    const text = safe(value);
    if (text === '待补充') return 'blank';
    if (text.includes('高')) return text.includes('中高') ? 'high-mid' : 'high';
    if (text.includes('中')) return 'mid';
    if (text.includes('低')) return 'low';
    return 'blank';
  }

  function riskBadge(value) {
    const label = safe(value);
    return `<span class="db-badge db-badge-${riskTone(label)}">${label}</span>`;
  }

  function emptyRow(colspan, text) {
    return `<tr><td colspan="${colspan}" class="db-empty">${text}</td></tr>`;
  }

  function boardMaterials(boardCode) {
    return state.materials.filter((row) => row.board_code === boardCode);
  }

  function boardSubstitutes(boardCode) {
    return state.substitutes.filter((row) => row.board_code === boardCode);
  }

  function boardQuotes(boardCode) {
    return state.quotes.filter((row) => row.board_code === boardCode);
  }

  function boardPcbRows(boardCode) {
    return boardMaterials(boardCode).filter((row) => row.type_code === 'PCB');
  }

  function hasPcb(boardCode) {
    return boardPcbRows(boardCode).length > 0;
  }

  function firstMatch(text, patterns) {
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) return match[1] || match[0];
    }
    return '';
  }

  function parsePcbInfo(board, pcbRows) {
    const pcb = pcbRows[0] || null;
    const source = [board?.board_code, board?.board_name, pcb?.part_number, pcb?.material_description, pcb?.notes]
      .filter(Boolean)
      .join(' # ');
    const upper = source.toUpperCase();
    const layer = firstMatch(source, [
      /(?:^|[#\s])(\d{1,2})\s*L(?:YR|AYER)?\b/i,
      /(\d{1,2})\s*层/i,
    ]);
    const formFactor = upper.includes('SO-DIMM') || upper.includes('SODIMM') || upper.includes('D5SO')
      ? 'SODIMM'
      : (upper.includes('U-DIMM') || upper.includes('UDIMM') || upper.includes('D5U') ? 'UDIMM' : '');
    const rank = firstMatch(upper, [
      /(1R(?:X)?16)/,
      /(1R(?:X)?8)/,
      /(2R(?:X)?8)/,
      /(2R(?:X)?16)/,
    ]).replace('X', 'x');
    const boardMark = firstMatch(upper, [
      /(B85URCA|B85URCB|B85URCC|B85SRCC|BA5SRCA|BA5SRCB|BA5S812|BA5UH11|BA5UH12|BA5UR02)/,
      /(KO-\d+[A-Z]-\d)/,
    ]);
    const dimension = firstMatch(source, [
      /(\d+(?:\.\d+)?\s*[x*×]\s*\d+(?:\.\d+)?\s*mm)/i,
    ]);
    const finish = firstMatch(source, [
      /(沉金[^#;；,，]*)/,
      /(电金[^#;；,，]*)/,
    ]);
    const status = firstMatch(source, [
      /状态[:：]\s*([^;；#]+)/i,
    ]);
    const panel = firstMatch(source, [
      /(#?[^#;；]*(?:PCS\/Panel|pieces PCB per panel|pieces|per panel)[^#;；]*)/i,
    ]).replace(/^#/, '');
    return {
      pcb,
      source,
      partNumber: safe(pcb?.part_number),
      layer: layer ? `${layer}L` : '',
      formFactor,
      rank,
      boardMark,
      dimension,
      finish,
      status,
      panel,
    };
  }

  function compareValue(boardValue, pcbValue) {
    const left = safe(boardValue);
    const right = safe(pcbValue);
    if (right === '待补充') return { label: 'PCB未提供', tone: 'blank' };
    if (left === '待补充') return { label: '可由PCB补充', tone: 'mid' };
    if (String(left).toUpperCase() === String(right).toUpperCase()) return { label: '一致', tone: 'low' };
    return { label: '需复核', tone: 'high' };
  }

  function pcbConclusion(board, pcbInfo) {
    if (!pcbInfo.pcb) return { label: '缺PCB', tone: 'high', summary: '该板型没有 PCB 物料行，不能做 PCB 校验。' };
    const issues = [];
    if (compareValue(board.form_factor_code, pcbInfo.formFactor).tone === 'high') issues.push('S/U 与 PCB 参数不一致');
    if (pcbInfo.status && !pcbInfo.status.toLowerCase().includes('active')) issues.push(`PCB状态 ${pcbInfo.status}`);
    if (!pcbInfo.layer) issues.push('PCB层数缺失');
    if (Number(pcbInfo.pcb.quantity_per_module) !== 1) issues.push('PCB用量不是1');
    if (issues.length) return { label: '需复核', tone: 'high-mid', summary: issues.join('；') };
    return { label: '通过', tone: 'low', summary: 'PCB料号、S/U、层数和状态可用于当前板型判断。' };
  }

  function boardSearchHit(board, text) {
    if (!text) return true;
    const directHit = includesText(board, text, ['board_code', 'board_name', 'form_factor_code', 'rank', 'dram_organization', 'required_validation']);
    if (directHit) return true;
    const materialHit = boardMaterials(board.board_code).some((row) => (
      includesText(row, text, ['type_code', 'type_name', 'part_number', 'material_description', 'notes'])
    ));
    if (materialHit) return true;
    const substituteHit = boardSubstitutes(board.board_code).some((row) => (
      includesText(row, text, ['original_part_number', 'substitute_part_number', 'impact_summary', 'required_validation', 'notes'])
    ));
    if (substituteHit) return true;
    return boardQuotes(board.board_code).some((row) => (
      includesText(row, text, ['quote_source', 'supplier_name', 'price_label', 'source_note'])
    ));
  }

  function filteredBoards() {
    const text = state.filters.search.trim().toLowerCase();
    return state.boards.filter((board) => {
      const pcbComplete = hasPcb(board.board_code);
      if (state.filters.scope === 'pcb-complete' && !pcbComplete) return false;
      if (state.filters.scope === 'pcb-missing' && pcbComplete) return false;
      if (!boardSearchHit(board, text)) return false;
      if (state.filters.formFactor !== 'all' && safe(board.form_factor_code) !== state.filters.formFactor) return false;
      if (state.filters.risk === 'blank' && safe(board.risk_level) !== '待补充') return false;
      if (state.filters.risk !== 'all' && state.filters.risk !== 'blank' && safe(board.risk_level) !== state.filters.risk) return false;
      if (state.filters.materialType !== 'all') {
        return boardMaterials(board.board_code).some((row) => row.type_code === state.filters.materialType);
      }
      return true;
    });
  }

  function selectedBoard() {
    return state.boards.find((board) => board.board_code === state.selectedBoard) || null;
  }

  function unique(values) {
    return Array.from(new Set(values.filter((value) => value !== null && value !== undefined && String(value).trim() !== ''))).sort();
  }

  function fillOptions(select, values, labeler = (value) => value) {
    const first = select.querySelector('option[value="all"]')?.outerHTML || '<option value="all">全部</option>';
    select.innerHTML = first + values.map((value) => `<option value="${value}">${labeler(value)}</option>`).join('');
  }

  function renderFilters() {
    fillOptions(els.formFactor, unique(state.boards.map((board) => board.form_factor_code)));
    const materialTypes = unique(state.materials.map((row) => row.type_code));
    fillOptions(els.materialType, materialTypes, (code) => {
      const found = state.materials.find((row) => row.type_code === code);
      return `${safe(found?.type_name)} / ${code}`;
    });
  }

  function renderStats() {
    const pcbBoardCount = state.boards.filter((board) => hasPcb(board.board_code)).length;
    const highRiskItems = [
      ...state.boards.map((row) => row.risk_level),
      ...state.materials.map((row) => row.risk_level),
      ...state.substitutes.map((row) => row.risk_level),
    ].filter((value) => ['高', '中高'].includes(safe(value))).length;
    els.statBoards.textContent = num(pcbBoardCount);
    els.statBoardsNote.textContent = `PCB完整 ${pcbBoardCount} / 总板型 ${state.boards.length}`;
    els.statMaterials.textContent = num(state.materials.length);
    els.statSubstitutes.textContent = num(state.substitutes.length);
    els.statQuotes.textContent = num(state.quotes.length);
    els.statRisk.textContent = num(highRiskItems);
  }

  function renderBoardList() {
    const boards = filteredBoards();
    els.boardCount.textContent = `${boards.length} 个`;
    if (!boards.length) {
      els.boardList.innerHTML = '<div class="db-empty-block">当前条件没有匹配板型</div>';
      state.selectedBoard = '';
      return;
    }
    if (!boards.some((board) => board.board_code === state.selectedBoard)) {
      state.selectedBoard = boards[0].board_code;
    }
    els.boardList.innerHTML = boards.map((board) => {
      const active = board.board_code === state.selectedBoard ? ' db-board-item-active' : '';
      const subtitle = [
        safe(board.form_factor_code),
        board.capacity_gb ? `${board.capacity_gb}GB` : '容量待补充',
        safe(board.rank),
        safe(board.dram_organization),
      ].join(' / ');
      return `
        <button class="db-board-item${active}" type="button" data-board-code="${board.board_code}">
          <span>${safe(board.board_code)}</span>
          <strong>${safe(board.board_name)}</strong>
          <small>${subtitle}</small>
          ${riskBadge(board.risk_level)}
        </button>
      `;
    }).join('');
  }

  function renderBoardDetail() {
    const board = selectedBoard();
    if (!board) {
      els.selectedBoardName.textContent = '请选择板型';
      els.selectedBoardCode.textContent = '-';
      els.selectedRisk.className = 'db-badge db-badge-blank';
      els.selectedRisk.textContent = '待补充';
      els.boardMeta.innerHTML = '<div class="db-empty-block">没有选中板型</div>';
      return;
    }
    els.selectedBoardName.textContent = safe(board.board_name);
    els.selectedBoardCode.textContent = safe(board.board_code);
    els.selectedRisk.className = `db-badge db-badge-${riskTone(board.risk_level)}`;
    els.selectedRisk.textContent = safe(board.risk_level);
    const meta = [
      ['类型', safe(board.form_factor_code)],
      ['容量', board.capacity_gb ? `${board.capacity_gb}GB` : '待补充'],
      ['Rank', safe(board.rank)],
      ['颗粒组织', safe(board.dram_organization)],
      ['贴片颗粒', num(board.dram_count, ' 颗')],
      ['阻容数量', num(board.resistor_capacitor_count, ' 个')],
      ['焊点数', num(board.solder_joint_count, ' 点')],
      ['PCB复杂度', safe(board.pcb_complexity)],
      ['DRAM供应', safe(board.dram_supplier)],
      ['PMIC供应', safe(board.pmic_supplier)],
      ['SPD供应', safe(board.spd_hub_supplier)],
      ['CKD供应', safe(board.ckd_supplier)],
      ['验证要求', safe(board.required_validation)],
    ];
    els.boardMeta.innerHTML = meta.map(([label, value]) => `
      <div class="db-meta-item">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join('');
  }

  function renderPcbJudge() {
    const board = selectedBoard();
    if (!board) {
      els.pcbJudgeSummary.textContent = '没有选中板型';
      els.pcbJudgeStatus.className = 'db-badge db-badge-blank';
      els.pcbJudgeStatus.textContent = '待补充';
      els.pcbJudgeCards.innerHTML = '<div class="db-empty-block">没有选中板型</div>';
      els.pcbJudgeRows.innerHTML = emptyRow(4, '没有选中板型');
      return;
    }
    const info = parsePcbInfo(board, boardPcbRows(board.board_code));
    const conclusion = pcbConclusion(board, info);
    els.pcbJudgeSummary.textContent = conclusion.summary;
    els.pcbJudgeStatus.className = `db-badge db-badge-${conclusion.tone}`;
    els.pcbJudgeStatus.textContent = conclusion.label;
    const cards = [
      ['PCB料号', info.partNumber],
      ['PCB层数', info.layer || '待补充'],
      ['PCB判断S/U', info.formFactor || '待补充'],
      ['PCB板型标注', info.boardMark || '待补充'],
      ['PCB尺寸', info.dimension || '待补充'],
      ['表面处理', info.finish || '待补充'],
      ['拼板/Panel', info.panel || '待补充'],
      ['PCB状态', info.status || '待补充'],
    ];
    els.pcbJudgeCards.innerHTML = cards.map(([label, value]) => `
      <div class="db-meta-item">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join('');
    const checks = [
      ['S/U', safe(board.form_factor_code), info.formFactor || '待补充', compareValue(board.form_factor_code, info.formFactor)],
      ['Rank', safe(board.rank), info.rank || '待补充', compareValue(board.rank, info.rank)],
      ['板型标注', safe(board.board_name), info.boardMark || '待补充', info.boardMark && normalize(board.board_name).includes(info.boardMark.toLowerCase()) ? { label: '一致', tone: 'low' } : { label: info.boardMark ? '需复核' : 'PCB未提供', tone: info.boardMark ? 'high' : 'blank' }],
      ['PCB用量', '1 pcs', info.pcb ? `${num(info.pcb.quantity_per_module)} ${safe(info.pcb.unit)}` : '待补充', info.pcb && Number(info.pcb.quantity_per_module) === 1 ? { label: '一致', tone: 'low' } : { label: '需复核', tone: 'high' }],
      ['PCB状态', 'Active优先', info.status || '待补充', info.status ? (info.status.toLowerCase().includes('active') ? { label: '可用', tone: 'low' } : { label: '需复核', tone: 'high-mid' }) : { label: 'PCB未提供', tone: 'blank' }],
    ];
    els.pcbJudgeRows.innerHTML = checks.map(([item, boardValue, pcbValue, result]) => `
      <tr>
        <td><strong>${item}</strong></td>
        <td>${boardValue}</td>
        <td>${pcbValue}</td>
        <td>${riskBadge(result.label).replace('db-badge-blank', `db-badge-${result.tone}`)}</td>
      </tr>
    `).join('');
  }

  function renderMaterials() {
    const rows = boardMaterials(state.selectedBoard).filter((row) => (
      state.filters.materialType === 'all' || row.type_code === state.filters.materialType
    ));
    els.materialCount.textContent = `${rows.length} 条`;
    els.materialRows.innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td><strong>${safe(row.type_name)}</strong><small>${safe(row.type_code)}</small></td>
        <td>${safe(row.part_number)}</td>
        <td>${safe(row.material_description)}</td>
        <td>${num(row.quantity_per_module)} ${safe(row.unit)}</td>
        <td>${safe(row.function_area)}</td>
        <td>${safe(row.replaceability)}</td>
        <td>${riskBadge(row.risk_level)}</td>
        <td>${safe(row.validation_required)}</td>
      </tr>
    `).join('') : emptyRow(8, '该板型暂无 BOM 用料数据');
  }

  function renderSubstitutes() {
    const rows = boardSubstitutes(state.selectedBoard);
    els.substituteCount.textContent = `${rows.length} 条`;
    els.substituteRows.innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td><strong>${safe(row.type_name)}</strong><small>${safe(row.type_code)}</small></td>
        <td>${safe(row.original_part_number)}</td>
        <td>${safe(row.substitute_part_number)}</td>
        <td>${safe(row.quantity_relation)}</td>
        <td>${safe(row.impact_summary)}</td>
        <td>${safe(row.required_validation)}</td>
        <td>${safe(row.approval_status)}</td>
        <td>${riskBadge(row.risk_level)}</td>
      </tr>
    `).join('') : emptyRow(8, '该板型暂无替代料数据');
  }

  function renderQuotes() {
    const rows = boardQuotes(state.selectedBoard);
    els.quoteCount.textContent = `${rows.length} 条`;
    els.quoteRows.innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${safe(row.quote_source)}</td>
        <td>${safe(row.supplier_name)}</td>
        <td>${safe(row.price_label)}</td>
        <td><strong>${money(row)}</strong></td>
      </tr>
    `).join('') : emptyRow(4, '该板型暂无报价数据');
  }

  function standardRowsFor(board) {
    if (!board) return [];
    return state.standards.filter((row) => {
      if (safe(row.form_factor_code) !== safe(board.form_factor_code)) return false;
      const capacityOk = row.capacity_gb === null || row.capacity_gb === board.capacity_gb;
      const rankOk = !row.rank || !board.rank || row.rank === board.rank;
      const orgOk = !row.dram_organization || !board.dram_organization || row.dram_organization === board.dram_organization;
      return capacityOk && rankOk && orgOk;
    });
  }

  function renderStandards() {
    const board = selectedBoard();
    const rows = standardRowsFor(board);
    els.standardCount.textContent = `${rows.length} 条`;
    els.standardRows.innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${[row.form_factor_code, row.capacity_gb ? `${row.capacity_gb}GB` : '', row.rank, row.dram_organization].filter(Boolean).join(' / ')}</td>
        <td>${safe(row.type_name)}</td>
        <td><strong>${num(row.typical_quantity)} ${safe(row.unit)}</strong></td>
        <td>${safe(row.quantity_basis)}</td>
      </tr>
    `).join('') : emptyRow(4, '该板型规格不完整，暂无法匹配标准用量');
  }

  function renderAll() {
    renderStats();
    renderBoardList();
    renderBoardDetail();
    renderPcbJudge();
    renderMaterials();
    renderSubstitutes();
    renderQuotes();
    renderStandards();
  }

  function bindEvents() {
    els.scope.addEventListener('change', (event) => {
      state.filters.scope = event.target.value;
      renderAll();
    });
    els.search.addEventListener('input', (event) => {
      state.filters.search = event.target.value;
      renderAll();
    });
    els.formFactor.addEventListener('change', (event) => {
      state.filters.formFactor = event.target.value;
      renderAll();
    });
    els.risk.addEventListener('change', (event) => {
      state.filters.risk = event.target.value;
      renderAll();
    });
    els.materialType.addEventListener('change', (event) => {
      state.filters.materialType = event.target.value;
      renderAll();
    });
    els.boardList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-board-code]');
      if (!button) return;
      state.selectedBoard = button.dataset.boardCode;
      renderAll();
    });
  }

  async function load() {
    try {
      const [boards, materials, substitutes, quotes, standards] = await loadDatabaseData();
      state.boards = boards;
      state.materials = materials;
      state.substitutes = substitutes;
      state.quotes = quotes;
      state.standards = standards;
      state.selectedBoard = boards.find((board) => normalize(board.board_code).includes('b85urca'))?.board_code || boards[0]?.board_code || '';
      renderFilters();
      bindEvents();
      renderAll();
    } catch (error) {
      els.boardList.innerHTML = `<div class="db-empty-block">数据库读取失败：${safe(error.message)}</div>`;
    }
  }

  async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    return response.json();
  }

  async function loadDatabaseData() {
    const isLocalApi = ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port === '8787';
    if (!isLocalApi) {
      const staticData = await fetchJson('/database-data.json');
      return [
        staticData.boards || [],
        staticData.materials || [],
        staticData.substitutes || [],
        staticData.quotes || [],
        staticData.standards || [],
      ];
    }
    try {
      return await Promise.all([
        fetchJson('/api/boards'),
        fetchJson('/api/material-usage'),
        fetchJson('/api/substitutes'),
        fetchJson('/api/price-quotes'),
        fetchJson('/api/standard-usage'),
      ]);
    } catch (apiError) {
      const staticData = await fetchJson('/database-data.json');
      return [
        staticData.boards || [],
        staticData.materials || [],
        staticData.substitutes || [],
        staticData.quotes || [],
        staticData.standards || [],
      ];
    }
  }

  load();
})();
