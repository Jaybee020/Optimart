import { convertHexToString } from 'xrpl';

import { NFTMetadata } from '../interfaces';

class NftService {
	public async resolveNFTMetadata(tokenId: string, uri: string, issuer: string): Promise<NFTMetadata> {
		// TODO: remember to replace with valid logic.
		return this.getDefaultNftMetadata(tokenId, issuer);
	}

	/**
	 * Resolves a hex-encoded NFT URI to a user-readable URI.
	 *
	 * This function takes a NFT URI in hexadecimal format, converts it back to a string,
	 * and returns a user-readable URI.
	 *
	 * @param uri - The hex-encoded NFT URI to resolve.
	 * @returns The decoded NFT Token URI.
	 */
	public hexEncodedNftUriToString(uri: string): string {
		const val = convertHexToString(uri);

		if (val.startsWith('cid:')) {
			return `ipfs://${val.replace('cid:', '')}`;
		}

		return val;
	}

	private getDefaultNftMetadata(tokenId: string, issuer: string): NFTMetadata {
		return {
			name: `NFT with ID: ${tokenId}`,
			imageUrl: `https://via.placeholder.com/600/eeeeee?text=NFT: ${tokenId}`,
			description: `This NFT was issued by ${issuer}`,
			attributes: [],
		};
	}
}

export default new NftService();
