document.addEventListener('DOMContentLoaded', () => {
    const sucursalTableBody = document.getElementById('sucursalTableBody');
    const editSucursalForm = document.getElementById('editSucursalForm');

    // Obtener el ID del restaurante del usuario logueado
    const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
    const restauranteId = usuarioData.restaurante_fk;

    if (!restauranteId) {
        console.error('No se encontró el ID del restaurante del usuario');
        return;
    }

    // Cargar sucursales al cargar la página
    fetchSucursales();

    async function fetchSucursales() {
        try {
            const res = await fetch(`http://192.168.0.9:3000/renard/sucursal/restaurante/${restauranteId}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();

            // Handle different response structures
            let sucursales = [];
            if (Array.isArray(data)) {
                sucursales = data;
            } else if (data && Array.isArray(data.data)) {
                sucursales = data.data;
            } else if (data && typeof data === 'object' && data.id_sucursal) {
                // If it's a single object, convert to array
                sucursales = [data];
            } else {
                console.warn('Unexpected API response structure:', data);
                sucursales = [];
            }

            renderSucursales(sucursales);
        } catch (error) {
            console.error('Error al obtener sucursales:', error);
            // Show empty table if there's an error
            renderSucursales([]);
        }
    }

    function renderSucursales(sucursales) {
        sucursalTableBody.innerHTML = '';
        if (!Array.isArray(sucursales)) {
            console.error('sucursales no es un array:', sucursales);
            return;
        }

        sucursales.forEach(sucursal => {
            // Store sucursal data in a global array for access by onclick handlers
            if (!window.sucursalesData) {
                window.sucursalesData = [];
            }
            window.sucursalesData[sucursal.id_sucursal] = sucursal;

            sucursalTableBody.innerHTML += `
                <tr>
                    <td>${sucursal.id_sucursal}</td>
                    <td>${sucursal.nombre}</td>
                    <td>${sucursal.direccion}</td>
                    <td>${sucursal.horario_apertura}</td>
                    <td>${sucursal.horario_cierre}</td>
                    <td>${new Date(sucursal.created_at || '').toLocaleString()}</td>
                    <td>${new Date(sucursal.updated_at || '').toLocaleString()}</td>
                    <td>
                        <button class="btn-action btn-view" onclick="abrirModalVerSucursal(${sucursal.id_sucursal})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="abrirModalEditarSucursal(${sucursal.id_sucursal})">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="eliminarSucursal(${sucursal.id_sucursal})">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // Abrir modal y rellenar datos para editar
    window.abrirModalEditarSucursal = (id_sucursal) => {
        const sucursal = window.sucursalesData[id_sucursal];
        if (!sucursal) {
            console.error('Sucursal no encontrada:', id_sucursal);
            return;
        }

        document.activeElement.blur();
        document.getElementById('editSucursalId').value = sucursal.id_sucursal;
        document.getElementById('editNombre').value = sucursal.nombre;
        document.getElementById('editDireccion').value = sucursal.direccion;
        document.getElementById('editHorarioApertura').value = sucursal.horario_apertura;
        document.getElementById('editHorarioCierre').value = sucursal.horario_cierre;
        const modal = new bootstrap.Modal(document.getElementById('editSucursalModal'));
        modal.show();
    };

    // Abrir modal para ver detalles
    window.abrirModalVerSucursal = (id_sucursal) => {
        const sucursal = window.sucursalesData[id_sucursal];
        if (!sucursal) {
            console.error('Sucursal no encontrada:', id_sucursal);
            return;
        }

        document.activeElement.blur();
        document.getElementById('viewSucursalId').textContent = sucursal.id_sucursal;
        document.getElementById('viewNombre').textContent = sucursal.nombre;
        document.getElementById('viewDireccion').textContent = sucursal.direccion;
        document.getElementById('viewHorarioApertura').textContent = sucursal.horario_apertura;
        document.getElementById('viewHorarioCierre').textContent = sucursal.horario_cierre;
        const modal = new bootstrap.Modal(document.getElementById('viewSucursalModal'));
        modal.show();
    };

    // Enviar edición
    editSucursalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id_sucursal = document.getElementById('editSucursalId').value;
        const nombre = document.getElementById('editNombre').value;
        const direccion = document.getElementById('editDireccion').value;
        const horario_apertura = document.getElementById('editHorarioApertura').value;
        const horario_cierre = document.getElementById('editHorarioCierre').value;

        const sucursalData = {
            nombre,
            direccion,
            horario_apertura,
            horario_cierre,
            restaurante_fk: restauranteId
        };

        try {
            const res = await fetch(`http://192.168.0.9:3000/renard/sucursal/${id_sucursal}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sucursalData)
            });

            if (res.ok) {
                await fetchSucursales();
                document.activeElement.blur();
                bootstrap.Modal.getInstance(document.getElementById('editSucursalModal')).hide();
                Swal.fire({
                    icon: 'success',
                    title: 'Sucursal actualizada correctamente',
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                console.error('Error al editar sucursal');
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar sucursal',
                    showConfirmButton: true
                });
            }
        } catch (error) {
            console.error('Error en la solicitud PUT:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error en la solicitud',
                showConfirmButton: true
            });
        }
    });

    // Eliminar sucursal
    window.eliminarSucursal = async (id_sucursal) => {
        Swal.fire({
            title: '¿Estás seguro de que deseas eliminar esta sucursal?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`http://192.168.0.9:3000/renard/sucursal/${id_sucursal}`, {
                        method: 'DELETE'
                    });

                    if (res.ok) {
                        fetchSucursales();
                        Swal.fire({
                            icon: 'success',
                            title: 'Sucursal eliminada correctamente',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    } else {
                        console.error('Error al eliminar sucursal');
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar sucursal',
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

    // Manejar envío del formulario de creación de sucursal
    const createSucursalForm = document.getElementById('createSucursalForm');
    if (createSucursalForm) {
        createSucursalForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('createNombre').value.trim();
            const direccion = document.getElementById('createDireccion').value.trim();
            const horario_apertura = document.getElementById('createHorarioApertura').value;
            const horario_cierre = document.getElementById('createHorarioCierre').value;

            if (!nombre || !direccion || !horario_apertura || !horario_cierre) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Por favor, completa todos los campos correctamente.',
                    showConfirmButton: false,
                    timer: 2000
                });
                return;
            }

            const sucursalData = {
                nombre,
                direccion,
                horario_apertura,
                horario_cierre,
                restaurante_fk: restauranteId
            };

            try {
                const response = await fetch('http://192.168.0.9:3000/renard/sucursal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sucursalData)
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucursal creada correctamente',
                        showConfirmButton: false,
                        timer: 2000
                    });
                    createSucursalForm.reset();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createSucursalModal'));
                    modal.hide();
                    fetchSucursales();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al crear sucursal: ' + (result.error || ''),
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
