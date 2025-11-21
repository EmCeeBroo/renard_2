function renderNavbar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <header class="nav-bar">
      <div class="nav-left">
        <span class="logo">RENARD</span>
      </div>
      <nav class="nav-center">
        <a href="../viewsrenard/inicioRenard.html"><i class='bx bx-home'></i> Inicio</a>
        <a href="../viewsrenard/restaurantesRenard.html"><i class='bx bx-gift'></i> Restaurantes</a>
        <a href="../viewsrenard/reservaRenard.html"><i class='bx bx-calendar'></i> Reservas</a>
        <a
          href="../viewsrenard/perfil.html" class="user-icon-btn dropdown-toggle"
          id="userDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          title="Perfil"
        >
          <i class='bx bx-user'></i>
          Perfil
        </a>
        <a href="../../views/login/login.html"><i class='bx bx-finger-right'></i> Cerrar Sesión</a>
      </nav>
      <div class="nav-right dropdown">
        <!-- Aquí iría tu dropdown-menu si lo necesitas -->
      </div>
    </header>
  `;
}
