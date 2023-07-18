export interface NFTMetadata {
	name: string;
	imageUrl: string;
	description: string;
	attributes: NFTMetadataAttribute[];
}

interface NFTMetadataAttribute {
	name: string;
	value: string;
}
