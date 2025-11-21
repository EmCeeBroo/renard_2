import { connect } from "../config/db/connect.js";

export const registerUsuario = async (correo, contrasena, estado_usuario_fk, rol_fk) => {
  let connection;
  try {
    connection = await connect.getConnection();
    await connection.beginTransaction();

    // 1. Insertar usuario
    const [resultUsuario] = await connection.query(
      `INSERT INTO usuario (correo, contrasena, estado_usuario_fk, rol_fk) 
       VALUES (?, ?, ?, ?)`,
      [correo, contrasena, estado_usuario_fk, rol_fk]
    );

    const usuarioInsertId = resultUsuario.insertId;

    // 2. Insertar perfil (después de quitar el UNIQUE de dirección)
    await connection.query(
      `INSERT INTO perfil 
        (usuario_fk, nombre, apellido, telefono, direccion, foto, tipo_documento_fk, numero_documento) 
       VALUES (?, '', '', NULL, '', NULL, 1, NULL)`,
      [usuarioInsertId]
    );

    await connection.commit();
    return { usuarioInsertId, correo };

  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};


export const loginUser = async (correo) => {
  const [rows] = await connect.query(
    `
    SELECT
      u.id_usuario,
      u.correo,
      u.rol_fk,
      u.contrasena,
      p.id_perfil,
      p.nombre,
      p.apellido,
      r.restaurante_fk
    FROM usuario u
    LEFT JOIN perfil p ON u.id_usuario = p.usuario_fk
    LEFT JOIN rol r ON u.rol_fk = r.id_rol
    WHERE u.correo = ?
    `,
    [correo]
  );
  return rows[0];
};

export default { registerUsuario, loginUser };
