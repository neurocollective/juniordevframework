import Default, { insertAndSeed } from './connector';

console.log('Default', Default);

const seed = async () => {
	console.log('CWD:', process.cwd());
	console.log('__dirname:', __dirname);
	await insertAndSeed();
	process.exit(0);
};

seed();
