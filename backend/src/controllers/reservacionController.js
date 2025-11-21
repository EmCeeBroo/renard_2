import { connect } from '../config/db/connect.js';

// Obtener todas las reservaciones
export const showReservacion = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM reservacion"; 
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las reservaciones", details: error.message });
  }
};

// Obtener una reservación por ID
export const showReservacionId = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM reservacion WHERE id_reservacion = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: "Reservación no encontrada" });
    }

    res.status(200).json(result[0]); 
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reservación por ID", details: error.message });
  }
};

// Crear una nueva reservación
export const addReservacion = async (req, res) => {
  try {
    let { numero_personas, fecha, hora_inicio, hora_fin, estado_reservacion, restaurante_fk, anotaciones, usuario_fk, sucursal_fk, mesa_fk } = req.body;

    if (!numero_personas || !fecha || !hora_inicio || !estado_reservacion || !restaurante_fk || !sucursal_fk || !mesa_fk) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Permitir usuario_fk nulo o indefinido
    if (!usuario_fk) {
      usuario_fk = null;
    }

    // Mapear estado_reservacion si es string a un valor numérico (ejemplo)
    const estadosMap = {
      "Confirmada": 1,
      "Pendiente": 2,
      "Cancelada": 3,
      "Completada": 4
    };

    if (typeof estado_reservacion === "string") {
      estado_reservacion = estadosMap[estado_reservacion] || 1; // Por defecto Pendiente
    }

    const sqlQuery = "INSERT INTO reservacion (numero_personas, fecha, hora_inicio, hora_fin, usuario_fk, estado_reservacion, restaurante_fk, anotaciones, mesa_fk, sucursal_fk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const [result] = await connect.query(sqlQuery, [numero_personas, fecha, hora_inicio, hora_fin, usuario_fk, estado_reservacion, restaurante_fk, anotaciones, mesa_fk, sucursal_fk]);

    res.status(201).json({
      data: [{ id: result.insertId, numero_personas, fecha, hora_inicio, hora_fin, usuario_fk, estado_reservacion, restaurante_fk, anotaciones, mesa_fk, sucursal_fk }],
      status: 201,
      message: "Reservación creada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al crear la reservación", details: error.message });
  }
};


// Actualizar una reservación existente
export const updateReservacion = async (req, res) => {
  try {
    const { numero_personas, fecha, hora_inicio, hora_fin, usuario_fk, estado_reservacion, restaurante_fk, anotaciones, mesa_fk, sucursal_fk } = req.body;
    if (!numero_personas || !fecha || !hora_inicio || !usuario_fk || !estado_reservacion || !restaurante_fk || !mesa_fk || !sucursal_fk) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const sqlQuery = "UPDATE reservacion SET numero_personas = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, usuario_fk = ?, estado_reservacion = ?, restaurante_fk = ?, anotaciones = ?, mesa_fk = ?, sucursal_fk = ?, updated_at =CURRENT_TIMESTAMP WHERE id_reservacion = ?";
    const [result] = await connect.query(sqlQuery, [numero_personas, fecha, hora_inicio, hora_fin, usuario_fk, estado_reservacion, restaurante_fk, anotaciones, mesa_fk, sucursal_fk, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservación no encontrada para actualizar" });
    }

    res.status(200).json({
      data: [{ numero_personas, fecha, hora_inicio, hora_fin, usuario_fk, estado_reservacion, restaurante_fk, anotaciones, mesa_fk, sucursal_fk }],
      status: 200,
      updated: result.affectedRows,
      message: "Reservación actualizada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la reservación", details: error.message });
  }
};

// controllers/reservacionController.js
export const updateEstadoReservacion = async (req, res) => {
  try {
    const { estado_reservacion } = req.body;
    const { id } = req.params;

    if (!estado_reservacion) {
      return res.status(400).json({ error: "El campo estado_reservacion es obligatorio" });
    }

    // 1. Actualizar el estado en reservacion
    const sqlUpdate = "UPDATE reservacion SET estado_reservacion = ?, updated_at = CURRENT_TIMESTAMP WHERE id_reservacion = ?";
    const [result] = await connect.query(sqlUpdate, [estado_reservacion, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservación no encontrada" });
    }

    // 2. Insertar en historial_reservacion
    const sqlHistorial = `
      INSERT INTO historial_reservacion (fecha_cambio_estado, reservacion_fk, estado_reservacion_fk)
      VALUES (NOW(), ?, ?)
    `;
    await connect.query(sqlHistorial, [id, estado_reservacion]);

    res.status(200).json({
      message: "Estado de la reservación actualizado con éxito",
      id,
      estado_reservacion
    });

  } catch (error) {
    res.status(500).json({ error: "Error al actualizar estado", details: error.message });
  }
};




// Eliminar una reservación
export const deleteReservacion = async (req, res) => {
  try {
    const sqlQuery = "DELETE FROM reservacion WHERE id_reservacion = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reservación no encontrada para eliminar" });
    }

    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Reservación eliminada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la reservación", details: error.message });
  }
};

// Obtener mesas disponibles según restaurante
export const getMesasDisponiblesPorRestaurante = async (req, res) => {
  try {
    const { restaurante_fk } = req.params;
    if (!restaurante_fk) {
      return res.status(400).json({ error: "El id del restaurante es obligatorio" });
    }
    const sqlQuery = `
      SELECT m.id_mesa, m.zona_fk, m.estado_mesa_fk, m.restaurante_fk
      FROM mesa m
      WHERE m.restaurante_fk = ? AND m.estado_mesa_fk = 1
    `;
    const [result] = await connect.query(sqlQuery, [restaurante_fk]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mesas disponibles", details: error.message });
  }
};

// Nueva función para obtener reservaciones filtradas por restaurante, fecha y hora
export const getReservacionesFiltradas = async (req, res) => {
  try {
    const { restaurante_fk, fecha, hora } = req.query;

    if (!restaurante_fk || !fecha || !hora) {
      return res.status(400).json({ error: "Faltan parámetros: restaurante_fk, fecha o hora" });
    }

    const sqlQuery = `
      SELECT * FROM reservacion
      WHERE restaurante_fk = ? AND fecha = ? AND hora = ? AND estado_reservacion = 'Pendiente'
    `;
    const [result] = await connect.query(sqlQuery, [restaurante_fk, fecha, hora]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reservaciones filtradas", details: error.message });
  }
};

// Obtener reservaciones de un restaurante
export const showReservacionesByRestaurante = async (req, res) => {
  try {
    const { id } = req.params;
    const sqlQuery = "SELECT * FROM reservacion WHERE restaurante_fk = ?";
    const [result] = await connect.query(sqlQuery, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No hay reservaciones para este restaurante" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reservaciones por restaurante",
      details: error.message
    });
  }
};

// Obtener reservaciones por usuario con nombre del restaurante
export const showReservacionesByUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const sqlQuery = `
      SELECT r.*, rest.nombre AS nombre_restaurante
      FROM reservacion r
      INNER JOIN restaurante rest ON r.restaurante_fk = rest.id_restaurante
      WHERE r.usuario_fk = ?
      ORDER BY r.fecha DESC, r.hora_inicio DESC
    `;
    const [result] = await connect.query(sqlQuery, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No hay reservaciones para este usuario" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reservaciones por usuario",
      details: error.message,
    });
  }
};

