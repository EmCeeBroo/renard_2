import { connect } from '../config/db/connect.js';
import { encryptContraseña } from '../library/appBcrypt.js';

export const showUsuario = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM usuario";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar usuario", details: error.message });
  }
};

export const showUsuarioId = async (req, res) => {
  try {
    const [result] = await connect.query('SELECT * FROM usuario WHERE id_usuario = ?', [req.params.id]);
    if (result.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar usuario", details: error.message });
  }
};

export const addUsuario = async (req, res) => {
  try {
    const { correo, contraseña, estado_usuario_fk, rol_fk, reset_token, reset_expiracion } = req.body;
    if (!correo || !contraseña || !estado_usuario_fk || !rol_fk ) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    const hashedContraseña = await encryptContraseña(contraseña);
   
    let sqlQuery = "INSERT INTO usuario (correo, contrasena, estado_usuario_fk, rol_fk, reset_token, reset_expiracion) VALUES (?,?,?,?,?,?)";

    const [result] = await connect.query(sqlQuery, [correo, hashedContraseña, estado_usuario_fk, rol_fk, reset_token || null, reset_expiracion || null]);
    res.status(201).json({
      data: [{ id: result.insertId, correo, hashedContraseña, estado_usuario_fk, rol_fk, reset_token, reset_expiracion }],
      status: 201,
      message: "usuario creado con exito"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar Usuario", details: error.message });
  }


  
};

export const updateUsuario = async (req, res) => {
  try {
    const { correo, contraseña, estado_usuario_fk, rol_fk, reset_token, reset_expiracion } = req.body;
    if (!correo || !estado_usuario_fk || !rol_fk ) {
      return res.status(400).json({ error: "Los campos son obligatorios" });
    }
    let hashedContraseña = null;
    if (contraseña) {
      hashedContraseña = await encryptContraseña(contraseña);
    }
    
    let sqlQuery = "UPDATE usuario SET correo=?, contrasena=?, estado_usuario_fk=?, rol_fk=?, reset_token=?, reset_expiracion=?, updated_at=CURRENT_TIMESTAMP WHERE id_usuario=?";

    const [result] = await connect.query(sqlQuery, [correo, hashedContraseña ? hashedContraseña : contraseña, estado_usuario_fk, rol_fk, reset_token || null, reset_expiracion || null, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario no econtrado" });
    res.status(200).json({
      data: [{ correo, contraseña: hashedContraseña ? hashedContraseña : contraseña, estado_usuario_fk, rol_fk, reset_token, reset_expiracion }],
      status: 200,
      updated: result.affectedRows,
      message:"usuario actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar Usuario", details: error.message });
  }

};

export const deleteUsuario = async (req, res) => {
  try {
    let sqlQuery = "DELETE FROM usuario WHERE id_usuario=?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "usuario"
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar Usuario", details: error.message });
  }
};
