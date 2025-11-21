let menusGlobal = [];
let categoriasGlobal = [];
let productoData = {};

document.addEventListener('DOMContentLoaded', () => {
    const productoTableBody = document.getElementById('productoTableBody');
    const editProductoForm = document.getElementById('editProductoForm');
    const createProductoForm = document.getElementById('createProductoForm');

    // ✅ Obtener el ID del restaurante una sola vez
    function getRestauranteId() {
        const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
        const restauranteId = usuarioData.restaurante_fk;
        if (!restauranteId) {
            console.error('No se encontró el ID del restaurante del usuario');
            Swal.fire({
                icon: 'warning',
                title: 'Restaurante no configurado',
                text: 'No se encontró información del restaurante'
            });
            return null;
        }
        return restauranteId;
    }

    // ✅ Cargar datos en secuencia garantizada CON restauranteId
    async function inicializarDatos() {
        try {
            const restauranteId = getRestauranteId();
            if (!restauranteId) return;

            console.log('Iniciando carga de menús para restaurante:', restauranteId);
            await fetchMenus(restauranteId);
            
            console.log('Iniciando carga de categorías para restaurante:', restauranteId);
            await fetchCategorias(restauranteId);
            
            console.log('Iniciando carga de productos para restaurante:', restauranteId);
            await fetchProductos(restauranteId);
            
            console.log('Todos los datos cargados correctamente');
        } catch (error) {
            console.error('Error al inicializar datos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar datos',
                text: 'No se pudieron cargar los datos necesarios'
            });
        }
    }

    // ✅ Iniciar la carga secuencial
    inicializarDatos();

    async function fetchMenus(restauranteId) {
        try {
            const res = await fetch(`http://192.168.0.9:3000/renard/menu?restaurante_fk=${restauranteId}`, {
                headers: {
                    'Autorizado': localStorage.getItem('token')
                }
            });
            
            if (!res.ok) {
                throw new Error(`Error HTTP! estado: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Datos de menús recibidos:', data);

            let menus = [];
            if (Array.isArray(data)) {
                menus = data;
            } else if (data && Array.isArray(data.data)) {
                menus = data.data;
            } else {
                console.warn('Estructura de respuesta inesperada para menús:', data);
                menus = [];
            }

            menusGlobal = menus;
            console.log(`Menús cargados para restaurante ${restauranteId}: ${menusGlobal.length}`);
            llenarSelectMenus();
            
        } catch (error) {
            console.error('Error al obtener menús:', error);
            throw error;
        }
    }

    async function fetchCategorias(restauranteId) {
        try {
            const res = await fetch(`http://192.168.0.9:3000/renard/categoria?restaurante_fk=${restauranteId}`, {
                headers: {
                    'Autorizado': localStorage.getItem('token')
                }
            });
            
            if (!res.ok) {
                throw new Error(`Error HTTP! estado: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Datos de categorías recibidos:', data);

            let categorias = [];
            if (Array.isArray(data)) {
                categorias = data;
            } else if (data && Array.isArray(data.data)) {
                categorias = data.data;
            } else {
                console.warn('Estructura de respuesta inesperada para categorías:', data);
                categorias = [];
            }

            categoriasGlobal = categorias;
            console.log(`Categorías cargadas para restaurante ${restauranteId}: ${categoriasGlobal.length}`);
            llenarSelectCategorias();
            
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            throw error;
        }
    }

    async function fetchProductos(restauranteId) {
        try {
            const res = await fetch(`http://192.168.0.9:3000/renard/productos?restaurante_fk=${restauranteId}`, {
                headers: {
                    'Autorizado': localStorage.getItem('token')
                }
            });
            
            if (!res.ok) {
                throw new Error(`Error HTTP! estado: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Datos de productos recibidos (todos los restaurantes):', data);

            let productos = [];
            if (Array.isArray(data)) {
                productos = data;
            } else if (data && Array.isArray(data.data)) {
                productos = data.data;
            } else {
                console.warn('Estructura de respuesta inesperada para productos:', data);
                productos = [];
            }

            const menuIdsDelRestaurante = menusGlobal.map(menu => menu.id_menu);
            const productosFiltrados = productos.filter(producto => 
                menuIdsDelRestaurante.includes(producto.menu_fk)
            );

            console.log(`Productos totales recibidos: ${productos.length}`);
            console.log(`Menús del restaurante ${restauranteId}:`, menuIdsDelRestaurante);
            console.log(`Productos después del filtrado: ${productosFiltrados.length}`);
            
            renderProductos(productosFiltrados);
            
        } catch (error) {
            console.error('Error al obtener productos:', error);
            renderProductos([]);
            throw error;
        }
    }

    function getNombreMenu(idMenu) {
        const menu = menusGlobal.find(m => m.id_menu == idMenu);
        const nombre = menu ? menu.nombre : `Desconocido (ID: ${idMenu})`;
        return nombre;
    }

    function getNombreCategoria(idCategoria) {
        const categoria = categoriasGlobal.find(c => c.id_categoria == idCategoria);
        const nombre = categoria ? categoria.nombre : `Desconocido (ID: ${idCategoria})`;
        return nombre;
    }

    function renderProductos(productos) {
        productoTableBody.innerHTML = '';
        
        if (!Array.isArray(productos)) {
            console.error('Productos no es un array:', productos);
            productoTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Error al cargar productos</td></tr>';
            return;
        }

        if (productos.length === 0) {
            productoTableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i> No hay productos registrados para este restaurante
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        productos.forEach(item => {
            productoData[item.id_producto] = item;

            const imagenSrc = item.imagenproducto ? `../../../assets/img/producto/${item.imagenproducto}` : '';

            productoTableBody.innerHTML += `
                <tr>
                    <td class="text-center align-middle">${item.id_producto}</td>
                    <td class="text-start align-middle">${item.nombre}</td>
                    <td class="text-end align-middle">${item.precio.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                    <td class="text-start align-middle" style="max-width: 300px; white-space: normal;">${item.descripcion}</td>
                    <td class="text-start align-middle">${getNombreMenu(item.menu_fk)}</td>
                    <td class="text-start align-middle">${getNombreCategoria(item.categoria_fk)}</td>
                    <td class="text-center align-middle">
                        ${imagenSrc ? `<img src="${imagenSrc}" alt="Imagen" style="max-width: 80px; max-height: 60px; object-fit: cover; border-radius: 5px;">` : 'Sin imagen'}
                    </td>
                    <td class="text-center align-middle">${new Date(item.created_at || '').toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td class="text-center align-middle">${new Date(item.updated_at || '').toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td class="text-center align-middle">
                        <button class="btn btn-sm btn-info btn-view" data-id="${item.id_producto}" title="Ver">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning btn-edit" data-id="${item.id_producto}" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${item.id_producto}" title="Eliminar">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        agregarEventListeners();
    }

    function agregarEventListeners() {
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                abrirModalVerProducto(parseInt(id));
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                abrirModalEditarProducto(parseInt(id));
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                eliminarProducto(parseInt(id));
            });
        });
    }

    // Abrir modal y rellenar datos para editar
    function abrirModalEditarProducto(id_producto) {
        const item = productoData[id_producto];
        if (!item) {
            console.error('Producto no encontrado:', id_producto);
            return;
        }

        llenarSelectMenus();
        llenarSelectCategorias();

        document.getElementById('editProductoId').value = item.id_producto;
        document.getElementById('editNombre').value = item.nombre;
        document.getElementById('editPrecio').value = item.precio;
        document.getElementById('editDescripcion').value = item.descripcion;
        document.getElementById('editMenu').value = item.menu_fk.toString();
        document.getElementById('editCategoria').value = item.categoria_fk.toString();

        const modalElement = document.getElementById('editProductoModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    // Abrir modal para ver detalles
    function abrirModalVerProducto(id_producto) {
        const item = productoData[id_producto];
        if (!item) {
            console.error('Producto no encontrado:', id_producto);
            return;
        }

        document.getElementById('viewProductoId').textContent = item.id_producto;
        document.getElementById('viewNombre').textContent = item.nombre;
        document.getElementById('viewPrecio').textContent = item.precio.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        document.getElementById('viewDescripcion').textContent = item.descripcion;
        document.getElementById('viewMenu').textContent = getNombreMenu(item.menu_fk);
        document.getElementById('viewCategoria').textContent = getNombreCategoria(item.categoria_fk);
        document.getElementById('viewImagen').src = item.imagenproducto ? `../../../assets/img/producto/${item.imagenproducto}` : '';
        document.getElementById('viewCreatedAt').textContent = new Date(item.created_at || '').toLocaleString('es-CO');
        document.getElementById('viewUpdatedAt').textContent = new Date(item.updated_at || '').toLocaleString('es-CO');
        
        const modal = new bootstrap.Modal(document.getElementById('viewProductoModal'));
        modal.show();
    }

    // Enviar edición
    if (editProductoForm) {
        editProductoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id_producto = document.getElementById('editProductoId').value;
            const nombre = document.getElementById('editNombre').value;
            const precio = document.getElementById('editPrecio').value;
            const descripcion = document.getElementById('editDescripcion').value;
            const menu_fk = document.getElementById('editMenu').value;
            const categoria_fk = document.getElementById('editCategoria').value;

            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('precio', precio);
            formData.append('descripcion', descripcion);
            formData.append('menu_fk', menu_fk);
            formData.append('categoria_fk', categoria_fk);

            const imagen = document.getElementById('editImagen').files[0];
            if (imagen) {
                formData.append('imagenproducto', imagen);
            }

            try {
                const res = await fetch(`http://192.168.0.9:3000/renard/productos/${id_producto}`, {
                    method: 'PUT',
                    headers: {
                        'Autorizado': localStorage.getItem('token')
                    },
                    body: formData
                });

                if (res.ok) {
                    // Recargar los datos después de editar
                    const restauranteId = getRestauranteId();
                    if (restauranteId) {
                        await fetchProductos(restauranteId);
                    }
                    bootstrap.Modal.getInstance(document.getElementById('editProductoModal')).hide();
                    Swal.fire({
                        icon: 'success',
                        title: 'Producto actualizado correctamente',
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al actualizar producto',
                        showConfirmButton: true
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error en la solicitud',
                    showConfirmButton: true
                });
            }
        });
    }

    // Manejar envío del formulario de creación de producto
    if (createProductoForm) {
        createProductoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('createNombre').value;
            const precio = document.getElementById('createPrecio').value;
            const descripcion = document.getElementById('createDescripcion').value;
            const menu_fk = document.getElementById('createMenu').value;
            const categoria_fk = document.getElementById('createCategoria').value;

            if (!nombre || !precio || !descripcion || !menu_fk || !categoria_fk) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Por favor, completa todos los campos.',
                    showConfirmButton: false,
                    timer: 2000
                });
                return;
            }

            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('precio', precio);
            formData.append('descripcion', descripcion);
            formData.append('menu_fk', parseInt(menu_fk));
            formData.append('categoria_fk', parseInt(categoria_fk));
            const imagen = document.getElementById('createImagen').files[0];
            if (imagen) {
                formData.append('imagenproducto', imagen);
            }

            try {
                const response = await fetch('http://192.168.0.9:3000/renard/productos', {
                    method: 'POST',
                    headers: {
                        'Autorizado': localStorage.getItem('token')
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Producto creado correctamente',
                        showConfirmButton: false,
                        timer: 2000
                    });
                    createProductoForm.reset();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createProductoModal'));
                    modal.hide();
                    
                    // Recargar los datos después de crear
                    const restauranteId = getRestauranteId();
                    if (restauranteId) {
                        await fetchProductos(restauranteId);
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al crear producto: ' + (result.error || ''),
                        showConfirmButton: true
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al conectar con el servidor: ' + error.message,
                    showConfirmButton: true
                });
            }
        });
    }

    function llenarSelectMenus() {
        const createMenuSelect = document.getElementById('createMenu');
        const editMenuSelect = document.getElementById('editMenu');

        if (!createMenuSelect || !editMenuSelect) {
            console.error('No se encontraron los select de menú en el DOM');
            return;
        }

        createMenuSelect.innerHTML = '<option value="">Seleccione un menú</option>';
        editMenuSelect.innerHTML = '<option value="">Seleccione un menú</option>';

        menusGlobal.forEach(menu => {
            const optionCreate = document.createElement('option');
            optionCreate.value = menu.id_menu;
            optionCreate.textContent = menu.nombre;
            createMenuSelect.appendChild(optionCreate);

            const optionEdit = document.createElement('option');
            optionEdit.value = menu.id_menu;
            optionEdit.textContent = menu.nombre;
            editMenuSelect.appendChild(optionEdit);
        });
    }

    function llenarSelectCategorias() {
        const createCategoriaSelect = document.getElementById('createCategoria');
        const editCategoriaSelect = document.getElementById('editCategoria');

        if (!createCategoriaSelect || !editCategoriaSelect) {
            console.error('No se encontraron los select de categoría en el DOM');
            return;
        }

        createCategoriaSelect.innerHTML = '<option value="">Seleccione una categoría</option>';
        editCategoriaSelect.innerHTML = '<option value="">Seleccione una categoría</option>';

        categoriasGlobal.forEach(categoria => {
            const optionCreate = document.createElement('option');
            optionCreate.value = categoria.id_categoria;
            optionCreate.textContent = categoria.nombre;
            createCategoriaSelect.appendChild(optionCreate);

            const optionEdit = document.createElement('option');
            optionEdit.value = categoria.id_categoria;
            optionEdit.textContent = categoria.nombre;
            editCategoriaSelect.appendChild(optionEdit);
        });
    }

    // Eliminar producto
    async function eliminarProducto(id_producto) {
        Swal.fire({
            title: '¿Estás seguro de que deseas eliminar este producto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`http://192.168.0.9:3000/renard/productos/${id_producto}`, {
                        method: 'DELETE',
                        headers: {
                            'Autorizado': localStorage.getItem('token')
                        }
                    });

                    if (res.ok) {
                        // Recargar los datos después de eliminar
                        const restauranteId = getRestauranteId();
                        if (restauranteId) {
                            await fetchProductos(restauranteId);
                        }
                        Swal.fire({
                            icon: 'success',
                            title: 'Producto eliminado correctamente',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar producto',
                            showConfirmButton: true
                        });
                    }
                } catch (error) {
                    console.error('Error en la solicitud DELETE:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en la solicitud DELETE',
                        showConfirmButton: true
                    });
                }
            }
        });
    }
});

// ✅ Función global para recargar datos
function recargarProductos() {
    console.log('Recargando productos...');
    location.reload();
}