import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { UserService } from '../services';
import { XrplClient } from '../utils';

class UserController {
	async getByAddr(req: Request, res: Response): Promise<void> {
		const { addr } = req.params;
		const user = await UserService.getOrCreateByAddr(addr);
		const balance = await XrplClient.getAccountInfo(addr);
		const nfts = await XrplClient.getAccountNFTInfo(addr);
		res.status(httpStatus.OK).json({
			data: {
				...user,
				xrpBalance: balance,
				nfts: nfts,
			},
		});
	}
}

export default new UserController();
