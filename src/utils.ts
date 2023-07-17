type NFTMetadata = {
	name: string;
	imageURL: string;
	description: string;
	attributes: string;
};

const hexStrToStr = (value: string): string => {
	return Buffer.from(value, 'hex').toString();
};

const getNFTMetadata = async (uri: string): Promise<NFTMetadata> => {
	let decodedURI = hexStrToStr(uri);

	if (decodedURI.startsWith('cid:')) {
		decodedURI = decodedURI.replace('cid:', '');
	} else if (decodedURI.startsWith('ipfs:')) {
		decodedURI = `https://ipfs.io/ipfs/${decodedURI.replace('ipfs:', '')}`;
	}

	const response = await fetch(decodedURI);
	if (
		response.status !== 200 ||
		response.headers.get('Content-Type') !== 'application/json'
	) {
		return { name: '', description: '', imageURL: '', attributes: '' };
	}

	const data = await response.json();
	return await data;
};

export { getNFTMetadata };
