// Obtener id del usuario desde token
  function obtenerIdUsuario() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  }
document.addEventListener("DOMContentLoaded", () => {
  const restaurantesContainer = document.getElementById("restaurantesContainer");
  const inputHidden = document.getElementById("restaurante_fk");
  const inputMesa = document.getElementById("mesa_fk");
  const btnReservar = document.getElementById("btnReservar");
  const formReservacion = document.getElementById("formReservacion");
  const mensaje = document.getElementById("mensaje");
  const sucursalSelect = document.getElementById("sucursal_fk");
  const sucursalContainer = document.getElementById("sucursalContainer");
  const mesasDisponiblesContainer = document.getElementById("mesasDisponiblesContainer");
  const mesasDisponiblesList = document.getElementById("mesasDisponiblesList");

  const idUsuario = obtenerIdUsuario();
  if (!idUsuario) {
    alert("No has iniciado sesión. Por favor inicia sesión para hacer una reservación.");
    btnReservar.disabled = true;
    return;
  }

  // Habilitar o deshabilitar botón reservar
  const actualizarBoton = () => {
    const tieneRestaurante = inputHidden.value !== "";
    const tieneSucursal = sucursalSelect.value !== "";
    const tieneMesa = inputMesa.value !== "";
    const tieneFecha = formReservacion.fecha.value !== "";
    const tieneHoraInicio = formReservacion.hora_inicio.value !== "";
    const tieneHoraFin = formReservacion.hora_fin.value !== "";
    const tienePersonas = formReservacion.numero_personas.value !== "";
    
    btnReservar.disabled = !(tieneRestaurante && tieneSucursal && tieneMesa && 
                            tieneFecha && tieneHoraInicio && tieneHoraFin && tienePersonas);
  };

  // Validar horas
  const validarHoras = () => {
    const horaInicio = formReservacion.hora_inicio.value;
    const horaFin = formReservacion.hora_fin.value;
    
    if (horaInicio && horaFin) {
      const inicio = new Date(`2000-01-01T${horaInicio}`);
      const fin = new Date(`2000-01-01T${horaFin}`);
      const diferenciaMinutos = (fin - inicio) / (1000 * 60);
      
      if (diferenciaMinutos <= 30) {
        mostrarMensaje("La duración mínima de la reservación debe ser de 30 minutos", "error");
        return false;
      }
      
      if (diferenciaMinutos >= 120) {
        mostrarMensaje("La duración máxima de la reservación debe ser de 2 horas", "error");
        return false;
      }
    }
    return true;
  };

  // Mostrar mensajes
  const mostrarMensaje = (texto, tipo = "info") => {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    setTimeout(() => {
      mensaje.textContent = "";
      mensaje.className = "mensaje";
    }, 5000);
  };

  // Cargar sucursales de un restaurante
  const cargarSucursalesPorRestaurante = async (restauranteId) => {
    if (!restauranteId) {
      sucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>';
      sucursalSelect.disabled = true;
      sucursalContainer.style.display = "none";
      return;
    }

    try {
      const response = await fetch('http://192.168.0.9:3000/renard/sucursal');
      const todasLasSucursales = await response.json();
      const sucursalesFiltradas = todasLasSucursales.filter(s => s.restaurante_fk == restauranteId);
      
      sucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>';
      sucursalesFiltradas.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal.id_sucursal;
        option.textContent = sucursal.nombre;
        sucursalSelect.appendChild(option);
      });
      
      sucursalSelect.disabled = false;
      sucursalContainer.style.display = "block";
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
      mostrarMensaje("Error al cargar las sucursales", "error");
    }
  };

  // Cargar mesas disponibles
  const cargarMesasDisponibles = async (sucursalId, fecha, horaInicio, horaFin) => {
    if (!sucursalId || !fecha || !horaInicio || !horaFin) {
      mesasDisponiblesList.innerHTML = "Complete fecha y horas para ver mesas disponibles.";
      mesasDisponiblesContainer.style.display = "block";
      inputMesa.value = "";
      actualizarBoton();
      return;
    }

    try {
      const response = await fetch(`http://192.168.0.9:3000/renard/mesa/sucursal/${sucursalId}`);
      if (!response.ok) throw new Error("Error al obtener mesas");
      const mesas = await response.json();

      mesasDisponiblesList.innerHTML = "";
      if (mesas.length === 0) {
        mesasDisponiblesList.textContent = "No hay mesas disponibles para esta sucursal.";
        inputMesa.value = "";
        mesasDisponiblesContainer.style.display = "block";
        actualizarBoton();
        return;
      }
      
      mesasDisponiblesContainer.style.display = "block";

      mesas.forEach(mesa => {
        const btnMesa = document.createElement("button");
        btnMesa.type = "button"; // importante
        btnMesa.classList.add("mesa-btn");
        btnMesa.textContent = `Mesa ${mesa.numero_mesa || mesa.id_mesa}`;
        btnMesa.dataset.id = mesa.id_mesa;

        btnMesa.addEventListener("click", () => {
          // Quitar selección a todas
          const botonesMesas = mesasDisponiblesList.querySelectorAll(".mesa-btn");
          botonesMesas.forEach(b => b.classList.remove("seleccionada"));

          // Seleccionar la mesa clickeada
          btnMesa.classList.add("seleccionada");
          inputMesa.value = btnMesa.dataset.id;

          actualizarBoton();
        });

        mesasDisponiblesList.appendChild(btnMesa);
      });
    } catch (error) {
      mesasDisponiblesList.textContent = "Error al cargar las mesas.";
      mesasDisponiblesContainer.style.display = "block";
      inputMesa.value = "";
      actualizarBoton();
      console.error("Error al cargar mesas:", error);
    }
  };

  // Renderizar restaurantes
  const renderRestaurantes = (restaurantes) => {
    restaurantesContainer.innerHTML = "";
    restaurantes.forEach(restaurante => {
      const restauranteLink = document.createElement("a");
      restauranteLink.classList.add("restaurante");
      restauranteLink.href = "#";
      restauranteLink.style.backgroundImage = `url('../public/assets/img/restaurantes/${restaurante.url_imagen}')`;
      restauranteLink.dataset.id = restaurante.id_restaurante;

      const nombreDiv = document.createElement("div");
      nombreDiv.classList.add("nombre");
      nombreDiv.textContent = restaurante.nombre;

      restauranteLink.appendChild(nombreDiv);

      restauranteLink.addEventListener("click", (e) => {
        e.preventDefault();
        const yaSeleccionado = restauranteLink.classList.contains("seleccionado");
        const items = document.querySelectorAll(".restaurante");
        items.forEach(i => i.classList.remove("seleccionado"));

        if (!yaSeleccionado) {
          restauranteLink.classList.add("seleccionado");
          inputHidden.value = restauranteLink.dataset.id;
          cargarSucursalesPorRestaurante(restauranteLink.dataset.id);
        } else {
          inputHidden.value = "";
          sucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>';
          sucursalSelect.disabled = true;
          sucursalContainer.style.display = "none";
          inputMesa.value = "";
          mesasDisponiblesContainer.style.display = "none";
          mesasDisponiblesList.innerHTML = "";
        }
        actualizarBoton();
      });

      restaurantesContainer.appendChild(restauranteLink);
    });
  };

  // Eventos
  sucursalSelect.addEventListener("change", () => {
    if (sucursalSelect.value) {
      cargarMesasDisponibles(
        sucursalSelect.value,
        formReservacion.fecha.value,
        formReservacion.hora_inicio.value,
        formReservacion.hora_fin.value
      );
    } else {
      inputMesa.value = "";
      mesasDisponiblesContainer.style.display = "none";
      mesasDisponiblesList.innerHTML = "";
      actualizarBoton();
    }
  });

  formReservacion.fecha.addEventListener("change", () => {
    if (sucursalSelect.value) {
      cargarMesasDisponibles(
        sucursalSelect.value,
        formReservacion.fecha.value,
        formReservacion.hora_inicio.value,
        formReservacion.hora_fin.value
      );
    }
    actualizarBoton();
  });

  formReservacion.hora_inicio.addEventListener("change", () => {
    validarHoras();
    if (sucursalSelect.value) {
      cargarMesasDisponibles(
        sucursalSelect.value,
        formReservacion.fecha.value,
        formReservacion.hora_inicio.value,
        formReservacion.hora_fin.value
      );
    }
    actualizarBoton();
  });

  formReservacion.hora_fin.addEventListener("change", () => {
    validarHoras();
    if (sucursalSelect.value) {
      cargarMesasDisponibles(
        sucursalSelect.value,
        formReservacion.fecha.value,
        formReservacion.hora_inicio.value,
        formReservacion.hora_fin.value
      );
    }
    actualizarBoton();
  });

  formReservacion.numero_personas.addEventListener("input", actualizarBoton);

  // Cargar restaurantes
  fetch("http://192.168.0.9:3000/renard/restaurante")
    .then(response => response.json())
    .then(data => {
      renderRestaurantes(data);
      actualizarBoton();
    })
    .catch(error => {
      console.error("Error al cargar restaurantes:", error);
      mostrarMensaje("Error al cargar los restaurantes", "error");
    });

  // Enviar formulario
  formReservacion.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validarHoras()) return;

    const formData = {
      restaurante_fk: inputHidden.value,
      sucursal_fk: sucursalSelect.value,
      mesa_fk: inputMesa.value,
      fecha: formReservacion.fecha.value,
      hora_inicio: formReservacion.hora_inicio.value,
      hora_fin: formReservacion.hora_fin.value,
      numero_personas: Number.parseInt(formReservacion.numero_personas.value),
      anotaciones: formReservacion.anotaciones.value,
      estado_reservacion: 1,
      usuario_fk: idUsuario
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://192.168.0.9:3000/renard/reservacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        mostrarMensaje("Reservación creada con éxito", "exito");
        formReservacion.reset();
        inputHidden.value = "";
        sucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>';
        sucursalSelect.disabled = true;
        sucursalContainer.style.display = "none";
        inputMesa.value = "";
        mesasDisponiblesContainer.style.display = "none";
        mesasDisponiblesList.innerHTML = "";

        const items = document.querySelectorAll(".restaurante");
        items.forEach(i => i.classList.remove("seleccionado"));
        
        actualizarBoton();
      } else {
        mostrarMensaje(result.error || "Error al crear la reservación", "error");
      }
    } catch (error) {
      mostrarMensaje("Error de conexión al crear la reservación", "error");
    }
  });

  actualizarBoton();
});