import { Collection } from '@prisma/client';

import { CollectionTokensData } from '../interfaces';
import prisma from '../prisma/index';

class CollectionService {
	collectionModel;
	constructor() {
		this.collectionModel = prisma.collection;
	}

	getCount(): Promise<number> {
		return this.collectionModel.count();
	}

	getCollections(limit: number = 100, offset: number = 0): Promise<Collection[]> {
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

	getByName(name: string): Promise<Collection[]> {
		return this.collectionModel.findMany({ where: { name: name } });
	}

	getTokensInCollection(
		collectionName: string,
		limit: number = 100,
		offset: number = 0,
	): Promise<CollectionTokensData | null> {
		return this.collectionModel.findFirst({
			where: {
				name: collectionName,
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
