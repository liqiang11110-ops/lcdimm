const EXCHANGE_RATE = 6.865;
const TAX_RATE = 0.13;
const TAX_MULTIPLIER = 1 + TAX_RATE;
const IS_EMBED = new URLSearchParams(window.location.search).get("embed") === "1";
const DOMESTIC_DATA = window.DIMM_DOMESTIC_MODULE_COSTS || { records: [], coverage: {} };
const domesticCosts = DOMESTIC_DATA.records || [];

if (IS_EMBED) {
  document.body.classList.add("is-embed");
}

let costRecords = [
  { partNumber: "PBA0018C2003", sku: "DDR5 UDIMM 1Rx8 BP: B85URCA 1.00", capacity: "16GB", generation: "DDR5", moduleType: "UDIMM", rank: "1Rx8", supplierPlan: "GD 自采报价", description: "DDR5 UDIMM BP公板: B85URCA 1.00, 询价BOM, 不包含颗粒", pcbCost: 9.56, pmicCost: 3.45, spdCost: 3.11, inductorCost: 1.33, rcCost: 1.388504947, pcbPn: "PCM0002A3350", pmicPn: "ECM0005A0409", spdPn: "ECM0021A0043", inductorPn1: "ECM0003A0087", inductorPn2: "ECM0003A0088" },
  { partNumber: "PBA0018C2004", sku: "DDR5 UDIMM 1Rx16 BP: B85URCC 1.00", capacity: "8GB", generation: "DDR5", moduleType: "UDIMM", rank: "1Rx16", supplierPlan: "GD 自采报价", description: "DDR5 UDIMM BP公板: B85URCC 1.00, 询价BOM, 不包含颗粒", pcbCost: 10.13, pmicCost: 3.45, spdCost: 3.11, inductorCost: 1.33, rcCost: 1.500046894, pcbPn: "PCM0002A3338", pmicPn: "ECM0005A0409", spdPn: "ECM0021A0043", inductorPn1: "ECM0003A0087", inductorPn2: "ECM0003A0088" },
  { partNumber: "PBA0018C2005", sku: "DDR5 SODIMM 1Rx8 BP: BA5SRCA 1.00", capacity: "16GB", generation: "DDR5", moduleType: "SODIMM", rank: "1Rx8", supplierPlan: "GD 自采报价", description: "DDR5 SODIMM BP公板: BA5SRCA 1.00, 询价BOM, 不包含颗粒", pcbCost: 8.99, pmicCost: 3.45, spdCost: 3.11, inductorCost: 1.33, rcCost: 1.379478947, pcbPn: "PCM0002A3351", pmicPn: "ECM0005A0409", spdPn: "ECM0021A0043", inductorPn1: "ECM0003A0087", inductorPn2: "ECM0003A0088" },
  { partNumber: "PBA0018C2006", sku: "DDR5 SODIMM 1Rx16 BP: B85SRCC 1.00", capacity: "8GB", generation: "DDR5", moduleType: "SODIMM", rank: "1Rx16", supplierPlan: "GD 自采报价", description: "DDR5 SODIMM BP公板: B85SRCC 1.00, 询价BOM, 不包含颗粒", pcbCost: 7.84, pmicCost: 3.45, spdCost: 3.11, inductorCost: 1.33, rcCost: 1.435694894, pcbPn: "PCM0002A3343", pmicPn: "ECM0005A0409", spdPn: "ECM0021A0043", inductorPn1: "ECM0003A0087", inductorPn2: "ECM0003A0088" },
  { partNumber: "PBA0018C2007", sku: "DDR5 SODIMM 1Rx8 自研PCB", capacity: "16GB", generation: "DDR5", moduleType: "SODIMM", rank: "1Rx8", supplierPlan: "GD 自采报价", description: "DDR5 SODIMM 自研PCB, 询价BOM, 不包含颗粒", pcbCost: 7.22, pmicCost: 3.45, spdCost: 3.11, inductorCost: 1.33, rcCost: 1.034183947, pcbPn: "PCM0002A3255", pmicPn: "ECM0005A0409", spdPn: "ECM0021A0043", inductorPn1: "ECM0003A0087", inductorPn2: "ECM0003A0088" },
  { partNumber: "PBA0018C2012", sku: "DDR5 UDIMM 1Rx8 BP: BA5UH11", capacity: "16GB", generation: "DDR5", moduleType: "UDIMM", rank: "1Rx8", supplierPlan: "GD 自采报价", description: "DDR5 UDIMM BP公板: BA5UH11, 询价BOM, 不包含颗粒", pcbCost: 10.99, pmicCost: 3.45, spdCost: 3.11, inductorCost: 1.33, rcCost: 1.565500947, pcbPn: "PCM0002A3349", pmicPn: "ECM0005A0409", spdPn: "ECM0021A0043", inductorPn1: "ECM0003A0087", inductorPn2: "ECM0003A0088" },
  { partNumber: "PBA0018C2008", sku: "DDR4 UDIMM 1Rx8 BP: B84URCA2", capacity: "16GB", generation: "DDR4", moduleType: "UDIMM", rank: "1Rx8", supplierPlan: "DDR4", description: "H5ANAG8NCJR-XNC 原厂, 16GB 1Rx8 PC4-3200AA-UA2 1.2V", pcbCost: 0, pmicCost: 0, spdCost: 0, inductorCost: 0, rcCost: 0.670060285, pcbPn: "", pmicPn: "", spdPn: "", inductorPn1: "", inductorPn2: "" },
  { partNumber: "PBA0018C2009", sku: "DDR4 UDIMM 2Rx8 BP: B84URCB2", capacity: "8GB", generation: "DDR4", moduleType: "UDIMM", rank: "2Rx8", supplierPlan: "DDR4", description: "DDR4 UDIMM, BP公板 B84URCA2", pcbCost: 0, pmicCost: 0, spdCost: 0, inductorCost: 0, rcCost: 1.337246456, pcbPn: "", pmicPn: "", spdPn: "", inductorPn1: "", inductorPn2: "" },
  { partNumber: "PBA0018C2010", sku: "DDR4 SODIMM 1Rx8 BP: B84SRCA2", capacity: "16GB", generation: "DDR4", moduleType: "SODIMM", rank: "1Rx8", supplierPlan: "DDR4", description: "DDR4 SODIMM, BP公板 B84SRCA2", pcbCost: 0, pmicCost: 0, spdCost: 0, inductorCost: 0, rcCost: 0.855599, pcbPn: "", pmicPn: "", spdPn: "", inductorPn1: "", inductorPn2: "" },
  { partNumber: "PBA0018C2011", sku: "DDR4 SODIMM 2Rx8 BP: BA4S8F4", capacity: "16GB", generation: "DDR4", moduleType: "SODIMM", rank: "2Rx8", supplierPlan: "DDR4", description: "DDR4 SODIMM, BP公板 BA4S8F4", pcbCost: 0, pmicCost: 0, spdCost: 0, inductorCost: 0, rcCost: 2.136039265, pcbPn: "", pmicPn: "", spdPn: "", inductorPn1: "", inductorPn2: "" }
];

