import { Router } from "express";
import {
  showHistorialReservacion,
  showHistorialReservacionId,
  showHistorialReservacionUsuario,
} from "../controllers/historialReservacionController.js";

const router = Router();
const renard = "/historial-reservacion";

router.route(`${renard}/usuario`).get((req, res, next) => {
  next();
}, showHistorialReservacionUsuario);

router.route(`${renard}/:id`).get(showHistorialReservacionId);

router.route(renard).get(showHistorialReservacion);

export default router;
