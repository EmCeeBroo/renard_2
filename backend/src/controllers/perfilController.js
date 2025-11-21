import { connect } from "../config/db/connect.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURACIÓN DE MULTER
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../app/assets/img/perfiles/');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `perfil-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Solo se permiten imágenes'), false);
};

export const upload = multer({
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// ============================================
// MOSTRAR TODOS LOS PERFILES
// ============================================
export const showPerfil = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM perfil";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      error: "Error al buscar perfiles", 
      details: error.message 
    });
  }
};

// ============================================
// MOSTRAR PERFIL POR ID DE USUARIO
// ============================================
export const showPerfilId = async (req, res) => {
  try {
    const [rows] = await connect.query(
      `SELECT
        u.id_usuario,
        p.id_perfil,
        COALESCE(p.nombre, '') AS nombre,
        COALESCE(p.apellido, '') AS apellido,
        COALESCE(p.telefono, '') AS telefono,
        COALESCE(p.direccion, '') AS direccion,
        p.foto,
        u.correo,
        td.nombre AS tipo_documento,
        td.descripcion AS tipo_descripcion,
        p.numero_documento,
        p.tipo_documento_fk
      FROM usuario u
      LEFT JOIN perfil p ON p.usuario_fk = u.id_usuario
      LEFT JOIN tipo_documento td ON p.tipo_documento_fk = td.id_tipo_documento
      WHERE u.id_usuario = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    //console.error("Error al buscar Perfil:", error);
    res.status(500).json({ 
      error: "Error al buscar Perfil", 
      details: error.message 
    });
  }
};

// ============================================
// CREAR PERFIL
// ============================================
export const addPerfil = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      direccion,
      tipo_documento_fk,
      numero_documento,
    } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!nombre || !apellido || !telefono || !direccion || !tipo_documento_fk || !numero_documento) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const docId = Number(tipo_documento_fk);
    if (!Number.isInteger(docId) || docId <= 0) {
      return res.status(400).json({ 
        error: "Tipo de documento inválido (debe ser un número entero)" 
      });
    }

    // Obtener el usuario_fk del parámetro de la URL
    const usuario_fk = req.params.id;

    // Verificar si ya existe un perfil para este usuario
    const [existingProfile] = await connect.query(
      "SELECT id_perfil FROM perfil WHERE usuario_fk = ?",
      [usuario_fk]
    );

    if (existingProfile.length > 0) {
      return res.status(400).json({ 
        error: "Ya existe un perfil para este usuario" 
      });
    }

    let sqlQuery = `INSERT INTO perfil 
      (nombre, apellido, telefono, direccion, usuario_fk, tipo_documento_fk, numero_documento) 
      VALUES (?,?,?,?,?,?,?)`;
    
    const [result] = await connect.query(sqlQuery, [
      nombre,
      apellido,
      telefono,
      direccion,
      usuario_fk,
      tipo_documento_fk,
      numero_documento,
    ]);

    res.status(201).json({
      data: {
        id_perfil: result.insertId,
        nombre,
        apellido,
        telefono,
        direccion,
        usuario_fk,
        tipo_documento_fk,
        numero_documento,
      },
      status: 201,
      message: "Perfil creado exitosamente"
    });
  } catch (error) {
    //console.error("Error al crear perfil:", error);
    res.status(500).json({ 
      error: "Error al agregar perfil", 
      details: error.message 
    });
  }
};

// ============================================
// ✅ ACTUALIZAR PERFIL (SOLO DATOS, SIN FOTO)
// ============================================
export const updatePerfil = async (req, res) => {
  try {
    const { id } = req.params; // Este es el id_perfil
    //console.log("📥 Actualizando perfil ID:", id);
    
    const {
      nombre,
      apellido,
      telefono,
      direccion,
      tipo_documento_fk,
      numero_documento
    } = req.body;

    //console.log("📦 Datos recibidos:", req.body);

    // Verificar que todos los campos requeridos estén presentes
    if (!nombre || !apellido || !telefono || !direccion || !tipo_documento_fk || !numero_documento) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Validar que tipo_documento_fk sea un número válido
    const docId = Number(tipo_documento_fk);
    if (!Number.isInteger(docId) || docId <= 0) {
      return res.status(400).json({ error: "Tipo de documento inválido" });
    }

    // Verificar si el perfil existe
    const [perfilExistente] = await connect.query(
      'SELECT * FROM perfil WHERE id_perfil = ?',
      [id]
    );

    if (perfilExistente.length === 0) {
      //console.log("❌ Perfil no encontrado con ID:", id);
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    // Actualizar el perfil (SIN tocar el campo foto)
    const [result] = await connect.query(
      `UPDATE perfil 
       SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, 
           tipo_documento_fk = ?, numero_documento = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id_perfil = ?`,
      [
        nombre,
        apellido,
        telefono,
        direccion,
        tipo_documento_fk,
        numero_documento,
        id
      ]
    );

    //console.log("✅ Perfil actualizado correctamente, filas afectadas:", result.affectedRows);

    res.status(200).json({
      success: true,
      message: "Perfil actualizado correctamente",
      id_perfil: parseInt(id)
    });

  } catch (error) {
    //console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({
      error: "Error al actualizar perfil",
      details: error.message
    });
  }
};

// ============================================
// ✅ ACTUALIZAR FOTO (SOLO FOTO)
// ============================================
export const updateFoto = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    //console.log('📝 Actualizando foto para usuario ID:', idUsuario);
    //console.log('📁 Archivo recibido:', req.file ? req.file.filename : 'NINGUNO');
    
    if (!req.file) {
      //console.log('❌ No se recibió archivo');
      return res.status(400).json({ error: "No se proporcionó ninguna imagen" });
    }

    // Buscar el perfil por usuario_fk
    const [currentProfile] = await connect.query(
      "SELECT id_perfil, foto FROM perfil WHERE usuario_fk = ?",
      [idUsuario]
    );

    if (currentProfile.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    const idPerfil = currentProfile[0].id_perfil;
    const oldFoto = currentProfile[0].foto;
    const newFoto = req.file.filename;

    //console.log('🔄 Reemplazando foto:', oldFoto, '→', newFoto);

    // Actualizar la foto en la base de datos
    const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await connect.query(
      "UPDATE perfil SET foto = ?, updated_at = ? WHERE id_perfil = ?",
      [newFoto, updated_at, idPerfil]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No se pudo actualizar la foto" });
    }

    // Eliminar la foto anterior si existe y no es la default
    if (oldFoto && oldFoto !== 'default-profile.png') {
      const oldFotoPath = path.join(__dirname, '../app/assets/img/perfiles/', oldFoto);
      if (fs.existsSync(oldFotoPath)) {
        fs.unlinkSync(oldFotoPath);
        //console.log('🗑️ Foto anterior eliminada:', oldFoto);
      }
    }

    console.log('✅ Foto actualizada exitosamente');

    res.status(200).json({
      success: true,
      status: 200,
      message: "Foto actualizada exitosamente",
      foto: newFoto
    });

  } catch (error) {
    //console.error("❌ Error al actualizar foto:", error);
    res.status(500).json({ 
      error: "Error al actualizar foto", 
      details: error.message 
    });
  }
};

// ============================================
// ELIMINAR PERFIL
// ============================================
export const deletePerfil = async (req, res) => {
  try {
    // Obtener la foto antes de eliminar el perfil
    const [profile] = await connect.query(
      "SELECT foto FROM perfil WHERE id_perfil = ?",
      [req.params.id]
    );

    let sqlQuery = "DELETE FROM perfil WHERE id_perfil = ?";
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    // Eliminar la foto del servidor si existe
    if (profile.length > 0 && profile[0].foto && profile[0].foto !== 'default-profile.png') {
      const fotoPath = path.join(__dirname, '../app/assets/img/perfiles/', profile[0].foto);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    res.status(200).json({
      data: [],
      status: 200,
      deleted: result.affectedRows,
      message: "Perfil eliminado exitosamente"
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al eliminar perfil", 
      details: error.message 
    });
  }
};

// ============================================
// OBTENER TIPOS DE DOCUMENTO
// ============================================
export const getTiposDocumento = async (req, res) => {
  try {
    const [result] = await connect.query(
      "SELECT id_tipo_documento, nombre, descripcion FROM tipo_documento"
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener tipos de documento", 
      details: error.message 
    });
  }
};