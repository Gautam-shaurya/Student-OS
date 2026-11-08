// ===== StudentOS script =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ---------- Data (saved in LocalStorage) ----------
const KEYS = ['tasks', 'sessions', 'notes', 'goals'];
const db = {};
KEYS.forEach(k => {
  try { db[k] = JSON.parse(localStorage.getItem('sos_' + k)) || []; }
  catch { db[k] = []; }
});
let focusDone = Number(localStorage.getItem('sos_focus')) || 0;

function save() {
  KEYS.forEach(k => localStorage.setItem('sos_' + k, JSON.stringify(db[k])));
  localStorage.setItem('sos_focus', focusDone);
}

// ---------- Helpers ----------
const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const fmtDate = d => d ? new Date(d + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date';

let toastTimer;
function toast(msg, type) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'show ' + (type || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.className = '', 2500);
}

// ---------- Navigation ----------
function go(page) {
  $$('.page').forEach(p => p.classList.toggle('active', p.id === page));
  $$('.nav').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  renderAll();
}
$$('.nav').forEach(n => n.onclick = () => go(n.dataset.page));
$$('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));

// ---------- Forms (add + edit for tasks, sessions, notes, goals) ----------
// required = fields that cannot be empty
const forms = {
  tasks:    { names: ['title', 'priority', 'due'], required: ['title'], label: 'Add task', name: 'Task' },
  sessions: { names: ['subject', 'topic', 'date', 'duration'], required: ['subject', 'topic', 'date', 'duration'], label: 'Add session', name: 'Session' },
  notes:    { names: ['title', 'body'], required: ['title', 'body'], label: 'Save note', name: 'Note' },
  goals:    { names: ['text'], required: ['text'], label: 'Add', name: 'Goal' }
};

Object.keys(forms).forEach(key => {
  const f = $('#f-' + key), cfg = forms[key];
  f.onsubmit = e => {
    e.preventDefault();
    const v = {};
    cfg.names.forEach(n => v[n] = f[n].value.trim());
    if (cfg.required.some(n => !v[n])) return toast('Please fill in all required fields.', 'err');
    if (key === 'sessions' && (v.duration < 5 || v.duration > 600)) return toast('Duration must be 5–600 minutes.', 'err');
    if (f.dataset.edit) {
      Object.assign(db[key].find(i => i.id == f.dataset.edit), v);
      toast(cfg.name + ' updated!');
    } else {
      db[key].push({ id: Date.now(), done: false, ...v });
      toast(cfg.name + ' added!');
    }
    save(); resetForm(key); renderAll();
  };
  const cancel = f.querySelector('.cancel');
  if (cancel) cancel.onclick = () => resetForm(key);
});

function resetForm(key) {
  const f = $('#f-' + key);
  f.reset(); delete f.dataset.edit;
  f.querySelector('.btn').textContent = forms[key].label;
  const c = f.querySelector('.cancel'); if (c) c.hidden = true;
}

function startEdit(key, id) {
  const f = $('#f-' + key), item = db[key].find(i => i.id == id);
  forms[key].names.forEach(n => f[n].value = item[n]);
  f.dataset.edit = id;
  f.querySelector('.btn').textContent = 'Save changes';
  const c = f.querySelector('.cancel'); if (c) c.hidden = false;
  f.scrollIntoView({ behavior: 'smooth', block: 'center' });
  f.elements[0].focus();
}

// ---------- Click actions (toggle / edit / delete) ----------
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b) return;
  const { a, k, id } = b.dataset;
  if (a === 'toggle') {
    const item = db[k].find(i => i.id == id);
    item.done = !item.done;
    save(); renderAll();
    toast(item.done ? 'Nice work, marked as done!' : 'Moved back to pending.');
  }
  if (a === 'edit') startEdit(k, id);
  if (a === 'del') {
    if (!confirm('Delete this item?')) return;
    db[k] = db[k].filter(i => i.id != id);
    save(); renderAll(); toast('Deleted.');
  }
});

// ---------- Rendering ----------
let filter = 'all';
$$('#filters .tab').forEach(t => t.onclick = () => {
  filter = t.dataset.f;
  $$('#filters .tab').forEach(x => x.classList.toggle('active', x === t));
  renderTasks();
});
$('#search').oninput = renderNotes;

const buttons = (k, id) =>
  `<button class="icon" data-a="edit" data-k="${k}" data-id="${id}" title="Edit">✏️</button>
   <button class="icon" data-a="del" data-k="${k}" data-id="${id}" title="Delete">🗑️</button>`;
const check = (k, i) => `<input type="checkbox" data-a="toggle" data-k="${k}" data-id="${i.id}" ${i.done ? 'checked' : ''}>`;
const empty = msg => `<li class="empty">${msg}</li>`;

function renderTasks() {
  const list = db.tasks.filter(t => filter === 'all' || (filter === 'completed') === t.done)
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  $('#l-tasks').innerHTML = list.map(t => `
    <li class="${t.done ? 'done' : ''}">${check('tasks', t)}
      <div class="info"><b>${esc(t.title)}</b><small>Due: ${fmtDate(t.due)}</small></div>
      <span class="badge ${t.priority}">${t.priority}</span>${buttons('tasks', t.id)}</li>`).join('')
    || empty('No tasks here yet. Add one above.');
}

