import { connect } from '../config/db/connect.js'

export const showRol = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM rol";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar Roles", details: error.message });
  }
};

export const showRolId = async (req, res) => {
  try {
    const [result] = await connect.query('SELECT * FROM rol WHERE id_rol = ?', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ error: "Rol no encontrado" });
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar Roles", details: error.message });
  }
};

export const addRol = async (req, res) => {
  try {
    const { nombre, descripcion, restaurante_fk } = req.body;
    if (!nombre || !descripcion ) {
      return res.status(400).json({ error: "Los campos nombre y descripcion son obligatorios" });
    }
    let sqlQuery = "INSERT INTO rol (nombre, descripcion, restaurante_fk) VALUES (?, ?, ?)";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion, restaurante_fk || null]);
    res.status(201).json({
      data: [{ id: result.insertId, nombre, descripcion, restaurante_fk }],
      status: 201,
      message: "Rol creado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar nuevo rol", details: error.message });
  }
};


export const updateRol = async (req, res) => {
  try {
    const { nombre, descripcion, restaurante_fk } = req.body;
    if (!nombre || !descripcion ) {
      return res.status(400).json({ error: "Los campos nombre y descripcion son obligatorios" });
    }
    let sqlQuery = "UPDATE rol SET nombre=?, descripcion=?, restaurante_fk=?, updated_at=CURRENT_TIMESTAMP WHERE id_rol=?";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion, restaurante_fk || null, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Rol no encontrado" });
    res.status(200).json({
      data: [{ nombre, descripcion, restaurante_fk }],
      status: 200,
      updated: result.affectedRows,
      message:"Rol actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el Rol", details: error.message });
  }
};


export const deleteRol = async (req, res) => {
  try {
    let sqlQuery = "DELETE FROM rol WHERE id_rol=?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Rol eliminado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar Rol", details: error.message });
  }
};
