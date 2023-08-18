import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

import { NftService } from '../../utils';
import prisma from '../index';

async function getSheet(sheetName: string): Promise<GoogleSpreadsheetWorksheet> {
	const serviceAccountAuth = new JWT({
		email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		key: process.env.GOOGLE_PRIVATE_KEY,
		scopes: ['https://www.googleapis.com/auth/spreadsheets'],
	});

	const doc = new GoogleSpreadsheet(
		'https://docs.google.com/spreadsheets/d/1K8CtvbgwpC4KpfPQJDM5GzP2_iZ2XRvKSQfufYwKBKk',
		serviceAccountAuth,
	);
	await doc.loadInfo();
	return doc.sheetsByTitle[sheetName];
}

async function dumpIssuersIntoDB(): Promise<void> {
	const issuers = [];
	const issuersSheet = await getSheet('issuers');

	for (const entry of await issuersSheet.getRows()) {
		issuers.push({ address: entry.get('Address') });
	}

	await prisma.user.createMany({ data: issuers, skipDuplicates: true });
}

async function dumpCollectionsIntoDB(): Promise<void> {
	const collections = [];
	const collectionsMetadataSheet = await getSheet('collections_metadata');
	for (const entry of await collectionsMetadataSheet.getRows()) {
		collections.push({ address: entry.get('Address') });
	}
	// if (parseInt(taxon) !== 0) {
	//   collections.push({
	//     name: metadata.name,
	//     taxon: parseInt(taxon),
	//     issuer: issuer,
	//     collectionId: collectionId,
	//     description: metadata.description,
	//   });
	// }
	await prisma.collection.createMany({ data: collections, skipDuplicates: true });
}

async function dumpNFTsIntoDB(): Promise<void> {
	const nfts = [];
	const owners = [];
	const allNftsSheet = await getSheet('all_nfts');

	for (const entry of await allNftsSheet.getRows()) {
		const [tokenId, issuer, owner, taxon, , , sequence, uri] = entry;
		const collectionId = issuer + '-' + taxon;
		const metadata = await NftService.resolveNFTMetadata(tokenId, uri, issuer);

		owners.push({ address: owner });
		nfts.push({
			uri: uri,
			owner: owner,
			tokenId: tokenId,
			imageUrl: metadata.imageUrl,
			collectionId: parseInt(taxon) !== 0 ? collectionId : null,
			attributes: JSON.stringify(metadata.attributes),
			sequence: parseInt(sequence),
		});
	}

	await prisma.user.createMany({ data: owners, skipDuplicates: true });
	await prisma.nft.createMany({ data: nfts, skipDuplicates: true });
}

async function main(): Promise<void> {
	await dumpIssuersIntoDB();
	await dumpCollectionsIntoDB();
	await dumpNFTsIntoDB();
}

main();
