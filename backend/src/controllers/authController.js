// src/controllers/authController.js

import jwt from 'jsonwebtoken';
import { encryptContraseña, compareContraseña } from '../library/appBcrypt.js';
import nodemailer from 'nodemailer';
import modeloUsuario from '../models/modeloUsuario.js'; // <-- Importar el modelo

// Debugging: verificar que las variables se carguen
//console.log('EMAIL_USER cargado:', process.env.EMAIL_USER ? 'SÍ' : 'NO');
//console.log('EMAIL_PASS cargado:', process.env.EMAIL_PASS ? 'SÍ (oculto)' : 'NO');

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para port 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ===== FUNCIÓN PARA ENVIAR CORREO DE BIENVENIDA =====
export const enviarCorreoBienvenida = async (correoDestino) => {
  try {
    // Verificar que tenemos las credenciales antes de intentar enviar
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Variables de entorno EMAIL_USER o EMAIL_PASS no configuradas');
    }    
    const mailOptions = {
      from: `"TEAM RENARD " <${process.env.EMAIL_USER}>`,
      to: correoDestino,
      subject: '¡Bienvenido a RENARD! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <!-- lOGO RENARD -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="http://192.168.0.9:3000/public/assets/img/renard.png" alt="Logo RENARD" style="max-width: 150px;">
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6600; margin: 0;">¡Bienvenido a RENARD!</h1>
            <p style="color: #333;">Plataforma segura y confiable para tus reservas.</p>
          </div>
          
          <!-- Mensaeje de bienvenida -->
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #000000ff; margin-top: 0;">Hola,</h2>
            <p style="color: #666; line-height: 1.6;"; font-size: 15px;>
              Nos complace darte la bienvenida a <strong>RENARD.</strong>
              Tu cuenta ha sido creada exitosamente en nuestra plataforma RENARD. 
              Ya puedes empezar a disfrutar de todos nuestros servicios.
              <br><br>
              Nuestra mision es ofrecerte una experiencia segura y confiable para gestionar tus reservas.
            </p>
          </div>
          
          <!-- Botón de llamada a la acción -->
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://192.168.0.9:3000/renard_oficial/frontend/login/login.html" 
               style="background-color: #ff6600; color: white; padding: 15px; border-radius: 5px; display: inline-block;">
               Ir a mi cuenta
              <strong>¡Estamos emocionados de tenerte con nosotros! 🚀</strong>
            </a>
          </div>
          
          <!-- Pie de página -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px; line-height: 1.4;">
          <p>Este correo fue enviado por <strong>TEAM RENARD</strong>.</p>
          <p>© ${new Date().getFullYear()} RENARD. Todos los derechos reservados.</p>
          <p>Por favor no respondas a este mensaje. Si necesitas ayuda, contáctanos en <a href="mailto:apprenard@gmail.com" style="color: #ff6600;">apprenard@gmail.com</a></p>
          </div>
        </div>
      `,
      text: `¡Bienvenido a RENARD! Tu cuenta ha sido creada exitosamente. ¡Gracias por registrarte!`
    };

    const info = await transporter.sendMail(mailOptions);    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response 
    };
    
  } catch (error) {
    console.error('❌ Error detallado al enviar correo:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    
    throw new Error(`Error al enviar correo de bienvenida: ${error.message}`);
  }
};

// ===== CONTROLADOR PRINCIPAL PARA REGISTRO =====
export const registerUsuario = async (req, res) => {
  const { correo, contrasena, estado_usuario_fk, rol_fk } = req.body;

  // Validar campos obligatorios
  if (!correo || !contrasena || !estado_usuario_fk || !rol_fk) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios",
      required: ["correo", "contrasena", "estado_usuario_fk", "rol_fk"],
    });
  }

  // Validar política de contraseña
  const regexPolitica =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!regexPolitica.test(contrasena)) {
    return res.status(400).json({
      succes: false,
      message: "La contraseña no cumple con la política de seguridad",
      policy: {
        minLength: 8,
        mustInclude: ["mayúscula", "minúscula", "número", "símbolo"],
      },
    });
  }

  try {
    // Encriptar contraseña
    const hash = await encryptContraseña(contrasena);

    // 👉 El modelo se encarga de crear usuario + perfil vacío
    const { usuarioInsertId } = await registerUsuarioModel(
      correo,
      hash,
      estado_usuario_fk,
      rol_fk
    );

    // Intentar enviar correo de bienvenida
    let emailSent = false;
    try {
      await enviarCorreoBienvenida(correo);
      emailSent = true;
    } catch (emailError) {
      console.error("⚠️ Error al enviar correo:", emailError.message);
    }

    // Respuesta exitosa
    return res.status(201).json({
      success: true,
      message: "Usuario y perfil creados correctamente",
      data: {
        usuario_id: usuarioInsertId,
        correo,
        emailSent,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en registerUsuario:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: "No se pudo completar el registro del usuario",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};


export const loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Buscamos el usuario en la base de datos
    const userFound = await modeloUsuario.loginUser(correo);
    if (!userFound) {
      return res.status(401).json({ message: 'Usuario no existe.' });
    }

    // Comparamos la contraseña enviada con la almacenada (hasheada)
    const contraseñaIsValid = await compareContraseña(contrasena, userFound.contrasena);
    if (!contraseñaIsValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Generamos el token JWT con la información del usuario
    const token = jwt.sign(
      { id: userFound.id_usuario, correo: userFound.usuario },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    //Devolvemos el token al cliente + info usuario
    return res.json({
      token,
      usuario:{
        id_usuario: userFound.id_usuario,
        correo: userFound.correo,
        rol_fk: userFound.rol_fk,
        restaurante_fk: userFound.restaurante_fk,
        nombre: userFound.nombre,
        apellido: userFound.apellido,
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
