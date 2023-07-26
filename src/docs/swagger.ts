import swaggerAutogen from 'swagger-autogen';

const generateDocs = swaggerAutogen();

const documentation = {
	info: {
		version: '0.0.1',
		title: 'Optimart API',
		description: 'NFT marketplace built on the XRP Ledger',
	},
	host: 'localhost:3000',
	basePath: '/',
	schemes: ['http', 'https'],
	consumes: ['application/json'],
	produces: ['application/json'],
};

const outputFile = './swagger.json';
const endpointsFiles = ['../app'];

generateDocs(outputFile, endpointsFiles, documentation).then(() => {
	require('../server');
});
