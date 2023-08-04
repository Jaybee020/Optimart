import { ListingOffer, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class ListingOfferService {
	model = prisma.listingOffer;

	async getById(id: string): Promise<ListingOffer | null> {
		return this.model.findUnique({ where: { id: id } });
	}

	async count(): Promise<number> {
		return this.model.count();
	}

	async all(limit: number, offset: number): Promise<ListingOffer[]> {
		return this.model.findMany({ take: limit, skip: offset });
	}

	async create(data: Prisma.ListingOfferCreateInput): Promise<ListingOffer> {
		return this.model.create({ data: data });
	}

	async update(id: string, data: Prisma.ListingOfferUpdateInput): Promise<ListingOffer> {
		return this.model.update({ where: { id: id }, data: data });
	}
}

export default new ListingOfferService();