let alternatePlans = [
  { matchSku: "DDR5 UDIMM 1Rx8 BP: B85URCA 1.00", supplierPlan: "昇中价格", pcbCost: 10.3, pmicCost: 6.4, spdCost: 4.5, inductorCost: 0.93 },
  { matchSku: "DDR5 UDIMM 1Rx16 BP: B85URCC 1.00", supplierPlan: "昇中价格", pcbCost: 10.3, pmicCost: 6.4, spdCost: 4.5, inductorCost: 0.93 },
  { matchSku: "DDR5 SODIMM 1Rx8 BP: BA5SRCA 1.00", supplierPlan: "昇中价格", pcbCost: 9.8, pmicCost: 6.4, spdCost: 4.5, inductorCost: 0.93 },
  { matchSku: "DDR5 SODIMM 1Rx16 BP: B85SRCC 1.00", supplierPlan: "昇中价格", pcbCost: 9.9, pmicCost: 6.4, spdCost: 4.5, inductorCost: 0.93 },
  { matchSku: "DDR5 UDIMM 1Rx8 BP: BA5UH11", supplierPlan: "昇中价格", pcbCost: 12.8, pmicCost: 6.4, spdCost: 4.5, inductorCost: 0.93 },
  { matchSku: "DDR5 UDIMM 1Rx8 BP: B85URCA 1.00", supplierPlan: "禾纪价格", pcbCost: 10.5, pmicCost: 5.5, spdCost: 4.5, inductorCost: 1.25 },
  { matchSku: "DDR5 SODIMM 1Rx8 BP: BA5SRCA 1.00", supplierPlan: "禾纪价格", pcbCost: 10, pmicCost: 5.5, spdCost: 4.5, inductorCost: 1.25 },
  { matchSku: "DDR5 UDIMM 1Rx8 BP: BA5UH11", supplierPlan: "禾纪价格", pcbCost: 13, pmicCost: 5.5, spdCost: 4.5, inductorCost: 1.25 },
  { matchSku: "DDR5 UDIMM 1Rx8 BP: B85URCA 1.00", supplierPlan: "金邦", pcbCost: 10.8, pmicCost: 5.3, spdCost: 4.8, inductorCost: 1 },
  { matchSku: "DDR5 UDIMM 1Rx16 BP: B85URCC 1.00", supplierPlan: "金邦", pcbCost: 10.8, pmicCost: 5.3, spdCost: 4.8, inductorCost: 1 },
  { matchSku: "DDR5 UDIMM 1Rx8 BP: B85URCA 1.00", supplierPlan: "丹立", pcbCost: 9.89, pmicCost: 5.399, spdCost: 7.46, inductorCost: 1.28 },
  { matchSku: "DDR5 UDIMM 1Rx16 BP: B85URCC 1.00", supplierPlan: "丹立", pcbCost: 9.89, pmicCost: 5.399, spdCost: 7.46, inductorCost: 1.28 },
  { matchSku: "DDR5 SODIMM 1Rx16 BP: B85SRCC 1.00", supplierPlan: "丹立", pcbCost: 8.96, pmicCost: 5.399, spdCost: 7.46, inductorCost: 1.28 },
  { matchSku: "DDR5 UDIMM 1Rx8 BP: B85URCA 1.00", supplierPlan: "润昇", pcbCost: 9.18, pmicCost: 6.19, spdCost: 7.68, inductorCost: 1.36 },
  { matchSku: "DDR5 UDIMM 1Rx16 BP: B85URCC 1.00", supplierPlan: "润昇", pcbCost: 9.18, pmicCost: 6.19, spdCost: 7.68, inductorCost: 1.36 },
  { matchSku: "DDR5 SODIMM 1Rx8 BP: BA5SRCA 1.00", supplierPlan: "润昇", pcbCost: 9.6, pmicCost: 6.19, spdCost: 7.68, inductorCost: 1.36 }
];

if (window.DIMM_COST_DATA) {
  costRecords = window.DIMM_COST_DATA.summaryRecords.map((record) => ({
    partNumber: record.partNumber,
    sku: record.sku.replaceAll("：", ": "),
    capacity: record.capacity,
    generation: record.generation,
    moduleType: record.moduleType,
    rank: record.rank,
    supplierPlan: record.supplierPlan,
    description: record.description,
    pcbCost: record.pcbCostRmb,
    pmicCost: record.pmicCostRmb,
    spdCost: record.spdCostRmb,
    inductorCost: record.inductorCostRmb,
    rcCost: record.rcCostRmb,
    pcbPn: record.pcbPn,
    pmicPn: record.pmicPn,
    spdPn: record.spdPn,
    inductorPn1: record.inductorPn1,
    inductorPn2: record.inductorPn2
  }));

  alternatePlans = window.DIMM_COST_DATA.alternatePlans.map((plan) => ({
    matchSku: plan.matchSku.replaceAll("：", ": "),
    supplierPlan: plan.supplierPlan,
    pcbCost: plan.pcbCostRmb,
    pmicCost: plan.pmicCostRmb,
    spdCost: plan.spdCostRmb,
    inductorCost: plan.inductorCostRmb,
    rcCost: plan.rcCostRmb
  }));
}

