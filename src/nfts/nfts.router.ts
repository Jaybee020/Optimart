import { Router } from 'express';

import NFTController from './nfts.controller';
import tokenValidation from './nfts.validator';
import { validate } from '../middlewares';
import { catchAsync } from '../utils';

const nftRouter = Router();

nftRouter.get('/:id', validate(tokenValidation.getById), catchAsync(NFTController.getTokenById));

export default nftRouter;
