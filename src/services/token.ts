import { Nft, Prisma } from '@prisma/client';

import prisma from '../prisma/index';
import { XrplClient } from '../utils';
import NFTMetadataService from '../utils/nft-metadata';

class NftService {
	NFTCollection;
	constructor() {
		this.NFTCollection = prisma.nft;
	}

	getCount(): Promise<number> {
		return this.NFTCollection.count();
	}

	getById(id: string): Promise<Nft | null> {
		return this.NFTCollection.findUnique({
			where: {
				id: id,
			},
		});
	}

	getByTokenId(tokenId: string): Promise<Nft | null> {
		return this.NFTCollection.findUnique({
			where: {
				tokenId: tokenId,
			},
		});
	}

	async createByTokenId(tokenId: string): Promise<Nft> {
		const nftData = await XrplClient.getNFTInfo(tokenId);
		const metadata = await NFTMetadataService.resolveNFTMetadata(
			tokenId,
			nftData.uri,
			nftData.issuer,
		);
		return this.create({
			tokenId: tokenId,
			owner: nftData.owner,
			sequence: nftData.nft_sequence,
			attributes: JSON.stringify(metadata.attributes),
			uri: nftData.uri,
			imageUrl: metadata.imageUrl,
		});
	}

	async create(data: Prisma.NftCreateInput): Promise<Nft> {
		return this.NFTCollection.create({ data: data });
	}

	async getOrCreateByTokenId(tokenId: string): Promise<Nft> {
		const token = await this.getByTokenId(tokenId);
		if (!token) {
			return this.createByTokenId(tokenId);
		}
		return token;
	}

	update(id: string, data: Prisma.NftUpdateInput): Promise<Nft> {
		return this.NFTCollection.update({ where: { id: id }, data: data });
	}
}

export default new NftService();
