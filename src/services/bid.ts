import { AuctionBid, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class AuctionBidService {
	auctionBidModel = prisma.auctionBid;

	getById(id: string): Promise<AuctionBid | null> {
		return this.auctionBidModel.findUnique({ where: { id: id } });
	}

	count(): Promise<number> {
		return this.auctionBidModel.count();
	}

	all(limit: number = 100, offset: number = 0): Promise<AuctionBid[]> {
		return this.auctionBidModel.findMany({ take: limit, skip: offset });
	}

	create(data: Prisma.AuctionBidCreateInput): Promise<AuctionBid> {
		return this.auctionBidModel.create({ data: data });
	}

	update(id: string, data: Prisma.AuctionBidUpdateInput): Promise<AuctionBid> {
		return this.auctionBidModel.update({ where: { id: id }, data: data });
	}
}

export default new AuctionBidService();
