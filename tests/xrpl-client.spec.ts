import { getAccountInfo } from '../src/utils/xrpl-client';

describe('XRPL client', () => {
	it('get account information', async () => {
		const { result } = await getAccountInfo('ra8cAACGKrwDSYdoUdbQUSH4AEh3GMQSmv');
		expect(result.account_data.Flags).toBe(0);
		expect(result.account_data.Domain).toBe(undefined);
		expect(result.account_data.Balance).toBe('999999990');
		expect(result.account_data.Account).toBe('ra8cAACGKrwDSYdoUdbQUSH4AEh3GMQSmv');
	});
});
