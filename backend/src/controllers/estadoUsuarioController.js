import { connect } from '../config/db/connect.js'

export const showEstadoUsuario = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM estado_usuario";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estado del usuario", details: error.message });
  }
};

export const showEstadoUsuarioId = async (req, res) => {
  try {
    const [result] = await connect.query('SELECT * FROM estado_usuario WHERE id_estado_usuario= ?', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ error: "Estado de usuario no encontrado" });
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estado del usuario", details: error.message });
  }
};

export const addEstadoUsuario = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion ) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "INSERT INTO estado_usuario (nombre,descripcion) VALUES (?,?)";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion]);
    res.status(201).json({
      data: [{ id: result.insertId, nombre, descripcion }],
      status: 201,
      message: "estado usuario creada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al añadir estado de usuario", details: error.message });
  }
};

export const updateEstadoUsuario = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion ) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "UPDATE estado_usuario SET nombre=?,descripcion=?,updated_at=CURRENT_TIMESTAMP WHERE id_estado_usuario= ?";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Estado de usuario no encontrado" });
    res.status(200).json({
      data: [{ nombre, descripcion }],
      status: 200,
      updated: result.affectedRows,
      message:"estado usuario actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar estado de usuario", details: error.message });
  }
};

export const deleteEstadoUsuario = async (req, res) => {
  try {
    let sqlQuery = "DELETE FROM estado_usuario WHERE id_estado_usuario= ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Estado de usuario no encontrado" });
    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Estado usuario eliminado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar estado de usuario", details: error.message });
  }
};