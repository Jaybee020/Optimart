import { Offer, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class OfferService {
	offerModel = prisma.offer;

	getById(id: string): Promise<Offer | null> {
		return this.offerModel.findUnique({ where: { id: id } });
	}

	count(): Promise<number> {
		return this.offerModel.count();
	}

	all(limit: number = 100, offset: number = 0): Promise<Offer[]> {
		return this.offerModel.findMany({ take: limit, skip: offset });
	}

	create(data: Prisma.OfferCreateInput): Promise<Offer> {
		return this.offerModel.create({ data: data });
	}

	update(id: string, data: Prisma.OfferUpdateInput): Promise<Offer> {
		return this.offerModel.update({ where: { id: id }, data: data });
	}
}

export default new OfferService();
