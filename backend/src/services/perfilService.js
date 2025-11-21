// Endpoints para el perfil de usuario (agregar a tu archivo principal del servidor)
const {multer} = require('multer'); // Cambié 'Require' por 'require'
const path = require('path');     // Cambié 'Require' por 'require'
const fs = require('fs');         // Cambié 'Require' por 'require'

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'src/app/assets/img/perfiles'); // Cambié la ruta a 'src/app/assets/img/perfiles'
        
        // Crear la carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const nombreArchivo = `perfil-${req.body.usuarioId}-${uniqueSuffix}${extension}`;
        cb(null, nombreArchivo);
    }
});

// Filtro para validar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { // Cambié 'foto/' por 'image/'
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

// Endpoint para obtener datos del usuario
app.get('/perfil/:id', (req, res) => {
    const usuarioId = req.params.id; // Cambié 'usuario_fk' por 'usuarioId'
    
    const query = `
        SELECT 
            id_perfil,
            nombre,
            apellido,
            telefono,
            direccion,
            correo,
            foto,
            usuario_fk,
            tipo_documento_fk,
            created_at,
            updated_at
        FROM perfil 
        WHERE id_perfil = ?
    `;
    
    db.query(query, [usuarioId], (err, results) => { // Cambié 'usuario_fk' por 'usuarioId'
        if (err) {
            console.error('Error al obtener usuario:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error interno del servidor' 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }
        
        res.json(results[0]);
    });
});

// Endpoint para subir foto de perfil
app.post('/perfil', upload.single('foto'), (req, res) => { // Cambié la ruta
    try {
        const usuarioId = req.body.usuarioId; // Corregí el nombre de la variable
        const nombreArchivo = req.file.filename;
        
        // Primero, obtener la foto anterior para eliminarla
        const queryObtenerFoto = 'SELECT foto FROM perfil WHERE id_perfil = ?';
        
        db.query(queryObtenerFoto, [usuarioId], (err, results) => { // Cambié 'usuario_fk' por 'usuarioId'
            if (err) {
                console.error('Error al obtener foto anterior:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error interno del servidor' 
                });
            }
            
            // Eliminar foto anterior si existe
            if (results.length > 0 && results[0].foto && results[0].foto !== 'NULL') {
                const fotoAnterior = path.join(__dirname, 'src/app/assets/img/perfiles', results[0].foto);
                if (fs.existsSync(fotoAnterior)) {
                    fs.unlinkSync(fotoAnterior);
                }
            }
            
            // Actualizar la base de datos con el nuevo nombre del archivo
            const queryUpdate = `
                UPDATE perfil 
                SET foto = ?, updated_at = NOW() 
                WHERE id_perfil = ?
            `;
            
            db.query(queryUpdate, [nombreArchivo, usuarioId], (err, result) => {
                if (err) {
                    console.error('Error al actualizar foto en BD:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al actualizar la foto en la base de datos' 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: 'Foto de perfil actualizada correctamente',
                    nombreArchivo: nombreArchivo
                });
            });
        });
        
    } catch (error) {
        console.error('Error al subir foto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al subir la imagen' 
        });
    }
});

// Endpoint para actualizar datos del perfil (opcional)
app.put('/perfil/:id', (req, res) => {
    const usuarioId = req.params.id;
    const { nombre, apellido, telefono, direccion, tipo_documento_fk } = req.body;
    
    const query = `
        UPDATE perfil
        SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, 
            tipo_documento_fk = ?, updated_at = NOW()
        WHERE id_perfil = ?
    `;
    
    db.query(query, [nombre, apellido, telefono, direccion, tipo_documento_fk, usuarioId], (err, result) => {
        if (err) {
            console.error('Error al actualizar perfil:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al actualizar el perfil' 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Perfil actualizado correctamente' 
        });
    });
});

// Middleware para servir archivos estáticos (imágenes de perfil)
app.use('/assets/img/perfiles', express.static(path.join(__dirname, 'src/app/assets/img/perfiles')));