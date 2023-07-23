import { AuctionBid, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class AuctionBidService {
	auctionBidCollection;
	constructor() {
		this.auctionBidCollection = prisma.auctionBid;
	}

	getById(id: string): Promise<AuctionBid | null> {
		return this.auctionBidCollection.findUnique({ where: { id: id } });
	}

	getCount(): Promise<number> {
		return this.auctionBidCollection.count();
	}

	getBids(limit: number = 100, offset: number = 0): Promise<AuctionBid[]> {
		return this.auctionBidCollection.findMany({ take: limit, skip: offset });
	}

	create(data: Prisma.AuctionBidCreateInput): Promise<AuctionBid> {
		return this.auctionBidCollection.create({ data: data });
	}

	update(id: string, data: Prisma.AuctionBidUpdateInput): Promise<AuctionBid> {
		return this.auctionBidCollection.update({ where: { id: id }, data: data });
	}

	delete(id: string): Promise<AuctionBid> {
		return this.auctionBidCollection.delete({ where: { id: id } });
	}
}

export default new AuctionBidService();
