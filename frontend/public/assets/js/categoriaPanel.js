import { showAlert, showLoading } from '../../assets/js/utils.js';

let modalCategoria;
let modalEditCategoria;
let categoriasData = [];
let filtroBusqueda = '';

const URL = "http://127.0.0.1:3000/renard/categoria"; 

document.addEventListener('DOMContentLoaded', () => {
  modalCategoria = new bootstrap.Modal(document.getElementById('createCategoriaModal'));
  modalEditCategoria = new bootstrap.Modal(document.getElementById('editCategoriaModal'));

  // Cargar categorías
  initializeData();

  const buscarInput = document.getElementById('buscarInput');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      filtroBusqueda = e.target.value.toLowerCase();
      filtrarCategorias();
    });
  }

  const createForm = document.getElementById('createCategoriaForm');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('createNombre').value.trim();

      if (!nombre) {
        showAlert('warning', 'Todos los campos son obligatorios');
        return;
      }
      const data = { nombre };

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

        showAlert('success', 'Categoría agregada');
        modalCategoria.hide();
        createForm.reset();
        cargarCategorias();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al guardar la categoría.');
      } finally {
        showLoading(false);
      }
    });
  }

  const editForm = document.getElementById('editCategoriaForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('editCategoriaId').value;
      const nombre = document.getElementById('editNombre').value.trim();

      if (!nombre) {
        showAlert('warning', 'Todos los campos son obligatorios');
        return;
      }

      const data = { nombre };

      try {
        showLoading(true);
        const response = await fetch(`${URL}/${id}`, {  // ✅ CORREGIDO: Faltaba cerrar comillas
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error en la operación');
        }

        showAlert('success', 'Categoría actualizada');
        modalEditCategoria.hide();
        cargarCategorias();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al guardar la categoría.');
      } finally {
        showLoading(false);
      }
    });
  }

  const btnAgregar = document.getElementById('btnAgregar');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', async () => {
      const createForm = document.getElementById('createCategoriaForm');
      if (createForm) createForm.reset();
      modalCategoria.show();
    });
  }

  const btnCancelar = document.getElementById('btnCancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', (e) => {
      e.preventDefault();
      modalCategoria.hide();
    });
  }
});

// Función para inicializar los datos
async function initializeData() {
  try {
    await cargarCategorias();
  } catch (error) {
    console.error('Error al inicializar datos:', error);
  }
}

async function cargarCategorias() {
  try {
    showLoading(true);
    const response = await fetch(URL);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    categoriasData = await response.json();
    renderizarCategorias(categoriasData);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    showAlert('error', 'No se pudieron cargar las categorías');
  } finally {
    showLoading(false);
  }
}

// ✅ AGREGADA: Función para filtrar categorías
function filtrarCategorias() {
  const categoriasFiltradas = categoriasData.filter(categoria => 
    categoria.nombre.toLowerCase().includes(filtroBusqueda) ||
    categoria.id_categoria.toString().includes(filtroBusqueda)
  );
  renderizarCategorias(categoriasFiltradas);
}

function renderizarCategorias(categorias) {
  const tbody = document.querySelector('#categoriaTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (categorias.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No hay categorías registradas</td>  {/* ✅ CORREGIDO: colspan de 6 a 5 */}
      </tr>
    `;
    return;
  }

  categorias.forEach(categoria => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${categoria.id_categoria}</td>
      <td>${categoria.nombre}</td>
      <td>${categoria.created_at ? new Date(categoria.created_at).toLocaleDateString() : 'N/A'}</td>
      <td>${categoria.updated_at ? new Date(categoria.updated_at).toLocaleDateString() : 'N/A'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="abrirModalEditarCategoria(${categoria.id_categoria})" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" onclick="confirmarEliminarCategoria(${categoria.id_categoria})" title="Eliminar">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function abrirModalEditarCategoria(id) {
  try {
    showLoading(true);
  
    const response = await fetch(`${URL}/${id}`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    
    const categoria = await response.json();
    
    // Llenar los campos del modal
    document.getElementById('editCategoriaId').value = categoria.id_categoria;
    document.getElementById('editNombre').value = categoria.nombre;
    modalEditCategoria.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar la categoría: ' + error.message);
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarCategoria(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar esta categoría?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      eliminarCategoria(id);
    }
  });
}

async function eliminarCategoria(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Error al eliminar');
    }
    showAlert('success', 'Categoría eliminada correctamente');
    cargarCategorias();
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    showAlert('error', error.message || 'Error al eliminar la categoría');
  } finally {
    showLoading(false);
  }
}

// Exportar funciones al objeto window para que sean accesibles desde HTML
globalThis.abrirModalEditarCategoria = abrirModalEditarCategoria;
globalThis.confirmarEliminarCategoria = confirmarEliminarCategoria;