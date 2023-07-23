export function isIpfsUrl(url: string): boolean {
	return url.startsWith('ipfs:');
}

export function isHttpsUrl(url: string): boolean {
	return url.startsWith('https:');
}

export function decodeNftFlagNumber(flagNumber: number): string[] {
	if (flagNumber == 11) {
		return ['OnlyXRP', 'Transferable', 'Burnable'];
	} else if (flagNumber == 1) {
		return ['Burnable'];
	} else if (flagNumber == 2) {
		return ['OnlyXRP'];
	} else if (flagNumber == 8) {
		return ['Transferable'];
	}
	return [];
}
