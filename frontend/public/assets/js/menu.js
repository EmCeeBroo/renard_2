import { showAlert, showLoading } from '../../assets/js/utils.js';

let modalMenu;
let modalEditMenu;
let menusData = [];
let restaurantesData = [];
let filtroBusqueda = '';

const URL = "http://127.0.0.1:3000/renard/menu"; 
const RESTAURANTE = "http://127.0.0.1:3000/renard/restaurante"; 



document.addEventListener('DOMContentLoaded', () => {
  modalMenu = new bootstrap.Modal(document.getElementById('createMenuModal'));
  modalEditMenu = new bootstrap.Modal(document.getElementById('modalEditarMenu'));

  // Cargar restaurantes primero, luego menús
  initializeData();

  const buscarInput = document.getElementById('buscarInput');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      filtroBusqueda = e.target.value.toLowerCase();
      filtrarMenus();
    });
  }

  const createForm = document.getElementById('createMenuForm');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('createNombre').value.trim();
      const descripcion = document.getElementById('createDescripcion').value.trim();
      const restaurante_fk = document.getElementById('createRestaurante').value;

      if (!nombre || !restaurante_fk) {
        showAlert('warning', 'Todos los campos son obligatorios');
        return;
      }

      const data = { nombre, descripcion, restaurante_fk };

      try {
        showLoading(true);
        const response = await fetch(URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error en la operación');
        }

        showAlert('success', 'Menú agregado');
        modalMenu.hide();
        createForm.reset();
        cargarMenus();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al guardar el menú.');
      } finally {
        showLoading(false);
      }
    });
  }

  const editForm = document.getElementById('formEditarMenu');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('editIdMenu').value;
      const nombre = document.getElementById('editNombre').value.trim();
      const descripcion = document.getElementById('editDescripcion').value.trim();
      const restaurante_fk = document.getElementById('editRestaurante').value;

      if (!nombre || !restaurante_fk) {
        showAlert('warning', 'Todos los campos son obligatorios');
        return;
      }

      const data = { nombre, descripcion, restaurante_fk };

      try {
        showLoading(true);
        const response = await fetch(`${URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error en la operación');
        }

        showAlert('success', 'Menú actualizado');
        modalEditMenu.hide();
        cargarMenus();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al guardar el menú.');
      } finally {
        showLoading(false);
      }
    });
  }

  const btnAgregar = document.getElementById('btnAgregar');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', async () => {
      // Asegurar que los restaurantes estén cargados antes de mostrar el modal
      if (restaurantesData.length === 0) {
        await cargarRestaurantes();
      }
      const createForm = document.getElementById('createMenuForm');
      if (createForm) createForm.reset();
      modalMenu.show();
    });
  }

  const btnCancelar = document.getElementById('btnCancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', (e) => {
      e.preventDefault();
      modalMenu.hide();
    });
  }
});

// Función para inicializar los datos
async function initializeData() {
  try {
    await cargarRestaurantes();
    await cargarMenus();
  } catch (error) {
    console.error('Error al inicializar datos:', error);
  }
}

async function cargarMenus() {
  try {
    showLoading(true);
    const response = await fetch(URL);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    menusData = await response.json();
    filtrarMenus();
  } catch (error) {
    console.error('Error al cargar menús:', error);
    showAlert('error', 'No se pudieron cargar los menús');
  } finally {
    showLoading(false);
  }
}

async function cargarRestaurantes() {
  try {
    const response = await fetch(RESTAURANTE);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    restaurantesData = await response.json();
    actualizarSelectoresRestaurante();
  } catch (error) {
    console.error('Error al cargar restaurantes:', error);
    showAlert('error', 'No se pudieron cargar los restaurantes: ' + error.message);
  }
}

function actualizarSelectoresRestaurante() {
  const createSelect = document.getElementById('createRestaurante');
  const editSelect = document.getElementById('editRestaurante');

  [createSelect, editSelect].forEach((select, index) => {
    if (select) {
      select.innerHTML = '<option value="">Seleccione un restaurante</option>';
      if (restaurantesData && restaurantesData.length > 0) {
        restaurantesData.forEach(r => {
          if (r && r.id_restaurante && r.nombre) {
            const option = document.createElement('option');
            option.value = r.id_restaurante;
            option.textContent = r.nombre;
            select.appendChild(option);
          }
        });
      } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay restaurantes disponibles';
        option.disabled = true;
        select.appendChild(option);
      }
    }
  });
}

function filtrarMenus() {
  const filtrados = menusData.filter(m =>
    m.nombre.toLowerCase().includes(filtroBusqueda) ||
    (m.descripcion && m.descripcion.toLowerCase().includes(filtroBusqueda))
  );
  renderizarMenus(filtrados);
}

function renderizarMenus(menus) {
  const tbody = document.querySelector('#menusTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (menus.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No hay menús registrados</td>
      </tr>
    `;
    return;
  }

  menus.forEach(menu => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${menu.id_menu}</td>
      <td>${menu.nombre}</td>
      <td>${menu.descripcion || ''}</td>
      <td>${menu.restaurante ? menu.restaurante.nombre : ''}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="abrirModalEditarMenu(${menu.id_menu})" title="Editar">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="confirmarEliminarMenu(${menu.id_menu})" title="Eliminar">
          <i class="bi bi-trash3-fill"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function abrirModalEditarMenu(id) {
  try {
    showLoading(true);
    if (restaurantesData.length === 0) {
      await cargarRestaurantes();
    }
    const response = await fetch(`${URL}/${id}`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    const menu = await response.json();

    document.getElementById('editIdMenu').value = menu.id_menu;
    document.getElementById('editNombre').value = menu.nombre;
    document.getElementById('editDescripcion').value = menu.descripcion || '';

    actualizarSelectoresRestaurante();

    setTimeout(() => {
      const editRestauranteSelect = document.getElementById('editRestaurante');
      if (editRestauranteSelect) {
        editRestauranteSelect.value = menu.restaurante_fk || '';
      }
    }, 100);

    modalEditMenu.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar el menú: ' + error.message);
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarMenu(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar este menú?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      eliminarMenu(id);
    }
  });
}

async function eliminarMenu(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Error al eliminar');
    }
    showAlert('success', 'Menú eliminado correctamente');
    cargarMenus();
  } catch (error) {
    console.error('Error al eliminar menú:', error);
    showAlert('error', error.message || 'Error al eliminar el menú');
  } finally {
    showLoading(false);
  }
}

// Exportar funciones al objeto window para que sean accesibles desde HTML
window.abrirModalEditarMenu = abrirModalEditarMenu;
window.confirmarEliminarMenu = confirmarEliminarMenu;
