import { Router } from "express";
import {
  showPerfil,
  showPerfilId,
  addPerfil,
  updatePerfil,
  updateFoto,
  deletePerfil,
  getTiposDocumento,
  upload,
} from "../controllers/perfilController.js";

const router = Router();
const renard = "/perfil";

router
  .route(renard)
  .get(showPerfil) // Obtener todos los perfiles
  .post(addPerfil); // Agregar un nuevo perfil

router
  .route(`${renard}/:id`)
  .get(showPerfilId) // Obtener perfil por ID
  .put(updatePerfil) // Actualizar perfil por ID
  .delete(deletePerfil); // Eliminar perfil por ID

router.put(`${renard}/:id/foto`, upload.single("foto"), updateFoto); // Actualizar foto de perfil

router.get("/tipos-documento", getTiposDocumento); // Obtener tipos de documento

export default router;
