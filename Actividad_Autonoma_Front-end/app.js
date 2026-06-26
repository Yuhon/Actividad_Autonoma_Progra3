const API = 'http://localhost:8080/api';

let libros     = [];
let autores    = [];
let categorias = [];
let perfiles   = [];

async function req(url, opts = {}) {
  const res = await fetch(API + url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  if (res.status === 204) return null;
  return res.json();
}

function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.add('hidden'), 3000);
}

function openModal(title, html, onSave) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-save-btn').onclick = onSave;
}
function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }

function openConfirm(msg, onOk) {
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-overlay').classList.remove('hidden');
  document.getElementById('confirm-ok-btn').onclick = () => { closeConfirm(); onOk(); };
}
function closeConfirm() { document.getElementById('confirm-overlay').classList.add('hidden'); }

const v = id => document.getElementById(id)?.value?.trim() ?? '';

document.getElementById('modal-close-btn').onclick   = closeModal;
document.getElementById('modal-cancel-btn').onclick  = closeModal;
document.getElementById('confirm-cancel-btn').onclick = closeConfirm;
document.getElementById('modal-overlay').onclick  = e => { if (e.target === e.currentTarget) closeModal(); };
document.getElementById('confirm-overlay').onclick = e => { if (e.target === e.currentTarget) closeConfirm(); };

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`section-${btn.dataset.section}`).classList.add('active');
    ({ libros: loadLibros, autores: loadAutores, categorias: loadCategorias, perfiles: loadPerfiles })[btn.dataset.section]?.();
  });
});

function row(cols) { return `<tr>${cols.map(c => `<td>${c ?? '—'}</td>`).join('')}</tr>`; }
function actions(editFn, delFn) {
  return `<td><div class="actions-cell">
    <button class="btn-icon edit" onclick="${editFn}">Editar</button>
    <button class="btn-icon del"  onclick="${delFn}">Eliminar</button>
  </div></td>`;
}
function empty(n, msg = 'Sin registros') { return `<tr><td colspan="${n}" class="empty">${msg}</td></tr>`; }

async function loadLibros() {
  const tb = document.getElementById('body-libros');
  tb.innerHTML = empty(7, 'Cargando...');
  try {
    libros = await req('/libros');
    tb.innerHTML = libros.length
      ? libros.map(l => row([
          l.id, l.isbn, l.nombre,
          `$${Number(l.precio).toFixed(2)}`,
          l.stock,
          (l.categorias || []).map(c => `<span class="badge">${c.nombre}</span>`).join('') || '—',
        ]) + actions(`editLibro(${l.id})`, `deleteLibro(${l.id},'${l.nombre}')`)).join('')
      : empty(7);
  } catch(e) { tb.innerHTML = empty(7, e.message); }
}

function libroForm(l = {}) {
  return `
    <div class="form-group"><label>ISBN (13 digitos)</label>
      <input id="f-isbn" maxlength="13" placeholder="1234567890123" value="${l.isbn || ''}"/></div>
    <div class="form-group"><label>Nombre</label>
      <input id="f-nombre" placeholder="Titulo" value="${l.nombre || ''}"/></div>
    <div class="form-group"><label>Precio</label>
      <input id="f-precio" type="number" min="0" step="0.01" value="${l.precio ?? ''}"/></div>
    <div class="form-group"><label>Stock</label>
      <input id="f-stock" type="number" min="0" value="${l.stock ?? ''}"/></div>
    <div class="form-group" id="cats-group"><label>Categorias</label>
      <div id="cats-chips" class="multi-chips"></div>
      <select id="cats-add" style="margin-top:6px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-size:13px;width:100%;outline:none;">
        <option value="">Agregar categoria...</option>
      </select>
    </div>`;
}

async function setupCatSelect(seleccionadas = []) {
  if (!categorias.length) categorias = await req('/categorias').catch(() => []);
  let selected = seleccionadas.map(c => ({ id: c.id, nombre: c.nombre }));

  function render() {
    document.getElementById('cats-chips').innerHTML = selected.length
      ? selected.map(c => `<span class="chip">${c.nombre}<span class="chip-remove" data-id="${c.id}">x</span></span>`).join('')
      : '<span style="color:var(--muted);font-size:12px">Ninguna</span>';
    const sel = document.getElementById('cats-add');
    sel.innerHTML = '<option value="">Agregar categoria...</option>' +
      categorias.filter(c => !selected.find(s => s.id === c.id))
        .map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  }

  render();

  document.getElementById('cats-chips').addEventListener('click', e => {
    const id = Number(e.target.dataset.id);
    if (id) { selected = selected.filter(c => c.id !== id); render(); }
  });
  document.getElementById('cats-add').addEventListener('change', e => {
    const id = Number(e.target.value);
    const cat = categorias.find(c => c.id === id);
    if (cat) { selected.push(cat); render(); }
  });

  document.getElementById('cats-group')._getIds = () => selected.map(c => ({ id: c.id }));
}

