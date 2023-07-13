import { Request, Response } from 'express';
import httpStatus from 'http-status';

const index = (req: Request, res: Response): void => {
	res.status(httpStatus.OK).json();
};

export default index;
