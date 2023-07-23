import fs from 'fs';
import path from 'path';

import { parse } from 'csv-parse';

import { NftService } from '../../utils';
import prisma from '../index';

/**
 * Validates command-line arguments for a specific use case.
 *
 * @param args - An array of strings representing the command-line arguments.
 *              It is expected to contain two elements: the first element
 *              should be `-p` or `--path`, and the second element should be
 *              the path to a directory.
 *
 * @throws {Error} If the number of arguments is not exactly 2, or if the first
 *                argument is not `-p` or `--path`, or if the second argument
 *                does not represent a valid directory path.
 *
 * @returns {string[]} The original array of command-line arguments if they pass
 *                    the validation.
 */
function validateCommandLineArgs(args: string[]): string[] {
	if (args.length !== 4) {
		throw new Error('Arguments should be two e.g. `--path /home/johndoe/seeders');
	}

	if (!['-p', '--path'].includes(args[2])) {
		throw new Error('The first argument must be either `-p` or `--path`');
	}

	if (!fs.statSync(path.resolve(args[3])).isDirectory()) {
		throw new Error('The second argument provided is not a valid directory');
	}

	return args.splice(2);
}

/**
 * Loads issuer data from a CSV file and dumps it into the database.
 * @param csvPath - The path to the CSV file containing issuer data.
 * @returns A Promise that resolves once the data is dumped into the database.
 */
async function dumpIssuersIntoDB(csvPath: string): Promise<void> {
	const dataToDump = [];
	const parser = fs.createReadStream(csvPath).pipe(parse({ from: 2 }));

	for await (const entry of parser) {
		const [, issuer] = entry;
		dataToDump.push({ address: issuer });
	}

	await prisma.user.createMany({ data: dataToDump, skipDuplicates: true });
}

/**
 * Loads NFT data from a CSV file and dumps it into the database.
 * @param csvPath - The path to the CSV file containing NFT data.
 * @returns A Promise that resolves once the data is dumped into the database.
 */
async function dumpNFTsIntoDB(csvPath: string): Promise<void> {
	const nfts = [];
	const owners = [];
	const collections = [];
	const parser = fs.createReadStream(csvPath).pipe(parse({ from: 2 }));

	for await (const entry of parser) {
		const [tokenId, issuer, owner, taxon, , , sequence, uri] = entry;
		const collectionId = issuer + '-' + taxon;
		const metadata = await NftService.resolveNFTMetadata(tokenId, uri, issuer);

		owners.push({ address: owner });

		if (parseInt(taxon) !== 0) {
			collections.push({
				name: metadata.name,
				taxon: parseInt(taxon),
				issuer: issuer,
				collectionId: collectionId,
				description: metadata.description,
			});
		}

		nfts.push({
			uri: uri,
			owner: owner,
			tokenId: tokenId,
			imageUrl: metadata.imageUrl,
			collectionId: parseInt(taxon) !== 0 ? collectionId : null,
			attributes: JSON.stringify(metadata.attributes),
			sequence: sequence,
		});
	}

	await prisma.user.createMany({ data: owners, skipDuplicates: true });
	await prisma.collection.createMany({ data: collections, skipDuplicates: true });
	await prisma.nft.createMany({ data: nfts });
}

async function main(): Promise<void> {
	const [, seedDir] = validateCommandLineArgs(process.argv);
	const issuersSeed = path.join(seedDir, 'issuers.csv');
	const nftsSeed = path.join(seedDir, 'nfts.csv');

	await dumpIssuersIntoDB(issuersSeed);
	await dumpNFTsIntoDB(nftsSeed);
}

main();
