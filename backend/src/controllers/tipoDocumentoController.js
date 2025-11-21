import { connect } from '../config/db/connect.js'

export const showTipoDocumento = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM tipo_documento";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar tipos de documento", details: error.message });
  }
};

export const showTipoDocumentoId = async (req, res) => {
  try {
    const [result] = await connect.query("SELECT * FROM tipo_documento WHERE id_tipo_documento = ?", [req.params.id]);
    if (result.length === 0)
      return res.status(404).json({ error: "Tipo de documento no encontrado" });
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar tipo de documento", details: error.message });
  }
};

export const addTipoDocumento = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "INSERT INTO tipo_documento (nombre, descripcion) VALUES (?, ?)";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion]);
    res.status(201).json({
      data: [{ id: result.insertId, nombre, descripcion }],
      status: 201,
      message: "Tipo documento creado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar tipo de documento", details: error.message });
  }
};

export const updateTipoDocumento = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "UPDATE tipo_documento SET nombre=?, descripcion=? WHERE id_tipo_documento = ?";

    const [result] = await connect.query(sqlQuery, [nombre, descripcion, req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Tipo de documento no encontrado" });
    res.status(200).json({
      data: [{ nombre, descripcion }],
      status: 200,
      updated: result.affectedRows,
      message:"tipo de documento actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar tipo de documento", details: error.message });
  }
};

export const deleteTipoDocumento = async (req, res) => {
  try {
    let sqlQuery = "DELETE FROM tipo_documento WHERE id_tipo_documento = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Tipo de documento no encontrado" });
    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Tipo de documento eliminado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tipo de documento", details: error.message });
  }
};
