/* ═══════════════════════════════════════════════════════════════
   auth.js — Password gate for Momentum
═══════════════════════════════════════════════════════════════ */

(function () {
  const AUTH_KEY  = 'momentum_auth';
  const AUTH_VAL  = 'granted_v1';
  // Simple hash: sum of (charCode * position) — not cryptographic,
  // just enough to avoid storing the plaintext in localStorage.
  const PWD_HASH  = 434; // hash of "Monkey5642!"

  function hashPwd(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h += s.charCodeAt(i) * (i + 1);
    return h % 1000;
  }

  function isAuthed() {
    return localStorage.getItem(AUTH_KEY) === AUTH_VAL;
  }

  // If already authenticated, unhide page and exit
  if (isAuthed()) {
    document.documentElement.style.visibility = 'visible';
    return;
  }

  // Hide page until auth resolves
  document.documentElement.style.visibility = 'hidden';

  function showLogin() {
    document.documentElement.style.visibility = 'visible';

    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.innerHTML = `
      <div class="auth-box">
        <div class="auth-logo">◆ Momentum</div>
        <div class="auth-tagline">Your personal productivity hub</div>
        <div class="auth-field-wrap">
          <input
            type="password"
            id="auth-pwd-input"
            class="auth-input"
            placeholder="Enter password"
            autocomplete="current-password"
            autofocus
          />
          <button class="auth-btn" id="auth-submit-btn">Unlock</button>
        </div>
        <div class="auth-error" id="auth-error"></div>
      </div>`;

    // Inline styles so auth works before style.css loads
    const style = document.createElement('style');
    style.textContent = `
      #auth-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: #07070b;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Sans', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .auth-box {
        display: flex; flex-direction: column; align-items: center;
        gap: 10px; padding: 48px 40px; width: 100%; max-width: 380px;
      }
      .auth-logo {
        font-size: 1.4rem; font-weight: 700; color: #7c6af7;
        letter-spacing: -0.5px; margin-bottom: 4px;
      }
      .auth-tagline {
        font-size: 0.82rem; color: #4a4a62; margin-bottom: 18px;
      }
      .auth-field-wrap {
        width: 100%; display: flex; flex-direction: column; gap: 10px;
      }
      .auth-input {
        width: 100%; padding: 12px 16px;
        background: #111119; border: 1px solid #252534;
        border-radius: 8px; color: #e5e5f0;
        font-family: inherit; font-size: 0.95rem; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        -webkit-appearance: none; text-align: center; letter-spacing: 2px;
      }
      .auth-input:focus {
        border-color: #7c6af7;
        box-shadow: 0 0 0 3px rgba(124,106,247,0.14);
      }
      .auth-input.shake {
        animation: auth-shake 0.35s ease;
        border-color: #f87171;
        box-shadow: 0 0 0 3px rgba(248,113,113,0.14);
      }
      .auth-btn {
        width: 100%; padding: 12px;
        background: linear-gradient(135deg, #7c6af7 0%, #6350d4 100%);
        color: #fff; border: none; border-radius: 8px;
        font-family: inherit; font-size: 0.88rem; font-weight: 600;
        cursor: pointer; letter-spacing: 0.3px;
        box-shadow: 0 2px 12px rgba(124,106,247,0.3);
        transition: box-shadow 0.15s, transform 0.1s;
      }
      .auth-btn:hover {
        box-shadow: 0 4px 20px rgba(124,106,247,0.45);
        transform: translateY(-1px);
      }
      .auth-btn:active { transform: translateY(0); }
      .auth-error {
        font-size: 0.78rem; color: #f87171; min-height: 18px;
        margin-top: 4px; text-align: center;
      }
      @keyframes auth-shake {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-7px); }
        40%       { transform: translateX(7px); }
        60%       { transform: translateX(-5px); }
        80%       { transform: translateX(4px); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const input  = document.getElementById('auth-pwd-input');
    const btn    = document.getElementById('auth-submit-btn');
    const errEl  = document.getElementById('auth-error');

    function attempt() {
      const val = input.value;
      if (hashPwd(val) === PWD_HASH) {
        localStorage.setItem(AUTH_KEY, AUTH_VAL);
        overlay.style.transition = 'opacity 0.3s';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      } else {
        errEl.textContent = 'Incorrect password — try again.';
        input.classList.add('shake');
        input.value = '';
        setTimeout(() => {
          input.classList.remove('shake');
          errEl.textContent = '';
        }, 1200);
        input.focus();
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
  }

  if (document.body) {
    showLogin();
  } else {
    document.addEventListener('DOMContentLoaded', showLogin);
  }
})();
