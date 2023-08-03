import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { verifySignature } from 'verify-xrpl-signature';

import UserService from '../services/user';

export async function authenticateSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
	const authSig = req.headers.authorization;
	if (!authSig) {
		res.status(httpStatus.UNAUTHORIZED).json({ error: 'Missing authentication credentials' });
		return;
	}

	const { signedBy, signatureValid } = verifySignature(authSig);
	if (signatureValid) {
		req.user = await UserService.getOrCreateByAddr(signedBy);
		return next();
	}

	res.status(httpStatus.UNAUTHORIZED).json({
		error: 'Invalid authentication credentials provided',
	});
}
