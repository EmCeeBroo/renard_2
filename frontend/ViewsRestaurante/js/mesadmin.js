document.addEventListener('DOMContentLoaded', () => {
    const mesaTableBody = document.getElementById('mesaTableBody');
    const editMesaForm = document.getElementById('editMesaForm');

    // Obtener el ID del restaurante del usuario logueado
    const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
    const restauranteId = usuarioData.restaurante_fk;

    if (!restauranteId) {
        console.error('No se encontró el ID del restaurante del usuario');
        return;
    }

    // Cargar zonas, estados de mesa y sucursales
    let zonas = [];
    let estadosMesa = [];
    let sucursales = [];

    // Cargar mesas al cargar la página
    fetchMesas();

    async function fetchMesas() {
        try {
            // Cargar datos necesarios
            [zonas, estadosMesa, sucursales] = await Promise.all([
                fetch('http://192.168.0.9:3000/renard/zona').then(r => r.json()),
                fetch('http://192.168.0.9:3000/renard/estado-mesa').then(r => r.json()),
                fetch(`http://192.168.0.9:3000/renard/sucursal/restaurante/${restauranteId}`).then(r => r.json())
            ]);

            // Poblar los selects
            populateSelects();

            // Paso 1: Obtener sucursales del restaurante (ya tenemos sucursales)
            // Paso 2: Obtener mesas de todas las sucursales del restaurante
            let allMesas = [];
            if (Array.isArray(sucursales) && sucursales.length > 0) {
                const mesasPromises = sucursales.map(sucursal =>
                    fetch(`http://192.168.0.9:3000/renard/mesa/sucursal/${sucursal.id_sucursal}`)
                        .then(r => r.ok ? r.json() : [])
                        .catch(error => {
                            console.error(`Error al obtener mesas de sucursal ${sucursal.id_sucursal}:`, error);
                            return [];
                        })
                );

                const mesasArrays = await Promise.all(mesasPromises);
                allMesas = mesasArrays.flat(); // Combinar todas las mesas en un solo array
            }

            renderMesas(allMesas);
        } catch (error) {
            console.error('Error al obtener mesas:', error);
            // Show empty table if there's an error
            renderMesas([]);
        }
    }

    function populateSelects() {
        // Poblar select de sucursales para crear
        const createSucursalSelect = document.getElementById('createSucursal');
        if (createSucursalSelect) {
            createSucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>';
            sucursales.forEach(sucursal => {
                const option = document.createElement('option');
                option.value = sucursal.id_sucursal;
                option.textContent = sucursal.nombre;
                createSucursalSelect.appendChild(option);
            });
        }

        // Poblar select de zonas para crear
        const createZonaSelect = document.getElementById('createZona');
        if (createZonaSelect) {
            createZonaSelect.innerHTML = '<option value="">Seleccione una zona</option>';
            zonas.forEach(zona => {
                const option = document.createElement('option');
                option.value = zona.id_zona;
                option.textContent = zona.nombre;
                createZonaSelect.appendChild(option);
            });
        }

        // Poblar select de estados de mesa para crear
        const createEstadoSelect = document.getElementById('createEstadoMesa');
        if (createEstadoSelect) {
            createEstadoSelect.innerHTML = '<option value="">Seleccione un estado</option>';
            estadosMesa.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.id_estado_mesa;
                option.textContent = estado.nombre;
                createEstadoSelect.appendChild(option);
            });
        }

        // Poblar select de sucursales para editar
        const editSucursalSelect = document.getElementById('editSucursal');
        if (editSucursalSelect) {
            editSucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>';
            sucursales.forEach(sucursal => {
                const option = document.createElement('option');
                option.value = sucursal.id_sucursal;
                option.textContent = sucursal.nombre;
                editSucursalSelect.appendChild(option);
            });
        }

        // Poblar select de zonas para editar
        const editZonaSelect = document.getElementById('editZona');
        if (editZonaSelect) {
            editZonaSelect.innerHTML = '<option value="">Seleccione una zona</option>';
            zonas.forEach(zona => {
                const option = document.createElement('option');
                option.value = zona.id_zona;
                option.textContent = zona.nombre;
                editZonaSelect.appendChild(option);
            });
        }

        // Poblar select de estados de mesa para editar
        const editEstadoSelect = document.getElementById('editEstadoMesa');
        if (editEstadoSelect) {
            editEstadoSelect.innerHTML = '<option value="">Seleccione un estado</option>';
            estadosMesa.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.id_estado_mesa;
                option.textContent = estado.nombre;
                editEstadoSelect.appendChild(option);
            });
        }
    }

    function renderMesas(mesas) {
        mesaTableBody.innerHTML = '';
        if (!Array.isArray(mesas)) {
            console.error('mesas no es un array:', mesas);
            return;
        }

        mesas.forEach(mesa => {
            // Store mesa data in a global array for access by onclick handlers
            if (!window.mesasData) {
                window.mesasData = [];
            }
            window.mesasData[mesa.id_mesa] = mesa;

            const zona = zonas.find(z => z.id_zona === mesa.zona_fk);
            const estado = estadosMesa.find(e => e.id_estado_mesa === mesa.estado_mesa_fk);
            const sucursal = sucursales.find(s => s.id_sucursal === mesa.sucursal_fk);

            mesaTableBody.innerHTML += `
                <tr>
                    <td>${mesa.id_mesa}</td>
                    <td>${mesa.numero_mesa || 'N/A'}</td>
                    <td>${sucursal?.nombre || mesa.sucursal_fk}</td>
                    <td>${zona?.nombre || mesa.zona_fk}</td>
                    <td>${estado?.nombre || mesa.estado_mesa_fk}</td>
                    <td>${new Date(mesa.created_at || '').toLocaleString()}</td>
                    <td>${new Date(mesa.updated_at || '').toLocaleString()}</td>
                    <td>
                        <button class="btn-action btn-view" onclick="abrirModalVerMesa(${mesa.id_mesa})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="abrirModalEditarMesa(${mesa.id_mesa})">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="eliminarMesa(${mesa.id_mesa})">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // Abrir modal y rellenar datos para editar
    window.abrirModalEditarMesa = (id_mesa) => {
        const mesa = window.mesasData[id_mesa];
        if (!mesa) {
            console.error('Mesa no encontrada:', id_mesa);
            return;
        }

        document.activeElement.blur();
        document.getElementById('editMesaId').value = mesa.id_mesa;
        document.getElementById('editNumeroMesa').value = mesa.numero_mesa || '';
        document.getElementById('editSucursal').value = mesa.sucursal_fk;
        document.getElementById('editZona').value = mesa.zona_fk;
        document.getElementById('editEstadoMesa').value = mesa.estado_mesa_fk;
        const modal = new bootstrap.Modal(document.getElementById('editMesaModal'));
        modal.show();
    };

    // Abrir modal para ver detalles
    window.abrirModalVerMesa = (id_mesa) => {
        const mesa = window.mesasData[id_mesa];
        if (!mesa) {
            console.error('Mesa no encontrada:', id_mesa);
            return;
        }

        const zona = zonas.find(z => z.id_zona === mesa.zona_fk);
        const estado = estadosMesa.find(e => e.id_estado_mesa === mesa.estado_mesa_fk);
        const sucursal = sucursales.find(s => s.id_sucursal === mesa.sucursal_fk);

        document.activeElement.blur();
        document.getElementById('viewMesaId').textContent = mesa.id_mesa;
        document.getElementById('viewNumeroMesa').textContent = mesa.numero_mesa || 'N/A';
        document.getElementById('viewSucursal').textContent = sucursal?.nombre || mesa.sucursal_fk;
        document.getElementById('viewZona').textContent = zona?.nombre || mesa.zona_fk;
        document.getElementById('viewEstadoMesa').textContent = estado?.nombre || mesa.estado_mesa_fk;
        document.getElementById('viewCreatedAt').textContent = new Date(mesa.created_at || '').toLocaleString();
        document.getElementById('viewUpdatedAt').textContent = new Date(mesa.updated_at || '').toLocaleString();
        const modal = new bootstrap.Modal(document.getElementById('viewMesaModal'));
        modal.show();
    };

    // Enviar edición
    editMesaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id_mesa = document.getElementById('editMesaId').value;
        const numero_mesa = document.getElementById('editNumeroMesa').value;
        const sucursal_fk = document.getElementById('editSucursal').value;
        const zona_fk = document.getElementById('editZona').value;
        const estado_mesa_fk = document.getElementById('editEstadoMesa').value;

        const mesaData = {
            numero_mesa: parseInt(numero_mesa),
            sucursal_fk: parseInt(sucursal_fk),
            zona_fk: parseInt(zona_fk),
            estado_mesa_fk: parseInt(estado_mesa_fk)
        };

        try {
            const res = await fetch(`http://192.168.0.9:3000/renard/mesa/${id_mesa}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mesaData)
            });

            if (res.ok) {
                await fetchMesas();
                document.activeElement.blur();
                bootstrap.Modal.getInstance(document.getElementById('editMesaModal')).hide();
                Swal.fire({
                    icon: 'success',
                    title: 'Mesa actualizada correctamente',
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                console.error('Error al editar mesa');
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar mesa',
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

    // Eliminar mesa
    window.eliminarMesa = async (id_mesa) => {
        Swal.fire({
            title: '¿Estás seguro de que deseas eliminar esta mesa?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`http://192.168.0.9:3000/renard/mesa/${id_mesa}`, {
                        method: 'DELETE'
                    });

                    if (res.ok) {
                        fetchMesas();
                        Swal.fire({
                            icon: 'success',
                            title: 'Mesa eliminada correctamente',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    } else {
                        console.error('Error al eliminar mesa');
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar mesa',
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

    // Manejar envío del formulario de creación de mesa
    const createMesaForm = document.getElementById('createMesaForm');
    if (createMesaForm) {
        createMesaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const numero_mesa = document.getElementById('createNumeroMesa').value;
            const sucursal_fk = document.getElementById('createSucursal').value;
            const zona_fk = document.getElementById('createZona').value;
            const estado_mesa_fk = document.getElementById('createEstadoMesa').value;

            if (!numero_mesa || !sucursal_fk || !zona_fk || !estado_mesa_fk) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Por favor, completa todos los campos correctamente.',
                    showConfirmButton: false,
                    timer: 2000
                });
                return;
            }

            const mesaData = {
                numero_mesa: parseInt(numero_mesa),
                sucursal_fk: parseInt(sucursal_fk),
                zona_fk: parseInt(zona_fk),
                estado_mesa_fk: parseInt(estado_mesa_fk)
            };

            try {
                const response = await fetch('http://192.168.0.9:3000/renard/mesa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(mesaData)
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Mesa creada correctamente',
                        showConfirmButton: false,
                        timer: 2000
                    });
                    createMesaForm.reset();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createMesaModal'));
                    modal.hide();
                    fetchMesas();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al crear mesa: ' + (result.error || ''),
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