document.getElementById('btn-nuevo-libro').addEventListener('click', async () => {
  openModal('Nuevo libro', libroForm(), async () => {
    try {
      await req('/libros', { method: 'POST', body: JSON.stringify({
        isbn: v('f-isbn'), nombre: v('f-nombre'),
        precio: parseFloat(v('f-precio')), stock: parseInt(v('f-stock')),
        categorias: document.getElementById('cats-group')?._getIds?.() || [],
      })});
      closeModal(); toast('Libro creado'); loadLibros();
    } catch(e) { toast(e.message, 'error'); }
  });
  await setupCatSelect([]);
});

window.editLibro = async (id) => {
  const l = libros.find(x => x.id === id);
  openModal('Editar libro', libroForm(l), async () => {
    try {
      await req(`/libros/${id}`, { method: 'PUT', body: JSON.stringify({
        isbn: v('f-isbn'), nombre: v('f-nombre'),
        precio: parseFloat(v('f-precio')), stock: parseInt(v('f-stock')),
        categorias: document.getElementById('cats-group')?._getIds?.() || [],
      })});
      closeModal(); toast('Libro actualizado'); loadLibros();
    } catch(e) { toast(e.message, 'error'); }
  });
  await setupCatSelect(l.categorias || []);
};

window.deleteLibro = (id, nombre) => openConfirm(`Eliminar libro "${nombre}"?`, async () => {
  try { await req(`/libros/${id}`, { method: 'DELETE' }); toast('Libro eliminado'); loadLibros(); }
  catch(e) { toast(e.message, 'error'); }
});

async function loadAutores() {
  const tb = document.getElementById('body-autores');
  tb.innerHTML = empty(6, 'Cargando...');
  try {
    autores = await req('/autores');
    tb.innerHTML = autores.length
      ? autores.map(a => row([a.id, a.nombre, a.apellido, a.nacionalidad, a.libro?.nombre]) +
          actions(`editAutor(${a.id})`, `deleteAutor(${a.id},'${a.nombre} ${a.apellido}')`)).join('')
      : empty(6);
  } catch(e) { tb.innerHTML = empty(6, e.message); }
}

