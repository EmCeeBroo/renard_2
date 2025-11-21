import { connect } from '../config/db/connect.js'

export const showZona = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM zona";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar zonas", details: error.message });
  }
};

export const showZonaId = async (req, res) => {
  try {
    const [result] = await connect.query("SELECT * FROM zona WHERE id_zona = ?", [req.params.id]);
    if (result.length === 0)
      return res.status(404).json({ error: "Zona no encontrada" });
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar zona", details: error.message });
  }
};

export const addZona = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "INSERT INTO zona (nombre, descripcion) VALUES (?, ?)";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion]);
    res.status(201).json({
      data: [{ id: result.insertId, nombre, descripcion }],
      status: 201,
      message: "Zona creada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar zona", details: error.message });
  }
};

export const updateZona = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "UPDATE zona SET nombre=?, descripcion=?, updated_at= CURRENT_TIMESTAMP	 WHERE id_zona = ?";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion, req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Zona no encontrada" });
    res.status(200).json({
      data: [{ nombre, descripcion  }],
      status: 200,
      updated: result.affectedRows,
      message:"zona actualizada correctamente"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar zona", details: error.message });
  }
};

export const deleteZona = async (req, res) => {
  try {
    const zonaId = req.params.id;

    // First, get all mesas for this zona
    const [mesas] = await connect.query("SELECT id_mesa FROM mesa WHERE zona_fk = ?", [zonaId]);

    // For each mesa, delete related reservaciones
    for (const mesa of mesas) {
      await connect.query("DELETE FROM reservacion WHERE mesa_fk = ?", [mesa.id_mesa]);
    }

    // Delete mesas
    await connect.query("DELETE FROM mesa WHERE zona_fk = ?", [zonaId]);

    // Finally, delete zona
    const [result] = await connect.query("DELETE FROM zona WHERE id_zona = ?", [zonaId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Zona no encontrada" });
    }

    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Zona eliminada con éxito junto con sus mesas y reservaciones relacionadas"
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar zona",
      details: error.message
    });
  }
};

