const DATA = window.GRAIN_SORTING_DATA;
const IS_EMBED = new URLSearchParams(window.location.search).get("embed") === "1";
const DDR5_DIE_SPECS = ["1G8", "1G16", "2G8", "3G8", "4G8"];

if (IS_EMBED) {
  document.body.classList.add("is-embed");
}

const fields = {
  grainPartNumber: document.querySelector("#grainPartNumber"),
  grainPn: document.querySelector("#grainPn"),
  grainBrand: document.querySelector("#grainBrand"),
  grainGrade: document.querySelector("#grainGrade"),
  grainDensity: document.querySelector("#grainDensity"),
  factory: document.querySelector("#factory"),
  status: document.querySelector("#status"),
  modulePartNumber: document.querySelector("#modulePartNumber"),
  diesPerModule: document.querySelector("#diesPerModule"),
  grainUnitPrice: document.querySelector("#grainUnitPrice"),
  sortingTestFee: document.querySelector("#sortingTestFee"),
  assemblyCost: document.querySelector("#assemblyCost"),
};

const outputs = {
  currentScheme: document.querySelector("#currentScheme"),
  totalGoodDies: document.querySelector("#totalGoodDies"),
  overallYield: document.querySelector("#overallYield"),
  totalIncoming: document.querySelector("#totalIncoming"),
  moduleQuantity: document.querySelector("#moduleQuantity"),
  batchCount: document.querySelector("#batchCount"),
  doneBatchCount: document.querySelector("#doneBatchCount"),
  multiBatchCount: document.querySelector("#multiBatchCount"),
  batchRows: document.querySelector("#batchRows"),
  testRows: document.querySelector("#testRows"),
  detailNote: document.querySelector("#detailNote"),
  sortingActualCost: document.querySelector("#sortingActualCost"),
  yieldedGrainCost: document.querySelector("#yieldedGrainCost"),
  yieldedTestCost: document.querySelector("#yieldedTestCost"),
  moduleBomCost: document.querySelector("#moduleBomCost"),
  assemblyCostOut: document.querySelector("#assemblyCostOut"),
  totalSortingCost: document.querySelector("#totalSortingCost"),
  mappingSummary: document.querySelector("#mappingSummary"),
  mappingRows: document.querySelector("#mappingRows"),
  ruleRows: document.querySelector("#ruleRows"),
};

let latestSortingMetrics = null;
let latestNotification = "";

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return Number(value).toLocaleString("zh-CN");
}

