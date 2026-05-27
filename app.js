const state = {
  filters: {
    su: 'UDIMM',
    capacity: '16GB',
    factory: '镁光',
    grade: 'PG',
    dramSpec: '2G8',
  },
  selectedBoardCode: '',
};

const factoryRules = {
  镁光: {
    grades: ['PG', 'PR', 'TP'],
    specs: ['1G8', '1G16', '2G8', '3G8', '4G8'],
  },
  三星: {
    grades: ['P', 'E'],
    specs: ['2G8'],
  },
  长鑫: {
    grades: ['UTT', 'eTT'],
    specs: ['2G8'],
  },
  海力士: {
    grades: ['M', 'A'],
    specs: ['2G8', '3G8', '4G8'],
  },
};

const specsByCapacity = {
  '8GB': ['1G8', '1G16'],
  '16GB': ['1G8', '2G8'],
  '24GB': ['3G8'],
  '32GB': ['2G8', '4G8'],
  '48GB': ['3G8'],
  '64GB': ['4G8'],
};

const capacityBySpecAndCount = {
  '1G16-4': '8GB',
  '1G8-8': '8GB',
  '2G8-8': '16GB',
  '3G8-8': '24GB',
  '4G8-8': '32GB',
  '1G8-16': '16GB',
  '2G8-16': '32GB',
  '3G8-16': '48GB',
  '4G8-16': '64GB',
};

