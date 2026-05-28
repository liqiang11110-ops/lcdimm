(function () {
  const LINKED_SELECTION_KEY = 'lcdimm-linked-selection';
  const page = document.documentElement.dataset.toolPage;
  const frame = document.querySelector('[data-linked-tool-frame]');

  if (!page || !frame) return;

  function readSelection() {
    try {
      return JSON.parse(localStorage.getItem(LINKED_SELECTION_KEY) || 'null');
    } catch (error) {
      localStorage.removeItem(LINKED_SELECTION_KEY);
      return null;
    }
  }

  function sendSelectionToFrame() {
    if (page === 'grain') return;
    const selection = readSelection();
    if (!selection?.modulePartNumber) return;
    const type = page === 'cost' ? 'set-cost-part-number' : 'set-sorting-module';
    frame.contentWindow?.postMessage({
      type,
      modulePartNumber: selection.modulePartNumber,
    }, '*');
  }

  function saveLinkedMessage(message) {
    const grain = message.grain || null;
    const hasGrain = Boolean(grain?.brand || grain?.grade || grain?.density || grain?.pn || grain?.grainPartNumber);
    if (message.type === 'sorting-module-selected' && !message.modulePartNumber && !hasGrain) return;
    const previous = readSelection() || {};
    localStorage.setItem(LINKED_SELECTION_KEY, JSON.stringify({
      ...previous,
      source: message.type === 'sorting-module-selected' ? 'grain-test' : (previous.source || page),
      updatedAt: new Date().toISOString(),
      modulePartNumber: message.modulePartNumber || previous.modulePartNumber || '',
      grain: grain || previous.grain || null,
    }));
  }

  frame.addEventListener('load', () => {
    sendSelectionToFrame();
    window.setTimeout(sendSelectionToFrame, 120);
  });

  window.addEventListener('message', (event) => {
    const message = event.data || {};
    if (message.type !== 'sorting-module-selected' && message.type !== 'cost-module-selected') return;
    saveLinkedMessage(message);
  });
})();
