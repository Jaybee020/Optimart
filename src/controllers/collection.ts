import { Request, Response } from 'express';
import httpStatus from 'http-status';

import CollectionService from '../services/collection';

class CollectionsController {
	//implement text search

	async getByCollectionId(req: Request, res: Response): Promise<void> {
		try {
			const { collectionName } = req.params;
			const collection = await CollectionService.getByCollectionId(collectionName);
			res.status(httpStatus.OK).send({
				data: collection,
			});
		} catch (err: unknown) {
			res.status(httpStatus.NOT_FOUND).json({
				error: err,
			});
		}
	}

	async getTokensInCollection(req: Request, res: Response): Promise<void> {
		try {
			const { collectioId } = req.params;
			const limit =
				!req.query.limit || Number(req.query.limit) > 1000 ? 1000 : Number(req.query.limit);
			const offset = !req.query.offset ? 0 : Number(req.query.offset);
			const collectionWithTokens = await CollectionService.getTokens(
				collectioId,
				limit,
				offset,
			);
			res.status(httpStatus.OK).json({
				data: collectionWithTokens,
			});
		} catch (err: unknown) {
			res.status(httpStatus.NOT_FOUND).json({
				error: err,
			});
		}
	}
}

export default new CollectionsController();
