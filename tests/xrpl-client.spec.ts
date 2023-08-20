import { TransactionMetadata } from 'xrpl';

import { XrplClient } from '../src/utils';

describe('XRPL client', () => {
	it('get account information', async () => {
		const { result } = await XrplClient.getAccountInfo('ra8cAACGKrwDSYdoUdbQUSH4AEh3GMQSmv');
		expect(result.account_data.Flags).toBe(0);
		expect(result.account_data.Domain).toBe(undefined);
		expect(result.account_data.Balance).toBe('999999990');
		expect(result.account_data.Account).toBe('ra8cAACGKrwDSYdoUdbQUSH4AEh3GMQSmv');
	});

	it('should parse a transaction metadata', async () => {
		const { result } = await XrplClient.getTransaction(
			'7A5FA356493DD0912B2990A9D99706859199F6E1A48701B7D02CA7E891FC9413',
		);
		const res = XrplClient.parseNFTCreateOfferFromTxnMetadata(result.meta as TransactionMetadata);
		console.log(res);
	});
});
