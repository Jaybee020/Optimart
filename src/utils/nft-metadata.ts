import { convertHexToString } from 'xrpl';

interface NFTMetadata {
	name: string;
	imageUrl: string;
	description: string;
	attributes: NFTMetadataAttribute[];
}

interface NFTMetadataAttribute {
	name: string;
	value: string;
}

const getDefaultNftMetadata = (tokenId: string, issuer: string): NFTMetadata => {
	return {
		name: `NFT with ID: ${tokenId}`,
		imageUrl: `https://via.placeholder.com/600/eeeeee?text=NFT: ${tokenId}`,
		description: `This NFT was issued by ${issuer}`,
		attributes: [],
	};
};

/**
 * Resolves a hex-encoded NFT URI to a user-readable URI.
 *
 * This function takes a NFT URI in hexadecimal format, converts it back to a string,
 * and returns a user-readable URI.
 *
 * @param uri - The hex-encoded NFT URI to resolve.
 * @returns The decoded NFT Token URI.
 */
const hexEncodedNftUriToString = (uri: string): string => {
	const val = convertHexToString(uri);

	if (val.startsWith('cid:')) {
		return `ipfs://${val.replace('cid:', '')}`;
	}

	return val;
};

const resolveNFTMetadata = async (
	tokenId: string,
	uri: string,
	issuer: string,
): Promise<NFTMetadata> => {
	return getDefaultNftMetadata(tokenId, issuer);
};

export { resolveNFTMetadata };
