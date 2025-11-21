import { connect } from '../config/db/connect.js';

// Mostrar todas las categorías
export const showCategoria = async (req, res) => {
  try {
    const [result] = await connect.query("SELECT * FROM categoria");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener categorías", details: error.message });
  }
};

// Mostrar categoría por ID
export const showCategoriaId = async (req, res) => {
  try {
    const [result] = await connect.query(
      "SELECT * FROM categoria WHERE id_categoria = ?",
      [req.params.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener categoría", details: error.message });
  }
};

// Agregar categoría
export const addCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El campo nombre es obligatorio" });
    }

    const sqlQuery = "INSERT INTO categoria (nombre) VALUES (?)";
    const [result] = await connect.query(sqlQuery, [nombre]);

    res.status(201).json({
      message: "Categoría creada correctamente",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
    } else {
      res.status(500).json({ error: "Error al crear categoría", details: error.message });
    }
  }
};

// Actualizar categoría
export const updateCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El campo nombre es obligatorio" });
    }

    const sqlQuery =
      "UPDATE categoria SET nombre = ?, updated_at = CURRENT_TIMESTAMP WHERE id_categoria = ?";
    const [result] = await connect.query(sqlQuery, [nombre, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.status(200).json({ message: "Categoría actualizada correctamente" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
    } else {
      res.status(500).json({ error: "Error al actualizar categoría", details: error.message });
    }
  }
};

// Eliminar categoría
export const deleteCategoria = async (req, res) => {
  try {
    const sqlQuery = "DELETE FROM categoria WHERE id_categoria = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.status(200).json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar categoría", details: error.message });
  }
};


