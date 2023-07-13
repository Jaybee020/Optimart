import { Request, Response } from 'express';
import httpStatus from 'http-status';

const index = (req: Request, res: Response): Response => {
	return res.status(httpStatus.OK);
};

export default index;
