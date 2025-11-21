// 
const URL = "http://127.0.0.1:3000/renard/restaurante"; 

document.addEventListener('DOMContentLoaded', () => {
    const RestauranteTableBody = document.getElementById('restauranteTableBody');
    const editRestauranteForm = document.getElementById('editRestauranteForm');
    const buscarInput = document.getElementById('buscarInput');
    
    let restaurantes = [];
    let filtroBusqueda = '';

    fetchRestaurante(); // ✅ MOVIDO: Llamada después de declarar la función

    async function fetchRestaurante() { // ✅ CORREGIDO: Quitado parámetro URL
        try {
            const response = await fetch(URL); // ✅ AGREGADO: Hacer el fetch
            const data = await response.json(); // ✅ CORREGIDO: response.json() no res.json()
            restaurantes = data;
            renderRestaurante();
        } catch (error) {
            console.error('Error al obtener restaurantes:', error);
        }
    }

    function renderRestaurante() {
        if (!RestauranteTableBody) return; // ✅ AGREGADO: Validación
        
        RestauranteTableBody.innerHTML = '';

        // aplicar filtro
        const filtrados = restaurantes.filter(r =>
            (r.nombre && r.nombre.toLowerCase().includes(filtroBusqueda)) || // ✅ AGREGADO: Validación
            (r.eslogan && r.eslogan.toLowerCase().includes(filtroBusqueda)) || // ✅ AGREGADO: Validación
            (r.descripcion && r.descripcion.toLowerCase().includes(filtroBusqueda)) // ✅ AGREGADO: Validación
        );

        if (filtrados.length === 0) {
            RestauranteTableBody.innerHTML = `
              <tr>
                <td colspan="9" class="text-center">No se encontraron restaurantes</td> <!-- ✅ CORREGIDO: colspan de 8 a 9 -->
              </tr>`;
            return;
        }

        filtrados.forEach(restaurante => {
            RestauranteTableBody.innerHTML += `
              <tr>
                <td>${restaurante.id_restaurante}</td>
                <td>${restaurante.nombre}</td>
                <td>${restaurante.eslogan}</td>
                <td>${restaurante.url_menu}</td>
                <td>${restaurante.url_imagen ? `<img src="../public/assets/img/restaurantes/${restaurante.url_imagen}" alt="${restaurante.url_imagen}" style="max-width: 100px; max-height: 100px;">` : ''}</td>
                <td>${new Date(restaurante.created_at || '').toLocaleString()}</td>
                <td>${new Date(restaurante.updated_at || '').toLocaleString()}</td>  
                <td>${restaurante.descripcion}</td>
                <td>
                  <button class="btn-action btn-edit" onclick='abrirModalEditarRestaurante(${JSON.stringify(restaurante)})'>
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn-action btn-delete" onclick="eliminarRestaurante(${restaurante.id_restaurante})">
                    <i class="bi bi-trash3-fill"></i>
                  </button>
                </td>
              </tr>
            `;
        });
    }

    // Búsqueda por nombre
    buscarInput?.addEventListener("input", e => {
        filtroBusqueda = e.target.value.toLowerCase();
        renderRestaurante();
    });
    
    window.abrirModalEditarRestaurante = (restaurante) => {
        document.activeElement.blur(); //
        document.getElementById('editRestauranteId').value = restaurante.id_restaurante;
        document.getElementById('editNombreId').value = restaurante.nombre;
        document.getElementById('editEsloganId').value = restaurante.eslogan;
        document.getElementById('editUrlId').value = restaurante.url_menu;
        document.getElementById('editDescripcionId').value = restaurante.descripcion;
        // Limpiar input file al abrir modal
        document.getElementById('editImagenId').value = '';
        const modal = new bootstrap.Modal(document.getElementById('editRestauranteModal'));
        modal.show();
    };

    // Enviar edición
    if (editRestauranteForm) { // ✅ AGREGADO: Validación
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
                const res = await fetch(`${URL}/${id_restaurante}`, {
                    method: 'PUT',
                    body: formData
                });

                if (res.ok) {
                    await fetchRestaurante(); // recargar lista
                    document.activeElement.blur(); 
                    bootstrap.Modal.getInstance(document.getElementById('editRestauranteModal')).hide();
                } else {
                    console.error('Error al editar restaurante');
                }
            } catch (error) {
                console.error('Error en la solicitud PUT:', error);
            }
        });
    }

    //Eliminar perfil
    window.eliminarRestaurante = async (id_restaurante) => {
        Swal.fire({
            title: '¿Estás seguro de que deseas eliminar este restaurante?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${URL}/${id_restaurante}`, { 
                        method: 'DELETE'
                    });

                    if (res.ok) {
                        fetchRestaurante();
                        Swal.fire({
                            icon: 'success',
                            title: 'Restaurante eliminado correctamente',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    } else {
                        console.error('Error al eliminar restaurante');
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar restaurante',
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
    };

    // Manejar envío del formulario de creación de restaurante
    const createRestauranteForm = document.getElementById('createRestauranteForm');
    if (createRestauranteForm) {
        createRestauranteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('createNombreId').value.trim();
            const eslogan = document.getElementById('createEsloganId').value.trim();
            const url_menu = document.getElementById('createUrlId').value.trim();
            const imagenInput = document.getElementById('createImagenId');
            const imagenFile = imagenInput.files[0];
            const descripcion = document.getElementById('createDescripcionId').value.trim();

            if (!nombre || !eslogan || !url_menu || !imagenFile || !descripcion) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Por favor, completa todos los campos correctamente.',
                    showConfirmButton: false,
                    timer: 2000
                });
                return;
            }

            let formData = new FormData();
            formData.append("nombre", nombre);
            formData.append("eslogan", eslogan);
            formData.append("url_menu", url_menu);
            formData.append("descripcion", descripcion);
            formData.append("url_imagen", imagenFile);

            try {
                const response = await fetch(URL, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Restaurante creado correctamente',
                        showConfirmButton: false,
                        timer: 2000
                    });
                    createRestauranteForm.reset();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createRestauranteModal'));
                    modal.hide();
                    fetchRestaurante();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al crear restaurante: ' + (result.error || ''),
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
});