let modalRol;
let rolesData = [];
let restaurantesData = [];
let paginaActual = 1;
let itemsPorPagina = 10;
let filtroBusqueda = '';
let filtroRestaurante = '';

const URL = "http://192.168.0.9:3000/renard/rol";
const URL_RESTAURANTES = "renard/restaurante";

// Función para mostrar/ocultar loading
function toggleLoading(mostrar) {
    const preload = document.getElementById('preloadId');
    if (mostrar) {
        preload.style.opacity = '1';
        preload.style.visibility = 'visible';
    } else {
        preload.style.opacity = '0';
        preload.style.visibility = 'hidden';
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alerta);
    
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.remove();
        }
    }, 5000);
}

// Cargar restaurantes para los filtros y select
async function cargarRestaurantes() {
    try {
        const response = await fetch(URL_RESTAURANTES);
        if (!response.ok) throw new Error('Error al cargar restaurantes');
        
        restaurantesData = await response.json();
        
        // Llenar select de restaurantes
        const selectRestaurante = document.getElementById('restaurante_fk');
        const filtroRestaurante = document.getElementById('filtroRestaurante');
        
        restaurantesData.forEach(restaurante => {
            const option = document.createElement('option');
            option.value = restaurante.id_restaurante;
            option.textContent = restaurante.nombre;
            
            const optionFiltro = option.cloneNode(true);
            
            selectRestaurante.appendChild(option);
            filtroRestaurante.appendChild(optionFiltro);
        });
    } catch (error) {
        console.error('Error cargando restaurantes:', error);
    }
}