function pct(value) {
  if (value === null || value === undefined) return "-";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function usd(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })}`;
}

function badge(value, type = "yield") {
  if (value === null || value === undefined || value === "") return `<span class="badge badge-muted">暂无</span>`;
  if (type === "status") {
    if (value === "已完成") return `<span class="badge badge-good">${value}</span>`;
    if (value === "进行中" || value === "暂停") return `<span class="badge badge-warn">${value}</span>`;
    return `<span class="badge badge-muted">${value}</span>`;
  }
  const rate = Number(value);
  if (rate >= 0.9) return `<span class="badge badge-good">${pct(rate)}</span>`;
  if (rate >= 0.6) return `<span class="badge badge-warn">${pct(rate)}</span>`;
  return `<span class="badge badge-bad">${pct(rate)}</span>`;
}

function setOptions(select, options, selectedValue = "") {
  select.innerHTML = options.map((item) => `<option value="${item.value}">${item.label}</option>`).join("");
  if (options.some((item) => String(item.value) === String(selectedValue))) {
    select.value = selectedValue;
  }
}

function unique(records, key) {
  return [...new Set(records.map((record) => record[key]).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN"));
}

function d5DieSpecOptions() {
  return [
    { value: "", label: "全部规格" },
    ...DDR5_DIE_SPECS.map((value) => ({ value, label: value })),
  ];
}

function grainInfo(rowOrMapping) {
  const grainPartNumber = rowOrMapping.grainPartNumber || "";
  const pn = rowOrMapping.pn || rowOrMapping.grainPn || "";
  return DATA.grainCatalog.find((item) => grainPartNumber && item.grainPartNumber === grainPartNumber) ||
    DATA.grainCatalog.find((item) => pn && item.pn === pn) ||
    {
      brand: rowOrMapping.brand || "-",
      grade: rowOrMapping.grade || "-",
      density: rowOrMapping.density || "-",
      generation: rowOrMapping.generation || "-",
    };
}

function grainLabel(rowOrMapping) {
  const info = grainInfo(rowOrMapping);
  return [info.brand, info.grade, info.density].filter((value) => value && value !== "-").join(" / ") || "-";
}

function enrichedTests() {
  return DATA.tests.map((row) => ({ ...row, ...grainInfo(row) }));
}

function allRowsForSelection() {
  return enrichedTests().filter((row) => {
    return (IS_EMBED || !fields.grainPartNumber.value || row.grainPartNumber === fields.grainPartNumber.value) &&
      (!fields.grainPn.value || row.pn === fields.grainPn.value) &&
      (!fields.grainBrand.value || row.brand === fields.grainBrand.value) &&
      (!fields.grainGrade.value || row.grade === fields.grainGrade.value) &&
      (!fields.grainDensity.value || row.density === fields.grainDensity.value) &&
      (!fields.factory.value || row.factory === fields.factory.value) &&
      (!fields.status.value || row.status === fields.status.value);
  });
}

function mappingOptionLabel(mapping) {
  return `${mapping.modulePartNumber} / ${mapping.moduleSku}`;
}

function mappingRowsBySelection({ brand = "", grade = "", density = "", grainPn = "", grainPartNumber = "" } = {}) {
  return DATA.mappings.filter((mapping) => {
    return (!brand || mapping.brand === brand) &&
      (!grade || mapping.grade === grade) &&
      (!density || mapping.density === density) &&
      (!grainPn || mapping.grainPn === grainPn) &&
      (!grainPartNumber || mapping.grainPartNumber === grainPartNumber);
  });
}

function setMappedFieldOptions(field, records, key, selectedValue) {
  const values = unique(records, key);
  const options = values.map((value) => ({ value, label: value }));
  setOptions(field, options, values.includes(selectedValue) ? selectedValue : values[0] || "");
}

function refreshMappedGrainOptions() {
  const previous = {
    brand: fields.grainBrand.value,
    grade: fields.grainGrade.value,
    density: fields.grainDensity.value,
    grainPn: fields.grainPn.value,
    grainPartNumber: fields.grainPartNumber.value,
  };

  setMappedFieldOptions(fields.grainBrand, DATA.mappings, "brand", previous.brand);
  const brand = fields.grainBrand.value;

  setMappedFieldOptions(fields.grainGrade, mappingRowsBySelection({ brand }), "grade", previous.grade);
  const grade = fields.grainGrade.value;

  setMappedFieldOptions(fields.grainDensity, mappingRowsBySelection({ brand, grade }), "density", previous.density);
  const density = fields.grainDensity.value;

  setMappedFieldOptions(fields.grainPn, mappingRowsBySelection({ brand, grade, density }), "grainPn", previous.grainPn);
  const grainPn = fields.grainPn.value;

  setMappedFieldOptions(fields.grainPartNumber, mappingRowsBySelection({ brand, grade, density, grainPn }), "grainPartNumber", previous.grainPartNumber);
}

function activeMappingFromGrain() {
  const candidates = mappingRowsBySelection({
    brand: fields.grainBrand.value,
    grade: fields.grainGrade.value,
    density: fields.grainDensity.value,
    grainPn: fields.grainPn.value,
    grainPartNumber: fields.grainPartNumber.value,
  });
  return candidates.length === 1 ? candidates[0] : null;
}

function applyMapping(mapping) {
  if (!mapping) return;
  fields.grainPartNumber.value = mapping.grainPartNumber;
  fields.grainPn.value = mapping.grainPn;
  fields.grainBrand.value = mapping.brand || "";
  fields.grainGrade.value = mapping.grade || "";
  fields.grainDensity.value = mapping.density || "";
  fields.modulePartNumber.value = mapping.modulePartNumber;
  fields.diesPerModule.value = mapping.diesPerModule;
  fields.diesPerModule.readOnly = true;
  syncDependentOptions("mapping", true);
  if ([...fields.factory.options].some((item) => item.value === mapping.defaultFactory)) {
    fields.factory.value = mapping.defaultFactory;
  }
}

function syncMappedModuleFromGrain() {
  const mapping = activeMappingFromGrain();
  if (!mapping) {
    fields.modulePartNumber.value = "";
    fields.diesPerModule.readOnly = false;
    return;
  }
  applyMapping(mapping);
}

function syncFromModule() {
  const mapping = DATA.mappings.find((item) => item.modulePartNumber === fields.modulePartNumber.value);
  if (!mapping) return;
  setOptions(fields.grainPartNumber, [{ value: mapping.grainPartNumber, label: mapping.grainPartNumber }], mapping.grainPartNumber);
  setOptions(fields.grainPn, [{ value: mapping.grainPn, label: mapping.grainPn }], mapping.grainPn);
  setOptions(fields.grainBrand, [{ value: mapping.brand || "", label: mapping.brand || "-" }], mapping.brand || "");
  setOptions(fields.grainGrade, [{ value: mapping.grade || "", label: mapping.grade || "-" }], mapping.grade || "");
  setOptions(fields.grainDensity, [{ value: mapping.density || "", label: mapping.density || "-" }], mapping.density || "");
  [fields.grainPartNumber, fields.grainPn, fields.grainBrand, fields.grainGrade, fields.grainDensity].forEach((field) => {
    field.disabled = true;
  });
  fields.grainPartNumber.value = mapping.grainPartNumber;
  fields.grainPn.value = mapping.grainPn;
  fields.grainBrand.value = mapping.brand || "";
  fields.grainGrade.value = mapping.grade || "";
  fields.grainDensity.value = mapping.density || "";
  fields.diesPerModule.value = mapping.diesPerModule;
  syncDependentOptions("module", true);
  if ([...fields.factory.options].some((item) => item.value === mapping.defaultFactory)) {
    fields.factory.value = mapping.defaultFactory;
  }
}

function unlockGrainSelection() {
  [fields.grainPartNumber, fields.grainPn, fields.grainBrand, fields.grainGrade, fields.grainDensity].forEach((field) => {
    field.disabled = false;
  });
}

function mappingMatchesGrainSelection(mapping) {
  return (!fields.grainPartNumber.value || mapping.grainPartNumber === fields.grainPartNumber.value) &&
    (!fields.grainPn.value || mapping.grainPn === fields.grainPn.value) &&
    (!fields.grainBrand.value || mapping.brand === fields.grainBrand.value) &&
    (!fields.grainGrade.value || mapping.grade === fields.grainGrade.value) &&
    (!fields.grainDensity.value || mapping.density === fields.grainDensity.value);
}

function syncModuleFromGrainSelection() {
  if (IS_EMBED) {
    syncMappedModuleFromGrain();
    return;
  }
  const mapping = DATA.mappings.find(mappingMatchesGrainSelection);
  if (!mapping) {
    fields.modulePartNumber.value = "";
    return;
  }
  if (fields.modulePartNumber.value === mapping.modulePartNumber) return;
  fields.modulePartNumber.value = mapping.modulePartNumber;
  fields.diesPerModule.value = mapping.diesPerModule;
}

function notifyModuleSelection() {
  const message = {
    type: "sorting-module-selected",
    modulePartNumber: fields.modulePartNumber.value,
    grain: {
      grainPartNumber: fields.grainPartNumber.value,
      pn: fields.grainPn.value,
      brand: fields.grainBrand.value,
      grade: fields.grainGrade.value,
      density: fields.grainDensity.value,
      factory: fields.factory.value,
      status: fields.status.value,
      diesPerModule: Number(fields.diesPerModule.value) || null,
    },
    sorting: latestSortingMetrics,
  };
  const serialized = JSON.stringify(message);
  if (serialized === latestNotification) return;
  latestNotification = serialized;
  window.parent?.postMessage(message, "*");
}

function setSortingModule(modulePartNumber, shouldNotify = false) {
  if (!modulePartNumber || fields.modulePartNumber.value === modulePartNumber) return;
  const exists = DATA.mappings.some((item) => item.modulePartNumber === modulePartNumber);
  if (!exists) return;
  fields.modulePartNumber.value = modulePartNumber;
  syncFromModule();
  render();
  if (shouldNotify) notifyModuleSelection();
}

function syncDependentOptions(source = "", keepLockedGrain = false) {
  const grain = fields.grainPartNumber.value;
  const pn = fields.grainPn.value;
  let base = enrichedTests();

  if (source === "grain" && grain) {
    const matched = enrichedTests().find((row) => row.grainPartNumber === grain);
    if (matched) fields.grainPn.value = matched.pn;
  }
  if (source === "pn" && pn) {
    const matched = enrichedTests().find((row) => row.pn === pn && row.grainPartNumber);
    if (matched) fields.grainPartNumber.value = matched.grainPartNumber;
  }

  const current = {
    grainPartNumber: fields.grainPartNumber.value,
    pn: fields.grainPn.value,
    brand: fields.grainBrand.value,
    grade: fields.grainGrade.value,
    density: fields.grainDensity.value,
    factory: fields.factory.value,
    status: fields.status.value,
  };

  function filtered(except = "") {
    return base.filter((row) => {
      return (except === "grainPartNumber" || !current.grainPartNumber || row.grainPartNumber === current.grainPartNumber || row.pn === current.pn) &&
        (except === "pn" || !current.pn || row.pn === current.pn) &&
        (except === "brand" || !current.brand || row.brand === current.brand) &&
        (except === "grade" || !current.grade || row.grade === current.grade) &&
        (except === "density" || !current.density || row.density === current.density) &&
        (except === "factory" || !current.factory || row.factory === current.factory) &&
        (except === "status" || !current.status || row.status === current.status);
    });
  }

  if (!keepLockedGrain) {
    setOptions(fields.grainBrand, [{ value: "", label: "全部原厂" }, ...unique(filtered("brand"), "brand").map((value) => ({ value, label: value }))], current.brand);
    setOptions(fields.grainGrade, [{ value: "", label: "全部等级" }, ...unique(filtered("grade"), "grade").map((value) => ({ value, label: value }))], current.grade);
    setOptions(fields.grainDensity, d5DieSpecOptions(), current.density);
    setOptions(fields.grainPn, [{ value: "", label: "全部 PN" }, ...unique(filtered("pn"), "pn").map((value) => ({ value, label: value }))], current.pn);
  }
  const selectedRows = filtered();
  setOptions(fields.factory, [{ value: "", label: "全部测试厂" }, ...unique(filtered("factory"), "factory").map((value) => ({ value, label: value }))], current.factory);
  setOptions(fields.status, [{ value: "", label: "全部状态" }, ...unique(filtered("status"), "status").map((value) => ({ value, label: value }))], current.status);
}

function producible(row) {
  if (row.yieldRate === null || row.yieldRate === undefined) return null;
  return Math.round(row.incoming * row.yieldRate);
}

function groupBatches(rows) {
  const grouped = new Map();
  rows.forEach((row) => {
    const key = row.batchNo || `${row.factory}-${row.grainPartNumber || row.pn}-${row.incoming}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  });

  return [...grouped.entries()].map(([batchNo, batchRows]) => {
    const incoming = Math.max(...batchRows.map((row) => Number(row.incoming || 0)));
    const testedRows = batchRows.filter((row) => row.yieldRate !== null && row.yieldRate !== undefined);
    const rawGood = testedRows.reduce((sum, row) => sum + producible(row), 0);
    const totalGood = testedRows.length ? Math.min(rawGood, incoming) : null;
    const yieldRate = totalGood === null || incoming <= 0 ? null : totalGood / incoming;
    return {
      batchNo,
      incoming,
      rows: batchRows,
      totalGood,
      yieldRate,
      isMultiGrade: batchRows.length > 1,
      status: batchRows.every((row) => row.status === "已完成") ? "已完成" : batchRows[0].status,
    };
  }).sort((a, b) => b.incoming - a.incoming);
}

