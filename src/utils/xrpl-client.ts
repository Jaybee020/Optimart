import {
	AccountInfoResponse,
	AccountNFTsResponse,
	Client,
	NFTokenAcceptOffer,
	NFTokenCancelOffer,
	NFTokenCreateOffer,
	Transaction,
	TransactionMetadata,
	TxResponse,
	Wallet,
	deriveAddress,
	deriveKeypair,
} from 'xrpl';
import { Amount, NFTOffer } from 'xrpl/dist/npm/models/common';
import { CreatedNode, Node } from 'xrpl/dist/npm/models/transactions/metadata';

import configuration from '../config/config';
import { NFTHistoryTxnsResponse, NFTInfoResponse, NFTOffersResponse } from '../interfaces';

class XrplClient {
	private client: Client;

	constructor() {
		this.client = new Client(configuration.XRPL_NODE_URL);
	}

	/**
	 * Connects to an XRP Ledger client.
	 *
	 * @throws {Error} If there's an issue with connecting the client.
	 */
	private async connect(): Promise<void> {
		return this.client.connect();
	}

	/**
	 * Disconnects from the XRP Ledger client.
	 *
	 * @throws {Error} If there's an issue with disconnecting the client.
	 */
	private async disconnect(): Promise<void> {
		return this.client.disconnect();
	}

	/**
	 * Retrieves account information from the XRP Ledger.
	 *
	 * @param address - The XRP Ledger account address for which to retrieve information.
	 * @returns A Promise that resolves to the account information response.
	 * @throws {Error} If there's an issue with the XRP Ledger client or the request.
	 */
	async getAccountInfo(address: string): Promise<AccountInfoResponse> {
		try {
			await this.connect();
			const response = await this.client.request({
				command: 'account_info',
				account: address,
				ledger_index: 'validated',
			});
			return response;
		} finally {
			await this.disconnect();
		}
	}

	/**
	 * Retrieves information on a  transaction by its  hash
	 *
	 * @param txHash - The XRP Ledger account address for which to retrieve information.
	 * @returns A Promise that resolves to the account information response.
	 * @throws {Error} If there's an issue with the XRP Ledger client or the request.
	 */
	async getTransaction(txHash: string): Promise<TxResponse> {
		try {
			await this.connect();
			const response = await this.client.request({
				command: 'tx',
				transaction: txHash,
				ledger_index: 'validated',
			});
			return response;
		} finally {
			await this.disconnect();
		}
	}

	async signAndSubmitTransactions(txns: Transaction[]): Promise<{ hash: string }[]> {
		const processedTxns = await Promise.all(
			txns.map(async (txn) => {
				return (
					await this.client.submitAndWait(txn, {
						wallet: Wallet.fromSecret(configuration.XRPL_ACCOUNT_SECRET),
					})
				).result;
			}),
		);

		return processedTxns;
	}

	/**
	 * Retrieves tha  NFT information  of the address from the XRP Ledger.
	 *
	 * @param address - The XRP Ledger account address for which to retrieve NFT information.
	 * @returns A Promise that resolves to the account's NFT information response.
	 * @throws {Error} If there's an issue with the XRP Ledger client or the request.
	 */
	async getAccountNFTInfo(address: string): Promise<AccountNFTsResponse> {
		try {
			await this.connect();
			const response = await this.client.request({
				command: 'account_nfts',
				account: address,
				ledger_index: 'validated',
			});
			return response;
		} finally {
			await this.disconnect();
		}
	}

	/**
	 * Creates a sell offer transaction object for a specified NFToken.
	 *
	 * @param sellerAddr - The XRP Ledger account address that owns the NFToken to be listed.
	 * @param nftId  -  The NFTokenID of the NFToken object that the offer references.
	 * @param price - The amount expected for the Token.
	 * @param destinationAddr - If present, indicates that this offer may only be accepted by the specified account.
	 * @param expirationTime - The time after which the offer will no longer be valid.
	 * @returns A transaction object to be signed and broadcasted to the xrp network.
	 */
	listNFTForSale(
		sellerAddr: string,
		nftId: string,
		price: Amount,
		destinationAddr?: string,
		expirationTime?: number,
	): NFTokenCreateOffer {
		const txn: NFTokenCreateOffer = {
			TransactionType: 'NFTokenCreateOffer',
			NFTokenID: nftId,
			Account: sellerAddr,
			Amount: price,
			Destination: destinationAddr,
			Flags: 1,
			Expiration: expirationTime,
		};
		return txn;
	}

	/**
	 * Creates a buy offer transaction object for a specified NFToken.
	 * @param buyerAddr -The XRP Ledger account address that creates the offer.
	 * @param sellerAddr - The XRP Ledger account address that owns the NFToken to be listed.
	 * @param nftId  -  The NFTokenID of the NFToken object that the offer references.
	 * @param price - The amount expected for the Token.
	 * @param destinationAddr - If present, indicates that this offer may only be accepted by the specified account.
	 * @param expirationTime - The time after which the offer will no longer be valid.
	 * @returns A transaction object to be signed and broadcasted to the xrp network.
	 */
	createBuyOfferForNFT(
		buyerAddr: string,
		price: string,
		nftId: string,
		sellerAddr: string,
		destinationAddr?: string,
		expirationTime?: number,
	): NFTokenCreateOffer {
		const txn: NFTokenCreateOffer = {
			TransactionType: 'NFTokenCreateOffer',
			NFTokenID: nftId,
			Account: buyerAddr,
			Amount: price,
			Owner: sellerAddr,
			Destination: destinationAddr,
			Expiration: expirationTime,
			Flags: 0,
		};
		return txn;
	}

