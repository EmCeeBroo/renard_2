import { connect } from '../config/db/connect.js';

export const showEstadoReservacion = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM estado_reservacion";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estado de reservacion", details: error.message });
  }
};

export const showEstadoReservacionId = async (req, res) => {
  try {
    const [result] = await connect.query(
      "SELECT * FROM estado_reservacion WHERE id_estado_reservacion = ?",
      [req.params.id]
    );
    if (result.length === 0)
      return res.status(404).json({ error: "Estado de reservacion no encontrado" });
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estado de reservacion", details: error.message });
  }
};

export const addEstadoReservacion = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "INSERT INTO estado_reservacion (nombre, descripcion) VALUES (?, ?)";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion]);
    res.status(201).json({
      data: [{ id: result.insertId, nombre, descripcion }],
      status: 201,
      message: "Estado reservacion creada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al añadir estado de reservacion", details: error.message });
  }
};

export const updateEstadoReservacion = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "UPDATE estado_reservacion SET nombre = ?, descripcion = ?, updated_at=CURRENT_TIMESTAMP WHERE id_estado_reservacion = ?";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion, req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Estado de reservacion no encontrado" });
    res.status(200).json({
      data: [{ nombre, descripcion }],
      status: 200,
      updated: result.affectedRows,
      message:"actualizado correctamente estado mesa"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar estado de reservacion", details: error.message });
  }
};

export const deleteEstadoReservacion = async (req, res) => {
  try {
    let sqlQuery = "DELETE FROM estado_reservacion WHERE id_estado_reservacion = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Estado de reservacion no encontrado" });
    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Estado reservacion eliminada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar estado de reservacion", details: error.message });
  }
};
