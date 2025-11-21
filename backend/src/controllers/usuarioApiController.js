import { connect } from '../config/db/connect.js';
import { encryptContraseña, compareContraseña } from '../library/appBcrypt.js';
import jwt from "jsonwebtoken";

export const showUsuarioApi = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM usuarios_api";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar usuario de la API", details: error.message });
  }
};

export const showUsuarioApiId = async (req, res) => {
  try {
    const [result] = await connect.query('SELECT * FROM usuarios_api WHERE usuario_api_id= ?', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ error: "Usuario API no encontrado" });
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar usuario API", details: error.message });
  }
};

export const addUsuarioApi = async (req, res) => {
  try {
    const { usuario_api, contraseña_api, rol_api, estado_api } = req.body;
    if (!usuario_api || !contraseña_api || !rol_api || !estado_api) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    const hash = await encryptContraseña(contraseña_api);

    let sqlQuery = "INSERT INTO usuarios_api(usuario_api,contraseña_api,rol_api,estado_api) VALUES (?,?,?,?)";
    const [result] = await connect.query(sqlQuery, [usuario_api, hash, rol_api, estado_api]);
    res.status(201).json({
      data: [{ id: result.insertId, usuario_api, contraseña_api: hash, rol_api, estado_api }],
      status: 201,
      message: "Usuario Api creado con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar usuario", details: error.message });
  }
};

export const updateUsuarioApi = async (req, res) => {
  try {
    const { usuario_api, contraseña_api, rol_api, estado_api } = req.body;
    if (!usuario_api || !contraseña_api || !rol_api || !estado_api) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let sqlQuery = "UPDATE  usuarios_api SET usuario_api=?, contraseña_api=? ,rol_api=?, estado_api=?, updated_at=CURRENT_TIMESTAMP WHERE usuario_api_id= ?";
    const [result] = await connect.query(sqlQuery, [usuario_api, contraseña_api, rol_api, estado_api, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(200).json({
      data: [{ usuario_api, rol_api, estado_api }],
      status: 200,
      updated: result.affectedRows,
      message:"usuario Api actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario API", details: error.message });
  }
};

export const deleteUsuarioApi = async (req, res) => {
  try {
    let sqlQuery = "DELETE FROM usuarios_api WHERE usuario_api_id = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario API no encontrado" });
    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Usuario Api eliminada con éxito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario API", details: error.message });
  }
};

export const loginUsuarioApi = async (req, res) => {
  try {
    const { usuario_api, contraseña_api } = req.body;
    let sqlQuery = "SELECT * FROM usuarios_api WHERE usuario_api= ?";
    const [result] = await connect.query(sqlQuery, usuario_api);
    await connect.end();
    if (result.length === 0) return res.status(400).json({ error: "Usuario API no encontrado" });
    const usuario = result[0];
    const validContraseña = await compareContraseña(contraseña_api, usuario.contraseña_api);
    if (!validContraseña) return res.status(400).json({ error: "Contraseña incorrecta" });
    const token = jwt.sign({ id: usuario.usuario_api_id, rol: usuario.rol_api, estado: usuario.estado_api }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar Usuario API", details: error.message });
  }
};