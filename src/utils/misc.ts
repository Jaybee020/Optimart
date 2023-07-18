export function isIpfsUrl(url: string): boolean {
	return url.startsWith('ipfs:');
}

export function isHttpsUrl(url: string): boolean {
	return url.startsWith('https:');
}
