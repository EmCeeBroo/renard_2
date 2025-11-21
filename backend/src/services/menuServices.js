import { connect } from '../config/db/connect.js';

// Obtener todos los menús
export const getMenus = async () => {
  const sqlQuery = "SELECT * FROM menu";
  const [result] = await connect.query(sqlQuery);
  return result; // Devuelve los datos al controlador
};

// Obtener un menú por ID
export const getMenuId = async (id) => {
  const sqlQuery = "SELECT * FROM menu WHERE id_menu = ?";
  const [result] = await connect.query(sqlQuery, [id]);
  if (result.length === 0) throw new Error("Menú no encontrado");
  return result[0];
};

// Crear un nuevo menú
export const createMenu = async (data) => {
  const { nombre, descripcion, categoria_menu_fk, restaurante_fk } = data;
  const sqlQuery = "INSERT INTO menu (nombre, descripcion, categoria_menu_fk, restaurante_fk) VALUES (?, ?, ?, ?)";
  const [result] = await connect.query(sqlQuery, [nombre, descripcion, categoria_menu_fk, restaurante_fk]);
  return { id: result.insertId, ...data };
};

// Actualizar un menú
export const updateMenu = async (id, data) => {
  const { nombre, descripcion, categoria_menu_fk, restaurante_fk } = data;
  const sqlQuery = "UPDATE menu SET nombre = ?, descripcion = ?, categoria_menu_fk = ?, restaurante_fk = ? WHERE id_menu = ?";
  const [result] = await connect.query(sqlQuery, [nombre, descripcion, categoria_menu_fk, restaurante_fk, id]);
  if (result.affectedRows === 0) throw new Error("Menú no encontrado para actualizar");
  return { id, ...data };
};

// Eliminar un menú
export const deleteMenu = async (id) => {
  const sqlQuery = "DELETE FROM menu WHERE id_menu = ?";
  const [result] = await connect.query(sqlQuery, [id]);
  if (result.affectedRows === 0) throw new Error("Menú no encontrado para eliminar");
  return { id };
};
