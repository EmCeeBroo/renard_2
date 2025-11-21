// Variables globales
let modalProducto;
let allProductos = [];
let categoriaMap = {};
let menuMap = {};

const URL = "http://192.168.0.9:3000/renard/productos"; 
const MENU = "http://192.168.0.9:3000/renard/menu";
const CATEGORIA = "http://192.168.0.9:3000/renard/categoria";

async function init() {
    await cargarMenus();
    await cargarCategorias();
    await cargarProductos();

    // Esperar un poco para que el sidebar se cargue completamente
    setTimeout(() => {
      inicializarEventListeners();
    }, 100);
  }


// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  modalProducto = new bootstrap.Modal(document.getElementById('createProductoModal'));
  init();
});

// Cargar menús para los filtros y formularios
async function cargarMenus() {
  try {
    const response = await fetch(MENU);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const menus = await response.json();

    // Crear mapa de id_menu a nombre
    menuMap = {};
    menus.forEach(menu => {
      menuMap[menu.id_menu] = menu.nombre;
    });

    llenarSelectMenus(menus);
    llenarFiltroMenus(menus);
  } catch (error) {
    console.error('Error al cargar menús:', error);
  }
}

// Llenar los select de menús
function llenarSelectMenus(menus) {
  const selects = ['createMenu', 'editMenu'];

  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      // Mantener la primera opción
      const firstOption = select.querySelector('option');
      select.innerHTML = '';
      if (firstOption) select.appendChild(firstOption);

      menus.forEach(menu => {
        const option = document.createElement('option');
        option.value = menu.id_menu;
        option.textContent = menu.nombre;
        select.appendChild(option);
      });
    }
  });
}

// Llenar el filtro de menús
function llenarFiltroMenus(menus) {
  const filtroMenu = document.getElementById('filtroMenu');
  if (!filtroMenu) return;

  // Mantener la primera opción
  const firstOption = filtroMenu.querySelector('option');
  filtroMenu.innerHTML = '';
  if (firstOption) filtroMenu.appendChild(firstOption);

  menus.forEach(menu => {
    const option = document.createElement('option');
    option.value = menu.id_menu;
    option.textContent = menu.nombre;
    filtroMenu.appendChild(option);
  });
}

// Función separada para inicializar event listeners
function inicializarEventListeners() {
  // Event listeners para filtros
  const inputBuscar = document.getElementById('buscarProducto');
  const selectCategoria = document.getElementById('filtroCategoria');
  const selectMenu = document.getElementById('filtroMenu');

  if (inputBuscar) {
    inputBuscar.addEventListener('input', () => {
      aplicarFiltros();
    });
  }

  if (selectCategoria) {
    selectCategoria.addEventListener('change', () => {
      aplicarFiltros();
    });
  }

  if (selectMenu) {
    selectMenu.addEventListener('change', () => {
      aplicarFiltros();
    });
  }

  // Event listeners para formularios
  const createForm = document.getElementById('createProductoForm');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await crearProducto();
    });
  }

  const editForm = document.getElementById('editProductoForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await editarProducto();
    });
  }

  const btnAgregar = document.getElementById('btnAgregar');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      const createForm = document.getElementById('createProductoForm');
      if (createForm) createForm.reset();
      const modalTitle = document.getElementById('createProductoModalLabel');
      if (modalTitle) modalTitle.textContent = 'Crear Nuevo Producto';
      modalProducto.show();
    });
  }
}

// Cargar categorías para los filtros y formularios
async function cargarCategorias() {
  try {
    const response = await fetch(CATEGORIA);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const categorias = await response.json();

    // Crear mapa de id_categoria a nombre
    categoriaMap = {};
    categorias.forEach(cat => {
      categoriaMap[cat.id_categoria] = cat.nombre;
    });

    llenarSelectCategorias(categorias);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// Llenar los select de categorías
function llenarSelectCategorias(categorias) {
  const selects = ['filtroCategoria', 'createCategoria', 'editCategoria'];

  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      // Mantener la primera opción
      const firstOption = select.querySelector('option');
      select.innerHTML = '';
      if (firstOption) select.appendChild(firstOption);

      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id_categoria;
        option.textContent = categoria.nombre;
        select.appendChild(option);
      });
    }
  });
}

