import { Request, Response } from 'express';
import httpStatus from 'http-status';

import CollectionService from './collections.service';
import { TopCollectionsFilter } from '../interfaces';

class CollectionController {
	async getTopCollections(req: Request, res: Response): Promise<void> {
		const topCollectionForDuration = await CollectionService.all({
			limit: req.query.limit,
			offset: req.query.offset,
			duration: req.query.duration,
		} as TopCollectionsFilter);

		res.status(httpStatus.OK).json({ data: topCollectionForDuration });
	}

	async searchCollections(req: Request, res: Response): Promise<void> {
		const { q, limit } = req.query;
		const matchingCollections = await CollectionService.search(q as string, Number(limit));

		res.status(httpStatus.OK).json({
			data: matchingCollections,
		});
	}

	async getCollectionById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const collection = await CollectionService.getById(id as string);

		res.status(httpStatus.OK).json({
			data: collection,
		});
	}

	// todo: Add filters
	async getNFTsInCollection(req: Request, res: Response): Promise<void> {
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
