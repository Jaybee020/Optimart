import { Offer, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class OfferService {
	offerCollection;
	constructor() {
		this.offerCollection = prisma.offer;
	}

	getById(id: string): Promise<Offer | null> {
		return this.offerCollection.findUnique({ where: { id: id } });
	}

	getCount(): Promise<number> {
		return this.offerCollection.count();
	}

	getOffers(limit: number = 100, offset: number = 0): Promise<Offer[]> {
		return this.offerCollection.findMany({ take: limit, skip: offset });
	}

	create(data: Prisma.OfferCreateInput): Promise<Offer> {
		return this.offerCollection.create({ data: data });
	}

	update(id: string, data: Prisma.OfferUpdateInput): Promise<Offer> {
		return this.offerCollection.update({ where: { id: id }, data: data });
	}

	delete(id: string): Promise<Offer> {
		return this.offerCollection.delete({ where: { id: id } });
	}
}

export default new OfferService();
