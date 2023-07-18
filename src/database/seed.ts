import fs from 'fs';
import path from 'path';

import { parse } from 'csv-parse';

import prisma from './client';
import { resolveNFTMetadata } from '../utils/nft-metadata';

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
const validateCommandLineArgs = (args: string[]): string[] => {
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
};

/**
 * Loads issuer data from a CSV file and dumps it into the database.
 * @param csvPath - The path to the CSV file containing issuer data.
 * @returns A Promise that resolves once the data is dumped into the database.
 */
const dumpIssuersIntoDB = async (csvPath: string): Promise<void> => {
	const dataToDump = [];
	const parser = fs.createReadStream(csvPath).pipe(parse({ from: 2 }));

	for await (const entry of parser) {
		const [, issuer] = entry;
		dataToDump.push({ address: issuer });
	}

	await prisma.user.createMany({ data: dataToDump, skipDuplicates: true });
};

/**
 * Loads NFT data from a CSV file and dumps it into the database.
 * @param csvPath - The path to the CSV file containing NFT data.
 * @returns A Promise that resolves once the data is dumped into the database.
 */
const dumpNFTsIntoDB = async (csvPath: string): Promise<void> => {
	const nfts = [];
	const owners = [];
	const collections = [];
	const parser = fs.createReadStream(csvPath).pipe(parse({ from: 2 }));

	for await (const entry of parser) {
		const [tokenId, issuer, owner, taxon, , , , uri] = entry;
		const metadata = await resolveNFTMetadata(tokenId, uri, issuer);

		owners.push({ address: owner });

		collections.push({
			name: metadata.name,
			taxon: parseInt(taxon),
			issuer: issuer,
			collectionId: issuer + taxon,
			description: metadata.description,
		});

		nfts.push({
			uri: uri,
			owner: owner,
			taxon: parseInt(taxon),
			tokenId: tokenId,
			imageUrl: metadata.imageUrl,
			attributes: JSON.stringify(metadata.attributes),
			collectionId: issuer + taxon,
		});
	}

	await prisma.user.createMany({ data: owners, skipDuplicates: true });
	await prisma.collection.createMany({ data: collections, skipDuplicates: true });
	await prisma.nft.createMany({ data: nfts });
};

const [, seedDir] = validateCommandLineArgs(process.argv);
const issuersSeed = path.join(seedDir, 'issuers.csv');
const nftsSeed = path.join(seedDir, 'nfts.csv');

prisma.$connect().then(async () => {
	console.log('Seed DB connected successfully!');
	await dumpIssuersIntoDB(issuersSeed);
	await dumpNFTsIntoDB(nftsSeed);
	await prisma.$disconnect();
});
