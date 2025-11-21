
import { connect } from '../config/db/connect.js';
import path from 'path';
import fs from 'fs';

export const getProductos = async (req, res) => {
  const sql = 'SELECT * FROM producto';
  try {
    const [results] = await connect.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const getProductosPorRestaurante = async (req, res) => {
  const sql = `
    SELECT 
      p.id_producto,
      p.nombre AS nombre,
      p.descripcion,
      p.precio,
      p.imagenproducto,
      c.id_categoria,
      c.nombre AS nombre_categoria,
      m.id_menu,
      m.nombre AS nombre_menu,
      m.restaurante_fk
    FROM producto p
    JOIN menu m ON p.menu_fk = m.id_menu
    JOIN categoria c ON p.categoria_fk = c.id_categoria
    WHERE m.restaurante_fk = ?;
    `;
  try {
    // Usar un id_restaurante fijo o parámetro para pruebas
    const id_restaurante = req.query.restaurante_fk || 1;
    if (!id_restaurante) {
      console.error('id_restaurante no proporcionado');
      return res.status(400).json({ error: 'id_restaurante no proporcionado' });
    }
    const [results] = await connect.query(sql, [id_restaurante]);
    res.json(results);
  } catch (err) {
    console.error('Error en getProductosPorRestaurante:', err);
    res.status(500).json({ error: 'Error al obtener productos por restaurante' });
  }
};

// Obtener un producto por ID
export const getProductoById = async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM producto WHERE id_producto = ?';
  try {
    const [results] = await connect.query(sql, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Crear producto con manejo de imagen
export const createProducto = async (req, res) => {
  const { nombre, precio, descripcion, categoria_fk, menu_fk } = req.body;
  let imagenproducto = null;

  if (req.file) {
    imagenproducto = req.file.filename;
  }

  const sql = `
    INSERT INTO producto (nombre, precio, descripcion, imagenproducto, categoria_fk, menu_fk, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  try {
    const [result] = await connect.query(sql, [nombre, precio, descripcion, imagenproducto, categoria_fk, menu_fk]);
    res.status(201).json({ message: 'Producto creado', id_producto: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};


// Actualizar producto con manejo de imagen
export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, descripcion, categoria_fk, menu_fk } = req.body;
  let imagenproducto = null;

  // Primero obtener el producto actual para borrar la imagen anterior si se actualiza
  const sqlSelect = 'SELECT imagenproducto FROM producto WHERE id_producto = ?';
  try {
    const [results] = await connect.query(sqlSelect, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoActual = results[0];

    if (req.file) {
      imagenproducto = req.file.filename;

      // Borrar imagen anterior si existe
      const uploadPath = path.join(path.resolve(), 'src', 'app', 'assets', 'img', 'producto');
      if (productoActual.imagenproducto) {
        const oldImagePath = path.join(uploadPath, productoActual.imagenproducto);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else {
      imagenproducto = productoActual.imagenproducto;
    }

    const sqlUpdate = `
      UPDATE producto
      SET nombre = ?, precio = ?, descripcion = ?, imagenproducto = ?, categoria_fk = ?, menu_fk = ?, updated_at = NOW()
      WHERE id_producto = ?
    `;
    try {
      await connect.query(sqlUpdate, [nombre, precio, descripcion, imagenproducto, categoria_fk, menu_fk, id]);
      res.json({ message: 'Producto actualizado' });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  } catch (err) {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
};

// Eliminar producto
export const deleteProducto = async (req, res) => {
  const { id } = req.params;

  // Primero obtener el producto para borrar la imagen
  const sqlSelect = 'SELECT imagenproducto FROM producto WHERE id_producto = ?';
  try {
    const [results] = await connect.query(sqlSelect, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = results[0];
    const uploadPath = path.join(path.resolve(), 'src', 'app', 'assets', 'img', 'producto');

    // Borrar imagen si existe
    if (producto.imagenproducto) {
      const imagePath = path.join(uploadPath, producto.imagenproducto);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const sqlDelete = 'DELETE FROM producto WHERE id_producto = ?';
    try {
      await connect.query(sqlDelete, [id]);
      res.json({ message: 'Producto eliminado' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  } catch (err) {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
};
