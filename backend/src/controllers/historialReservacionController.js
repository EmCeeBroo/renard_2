import { connect } from '../config/db/connect.js';

// Obtener todos los registros de historial de reservación
export const showHistorialReservacion = async (req, res) => {
  try {
    const { restaurante_fk } = req.query;
    let sqlQuery = `
      SELECT
        r.id_reservacion,
        r.numero_personas,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        r.estado_reservacion,
        r.anotaciones,
        r.created_at,
        r.updated_at,
        rest.nombre AS nombre_restaurante,
        m.numero_mesa
      FROM reservacion r
      JOIN restaurante rest ON r.restaurante_fk = rest.id_restaurante
      LEFT JOIN usuario u ON r.usuario_fk = u.id_usuario
      LEFT JOIN mesa m ON r.mesa_fk = m.id_mesa
    `;
    //u.apellido AS apellido_usuario,
    const params = [];

    if (restaurante_fk) {
      sqlQuery += " WHERE r.restaurante_fk = ?";
      params.push(restaurante_fk);
    }

    sqlQuery += " ORDER BY r.updated_at DESC";

    const [result] = await connect.query(sqlQuery, params);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener las reservaciones",
      details: error.message
    });
  }
};

// NUEVA FUNCIÓN específica para historial de usuario
export const showHistorialReservacionUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    
    if (!id_usuario) {
      return res.status(400).json({ 
        error: "El parámetro id_usuario es obligatorio" 
      });
    }

    // ⚠️ CONVERTIR A NÚMERO EXPLÍCITAMENTE
    const usuarioIdInt = Number.parseInt(id_usuario, 10);

    const sqlQuery = `
      SELECT
        r.*,
        rest.nombre AS nombre_restaurante
      FROM reservacion r
      LEFT JOIN restaurante rest ON r.restaurante_fk = rest.id_restaurante
      WHERE r.usuario_fk = ?
      ORDER BY r.fecha DESC, r.hora_inicio DESC
    `;

    const [result] = await connect.query(sqlQuery, [usuarioIdInt]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      error: "Error al obtener reservaciones del usuario", 
      details: error.message 
    });
  }
};


// Obtener un registro de historial de reservación por ID
export const showHistorialReservacionId = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM historial_reservacion WHERE id_historial_reservacion = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);

    if (result.length === 0)
      return res.status(404).json({ error: "Historial de reservación no encontrado" });

    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el historial de reservación", details: error.message });
  }
};

// Crear un nuevo registro en historial de reservación
export const addHistorialReservacion = async (req, res) => {
  try {
    const { fecha_cambio_estado, reservacion_fk, estado_reservacion_fk} = req.body;
    if (!fecha_cambio_estado || !reservacion_fk || !estado_reservacion_fk) {
      return res.status(400).json({ error: "Los campos 'fecha_cambio_estado', 'reservacion_fk' y 'estado_reservacion_fk' son obligatorios" });
    }
    const sqlQuery = "INSERT INTO historial_reservacion (fecha_cambio_estado, reservacion_fk, estado_reservacion_fk) VALUES (?, ?, ?)";
    const [result] = await connect.query(sqlQuery, [fecha_cambio_estado, reservacion_fk, estado_reservacion_fk]);
    res.status(201).json({
      data: [{ id: result.insertId, fecha_cambio_estado, reservacion_fk, estado_reservacion_fk }],
      status: 201,
      message: "Historial de reservación creado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al añadir el historial de reservación", details: error.message });
  }
};

// Actualizar un registro de historial de reservación
export const updateHistorialReservacion = async (req, res) => {
  try {
    const {fecha_cambio_estado, reservacion_fk, estado_reservacion_fk} = req.body;
    if (!fecha_cambio_estado || !reservacion_fk || estado_reservacion_fk) {
      return res.status(400).json({ error: "Los campos 'fecha_cambio_estado', 'reservacion_fk' y 'estado_reservacion_fk' son obligatorios" });
    }
    const sqlQuery = "UPDATE historial_reservacion SET fecha_cambio_estado = ?, reservacion_fk = ?, updated_at=CURRENT_TIMESTAMP WHERE id_historial_reservacion = ?";
    const [result] = await connect.query(sqlQuery, [fecha_cambio_estado, reservacion_fk, estado_reservacion_fk, req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Historial de reservación no encontrado" });
    res.status(200).json({
      data: [{ fecha_cambio_estado, reservacion_f, estado_reservacion_fk}],
      status: 200,
      updated: result.affectedRows,
      message: "Historial de reservación actualizado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el historial de reservación", details: error.message });
  }
};

// Eliminar un registro de historial de reservación
export const deleteHistorialReservacion = async (req, res) => {
  try {
    const sqlQuery = "DELETE FROM historial_reservacion WHERE id_historial_reservacion = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Historial de reservación no encontrado" });
    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Historial de reservación eliminado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el historial de reservación", details: error.message });
  }
};
