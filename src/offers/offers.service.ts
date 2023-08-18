import { Offer, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class OfferService {
	model = prisma.offer;

	async getById(id: string): Promise<Offer | null> {
		return this.model.findUniqueOrThrow({ where: { id: id } });
	}

	async count(): Promise<number> {
		return this.model.count();
	}

	async all(limit: number, offset: number): Promise<Offer[]> {
		return this.model.findMany({ take: limit, skip: offset });
	}

	async create(data: Prisma.OfferCreateInput): Promise<Offer> {
		return this.model.create({ data: data });
	}

	async update(id: string, data: Prisma.OfferUpdateInput): Promise<Offer> {
		return this.model.update({ where: { id: id }, data: data });
	}
}

export default new OfferService();
