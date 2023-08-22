import { Nft, Prisma } from '@prisma/client';

import prisma from '../prisma/index';
import { XrplClient } from '../utils';
import NFTMetadataService from '../utils/nft-metadata';

class NftService {
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

	async createByTokenId(id: string): Promise<Nft> {
		const nftData = await XrplClient.getNFTInfo(id);
		const collectionId = `${nftData.issuer}-${nftData.nft_taxon}`;
		const metadata = await NFTMetadataService.resolveNFTMetadata(id, nftData.uri, nftData.issuer);
		return this.create({
			tokenId: id,
			owner: nftData.owner,
			sequence: nftData.nft_sequence,
			attributes: JSON.stringify(metadata.attributes),
			uri: nftData.uri,
			imageUrl: metadata.imageUrl,
			collection: {
				connectOrCreate: {
					where: {
						id: collectionId,
					},
					create: {
						collectionId: collectionId,
						issuer: nftData.issuer,
						taxon: nftData.nft_taxon,
					},
				},
			},
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

export default new NftService();
