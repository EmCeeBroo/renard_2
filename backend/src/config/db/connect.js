import dotenv from 'dotenv';
import { createPool } from "mysql2/promise";

dotenv.config();

export const connect = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  
  // ✅ CONFIGURACIONES VÁLIDAS para mysql2/promise
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 30000,
});

/**
 * Función para probar la conexión a la base de datos
 * @returns {Promise<boolean>} true si la conexión es exitosa
 */
export async function testConnection() {
  let conn;
  try {
    conn = await connect.getConnection();
    console.log('✅ Connected to database successfully');
    
    // Test query para obtener la versión de la base de datos
    const [result] = await conn.query('SELECT VERSION() as version');
    console.log(`ℹ️  Database Version: ${result[0].version}`);
    
    // Consulta adicional para verificar configuración del servidor
    /*const [serverInfo] = await conn.query('SHOW VARIABLES LIKE "version%"');
    console.log('📊 Server configuration:');
    serverInfo.forEach(item => {
      console.log(`   ${item.Variable_name}: ${item.Value}`);
    });*/
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Proporcionar información útil de debugging
    switch (error.code) {
      case 'ER_ACCESS_DENIED_ERROR':
        console.log('🔑 Check username and password in database configuration');
        console.log(`   User: ${process.env.DB_USER}`);
        break;
      
      case 'ER_BAD_DB_ERROR':
        console.log(`🗄️  Check if database "${process.env.DB_NAME}" exists`);
        console.log('   Run: CREATE DATABASE IF NOT EXISTS ' + process.env.DB_NAME + ';');
        break;
      
      case 'ECONNREFUSED':
        console.log(`🔌 Check if database server is running on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        console.log('   Run: sudo systemctl status mariadb (or mysql)');
        console.log('   Or:  sudo systemctl start mariadb');
        break;
      
      case 'PROTOCOL_CONNECTION_LOST':
        console.log('⚠️  The connection was unexpectedly closed.');
        console.log('   Verify your MariaDB server configuration.');
        break;
      
      case 'ETIMEDOUT':
        console.log('⏱️  Connection timeout. Check firewall or network settings.');
        break;
      
      default:
        console.log('🔧 Check database server status and credentials');
        console.log('   Error code:', error.code);
    }
    
    return false;
  } finally {
    if (conn) conn.release();
  }
}

// Test de conexión al iniciar
testConnection().then(success => {
  if (success) {
    console.log('🚀 Database ready for connections');
  } else {
    console.warn('⚠️  Database connection test failed - check configuration');
  }
});