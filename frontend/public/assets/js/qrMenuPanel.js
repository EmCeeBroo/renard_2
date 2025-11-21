import {showAlert, showLoading, llenarSelect } from '../../assets/js/utils.js';

let modalEditarQrMenu;
let modalCrearQrMenu;

let restaurantes = [];
let menus = [];
let qrMenusData = [];
let filtroBusqueda = '';


const URL = "http://192.168.0.9:3000/renard/qr-menu"; 
const MENU = "http://192.168.0.9:3000/renard/menu";
const RESTAURANTE = 'http://192.168.0.9:3000/renard/restaurante';


document.addEventListener('DOMContentLoaded', async () => {
  modalEditarQrMenu = new bootstrap.Modal(document.getElementById('editQrMenuModal'));
  modalCrearQrMenu = new bootstrap.Modal(document.getElementById('createQrMenuModal'));

  await cargarSelects();
  await cargarQrMenu();

  // Inicializar filtro de búsqueda
  const buscarInput = document.getElementById('buscarInput');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      filtroBusqueda = e.target.value.toLowerCase();
      filtrarQrMenus();
    });
  }

  document.getElementById('editQrMenuForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarCambiosQrMenu();
  });

  document.getElementById('createQrMenuForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearQrMenu();
  });
});

async function cargarSelects() {
  [restaurantes, menus ] = await Promise.all([
    fetch(RESTAURANTE).then(r => r.json()),
    fetch(MENU).then(r => r.json())
  ]);

  llenarSelect(restaurantes, 'createRestaurante', 'nombre', 'id_restaurante');
  llenarSelect(restaurantes, 'editRestaurante', 'nombre', 'id_restaurante');

  llenarSelect(menus, 'createMenu', 'nombre', 'id_menu');
  llenarSelect(menus, 'editMenu', 'nombre', 'id_menu');

}

async function cargarQrMenu() {
  try {
    showLoading(true);
    const response = await fetch(URL);
    qrMenusData = await response.json();
    renderizarQrMenus(qrMenusData);
  } catch (error) {
    console.error('Error al cargar qr-Menus:', error);
    showAlert('error', 'No se pudieron cargar los qr-Menus');
  } finally {
    showLoading(false);
  }
}

// Función para filtrar qr-menus
function filtrarQrMenus() {
  const filtrados = qrMenusData.filter(qrMenu => {
    const restaurante = restaurantes.find(r => r.id_restaurante === qrMenu.restaurante_fk);
    const menu = menus.find(m => m.id_menu === qrMenu.menu_fk);

    const restauranteNombre = restaurante ? restaurante.nombre.toLowerCase() : '';
    const menuNombre = menu ? menu.nombre.toLowerCase() : '';

    return qrMenu.url.toLowerCase().includes(filtroBusqueda) ||
           qrMenu.codigo_qr.toLowerCase().includes(filtroBusqueda) ||
           restauranteNombre.includes(filtroBusqueda) ||
           menuNombre.includes(filtroBusqueda);
  });
  renderizarQrMenus(filtrados);
}

function renderizarQrMenus(qrMenus) {
  const tbody = document.querySelector('#qrMenuTableBody');
  tbody.innerHTML = '';

  if (qrMenus.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">No hay qr-menus registrados</td>
      </tr>
    `;
    return;
  }

  qrMenus.forEach(res => {
    const restaurante = restaurantes.find(u => u.id_restaurante === res.restaurante_fk);
    const menu = menus.find(e => e.id_menu === res.menu_fk);


    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${res.id_qr_menu}</td>
      <td>${res.url}</td>
      <td>${res.codigo_qr}</td>
      <td>${restaurante?.nombre || res.restaurante_fk}</td>
      <td>${menu?.nombre || res.menu_fk}</td>
      <td>${new Date(res.created_at || '').toLocaleString()}</td>
      <td>${new Date(res.updated_at || '').toLocaleString()}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="abrirModalEditarQrMenu(${res.id_qr_menu})" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" onclick="confirmarEliminarQrMenu(${res.id_qr_menu})" title="Eliminar">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function abrirModalEditarQrMenu(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`);
    const qrMenu = await response.json();

    document.getElementById('editQrMenuId').value = qrMenu.id_qr_menu;
    document.getElementById('editUrl').value = qrMenu.url;
    document.getElementById('editCodigo').value = qrMenu.codigo_qr;
    document.getElementById('editRestaurante').value = qrMenu.restaurante_fk;
    document.getElementById('editMenu').value = qrMenu.menu_fk;


    modalEditarQrMenu.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar la qr menu');
  } finally {
    showLoading(false);
  }
}

async function guardarCambiosQrMenu() {
  try {
    const id = document.getElementById('editQrMenuId').value;
    const url = document.getElementById('editUrl').value.trim();
    const codigo_qr = document.getElementById('editCodigo').value.trim();
    const restaurante_fk = document.getElementById('editRestaurante').value.trim();
    const menu_fk = document.getElementById('editMenu').value.trim();

    if ( !url || !codigo_qr || !restaurante_fk || !menu_fk ) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    showLoading(true);

    const response = await fetch(`${URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, codigo_qr, restaurante_fk, menu_fk })
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Qr menu actualizada correctamente');
    modalEditarQrMenu.hide();
    cargarQrMenu();
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    showAlert('error', 'Error al actualizar el qr-menu');
  } finally {
    showLoading(false);
  }
}

function abrirModalCrearQrMenu() {
  document.getElementById('createQrMenuForm').reset();
  modalCrearQrMenu.show();
}

async function crearQrMenu() {
  try {
    const url = document.getElementById('createUrl').value.trim();
    const codigo_qr = document.getElementById('createCodigo').value.trim();
    const restaurante_fk = document.getElementById('createRestaurante').value.trim();
    const menu_fk = document.getElementById('createMenu').value.trim();


    if ( !url || !codigo_qr || !restaurante_fk || !menu_fk ) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    showLoading(true);

    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, codigo_qr, restaurante_fk, menu_fk })
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Qr menu creada correctamente');
    modalCrearQrMenu.hide();
    cargarQrMenu();
  } catch (error) {
    console.error('Error al crear qr-menu:', error);
    showAlert('error', 'Error al crear el qr-menu');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarQrMenu(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar este Qr-menu?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) eliminarQrMenu(id);
  });
}

async function eliminarQrMenu(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'qr menu eliminado correctamente');
    cargarQrMenu();
  } catch (error) {
    console.error('Error al eliminar qr-menu:', error);
    showAlert('error', 'Error al eliminar la qr-menu');
  } finally {
    showLoading(false);
  }
}



// Exponer funciones al ámbito global
window.abrirModalEditarQrMenu = abrirModalEditarQrMenu;
window.confirmarEliminarQrMenu = confirmarEliminarQrMenu;
window.abrirModalCrearQrMenu = abrirModalCrearQrMenu;
//</create_file>
