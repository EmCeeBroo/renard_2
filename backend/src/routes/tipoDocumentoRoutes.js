import {Router} from 'express';
import { showTipoDocumento, showTipoDocumentoId, addTipoDocumento, updateTipoDocumento, deleteTipoDocumento, } from '../controllers/tipoDocumentoController.js';

const router = Router();
const renard='/tipo-documento';

router.route(renard)
.get(showTipoDocumento)  
.post(addTipoDocumento); 

router.route(`${renard}/:id`)
.get(showTipoDocumentoId)  
.put(updateTipoDocumento)  
.delete(deleteTipoDocumento); 

export default router;
