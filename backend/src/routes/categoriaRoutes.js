import { Router } from 'express';
import { showCategoria, showCategoriaId, addCategoria, updateCategoria, deleteCategoria } from '../controllers/categoriaController.js';

const router = Router();
const renard = '/categoria';

router.route(renard)
  .get(showCategoria)
  .post(addCategoria);

router.route(`${renard}/:id`)
  .get(showCategoriaId)
  .put(updateCategoria)
  .delete(deleteCategoria);

export default router;
