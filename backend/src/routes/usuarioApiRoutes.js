import { Router } from 'express';
import { showUsuarioApi, showUsuarioApiId, addUsuarioApi, updateUsuarioApi, deleteUsuarioApi, loginUsuarioApi } from '../controllers/usuarioApiController.js';

const router = Router();
const renard = '/usuarioApi';

router.route(renard)
  .get(showUsuarioApi)  
  .post(addUsuarioApi); 

router.route('/usuarioApiLogin')
  .post(loginUsuarioApi); 

router.route(`${renard}/:id`)
  .get(showUsuarioApiId)  
  .put(updateUsuarioApi)  
  .delete(deleteUsuarioApi); 

export default router;