	/**
	 * Cancel existing NFTokenOffer objects..
	 * @param addr -The XRP Ledger account address that cancels the offers.
	 * @param offerIds - An array of NFToken offer identifiers to be deleted in this transaction.
	 * @returns A transaction object to be signed and broadcasted to the xrp network.
	 */

	cancelOfferForNFTokens(addr: string, offerIds: string[]): NFTokenCancelOffer {
		const txn: NFTokenCancelOffer = {
			TransactionType: 'NFTokenCancelOffer',
			Account: addr,
			NFTokenOffers: offerIds,
		};
		return txn;
	}

	/**
	 * Deletes existing NFTokenOffer objects..
	 * @param addr -The XRP Ledger account address that cancels the offers.
	 * @param buyOfferId - The NFToken buy offer identifier to be accepted in this transaction.
	 * @param sellOfferId - The NFToken buy offer identifier to be accepted in this transaction..
	 * @param brokerFee - The fee to be accepted by the broker in this transaction..
	 * @returns A transaction object to be signed and broadcasted to the xrp network.
	 */

	acceptOfferForNFTokens(
		addr: string,
		buyOfferId: string,
		sellOfferId: string,
		brokerFee: Amount,
	): NFTokenAcceptOffer {
		const txn: NFTokenAcceptOffer = {
			TransactionType: 'NFTokenAcceptOffer',
			NFTokenBrokerFee: brokerFee,
			NFTokenBuyOffer: buyOfferId,
			NFTokenSellOffer: sellOfferId,
			Account: addr,
		};
		return txn;
	}

	/**
	 * Fetches neccessary information about a specified NFToken.
	 * @param nftId  -  The unique identifier for the non-fungible token .
	 * @returns A Promise that resolves to the information about the NFT being queried.
	 */
	async getNFTInfo(nftId: string): Promise<NFTInfoResponse> {
		try {
			await this.connect();
			const response: NFTInfoResponse = await this.client.request({
				command: 'nft_info',
				nft_id: nftId,
				ledger_index: 'validated',
			});
			return response;
		} finally {
			await this.disconnect();
		}
	}

	/**
	 * Fetches historical transaction metadata about a specified NFToken.
	 * @param nftId  -  The unique identifier for the non-fungible token .
	 * @returns A Promise that resolves to the past transaction metadata for the NFT being queried
	 */
	async getNFTHistoryTxns(nftId: string): Promise<Transaction[]> {
		try {
			await this.connect();
			const txns = [];
			let marker;
			do {
				const response: NFTHistoryTxnsResponse = await this.client.request({
					command: 'nft_history',
					nft_id: nftId,
					ledger_index: 'validated',
					forward: true, //to signify order
				});
				marker = response.result.marker;
				txns.push(...response['result']['transactions'].map((txData) => txData.tx));
			} while (marker);
			return txns;
		} finally {
			await this.disconnect();
		}
	}

	/**
	 * Fetches offers for a specified NFToken.
	 * @param nftId  -  The unique identifier for the non-fungible token .
	 * @param offerType - The type for which offers are to be fetched
	 * @returns A Promise that resolves to the a list of buy offers for a given NFToken.
	 */
	async getNFTokenOffers(nftId: string, offerType: 'buy' | 'sell'): Promise<NFTOffer[]> {
		try {
			await this.connect();
			const offers = [];
			let marker;
			do {
				const response: NFTOffersResponse = await this.client.request({
					command: offerType == 'buy' ? 'nft_buy_offers' : 'nft_sell_offers',
					nft_id: nftId,
					ledger_index: 'validated',
					limit: 500,
				});
				marker = response.result.marker;
				offers.push(...response.result.offers);
			} while (marker);
			return offers;
		} finally {
			await this.disconnect();
		}
	}

	/**
	 * Get the XRP Ledger address from a given private key.
	 * @param {string} privateKey - The private key to derive the address from.
	 * @returns {string} The XRP Ledger address corresponding to the given private key.
	 * @throws {Error} If there's an issue with the derivation
	 */
	getAddressFromPrivateKey(privateKey: string): string {
		const { publicKey } = deriveKeypair(privateKey);
		return deriveAddress(publicKey);
	}

	decodeNftFlagNumber(flagNumber: number): string[] {
		switch (flagNumber) {
			case 1:
				return ['Burnable'];
			case 2:
				return ['OnlyXRP'];
			case 8:
				return ['Transferable'];
			case 9:
				return ['Burnable', 'Transferable'];
			case 10:
				return ['OnlyXRP', 'Transferable'];
			case 11:
				return ['OnlyXRP', 'Transferable', 'Burnable'];
			default:
				return [];
		}
	}

	parseNFTCreateOfferFromTxnMetadata(meta: TransactionMetadata): unknown {
		const nftOfferMeta = meta.AffectedNodes.find((txnNode) => {
			const coercedNode = txnNode as CreatedNode;
			return (
				coercedNode['CreatedNode'] && coercedNode['CreatedNode']['LedgerEntryType'] == 'NFTokenOffer'
			);
		}) as CreatedNode;

		return { id: nftOfferMeta.CreatedNode.LedgerIndex, ...nftOfferMeta.CreatedNode.NewFields } as unknown;
	}
}

export default new XrplClient();
