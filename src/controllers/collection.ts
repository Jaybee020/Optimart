import { Request, Response } from 'express';
import httpStatus from 'http-status';

import CollectionService from '../services/collection';

class CollectionController {
	async getByName(req: Request, res: Response): Promise<void> {
		//name might be unique in order to specify
		try {
			const collectionName = req.params.collectionName;
			const collection = await CollectionService.getByName(collectionName);
			res.status(httpStatus.OK).send({
				message: null,
				data: collection,
			});
		} catch (err: any) {
			res.status(httpStatus.NOT_FOUND).send({
				message: err.message,
				data: null,
			});
		}
	}

	async getTokensInCollection(req: Request, res: Response): Promise<void> {
		try {
			const collectionName = req.params.collectionName;
			const limit =
				!req.query.limit || Number(req.query.limit) > 1000 ? 1000 : Number(req.query.limit);
			const offset = !req.query.offset ? 0 : Number(req.query.offset);
			const collectionWithTokens = await CollectionService.getTokensInCollection(
				collectionName,
				limit,
				offset,
			);
			res.status(httpStatus.OK).send({
				message: null,
				data: collectionWithTokens,
			});
		} catch (err: any) {
			res.status(httpStatus.NOT_FOUND).send({
				message: err.message,
				data: null,
			});
		}
	}
}

export default new CollectionController();
