const hexStrToStr = (value: string): string => {
	return Buffer.from(value, 'hex').toString();
};
type NFTMetadata = {
	name: string;
	imageURL: string;
	description: string;
	attributes: string;
};
const getNFTMetadata = async (uri: string): Promise<NFTMetadata> => {
	let decodedURI = hexStrToStr(uri);

	if (decodedURI.startsWith('cid:')) {
		decodedURI = decodedURI.replace('cid:', '');
	} else if (decodedURI.startsWith('ipfs:')) {
		decodedURI = `https://ipfs.io/ipfs/${decodedURI.replace('ipfs:', '')}`;
	}

	const response = await fetch(decodedURI);
	if (response.headers.get('Content-Type') !== 'application/json') {
		return {};
	}

	const data = await response.json();
	return await data;
};

export { getNFTMetadata };
