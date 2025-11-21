// ------------------------------------------------------
// Debugging temporal
// ------------------------------------------------------
console.log(
  "Estructura completa del usuario:",
  JSON.parse(localStorage.getItem("usuario"))
);
console.log("Token:", localStorage.getItem("token"));

// ------------------------------------------------------
// Funciones auxiliares
// ------------------------------------------------------
function obtenerIdUsuario() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch {
    return null;
  }
}

let tiposDocMap = {};
async function cargarTiposDocumento() {
  try {
    const res = await fetch("http://127.0.0.1:3000/renard/tipos-documento");
    const tipos = await res.json();
    const select = document.getElementById("inputTipoDocumento");

    if (!select) {
      window.Swal.fire(
        "Error",
        "No se encontró el selector de tipo de documento.",
        "error"
      );
      return;
    }

    tipos.forEach((tipo) => {
      tiposDocMap[tipo.id_tipo_documento] = tipo.nombre;
      const option = document.createElement("option");
      option.value = Number.parseInt(tipo.id_tipo_documento, 10);
      option.textContent = tipo.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    window.Swal.fire(
      "Error",
      "No se pudieron cargar los tipos de documento.",
      "error"
    );
    console.error("Error al cargar tipos de documento:", error);
  }
}

function configurarInterfaz(perfilExistente) {
  const textoBoton = document.getElementById("textoBoton");
  const btnGuardar = document.getElementById("btnGuardar");
  const inputTipoDoc = document.getElementById("inputTipoDocumento");
  const inputNumDoc = document.getElementById("inputNumeroDocumento");

  if (perfilExistente) {
    textoBoton.textContent = "Editar Perfil";
    btnGuardar.textContent = "Actualizar Perfil";
    inputTipoDoc.disabled = true;
    inputNumDoc.readOnly = true;
  } else {
    textoBoton.textContent = "Completar Perfil";
    btnGuardar.textContent = "Guardar Perfil";
    inputTipoDoc.disabled = false;
    inputNumDoc.readOnly = false;
  }
}

// ------------------------------------------------------
// Lógica principal tras cargar DOM - VERSIÓN CORREGIDA
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const idUsuario = obtenerIdUsuario();
  if (!idUsuario) {
    window.Swal.fire("Atención", "No has iniciado sesión.", "warning");
    return;
  }

  // Variables de estado
  let perfilExistente = false;
  let fotoSeleccionada = null;
  let idPerfil = null;
  let correoUsuario = ""; // ← NUEVA VARIABLE PARA EL CORREO

  // 1. Carga tipos de documento
  await cargarTiposDocumento();

  try {
    console.log("Buscando perfil para usuario ID:", idUsuario);

    // ✅ PRIMERO OBTENER EL CORREO DEL USUARIO
    try {
      const resUsuario = await fetch(`http://127.0.0.1:3000/renard/usuario/${idUsuario}`);
      if (resUsuario.ok) {
        const usuario = await resUsuario.json();
        correoUsuario = usuario.correo || "";
        console.log("✅ Correo obtenido:", correoUsuario);
      } else {
        console.error("❌ Error al obtener usuario:", resUsuario.status);
      }
    } catch (error) {
      console.error("Error al obtener correo:", error);
    }

    // 2. Obtener TODOS los perfiles y buscar el del usuario actual
    const res = await fetch("http://127.0.0.1:3000/renard/perfil");

    if (res.ok) {
      const perfiles = await res.json();
      console.log("Todos los perfiles:", perfiles);

      // ✅ BUSCAR CORRECTAMENTE - Comparar como número
      const perfilUsuario = perfiles.find(p => Number.parseInt(p.usuario_fk) === Number.parseInt(idUsuario));

      if (perfilUsuario) {
        // ✅ PERFIL ENCONTRADO - SIEMPRE existe después del registro
        idPerfil = perfilUsuario.id_perfil;
        
        // ✅ DETECTAR SI TIENE DATOS O ESTÁ VACÍO
        const tieneDatos = 
          perfilUsuario.nombre && perfilUsuario.nombre.trim() !== '' &&
          perfilUsuario.apellido && perfilUsuario.apellido.trim() !== '' &&
          perfilUsuario.direccion && perfilUsuario.direccion.trim() !== '';
        
        perfilExistente = tieneDatos;
        
        console.log("✅ Perfil encontrado:", {
          idPerfil: idPerfil,
          usuario_fk: perfilUsuario.usuario_fk,
          tieneDatos: tieneDatos
        });

        // Mostrar datos en la tarjeta
        document.getElementById("nombre").textContent =
          perfilUsuario.nombre || "No registrado";
        document.getElementById("apellido").textContent =
          perfilUsuario.apellido || "No registrado";
        document.getElementById("telefono").textContent =
          perfilUsuario.telefono || "No registrado";
        document.getElementById("direccion").textContent =
          perfilUsuario.direccion || "No registrado";
        
        // ✅ USAR EL CORREO OBTENIDO DE LA TABLA USUARIO
        document.getElementById("correo").textContent =
          correoUsuario || "No registrado";
        
        document.getElementById("tipo_documento_fk").textContent =
          tiposDocMap[perfilUsuario.tipo_documento_fk] || "No registrado";
        document.getElementById("numero_documento").textContent =
          perfilUsuario.numero_documento || "No registrado";

        // Llenar formulario
        document.getElementById("inputNombre").value =
          perfilUsuario.nombre || "";
        document.getElementById("inputApellido").value =
          perfilUsuario.apellido || "";
        document.getElementById("inputTelefono").value =
          perfilUsuario.telefono || "";
        document.getElementById("inputDireccion").value =
          perfilUsuario.direccion || "";
        
        // ✅ USAR EL CORREO OBTENIDO EN EL FORMULARIO TAMBIÉN
        document.getElementById("inputCorreo").value = correoUsuario || "";
        
        document.getElementById("inputNumeroDocumento").value =
          perfilUsuario.numero_documento || "";

        if (perfilUsuario.tipo_documento_fk) {
          const select = document.getElementById("inputTipoDocumento");
          select.value = perfilUsuario.tipo_documento_fk;
        }

        // Cargar foto si existe
        if (perfilUsuario.foto) {
          const ruta = `img/perfiles/${perfilUsuario.foto}`;
          document.getElementById("foto").src = ruta;
          document.getElementById("fotoModal").src = ruta;
        }
      } else {
        // ❌ ESTO NO DEBERÍA PASAR - Si hay usuario, debería haber perfil
        console.error("❌ CRÍTICO: Usuario existe pero no tiene perfil");
        
        // ✅ PERO MOSTRAR EL CORREO AUNQUE NO HAYA PERFIL
        document.getElementById("correo").textContent = correoUsuario || "No registrado";
        document.getElementById("inputCorreo").value = correoUsuario || "";
        
        // Mostrar "No registrado" para los demás campos
        document.getElementById("nombre").textContent = "No registrado";
        document.getElementById("apellido").textContent = "No registrado";
        document.getElementById("telefono").textContent = "No registrado";
        document.getElementById("direccion").textContent = "No registrado";
        document.getElementById("tipo_documento_fk").textContent = "No registrado";
        document.getElementById("numero_documento").textContent = "No registrado";
        
        window.Swal.fire("Error", "Error crítico: Usuario sin perfil. Contacta al administrador.", "error");
        return;
      }
    } else {
      window.Swal.fire("Error", "Error al conectar con el servidor.", "error");
      return;
    }

    configurarInterfaz(perfilExistente);
  } catch (error) {
    console.error("Error al conectar con el servidor:", error);
    window.Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
  }

  // ------------------------------------------------------
  // Gestión de foto de perfil
  // ------------------------------------------------------
  document.getElementById("inputFoto").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      fotoSeleccionada = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById("fotoModal").src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  document
    .getElementById("btnActualizarFoto")
    .addEventListener("click", async () => {
      if (!fotoSeleccionada) {
        window.Swal.fire("Atención", "Selecciona una foto primero.", "warning");
        return;
      }

      if (!idPerfil) {
        window.Swal.fire(
          "Error",
          "No se puede actualizar foto: perfil no encontrado.",
          "error"
        );
        return;
      }
      const idUsuario = obtenerIdUsuario();
      const formData = new FormData();
      formData.append("foto", fotoSeleccionada);

      try {
        const res = await fetch(
          `http://127.0.0.1:3000/perfil/${idUsuario}/foto`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (res.ok) {
          window.Swal.fire(
            "Éxito",
            "Foto actualizada correctamente.",
            "success"
          );
          document.getElementById("foto").src =
            document.getElementById("fotoModal").src;
          bootstrap.Modal.getInstance(
            document.getElementById("modalFoto")
          ).hide();
        } else {
          window.Swal.fire("Error", "No se pudo actualizar la foto.", "error");
        }
      } catch (error) {
        window.Swal.fire(
          "Error",
          "No se pudo conectar con el servidor.",
          "error"
        );
      }
    });

  // ------------------------------------------------------
// Envío del formulario - VERSIÓN CORREGIDA
// ------------------------------------------------------
document
  .getElementById("formEditarPerfil")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ VERIFICAR QUE TENEMOS idPerfil
    if (!idPerfil) {
      window.Swal.fire("Error", "No se puede guardar: perfil no encontrado.", "error");
      return;
    }

    const tipoDocValue = Number.parseInt(
      document.getElementById("inputTipoDocumento").value,
      10
    );

    if (Number.isNaN(tipoDocValue)) {
      Swal.fire(
        "Atención",
        "Selecciona un tipo de documento válido.",
        "warning"
      );
      return;
    }

    // ✅ PREPARAR DATOS SIN EL CAMPO 'correo'
    const datos = {
      nombre: document.getElementById("inputNombre").value.trim(),
      apellido: document.getElementById("inputApellido").value.trim(),
      telefono: document.getElementById("inputTelefono").value.trim(),
      direccion: document.getElementById("inputDireccion").value.trim(),
      // ❌ QUITAR correo - no existe en la tabla perfil
      tipo_documento_fk: tipoDocValue,
      numero_documento: document
        .getElementById("inputNumeroDocumento")
        .value.trim(),
    };

    try {
      console.log("📤 Actualizando perfil existente ID:", idPerfil);
      console.log("📦 Datos:", datos);

      const res = await fetch(
        `http://127.0.0.1:3000/perfil/${idPerfil}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        }
      );

      if (res.ok) {
        const resultado = await res.json();
        console.log(resultado);
        window.Swal.fire(
          "Éxito",
          "Perfil actualizado correctamente.",
          "success"
        ).then(() => location.reload());
      } else {
        const errorData = await res.json();
        console.error("❌ Error del servidor:", errorData);
        window.Swal.fire(
          "Error",
          errorData.message || "No se pudo actualizar el perfil.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      window.Swal.fire(
        "Error",
        "Problema al conectar con el servidor.",
        "error"
      );
    }
  });

  // ------------------------------------------------------
  // Sincronizar vista principal y modal al abrir foto
  // ------------------------------------------------------
  document.getElementById("modalFoto").addEventListener("show.bs.modal", () => {
    document.getElementById("fotoModal").src =
      document.getElementById("foto").src;
  });
});