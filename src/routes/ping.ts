import { Router } from 'express';
import pingController from '../controllers/ping';

const pingRouter = Router();

pingRouter.get('/ping', pingController);

export default pingRouter;
