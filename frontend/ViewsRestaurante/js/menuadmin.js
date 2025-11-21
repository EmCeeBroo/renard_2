import { showAlert, showLoading } from '../../assets/js/utils.js';

let createMenuModal;
let editMenuModal;
let menusData = [];
let filtroBusqueda = '';

document.addEventListener('DOMContentLoaded', () => {
  createMenuModal = new bootstrap.Modal(document.getElementById('createMenuModal'));
  editMenuModal = new bootstrap.Modal(document.getElementById('editMenuModal'));

  // Obtener el ID del restaurante del usuario logueado (igual que en categorías)
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
  const restauranteId = usuarioData.restaurante_fk;

  if (!restauranteId) {
    console.error('No se encontró el ID del restaurante del usuario');
    return;
  }

  cargarMenus();

  const buscarInput = document.getElementById('buscarInput');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      filtroBusqueda = e.target.value.toLowerCase();
      filtrarMenus();
    });
  }

  const createMenuForm = document.getElementById('createMenuForm');
  if (createMenuForm) {
    createMenuForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('createNombre').value.trim();
      const descripcion = document.getElementById('createDescripcion').value.trim();

      if (!nombre) {
        showAlert('warning', 'El nombre es obligatorio');
        return;
      }

      // Obtener el restaurante_fk del contexto (localStorage, usuario actual, etc.)
      const restaurante_fk = getRestauranteFk();
      
      if (!restaurante_fk) {
        showAlert('error', 'No se pudo identificar el restaurante. Por favor, inicie sesión nuevamente.');
        return;
      }

      const data = { nombre, descripcion, restaurante_fk };

      try {
        showLoading(true);
        const response = await fetch('http://127.0.0.1:3000/renard/menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error en la operación');
        }

        showAlert('success', 'Menú creado correctamente');
        createMenuModal.hide();
        createMenuForm.reset();
        cargarMenus();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al crear el menú');
      } finally {
        showLoading(false);
      }
    });
  }

  const editMenuForm = document.getElementById('editMenuForm');
  if (editMenuForm) {
    editMenuForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('editMenuId').value;
      const nombre = document.getElementById('editNombre').value.trim();
      const descripcion = document.getElementById('editDescripcion').value.trim();

      if (!nombre) {
        showAlert('warning', 'El nombre es obligatorio');
        return;
      }

      // Obtener el restaurante_fk del contexto
      const restaurante_fk = getRestauranteFk();
      
      if (!restaurante_fk) {
        showAlert('error', 'No se pudo identificar el restaurante. Por favor, inicie sesión nuevamente.');
        return;
      }

      const data = { nombre, descripcion, restaurante_fk };

      try {
        showLoading(true);
        const response = await fetch(`http://127.0.0.1:3000/renard/menu/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error en la operación');
        }

        showAlert('success', 'Menú actualizado correctamente');
        editMenuModal.hide();
        cargarMenus();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al actualizar el menú');
      } finally {
        showLoading(false);
      }
    });
  }

  const btnAgregar = document.getElementById('btnAgregar');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      const createForm = document.getElementById('createMenuForm');
      if (createForm) createForm.reset();
      createMenuModal.show();
    });
  }

  const btnCancelar = document.getElementById('btnCancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', (e) => {
      e.preventDefault();
      createMenuModal.hide();
    });
  }
});

// Función para obtener el restaurante_fk del contexto actual
function getRestauranteFk() {
  // Obtener el ID del restaurante del usuario logueado (igual que en categorías)
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
  const restauranteId = usuarioData.restaurante_fk;

  if (!restauranteId) {
    console.error('No se encontró el ID del restaurante del usuario');
    return null;
  }

  return restauranteId;
}

async function cargarMenus() {
  try {
    showLoading(true);
    
    // Obtener el restaurante_fk para filtrar los menús
    const restauranteFk = getRestauranteFk();
    
    // Construir la URL con o sin filtro de restaurante
    const url = restauranteFk 
      ? `http://127.0.0.1:3000/renard/menu?restaurante_fk=${restauranteFk}`
      : 'http://127.0.0.1:3000/renard/menu';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    menusData = await response.json();
    filtrarMenus();
  } catch (error) {
    console.error('Error al cargar menús:', error);
    showAlert('error', 'No se pudieron cargar los menús');
  } finally {
    showLoading(false);
  }
}

function filtrarMenus() {
  const filtrados = menusData.filter(menu =>
    menu.nombre.toLowerCase().includes(filtroBusqueda) ||
    (menu.descripcion && menu.descripcion.toLowerCase().includes(filtroBusqueda))
  );
  renderizarMenus(filtrados);
}

function renderizarMenus(menus) {
  const tbody = document.getElementById('menuTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (menus.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">No hay menús registrados</td>
      </tr>
    `;
    return;
  }

  menus.forEach(menu => {
    const fechaCreacion = menu.created_at
      ? new Date(menu.created_at).toLocaleDateString('es-ES')
      : 'N/A';

    const fechaActualizacion = menu.updated_at
      ? new Date(menu.updated_at).toLocaleDateString('es-ES')
      : 'N/A';

    const nombreRestaurante = menu.restaurante && menu.restaurante.nombre
      ? menu.restaurante.nombre
      : 'Sin restaurante';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${menu.id_menu}</td>
      <td>${menu.nombre}</td>
      <td>${menu.descripcion || ''}</td>
      <td>${nombreRestaurante}</td>
      <td>${fechaCreacion}</td>
      <td>${fechaActualizacion}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="abrirModalEditarMenu(${menu.id_menu})" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" onclick="confirmarEliminarMenu(${menu.id_menu})" title="Eliminar">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function abrirModalEditarMenu(id) {
  try {
    showLoading(true);
    const response = await fetch(`http://127.0.0.1:3000/renard/menu/${id}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const menu = await response.json();
    document.getElementById('editMenuId').value = menu.id_menu;
    document.getElementById('editNombre').value = menu.nombre;
    document.getElementById('editDescripcion').value = menu.descripcion || '';
    editMenuModal.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar el menú');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarMenu(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar este menú?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
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
    const response = await fetch(`http://127.0.0.1:3000/renard/menu/${id}`, {
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