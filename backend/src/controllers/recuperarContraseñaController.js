// recuperarContrasenaController.js
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { connect } from '../config/db/connect.js'; // Pool ya creado

// === Configuración del transporter ===
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===== 1. ENVIAR CORREO DE RECUPERACIÓN =====
export const enviarCorreoRecuperacion = async (req, res) => {
  console.log('🔄 enviar correo de recuperacion iniciado');
  console.log('📨 req.body:', req.body);

  try {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ success: false, error: 'El correo electrónico es requerido' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) return res.status(400).json({ success: false, error: 'Formato de correo inválido' });

    const [usuario] = await connect.query("SELECT * FROM usuario WHERE correo = ?", [correo]);
    if (usuario.length === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 3600000);

    await connect.query(
      "UPDATE usuario SET reset_token = ?, reset_expiracion = ? WHERE correo = ?",
      [token, expiracion, correo]
    );

    console.log(`🔑 Token generado: ${token.substring(0, 8)}...`);

    const mailOptions = {
      from: `"TEAM RENARD - Recuperación" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Recuperación de contraseña - RENARD 🔐',
      html: `

          <!-- lOGO RENARD -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="../public/assets/img/renard.png" alt="Logo RENARD" style="max-width: 150px;">
          </div>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6600;">TEAM RENARD</h1>
            <h2 style="color: #333;">Recuperación de contraseña</h2>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #FFDAC1; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="color: #856404; margin: 0;">
              Has solicitado recuperar tu contraseña. Si no fuiste tú, puedes ignorar este correo.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://192.18.0.9:3000/renard_oficial/frontend/login/recuperar.html?token=${token}" 
               target="_blank" rel="noopener noreferrer"
               style="background-color: #ff6600; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Restablecer contraseña
            </a>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="color: #6c757d; font-size: 14px; margin: 0;">
              Este enlace expirará en 1 hora por seguridad.
            </p>
          </div>

          <!-- Pie de página -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px; line-height: 1.4;">
          <p>Este correo fue enviado por <strong>TEAM RENARD</STRONG>.</p>
          <<p>© ${new Date().getFullYear()} RENARD. Todos los derechos reservados.</p>
          <p>Por favor no respondas a este mensaje. Si necesitas ayuda, contáctanos en <a href="mailto:apprenard@gmail.com" style="color: #ff6600;">apprenard@gmail.com</a></p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Correo de recuperación enviado correctamente',
      email: correo
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ success: false, error: 'Error al enviar correo de recuperación' });
  }
};

// ===== 2. VALIDAR TOKEN =====
export const validarTokenRecuperacion = async (req, res) => {
  console.log('🔍 validarTokenRecuperacion iniciado');

  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Token requerido' });

    const [usuario] = await connect.query(
      "SELECT correo, reset_expiracion FROM usuario WHERE reset_token = ?", [token]
    );

    if (usuario.length === 0) return res.status(400).json({ success: false, error: 'Token inválido' });
    if (new Date(usuario[0].reset_expiracion) < new Date()) {
      return res.status(400).json({ success: false, error: 'Token expirado' });
    }

    console.log('✅ Token válido');
    return res.status(200).json({
      success: true,
      message: 'Token válido',
      correo: usuario[0].correo
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ success: false, error: 'Error del servidor' });
  }
};

// ===== 3. RESTABLECER CONTRASEÑA =====
export const restablecerContrasena = async (req, res) => {
  console.log('🔄 restablecerContrasena iniciado');

  try {
    const { token, nuevaContrasena, confirmarContrasena } = req.body;

    if (!token || !nuevaContrasena || !confirmarContrasena) {
      return res.status(400).json({ success: false, error: 'Token y contraseñas son requeridos' });
    }
    if (nuevaContrasena !== confirmarContrasena) {
      return res.status(400).json({ success: false, error: 'Las contraseñas no coinciden' });
    }

    const [usuario] = await connect.query(
      "SELECT correo, reset_expiracion FROM usuario WHERE reset_token = ?", [token]
    );

    if (usuario.length === 0 || new Date(usuario[0].reset_expiracion) < new Date()) {
      return res.status(400).json({ success: false, error: 'Token inválido o expirado' });
    }

    const validacion = validarContrasenaSegura(nuevaContrasena);
    if (!validacion.esValida) {
      return res.status(400).json({ success: false, error: 'La contraseña no cumple los requisitos', errores: validacion.errores });
    }

    const contrasenaHasheada = await bcrypt.hash(nuevaContrasena, 10);

    await connect.query(
      "UPDATE usuario SET contrasena = ?, reset_token = NULL, reset_expiracion = NULL WHERE reset_token = ?",
      [contrasenaHasheada, token]
    );

    console.log(`✅ Contraseña actualizada para: ${usuario[0].correo}`);

    return res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente', correo: usuario[0].correo });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ success: false, error: 'Error del servidor' });
  }
};

// ===== FUNCIÓN DE VALIDACIÓN =====
const validarContrasenaSegura = (contrasena) => {
  const errores = [];
  if (contrasena.length < 8) errores.push('Debe tener al menos 8 caracteres');
  if (!/[A-Z]/.test(contrasena)) errores.push('Debe incluir al menos una letra mayúscula');
  if (!/[a-z]/.test(contrasena)) errores.push('Debe incluir al menos una letra minúscula');
  if (!/\d/.test(contrasena)) errores.push('Debe incluir al menos un número');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(contrasena)) errores.push('Debe incluir al menos un carácter especial');

  return { esValida: errores.length === 0, errores };
};
