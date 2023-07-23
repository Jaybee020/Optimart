import { Prisma, User } from '@prisma/client';

import prisma from '../prisma/index';

class UserService {
	userCollection;
	constructor() {
		this.userCollection = prisma.user;
	}

	getById(id: string): Promise<User | null> {
		return this.userCollection.findUnique({
			where: {
				id: id,
			},
		});
	}

	getByAddr(addr: string): Promise<User | null> {
		return this.userCollection.findUnique({
			where: {
				address: addr,
			},
		});
	}

	create(data: Prisma.UserCreateInput): Promise<User> {
		return this.userCollection.create({ data: data });
	}

	update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
		return this.userCollection.update({ where: { id: id }, data: data });
	}

	async getOrCreateByAddr(addr: string): Promise<User> {
		const user = await this.getByAddr(addr);
		if (!user) {
			return this.create({ address: addr });
		}
		return user;
	}
}

export default new UserService();
