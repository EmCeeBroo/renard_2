// Función para obtener parámetros de la URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(Window.location.search);
        return urlParams.get(param);
    }
document.addEventListener('DOMContentLoaded', () => {
    const correo = getQueryParam('correo');
    const token = getQueryParam('token');

    // Mostrar mensaje de bienvenida personalizado
    if (correo) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const welcomeMessage = document.createElement('h2');
            welcomeMessage.textContent = `¡Bienvenido, ${correo}!`;
            mainContent.insertBefore(welcomeMessage, mainContent.firstChild);
        }
    } else {
        alert('No se recibió el correo del usuario.');
    }

    // Aquí se puede agregar lógica adicional para usar el token si es necesario

    // Agregar funcionalidad para cerrar sesión
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Eliminar token y usuario de localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

            // Redirigir a login.html
            window.location.href = '../../views/login/login.html';
        });
    }
});
