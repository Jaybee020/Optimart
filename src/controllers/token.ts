import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { parseNFTokenID } from 'xrpl';

import TokenService from '../services/token';
import { decodeNftFlagNumber } from '../utils/misc';

class TokensController {
	async getTokenById(req: Request, res: Response): Promise<void> {
		try {
			const tokenId = req.params.tokenId;
			const nftData = parseNFTokenID(tokenId);
			const token = await TokenService.getOrCreateByTokenId(tokenId);
			res.status(httpStatus.OK).send({
				data: {
					...token,
					flags: decodeNftFlagNumber(nftData.Flags),
					issuer: nftData.Issuer,
					transferFee: nftData.TransferFee,
				},
			});
		} catch (err: unknown) {
			res.status(httpStatus.BAD_REQUEST).send({
				error: err,
			});
		}
	}
}

export default new TokensController();
