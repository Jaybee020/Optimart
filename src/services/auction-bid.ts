import { AuctionBid, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class AuctionBidService {
	model = prisma.auctionBid;

	async getById(id: string): Promise<AuctionBid | null> {
		return this.model.findUniqueOrThrow({ where: { id: id } });
	}

	async count(): Promise<number> {
		return this.model.count();
	}

	async all(limit: number, offset: number): Promise<AuctionBid[]> {
		return this.model.findMany({ take: limit, skip: offset });
	}

	async create(data: Prisma.AuctionBidCreateInput): Promise<AuctionBid> {
		return this.model.create({ data: data });
	}

	async update(id: string, data: Prisma.AuctionBidUpdateInput): Promise<AuctionBid> {
		return this.model.update({ where: { id: id }, data: data });
	}
}

export default new AuctionBidService();
