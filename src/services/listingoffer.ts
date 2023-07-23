import { ListingOffer, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class ListingOfferService {
	listingOfferCollection;
	constructor() {
		this.listingOfferCollection = prisma.listingOffer;
	}

	getById(id: string): Promise<ListingOffer | null> {
		return this.listingOfferCollection.findUnique({ where: { id: id } });
	}

	getCount(): Promise<number> {
		return this.listingOfferCollection.count();
	}

	getOffers(limit: number = 100, offset: number = 0): Promise<ListingOffer[]> {
		return this.listingOfferCollection.findMany({ take: limit, skip: offset });
	}

	create(data: Prisma.ListingOfferCreateInput): Promise<ListingOffer> {
		return this.listingOfferCollection.create({ data: data });
	}

	update(id: string, data: Prisma.ListingOfferUpdateInput): Promise<ListingOffer> {
		return this.listingOfferCollection.update({ where: { id: id }, data: data });
	}

	delete(id: string): Promise<ListingOffer> {
		return this.listingOfferCollection.delete({ where: { id: id } });
	}
}

export default new ListingOfferService();
