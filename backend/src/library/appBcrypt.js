// src/library/appBcrypt.js
import bcrypt from 'bcrypt';

const saltRounds = 10;

export const encryptContraseña = async (contrasena) => {
  try {
    const hashedContraseña = await bcrypt.hash(contrasena, saltRounds);
    return hashedContraseña;
  } catch (error) {
    console.error('Error en la encriptacion:', error);
    throw error;
  }
};

export const compareContraseña = async (contrasena, hashedContraseña) => {
  try {
    const match = await bcrypt.compare(contrasena, hashedContraseña);
    return match;
  } catch (error) {
    console.error('Error al comparar contraseña:', error);
    throw error;
  }
};




export default { encryptContraseña, compareContraseña };
