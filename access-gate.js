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
    const rotate = (value, amount) => (value >>> amount) | (value << (32 - amount));
    const k = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;
    const bytes = Array.from(unescape(encodeURIComponent(text)), (char) => char.charCodeAt(0));
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i -= 1) bytes.push((bitLength / Math.pow(256, i)) & 255);
    for (let offset = 0; offset < bytes.length; offset += 64) {
      const w = new Array(64);
      for (let i = 0; i < 16; i += 1) {
        const j = offset + i * 4;
        w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
      }
      for (let i = 16; i < 64; i += 1) {
        const s0 = rotate(w[i - 15], 7) ^ rotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rotate(w[i - 2], 17) ^ rotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let i = 0; i < 64; i += 1) {
        const s1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
        const ch = (e & f) ^ ((~e) & g);
        const temp1 = (h + s1 + ch + k[i] + w[i]) >>> 0;
        const s0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (s0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }
    return [h0,h1,h2,h3,h4,h5,h6,h7].map((value) => value.toString(16).padStart(8, '0')).join('');
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
