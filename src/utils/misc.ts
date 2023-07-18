const isIpfsUrl = (url: string): boolean => {
	return url.startsWith('ipfs:') ? true : false;
};

const isHttpsUrl = (url: string): boolean => {
	return url.startsWith('https:') ? true : false;
};
export { isIpfsUrl, isHttpsUrl };