// Cargar todos los productos sin filtros
async function cargarProductos() {
  try {
    showLoading(true);
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const productos = await response.json();

    // Almacenar todos los productos en la variable global
    allProductos = productos;

    // Aplicar filtros actuales si existen
    aplicarFiltros();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    showAlert('error', 'No se pudieron cargar los productos');
  } finally {
    showLoading(false);
  }
}

// Aplicar filtros en el frontend
function aplicarFiltros() {
  const inputBuscar = document.getElementById('buscarProducto');
  const selectCategoria = document.getElementById('filtroCategoria');
  const selectMenu = document.getElementById('filtroMenu');

  const nombreFiltro = inputBuscar ? inputBuscar.value.trim().toLowerCase() : '';
  const categoriaFiltro = selectCategoria ? selectCategoria.value : '';
  const menuFiltro = selectMenu ? selectMenu.value : '';

  let productosFiltrados = allProductos;

  // Filtrar por nombre
  if (nombreFiltro) {
    productosFiltrados = productosFiltrados.filter(producto =>
      producto.nombre && producto.nombre.toLowerCase().includes(nombreFiltro) // ✅ AGREGADO: Validación
    );
  }

  // Filtrar por categoría
  if (categoriaFiltro) {
    productosFiltrados = productosFiltrados.filter(producto =>
      producto.categoria_fk == categoriaFiltro
    );
  }

  // Filtrar por menú
  if (menuFiltro) {
    productosFiltrados = productosFiltrados.filter(producto =>
      producto.menu_fk == menuFiltro
    );
  }

  renderizarProductos(productosFiltrados);
}

// Renderizar productos en la tabla
function renderizarProductos(productos) {
  const tbody = document.getElementById('productoTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center">No hay productos registrados</td>
      </tr>
    `;
    return;
  }

  productos.forEach(producto => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${producto.id_producto}</td>
      <td>${producto.nombre}</td>
      <td>$${producto.precio}</td>
      <td>${producto.descripcion}</td>
      <td>${menuMap[producto.menu_fk] || producto.menu_fk || 'Sin menú'}</td>
      <td>${categoriaMap[producto.categoria_fk] || producto.categoria_fk}</td>
      <td>
        ${producto.imagenproducto ? `<img src="../public/assets/img/producto/${producto.imagenproducto}" alt="${producto.nombre}" class="img-thumbnail" style="width: 50px; height: 50px;">` : 'Sin imagen'}
      </td>
      <td>${producto.created_at ? new Date(producto.created_at).toLocaleDateString() : ''}</td>
      <td>${producto.updated_at ? new Date(producto.updated_at).toLocaleDateString() : ''}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-view" onclick="verProducto(${producto.id_producto})" title="Ver">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn-action btn-edit" onclick="abrirModalEditarProducto(${producto.id_producto})" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" onclick="confirmarEliminarProducto(${producto.id_producto})" title="Eliminar">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function crearProducto() {
  const formData = new FormData();
  formData.append('nombre', document.getElementById('createNombre').value.trim());
  formData.append('precio', document.getElementById('createPrecio').value);
  formData.append('descripcion', document.getElementById('createDescripcion').value.trim());
  formData.append('categoria_fk', document.getElementById('createCategoria').value);
  formData.append('menu_fk', document.getElementById('createMenu').value);

  const imagenInput = document.getElementById('createImagen');
  if (imagenInput.files[0]) {
    formData.append('imagenproducto', imagenInput.files[0]);
  }

  try {
    showLoading(true);
    const response = await fetch(URL, {
      method: 'POST',
      body: formData
    });

    // Debug: mostrar respuesta del servidor
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      // Intentar obtener más información del error
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      // Verificar si es HTML (error del servidor)
      if (errorText.includes('<!DOCTYPE')) {
        throw new Error('Error interno del servidor. Verifique la consola del backend.');
      }
      
      // Intentar parsear como JSON si es posible
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Error al crear producto');
      } catch (e) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }

    showAlert('success', 'Producto creado correctamente');
    modalProducto.hide();
    cargarProductos();
  } catch (error) {
    console.error('Error al crear producto:', error);
    showAlert('error', error.message || 'Error al crear el producto');
  } finally {
    showLoading(false);
  }
}

// Editar producto
async function editarProducto() {
  const id = document.getElementById('editProductoId').value;
  const formData = new FormData();
  formData.append('nombre', document.getElementById('editNombre').value.trim());
  formData.append('precio', document.getElementById('editPrecio').value);
  formData.append('descripcion', document.getElementById('editDescripcion').value.trim());
  formData.append('categoria_fk', document.getElementById('editCategoria').value);
  formData.append('menu_fk', document.getElementById('editMenu').value);

  const imagenInput = document.getElementById('editImagen');
  if (imagenInput.files[0]) {
    formData.append('imagenproducto', imagenInput.files[0]);
  }

  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`, {
      method: 'PUT',
      body: formData
    });

    console.log('Edit response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      if (errorText.includes('<!DOCTYPE')) {
        throw new Error('Error interno del servidor. Verifique la consola del backend.');
      }
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Error al editar producto');
      } catch (e) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }

    const result = await response.json();
    console.log(result);
    showAlert('success', 'Producto actualizado correctamente');
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editProductoModal'));
    if (editModal) editModal.hide();
    cargarProductos();
  } catch (error) {
    console.error('Error al editar producto:', error);
    showAlert('error', error.message || 'Error al editar el producto');
  } finally {
    showLoading(false);
  }
}

