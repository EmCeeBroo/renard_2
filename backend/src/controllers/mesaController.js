import { connect } from '../config/db/connect.js';

// Obtener todas las mesas con detalles de zona, estado y sucursal
export const showMesa = async (req, res) => {
  try {
    const sqlQuery = `
      SELECT 
        m.id_mesa,
        m.numero_mesa,
        m.zona_fk,
        z.nombre AS nombre_zona,
        m.estado_mesa_fk,
        em.nombre AS nombre_estado,
        m.sucursal_fk,
        s.nombre AS nombre_sucursal,
        m.created_at,
        m.updated_at
      FROM mesa m
      JOIN zona z ON m.zona_fk = z.id_zona
      JOIN estado_mesa em ON m.estado_mesa_fk = em.id_estado_mesa
      JOIN sucursal s ON m.sucursal_fk = s.id_sucursal
      ORDER BY m.numero_mesa ASC
    `;
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener Mesa", details: error.message });
  }
};

// Obtener una mesa por ID
export const showMesaId = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM mesa WHERE id_mesa = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: "Mesa no encontrada" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener Mesa por ID", details: error.message });
  }
};

// Crear una nueva mesa
export const addMesa = async (req, res) => {
  try {
    const { zona_fk, estado_mesa_fk, numero_mesa, sucursal_fk } = req.body;
    if (!zona_fk || !estado_mesa_fk || !numero_mesa || !sucursal_fk ) {
      return res.status(400).json({ error: "Los campos zona, estado mesa, número de mesa, sucursal son obligatorios" });
    }

    const sqlQuery = "INSERT INTO mesa (zona_fk, estado_mesa_fk, numero_mesa, sucursal_fk) VALUES (?, ?, ?, ?)";
    const [result] = await connect.query(sqlQuery, [zona_fk, estado_mesa_fk, numero_mesa, sucursal_fk]);

    res.status(201).json({
      data: [{ id_mesa: result.insertId, zona_fk, estado_mesa_fk, numero_mesa, sucursal_fk }],
      status: 201,
      message: "Mesa creada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al crear Mesa", details: error.message });
  }
};

// Actualizar una mesa existente
export const updateMesa = async (req, res) => {
  try {
    const { zona_fk, estado_mesa_fk, numero_mesa, sucursal_fk } = req.body;
    if (!zona_fk || !estado_mesa_fk || !numero_mesa || !sucursal_fk ) {
      return res.status(400).json({ error: "Los campos zona, estado mesa, número de mesa, sucursal son obligatorios" });
    }

    const sqlQuery = "UPDATE mesa SET zona_fk = ?, estado_mesa_fk = ?, numero_mesa = ?, sucursal_fk = ?, updated_at=CURRENT_TIMESTAMP WHERE id_mesa = ?";
    const [result] = await connect.query(sqlQuery, [zona_fk, estado_mesa_fk, numero_mesa, sucursal_fk, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Mesa no encontrada para actualizar" });
    }

    res.status(200).json({
      data: [{ zona_fk, estado_mesa_fk, numero_mesa, sucursal_fk }],
      status: 200,
      updated: result.affectedRows,
      message: "Mesa actualizada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar Mesa", details: error.message });
  }
};
// Eliminar una mesa
export const deleteMesa = async (req, res) => {
  try {
    const idMesa = req.params.id;

    // Eliminar primero reservaciones asociadas
    await connect.query("DELETE FROM reservacion WHERE mesa_fk = ?", [idMesa]);

    // Ahora sí eliminar la mesa
    const [result] = await connect.query(
      "DELETE FROM mesa WHERE id_mesa = ?",
      [idMesa]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Mesa no encontrada para eliminar" });
    }

    res.status(200).json({
      status: 200,
      deleted: result.affectedRows,
      message: "Mesa eliminada con éxito junto con sus reservaciones"
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar Mesa",
      details: error.message
    });
  }
};



export const getMesasPorSucursal = async (req, res) => {
  try {
    const sucursalId = req.params.sucursalId;
    if (!sucursalId) {
      return res.status(400).json({ error: "Falta el id de la sucursal" });
    }
    const sqlQuery = "SELECT * FROM mesa WHERE sucursal_fk = ?";
    const [mesas] = await connect.query(sqlQuery, [sucursalId]);
    res.status(200).json(mesas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mesas por sucursal", details: error.message });
  }
};
