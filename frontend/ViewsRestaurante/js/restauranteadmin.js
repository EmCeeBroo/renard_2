// Función para cargar el contenido específico del restaurante admin
function loadRestauranteAdminContent() {
    const restauranteContent = `
        <div class="admin-card fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">Información del Restaurante</h5>
            </div>

            <div class="table-responsive">
                <table class="table table-bordered table-striped table-hover align-middle text-center" id="restauranteTable">
                    <thead class="table-dark">
                        <tr>
                            <th>id</th>
                            <th>Nombre</th>
                            <th>Eslogan</th>
                            <th>Url-Menu</th>
                            <th>Imagen</th>
                            <th>Creado En</th>
                            <th>Actualizado En</th>
                            <th>Descripcion</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="restauranteTableBody">
                        <!-- Contenido generado dinámicamente -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Insertar el contenido en el contenedor de admin-content
    const adminContent = document.querySelector('.admin-content');
    if (adminContent) {
        // Limpiar contenido existente y agregar el nuevo
        const existingCard = adminContent.querySelector('.admin-card');
        if (existingCard) {
            existingCard.remove();
        }
        adminContent.insertAdjacentHTML('beforeend', restauranteContent);

        // Inicializar la funcionalidad después de insertar el contenido
        initRestauranteAdmin();
    }
}

// Función para inicializar la funcionalidad del restaurante admin
function initRestauranteAdmin() {
    const restauranteTableBody = document.getElementById('restauranteTableBody');
    const editRestauranteForm = document.getElementById('editRestauranteForm');

    if (!restauranteTableBody || !editRestauranteForm) {
        console.error('Elementos necesarios no encontrados');
        return;
    }

    // Cargar restaurante del usuario logueado
    fetchRestauranteByRol();

    async function fetchRestauranteByRol() {
        try {
            // Obtener datos del usuario desde localStorage
            const usuarioData = localStorage.getItem('usuario');
            if (!usuarioData) {
                console.error('No se encontraron datos de usuario en localStorage');
                Swal.fire({
                    icon: 'error',
                    title: 'Error de autenticación',
                    text: 'No se encontraron datos de usuario. Por favor, inicia sesión nuevamente.',
                    showConfirmButton: true
                });
                return;
            }

            const usuario = JSON.parse(usuarioData);
            const rolId = usuario.rol_fk;

            if (!rolId) {
                console.error('El usuario no tiene un rol asignado');
                Swal.fire({
                    icon: 'error',
                    title: 'Error de permisos',
                    text: 'El usuario no tiene un rol asignado.',
                    showConfirmButton: true
                });
                return;
            }

            // Obtener restaurante basado en el rol
            const res = await fetch(`http://127.0.0.1:3000/renard/restaurante/rol/${rolId}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al obtener restaurante');
            }

            const restaurante = await res.json();
            renderRestaurante(restaurante);
        } catch (error) {
            console.error('Error al obtener restaurante:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar restaurante',
                text: error.message,
                showConfirmButton: true
            });
        }
    }

    function renderRestaurante(restaurante) {
        restauranteTableBody.innerHTML = '';
        restauranteTableBody.innerHTML += `
            <tr>
                <td>${restaurante.id_restaurante}</td>
                <td>${restaurante.nombre}</td>
                <td>${restaurante.eslogan || ''}</td>
                <td>${restaurante.url_menu || ''}</td>
                <td>${restaurante.url_imagen ? `<img src="../../assets/img/restaurantes/${restaurante.url_imagen}" alt="${restaurante.url_imagen}" style="max-width: 100px; max-height: 100px;">` : ''}</td>
                <td>${new Date(restaurante.created_at || '').toLocaleString()}</td>
                <td>${new Date(restaurante.updated_at || '').toLocaleString()}</td>
                <td>${restaurante.descripcion || ''}</td>
                <td>
                    <button class="btn-action btn-edit" onclick='abrirModalEditarRestaurante(${JSON.stringify(restaurante)})' title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn-action btn-view" onclick='abrirModalVerRestaurante(${JSON.stringify(restaurante)})' title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    // Abrir modal y rellenar datos para editar
    window.abrirModalEditarRestaurante = (restaurante) => {
        document.activeElement.blur();
        document.getElementById('editRestauranteId').value = restaurante.id_restaurante;
        document.getElementById('editNombreId').value = restaurante.nombre;
        document.getElementById('editEsloganId').value = restaurante.eslogan || '';
        document.getElementById('editUrlId').value = restaurante.url_menu || '';
        document.getElementById('editDescripcionId').value = restaurante.descripcion || '';
        // Limpiar input file al abrir modal
        document.getElementById('editImagenId').value = '';
        const modal = new bootstrap.Modal(document.getElementById('editRestauranteModal'));
        modal.show();
    };

    // Abrir modal para ver detalles
    window.abrirModalVerRestaurante = (restaurante) => {
        document.activeElement.blur();
        document.getElementById('viewRestauranteId').textContent = restaurante.id_restaurante;
        document.getElementById('viewNombre').textContent = restaurante.nombre;
        document.getElementById('viewEslogan').textContent = restaurante.eslogan || '';
        document.getElementById('viewUrl').textContent = restaurante.url_menu || '';
        document.getElementById('viewDescripcion').textContent = restaurante.descripcion || '';
        document.getElementById('viewCreatedAt').textContent = new Date(restaurante.created_at || '').toLocaleString();
        document.getElementById('viewUpdatedAt').textContent = new Date(restaurante.updated_at || '').toLocaleString();
        const modal = new bootstrap.Modal(document.getElementById('viewRestauranteModal'));
        modal.show();
    };

    // Enviar edición
    editRestauranteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id_restaurante = document.getElementById('editRestauranteId').value;
        const nombre = document.getElementById('editNombreId').value;
        const eslogan = document.getElementById('editEsloganId').value;
        const url_menu = document.getElementById('editUrlId').value;
        const imagenInput = document.getElementById('editImagenId');
        const imagenFile = imagenInput.files[0];
        const descripcion = document.getElementById('editDescripcionId').value;

        let formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('eslogan', eslogan);
        formData.append('url_menu', url_menu);
        formData.append('descripcion', descripcion);

        if (imagenFile) {
            formData.append('url_imagen', imagenFile);
        }

        try {
            const res = await fetch(`http://127.0.0.1:3000/renard/restaurante/${id_restaurante}`, {
                method: 'PUT',
                body: formData
            });

            if (res.ok) {
                await fetchRestauranteByRol(); // recargar lista
                document.activeElement.blur();
                bootstrap.Modal.getInstance(document.getElementById('editRestauranteModal')).hide();
                Swal.fire({
                    icon: 'success',
                    title: 'Restaurante actualizado',
                    text: 'Los cambios se han guardado correctamente.',
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al editar restaurante');
            }
        } catch (error) {
            console.error('Error en la solicitud PUT:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: error.message,
                showConfirmButton: true
            });
        }
    });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que se cargue el dashboard antes de inicializar el contenido específico
    setTimeout(() => {
        loadRestauranteAdminContent();
    }, 100);
});
