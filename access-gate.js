(function () {
  const passwordHash = 'b4ed4e9154ca34ddcc0356d330072f9057614a4d4fe9f2cefdb0f20d2f189b5d';
  const accessKey = 'ddr5_site_access';
  const adminKey = 'ddr5_admin_password';

  function sha256(text) {
    if (!crypto?.subtle) return Promise.resolve(sha256Fallback(text));
    const encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(text)).then((buffer) => (
      Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
    ));
  }

  function sha256Fallback(text) {
    const rightRotate = (value, amount) => (value >>> amount) | (value << (32 - amount));
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const words = [];
    const ascii = unescape(encodeURIComponent(text));
    let hash = sha256Fallback.h || [];
    let k = sha256Fallback.k || [];
    let primeCounter = k.length;
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate += 1) {
      if (!isComposite[candidate]) {
        for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        primeCounter += 1;
      }
    }
    sha256Fallback.h = hash;
    sha256Fallback.k = k;
    let bitLength = ascii.length * 8;
    for (let i = 0; i < ascii.length; i += 1) words[i >> 2] |= ascii.charCodeAt(i) << ((3 - i) % 4) * 8;
    words[bitLength >> 5] |= 0x80 << (24 - bitLength % 32);
    words[(((bitLength + 64) >> 9) << 4) + 15] = bitLength;
    for (let j = 0; j < words.length; j += 16) {
      const w = words.slice(j, j + 16);
      const oldHash = hash.slice(0);
      for (let i = 0; i < 64; i += 1) {
        const w15 = w[i - 15];
        const w2 = w[i - 2];
        const a = hash[0];
        const e = hash[4];
        const temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = i < 16 ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0);
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (let i = 0; i < 8; i += 1) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    return hash.slice(0, 8).map((value) => {
      let hex = '';
      for (let i = 3; i + 1; i -= 1) {
        const byte = (value >> (i * 8)) & 255;
        hex += (byte < 16 ? '0' : '') + byte.toString(16);
      }
      return hex;
    }).join('');
  }

  function injectStyle() {
    if (document.querySelector('#accessGateStyle')) return;
    const style = document.createElement('style');
    style.id = 'accessGateStyle';
    style.textContent = `
      .access-gate-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:linear-gradient(135deg,#1f4e79,#2e75b6);font-family:"Microsoft YaHei","PingFang SC",system-ui,sans-serif;color:#1f2937}
      .access-gate-card{width:min(420px,calc(100vw - 32px));background:#fff;border-radius:12px;padding:24px;box-shadow:0 22px 70px rgba(15,23,42,.28);display:grid;gap:14px}
      .access-gate-card h1{margin:0;color:#1f4e79;font-size:22px}
      .access-gate-card p{margin:0;color:#64748b;font-size:13px;line-height:1.6}
      .access-gate-card label{display:grid;gap:6px;font-weight:800;color:#475569;font-size:13px}
      .access-gate-card input{min-height:44px;border:1px solid #cbd5e1;border-radius:8px;padding:0 12px;font:inherit}
      .access-gate-card button{min-height:44px;border:0;border-radius:8px;background:#1f4e79;color:#fff;font:inherit;font-weight:800;cursor:pointer}
      .access-gate-card button:hover{background:#173b5c}
      .access-gate-error{min-height:18px;color:#b42318;font-size:13px;font-weight:800}
    `;
    document.head.appendChild(style);
  }

  function showGate(resolve) {
    injectStyle();
    const overlay = document.createElement('div');
    overlay.className = 'access-gate-overlay';
    overlay.innerHTML = `
      <form class="access-gate-card">
        <h1>DDR5 成本网站</h1>
        <p>请输入访问密码。通过后本次浏览器会话内无需重复输入。</p>
        <label>访问密码<input type="password" autocomplete="current-password" autofocus></label>
        <button type="submit">进入</button>
        <div class="access-gate-error" aria-live="polite"></div>
      </form>
    `;
    document.body.appendChild(overlay);
    const form = overlay.querySelector('form');
    const input = overlay.querySelector('input');
    const error = overlay.querySelector('.access-gate-error');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const password = input.value.trim();
      if (!password) return;
      const digest = await sha256(password);
      if (digest !== passwordHash) {
        error.textContent = '密码不正确';
        input.select();
        return;
      }
      sessionStorage.setItem(accessKey, password);
      sessionStorage.setItem(adminKey, password);
      overlay.remove();
      resolve(password);
    });
    setTimeout(() => input.focus(), 0);
  }

  window.__DDR5_ACCESS_READY = new Promise(async (resolve) => {
    const saved = sessionStorage.getItem(accessKey) || sessionStorage.getItem(adminKey) || '';
    if (saved && await sha256(saved) === passwordHash) {
      sessionStorage.setItem(accessKey, saved);
      sessionStorage.setItem(adminKey, saved);
      resolve(saved);
      return;
    }
    sessionStorage.removeItem(accessKey);
    showGate(resolve);
  });
})();
