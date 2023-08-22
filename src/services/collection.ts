import { Collection } from '@prisma/client';

import { CollectionTokensData } from '../interfaces';
import prisma from '../prisma';

class CollectionService {
	model = prisma.collection;

	async count(): Promise<number> {
		return this.model.count();
	}

	async search(q: string, limit: number): Promise<Collection[]> {
		return this.model.findMany({
			take: limit,
			where: {
				OR: [
					{ name: { contains: q } },
					{ description: { contains: q } },
					{ issuer: { contains: q } },
				],
			},
		});
	}

	async all(limit: number, offset: number): Promise<Collection[]> {
		return this.model.findMany({
			skip: offset,
			take: limit,
			include: {
				_count: {
					select: { nfts: true },
				},
			},
		});
	}

	async getById(id: string): Promise<Collection | null> {
		return this.model.findUniqueOrThrow({
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

	async getTokens(id: string, limit: number, offset: number): Promise<CollectionTokensData | null> {
		return this.model.findFirst({
			where: {
				id: id,
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

	async getOrCreateCollection(id: string): Promise<Collection> {
		const [issuer, taxon] = id.split('-');
		return this.model.create({
			data: {
				issuer: issuer,
				taxon: Number(taxon),
				collectionId: id,
			},
		});
	}
}

export default new CollectionService();