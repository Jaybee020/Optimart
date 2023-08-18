import { Request, Response } from 'express';
import httpStatus from 'http-status';

class PingController {
	async get(req: Request, res: Response): Promise<void> {
		res.status(httpStatus.OK).json();
	}
}

export default new PingController();
