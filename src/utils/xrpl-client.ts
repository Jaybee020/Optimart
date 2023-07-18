import { AccountInfoResponse, Client } from 'xrpl';

import configuration from '../config/config';

/**
 * Creates and connects to an XRP Ledger client.
 *
 * @returns A Promise that resolves to the connected XRP Ledger client.
 * @throws {Error} If there's an issue with creating or connecting the client.
 */
const getXrplClient = async (): Promise<Client> => {
	const client = new Client(configuration.XRPL_NODE_URL);
	await client.connect();

	return client;
};

/**
 * Retrieves account information from the XRP Ledger.
 *
 * @param address - The XRP Ledger account address for which to retrieve information.
 * @returns A Promise that resolves to the account information response.
 * @throws {Error} If there's an issue with the XRP Ledger client or the request.
 */
const getAccountInfo = async (address: string): Promise<AccountInfoResponse> => {
	let client: Client | null = null;

	try {
		client = await getXrplClient();
		const response = await client.request({
			command: 'account_info',
			account: address,
			ledger_index: 'validated',
		});

		client.disconnect();

		return response;
	} catch (error: unknown) {
		if (client) {
			client.disconnect();
		}

		throw error;
	}
};

export { getAccountInfo };
