document.addEventListener('DOMContentLoaded', () => {
    const fotoPerfil = document.getElementById('fotoPerfil');
    const inputFotoPerfil = document.getElementById('inputFotoPerfil');
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const telefono = document.getElementById('telefono');
    const direccion = document.getElementById('direccion');
    const correo = document.getElementById('correo');
    const tipoDocumento = document.getElementById('tipoDocumento');
    const numeroDocumento = document.getElementById('numeroDocumento');
    const errorMensaje = document.getElementById('errorMensaje');

    // Función para obtener datos del perfil
    async function obtenerPerfil() {
        try {
            // Aquí se usa un id fijo 1 para ejemplo, puede modificarse para ser dinámico
            const response = await fetch('http://192.168.0.9:3000//perfil/1');
            if (!response.ok) {
                throw new Error('No se pudo obtener el perfil');
            }
            const perfil = await response.json();

            // Actualizar la vista con los datos, permitiendo campos opcionales
            fotoPerfil.src = perfil.foto && perfil.foto.trim() !== '' ? perfil.foto : '../assets/img/default-profile.png';
            nombre.textContent = perfil.nombre || 'No especificado';
            apellido.textContent = perfil.apellido || 'No especificado';
            telefono.textContent = perfil.telefono || 'No especificado';
            direccion.textContent = perfil.direccion || 'No especificado';
            correo.textContent = perfil.correo || 'No especificado';
            tipoDocumento.textContent = perfil.tipo_documento_fk || 'No especificado';
            numeroDocumento.textContent = perfil.numero_documento || 'No especificado';

            errorMensaje.style.display = 'none';
        } catch (error) {
            errorMensaje.textContent = 'Error al cargar el perfil: ' + error.message;
            errorMensaje.style.display = 'block';
        }
    }

    // Abrir selector de archivos al hacer clic en la imagen
    fotoPerfil.addEventListener('click', () => {
        inputFotoPerfil.click();
    });

    // Mostrar vista previa de la imagen seleccionada
    inputFotoPerfil.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotoPerfil.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    obtenerPerfil();
});
