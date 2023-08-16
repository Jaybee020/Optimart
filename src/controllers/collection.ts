import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { CollectionService } from '../services';

class CollectionController {
	async searchCollections(req: Request, res: Response): Promise<void> {
		const { q, limit } = req.query;
		const matchingCollections = await CollectionService.search(q as string, Number(limit));
		res.status(httpStatus.OK).json({
			data: matchingCollections,
		});
	}

	async getByCollectionId(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const collection = await CollectionService.getById(id as string);

		res.status(httpStatus.OK).json({
			data: collection,
		});
	}

	async getTokensInCollection(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const { offset, limit } = req.query;
		const collectionWithTokens = await CollectionService.getTokens(
			id as string,
			Number(limit),
			Number(offset),
		);
		res.status(httpStatus.OK).json({
			data: collectionWithTokens,
		});
	}
}

export default new CollectionController();
