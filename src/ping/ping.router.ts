import { Router } from 'express';

import PingController from './ping.controller';

const pingRouter = Router();

pingRouter.get('/ping', PingController.get);

export default pingRouter;
