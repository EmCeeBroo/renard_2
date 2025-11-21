function renderNavbar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Obtener datos del usuario para personalización
  const usuarioData = localStorage.getItem('usuario');
  let nombreUsuario = 'Usuario';
  
  if (usuarioData) {
    try {
      const usuario = JSON.parse(usuarioData);
      nombreUsuario = usuario.nombre && usuario.apellido 
        ? `${usuario.nombre} ${usuario.apellido}` 
        : usuario.correo;
    } catch (error) {
      console.error('Error parseando usuario:', error);
    }
  }
  
  container.innerHTML = `
    <header class="nav-bar">
      <div class="nav-left">
        <span class="logo">RENARD</span>
      </div>
      <nav class="nav-center">
        <a href="../viewsrenard/inicioClient.html"><i class='bx bx-home'></i> Inicio</a>
        <a href="../viewsrenard/restaurantesRenard.html"><i class='bx bx-store'></i> Restaurantes</a>
        <a href="../viewsrenard/reservaRenard.html"><i class='bx bx-calendar-plus'></i> Nueva Reserva</a>
        <a href="../viewsrenard/historialReservacion.html"><i class='bx bx-history'></i> Mis Reservas</a>
        
        <!-- Dropdown de usuario -->
        <div class="user-dropdown" id="user-dropdown">
          <a href="#" class="user-btn" onclick="toggleUserDropdown(event)">
            <i class='bx bx-user-circle'></i> ${nombreUsuario.split(' ')[0]}
            <i class='bx bx-chevron-down'></i>
          </a>
          <div class="user-dropdown-menu" id="userDropdownMenu">
            <a href="../viewsrenard/perfil.html">
              <i class='bx bx-user'></i> Mi Perfil
            </a>
            <a href="../viewsrenard/historialReservacion.html">
              <i class='bx bx-history'></i> Historial de Reservas
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" onclick="cerrarSesionNavbar()">
              <i class='bx bx-log-out'></i> Cerrar Sesión
            </a> 
          </div>
        </div>
      </nav>

      <!--Theme -->
      <div class="nav-right">
        <button class="theme-toggle-btn" onclick="toggleTheme()" title="Cambiar tema">
          <i class='bx bx-moon'></i>
        </button>
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
          <i class='bx bx-menu'></i>
        </button>
      </div>

    
      <!-- Menú móvil -->
      <div class="mobile-menu" id="mobileMenu">
        <a href="../viewsrenard/inicioClient.html"><i class='bx bx-home'></i> Inicio</a>
        <a href="../viewsrenard/restaurantesRenard.html"><i class='bx bx-store'></i> Restaurantes</a>
        <a href="../viewsrenard/reservaRenard.html"><i class='bx bx-calendar-plus'></i> Nueva Reserva</a>
        <a href="../viewsrenard/historialReservacion.html"><i class='bx bx-history'></i> Mis Reservas</a>
        <a href="../viewsrenard/perfil.html"><i class='bx bx-user'></i> Mi Perfil</a>
        <a href="#" onclick="cerrarSesionNavbar()"><i class='bx bx-log-out'></i> Cerrar Sesión</a>
      </div>
    </header>
  `;

  //aplicarTemaGuardado();
}

// Función para toggle del dropdown de usuario
function toggleUserDropdown(event) {
  event.preventDefault();
  event.stopPropagation();
  const dropdown = document.getElementById('userDropdownMenu');
  dropdown.classList.toggle('show');
}

// Función para toggle del menú móvil
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.classList.toggle('show');
}

// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', function() {
  const dropdown = document.getElementById('userDropdownMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (dropdown) dropdown.classList.remove('show');
  if (mobileMenu) mobileMenu.classList.remove('show');
});

// Función para cerrar sesión desde el navbar
function cerrarSesionNavbar() {
  window.Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro que deseas salir?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#fd7e14',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      // Mostrar mensaje de despedida
      window.Swal.fire({
        title: '¡Hasta pronto!',
        text: 'Has cerrado sesión exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        // Redirigir al login
        window.location.href = '../login/login.html';
      });
    }
  });
}

// ----------------------
//  Cambio de tema
// ----------------------
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';

  if (currentTheme === 'light') {
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    document.querySelector('.theme-toggle-btn i').className = 'bx bx-sun';
  } else {
    body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
    document.querySelector('.theme-toggle-btn i').className = 'bx bx-moon';
  }
}

// ----------------------
//  Aplicar tema guardado
// ----------------------
function aplicarTemaGuardado() {
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme === 'dark';

  if (isDark) {
    document.body.classList.add('dark-theme');
  }

  // Espera un poco a que el navbar esté en el DOM
  setTimeout(() => {
    const icon = document.querySelector('.theme-toggle-btn i');
    if (icon) {
      icon.className = isDark ? 'bx bx-sun' : 'bx bx-moon';
    }
  }, 100);
}

// ----------------------
//  Llamar funciones al cargar
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('navbarContainer');  // asegúrate que el contenedor exista
  aplicarTemaGuardado();            // ahora sí, después del render
});
