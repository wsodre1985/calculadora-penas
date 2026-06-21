/* ==========================================================================
   APP CONFIG & STATE MANAGEMENT
   ========================================================================== */

let currentFocus = 'anos'; // 'anos', 'meses', 'dias', or 'multa'
let theme = localStorage.getItem('theme') || 'dark';

// Penalty calculation values
let acumDias = 0;
let acumLog = [];
let opPending = null;
let opBase = 0;
let multaAcum = 0;
let multaOpBase = 0;
let customCount = 0;
let _perAMD = null;

const extraSelected = new Map();

// UI Elements
const displayBoxes = {
  anos: document.getElementById('disp-anos'),
  meses: document.getElementById('disp-meses'),
  dias: document.getElementById('disp-dias'),
  multa: document.getElementById('disp-multa')
};

// Initialize Application Settings
document.addEventListener('DOMContentLoaded', () => {
  // Theme Setup
  setTheme(theme);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Tab Setup
  initTabs();

  // Virtual Keypad Setup
  initKeypad();

  // Focus Handling
  initFocusHandlers();

  // Criteria (Fractions/Percentages) Setup
  initCriteria();

  // Clock Setup
  initClock();

  // Períodos: semeia um intervalo inicial (preso → solto)
  initPeriodos();

  // Real Keyboard Support
  document.addEventListener('keydown', handlePhysicalKeyboard);
  
  // Set initial focus
  setFoco('anos');
  recalc();
  calcPenaBase();
});

/* ==========================================================================
   THEMING & UTILITIES
   ========================================================================== */

function setTheme(newTheme) {
  document.documentElement.setAttribute('data-theme', newTheme);
  theme = newTheme;
  localStorage.setItem('theme', newTheme);
  
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  const themeText = document.querySelector('.sidebar-footer span');
  
  if (theme === 'dark') {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
    themeText.textContent = 'Tema Escuro';
  } else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
    themeText.textContent = 'Tema Claro';
  }
}

function toggleTheme() {
  setTheme(theme === 'dark' ? 'light' : 'dark');
  showToast(`Tema ${theme === 'dark' ? 'Escuro' : 'Claro'} ativado!`, 'success');
}

function initClock() {
  const clockEl = document.getElementById('time-display');
  const updateClock = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('pt-BR');
  };
  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */

