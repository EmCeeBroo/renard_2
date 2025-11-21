// Script para crear un usuario administrador de restaurante
// Este script se puede ejecutar desde la consola del navegador o integrar en el sistema

async function crearAdminRestaurante() {
  const userData = {
    correo: 'adminrestaurante@example.com',
    contraseña: 'password123', // Cambiar por una contraseña segura
    estado_usuario_fk: 1, // Activo
    rol_fk: 2 // Administrador Restaurante
  };

  try {
    const response = await fetch('http://127.0.0.1:3000/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Usuario administrador de restaurante creado exitosamente:', result);
      return result;
    } else {
      console.error('❌ Error al crear usuario:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return null;
  }
}

// Función para verificar si el usuario ya existe
async function verificarUsuarioExistente(correo) {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/usuarios');
    const usuarios = await response.json();
    
    return usuarios.some(usuario => usuario.correo === correo);
  } catch (error) {
    console.error('Error al verificar usuarios:', error);
    return false;
  }
}

// Función principal para crear el usuario admin restaurante
async function crearUsuarioAdminRestaurante() {
  const correo = prompt('Ingrese el correo para el administrador de restaurante:', 'adminrestaurante@example.com');
  const contraseña = prompt('Ingrese la contraseña:', 'password123');
  
  if (!correo || !contraseña) {
    alert('Correo y contraseña son obligatorios');
    return;
  }

  // Verificar si el usuario ya existe
  const existe = await verificarUsuarioExistente(correo);
  if (existe) {
    alert('❌ Ya existe un usuario con ese correo');
    return;
  }

  const userData = {
    correo: correo,
    contraseña: contraseña,
    estado_usuario_fk: 1, // Activo
    rol_fk: 2 // Administrador Restaurante
  };

  try {
    const response = await fetch('http://127.0.0.1:3000/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (response.ok) {
      alert('✅ Usuario administrador de restaurante creado exitosamente!\nID: ' + result.data[0].id);
      console.log('Usuario creado:', result);
    } else {
      alert('❌ Error al crear usuario: ' + (result.error || 'Error desconocido'));
      console.error('Error:', result);
    }
  } catch (error) {
    alert('❌ Error de conexión: ' + error.message);
    console.error('Error de conexión:', error);
  }
}

// Función para mostrar información de roles disponibles
function mostrarInfoRoles() {
  console.log('📋 Información de roles disponibles:');
  console.log('1 - Admin (Administrador del sistema)');
  console.log('2 - Administrador Restaurante (Admin Restaurante)');
  console.log('3 - Usuario (Usuario del sistema)');
  console.log('4 - Cliente (Usuario)');
  console.log('5 - Adminitrador McDonald (Admin específico de McDonald)');
  
  console.log('\n📋 Estados de usuario disponibles:');
  console.log('1 - Activo (Usuario Activo en el sistema)');
  console.log('2 - Bloqueado (Usuario Bloqueado en el sistema)');
}

// Ejecutar automáticamente la información de roles al cargar
mostrarInfoRoles();

// Hacer las funciones disponibles globalmente para ejecutar desde la consola
window.crearAdminRestaurante = crearAdminRestaurante;
window.crearUsuarioAdminRestaurante = crearUsuarioAdminRestaurante;
window.mostrarInfoRoles = mostrarInfoRoles;

console.log('🚀 Script cargado. Use:');
console.log('- crearAdminRestaurante() para crear usuario con valores por defecto');
console.log('- crearUsuarioAdminRestaurante() para crear usuario con valores personalizados');
console.log('- mostrarInfoRoles() para ver información de roles disponibles');
