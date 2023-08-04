import { Router } from 'express';

import { TokenController } from '../controllers';
import { validate } from '../middlewares';
import { catchAsync } from '../utils';
import tokenValidation from '../validators/token';

const tokenRouter = Router();

tokenRouter.get('/:id', validate(tokenValidation.getById), catchAsync(TokenController.getTokenById));

export default tokenRouter;
