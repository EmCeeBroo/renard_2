import { connect } from '../config/db/connect.js';

// Obtener todas las sucursales
export const showSucursales = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM sucursal";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener sucursales", details: error.message });
  }
};

// Obtener una sucursal por ID
export const showSucursalId = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM sucursal WHERE id_sucursal = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener sucursal por ID", details: error.message });
  }
};

// Crear una nueva sucursal
export const addSucursal = async (req, res) => {
  try {
    const { nombre, direccion, horario_apertura, horario_cierre, restaurante_fk } = req.body;
    if (!nombre || !direccion || !horario_apertura || !horario_cierre || !restaurante_fk) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const sqlQuery = "INSERT INTO sucursal (nombre, direccion, horario_apertura, horario_cierre, restaurante_fk) VALUES (?, ?, ?, ?, ?)";
    const [result] = await connect.query(sqlQuery, [nombre, direccion, horario_apertura, horario_cierre, restaurante_fk]);

    res.status(201).json({
      data: [{ id: result.insertId, nombre, direccion, horario_apertura, horario_cierre, restaurante_fk }],
      status: 201,
      message: "Sucursal creada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al crear sucursal", details: error.message });
  }
};

// Actualizar una sucursal existente
export const updateSucursal = async (req, res) => {
  try {
    const { nombre, direccion, horario_apertura, horario_cierre, restaurante_fk } = req.body;
    if (!nombre || !direccion || !horario_apertura || !horario_cierre || !restaurante_fk) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const sqlQuery = "UPDATE sucursal SET nombre = ?, direccion = ?, horario_apertura = ?, horario_cierre = ?, restaurante_fk = ?, updated_at = CURRENT_TIMESTAMP WHERE id_sucursal = ?";
    const [result] = await connect.query(sqlQuery, [nombre, direccion, horario_apertura, horario_cierre, restaurante_fk, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sucursal no encontrada para actualizar" });
    }

    res.status(200).json({
      data: [{ nombre, direccion, horario_apertura, horario_cierre, restaurante_fk }],
      status: 200,
      updated: result.affectedRows,
      message: "Sucursal actualizada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar sucursal", details: error.message });
  }
};

// Eliminar una sucursal
export const deleteSucursal = async (req, res) => {
  try {
    const sqlQuery = "DELETE FROM sucursal WHERE id_sucursal = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sucursal no encontrada para eliminar" });
    }

    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Sucursal eliminada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar sucursal", details: error.message });
  }
};


// Obtener sucursales de un restaurante
export const showSucursalesByRestaurante = async (req, res) => {
  try {
    const { id } = req.params;
    const sqlQuery = "SELECT * FROM sucursal WHERE restaurante_fk = ?";
    const [result] = await connect.query(sqlQuery, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No hay sucursales para este restaurante" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener sucursales por restaurante",
      details: error.message
    });
  }
};