function moduleCostRecord(modulePartNumber) {
  const dimmData = window.DIMM_COST_DATA;
  if (!dimmData || !modulePartNumber) return null;
  return dimmData.summaryRecords.find((record) => record.partNumber === modulePartNumber) || null;
}

function nonDieBomCostUsd(modulePartNumber) {
  const dimmData = window.DIMM_COST_DATA;
  const record = moduleCostRecord(modulePartNumber);
  if (!dimmData || !record) return 0;
  return Number(record.bomCostRmb || 0) / Number(dimmData.exchangeRate || 1);
}

function mappingCatalogRows() {
  const rowsByKey = new Map();
  DATA.grainCatalog.forEach((item) => {
    const key = [item.brand, item.grade, item.density, item.pn].join("|");
    if (!rowsByKey.has(key)) {
      rowsByKey.set(key, {
        brand: item.brand,
        grade: item.grade,
        density: item.density,
        pn: item.pn,
        grainPartNumbers: [],
      });
    }
    rowsByKey.get(key).grainPartNumbers.push(item.grainPartNumber);
  });

  return [...rowsByKey.values()].map((row) => {
    const mapping = DATA.mappings.find((item) =>
      item.brand === row.brand &&
      item.grade === row.grade &&
      item.density === row.density &&
      item.grainPn === row.pn
    );
    const testCount = DATA.tests.filter((item) => item.pn === row.pn).length;
    return {
      ...row,
      mapping,
      testCount,
    };
  }).sort((a, b) => {
    if (!!b.mapping !== !!a.mapping) return Number(!!b.mapping) - Number(!!a.mapping);
    return `${a.brand}${a.grade}${a.density}${a.pn}`.localeCompare(`${b.brand}${b.grade}${b.density}${b.pn}`, "zh-Hans-CN");
  });
}