const boardRuleSource = [
  { vendor: '欣强', code: 'DDR5_UDIMM_BP_B85URCC_1Rx16', board: 'B85URCC', su: 'UDIMM', rank: '1Rx16', count: 4, specs: ['1G16'], name: 'DDR5 UDIMM 欣强 1Rx16(贴4颗) B85URCC' },
  { vendor: '欣强', code: 'DDR5_UDIMM_BP_B85URCA_1Rx8', board: 'B85URCA', su: 'UDIMM', rank: '1Rx8', count: 8, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 UDIMM 欣强 1Rx8(贴8颗) B85URCA' },
  { vendor: '欣强', code: 'DDR5_UDIMM_BP_BA5UH11_1Rx8', board: 'BA5UH11', su: 'UDIMM', rank: '1Rx8', count: 8, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 UDIMM 欣强 1Rx8(贴8颗) BA5UH11' },
  { vendor: '欣强', code: 'DDR5_UDIMM_BP_B85URCB_2Rx8', board: 'B85URCB', su: 'UDIMM', rank: '2Rx8', count: 16, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 UDIMM 欣强 2Rx8(贴16颗) B85URCB' },
  { vendor: '欣强', code: 'DDR5_UDIMM_BP_BA5UH12_2Rx8', board: 'BA5UH12', su: 'UDIMM', rank: '2Rx8', count: 16, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 UDIMM 欣强 2Rx8(贴16颗) BA5UH12' },
  { vendor: '欣强', code: 'DDR5_SODIMM_BP_B85SRCC_1Rx16', board: 'B85SRCC', su: 'SODIMM', rank: '1Rx16', count: 4, specs: ['1G16'], name: 'DDR5 SODIMM 欣强 1Rx16(贴4颗) B85SRCC' },
  { vendor: '欣强', code: 'DDR5_SODIMM_BP_BA5SRCA_1Rx8', board: 'BA5SRCA', su: 'SODIMM', rank: '1Rx8', count: 8, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 SODIMM 欣强 1Rx8(贴8颗) BA5SRCA' },
  { vendor: '自研', code: 'DDR5_SODIMM_ZY_1Rx8-10Lyr_A', board: 'ZY-1Rx8-10Lyr', su: 'SODIMM', rank: '1Rx8', count: 8, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 SODIMM 自研PCB 10层 1Rx8(贴8颗)' },
  { vendor: '欣强', code: 'DDR5_SODIMM_BP_BA5SRCB_2Rx8', board: 'BA5SRCB', su: 'SODIMM', rank: '2Rx8', count: 16, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 SODIMM 欣强 2Rx8(贴16颗) BA5SRCB' },
  { vendor: '欣强', code: 'DDR5_RGB_UDIMM_BP_BA5UR02_1Rx8', board: 'BA5UR02', su: 'UDIMM', rank: '1Rx8', count: 8, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 RGB UDIMM 欣强 1Rx8(贴8颗) BA5UR02' },
  { vendor: '先进(KO)', code: 'DDR5_UDIMM_KO-8824A-5_1Rx8_8Layer', board: 'KO-8824A-5', su: 'UDIMM', rank: '1Rx8', count: 8, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 UDIMM KO 8层 1Rx8(贴8颗) KO-8824A-5' },
  { vendor: '先进(KO)', code: 'DDR5_UDIMM_KO-10290A-5_1Rx8_10Layer', board: 'KO-10290A-5', su: 'UDIMM', rank: '1Rx8', count: 8, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 UDIMM KO 10层 1Rx8(贴8颗) KO-10290A-5' },
  { vendor: '先进(KO)', code: 'DDR5_RGB_UDIMM_KO-10310A-5_1Rx8_10Layer', board: 'KO-10310A-5', su: 'UDIMM', rank: '1Rx8', count: 8, specs: ['1G8', '2G8', '3G8', '4G8'], name: 'DDR5 RGB UDIMM KO 10层 1Rx8(贴8颗) KO-10310A-5' },
  { vendor: '先进(KO)', code: 'DDR5_RGB_UDIMM_KO-8861A-5_1Rx16_8Layer', board: 'KO-8861A-5', su: 'UDIMM', rank: '1Rx16', count: 4, specs: ['1G16'], name: 'DDR5 RGB UDIMM KO 8层 1Rx16(贴4颗) KO-8861A-5' },
];

function el(id) {
  return document.getElementById(id);
}

function boardRuleRows() {
  return boardRuleSource.flatMap((rule) =>
    rule.specs.map((spec) => ({
      ...rule,
      spec,
      capacity: capacityBySpecAndCount[`${spec}-${rule.count}`] || '待确认',
    })),
  );
}

function setSelectOptions(select, options, value) {
  if (!options.length) {
    select.innerHTML = '<option value="__NONE__">无可用规格</option>';
    select.value = '__NONE__';
    select.disabled = true;
    return '__NONE__';
  }
  select.disabled = false;
  select.innerHTML = options.map((option) => `<option>${option}</option>`).join('');
  select.value = options.includes(value) ? value : options[0];
  return select.value;
}

function syncFilterControls() {
  el('filterSu').value = state.filters.su;
  el('filterCapacity').value = state.filters.capacity;
  el('filterFactory').value = state.filters.factory;

  const rules = factoryRules[state.filters.factory] || factoryRules['镁光'];
  const capacitySpecs = specsByCapacity[state.filters.capacity] || [];
  const allowedSpecs = rules.specs.filter((spec) => capacitySpecs.includes(spec));

  state.filters.grade = setSelectOptions(el('filterGrade'), rules.grades, state.filters.grade);
  state.filters.dramSpec = setSelectOptions(el('filterDramSpec'), allowedSpecs, state.filters.dramSpec);
}

function displayDramSpec() {
  return state.filters.dramSpec === '__NONE__' ? '无可用规格' : state.filters.dramSpec;
}

function filteredRows() {
  if (state.filters.dramSpec === '__NONE__') return [];
  return boardRuleRows().filter((row) =>
    row.su === state.filters.su &&
    row.capacity === state.filters.capacity &&
    row.spec === state.filters.dramSpec,
  );
}

function materialCell(content, note) {
  if (!content) return '<div class="empty-slot">未录入</div>';
  return `<div class="part-slot"><strong>${content}</strong><span>${note || ''}</span></div>`;
}

function boardTags(row) {
  const tags = [];
  tags.push(row.vendor === '先进(KO)' ? 'KO板' : '欣强板');
  tags.push(row.name.includes('RGB') ? 'RGB' : '普通');
  if (row.code.includes('8Layer')) tags.push('8层');
  if (row.code.includes('10Layer')) tags.push('10层');
  tags.push(row.rank);
  tags.push(`贴${row.count}颗`);
  return tags;
}

function tagHtml(row) {
  return boardTags(row).map((tag) => `<span class="board-tag">${tag}</span>`).join('');
}

const bomByBoard = {
  B85URCC: {
    pcb: { part: 'PCM0002A3338', note: 'B85URCC 1.00 / 8L' },
    pmic: { part: 'ECM0005A0409', note: 'GD30MP1021GUTR-I / 1 pcs' },
    spd: { part: 'ECM0021A0043', note: 'GD30PD5118WETR-I / 1 pcs' },
    inductors: [
      { part: 'ECM0003A0087', note: '0.68uH / 2 pcs' },
      { part: 'ECM0003A0088', note: '1.5uH / 1 pcs' },
    ],
    resistors: [
      { label: '电阻 1', part: 'REP0331B0001', note: '33R / 4 pcs' },
      { label: '电阻 2', part: 'ECM0002A0484', note: '47R / 1 pcs' },
      { label: '电阻 3', part: 'REP0241A0001', note: '240R / 4 pcs' },
      { label: '电阻 4', part: 'ECM0002A0041', note: '39R / 2 pcs' },
    ],
    capacitors: [
      { label: '电容 1', part: 'CAP1007A0001', note: '0.1uF / 9 pcs' },
      { label: '电容 2', part: 'CAP0224C0004', note: '22uF / 6 pcs' },
      { label: '电容 3', part: 'ECM0001A0271', note: '47uF / 6 pcs' },
      { label: '电容 4', part: 'ECM0001A0040', note: '4.7uF / 63 pcs' },
      { label: '电容 5', part: 'CAP0013A0005', note: '1uF / 2 pcs' },
    ],
  },
  B85URCA: {
    pcb: { part: 'PCM0002A3350', note: 'B85URCA 1.00 / 8L' },
    pmic: { part: 'ECM0005A0409', note: 'GD30MP1021GUTR-I / 1 pcs' },
    spd: { part: 'ECM0021A0043', note: 'GD30PD5118WETR-I / 1 pcs' },
    inductors: [
      { part: 'ECM0003A0087', note: '0.68uH / 2 pcs' },
      { part: 'ECM0003A0088', note: '1.5uH / 1 pcs' },
    ],
    resistors: [
      { label: '电阻 1', part: 'REP0331B0001', note: '33R / 4 pcs' },
      { label: '电阻 2', part: 'ECM0002A0041', note: '39R / 2 pcs' },
      { label: '电阻 3', part: 'ECM0002A0056', note: '47R / 1 pcs' },
      { label: '电阻 4', part: 'REP0241B0001', note: '240R / 8 pcs' },
    ],
    capacitors: [
      { label: '电容 1', part: 'CAP1007A0001', note: '0.1uF / 9 pcs' },
      { label: '电容 2', part: 'CAP0013A0005', note: '1uF / 2 pcs' },
      { label: '电容 3', part: 'CAP0226B0010', note: '2.2uF / 16 pcs' },
      { label: '电容 4', part: 'ECM0001A0040', note: '4.7uF / 40 pcs' },
      { label: '电容 5', part: 'CAP0224C0004', note: '22uF / 8 pcs' },
      { label: '电容 6', part: 'ECM0001A0271', note: '47uF / 6 pcs' },
    ],
  },
  BA5SRCA: {
    pcb: { part: 'PCM0002A3351', note: 'BA5SRCA 1.00 / 10L' },
    pmic: { part: 'ECM0005A0409', note: 'GD30MP1021GUTR-I / 1 pcs' },
    spd: { part: 'ECM0021A0043', note: 'GD30PD5118WETR-I / 1 pcs' },
    inductors: [
      { part: 'ECM0003A0087', note: '0.68uH / 2 pcs' },
      { part: 'ECM0003A0088', note: '1.5uH / 1 pcs' },
    ],
    resistors: [
      { label: '电阻 1', part: 'REP0331B0001', note: '33R / 4 pcs' },
      { label: '电阻 2', part: 'ECM0002A0041', note: '39R / 2 pcs' },
      { label: '电阻 3', part: 'ECM0002A0056', note: '47R / 1 pcs' },
      { label: '电阻 4', part: 'REP0241B0001', note: '240R / 8 pcs' },
    ],
    capacitors: [
      { label: '电容 1', part: 'CAP1007A0001', note: '0.1uF / 9 pcs' },
      { label: '电容 2', part: 'ECM0001A0222', note: '1uF / 2 pcs' },
      { label: '电容 3', part: 'CAP0226B0010', note: '2.2uF / 16 pcs' },
      { label: '电容 4', part: 'ECM0001A0040', note: '4.7uF / 40 pcs' },
      { label: '电容 5', part: 'CAP0224C0004', note: '22uF / 6 pcs' },
      { label: '电容 6', part: 'ECM0001A0271', note: '47uF / 6 pcs' },
    ],
  },
  B85SRCC: {
    pcb: { part: 'PCM0002A3343', note: 'B85SRCC 1.00 / 8L' },
    pmic: { part: 'ECM0005A0409', note: 'GD30MP1021GUTR-I / 1 pcs' },
    spd: { part: 'ECM0021A0043', note: 'GD30PD5118WETR-I / 1 pcs' },
    inductors: [
      { part: 'ECM0003A0087', note: '0.68uH / 2 pcs' },
      { part: 'ECM0003A0088', note: '1.5uH / 1 pcs' },
    ],
    resistors: [
      { label: '电阻 1', part: 'REP0331A0001', note: '33R / 4 pcs' },
      { label: '电阻 2', part: 'ECM0002A2976', note: '39R / 2 pcs' },
      { label: '电阻 3', part: 'ECM0002A0484', note: '47R / 1 pcs' },
      { label: '电阻 4', part: 'REP0241A0001', note: '240R / 4 pcs' },
    ],
    capacitors: [
      { label: '电容 1', part: 'CAP1007A0001', note: '0.1uF / 9 pcs' },
      { label: '电容 2', part: 'ECM0001A0222', note: '1uF / 2 pcs' },
      { label: '电容 3', part: 'ECM0001A0040', note: '4.7uF / 36 pcs' },
      { label: '电容 4', part: 'CAP1007B0001', note: '10uF / 12 pcs' },
      { label: '电容 5', part: 'CAP0224C0004', note: '22uF / 6 pcs' },
      { label: '电容 6', part: 'ECM0001A0271', note: '47uF / 6 pcs' },
    ],
  },
  BA5UH11: {
    pcb: { part: 'PCM0002A3349', note: 'BA5UH11 / 10L' },
    pmic: { part: 'ECM0005A0409', note: 'GD30MP1021GUTR-I / 1 pcs' },
    spd: { part: 'ECM0021A0043', note: 'GD30PD5118WETR-I / 1 pcs' },
    inductors: [
      { part: 'ECM0003A0087', note: '0.68uH / 2 pcs' },
      { part: 'ECM0003A0088', note: '1.5uH / 1 pcs' },
    ],
    resistors: [
      { label: '电阻 1', part: 'REP0331B0001', note: '33R / 4 pcs' },
      { label: '电阻 2', part: 'ECM0002A0041', note: '39R / 2 pcs' },
      { label: '电阻 3', part: 'ECM0002A0056', note: '47R / 1 pcs' },
      { label: '电阻 4', part: 'REP0241B0001', note: '240R / 8 pcs' },
    ],
    capacitors: [
      { label: '电容 1', part: 'CAP1007A0001', note: '0.1uF / 9 pcs' },
      { label: '电容 2', part: 'CAP0013A0005', note: '1uF / 2 pcs' },
      { label: '电容 3', part: 'CAP0016B0001', note: '1uF / 20 pcs' },
      { label: '电容 4', part: 'CAP0226B0010', note: '2.2uF / 16 pcs' },
      { label: '电容 5', part: 'ECM0001A0040', note: '4.7uF / 40 pcs' },
      { label: '电容 6', part: 'CAP0224C0004', note: '22uF / 12 pcs' },
      { label: '电容 7', part: 'ECM0001A0271', note: '47uF / 6 pcs' },
    ],
  },
  'ZY-1Rx8-10Lyr': {
    pcb: { part: 'PCM0002A3255', note: '自研PCB / 10L' },
    pmic: { part: 'ECM0005A0409', note: 'GD30MP1021GUTR-I / 1 pcs' },
    spd: { part: 'ECM0021A0043', note: 'GD30PD5118WETR-I / 1 pcs' },
    inductors: [
      { part: 'ECM0003A0087', note: '0.68uH / 2 pcs' },
      { part: 'ECM0003A0088', note: '1.5uH / 1 pcs' },
    ],
    resistors: [
      { label: '电阻 1', part: 'REP0241B0001', note: '240R / 8 pcs' },
      { label: '电阻 2', part: 'ECM0002A0056', note: '47R / 1 pcs' },
      { label: '电阻 3', part: 'REP0331B0001', note: '33R / 4 pcs' },
      { label: '电阻 4', part: 'ECM0002A0041', note: '39R / 2 pcs' },
    ],
    capacitors: [
      { label: '电容 1', part: 'CAP1007A0001', note: '0.1uF / 9 pcs' },
      { label: '电容 2', part: 'CAP0476B0001', note: '4.7uF / 38 pcs' },
      { label: '电容 3', part: 'CAP0013A0005', note: '1uF / 2 pcs' },
      { label: '电容 4', part: 'CAP0015B0001', note: '0.1uF / 20 pcs' },
      { label: '电容 5', part: 'CAP0226C0011', note: '22uF / 6 pcs' },
      { label: '电容 6', part: 'ECM0001A0271', note: '47uF / 3 pcs' },
      { label: '电容 7', part: 'CAP0224C0004', note: '22uF / 6 pcs' },
      { label: '电容 8', part: 'ECM0001A0040', note: '4.7uF / 1 pcs' },
      { label: '电容 9', part: 'CAP0226B0010', note: '2.2uF / 16 pcs' },
      { label: '电容 10', part: 'CAP0476C0001', note: '4.7uF / 1 pcs' },
    ],
  },
};

function renderMatrix(row) {
  if (!row) {
    el('materialMatrixRows').innerHTML = '<tr><td colspan="6">没有匹配板型。</td></tr>';
    el('rcSpecGrid').innerHTML = renderRcCells();
    el('selectedPartCount').textContent = '已选 0 个料号。';
    return;
  }

  const empty = '<div class="empty-slot">未录入</div>';
  const bom = bomByBoard[row.board];
  const inductorText = bom?.inductors?.map((item) => `${item.part} ${item.note}`).join('；');
  el('materialMatrixRows').innerHTML = `
    <tr>
      <td><strong>${row.code}</strong><br><span>${row.name}</span></td>
      <td>${materialCell(row.spec, `${row.count} pcs / ${row.rank}`)}</td>
      <td>${bom ? materialCell(bom.pcb.part, bom.pcb.note) : materialCell(row.board, row.vendor)}</td>
      <td>${bom ? materialCell(bom.pmic.part, bom.pmic.note) : empty}</td>
      <td>${bom ? materialCell(bom.spd.part, bom.spd.note) : empty}</td>
      <td>${bom ? materialCell('电感', inductorText) : empty}</td>
    </tr>
  `;
  el('rcSpecGrid').innerHTML = renderRcCells(bom);
  el('selectedPartCount').textContent = `已带出 ${row.spec} / ${row.count} 颗 / ${row.board}。`;
}

function renderRcCells(bom = null) {
  const resistorItems = bom?.resistors || ['电阻 1', '电阻 2', '电阻 3', '电阻 4'].map((label) => ({ label }));
  const capacitorItems = bom?.capacitors || ['电容 1', '电容 2', '电容 3', '电容 4', '电容 5', '电容 6'].map((label) => ({ label }));
  const cells = (items) => items
    .map((item) => `
      <div class="rc-cell">
        <h3>${item.label}</h3>
        ${item.part ? materialCell(item.part, item.note) : '<div class="empty-slot">待录入规格</div>'}
      </div>
    `)
    .join('');
  return `
    <div class="rc-line rc-line-resistor">${cells(resistorItems)}</div>
    <div class="rc-line rc-line-capacitor">${cells(capacitorItems)}</div>
  `;
}

function render() {
  syncFilterControls();
  const rows = filteredRows();
  if (!rows.some((row) => row.code === state.selectedBoardCode)) {
    state.selectedBoardCode = rows[0]?.code || '';
  }
  const selectedRow = rows.find((row) => row.code === state.selectedBoardCode) || rows[0];

  el('matchPath').textContent = [
    state.filters.su,
    state.filters.capacity,
    state.filters.factory,
    state.filters.grade,
    displayDramSpec(),
  ].join(' / ');
  el('matchCount').textContent = `${rows.length} 个`;

  el('matchedBoardRows').innerHTML = rows.length
    ? rows.map((row, index) => `
        <tr class="selectable ${row.code === state.selectedBoardCode ? 'selected' : ''}" data-board-code="${row.code}">
          <td>${String(index + 1).padStart(2, '0')}</td>
          <td>${row.su}</td>
          <td>${row.capacity}</td>
          <td>${state.filters.factory}</td>
          <td>${state.filters.grade}</td>
          <td>${row.rank} / 贴${row.count}颗</td>
          <td>${row.spec}</td>
          <td>${row.vendor}</td>
          <td><strong>${row.board}</strong></td>
          <td><div class="board-tags">${tagHtml(row)}</div></td>
          <td>${row.name}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="11">没有匹配板型。</td></tr>';

  document.querySelectorAll('[data-board-code]').forEach((row) => {
    row.addEventListener('click', () => {
      state.selectedBoardCode = row.dataset.boardCode;
      render();
    });
  });

  renderMatrix(selectedRow);
}

function setupEvents() {
  ['filterSu', 'filterCapacity', 'filterFactory', 'filterGrade', 'filterDramSpec'].forEach((id) => {
    el(id).addEventListener('change', (event) => {
      const key = {
        filterSu: 'su',
        filterCapacity: 'capacity',
        filterFactory: 'factory',
        filterGrade: 'grade',
        filterDramSpec: 'dramSpec',
      }[id];
      state.filters[key] = event.target.value;
      render();
    });
  });
}

setupEvents();
render();
