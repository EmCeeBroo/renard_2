import { connect } from '../config/db/connect.js';

// Obtener todos los registros de QR Menu
export const showQrMenu = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM qr_menu";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener QR Menu", details: error.message });
  }
};

// Obtener un registro de QR Menu por ID
export const showQrMenuId = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM qr_menu WHERE id_qr_menu = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.length === 0) {
      return res.status(404).json({ error: "QR Menu no encontrado" });
    }
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener QR Menu por ID", details: error.message });
  }
};

// Crear un nuevo QR Menu
export const addQrMenu = async (req, res) => {
  try {
    const { url, codigo_qr, restaurante_fk, menu_fk } = req.body;
    if (!url || !codigo_qr || !restaurante_fk || !menu_fk) {
      return res.status(400).json({ error: "Los campos url, codigo_qr, restaurante_fk y menu_fk son obligatorios" });
    }
    let sqlQuery = "INSERT INTO qr_menu (url, codigo_qr, restaurante_fk, menu_fk) VALUES (?, ?, ?, ?)";
    const [result] = await connect.query(sqlQuery, [url, codigo_qr, restaurante_fk, menu_fk]);
    res.status(201).json({
      data: [{ id: result.insertId, url, codigo_qr, restaurante_fk, menu_fk }],
      status: 201,
      message: "QR Menu creado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar QR Menu", details: error.message });
  }
};

// Actualizar un registro existente de QR Menu
export const updateQrMenu = async (req, res) => {
  try {
    const { url, codigo_qr, restaurante_fk, menu_fk } = req.body;
    if (!url || !codigo_qr || !restaurante_fk || !menu_fk) {
      return res.status(400).json({ error: "Los campos url, codigo_qr, restaurante_fk y menu_fk son obligatorios" });
    }
    let sqlQuery = "UPDATE qr_menu SET url = ?, codigo_qr = ?, restaurante_fk = ?, menu_fk = ?, updated_at=CURRENT_TIMESTAMP WHERE id_qr_menu = ?";
    const [result] = await connect.query(sqlQuery, [url, codigo_qr, restaurante_fk, menu_fk, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "QR Menu no encontrado para actualizar" });
    }
    res.status(200).json({
      data: [{ url, codigo_qr, restaurante_fk, menu_fk }],
      status: 200,
      updated: result.affectedRows,
      message: "QR Menu actualizado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar QR Menu", details: error.message });
  }
};

// Eliminar un registro de QR Menu
export const deleteQrMenu = async (req, res) => {
  try {
    let sqlQuery = "DELETE FROM qr_menu WHERE id_qr_menu = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "QR Menu no encontrado para eliminar" });
    }
    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "QR Menu eliminado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar QR Menu", details: error.message });
  }
};