function renderMappingRows() {
  if (!outputs.mappingRows || !outputs.mappingSummary) return;
  const rows = mappingCatalogRows();
  const mappedCount = rows.filter((row) => row.mapping).length;
  outputs.mappingSummary.textContent = `全部 ${rows.length} 个颗粒 PN / 已映射 ${mappedCount} 个 / 待添加 ${rows.length - mappedCount} 个`;
  outputs.mappingRows.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.brand}</td>
      <td>${row.grade}</td>
      <td>${row.density}</td>
      <td>${row.pn}</td>
      <td>${row.grainPartNumbers.join(" / ")}</td>
      <td>${row.mapping ? row.mapping.modulePartNumber : '<span class="muted">待添加映射</span>'}</td>
      <td class="num">${row.mapping ? row.mapping.diesPerModule : "-"}</td>
      <td>${row.mapping ? '<span class="badge badge-good">已映射</span>' : '<span class="badge badge-warn">待添加</span>'}</td>
      <td class="num">${fmt(row.testCount)}</td>
    </tr>
  `).join("");
}

function renderRuleRows() {
  if (!outputs.ruleRows) return;
  const rules = DATA.manufacturerRules || [];
  outputs.ruleRows.innerHTML = rules.flatMap((manufacturer) =>
    manufacturer.gradeRules.map((rule) => `
      <tr>
        <td>${manufacturer.manufacturer}<br><span class="muted">${(manufacturer.aliases || []).join(" / ")}</span></td>
        <td>${rule.grade}</td>
        <td>${(rule.patterns || []).join(" / ")}</td>
        <td>${rule.meaning}</td>
      </tr>
    `)
  ).join("");
}

function render() {
  const rows = allRowsForSelection();
  const batches = groupBatches(rows);
  const diesPerModule = Math.max(1, Number(fields.diesPerModule.value) || 1);
  const batchesWithData = batches.filter((batch) => batch.totalGood !== null);
  const totalIncoming = batchesWithData.reduce((sum, batch) => sum + batch.incoming, 0);
  const totalGood = batchesWithData.reduce((sum, batch) => sum + batch.totalGood, 0);
  const overallYield = totalIncoming > 0 ? totalGood / totalIncoming : null;
  const moduleQuantity = Math.floor(totalGood / diesPerModule);
  const multiCount = batches.filter((batch) => batch.isMultiGrade).length;
  const selectedText = [
    fields.grainBrand.value,
    fields.grainGrade.value,
    fields.grainDensity.value,
    fields.grainPn.value,
    fields.factory.value,
  ].filter(Boolean).join(" / ") || "全部";
  const mapping = DATA.mappings.find((item) => item.modulePartNumber === fields.modulePartNumber.value);
  const selectedProfile = [fields.grainBrand.value, fields.grainGrade.value, fields.grainDensity.value].filter(Boolean).join(" / ") || "全部品牌 / 全部等级 / 全部规格";
  const grainUnitPrice = Math.max(0, Number(fields.grainUnitPrice.value) || 0);
  const sortingTestFee = Math.max(0, Number(fields.sortingTestFee.value) || 0);
  const assemblyCost = Math.max(0, Number(fields.assemblyCost.value) || 0);
  const moduleBomCost = nonDieBomCostUsd(fields.modulePartNumber.value);
  const yieldedGrainCost = overallYield ? (grainUnitPrice * diesPerModule) / overallYield : null;
  const yieldedTestCost = overallYield ? (sortingTestFee * diesPerModule) / overallYield : null;
  const sortingActualCost = yieldedGrainCost === null || yieldedTestCost === null ? null : yieldedGrainCost + yieldedTestCost + moduleBomCost + assemblyCost;
  const totalSortingCost = sortingActualCost === null ? null : sortingActualCost * moduleQuantity;
  latestSortingMetrics = {
    totalIncoming,
    totalGood,
    overallYield,
    moduleQuantity,
    batchCount: batches.length,
    diesPerModule,
    grainUnitPrice,
    sortingTestFee,
    assemblyCost,
    yieldedGrainCost,
    yieldedTestCost,
    moduleBomCost,
    sortingActualCost,
    totalSortingCost,
  };

  outputs.currentScheme.textContent = selectedText;
  outputs.totalGoodDies.textContent = fmt(totalGood);
  outputs.overallYield.innerHTML = badge(overallYield);
  outputs.totalIncoming.textContent = fmt(totalIncoming);
  outputs.moduleQuantity.textContent = fmt(moduleQuantity);
  outputs.batchCount.textContent = fmt(batches.length);
  outputs.doneBatchCount.textContent = fmt(batches.filter((batch) => batch.status === "已完成").length);
  outputs.multiBatchCount.textContent = fmt(multiCount);
  outputs.detailNote.textContent = `${rows.length} 条测试记录`;
  outputs.yieldedGrainCost.textContent = usd(yieldedGrainCost);
  outputs.yieldedTestCost.textContent = usd(yieldedTestCost);
  outputs.moduleBomCost.textContent = usd(moduleBomCost);
  outputs.assemblyCostOut.textContent = usd(assemblyCost);
  outputs.sortingActualCost.textContent = usd(sortingActualCost);
  outputs.totalSortingCost.textContent = usd(totalSortingCost);

  outputs.batchRows.innerHTML = batches.length ? batches.map((batch, index) => `
    <tr>
      <td>${batch.batchNo || `批次${index + 1}`}${batch.isMultiGrade ? " / 降频梯级" : ""}</td>
      <td>${grainLabel(batch.rows[0])}</td>
      <td class="num">${fmt(batch.incoming)}</td>
      <td>${badge(batch.yieldRate)}</td>
      <td class="num">${fmt(batch.totalGood)}</td>
      <td class="num">${fmt(batch.totalGood === null ? null : Math.floor(batch.totalGood / diesPerModule))}</td>
      <td>${badge(batch.status, "status")}</td>
    </tr>
  `).join("") : `<tr><td colspan="7">暂无匹配批次</td></tr>`;

  outputs.testRows.innerHTML = rows.length ? rows.map((row) => `
    <tr>
      <td>${row.factory}</td>
      <td>${grainLabel(row)}</td>
      <td><div class="scheme">${row.scheme}<br><span class="muted">${row.batchNo || ""}</span></div></td>
      <td>${badge(row.yieldRate)}</td>
      <td class="num">${fmt(producible(row))}</td>
      <td>${badge(row.status, "status")}</td>
    </tr>
  `).join("") : `<tr><td colspan="6">暂无匹配测试记录</td></tr>`;

  renderMappingRows();
  renderRuleRows();
  notifyModuleSelection();
}

function init() {
  const tests = enrichedTests();
  if (IS_EMBED) {
    setOptions(fields.grainPartNumber, [{ value: "", label: "全部内部颗粒料号" }, ...unique(tests, "grainPartNumber").map((value) => ({ value, label: value }))]);
    setOptions(fields.grainPn, [{ value: "", label: "全部 PN" }, ...unique(tests, "pn").map((value) => ({ value, label: value }))]);
    setOptions(fields.grainBrand, [{ value: "", label: "全部品牌" }, ...unique(tests, "brand").map((value) => ({ value, label: value }))]);
    setOptions(fields.grainGrade, [{ value: "", label: "全部等级" }, ...unique(tests, "grade").map((value) => ({ value, label: value }))]);
    setOptions(fields.grainDensity, d5DieSpecOptions());
    setOptions(fields.modulePartNumber, [{ value: "", label: "未建立成品映射" }, ...DATA.mappings.map((item) => ({ value: item.modulePartNumber, label: mappingOptionLabel(item) }))]);
    fields.modulePartNumber.disabled = true;
    fields.diesPerModule.readOnly = false;
    syncDependentOptions();
  } else {
    setOptions(fields.grainPartNumber, [{ value: "", label: "全部内部颗粒料号" }, ...unique(tests, "grainPartNumber").map((value) => ({ value, label: value }))]);
    setOptions(fields.grainPn, [{ value: "", label: "全部 PN" }, ...unique(tests, "pn").map((value) => ({ value, label: value }))]);
    setOptions(fields.grainBrand, [{ value: "", label: "全部品牌" }, ...unique(tests, "brand").map((value) => ({ value, label: value }))]);
    setOptions(fields.grainGrade, [{ value: "", label: "全部等级" }, ...unique(tests, "grade").map((value) => ({ value, label: value }))]);
    setOptions(fields.grainDensity, d5DieSpecOptions());
    setOptions(fields.modulePartNumber, [{ value: "", label: "不绑定内部成品料号" }, ...DATA.mappings.map((item) => ({ value: item.modulePartNumber, label: mappingOptionLabel(item) }))]);
    syncDependentOptions();
  }

  fields.grainPartNumber.addEventListener("change", () => {
    if (IS_EMBED) syncMappedModuleFromGrain();
    else syncDependentOptions("grain");
    syncModuleFromGrainSelection();
    render();
    notifyModuleSelection();
  });
  fields.grainPn.addEventListener("change", () => {
    if (IS_EMBED) syncMappedModuleFromGrain();
    else syncDependentOptions("pn");
    syncModuleFromGrainSelection();
    render();
    notifyModuleSelection();
  });
  fields.modulePartNumber.addEventListener("change", () => {
    if (fields.modulePartNumber.value) {
      syncFromModule();
    } else {
      unlockGrainSelection();
      syncDependentOptions();
    }
    render();
    notifyModuleSelection();
  });
  [
    fields.factory,
    fields.status,
    fields.diesPerModule,
    fields.grainUnitPrice,
    fields.sortingTestFee,
    fields.assemblyCost,
  ].forEach((field) => field.addEventListener("input", () => {
    render();
  }));

  [fields.grainBrand, fields.grainGrade, fields.grainDensity].forEach((field) => {
    field.addEventListener("change", () => {
      syncDependentOptions();
      syncModuleFromGrainSelection();
      render();
      notifyModuleSelection();
    });
  });

  const defaultMapping = DATA.mappings[0];
  if (IS_EMBED) {
    fields.modulePartNumber.value = "";
  } else {
    fields.modulePartNumber.value = defaultMapping.modulePartNumber;
    syncFromModule();
  }
  render();
  notifyModuleSelection();
}

window.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "request-sorting-selection") {
    notifyModuleSelection();
    return;
  }
  if (message.type !== "set-sorting-module") return;
  setSortingModule(message.modulePartNumber, false);
});

init();
