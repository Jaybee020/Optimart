import httpStatus from 'http-status';

import ApiError from './api-error';

export function isIpfsUrl(url: string): boolean {
	return url.startsWith('ipfs:');
}

export function isHttpsUrl(url: string): boolean {
	return url.startsWith('https:');
}

export function assert(condition: boolean, message?: string): void {
	if (!condition) {
		throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, message || 'Assertion failed', true);
	}
}
