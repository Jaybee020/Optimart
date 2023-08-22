import { Prisma, User } from '@prisma/client';

import prisma from '../prisma/index';

class UserService {
	model = prisma.user;

	async getByAddr(addr: string): Promise<User | null> {
		return this.model.findUnique({
			where: {
				address: addr,
			},
		});
	}

	async create(data: Prisma.UserCreateInput): Promise<User> {
		return this.model.create({ data: data });
	}

	async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
		return this.model.update({ where: { id: id }, data: data });
	}

	async getOrCreateByAddr(addr: string): Promise<User> {
		const user = await this.getByAddr(addr);
		if (!user) {
			return this.create({ address: addr });
		}
		return user;
	}
	async search(q: string, limit: number): Promise<User[]> {
		return this.model.findMany({
			take: limit,
			where: {
				OR: [{ address: { contains: q } }],
			},
		});
	}
}

export default new UserService();
