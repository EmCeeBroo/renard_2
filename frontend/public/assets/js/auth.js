// --- REGISTRO DE USUARIO ---
// assets/js/auth.js

// Ocultar el preload cuando cargue la página
window.addEventListener("load", () => {
  const preload = document.getElementById("preloadId");
  if (preload) preload.style.display = "none";
});

// Verificación visual de fortaleza de la contraseña
function checkContraseñaStrength() {
  const contrasena = document.getElementById("contrasena").value;
  const strengthBar = document.getElementById("contraseñaStrengthBar");
  const mensaje = document.getElementById("mensaje-validacion");
  let strength = 0;
  let errores = [];

  if (contrasena.length >= 8) {
    strength += 20;
  } else {
    errores.push("Debe tener al menos 8 caracteres.");
  }

  if (/[A-Z]/.test(contrasena)) {
    strength += 20;
  } else {
    errores.push("Debe tener una letra mayúscula.");
  }

  if (/[a-z]/.test(contrasena)) {
    strength += 20;
  } else {
    errores.push("Debe tener una letra minúscula.");
  }

  if (/[0-9]/.test(contrasena)) {
    strength += 20;
  } else {
    errores.push("Debe tener un número.");
  }

  if (/[^A-Za-z0-9]/.test(contrasena)) {
    strength += 20;
  } else {
    errores.push("Debe tener un símbolo (ej: @, #, $, etc).");
  }

  // Visualizar barra
  strengthBar.style.width = strength + "%";

  if (strength < 50) {
    strengthBar.style.backgroundColor = "#dc3545"; // rojo
  } else if (strength < 80) {
    strengthBar.style.backgroundColor = "#ffc107"; // amarillo
  } else {
    strengthBar.style.backgroundColor = "#198754"; // verde
  }

  // Mostrar errores o éxito
  if (errores.length > 0) {
    mensaje.innerHTML = errores.map((e) => `• ${e}`).join("<br>");
  } else {
    mensaje.innerHTML = '<span class="text-success">¡Contraseña segura!</span>';
  }
}

// validar la politica de contraseña (misma del backend)
function validaPoliticaContrasena(pwd) {
  const reqs = {
    min8: pwd.length >= 8,
    mayus: /[A-Z]/.test(pwd),
    minus: /[a-z]/.test(pwd),
    numero: /\d/.test(pwd),
    simbolo: /[^A-Za-z0-9]/.test(pwd),
  };
  reqs.ok = Object.values(reqs).every(Boolean);
  return reqs;
}

// Función para registrar usuario
const registerUsuario = async () => {
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const confirmContrasena = document.getElementById("confirmContrasena").value.trim();

  const estado_usuario_fk = 1; // Activo
  const id_rol = 4; // Cliente

  if (!correo || !contrasena || !confirmContrasena) {
    window.Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor, completa todos los campos.",
    });
    return;
  }

  if (contrasena !== confirmContrasena) {
    window.Swal.fire({
      icon: "error",
      title: "Contraseña no coincide",
      text: "Verifica que ambas contraseñas sean iguales.",
    });
    return;
  }

  // Bloque por politica
  const reqs = validaPoliticaContrasena(contrasena);
  if (!reqs.ok) {
    const faltantes = [
      !reqs.min8 && "• Mínimo 8 caracteres",
      !reqs.mayus && "• Al menos una letra mayúscula",
      !reqs.minus && "• Al menos una letra minúscula",
      !reqs.numero && "• Al menos un número",
      !reqs.simbolo && "• Al menos un símbolo",
    ].filter(Boolean).join("<br>");

    await window.Swal.fire({
      icon: "warning",
      title: "Contraseña débil",
      html: `La contraseña no cumple:<br>${faltantes}`,
    });
    return;
  }

  try {
    const response = await fetch("http://192.168.0.9:3000/renard/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena, estado_usuario_fk, id_rol }),
    });

    const result = await response.json();

    if (response.ok) {
      window.Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "¡Ahora puedes iniciar sesión con tus credenciales!",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        window.location.href = "../login/login.html";
      });
    } else {
      window.Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: result.error || result.message || "No se pudo registrar el usuario.",
      });
    }
  } catch (error) {
    window.Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor.",
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const contraseñaInput = document.getElementById("contrasena");

  if (form)
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      registerUsuario();
    });

  if (contraseñaInput)
    contraseñaInput.addEventListener("keyup", checkContraseñaStrength);
});

// --- LOGIN DE USUARIO ---
// Función para iniciar sesión
const loginUsuario = async () => {
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const recuerdame = document.getElementById("userCheck").checked;

  if (!correo || !contrasena) {
    window.Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor, completa todos los campos.",
    });
    return;
  }

  try {
    const response = await fetch("http://192.168.0.9:3000/renard/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: correo, contrasena: contrasena }),
    });

    const result = await response.json();

    if (response.ok) {
      const usuario = result.usuario;
      const saludo =
        usuario.nombre && usuario.apellido
          ? `${usuario.nombre} ${usuario.apellido}`
          : usuario.correo;

      window.Swal.fire({
        icon: "success",
        title: "¡Login exitoso!",
        text: `¡Bienvenido, ${saludo}!`,
        showConfirmButton: false,
        timer: 2000,
      });

      // Guardar token y usuario en localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.usuario));

      // Guardar o eliminar correo según recuerdame
      if (recuerdame) {
        localStorage.setItem("correo", correo);
      } else {
        localStorage.removeItem("correo");
      }

      // Mostrar alerta elegante
      window.Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `¡Hola, ${saludo}!`,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        // Verificar si el usuario tiene restaurante asociado
        if (result.usuario.restaurante_fk !== null && result.usuario.restaurante_fk !== undefined) {
          // Usuario con restaurante - redirigir a homerestaurante.html
          window.location.href = "../ViewsRestaurante/homerestaurante/homerestaurante.html";
        } else {
          // Usuario sin restaurante - usar lógica de redirección por rol
          if (result.usuario.rol_fk === 4) {
            // Usuario con rol 4 - redirigir a inicioRenard.html
            window.location.href = "../viewsrenard/inicioClient.html";
          } else if (result.usuario.rol_fk === 3) {
            // Cliente
            window.location.href = "../viewsrenard/inicioClient.html";
          } else if (result.usuario.rol_fk === 1) {
            // Admin
            window.location.href = "../usuarioPanel/usuarioPanel.html";
          } else if (result.usuario.rol_fk === 2) {
            // Admin Restaurante - redirigir al dashboard de restaurante
            window.location.href = "../ViewsRestaurante/DashboardRestaurante_Adaptado.html";
          } else {
            window.location.href = "../viewsrenard/inicioRenard.html";
          }
        }
      });
    } else {
      window.Swal.fire({
        icon: "error",
        title: "Error",
        text: result.message || "Credenciales inválidas",
      });
    }
  } catch (error) {
    window.Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor.",
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const correoInput = document.getElementById("correo");
  const recuerdameCheckbox = document.getElementById("userCheck");

  // Prefill correo if saved in localStorage
  const savedCorreo = localStorage.getItem("correo");
  if (savedCorreo) {
    correoInput.value = savedCorreo;
    recuerdameCheckbox.checked = true;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loginUsuario();
    });
  }
});