function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.setProperty('--toast-duration', `${duration}ms`);
  
  // Choose icon based on type
  let iconSVG = '';
  if (type === 'success') {
    iconSVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }
  
  toast.innerHTML = `
    <span class="toast-icon">${iconSVG}</span>
    <span class="toast-text">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Remove toast from DOM after duration
  setTimeout(() => {
    toast.remove();
  }, duration + 300);
}

/* ==========================================================================
   TAB NAVIGATION SYSTEM
   ========================================================================== */

function initTabs() {
  const menuItems = document.querySelectorAll('.menu-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      
      // Update menu items active state
      menuItems.forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');

      // Show/Hide Tab Panes
      tabPanes.forEach(pane => {
        if (pane.id === targetTab) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });
}

/* ==========================================================================
   LEP ARITHMETIC CONVENTIONS (1 year = 360 days, 1 month = 30 days)
   ========================================================================== */

function toDias(a, m, d) {
  return a * 360 + m * 30 + d;
}

function toAMD(t) {
  t = Math.max(0, Math.floor(t));
  const a = Math.floor(t / 360);
  const r = t - a * 360;
  const m = Math.floor(r / 30);
  const d = r - m * 30;
  return { a, m, d };
}

function fmt(a, m, d) {
  const parts = [];
  if (a) parts.push(a + (a === 1 ? ' ano' : ' anos'));
  if (m) parts.push(m + (m === 1 ? ' mês' : ' meses'));
  if (d) parts.push(d + (d === 1 ? ' dia' : ' dias'));
  return parts.length ? parts.join(', ') : '0 dias';
}

const NUMS = ['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez',
  'onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove','vinte',
  'vinte e um','vinte e dois','vinte e três','vinte e quatro','vinte e cinco','vinte e seis',
  'vinte e sete','vinte e oito','vinte e nove','trinta'];
const DEZENAS = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
const CENTENAS = ['','cem','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];

function porExtenso(n) {
  n = Math.floor(n);
  if (n <= 30) return NUMS[n];
  if (n < 100) {
    const d = Math.floor(n / 10), u = n % 10;
    return u === 0 ? DEZENAS[d] : DEZENAS[d] + ' e ' + NUMS[u];
  }
  if (n === 100) return 'cem';
  if (n < 200) {
    const r = n - 100;
    return r === 0 ? 'cem' : 'cento e ' + porExtenso(r);
  }
  if (n < 1000) {
    const c = Math.floor(n / 100), r = n % 100;
    return r === 0 ? CENTENAS[c] : CENTENAS[c] + ' e ' + porExtenso(r);
  }
  if (n < 2000) {
    const r = n - 1000;
    return r === 0 ? 'mil' : 'mil e ' + porExtenso(r);
  }
  if (n < 1000000) {
    const m = Math.floor(n / 1000), r = n % 1000;
    return r === 0 ? porExtenso(m) + ' mil' : porExtenso(m) + ' mil e ' + porExtenso(r);
  }
  return n + '';
}

function fmtRedacao(a, m, d) {
  const p = [];
  if (a) p.push(String(a).padStart(2, '0') + ' (' + porExtenso(a) + ') ' + (a === 1 ? 'ano' : 'anos'));
  if (m) p.push(String(m).padStart(2, '0') + ' (' + porExtenso(m) + ') ' + (m === 1 ? 'mês' : 'meses'));
  if (d) p.push(String(d).padStart(2, '0') + ' (' + porExtenso(d) + ') ' + (d === 1 ? 'dia' : 'dias'));
  if (!p.length) return '';
  if (p.length === 1) return p[0];
  return p.slice(0, -1).join(', ') + ' e ' + p[p.length - 1];
}

function addD(str, n) {
  const x = new Date(str + 'T12:00:00');
  x.setDate(x.getDate() + n);
  return x;
}

function fmtD(d) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function sit(da) {
  const h = new Date(); h.setHours(0, 0, 0, 0);
  const x = new Date(da); x.setHours(0, 0, 0, 0);
  if (x < h) return 'passado';
  if (x.getTime() === h.getTime()) return 'hoje';
  return 'futuro';
}

/* ==========================================================================
   DISPLAY FOCUS MANAGEMENT & INPUTS
   ========================================================================== */

function initFocusHandlers() {
  const containers = document.querySelectorAll('.display-box');
  containers.forEach(box => {
    box.addEventListener('click', () => {
      // Extract target field from child input ID
      const input = box.querySelector('input');
      const fieldName = input.id.replace('disp-', '');
      setFoco(fieldName);
    });
  });
}

function setFoco(campo) {
  currentFocus = campo;
  
  // Toggle active class on UI elements
  Object.keys(displayBoxes).forEach(key => {
    const boxContainer = displayBoxes[key].closest('.display-box');
    if (key === campo) {
      boxContainer.classList.add('active-field');
    } else {
      boxContainer.classList.remove('active-field');
    }
  });
}

function getDisp(c) {
  return parseInt(document.getElementById('disp-' + c).value) || 0;
}

function setDisp(c, v) {
  document.getElementById('disp-' + c).value = v;
}

function getPena() {
  return { anos: getDisp('anos'), meses: getDisp('meses'), dias: getDisp('dias') };
}

function setPena(a, m, d) {
  setDisp('anos', a);
  setDisp('meses', m);
  setDisp('dias', d);
}

function getMulta() {
  return parseInt(document.getElementById('disp-multa').value) || 0;
}

/* ==========================================================================
   KEYPAD LOGIC (Virtual & Physical)
   ========================================================================== */

function initKeypad() {
  const kp = document.getElementById('keypad');
  kp.innerHTML = ''; // Clear original list if any
  
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '⌫'];
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.className = `keypad-btn ${k === '⌫' ? 'backspace' : ''}`;
    btn.innerHTML = k === '⌫' ? `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
        <line x1="18" y1="9" x2="12" y2="15"></line>
        <line x1="12" y1="9" x2="18" y2="15"></line>
      </svg>
    ` : k;
    btn.onclick = () => pressKey(k === '⌫' ? 'del' : String(k));
    kp.appendChild(btn);
  });
}

function pressKey(k) {
  const el = displayBoxes[currentFocus];
  if (!el) return;
  
  if (k === 'del') {
    el.value = Math.floor((parseInt(el.value) || 0) / 10);
  } else {
    const cur = parseInt(el.value) || 0;
    const combinedStr = '' + cur + k;
    
    // Prevent oversized numbers (limit penalty size values or fine digits)
    if (combinedStr.length > 5) return;
    el.value = parseInt(combinedStr) || 0;
  }
  
  el.dispatchEvent(new Event('input'));
  recalc();
}

function handlePhysicalKeyboard(e) {
  // Check if user is inside normal text/number form inputs (not base displays)
  if (e.target.tagName === 'INPUT' && e.target.type !== 'text') return;
  if (e.target.id === 'm-pct' || e.target.id === 'm-num' || e.target.id === 'm-den' || e.target.id === 'm-label') return;

  if (e.key >= '0' && e.key <= '9') {
    pressKey(e.key);
  } else if (e.key === 'Backspace') {
    pressKey('del');
  } else if (e.key === '+') {
    opAcum('+');
  } else if (e.key === '-' || e.key === '−') {
    opAcum('−');
  } else if (e.key === 'Enter' || e.key === '=') {
    opIgual();
  } else if (e.key === 'Escape') {
    clearAll();
  }
}

/* ==========================================================================
   PENALTY MATH OPERATIONS (Accumulator)
   ========================================================================== */

function opAcum(op) {
  const p = getPena();
  const dias = toDias(p.anos, p.meses, p.dias);
  if (!dias) {
    showToast('Informe o valor da pena primeiro!', 'error');
    return;
  }

  const multa = getMulta();

  if (acumLog.length === 0) {
    acumDias = dias;
    multaAcum = multa;
    acumLog.push(fmt(p.anos, p.meses, p.dias));
  } else if (opPending !== null) {
    acumDias += ((opPending === '+') ? 1 : -1) * dias;
    multaAcum += ((opPending === '+') ? 1 : -1) * multa;
    acumLog.push(opPending + ' ' + fmt(p.anos, p.meses, p.dias));
  }

  opPending = op;
  opBase = dias;
  multaOpBase = multa;
  setPena(0, 0, 0);
  displayBoxes.multa.value = 0;
  
  atualizarAcumBar('← Selecione fração ou digite valor e aperte "="');
}

function opIgual() {
  const p = getPena();
  const dias = toDias(p.anos, p.meses, p.dias);
  const multa = getMulta();

  if (opPending !== null) {
    if (!dias) {
      showToast('Digite um valor ou selecione uma fração!', 'error');
      return;
    }
    acumDias += ((opPending === '+') ? 1 : -1) * dias;
    multaAcum += ((opPending === '+') ? 1 : -1) * multa;
    acumLog.push(opPending + ' ' + fmt(p.anos, p.meses, p.dias));
    opPending = null;
    opBase = 0;
    multaOpBase = 0;
  } else {
    if (!dias && acumLog.length === 0) {
      showToast('Informe uma pena base para calcular.', 'error');
      return;
    }
    if (dias) {
      acumDias += dias;
      multaAcum += multa;
      acumLog.push(fmt(p.anos, p.meses, p.dias));
    }
  }

  if (acumDias <= 0) {
    showToast('Resultado zerado ou negativo na operação.', 'error');
    resetAcum();
    return;
  }

  const res = toAMD(acumDias);
  setPena(res.a, res.m, res.d);
  mostrarMultaResult(Math.max(0, Math.round(multaAcum)));
  resetAcum();
  recalc();
  showToast('Operação realizada com sucesso!', 'success');
}

function atualizarAcumBar(hint) {
  const bar = document.getElementById('acum-bar');
  bar.style.visibility = 'visible';
  bar.style.opacity = '1';
  
  const p = toAMD(Math.abs(acumDias));
  document.getElementById('acum-val').textContent = (acumDias < 0 ? '− ' : '') + fmt(p.a, p.m, p.d);
  document.getElementById('acum-ops').textContent = acumLog.join(' ') + (hint ? ' ' + hint : '');
}

function resetAcum() {
  acumDias = 0;
  acumLog = [];
  opPending = null;
  opBase = 0;
  multaAcum = 0;
  multaOpBase = 0;
  const bar = document.getElementById('acum-bar');
  bar.style.visibility = 'hidden';
  bar.style.opacity = '0';
}

// Botão "AC": zera o cálculo atual (pena + multa + acumulador) e recalcula.
// Não mexe nos parâmetros (data/remidos/interrupção) — isso é o "Limpar Tudo".
function acClear() {
  setPena(0, 0, 0);
  displayBoxes.multa.value = 0;
  document.getElementById('multa-res-val').textContent = '0';
  document.getElementById('multa-result').style.display = 'none';
  resetAcum();
  recalc();
  showToast('Cálculo zerado.', 'info');
}

function mostrarMultaResult(val) {
  const sec = document.getElementById('multa-result');
  if (val > 0) {
    document.getElementById('multa-res-val').textContent = val;
    sec.style.display = 'flex';
    displayBoxes.multa.value = val;
  } else {
    sec.style.display = 'none';
    displayBoxes.multa.value = 0;
  }
}

function clearAll() {
  setPena(0, 0, 0);
  resetAcum();
  displayBoxes.multa.value = 0;
  document.getElementById('multa-result').style.display = 'none';
  ['ia', 'im', 'id', 'remidos'].forEach(id => document.getElementById(id).value = 0);
  document.getElementById('inicio').value = '';
  document.getElementById('redacao-txt').textContent = '—';
  
  // Clear custom chips
  const customChips = document.querySelectorAll('.fraction-btn.custom-fraction');
  customChips.forEach(chip => chip.remove());
  extraSelected.clear();
  
  recalc();
  showToast('Campos resetados!', 'info');
}

/* ==========================================================================
   CRITERIA & FRACTIONS SELECTION SYSTEM
   ========================================================================== */

const CRITERIOS = [
  { label: '1/6 (16%)', pct: 1/6 },
  { label: '1/5 (20%)', pct: 1/5 },
  { label: '1/4 (25%)', pct: 1/4 },
  { label: '30%', pct: 0.30 },
  { label: '1/3 (33%)', pct: 1/3 },
  { label: '2/5 (40%)', pct: 2/5 },
  { label: '1/2 (50%)', pct: 1/2 },
  { label: '55%', pct: 0.55, vedado: true },
  { label: '3/5 (60%)', pct: 3/5 },
  { label: '2/3 (67%)', pct: 2/3 },
  { label: '70%', pct: 0.70 },
  { label: '75%', pct: 0.75, vedado: true },
  { label: '80%', pct: 0.80 },
  { label: '85%', pct: 0.85, vedado: true },
];

const FRACOES_GRADE = [
  { label: '1/6 (16%)', pct: 1/6 },
  { label: '2/5 (40%)', pct: 2/5 },
  { label: '3/5 (60%)', pct: 3/5 },
  { label: '70%', pct: 0.70 },
];

function initCriteria() {
  const grp = document.getElementById('grp-criterios');
  // Ordena por pct crescente (progressivo)
  const sorted = [...CRITERIOS].sort((a, b) => a.pct - b.pct);
  sorted.forEach((item, i) => {
    const id = 'c_' + i;
    item._id = id;
    const btn = document.createElement('button');
    btn.className = 'fraction-btn';
    btn.id = 'fbtn_' + id;
    btn.innerHTML = `<span>${item.label}</span>${item.vedado ? ' <span style="font-size:0.6rem;">⛔</span>' : ''}`;
    if (item.vedado) {
      btn.title = 'Vedado livramento condicional';
    }
    btn.onclick = () => clicarBtn(id, item, btn);
    grp.appendChild(btn);
  });
}

function clicarBtn(id, item, btn) {
  // If there's a mathematical operation pending, calculate equivalent fraction instead
  if (opPending !== null) {
    const fracDias = Math.floor(opBase * item.pct);
    const fracMulta = Math.round(multaOpBase * item.pct);
    const sinal = (opPending === '+') ? 1 : -1;
    
    acumDias += sinal * fracDias;
    multaAcum += sinal * fracMulta;
    
    const amd = toAMD(fracDias);
    acumLog.push(opPending + ' ' + item.label + ' (' + fmt(amd.a, amd.m, amd.d) + ')');
    
    opPending = null;
    opBase = 0;
    multaOpBase = 0;
    
    atualizarAcumBar(null);
    const res = toAMD(Math.abs(acumDias));
    setPena(res.a, res.m, res.d);
    mostrarMultaResult(Math.max(0, Math.round(multaAcum)));
    recalc();
    showToast(`Fração ${item.label} aplicada à conta!`, 'success');
    return;
  }
  
  if (extraSelected.has(id)) {
    extraSelected.delete(id);
    btn.classList.remove('active');
  } else {
    extraSelected.set(id, item);
    btn.classList.add('active');
  }
  recalc();
}

/* ==========================================================================
   RECALCULATOR LOGIC
   ========================================================================== */

function recalc() {
  const p = getPena();
  const bruta = toDias(p.anos, p.meses, p.dias);
  
  // Show or hide results & redação sections based on penalty input
  const resSec = document.getElementById('results-section');
  const redSec = document.getElementById('redacao-section');
  
  if (!bruta) {
    resSec.style.display = 'none';
    redSec.style.display = 'none';
    document.getElementById('results-grid').innerHTML = '';
    document.getElementById('res-term').textContent = '—';
    document.getElementById('redacao-txt').textContent = '—';
    return;
  }
  
  resSec.style.display = 'block';
  redSec.style.display = 'block';

  const intD = toDias(
    parseInt(document.getElementById('ia').value) || 0,
    parseInt(document.getElementById('im').value) || 0,
    parseInt(document.getElementById('id').value) || 0
  );
  
  const rem = parseInt(document.getElementById('remidos').value) || 0;
  const remAntes = document.querySelector('input[name="remopt"]:checked').value === 'antes';
  const inicio = document.getElementById('inicio').value;
  const temData = !!inicio;

  const efetBase = Math.max(0, bruta - intD - (remAntes ? rem : 0));
  const efetTotal = Math.max(0, bruta - intD - rem);
  const ef = toAMD(efetTotal);

  // Termino da Pena
  document.getElementById('res-term').textContent = temData ? fmtD(addD(inicio, efetTotal)) : fmt(ef.a, ef.m, ef.d);

  // Redação por Extenso para Peça
  const multa = parseInt(document.getElementById('multa-res-val').textContent) || getMulta();
  const multaStr = multa > 0
    ? ' e ' + String(multa).padStart(2, '0') + ' (' + porExtenso(multa) + ') ' + (multa === 1 ? 'dia-multa' : 'dias-multa')
    : '';
  const penaStr = fmtRedacao(ef.a, ef.m, ef.d);
  document.getElementById('redacao-txt').textContent = penaStr ? (penaStr + ' de reclusão' + multaStr) : '—';

  // Build Results Grid
  const grid = document.getElementById('results-grid');
  grid.innerHTML = '';

  function buildRow(item, isCustom = false) {
    const fracDias = Math.floor(efetBase * item.pct);
    const fracEfet = remAntes ? fracDias : Math.max(0, fracDias - rem);
    const amd = toAMD(fracDias);
    
    const row = document.createElement('div');
    row.className = `results-row ${isCustom ? 'custom-row' : ''}`;
    
    let dateHTML = '<div>—</div>';
    let sitHTML = '<div>—</div>';
    
    if (temData) {
      const da = addD(inicio, fracEfet);
      const s = sit(da);
      const badgeClass = s === 'passado' ? 'passado' : (s === 'hoje' ? 'hoje' : 'futuro');
      const badgeText = s === 'passado' ? '✔ Atingido' : (s === 'hoje' ? 'HOJE' : 'Pendente');
      
      dateHTML = `<div class="cell-date">${fmtD(da)}</div>`;
      sitHTML = `<div><span class="badge ${badgeClass}">${badgeText}${item.vedado ? ' ⛔' : ''}</span></div>`;
    }

    row.innerHTML = `
      <div class="cell-frac">${item.label}</div>
      <div class="cell-time">${fmt(amd.a, amd.m, amd.d)}</div>
      ${dateHTML}
      ${sitHTML}
    `;
    return row;
  }

  // Draw Default Fractions
  FRACOES_GRADE.forEach(item => {
    grid.appendChild(buildRow(item, false));
  });

  // Draw Custom Added & Selected Criteria
  const sortedExtras = [...extraSelected.values()].sort((a, b) => a.pct - b.pct);
  sortedExtras.forEach(item => {
    grid.appendChild(buildRow(item, true));
  });
}

/* ==========================================================================
   COPIAR REDAÇÃO
   ========================================================================== */

function copiarRedacao(el) {
  const textElement = el.querySelector('#redacao-txt');
  const txt = textElement.textContent;
  if (txt === '—') return;
  
  navigator.clipboard.writeText(txt).then(() => {
    showToast('Redação copiada para a área de transferência!', 'success');
  }).catch(() => {
    showToast('Falha ao copiar texto automaticamente.', 'error');
  });
}

/* ==========================================================================
   CUSTOM BENEFIT / CRITERIA MODAL SYSTEM
   ========================================================================== */

const modal = document.getElementById('modal');

function openModal() {
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
  ['m-pct', 'm-num', 'm-den', 'm-label'].forEach(id => document.getElementById(id).value = '');
}

// Close modal when clicking on dark overlay
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

function addCustom() {
  const pctStr = document.getElementById('m-pct').value.trim().replace(',', '.');
  const num = parseFloat(document.getElementById('m-num').value);
  const den = parseFloat(document.getElementById('m-den').value);
  const lbl = document.getElementById('m-label').value.trim();
  
  let frac, label;
  
  if (pctStr) {
    frac = parseFloat(pctStr) / 100;
    label = lbl || (pctStr.replace('.', ',') + '%');
  } else if (num && den) {
    frac = num / den;
    label = lbl || (num + '/' + den);
  } else {
    showToast('Informe o percentual ou os dados da fração!', 'error');
    return;
  }

  if (isNaN(frac) || frac <= 0 || frac > 1) {
    showToast('Valor numérico inválido!', 'error');
    return;
  }

  customCount++;
  const id = 'custom_' + customCount;
  const item = { label, pct: frac, _id: id };
  
  extraSelected.set(id, item);
  
  // Add new chip to the sidebar container
  const grp = document.getElementById('grp-criterios');
  const btn = document.createElement('button');
  btn.className = 'fraction-btn custom-fraction active';
  btn.id = 'fbtn_' + id;
  btn.title = label;
  
  btn.innerHTML = `
    <span>${label}</span>
    <span class="remove-custom" onclick="event.stopPropagation(); removeCustomChip('${id}')">×</span>
  `;
  
  btn.onclick = () => clicarBtn(id, item, btn);
  grp.appendChild(btn);
  
  closeModal();
  recalc();
  showToast(`Critério customizado "${label}" criado!`, 'success');
}

function removeCustomChip(id) {
  const btn = document.getElementById('fbtn_' + id);
  if (btn) btn.remove();
  extraSelected.delete(id);
  recalc();
  showToast('Critério customizado removido.', 'info');
}

/* ==========================================================================
   DATE INTERVAL CALCULATOR TAB LOGIC
   ========================================================================== */

// Mantém a Data de Início sincronizada entre a aba Períodos e o card de Resultados
function setInicio(v) {
  const a = document.getElementById('inicio');
  const b = document.getElementById('inicio-res');
  if (a && a.value !== v) a.value = v;
  if (b && b.value !== v) b.value = v;
  recalc();
}

function fmtDateBR(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Adiciona uma linha de intervalo (prisão → soltura) à lista
function addIntervalo(ini = '', fim = '') {
  const list = document.getElementById('intervalos-list');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'intervalo-row';
  row.innerHTML = `
    <div class="intervalo-head">
      <span class="intervalo-label">Período <span class="intervalo-num">1</span></span>
      <button type="button" class="btn-remove-intervalo" onclick="removeIntervalo(this)" title="Remover período">&times;</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="input-label">Data Inicial (prisão)</label>
        <input type="date" class="form-control per-ini" value="${ini}">
      </div>
      <div class="form-group">
        <label class="input-label">Data Final (soltura)</label>
        <input type="date" class="form-control per-fim" value="${fim}">
      </div>
    </div>
  `;
  list.appendChild(row);
  renumberIntervalos();
}

function removeIntervalo(btn) {
  const rows = document.querySelectorAll('#intervalos-list .intervalo-row');
  if (rows.length <= 1) {
    showToast('É necessário manter ao menos um período.', 'info');
    return;
  }
  btn.closest('.intervalo-row').remove();
  renumberIntervalos();
}

// Renumera os rótulos e oculta o botão remover quando há apenas um período
function renumberIntervalos() {
  const rows = document.querySelectorAll('#intervalos-list .intervalo-row');
  rows.forEach((r, i) => {
    const num = r.querySelector('.intervalo-num');
    if (num) num.textContent = i + 1;
    const rm = r.querySelector('.btn-remove-intervalo');
    if (rm) rm.style.visibility = rows.length <= 1 ? 'hidden' : 'visible';
  });
}

// Semeia a aba de Períodos com um intervalo inicial (datas = hoje)
function initPeriodos() {
  const hoje = new Date().toISOString().slice(0, 10);
  addIntervalo(hoje, hoje);
}

function calcPeriodo() {
  const rows = [...document.querySelectorAll('#intervalos-list .intervalo-row')];
  if (!rows.length) {
    showToast('Adicione ao menos um período.', 'error');
    return;
  }

  let totalDias = 0;
  const detalhes = [];

  for (let i = 0; i < rows.length; i++) {
    const ini = rows[i].querySelector('.per-ini').value;
    const fim = rows[i].querySelector('.per-fim').value;

    if (!ini || !fim) {
      showToast(`Preencha as duas datas do Período ${i + 1}.`, 'error');
      return;
    }

    const d1 = new Date(ini + 'T12:00:00');
    const d2 = new Date(fim + 'T12:00:00');

    if (d2 < d1) {
      showToast(`No Período ${i + 1}, a data final deve ser igual ou posterior à inicial.`, 'error');
      return;
    }

    const dias = Math.round((d2 - d1) / 86400000);
    totalDias += dias;
    detalhes.push({ n: i + 1, ini, fim, dias, amd: toAMD(dias) });
  }

  // Soma em dias corridos, convertida para anos-meses-dias na convenção penal (360/30)
  _perAMD = toAMD(totalDias);

  const multi = detalhes.length > 1;
  const breakdown = multi ? `
    <div class="periodo-breakdown">
      ${detalhes.map(p => `
        <div class="periodo-line">
          <span class="pl-label">Período ${p.n}</span>
          <span class="pl-dates">${fmtDateBR(p.ini)} → ${fmtDateBR(p.fim)}</span>
          <span class="pl-val">${fmt(p.amd.a, p.amd.m, p.amd.d)} <em>(${p.dias}d)</em></span>
        </div>`).join('')}
    </div>` : '';

  const res = document.getElementById('per-res');
  res.style.display = 'flex';
  res.innerHTML = `
    ${breakdown}
    <div class="periodo-total-label">${multi ? 'Soma dos períodos' : 'Período'}</div>
    <div class="period-val">${fmt(_perAMD.a, _perAMD.m, _perAMD.d)}</div>
    <div class="period-days">Equivalente a ${totalDias} dias corridos${multi ? ` (soma de ${detalhes.length} períodos)` : ''}</div>
    <div class="period-action-buttons">
      <button class="btn-period-copy to-pena" onclick="cpPena()">Aplicar à Pena Base</button>
      <button class="btn-period-copy to-int" onclick="cpInt()">Aplicar à Interrupção</button>
    </div>
  `;
  showToast(multi ? 'Períodos somados!' : 'Período calculado!', 'success');
}

function cpPena() {
  if (!_perAMD) return;
  setPena(_perAMD.a, _perAMD.m, _perAMD.d);
  recalc();
  showToast('Período transferido para Pena Base!', 'success');
}

function cpInt() {
  if (!_perAMD) return;
  document.getElementById('ia').value = _perAMD.a;
  document.getElementById('im').value = _perAMD.m;
  document.getElementById('id').value = _perAMD.d;
  recalc();
  showToast('Período transferido para Interrupção!', 'success');
}

/* ==========================================================================
   PENA-BASE CALCULATOR (1ª FASE)
   ========================================================================== */

let _baseAMD = null;
let _baseMulta = null;

function calcPenaBase() {
  const minA = parseInt(document.getElementById('base-min-a').value) || 0;
  const minM = parseInt(document.getElementById('base-min-m').value) || 0;
  const maxA = parseInt(document.getElementById('base-max-a').value) || 0;
  const maxM = parseInt(document.getElementById('base-max-m').value) || 0;
  const circ = parseInt(document.getElementById('base-circ').value) || 0;
  
  const minMulta = parseInt(document.getElementById('base-min-multa').value) || 0;
  const maxMulta = parseInt(document.getElementById('base-max-multa').value) || 0;

  // Limites
  const validCirc = Math.max(0, Math.min(8, circ));
  if (circ !== validCirc) {
    document.getElementById('base-circ').value = validCirc;
  }

  const diasMin = toDias(minA, minM, 0);
  const diasMax = toDias(maxA, maxM, 0);
  const diffDias = diasMax - diasMin;

  const diffMulta = maxMulta - minMulta;

  if (diffDias <= 0 && diffMulta <= 0) {
    document.getElementById('base-val-oitavo').textContent = '—';
    document.getElementById('base-val-diff').textContent = 'Intervalo inválido';
    document.getElementById('base-resultado').textContent = '—';
    document.getElementById('base-multa-resultado').textContent = '—';
    _baseAMD = null;
    _baseMulta = null;
    return;
  }

  let textDiff = '';
  let textOitavo = '';

  if (diffDias > 0) {
    const amdDiff = toAMD(diffDias);
    const umOitavoDias = Math.floor(diffDias / 8);
    const amdOitavo = toAMD(umOitavoDias);
    
    textDiff += 'Privativa: ' + fmt(amdDiff.a, amdDiff.m, amdDiff.d);
    textOitavo += '1/8 = ' + fmt(amdOitavo.a, amdOitavo.m, amdOitavo.d);
    
    const aumento = umOitavoDias * validCirc;
    _baseAMD = toAMD(diasMin + aumento);
    document.getElementById('base-resultado').textContent = fmt(_baseAMD.a, _baseAMD.m, _baseAMD.d);
  } else {
    _baseAMD = toAMD(diasMin);
    document.getElementById('base-resultado').textContent = fmt(_baseAMD.a, _baseAMD.m, _baseAMD.d);
  }

  if (diffMulta > 0) {
    const umOitavoMulta = diffMulta / 8;
    
    if (textDiff) textDiff += ' | ';
    textDiff += 'Multa: ' + diffMulta + ' dias';
    
    if (textOitavo) textOitavo += ' | ';
    textOitavo += '1/8 M = ' + umOitavoMulta.toFixed(1) + ' dias';
    
    const aumentoMulta = Math.round(umOitavoMulta * validCirc);
    _baseMulta = minMulta + aumentoMulta;
    document.getElementById('base-multa-resultado').textContent = _baseMulta;
  } else {
    _baseMulta = minMulta;
    document.getElementById('base-multa-resultado').textContent = _baseMulta;
  }

  document.getElementById('base-val-diff').textContent = textDiff || 'Diferença nula';
  document.getElementById('base-val-oitavo').textContent = textOitavo || '—';
}

function limparPenaBase() {
  document.getElementById('base-min-a').value = 1;
  document.getElementById('base-min-m').value = 0;
  document.getElementById('base-max-a').value = 6;
  document.getElementById('base-max-m').value = 0;
  document.getElementById('base-min-multa').value = 10;
  document.getElementById('base-max-multa').value = 360;
  document.getElementById('base-circ').value = 2;
  calcPenaBase();
  showToast('Campos da Pena-Base resetados', 'info');
}

function cpBaseParaPrincipal() {
  if (!_baseAMD && _baseMulta === null) {
    showToast('Calcule uma pena-base válida primeiro!', 'error');
    return;
  }
  
  clearAll(); // Limpa acumulador e exibições antigas
  
  if (_baseAMD) setPena(_baseAMD.a, _baseAMD.m, _baseAMD.d);
  if (_baseMulta !== null) {
    document.getElementById('disp-multa').value = _baseMulta;
  }
  
  // Muda para a aba da calculadora
  document.querySelector('.menu-item[data-tab="calc-tab"]').click();
  
  recalc();
  showToast('Pena-Base e Multa transferidas para a calculadora!', 'success');
}

