import { connect } from '../config/db/connect.js'

export const showEstadoMesa = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM estado_mesa";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estado de la mesa", details: error.message });
  }
};

export const showEstadoMesaId = async (req, res) => {
  try {
    const [result] = await connect.query('SELECT * FROM estado_mesa WHERE id_estado_mesa= ?', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ error: "Estado de reservacion no encontrado" });
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estado de la mesa", details: error.message });
  }
};

export const addEstadoMesa = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion ) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "INSERT INTO estado_mesa (nombre,descripcion) VALUES (?,?)";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion]);
    res.status(201).json({
      data: [{ id: result.insertId, nombre, descripcion }],
      status: 201,
      message: "Estado mesa creada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al añadir estado de la mesa", details: error.message });
  }
};

export const updateEstadoMesa = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion ) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "UPDATE estado_mesa SET nombre=?, descripcion=?, updated_at=CURRENT_TIMESTAMP WHERE id_estado_mesa= ?";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Estado de usuario no encontrado" });
    res.status(200).json({
      data: [{nombre, descripcion, }],
      status: 200,
      updated: result.affectedRows,
      message:"actualizado correctamente estado mesa"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar estado de la mesa", details: error.message });
  }
};

export const deleteEstadoMesa = async (req, res) => {
  try {
    let sqlQuery = "DELETE FROM estado_mesa WHERE id_estado_mesa= ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Estado de la mesa no encontrado" });
    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "estado de mesa eliminada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar estado de la mesa", details: error.message });
  }
};