const factoryPlans = [
  {
    value: "Longsys",
    label: "Longsys",
    domesticFactory: "自采物料",
    costs: null
  },
  {
    value: "晟中",
    label: "晟中",
    domesticFactory: "晟中",
    costs: null
  }
];

const yieldRates = [
  { value: 0.95, label: "95%" },
  { value: 0.97, label: "97%" },
  { value: 0.98, label: "98%" },
  { value: 0.99, label: "99%" }
];

const margins = [
  { value: 0.05, label: "5%" },
  { value: 0.08, label: "8%" },
  { value: 0.1, label: "10%" },
  { value: 0.12, label: "12%" }
];

const fields = {
  partNumber: document.querySelector("#partNumber"),
  sku: document.querySelector("#sku"),
  capacity: document.querySelector("#capacity"),
  generation: document.querySelector("#generation"),
  moduleType: document.querySelector("#moduleType"),
  rank: document.querySelector("#rank"),
  supplierPlan: document.querySelector("#supplierPlan"),
  factoryPlan: document.querySelector("#factoryPlan"),
  yieldRate: document.querySelector("#yieldRate"),
  quantity: document.querySelector("#quantity"),
  margin: document.querySelector("#margin"),
  customPcb: document.querySelector("#customPcb"),
  customPmic: document.querySelector("#customPmic"),
  customSpd: document.querySelector("#customSpd"),
  customInductor: document.querySelector("#customInductor"),
  customRc: document.querySelector("#customRc"),
  factorySmt: document.querySelector("#factorySmt"),
  factoryTest: document.querySelector("#factoryTest"),
  factoryPacking: document.querySelector("#factoryPacking"),
  factoryManagement: document.querySelector("#factoryManagement"),
  factoryOther: document.querySelector("#factoryOther")
};

const outputs = {
  schemeName: document.querySelector("#schemeName"),
  actualCost: document.querySelector("#actualCost"),
  materialCost: document.querySelector("#materialCost"),
  factoryCost: document.querySelector("#factoryCost"),
  diePerModule: document.querySelector("#diePerModule"),
  inputQuantity: document.querySelector("#inputQuantity"),
  dieDemand: document.querySelector("#dieDemand"),
  standardCost: document.querySelector("#standardCost"),
  quotePrice: document.querySelector("#quotePrice"),
  totalCost: document.querySelector("#totalCost"),
  grossProfit: document.querySelector("#grossProfit"),
  bomRows: document.querySelector("#bomRows"),
  sensitivityRows: document.querySelector("#sensitivityRows"),
  bomNote: document.querySelector("#bomNote"),
  customPanel: document.querySelector("#customPanel"),
  factoryPanel: document.querySelector("#factoryPanel"),
  selectedSku: document.querySelector("#selectedSku"),
  selectedDescription: document.querySelector("#selectedDescription"),
  dataSummary: document.querySelector("#dataSummary"),
  dataView: document.querySelector("#dataView"),
  bomSheet: document.querySelector("#bomSheet"),
  dataTable: document.querySelector("#dataTable"),
  sameLongsysTotal: document.querySelector("#sameLongsysTotal"),
  sameZhongTotal: document.querySelector("#sameZhongTotal"),
  sameProcessDiff: document.querySelector("#sameProcessDiff"),
  sameMaterialConclusion: document.querySelector("#sameMaterialConclusion"),
  sameMaterialRows: document.querySelector("#sameMaterialRows"),
  sameMaterialNote: document.querySelector("#sameMaterialNote")
};

