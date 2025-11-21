import { connect } from '../config/db/connect.js';

export const showMenu = async (req, res) => {
  try {
    const restauranteFk = req.query.restaurante_fk;
    let query = `
      SELECT m.*, r.nombre AS restaurante_nombre
      FROM menu m
      LEFT JOIN restaurante r ON m.restaurante_fk = r.id_restaurante
    `;
    let params = [];
    if (restauranteFk) {
      query += " WHERE m.restaurante_fk = ?";
      params.push(restauranteFk);
    }
    query += " ORDER BY m.updated_at DESC";
    const [result] = await connect.query(query, params);
    
    // Mapear para incluir el objeto restaurante con nombre
    const menus = result.map(row => ({
      id_menu: row.id_menu,
      nombre: row.nombre,
      descripcion: row.descripcion,
      restaurante_fk: row.restaurante_fk,
      created_at: row.created_at,
      updated_at: row.updated_at,
      restaurante: {
        nombre: row.restaurante_nombre
      }
    }));
    
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener menús", details: error.message });
  }
};

// Función optimizada para traer menús por restaurante (basada en showCategoriaByRestaurante)
export const showMenuByRestaurante = async (req, res) => {
  try {
    const restauranteFk = req.query.restaurante_fk;
    if (!restauranteFk) {
      return res.status(400).json({ error: "El parámetro restaurante_fk es obligatorio" });
    }
    
    const query = `
      SELECT m.*, r.nombre AS restaurante_nombre
      FROM menu m
      LEFT JOIN restaurante r ON m.restaurante_fk = r.id_restaurante
      WHERE m.restaurante_fk = ?
      ORDER BY m.updated_at DESC
    `;
    const [result] = await connect.query(query, [restauranteFk]);
    
    const menus = result.map(row => ({
      id_menu: row.id_menu,
      nombre: row.nombre,
      descripcion: row.descripcion,
      restaurante_fk: row.restaurante_fk,
      created_at: row.created_at,
      updated_at: row.updated_at,
      restaurante: {
        nombre: row.restaurante_nombre
      }
    }));
    
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener menús por restaurante", details: error.message });
  }
};

// Obtener un menú por ID (optimizada para incluir información del restaurante)
export const showMenuId = async (req, res) => {
  try {
    const query = `
      SELECT m.*, r.nombre AS restaurante_nombre
      FROM menu m
      LEFT JOIN restaurante r ON m.restaurante_fk = r.id_restaurante
      WHERE m.id_menu = ?
    `;
    const [result] = await connect.query(query, [req.params.id]);
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Menú no encontrado" });
    }
    
    const menu = {
      id_menu: result[0].id_menu,
      nombre: result[0].nombre,
      descripcion: result[0].descripcion,
      restaurante_fk: result[0].restaurante_fk,
      created_at: result[0].created_at,
      updated_at: result[0].updated_at,
      restaurante: {
        nombre: result[0].restaurante_nombre
      }
    };
    
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener menú por ID", details: error.message });
  }
};

// Crear un nuevo menú
export const addMenu = async (req, res) => {
  try {
    const { nombre, descripcion, restaurante_fk } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: "El campo nombre es obligatorio" });
    }
    
    if (!restaurante_fk) {
      return res.status(400).json({ error: "El campo restaurante es obligatorio" });
    }

    // Verificar que el restaurante existe
    const [restauranteExists] = await connect.query(
      "SELECT id_restaurante FROM restaurante WHERE id_restaurante = ?",
      [restaurante_fk]
    );
    
    if (restauranteExists.length === 0) {
      return res.status(400).json({ error: "El restaurante seleccionado no existe" });
    }

    const sqlQuery = "INSERT INTO menu (nombre, descripcion, restaurante_fk) VALUES (?, ?, ?)";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion, restaurante_fk]);

    res.status(201).json({
      message: "Menú creado correctamente",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: "Error al crear menú", details: error.message });
  }
};

// Actualizar un menú existente
export const updateMenu = async (req, res) => {
  try {
    const { nombre, descripcion, restaurante_fk } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: "El campo nombre es obligatorio" });
    }
    
    if (!restaurante_fk) {
      return res.status(400).json({ error: "El campo restaurante es obligatorio" });
    }

    // Verificar que el restaurante existe
    const [restauranteExists] = await connect.query(
      "SELECT id_restaurante FROM restaurante WHERE id_restaurante = ?",
      [restaurante_fk]
    );
    
    if (restauranteExists.length === 0) {
      return res.status(400).json({ error: "El restaurante seleccionado no existe" });
    }

    const sqlQuery = "UPDATE menu SET nombre = ?, descripcion = ?, restaurante_fk = ?, updated_at = CURRENT_TIMESTAMP WHERE id_menu = ?";
    const [result] = await connect.query(sqlQuery, [nombre, descripcion, restaurante_fk, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menú no encontrado" });
    }

    res.status(200).json({ message: "Menú actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar menú", details: error.message });
  }
};

/* Eliminar un menú
export const deleteMenu = async (req, res) => {
  try {
    // Verificar si el menú tiene platos asociados antes de eliminar
    const [platosAsociados] = await connect.query(
      "SELECT COUNT(*) as total FROM plato WHERE menu_fk = ?",
      [req.params.id]
    );

    if (platosAsociados[0].total > 0) {
      return res.status(400).json({
        error: "No se puede eliminar el menú porque tiene platos asociados"
      });
    }

    const sqlQuery = "DELETE FROM menu WHERE id_menu = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menú no encontrado" });
    }

    res.status(200).json({ message: "Menú eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar menú", details: error.message });
  }
};*/

// Eliminar un menú
export const deleteMenu = async (req, res) => {
  try {
    const [result] = await connect.query(
      "DELETE FROM menu WHERE id_menu = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menú no encontrado" });
    }

    res.status(200).json({ message: "Menú eliminado correctamente (en cascada si aplica)" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar menú", details: error.message });
  }
};
