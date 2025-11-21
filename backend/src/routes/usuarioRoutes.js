import { Router } from 'express';
import { showUsuario, showUsuarioId, addUsuario, updateUsuario, deleteUsuario } from '../controllers/usuarioController.js';

const router = Router();
const renard = '/usuario';


router.route(renard)
  .get(showUsuario) 
  .post(addUsuario); 

router.route(`${renard}/:id`)
  .get(showUsuarioId)  
  .put(updateUsuario)  
  .delete(deleteUsuario); 

export default router;