function uniqueOptions(records, key, labelBuilder = (value) => value || "全部") {
  return [...new Set(records.map((record) => record[key]).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN"))
    .map((value) => ({ value, label: labelBuilder(value) }));
}

function setOptions(field, options, selectedValue) {
  field.innerHTML = options.map((item) => `<option value="${item.value}">${item.label}</option>`).join("");
  if (selectedValue && options.some((item) => String(item.value) === String(selectedValue))) {
    field.value = selectedValue;
  }
}

function setStaticOptions() {
  setOptions(fields.yieldRate, yieldRates, "0.98");
  fields.quantity.value = "10000";
  setOptions(fields.margin, margins, "0.08");
}

function extractBoardCode(text) {
  const source = String(text || "").toUpperCase().replace(/\s+/g, "");
  const codes = [
    "B85URCA", "B85URCC", "BA5UH11", "BA5UR02", "B85URCB", "BA5UH12",
    "B85SRCC", "BA5SRCA", "BA5S811", "BA5SRCB", "BA5S812",
    "B84URCA2", "B84URCB2", "B84SRCA1", "B84SRCA2", "BA4S8F4"
  ];
  if (String(text || "").includes("自研PCB")) return "自研PCB";
  return codes.find((code) => source.includes(code)) || "";
}

function domesticRowsForRecord(record) {
  if (!domesticCosts.length || !record) return [];
  const boardCode = extractBoardCode(record.sku);
  return domesticCosts.filter((row) => {
    const mapped = Array.isArray(row.matchedPartNumbers) && row.matchedPartNumbers.includes(record.partNumber);
    const sameSpec = row.generation === record.generation &&
      row.moduleType === record.moduleType &&
      row.capacity === record.capacity &&
      row.rank === record.rank &&
      (!boardCode || row.boardCode === boardCode);
    return mapped || sameSpec;
  });
}

function activeFactoryPlan() {
  return factoryPlans.find((item) => item.value === fields.factoryPlan.value) || factoryPlans[0];
}

function activeDomesticCost(record) {
  const plan = activeFactoryPlan();
  if (!plan.domesticFactory) return null;
  const rows = domesticRowsForRecord(record);
  if (plan.domesticFactory === "__merged__") {
    return rows
      .filter((row) => row.factory === "自采物料" || row.factory === "晟中")
      .sort((a, b) => Number(a.standardTotalRmb || 0) - Number(b.standardTotalRmb || 0))[0] || null;
  }
  return rows.find((row) => row.factory === plan.domesticFactory) || null;
}

function setFactoryOptionsForRecord(record) {
  const previous = fields.factoryPlan.value;
  const domesticFactories = [...new Set(domesticRowsForRecord(record).map((row) => row.factory))];
  const options = factoryPlans
    .filter((plan) => plan.domesticFactory === "__merged__" || !plan.domesticFactory || domesticFactories.includes(plan.domesticFactory))
    .map((plan) => ({ value: plan.value, label: plan.label }));
  const selected = options.some((item) => item.value === previous)
    ? previous
    : factoryPlans[0].value;
  setOptions(fields.factoryPlan, options, selected);
}

function matchingRecords() {
  return costRecords.filter((record) => {
    return (!fields.partNumber.value || record.partNumber === fields.partNumber.value) &&
      (!fields.sku.value || record.sku === fields.sku.value) &&
      (!fields.capacity.value || record.capacity === fields.capacity.value) &&
      (!fields.generation.value || record.generation === fields.generation.value) &&
      (!fields.moduleType.value || record.moduleType === fields.moduleType.value) &&
      (!fields.rank.value || record.rank === fields.rank.value);
  });
}

function syncFilters(changedField) {
  const selectedRecord = costRecords.find((record) => record.partNumber === fields.partNumber.value) || costRecords[0];
  setOptions(fields.partNumber, uniqueOptions(costRecords, "partNumber"), selectedRecord.partNumber);

  ["sku", "capacity", "generation", "moduleType", "rank"].forEach((key) => {
    setOptions(fields[key], [{ value: selectedRecord[key], label: selectedRecord[key] }], selectedRecord[key]);
    fields[key].disabled = true;
  });

  const baseRecord = selectedRecord;
  setOptions(fields.supplierPlan, [{ value: baseRecord.supplierPlan, label: displayPlanName(baseRecord.supplierPlan) }], baseRecord.supplierPlan);
  fields.supplierPlan.disabled = true;
  setFactoryOptionsForRecord(selectedRecord);
}

function displayPlanName(name) {
  return name === "昇中价格" ? "晟中价格" : name;
}

function rmbToUsd(value) {
  return Number(value || 0) / EXCHANGE_RATE;
}

function usd(value) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })}`;
}

function rmb(value) {
  return `RMB ${Number(value || 0).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function isLongsysRow(row) {
  return row && (row.factory === "自采物料" || row.sourceFactory === "自采物料");
}

function taxAdjustedRmb(row, value) {
  if (value === null || value === undefined) return 0;
  return isLongsysRow(row) ? Number(value) * TAX_MULTIPLIER : Number(value);
}

function processingCostRmb(row) {
  if (!row) return 0;
  if (typeof row.processingCostRmb === "number") return row.processingCostRmb;
  return Number(row.standardTotalRmb || 0) - Number(row.pcbaBomRmb || 0);
}

function taxBasisText(row) {
  if (!row) return "";
  return isLongsysRow(row) ? "Longsys 未税折含税" : "晟中含税";
}

function activeRecord() {
  const record = matchingRecords()[0] || costRecords[0];
  return record;
}

function bomItems(record) {
  const domestic = activeDomesticCost(record);
  if (domestic) {
    return [{
      name: "PCBA BOM（含税口径）",
      pn: `${taxBasisText(domestic)} / ${domestic.pcb}`,
      qty: 1,
      rmbUnit: taxAdjustedRmb(domestic, domestic.pcbaBomRmb)
    }].filter((item) => item.rmbUnit > 0);
  }

  if (record.isCustom) {
    return [
      { name: "PCB", pn: "自定义", qty: 1, usdUnit: Number(fields.customPcb.value) || 0 },
      { name: "PMIC", pn: "自定义", qty: 1, usdUnit: Number(fields.customPmic.value) || 0 },
      { name: "SPD / EEPROM", pn: "自定义", qty: 1, usdUnit: Number(fields.customSpd.value) || 0 },
      { name: "电感", pn: "自定义", qty: 1, usdUnit: Number(fields.customInductor.value) || 0 },
      { name: "阻容物料", pn: "自定义", qty: 1, usdUnit: Number(fields.customRc.value) || 0 }
    ].filter((item) => item.usdUnit > 0);
  }

  return [
    { name: "PCB", pn: record.pcbPn, qty: 1, rmbUnit: record.pcbCost },
    { name: "PMIC", pn: record.pmicPn, qty: record.pmicCost ? 1 : 0, rmbUnit: record.pmicCost },
    { name: "SPD / EEPROM", pn: record.spdPn, qty: record.spdCost ? 1 : 0, rmbUnit: record.spdCost },
    { name: "电感", pn: [record.inductorPn1, record.inductorPn2].filter(Boolean).join(" / "), qty: record.inductorCost ? 1 : 0, rmbUnit: record.inductorCost },
    { name: "阻容物料", pn: "", qty: record.rcCost ? 1 : 0, rmbUnit: record.rcCost }
  ].filter((item) => item.qty > 0 && item.rmbUnit > 0);
}

function factoryCostItems() {
  const record = activeRecord();
  const domestic = activeDomesticCost(record);
  if (domestic) {
    return [
      { name: "盖面费用", pn: `${taxBasisText(domestic)} 行${domestic.sourceRow}`, qty: 1, rmbUnit: taxAdjustedRmb(domestic, domestic.coverCostRmb) },
      { name: "SMT / 贴片", pn: `${taxBasisText(domestic)} 行${domestic.sourceRow}`, qty: 1, rmbUnit: taxAdjustedRmb(domestic, domestic.smtCostRmb) },
      { name: "测试（不含 Row Hammer）", pn: `${taxBasisText(domestic)} 行${domestic.sourceRow}`, qty: 1, rmbUnit: taxAdjustedRmb(domestic, domestic.testNoRowHammerRmb) },
      { name: "运费", pn: `${taxBasisText(domestic)} 行${domestic.sourceRow}`, qty: 1, rmbUnit: taxAdjustedRmb(domestic, domestic.freightRmb) },
      { name: "包材费用", pn: `${taxBasisText(domestic)} 行${domestic.sourceRow}`, qty: 1, rmbUnit: taxAdjustedRmb(domestic, domestic.packingRmb) }
    ].filter((item) => item.rmbUnit > 0);
  }

  if (fields.factoryPlan.value === "自定义加工厂") {
    return [
      { name: "SMT / 贴片", pn: "制造成本", qty: 1, usdUnit: Number(fields.factorySmt.value) || 0 },
      { name: "测试", pn: "制造成本", qty: 1, usdUnit: Number(fields.factoryTest.value) || 0 },
      { name: "包装", pn: "制造成本", qty: 1, usdUnit: Number(fields.factoryPacking.value) || 0 },
      { name: "管理/制费", pn: "制造成本", qty: 1, usdUnit: Number(fields.factoryManagement.value) || 0 },
      { name: "其他制造成本", pn: "制造成本", qty: 1, usdUnit: Number(fields.factoryOther.value) || 0 }
    ].filter((item) => item.usdUnit > 0);
  }

  const plan = factoryPlans.find((item) => item.value === fields.factoryPlan.value) || factoryPlans[0];
  if (!plan.costs) return [];
  const generationCost = plan.costs[record.generation] || plan.costs.DDR5;
  return [
    { name: "SMT / 贴片", pn: `${plan.label} ${record.generation}`, qty: 1, usdUnit: generationCost.smt },
    { name: "测试", pn: `${plan.label} ${record.generation}`, qty: 1, usdUnit: generationCost.test },
    { name: "包装", pn: `${plan.label} ${record.generation}`, qty: 1, usdUnit: generationCost.packing },
    { name: "管理/制费", pn: `${plan.label} ${record.generation}`, qty: 1, usdUnit: generationCost.management },
    { name: "其他制造成本", pn: `${plan.label} ${record.generation}`, qty: 1, usdUnit: generationCost.other }
  ].filter((item) => item.usdUnit > 0);
}

function diePerModule(record) {
  if (record.rank === "1Rx16") return 4;
  if (record.rank === "2Rx16") return 8;
  if (record.rank === "1Rx8") return 8;
  if (record.rank === "2Rx8") return 16;

  const capacityGb = Number(String(record.capacity).replace(/[^0-9.]/g, ""));
  if (capacityGb <= 8) return 4;
  if (capacityGb <= 16) return 8;
  if (capacityGb <= 32) return 16;
  return 8;
}

function wholeNumber(value) {
  return Math.floor(Number(value || 0)).toLocaleString("en-US");
}

function itemUnitUsd(item) {
  return typeof item.usdUnit === "number" ? item.usdUnit : rmbToUsd(item.rmbUnit);
}

function itemAmountUsd(item) {
  return item.qty * itemUnitUsd(item);
}

function calculate(yieldOverride) {
  const record = activeRecord();
  const domestic = activeDomesticCost(record);
  const materialItems = bomItems(record);
  const factoryItems = factoryCostItems();
  const items = materialItems.concat(factoryItems);
  const yieldRate = Number(yieldOverride ?? fields.yieldRate.value);
  const dieOrderQuantity = Math.max(0, Number(fields.quantity.value) || 0);
  const diesPerModule = diePerModule(record);
  const grossModuleQuantity = diesPerModule ? dieOrderQuantity / diesPerModule : 0;
  const quantity = Math.floor(grossModuleQuantity * yieldRate);
  const margin = Number(fields.margin.value);
  const standardCostRmb = materialItems.reduce((sum, item) => sum + item.qty * (item.rmbUnit || 0), 0);
  const materialCostUsd = materialItems.reduce((sum, item) => sum + itemAmountUsd(item), 0);
  const factoryCostUsd = factoryItems.reduce((sum, item) => sum + itemAmountUsd(item), 0);
  const standardCostUsd = items.reduce((sum, item) => sum + itemAmountUsd(item), 0);
  const actualCostUsd = standardCostUsd / yieldRate;
  const quotePriceUsd = actualCostUsd / (1 - margin);
  const totalCostUsd = actualCostUsd * quantity;
  const grossProfitUsd = (quotePriceUsd - actualCostUsd) * quantity;

  return {
    record,
    domestic,
    items,
    materialItems,
    factoryItems,
    yieldRate,
    dieOrderQuantity,
    diesPerModule,
    grossModuleQuantity,
    quantity,
    margin,
    standardCostRmb,
    materialCostUsd,
    factoryCostUsd,
    standardCostUsd,
    actualCostUsd,
    quotePriceUsd,
    totalCostUsd,
    grossProfitUsd
  };
}

function bestDomesticRow(rows, factoryName) {
  return rows
    .filter((row) => row.factory === factoryName)
    .sort((a, b) => taxAdjustedRmb(a, a.standardTotalRmb) - taxAdjustedRmb(b, b.standardTotalRmb))[0] || null;
}

function sameMaterialComparisonFromRows(rows) {
  const longsys = bestDomesticRow(rows, "自采物料");
  const zhong = bestDomesticRow(rows, "晟中");
  if (!longsys || !zhong) return null;

  const materialRmb = taxAdjustedRmb(longsys, longsys.pcbaBomRmb);
  const longsysProcessRmb = taxAdjustedRmb(longsys, processingCostRmb(longsys));
  const zhongProcessRmb = taxAdjustedRmb(zhong, processingCostRmb(zhong));
  const longsysSameTotalRmb = materialRmb + longsysProcessRmb;
  const zhongSameTotalRmb = materialRmb + zhongProcessRmb;
  const processDiffRmb = zhongProcessRmb - longsysProcessRmb;
  const rawTotalDiffRmb = taxAdjustedRmb(zhong, zhong.standardTotalRmb) - taxAdjustedRmb(longsys, longsys.standardTotalRmb);
  const materialDiffRmb = taxAdjustedRmb(zhong, zhong.pcbaBomRmb) - materialRmb;

  return {
    longsys,
    zhong,
    materialRmb,
    longsysProcessRmb,
    zhongProcessRmb,
    longsysSameTotalRmb,
    zhongSameTotalRmb,
    processDiffRmb,
    rawTotalDiffRmb,
    materialDiffRmb,
    conclusion: processDiffRmb < 0 ? "晟中加工费更低" : (processDiffRmb > 0 ? "Longsys加工费更低" : "加工费一致")
  };
}

function sameMaterialComparison(record) {
  return sameMaterialComparisonFromRows(domesticRowsForRecord(record));
}

function sameMaterialDataRows() {
  const groups = new Map();
  domesticCosts.forEach((row) => {
    const key = [row.generation, row.capacity, row.moduleType, row.rank, row.boardCode].join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });

  return [...groups.values()].map((rows) => {
    const result = sameMaterialComparisonFromRows(rows);
    if (!result) return null;
    const base = result.longsys;
    return {
      规格: base.generation,
      容量: base.capacity,
      类型: base.moduleType,
      Rank: base.rank,
      板型: base.boardCode,
      "Longsys加工含税RMB": result.longsysProcessRmb,
      "晟中加工含税RMB": result.zhongProcessRmb,
      "同料加工差异RMB": result.processDiffRmb,
      "同料加工差异USD": rmbToUsd(result.processDiffRmb),
      "Longsys同料总成本RMB": result.longsysSameTotalRmb,
      "晟中同料总成本RMB": result.zhongSameTotalRmb,
      "原总成本差异RMB": result.rawTotalDiffRmb,
      "其中物料差异RMB": result.materialDiffRmb,
      结论: result.conclusion,
      Longsys行: result.longsys.sourceRow,
      晟中行: result.zhong.sourceRow
    };
  }).filter(Boolean);
}

function renderBomRows(items) {
  const result = calculate();
  const materialRows = result.materialItems.map((item) => renderCostRow(item));
  const factoryRows = result.factoryItems.map((item) => renderCostRow(item));
  const subtotalRows = `
    <tr class="subtotal-row">
      <td>物料小计</td>
      <td></td>
      <td></td>
      <td class="amount">${usd(result.materialCostUsd)}</td>
    </tr>
    <tr class="subtotal-row">
      <td>加工费小计</td>
      <td></td>
      <td></td>
      <td class="amount">${usd(result.factoryCostUsd)}</td>
    </tr>
    <tr class="total-row">
      <td>总计</td>
      <td></td>
      <td></td>
      <td class="amount">${usd(result.standardCostUsd)}</td>
    </tr>
  `;
  outputs.bomRows.innerHTML = materialRows.concat(factoryRows).join("") + subtotalRows;
}

function signedUsdFromRmb(value) {
  const amount = rmbToUsd(value);
  const sign = amount > 0 ? "+" : "";
  return `${sign}${usd(amount)}`;
}

function renderSameMaterialComparison() {
  const result = sameMaterialComparison(activeRecord());
  if (!result) {
    outputs.sameLongsysTotal.textContent = "-";
    outputs.sameZhongTotal.textContent = "-";
    outputs.sameProcessDiff.textContent = "-";
    outputs.sameMaterialConclusion.textContent = "缺少成对数据";
    outputs.sameMaterialNote.textContent = "当前料号没有同时匹配 Longsys 和晟中";
    outputs.sameMaterialRows.innerHTML = `<tr><td colspan="4">当前料号没有成对数据，先补映射表后再比较。</td></tr>`;
    return;
  }

  outputs.sameLongsysTotal.textContent = usd(rmbToUsd(result.longsysSameTotalRmb));
  outputs.sameZhongTotal.textContent = usd(rmbToUsd(result.zhongSameTotalRmb));
  outputs.sameProcessDiff.textContent = signedUsdFromRmb(result.processDiffRmb);
  outputs.sameMaterialConclusion.textContent = result.conclusion;
  outputs.sameMaterialNote.textContent = `同一套 BOM：${result.longsys.boardCode} / Longsys 未税 × ${TAX_MULTIPLIER.toFixed(2)}；晟中含税`;
  outputs.sameMaterialRows.innerHTML = [
    {
      name: "加工费含税",
      longsys: rmb(result.longsysProcessRmb),
      zhong: rmb(result.zhongProcessRmb),
      diff: `${rmb(result.processDiffRmb)} / ${signedUsdFromRmb(result.processDiffRmb)}`
    },
    {
      name: "同料总成本含税",
      longsys: rmb(result.longsysSameTotalRmb),
      zhong: rmb(result.zhongSameTotalRmb),
      diff: `${rmb(result.processDiffRmb)} / ${signedUsdFromRmb(result.processDiffRmb)}`
    },
    {
      name: "原总成本差异",
      longsys: rmb(taxAdjustedRmb(result.longsys, result.longsys.standardTotalRmb)),
      zhong: rmb(taxAdjustedRmb(result.zhong, result.zhong.standardTotalRmb)),
      diff: `${rmb(result.rawTotalDiffRmb)} / ${signedUsdFromRmb(result.rawTotalDiffRmb)}`
    },
    {
      name: "其中物料差异",
      longsys: rmb(result.materialRmb),
      zhong: rmb(taxAdjustedRmb(result.zhong, result.zhong.pcbaBomRmb)),
      diff: `${rmb(result.materialDiffRmb)} / ${signedUsdFromRmb(result.materialDiffRmb)}`
    }
  ].map((row) => `
    <tr>
      <td>${row.name}</td>
      <td>${row.longsys}</td>
      <td>${row.zhong}</td>
      <td class="amount">${row.diff}</td>
    </tr>
  `).join("");
}

function renderCostRow(item) {
    if (typeof item.usdUnit === "number") {
      const amountUsd = item.qty * item.usdUnit;
      return `
        <tr>
          <td>${item.name}<br><span class="muted">${item.pn}</span></td>
          <td>${item.qty}</td>
          <td>${usd(item.usdUnit)}</td>
          <td class="amount">${usd(amountUsd)}</td>
        </tr>
      `;
    }

    const amountRmb = item.qty * item.rmbUnit;
    return `
      <tr>
        <td>${item.name}${item.pn ? `<br><span class="muted">${item.pn}</span>` : ""}</td>
        <td>${item.qty}</td>
        <td>${rmb(item.rmbUnit)}<br><span class="muted">${usd(rmbToUsd(item.rmbUnit))}</span></td>
        <td class="amount">${usd(rmbToUsd(amountRmb))}</td>
      </tr>
    `;
}

function renderSensitivity() {
  outputs.sensitivityRows.innerHTML = yieldRates.map((rate) => {
    const result = calculate(rate.value);
    return `
      <tr>
        <td>${rate.label}</td>
        <td class="amount">${usd(result.actualCostUsd)}</td>
        <td>${usd(result.quotePriceUsd)}</td>
      </tr>
    `;
  }).join("");
}

function render() {
  const result = calculate();
  const record = result.record;
  outputs.schemeName.textContent = `${record.partNumber} / ${displayPlanName(record.supplierPlan)}`;
  outputs.materialCost.textContent = usd(result.materialCostUsd);
  outputs.factoryCost.textContent = usd(result.factoryCostUsd);
  outputs.diePerModule.textContent = wholeNumber(result.diesPerModule);
  outputs.inputQuantity.textContent = wholeNumber(result.quantity);
  outputs.dieDemand.textContent = wholeNumber(result.dieOrderQuantity);
  outputs.standardCost.textContent = usd(result.standardCostUsd);
  outputs.actualCost.textContent = usd(result.actualCostUsd);
  outputs.quotePrice.textContent = usd(result.quotePriceUsd);
  outputs.totalCost.textContent = usd(result.totalCostUsd);
  outputs.grossProfit.textContent = usd(result.grossProfitUsd);
  outputs.selectedSku.textContent = record.sku;
  outputs.selectedDescription.textContent = record.description || "-";
  outputs.customPanel.classList.toggle("is-visible", record.isCustom);
  outputs.factoryPanel.classList.toggle("is-visible", fields.factoryPlan.value === "自定义加工厂");
  const planLabel = activeFactoryPlan().label;
  const sourceNote = result.domestic ? ` / ${result.domestic.sourceFactory || result.domestic.factory}行${result.domestic.sourceRow}` : "";
  outputs.bomNote.textContent = record.isCustom
    ? `${record.capacity} ${record.generation} ${record.moduleType} ${record.rank} / 自定义物料 + ${planLabel}`
    : `${record.capacity} ${record.generation} ${record.moduleType} ${record.rank} / 汇率 ${EXCHANGE_RATE} / ${planLabel}${sourceNote}`;
  renderBomRows(result.items);
  renderSameMaterialComparison();
  renderSensitivity();
  if (!IS_EMBED) renderDataTable();
}

function notifyModuleSelection() {
  if (IS_EMBED) return;
  window.parent?.postMessage({
    type: "cost-module-selected",
    modulePartNumber: fields.partNumber.value,
  }, "*");
}

function setCostPartNumber(modulePartNumber, shouldNotify = false) {
  if (!modulePartNumber || fields.partNumber.value === modulePartNumber) return;
  const exists = costRecords.some((record) => record.partNumber === modulePartNumber);
  if (!exists) return;
  fields.partNumber.value = modulePartNumber;
  syncFilters("partNumber");
  render();
  if (shouldNotify) notifyModuleSelection();
}

function cell(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return Number(value.toFixed(6)).toString();
  if (Array.isArray(value)) return value.join(" / ");
  return String(value);
}

function renderGenericTable(rows, preferredHeaders = []) {
  if (!rows.length) {
    outputs.dataTable.innerHTML = "<tbody><tr><td>暂无数据</td></tr></tbody>";
    return;
  }
  const headers = preferredHeaders.length
    ? preferredHeaders.filter((header) => rows.some((row) => row[header] !== undefined && row[header] !== ""))
    : [...new Set(rows.flatMap((row) => Object.keys(row)))];
  outputs.dataTable.innerHTML = `
    <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
    <tbody>
      ${rows.map((row) => `
        <tr>${headers.map((header) => `<td>${cell(row[header])}</td>`).join("")}</tr>
      `).join("")}
    </tbody>
  `;
}

function renderBomSheetOptions() {
  if (!window.DIMM_COST_DATA) return;
  const sheets = Object.keys(window.DIMM_COST_DATA.bomSheets || {});
  outputs.bomSheet.innerHTML = sheets
    .map((pn) => `<option value="${pn}">${pn} / ${window.DIMM_COST_DATA.bomSheets[pn].meta.sheetName}</option>`)
    .join("");
}

function renderDataTable() {
  if (!window.DIMM_COST_DATA) {
    outputs.dataSummary.textContent = "未加载 Excel 数据文件";
    outputs.dataTable.innerHTML = "<tbody><tr><td>未加载 data.js</td></tr></tbody>";
    return;
  }

  const view = outputs.dataView.value;
  outputs.bomSheet.style.display = view === "bom" ? "block" : "none";

  if (view === "domestic") {
    const rows = domesticCosts;
    const coverage = DOMESTIC_DATA.coverage || {};
    outputs.dataSummary.textContent = `国内模组加工成本 ${rows.length} 行，已映射 ${coverage.mappedRows || 0} 行，未映射 ${coverage.unmappedRows || 0} 行`;
    renderGenericTable(rows, [
      "sourceRow", "factory", "mappedPartNumber", "moduleForm", "capacity", "rank", "boardCode", "pcb",
      "pcbaBomRmb", "coverCostRmb", "smtCostRmb", "testNoRowHammerRmb", "freightRmb", "packingRmb",
      "standardTotalRmb", "laserLogoRmb", "customProcessRmb", "customTotalRmb", "rowHammerTestRmb",
      "rowHammerTotalRmb", "processingCostRmb", "matchedPartNumbers", "remark"
    ]);
    return;
  }

  if (view === "sameMaterial") {
    const rows = sameMaterialDataRows();
    outputs.dataSummary.textContent = `同物料加工费差异 ${rows.length} 组，固定同一套 BOM，只比较 Longsys 和晟中的加工费`;
    renderGenericTable(rows, [
      "规格", "容量", "类型", "Rank", "板型", "Longsys加工含税RMB", "晟中加工含税RMB",
      "同料加工差异RMB", "同料加工差异USD", "Longsys同料总成本RMB", "晟中同料总成本RMB",
      "原总成本差异RMB", "其中物料差异RMB", "结论", "Longsys行", "晟中行"
    ]);
    return;
  }

  if (view === "firstSheet") {
    const rows = window.DIMM_COST_DATA.firstSheetRows || [];
    outputs.dataSummary.textContent = `第一张表 CDIMM套料成本 ${rows.length} 行`;
    renderGenericTable(rows, ["row", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"]);
    return;
  }

  if (view === "summary") {
    const rows = window.DIMM_COST_DATA.summaryRecords;
    outputs.dataSummary.textContent = `套料成本汇总 ${rows.length} 条`;
    renderGenericTable(rows, ["sourceRow", "partNumber", "sku", "capacity", "generation", "moduleType", "rank", "supplierPlan", "bomCostRmb", "pcbCostRmb", "pmicCostRmb", "spdCostRmb", "inductorCostRmb", "pcbElectronicsCostRmb", "rcCostRmb", "pcbPn", "pmicPn", "spdPn", "inductorPn1", "inductorPn2", "description"]);
    return;
  }

  if (view === "plans") {
    const rows = window.DIMM_COST_DATA.alternatePlans;
    outputs.dataSummary.textContent = `替代成本方案 ${rows.length} 条`;
    renderGenericTable(rows, ["sourceRow", "supplierPlan", "matchSku", "generation", "moduleType", "rank", "pcbCostRmb", "pmicCostRmb", "spdCostRmb", "inductorCostRmb", "pcbElectronicsCostRmb", "rcCostRmb"]);
    return;
  }

  if (view === "materials") {
    const rows = window.DIMM_COST_DATA.materialPrices;
    outputs.dataSummary.textContent = `物料价格表 ${rows.length} 条`;
    renderGenericTable(rows, ["序号", "料号", "品牌", "PN", "参数", "priceRmb", "是否含税"]);
    return;
  }

  const pn = outputs.bomSheet.value || Object.keys(window.DIMM_COST_DATA.bomSheets)[0];
  const sheet = window.DIMM_COST_DATA.bomSheets[pn];
  outputs.dataSummary.textContent = `${pn} BOM 明细 ${sheet.rows.length} 条`;
  renderGenericTable(sheet.rows, ["层次号", "料号", "名称", "参数合成", "详细说明", "生命周期状态", "单位", "用量", "位号", "替代料", "供应商"]);
}

function init() {
  ["partNumber", "sku", "capacity", "generation", "moduleType", "rank"].forEach((key) => {
    setOptions(fields[key], uniqueOptions(costRecords, key));
  });
  fields.partNumber.value = "PBA0018C2003";
  setStaticOptions();
  syncFilters("partNumber");
  if (IS_EMBED) {
    fields.partNumber.disabled = true;
  }

  ["partNumber", "sku", "capacity", "generation", "moduleType", "rank"].forEach((key) => {
    fields[key].addEventListener("change", () => {
      syncFilters(key);
      render();
      if (key === "partNumber") notifyModuleSelection();
    });
  });
  ["supplierPlan", "factoryPlan", "yieldRate", "margin"].forEach((key) => {
    fields[key].addEventListener("change", render);
  });
  fields.quantity.addEventListener("input", render);
  ["customPcb", "customPmic", "customSpd", "customInductor", "customRc"].forEach((key) => {
    fields[key].addEventListener("input", render);
  });
  ["factorySmt", "factoryTest", "factoryPacking", "factoryManagement", "factoryOther"].forEach((key) => {
    fields[key].addEventListener("input", render);
  });
  renderBomSheetOptions();
  outputs.dataView.addEventListener("change", renderDataTable);
  outputs.bomSheet.addEventListener("change", renderDataTable);
  render();
  notifyModuleSelection();
}

window.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "set-cost-context") {
    setCostPartNumber(message.modulePartNumber, false);
    if (message.yieldRate) {
      const value = String(Number(message.yieldRate));
      if (![...fields.yieldRate.options].some((option) => option.value === value)) {
        fields.yieldRate.add(new Option(`测试良率 ${(Number(message.yieldRate) * 100).toFixed(2)}%`, value));
      }
      fields.yieldRate.value = value;
    }
    if (message.quantity) fields.quantity.value = Math.floor(Number(message.quantity));
    render();
    return;
  }
  if (message.type !== "set-cost-part-number") return;
  setCostPartNumber(message.modulePartNumber, false);
});

init();
