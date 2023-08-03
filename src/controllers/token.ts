import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { parseNFTokenID } from 'xrpl';

import TokenService from '../services/token';
import { XrplClient } from '../utils';

export async function getTokenById(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const nftData = parseNFTokenID(id);
	const token = await TokenService.getOrCreateByTokenId(id);

	res.status(httpStatus.OK).json({
		data: {
			...token,
			flags: XrplClient.decodeNftFlagNumber(nftData.Flags),
			issuer: nftData.Issuer,
			transferFee: nftData.TransferFee,
		},
	});
}