// Cargar roles con manejo de errores mejorado
async function cargarRoles() {
    toggleLoading(true);
    try {
        const response = await fetch(URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        rolesData = await response.json();
        renderizarTabla();
    } catch (error) {
        console.error('Error al cargar roles:', error);
        mostrarNotificacion('Error al cargar los roles. Por favor intente nuevamente.', 'danger');
    } finally {
        toggleLoading(false);
    }
}

// Renderizar tabla con paginación
function renderizarTabla() {
    const tbody = document.querySelector('#tablaRol tbody');
    tbody.innerHTML = '';
    
    // Aplicar filtros
    let rolesFiltrados = rolesData.filter(rol => {
        const coincideBusqueda = !filtroBusqueda || 
            rol.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
            rol.descripcion.toLowerCase().includes(filtroBusqueda.toLowerCase());
        
        const coincideRestaurante = !filtroRestaurante || 
            rol.restaurante_fk == filtroRestaurante;
        
        return coincideBusqueda && coincideRestaurante;
    });
    
    // Calcular paginación
    const totalPaginas = Math.ceil(rolesFiltrados.length / itemsPorPagina);
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const rolesPagina = rolesFiltrados.slice(inicio, fin);
    
    // Renderizar roles
    if (rolesPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="bi bi-inbox display-4 text-muted"></i>
                    <p class="text-muted mt-2">No se encontraron roles</p>
                </td>
            </tr>
        `;
    } else {
        rolesPagina.forEach(rol => {
            const restaurante = restaurantesData.find(r => r.id_restaurante === rol.restaurante_fk);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rol.id_rol}</td>
                <td>${rol.nombre}</td>
                <td>${rol.descripcion}</td>
                <td>${restaurante ? restaurante.nombre : 'Sin asignar'}</td>
                <td>${new Date(rol.created_at || '').toLocaleString()}</td>
                <td>${new Date(rol.updated_at || '').toLocaleString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="abrirModalEditarRol(${rol.id_rol})" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="eliminarRol(${rol.id_rol})" title="Eliminar">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    renderizarPaginacion(totalPaginas);
}

// Renderizar controles de paginación
function renderizarPaginacion(totalPaginas) {
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';
    
    if (totalPaginas <= 1) return;
    
    // Botón anterior
    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">
            <i class="bi bi-chevron-left"></i>
        </a>
    `;
    paginacion.appendChild(liAnterior);
    
    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
            const li = document.createElement('li');
            li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>`;
            paginacion.appendChild(li);
        } else if (i === paginaActual - 3 || i === paginaActual + 3) {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = '<span class="page-link">...</span>';
            paginacion.appendChild(li);
        }
    }
    
    // Botón siguiente
    const liSiguiente = document.createElement('li');
    liSiguiente.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    liSiguiente.innerHTML = `
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">
            <i class="bi bi-chevron-right"></i>
        </a>
    `;
    paginacion.appendChild(liSiguiente);
}

// Cambiar página
function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(rolesData.length / itemsPorPagina);
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderizarTabla();
    }
}

// Abrir modal para editar
async function abrirModalEditarRol(id) {
    toggleLoading(true);
    try {
        const response = await fetch(`${URL}/${id}`);
        if (!response.ok) throw new Error('Error al obtener datos');
        
        const rol = await response.json();
        
        document.getElementById('id_Rol').value = rol.id_rol;
        document.getElementById('nombre').value = rol.nombre;
        document.getElementById('descripcion').value = rol.descripcion;
        document.getElementById('restaurante_fk').value = rol.restaurante_fk || '';
        
        document.getElementById('modalTitulo').textContent = 'Editar Rol';
        modalRol.show();
    } catch (error) {
        console.error('Error al cargar rol:', error);
        mostrarNotificacion('Error al cargar la información del rol.', 'danger');
    } finally {
        toggleLoading(false);
    }
}

// Eliminar rol con confirmación mejorada
async function eliminarRol(id) {
    const rol = rolesData.find(r => r.id_rol === id);
    if (!rol) return;
    
    const confirmacion = await Swal.fire({
        title: '¿Está seguro?',
        text: `¿Desea eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (!confirmacion.isConfirmed) return;
    
    toggleLoading(true);
    try {
        const response = await fetch(`${URL}/${id}`, { 
            method: 'DELETE' 
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar');
        }
        
        mostrarNotificacion('Rol eliminado exitosamente');
        cargarRoles();
    } catch (error) {
        console.error('Error al eliminar:', error);
        mostrarNotificacion('Error al eliminar el rol. Por favor intente nuevamente.', 'danger');
    } finally {
        toggleLoading(false);
    }
}

// Validación de formulario
function validarFormulario() {
    const form = document.getElementById('formRol');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    
    if (nombre.length < 3) {
        mostrarNotificacion('El nombre debe tener al menos 3 caracteres', 'warning');
        return false;
    }
    
    if (descripcion.length < 5) {
        mostrarNotificacion('La descripción debe tener al menos 5 caracteres', 'warning');
        return false;
    }
    
    return true;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    modalRol = new bootstrap.Modal(document.getElementById('modalRol'));
    
    await cargarRestaurantes();
    cargarRoles();
    
    // Búsqueda con debounce
    let timeoutBusqueda;
    document.getElementById('buscarRol').addEventListener('input', (e) => {
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
            filtroBusqueda = e.target.value;
            paginaActual = 1;
            renderizarTabla();
        }, 300);
    });
    
    // Filtro de restaurante
    document.getElementById('filtroRestaurante').addEventListener('change', (e) => {
        filtroRestaurante = e.target.value;
        paginaActual = 1;
        renderizarTabla();
    });
    
    // Items por página
    document.getElementById('itemsPorPagina').addEventListener('change', (e) => {
        itemsPorPagina = Number.parseInt(e.target.value);
        paginaActual = 1;
        renderizarTabla();
    });
    
    // Manejo del formulario
    const form = document.getElementById('formRol');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) return;
        
        const id = document.getElementById('id_Rol').value;
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const restaurante_fk = document.getElementById('restaurante_fk').value || null;
        
        const data = { nombre, descripcion, restaurante_fk };
        
        toggleLoading(true);
        try {
            const response = await fetch(id ? `${URL}/${id}` : URL, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la operación');
            }
            
            mostrarNotificacion(id ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
            modalRol.hide();
            form.reset();
            form.classList.remove('was-validated');
            cargarRoles();
        } catch (error) {
            console.error('Error al guardar:', error);
            mostrarNotificacion('Error al guardar el rol. Por favor intente nuevamente.', 'danger');
        } finally {
            toggleLoading(false);
        }
    });
    
    // Botón agregar
    document.getElementById('btnAgregar').addEventListener('click', () => {
        form.reset();
        document.getElementById('id_Rol').value = '';
        document.getElementById('modalTitulo').textContent = 'Agregar Rol';
        form.classList.remove('was-validated');
        modalRol.show();
    });
    
    // Botón cancelar
    document.getElementById('btnCancelar').addEventListener('click', (e) => {
        e.preventDefault();
        modalRol.hide();
        form.classList.remove('was-validated');
    });
});

// Agregar SweetAlert para confirmaciones más elegantes
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
document.head.appendChild(script);
