import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { getNFTMetadata } from '../utils';
import prisma from './client';

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
		throw new Error(
			'Arguments should be two e.g. `--path /home/johndoe/seeders',
		);
	}

	if (!['-p', '--path'].includes(args[2])) {
		throw new Error('The first argument must be either `-p` or `--path`');
	}

	if (!fs.statSync(path.resolve(args[3])).isDirectory()) {
		throw new Error(
			'The second argument provided is not a valid directory',
		);
	}

	return args.splice(2);
};

const dumpIssuersIntoDB = async (csvPath: string): Promise<void> => {
	const dataToDump = [];
	const parser = fs.createReadStream(csvPath).pipe(parse({}));

	for await (const entry of parser) {
		dataToDump.push({ address: entry[1] });
	}

	prisma.user.createMany({ data: dataToDump });
};

const dumpNFTsIntoDB = async (csvPath: string): Promise<void> => {
	const owners = [];
	const collections = [];
	const nfts = [];
	const parser = fs.createReadStream(csvPath).pipe(parse({}));

	for await (const entry of parser) {
		// store the owner to create a user account later.
		owners.push({ address: entry[2] });

		// get the ipfs data.
		const metadata = await getNFTMetadata(entry[7]);

		// create a new collection
		collections.push({
			name: metadata.name,
			taxon: entry[3],
			issuer: entry[1],
			collectionId: entry[3] + entry[1],
			description: metadata.description,
		});

		// create the nft
		nfts.push({
			uri: entry[7],
			owner: entry[2],
			taxon: entry[3],
			tokenId: entry[0],
			imageUrl: metadata.imageURL,
			attributes: metadata.attributes,
			collectionId: entry[3] + entry[1],
		});
	}

	prisma.user.createMany({ data: owners, skipDuplicates: true });
	prisma.collection.createMany({ data: collections, skipDuplicates: true });
	prisma.nft.createMany({ data: nfts });
};

const [, seedDir] = validateCommandLineArgs(process.argv);
const issuersSeed = path.join(seedDir, 'issuers.csv');
const nftsSeed = path.join(seedDir, 'nfts.csv');

dumpIssuersIntoDB(issuersSeed);
dumpNFTsIntoDB(nftsSeed);