function renderSessions() {
  const list = [...db.sessions].sort((a, b) => a.date.localeCompare(b.date));
  $('#l-sessions').innerHTML = list.map(s => `
    <li class="${s.done ? 'done' : ''}">${check('sessions', s)}
      <div class="info"><b>${esc(s.subject)}: ${esc(s.topic)}</b><small>${fmtDate(s.date)} · ${s.duration} min</small></div>
      ${buttons('sessions', s.id)}</li>`).join('')
    || empty('No study sessions planned. Add one above.');
}

function renderNotes() {
  const q = $('#search').value.toLowerCase();
  const list = db.notes.filter(n => (n.title + n.body).toLowerCase().includes(q));
  $('#l-notes').innerHTML = list.map(n => `
    <div class="note"><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p>${buttons('notes', n.id)}</div>`).join('')
    || `<p class="muted">${db.notes.length ? 'No notes match your search.' : 'No notes yet. Write your first one above.'}</p>`;
}

function renderGoals() {
  $('#l-goals').innerHTML = db.goals.map(g => `
    <li class="${g.done ? 'done' : ''}">${check('goals', g)}
      <div class="info"><b>${esc(g.text)}</b></div>
      <button class="icon" data-a="del" data-k="goals" data-id="${g.id}" title="Delete">🗑️</button></li>`).join('')
    || empty('No goals yet. Add one above.');
}

function stats() {
  const doneT = db.tasks.filter(t => t.done).length, doneS = db.sessions.filter(s => s.done).length, doneG = db.goals.filter(g => g.done).length;
  return { doneT, pendT: db.tasks.length - doneT, doneS, doneG,
    pT: pct(doneT, db.tasks.length), pS: pct(doneS, db.sessions.length), pG: pct(doneG, db.goals.length) };
}

function renderDashboard() {
  const h = new Date().getHours(), s = stats();
  $('#welcome').textContent = (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + '! 👋';
  $('#today').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('#d-today').textContent = db.tasks.filter(t => !t.done && t.due === todayStr()).length;
  $('#d-pending').textContent = s.pendT;
  $('#d-goals').textContent = s.doneG + '/' + db.goals.length;
  $('#d-study').textContent = s.pS + '%';
  $('#d-bar').style.width = s.pS + '%';
  const up = db.tasks.filter(t => !t.done && t.due && t.due >= todayStr())
    .sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5);
  $('#l-upcoming').innerHTML = up.map(t => `
    <li><div class="info"><b>${esc(t.title)}</b><small>Due: ${fmtDate(t.due)}</small></div>
    <span class="badge ${t.priority}">${t.priority}</span></li>`).join('')
    || empty('No upcoming assignments.');
}

function renderProgress() {
  const s = stats();
  $('#p-done').textContent = s.doneT;
  $('#p-pend').textContent = s.pendT;
  $('#p-sess').textContent = s.doneS;
  $('#p-focus').textContent = focusDone;
  $('#donut').style.background = `conic-gradient(#2563eb ${s.pT * 3.6}deg, #ede9fe 0)`;
  $('#donut-t').textContent = s.pT + '%';
  $('#b-tasks').style.width = s.pT + '%';
  $('#b-sess').style.width = s.pS + '%';
  $('#b-goals').style.width = s.pG + '%';
}

function renderAll() {
  renderTasks(); renderSessions(); renderNotes(); renderGoals();
  renderDashboard(); renderProgress();
  $('#t-count').textContent = focusDone;
}

// ---------- Pomodoro timer ----------
let mode = 25, left = 25 * 60, timerId = null;
const clock = $('#clock');

function drawClock() {
  const m = String(Math.floor(left / 60)).padStart(2, '0'), s = String(left % 60).padStart(2, '0');
  clock.textContent = m + ':' + s;
  document.title = timerId ? `${m}:${s} · StudentOS` : 'StudentOS';
}
function stopTimer() { clearInterval(timerId); timerId = null; }

$('#t-start').onclick = () => {
  if (timerId) return toast('Timer is already running.', 'err');
  timerId = setInterval(() => {
    left--;
    if (left <= 0) {
      stopTimer(); left = 0;
      if (mode === 25) { focusDone++; save(); renderAll(); }
      toast(mode === 25 ? 'Focus round complete! Take a break. 🎉' : 'Break over. Ready to focus?');
    }
    drawClock();
  }, 1000);
  drawClock();
};
$('#t-pause').onclick = () => {
  if (!timerId) return toast('The timer is not running.', 'err');
  stopTimer(); drawClock(); toast('Timer paused.');
};
$('#t-reset').onclick = () => { stopTimer(); left = mode * 60; drawClock(); toast('Timer reset.'); };
$$('[data-mode]').forEach(b => b.onclick = () => {
  mode = Number(b.dataset.mode); left = mode * 60; stopTimer();
  $$('[data-mode]').forEach(x => x.classList.toggle('active', x === b));
  drawClock();
});

// ---------- Start ----------
renderAll();
