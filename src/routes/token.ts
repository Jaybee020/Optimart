import { Router } from 'express';

import { getTokenById } from '../controllers/token';
import validate from '../middlewares/validate';
import catchAsync from '../utils/catch-async';
import tokenValidation from '../validators/token';

const tokenRouter = Router();

tokenRouter.get('/:id', validate(tokenValidation.getById), catchAsync(getTokenById));

export default tokenRouter;
