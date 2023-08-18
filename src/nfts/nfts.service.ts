import { Nft, Prisma } from '@prisma/client';

import { NftFilter } from '../interfaces';
import prisma from '../prisma/index';
import { XrplClient } from '../utils';
import NFTMetadataService from '../utils/nft-metadata';

class NFTService {
	model = prisma.nft;

	async count(): Promise<number> {
		return this.model.count();
	}

	async getById(id: string): Promise<Nft | null> {
		return this.model.findUnique({
			where: {
				id: id,
			},
		});
	}

	getByTokenId(id: string): Promise<Nft | null> {
		return this.model.findUnique({
			where: {
				tokenId: id,
			},
		});
	}

	async filter(filters: NftFilter): Promise<Nft[] | null> {
		const filterConditions: Prisma.NftWhereInput[] = [];

		if (filters.name || filters.taxon || filters.issuer) {
			const collectionConditions: Prisma.CollectionWhereInput = {};

			if (filters.name) {
				collectionConditions.name = { contains: filters.name, mode: 'insensitive' };
			}
			if (filters.taxon) {
				collectionConditions.taxon = filters.taxon;
			}
			if (filters.issuer) {
				collectionConditions.issuer = filters.issuer;
			}

			filterConditions.push({ collection: collectionConditions });
		}

		if (filters.status) {
			filterConditions.push({ status: filters.status });
		}

		if (filters.minPrice || filters.maxPrice) {
			const priceConditions: Prisma.DecimalFilter = {};

			if (filters.minPrice) {
				priceConditions.gte = filters.minPrice;
			}
			if (filters.maxPrice) {
				priceConditions.lte = filters.maxPrice;
			}

			filterConditions.push({ price: priceConditions });
		}

		if (filters.attributes) {
			for (const [key, value] of Object.entries(filters.attributes)) {
				filterConditions.push({
					attributes: {
						path: [key],
						equals: value,
					},
				});
			}
		}

		if (filters.attributesCount) {
			const result: { id: string }[] =
				await prisma.$queryRaw`SELECT "id" FROM "Nft" WHERE jsonb_object_keys(attributes)::jsonb ?& array[${filters.attributesCount}]`;
			const idsWithCorrectAttributeCount = result.map((item) => item.id);

			filterConditions.push({
				id: {
					in: idsWithCorrectAttributeCount,
				},
			});
		}

		const where = { AND: filterConditions };
		return prisma.nft.findMany({ where });
	}

	async createByTokenId(id: string): Promise<Nft> {
		const nftData = await XrplClient.getNFTInfo(id);
		const metadata = await NFTMetadataService.resolveNFTMetadata(id, nftData.uri, nftData.issuer);
		return this.create({
			tokenId: id,
			owner: nftData.owner,
			sequence: nftData.nft_sequence,
			attributes: JSON.stringify(metadata.attributes),
			uri: nftData.uri,
			imageUrl: metadata.imageUrl,
		});
	}

	async create(data: Prisma.NftCreateInput): Promise<Nft> {
		return this.model.create({ data: data });
	}

	async getOrCreateByTokenId(id: string): Promise<Nft> {
		const token = await this.getByTokenId(id);
		if (!token) {
			return this.createByTokenId(id);
		}
		return token;
	}

	async update(id: string, data: Prisma.NftUpdateInput): Promise<Nft> {
		return this.model.update({ where: { id: id }, data: data });
	}
}

export default new NFTService();
