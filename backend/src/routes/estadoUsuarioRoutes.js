import {Router } from 'express';
import { showEstadoUsuario, showEstadoUsuarioId, addEstadoUsuario, updateEstadoUsuario, deleteEstadoUsuario } from '../controllers/estadoUsuarioController.js';

const router = Router();
const renard ='/estado-usuario'

router.route(renard)
.get(showEstadoUsuario)  
.post(addEstadoUsuario); 

router.route(`${renard}/:id`)
.get(showEstadoUsuarioId)  
.put(updateEstadoUsuario)  
.delete(deleteEstadoUsuario); 

export default router;