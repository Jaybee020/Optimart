import { AccountInfoResponse, Client } from 'xrpl';

import configuration from '../config/config';

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
	public async connect(): Promise<void> {
		return this.client.connect();
	}

	/**
	 * Disconnects from the XRP Ledger client.
	 *
	 * @throws {Error} If there's an issue with disconnecting the client.
	 */
	public async disconnect(): Promise<void> {
		return this.client.disconnect();
	}

	/**
	 * Retrieves account information from the XRP Ledger.
	 *
	 * @param address - The XRP Ledger account address for which to retrieve information.
	 * @returns A Promise that resolves to the account information response.
	 * @throws {Error} If there's an issue with the XRP Ledger client or the request.
	 */
	public async getAccountInfo(address: string): Promise<AccountInfoResponse> {
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
}

export default new XrplClient();