// Ver detalles del producto
async function verProducto(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const producto = await response.json();

    document.getElementById('viewId').textContent = producto.id_producto;
    document.getElementById('viewNombre').textContent = producto.nombre;
    document.getElementById('viewPrecio').textContent = `$${producto.precio}`;
    document.getElementById('viewDescripcion').textContent = producto.descripcion;
    document.getElementById('viewMenu').textContent = menuMap[producto.menu_fk] || 'Sin menú';
    document.getElementById('viewCategoria').textContent = categoriaMap[producto.categoria_fk] || 'Sin categoría';
    
    const viewImagen = document.getElementById('viewImagen'); // ✅ AGREGADO: Variable
    if (viewImagen) { // ✅ AGREGADO: Validación
      viewImagen.src = producto.imagenproducto ? `../../assets/img/producto/${producto.imagenproducto}` : '';
    }
    
    document.getElementById('viewCreatedAt').textContent = producto.created_at ? new Date(producto.created_at).toLocaleDateString() : '';
    document.getElementById('viewUpdatedAt').textContent = producto.updated_at ? new Date(producto.updated_at).toLocaleDateString() : '';

    const viewModal = new bootstrap.Modal(document.getElementById('viewProductoModal'));
    viewModal.show();
  } catch (error) {
    console.error('Error al cargar detalles del producto:', error);
    showAlert('error', 'No se pudieron cargar los detalles del producto');
  } finally {
    showLoading(false);
  }
}

// Abrir modal de edición
async function abrirModalEditarProducto(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const producto = await response.json();

    // Llenar el formulario de edición
    document.getElementById('editProductoId').value = producto.id_producto;
    document.getElementById('editNombre').value = producto.nombre;
    document.getElementById('editPrecio').value = producto.precio;
    document.getElementById('editDescripcion').value = producto.descripcion;
    document.getElementById('editCategoria').value = producto.categoria_fk || '';
    document.getElementById('editMenu').value = producto.menu_fk || '';

    // Cambiar título del modal
    const modalTitle = document.getElementById('editProductoModalLabel'); // ✅ AGREGADO: Variable
    if (modalTitle) { // ✅ AGREGADO: Validación
      modalTitle.textContent = 'Editar Producto';
    }

    // Mostrar modal de edición
    const editModal = new bootstrap.Modal(document.getElementById('editProductoModal'));
    editModal.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar el producto');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarProducto(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar este producto?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      eliminarProducto(id);
    }
  });
}

// Eliminar producto
async function eliminarProducto(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorText = await response.text(); // ✅ CORREGIDO: response.text() en lugar de response.json()
      throw new Error(errorText || 'Error al eliminar');
    }
    showAlert('success', 'Producto eliminado correctamente');
    cargarProductos();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    showAlert('error', 'Error al eliminar el producto');
  } finally {
    showLoading(false);
  }
}

// Mostrar alerta
function showAlert(type, message) {
  Swal.fire({
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2000
  });
}

// Mostrar/ocultar loading
function showLoading(show) {
  const loadingElement = document.getElementById('loadingOverlay');
  if (loadingElement) {
    loadingElement.style.display = show ? 'flex' : 'none';
  }
}

// ✅ AGREGADO: Exportar funciones al global scope
globalThis.verProducto = verProducto;
globalThis.abrirModalEditarProducto = abrirModalEditarProducto;
globalThis.confirmarEliminarProducto = confirmarEliminarProducto;
globalThis.eliminarProducto = eliminarProducto;