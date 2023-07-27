import { Collection } from '@prisma/client';

import { CollectionTokensData } from '../interfaces';
import prisma from '../prisma/index';

class CollectionService {
	collectionModel;
	constructor() {
		this.collectionModel = prisma.collection;
	}

	count(): Promise<number> {
		return this.collectionModel.count();
	}

	all(limit: number = 100, offset: number = 0): Promise<Collection[]> {
		return this.collectionModel.findMany({
			skip: offset,
			take: limit,
			include: {
				_count: {
					select: { nfts: true },
				},
			},
		});
	}

	getById(id: string): Promise<Collection | null> {
		return this.collectionModel.findUnique({
			where: {
				id: id,
			},
			include: {
				_count: {
					select: { nfts: true },
				},
			},
		});
	}

	getByCollectionId(collectionId: string): Promise<Collection[]> {
		return this.collectionModel.findMany({ where: { collectionId: collectionId } });
	}

	getTokens(
		collectionId: string,
		limit: number = 1000,
		offset: number = 0,
	): Promise<CollectionTokensData | null> {
		return this.collectionModel.findFirst({
			where: {
				collectionId: collectionId,
			},
			select: {
				name: true,
				nfts: {
					take: limit,
					skip: offset,
				},
			},
		});
	}
}

export default new CollectionService();