async function autorForm(a = {}) {
  if (!libros.length) libros = await req('/libros').catch(() => []);
  const opts = libros.map(l => `<option value="${l.id}" ${a.libro?.id === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('');
  return `
    <div class="form-group"><label>Nombre</label>
      <input id="f-nombre" value="${a.nombre || ''}"/></div>
    <div class="form-group"><label>Apellido</label>
      <input id="f-apellido" value="${a.apellido || ''}"/></div>
    <div class="form-group"><label>Nacionalidad</label>
      <input id="f-nacionalidad" value="${a.nacionalidad || ''}"/></div>
    <div class="form-group"><label>Libro</label>
      <select id="f-libro"><option value="">Sin libro</option>${opts}</select></div>`;
}

document.getElementById('btn-nuevo-autor').addEventListener('click', async () => {
  openModal('Nuevo autor', await autorForm(), async () => {
    const libroId = v('f-libro');
    try {
      await req('/autores', { method: 'POST', body: JSON.stringify({
        nombre: v('f-nombre'), apellido: v('f-apellido'), nacionalidad: v('f-nacionalidad'),
        libro: libroId ? { id: parseInt(libroId) } : null,
      })});
      closeModal(); toast('Autor creado'); loadAutores();
    } catch(e) { toast(e.message, 'error'); }
  });
});

window.editAutor = async (id) => {
  const a = autores.find(x => x.id === id);
  openModal('Editar autor', await autorForm(a), async () => {
    const libroId = v('f-libro');
    try {
      await req(`/autores/${id}`, { method: 'PUT', body: JSON.stringify({
        nombre: v('f-nombre'), apellido: v('f-apellido'), nacionalidad: v('f-nacionalidad'),
        libro: libroId ? { id: parseInt(libroId) } : null,
      })});
      closeModal(); toast('Autor actualizado'); loadAutores();
    } catch(e) { toast(e.message, 'error'); }
  });
};

window.deleteAutor = (id, nombre) => openConfirm(`Eliminar autor "${nombre}"?`, async () => {
  try { await req(`/autores/${id}`, { method: 'DELETE' }); toast('Autor eliminado'); loadAutores(); }
  catch(e) { toast(e.message, 'error'); }
});

async function loadCategorias() {
  const tb = document.getElementById('body-categorias');
  tb.innerHTML = empty(4, 'Cargando...');
  try {
    categorias = await req('/categorias');
    tb.innerHTML = categorias.length
      ? categorias.map(c => row([c.id, c.nombre, c.descripcion]) +
          actions(`editCategoria(${c.id})`, `deleteCategoria(${c.id},'${c.nombre}')`)).join('')
      : empty(4);
  } catch(e) { tb.innerHTML = empty(4, e.message); }
}

function categoriaForm(c = {}) {
  return `
    <div class="form-group"><label>Nombre</label>
      <input id="f-nombre" value="${c.nombre || ''}"/></div>
    <div class="form-group"><label>Descripcion</label>
      <textarea id="f-descripcion">${c.descripcion || ''}</textarea></div>`;
}

document.getElementById('btn-nueva-categoria').addEventListener('click', () => {
  openModal('Nueva categoria', categoriaForm(), async () => {
    try {
      await req('/categorias', { method: 'POST', body: JSON.stringify({ nombre: v('f-nombre'), descripcion: v('f-descripcion') }) });
      closeModal(); toast('Categoria creada'); loadCategorias();
    } catch(e) { toast(e.message, 'error'); }
  });
});

window.editCategoria = (id) => {
  const c = categorias.find(x => x.id === id);
  openModal('Editar categoria', categoriaForm(c), async () => {
    try {
      await req(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify({ nombre: v('f-nombre'), descripcion: v('f-descripcion') }) });
      closeModal(); toast('Categoria actualizada'); loadCategorias();
    } catch(e) { toast(e.message, 'error'); }
  });
};

window.deleteCategoria = (id, nombre) => openConfirm(`Eliminar categoria "${nombre}"?`, async () => {
  try { await req(`/categorias/${id}`, { method: 'DELETE' }); toast('Categoria eliminada'); loadCategorias(); }
  catch(e) { toast(e.message, 'error'); }
});

async function loadPerfiles() {
  const tb = document.getElementById('body-perfiles');
  tb.innerHTML = empty(8, 'Cargando...');
  try {
    perfiles = await req('/perfiles');
    tb.innerHTML = perfiles.length
      ? perfiles.map(p => row([p.id, p.nombre, p.apellido, p.email, p.telefono, p.direccion, p.libro?.nombre]) +
          actions(`editPerfil(${p.id})`, `deletePerfil(${p.id},'${p.nombre} ${p.apellido}')`)).join('')
      : empty(8);
  } catch(e) { tb.innerHTML = empty(8, e.message); }
}

async function perfilForm(p = {}) {
  if (!libros.length) libros = await req('/libros').catch(() => []);
  const opts = libros.map(l => `<option value="${l.id}" ${p.libro?.id === l.id ? 'selected' : ''}>${l.nombre}</option>`).join('');
  return `
    <div class="form-group"><label>Nombre (4-10 caracteres)</label>
      <input id="f-nombre" minlength="4" maxlength="10" value="${p.nombre || ''}"/></div>
    <div class="form-group"><label>Apellido (4-15 caracteres)</label>
      <input id="f-apellido" minlength="4" maxlength="15" value="${p.apellido || ''}"/></div>
    <div class="form-group"><label>Email</label>
      <input id="f-email" type="email" value="${p.email || ''}"/></div>
    <div class="form-group"><label>Telefono (10 digitos)</label>
      <input id="f-telefono" maxlength="10" value="${p.telefono || ''}"/></div>
    <div class="form-group"><label>Direccion</label>
      <input id="f-direccion" value="${p.direccion || ''}"/></div>
    <div class="form-group"><label>Libro</label>
      <select id="f-libro"><option value="">Sin libro</option>${opts}</select></div>`;
}

document.getElementById('btn-nuevo-perfil').addEventListener('click', async () => {
  openModal('Nuevo perfil', await perfilForm(), async () => {
    const libroId = v('f-libro');
    try {
      await req('/perfiles', { method: 'POST', body: JSON.stringify({
        nombre: v('f-nombre'), apellido: v('f-apellido'), email: v('f-email'),
        telefono: v('f-telefono') || null, direccion: v('f-direccion'),
        libro: libroId ? { id: parseInt(libroId) } : null,
      })});
      closeModal(); toast('Perfil creado'); loadPerfiles();
    } catch(e) { toast(e.message, 'error'); }
  });
});

window.editPerfil = async (id) => {
  const p = perfiles.find(x => x.id === id);
  openModal('Editar perfil', await perfilForm(p), async () => {
    const libroId = v('f-libro');
    try {
      await req(`/perfiles/${id}`, { method: 'PUT', body: JSON.stringify({
        nombre: v('f-nombre'), apellido: v('f-apellido'), email: v('f-email'),
        telefono: v('f-telefono') || null, direccion: v('f-direccion'),
        libro: libroId ? { id: parseInt(libroId) } : null,
      })});
      closeModal(); toast('Perfil actualizado'); loadPerfiles();
    } catch(e) { toast(e.message, 'error'); }
  });
};

window.deletePerfil = (id, nombre) => openConfirm(`Eliminar perfil "${nombre}"?`, async () => {
  try { await req(`/perfiles/${id}`, { method: 'DELETE' }); toast('Perfil eliminado'); loadPerfiles(); }
  catch(e) { toast(e.message, 'error'); }
});

loadLibros();