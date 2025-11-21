import {showAlert, showLoading } from '../../assets/js/utils.js';

let modalZona;
let filtroBusqueda = '';

const URL = "http://192.168.0.9:3000/renard/zona"; 

async function cargarZonas() {
    try {
        showLoading(true);
        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error('Error al cargar las zonas: ' + response.statusText);
        }
        const zonas = await response.json();
        const tbody = document.querySelector('#tablaZonas tbody');
        tbody.innerHTML = '';

        const filtrados = zonas.filter(zona => {
            const nombre = zona.nombre.toLowerCase();
            const descripcion = zona.descripcion.toLowerCase();
            return nombre.includes(filtroBusqueda) || descripcion.includes(filtroBusqueda);
        });

        if (filtrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No hay zonas registradas</td>
                </tr>
            `;
            showLoading(false);
            return;
        }

        filtrados.forEach(zona => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${zona.id_zona}</td>
                <td>${zona.nombre}</td>
                <td>${zona.descripcion}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="abrirModalEditarZona(${zona.id_zona})" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="eliminarZona(${zona.id_zona})" title="Eliminar">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        showLoading(false);
    } catch (error) {
        showLoading(false);
        console.error(error);
        showAlert('error', 'No se pudieron cargar las zonas.');
    }
}

async function abrirModalEditarZona(id) {
    try {
        const response = await fetch(`${URL}/${id}`);
        if (!response.ok) {
            throw new Error('Error al obtener datos de la zona: ' + response.statusText);
        }
        const zona = await response.json();

        document.getElementById('id_zona').value = zona.id_zona;
        document.getElementById('nombre').value = zona.nombre;
        document.getElementById('descripcion').value = zona.descripcion;

        document.getElementById('modalTitulo').textContent = 'Editar Zona';
        modalZona.show();
    } catch (error) {
        console.error(error);
        showAlert('error', 'No se pudo cargar la información de la zona.');
    }
}

async function eliminarZona(id) {
    try {
        const result = await Swal.fire({
            title: '¿Está seguro de eliminar esta zona?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        showLoading(true);
        const response = await fetch(`${URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar la zona: ' + response.statusText);
        }

        showLoading(false);
        showAlert('success', 'Zona eliminada correctamente.');
        cargarZonas();
    } catch (error) {
        showLoading(false);
        console.error(error);
        showAlert('error', 'No se pudo eliminar la zona.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    modalZona = new bootstrap.Modal(document.getElementById('modalZona'));
    cargarZonas();

    const buscarInput = document.getElementById('buscarInput');
    buscarInput.addEventListener('input', e => {
        filtroBusqueda = e.target.value.toLowerCase();
        cargarZonas();
    });

    const form = document.getElementById('formZona');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('id_zona').value;
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        if (!nombre || !descripcion) {
            showAlert('warning', 'Por favor complete todos los campos obligatorios.');
            return;
        }

        const data = { nombre, descripcion };

        try {
            let response;
            if (id) {
                response = await fetch(`${URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch(URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la operación');
            }

            showAlert('success', id ? 'Zona actualizada correctamente.' : 'Zona agregada correctamente.');
            modalZona.hide();
            cargarZonas();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Error al guardar la zona.');
        }
    });

    const btnAgregar = document.getElementById('btnAgregar');
    btnAgregar.addEventListener('click', () => {
        document.getElementById('formZona').reset();
        document.getElementById('id_zona').value = '';
        document.getElementById('modalTitulo').textContent = 'Agregar Zona';
        modalZona.show();
    });

    const btnCancelar = document.getElementById('btnCancelar');
    btnCancelar.addEventListener('click', (e) => {
        e.preventDefault();
        modalZona.hide();
    });

    // Exponer funciones globalmente para onclick inline
    window.abrirModalEditarZona = abrirModalEditarZona;
    window.eliminarZona = eliminarZona;
});
