import { Request, Response } from 'express';
import { parseNFTokenID } from 'xrpl';

import TokenService from '../services/token';
import { decodeNftFlagNumber } from '../utils/misc';

class TokenController {
	async getTokenById(req: Request, res: Response): Promise<void> {
		try {
			const tokenId = req.params.tokenId;
			const nftData = parseNFTokenID(tokenId);
			const token = await TokenService.getOrCreateByTokenId(tokenId);
			res.status(200).send({
				message: null,
				data: {
					...token,
					flags: decodeNftFlagNumber(nftData.Flags),
					issuer: nftData.Issuer,
					transferFee: nftData.TransferFee,
				},
			});
		} catch (err: any) {
			res.status(400).send({
				message: err.message,
				data: null,
			});
		}
	}
}

export default new TokenController();
