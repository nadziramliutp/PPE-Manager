// Session helpers
const Session = {
  setWorker() { localStorage.setItem('ppe_role', 'worker'); },
  setHse() { localStorage.setItem('ppe_role', 'hse'); },
  getRole() { return localStorage.getItem('ppe_role'); },
  isWorker() { return this.getRole() === 'worker'; },
  isHse() { return this.getRole() === 'hse'; },
  clear() { localStorage.removeItem('ppe_role'); },

  
  requireWorker() {
    return true;
  },
  
  requireHse() {
    if (!this.isHse()) { window.location.href = '/pin.html?for=hse'; return false; }
    return true;
  }
};

// API helpers
const API = {
  async post(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  async get(path) {
    const res = await fetch(path);
    return res.json();
  }
};

// Toast notification
function showToast(msg, duration = 2500) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// Tab system
function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const btns = container.querySelectorAll('.tab-btn');
  const panels = container.querySelectorAll('.tab-panel');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = container.querySelector(`#${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });
}

// PIN input system
function initPinInputs(onComplete) {
  const inputs = document.querySelectorAll('.pin-input');
  const dots = document.querySelectorAll('.pin-dot');

  inputs[0]?.focus();

  inputs.forEach((inp, i) => {
    inp.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g, '');
      inp.value = val.slice(-1);
      updateDots();
      if (val && i < inputs.length - 1) inputs[i + 1].focus();
      if (val && i === inputs.length - 1) {
        const pin = Array.from(inputs).map(x => x.value).join('');
        if (pin.length === 4) onComplete(pin);
      }
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
    });
  });

  function updateDots() {
    inputs.forEach((inp, i) => {
      dots[i]?.classList.toggle('filled', !!inp.value);
    });
  }

  return {
    clear() {
      inputs.forEach(x => x.value = '');
      updateDots();
      inputs[0]?.focus();
    },
    shake() {
      const wrap = document.querySelector('.pin-inputs');
      wrap?.classList.add('shake');
      setTimeout(() => wrap?.classList.remove('shake'), 400);
    }
  };
}

// Format date
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
}
