import { Nft } from '@prisma/client';
import { NFTokenCreateOffer, Transaction, TransactionMetadata } from 'xrpl';
import { LedgerIndex, NFTOffer } from 'xrpl/dist/npm/models/common';
import { BaseResponse } from 'xrpl/dist/npm/models/methods/baseMethod';

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
export interface NFTCreateOfferWithId extends NFTokenCreateOffer {
	id: string;
}

export interface NFTHistoryTxnsResponse extends BaseResponse {
	result: {
		nft_id: string;
		ledger_index_min: number | LedgerIndex;
		ledger_index_max: number | LedgerIndex;
		limit: number;
		marker?: string;
		transactions: { meta: TransactionMetadata; tx: Transaction }[];
		validated: boolean;
	};
}

export interface NFTInfoResponse extends BaseResponse {
	nft_id: string;
	ledger_index: number | LedgerIndex;
	owner: string;
	flags: number;
	transfer_fee: number;
	issuer: string;
	nft_taxon: number;
	nft_sequence: number;
	is_burned: boolean;
	uri: string;
}

export interface CollectionTokensData {
	name: string | null;
	nfts: Nft[];
}

export interface NFTOffersResponse extends BaseResponse {
	result: {
		offers: NFTOffer[];
		nft_id: string;
		marker?: string;
	};
}

export interface ListingDBFilters {
	status?: 'ONGOING' | 'CANCELLED' | 'COMPLETED';
	limit?: number;
	offset?: number;
	creator?: string;
	listedBefore?: Date;
	listedAfter?: Date;
	nftId?: string;
	type?: 'REGULAR' | 'AUCTION';
}

export interface OfferDBFilters {
	limit?: number;
	offset?: number;
	offeree?: string;
	offeror?: string;
	listing?: string;
	offeredBefore?: Date;
	offeredAfter?: Date;
	nftId?: string;
	status?: 'PENDING' | 'CANCELLED' | 'ACCEPTED' | 'REJECTED';
}