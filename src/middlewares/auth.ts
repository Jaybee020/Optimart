//send decode signature cookie parameter and set req.userAddr to the field
import { Request, Response, NextFunction } from 'express';
import { verifySignature } from 'verify-xrpl-signature';

import UserService from '../services/user';

export async function authenticateSignature(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const authenticationTxnSig = req.headers['authorization'];

	if (authenticationTxnSig !== undefined) {
		const { signedBy, signatureValid } = verifySignature(authenticationTxnSig);
		if (signatureValid) {
			req.user = await UserService.getOrCreateByAddr(signedBy);
			return next();
		}
	}

	// if the authorization signature is invalid or missing returning a 401 error
	res.status(401).send('Unauthorized');
}
