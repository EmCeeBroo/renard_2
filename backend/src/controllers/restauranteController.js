import { connect } from '../config/db/connect.js';
import fetch from 'node-fetch';  // Add node-fetch for server-side HTTP requests



export const showRestaurante = async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM restaurante";
    const [result] = await connect.query(sqlQuery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar restaurantes", details: error.message });
  }
};

// New geocode proxy controller
export const geocodeAddress = async (req, res) => {
  try {
    const address = req.query.address;
    if (!address) {
      return res.status(400).json({ error: "Falta el parámetro 'address'" });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "MiAppRestaurantes/1.0 (afgonzalez925@soy.sena.edu.co)"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Error en Nominatim: ${response.statusText}` });
    }

    const data = await response.json();

    if (data.length === 0) {
      return res.status(404).json({ error: "No se encontraron coordenadas para la dirección proporcionada" });
    }

    // Return only the first result's lat and lon
    const result = {
      lat: data[0].lat,
      lon: data[0].lon
    };

    res.status(200).json(result);

  } catch (error) {
    console.error("Error en geocodeAddress:", error);
    res.status(500).json({ error: "Error interno del servidor en geocodeAddress", details: error.message });
  }
};

export const showRestauranteId = async (req, res) => {
  try {
    const restauranteId = req.params.id;

    // Consultar restaurante
    const [restauranteResult] = await connect.query(
      "SELECT * FROM restaurante WHERE id_restaurante = ?",
      [restauranteId]
    );

    if (restauranteResult.length === 0) {
      return res.status(404).json({ error: "Restaurante no encontrado" });
    }

    const restaurante = restauranteResult[0];

    //Consultar sucursales de ese restaurante
    const [sucursales] = await connect.query(
      "SELECT * FROM sucursal WHERE restaurante_fk = ?",
      [restauranteId]
    );

    // Adjuntar sucursales al objeto restaurante
    restaurante.sucursales = sucursales;

    // Devolver respuesta
    res.status(200).json(restaurante);

  } catch (error) {
    console.error("❌ Error en showRestauranteId:", error);
    res.status(500).json({
      error: "Error al buscar restaurante",
      details: error.message,
    });
  }
};


export const addRestaurante = async (req, res) => {
  try {
    const { nombre, eslogan, url_menu, descripcion } = req.body;

    console.log("📝 Creando nuevo restaurante");
    console.log("📋 Body recibido:", req.body);
    console.log("📎 File recibido:", req.file ? req.file.filename : "Sin imagen");

    // Validaciones de entrada
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({
        error: "El campo 'nombre' es obligatorio y no puede estar vacío"
      });
    }

    if (!url_menu || url_menu.trim() === "") {
      return res.status(400).json({
        error: "El campo 'url_menu' es obligatorio y no puede estar vacío"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "La imagen del restaurante es obligatoria"
      });
    }

    // Preparar datos finales
    const nombreFinal = nombre.trim();
    const urlMenuFinal = url_menu.trim();
    const descripcionFinal = descripcion && descripcion.trim() !== "" ? descripcion.trim() : "";
    const esloganFinal = eslogan && eslogan.trim() !== "" ? eslogan.trim() : "";
    const url_imagen = req.file.filename;

    // Verificar que no exista un restaurante con el mismo nombre
    const [existingRestaurante] = await connect.query(
      "SELECT id_restaurante FROM restaurante WHERE nombre = ?",
      [nombreFinal]
    );

    if (existingRestaurante.length > 0) {
      return res.status(409).json({
        error: "Ya existe un restaurante con ese nombre"
      });
    }

    const sqlQuery = `
      INSERT INTO restaurante (nombre, eslogan, url_menu, url_imagen, descripcion)
      VALUES (?, ?, ?, ?, ?)`;

    const params = [nombreFinal, esloganFinal, urlMenuFinal, url_imagen, descripcionFinal];

    console.log("🔍 SQL que se ejecutará:", sqlQuery);
    console.log("📊 Parámetros:", params);

    const [result] = await connect.query(sqlQuery, params);

    console.log("✅ Resultado de MySQL:", result);

    // Obtener datos del restaurante creado
    const [newRestaurante] = await connect.query(
      "SELECT * FROM restaurante WHERE id_restaurante = ?",
      [result.insertId]
    );

    res.status(201).json({
      data: newRestaurante[0],
      status: 201,
      message: "Restaurante creado con éxito"
    });

  } catch (error) {
    console.error("❌ Error en addRestaurante:", error);

    // Manejo específico de errores de MySQL
    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({
        error: "Los datos proporcionados son demasiado largos para algunos campos",
        details: "Verifique la longitud de la descripción u otros campos de texto"
      });
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: "Ya existe un restaurante con esos datos únicos"
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al crear restaurante",
      details: error.message
    });
  }
};


export const updateRestaurante = async (req, res) => {
  try {
    const { nombre, url_menu, descripcion, eslogan } = req.body;
    const restauranteId = req.params.id;

    console.log("🔄 Actualizando restaurante ID:", restauranteId);
    console.log("📝 Body recibido:", req.body);
    console.log("📎 File recibido:", req.file ? req.file.filename : "Sin imagen");

    // Validaciones de entrada
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({
        error: "El campo 'nombre' es obligatorio y no puede estar vacío"
      });
    }

    if (!url_menu || url_menu.trim() === "") {
      return res.status(400).json({
        error: "El campo 'url_menu' es obligatorio y no puede estar vacío"
      });
    }

    if (!restauranteId || Number.isNaN(restauranteId)) {
      return res.status(400).json({
        error: "ID de restaurante inválido"
      });
    }

    // Verificar que el restaurante existe antes de actualizar
    const [existingRestaurante] = await connect.query(
      "SELECT id_restaurante FROM restaurante WHERE id_restaurante = ?",
      [restauranteId]
    );

    if (existingRestaurante.length === 0) {
      return res.status(404).json({
        error: "Restaurante no encontrado"
      });
    }

    // Procesar imagen si se proporciona
    let url_imagen = null;
    if (req.file) {
      url_imagen = req.file.filename;
      console.log("🖼️ Nueva imagen:", url_imagen);
    }

    // Preparar datos finales
    const descripcionFinal = descripcion && descripcion.trim() !== "" ? descripcion.trim() : "";
    const esloganFinal = eslogan && eslogan.trim() !== "" ? eslogan.trim() : "";
    const nombreFinal = nombre.trim();
    const urlMenuFinal = url_menu.trim();

    // Construir consulta SQL dinámicamente
    let sqlQuery;
    let params;

    if (url_imagen) {
      // Con imagen nueva
      sqlQuery = `
        UPDATE restaurante
        SET nombre = ?, url_menu = ?, descripcion = ?, url_imagen = ?, eslogan = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id_restaurante = ?`;
      params = [nombreFinal, urlMenuFinal, descripcionFinal, url_imagen, esloganFinal, restauranteId];
    } else {
      // Sin imagen nueva (mantener la existente)
      sqlQuery = `
        UPDATE restaurante
        SET nombre = ?, url_menu = ?, descripcion = ?, eslogan = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id_restaurante = ?`;
      params = [nombreFinal, urlMenuFinal, descripcionFinal, esloganFinal, restauranteId];
    }

    console.log("🔍 SQL que se ejecutará:", sqlQuery);
    console.log("📊 Parámetros:", params);

    // Ejecutar actualización
    const [result] = await connect.query(sqlQuery, params);

    console.log("✅ Resultado de MySQL:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "No se pudo actualizar el restaurante"
      });
    }

    // Obtener datos actualizados para respuesta
    const [updatedRestaurante] = await connect.query(
      "SELECT id_restaurante, nombre, url_menu, descripcion, url_imagen, eslogan, updated_at FROM restaurante WHERE id_restaurante = ?",
      [restauranteId]
    );

    res.status(200).json({
      data: updatedRestaurante[0],
      status: 200,
      updated: result.affectedRows,
      message: "Restaurante actualizado correctamente",
    });

  } catch (error) {
    console.error("❌ Error en updateRestaurante:", error);

    // Manejo específico de errores de MySQL
    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({
        error: "Los datos proporcionados son demasiado largos para algunos campos",
        details: "Verifique la longitud de la descripción u otros campos de texto"
      });
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: "Ya existe un restaurante con esos datos únicos"
      });
    }

    res.status(500).json({
      error: "Error interno del servidor al actualizar restaurante",
      details: error.message,
    });
  }
};





export const deleteRestaurante = async (req, res) => {
  try {
    const restauranteId = req.params.id;

    console.log("🗑️ Eliminando restaurante ID:", restauranteId);

    // Validar ID
    if (!restauranteId || Number.isNaN(restauranteId)) {
      return res.status(400).json({
        error: "ID de restaurante inválido"
      });
    }

    // Verificar que el restaurante existe antes de eliminar
    const [existingRestaurante] = await connect.query(
      "SELECT id_restaurante, nombre FROM restaurante WHERE id_restaurante = ?",
      [restauranteId]
    );

    if (existingRestaurante.length === 0) {
      return res.status(404).json({
        error: "Restaurante no encontrado"
      });
    }

    const restauranteNombre = existingRestaurante[0].nombre;

    // Verificar si el restaurante tiene dependencias (sucursales, menús, etc.)
    const [sucursalesCount] = await connect.query(
      "SELECT COUNT(*) as count FROM sucursal WHERE restaurante_fk = ?",
      [restauranteId]
    );

    if (sucursalesCount[0].count > 0) {
      return res.status(409).json({
        error: "No se puede eliminar el restaurante porque tiene sucursales asociadas",
        details: `El restaurante "${restauranteNombre}" tiene ${sucursalesCount[0].count} sucursal(es)`
      });
    }

    // Verificar menús asociados
    const [menusCount] = await connect.query(
      "SELECT COUNT(*) as count FROM menu WHERE restaurante_fk = ?",
      [restauranteId]
    );

    if (menusCount[0].count > 0) {
      return res.status(409).json({
        error: "No se puede eliminar el restaurante porque tiene menús asociados",
        details: `El restaurante "${restauranteNombre}" tiene ${menusCount[0].count} menú(s)`
      });
    }

    // Proceder con la eliminación
    const sqlQuery = "DELETE FROM restaurante WHERE id_restaurante = ?";
    const [result] = await connect.query(sqlQuery, [restauranteId]);

    console.log("✅ Restaurante eliminado:", result);

    res.status(200).json({
      data: {
        id: restauranteId,
        nombre: restauranteNombre
      },
      status: 200,
      deleted: result.affectedRows,
      message: "Restaurante eliminado con éxito"
    });

  } catch (error) {
    console.error("❌ Error en deleteRestaurante:", error);
    res.status(500).json({
      error: "Error interno del servidor al eliminar restaurante",
      details: error.message
    });
  }
};

export const showRestauranteByRol = async (req, res) => {
  try {
    const { rolId } = req.params;

    // Obtener el restaurante_fk del rol
    const [rolResult] = await connect.query(
      "SELECT restaurante_fk FROM rol WHERE id_rol = ?",
      [rolId]
    );

    if (rolResult.length === 0) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    const restauranteFk = rolResult[0].restaurante_fk;

    if (!restauranteFk) {
      return res.status(404).json({ error: "El rol no tiene un restaurante asignado" });
    }

    // Obtener el restaurante
    const [restauranteResult] = await connect.query(
      "SELECT * FROM restaurante WHERE id_restaurante = ?",
      [restauranteFk]
    );

    if (restauranteResult.length === 0) {
      return res.status(404).json({ error: "Restaurante no encontrado" });
    }

    res.status(200).json(restauranteResult[0]);
  } catch (error) {
    console.error("❌ Error en showRestauranteByRol:", error);
    res.status(500).json({
      error: "Error al buscar restaurante por rol",
      details: error.message,
    });
  }
};
