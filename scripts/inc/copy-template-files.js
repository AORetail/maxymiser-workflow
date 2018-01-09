const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const mkdirp = require('mkdirp');
const merge = require('deepmerge');

const templateDirectory = path.resolve(__dirname, '../../template');

function getTemplateFiles() {
	return new Promise(function(resolve, reject) {
		glob('**/**', { cwd: templateDirectory, dot: true }, function(
			er,
			files
		) {
			if (er) {
				reject(er);
			}
			resolve(files);
		});
	});
}

function readJson(file){
	let data = {};
	try {
		data = JSON.parse(fs.readFileSync(file));
		// eslint-disable-next-line no-empty
	} catch (e){
	}

	return data;
}

function mergeJson(file, inFile, outFile){
	return new Promise(function(resolve){
		console.log(chalk.blue(`Merging ${file}`));
		let inData = readJson(inFile);
		let outData = readJson(outFile);
		let data = merge(outData, inData);
		let inFileContents = JSON.stringify(data, null, 2);

		mkdirp(path.dirname(outFile), function(writeErr) {
			if (writeErr) {
				console.log(chalk.red(outFile, writeErr));
			} else {
				fs.writeFileSync(outFile, inFileContents);
			}
			resolve();
		});
	});
}

function mergeMarkdown(file, inFile, outFile){
	return new Promise(function(resolve){
		console.log(chalk.blue(`Merging ${file}`));
		let inFileContents = fs.readFileSync(inFile).toString();
		let outFileContents = fs.readFileSync(outFile).toString();
		let contentToWrite = inFileContents;

		let regExp = /<!-- maxymiser-workflow start -->[\s\S]*<!-- maxymiser-workflow end -->\s*/m;

		if (regExp.test(outFileContents)){
			contentToWrite = outFileContents.replace(regExp, inFileContents);
		} else {
			contentToWrite = outFileContents + '\n' + inFileContents;
		}

		mkdirp(path.dirname(outFile), function(writeErr) {
			if (writeErr) {
				console.log(chalk.red(outFile, writeErr));
			} else {
				fs.writeFileSync(outFile, contentToWrite);
			}
			resolve();
		});
	});
}

const mergeNameMap = {
	'.eslintrc': mergeJson
};

const mergeExtMap = {
	'.json': mergeJson,
	'.md': mergeMarkdown
};

function getMergeFunction(file){
	let ext = path.extname(file).toLowerCase();
	let basename = path.basename(file);
	return mergeNameMap[basename] || mergeExtMap[ext];
}

function copyFile(file, inFile, outFile){
	return new Promise(function(resolve) {
		console.log(chalk.blue(`Copying ${file}`));
		var inFileContents = fs.readFileSync(inFile);
		mkdirp(path.dirname(outFile), function(writeErr) {
			if (writeErr) {
				console.log(chalk.red(outFile, writeErr));
			} else {
				fs.writeFileSync(outFile, inFileContents);
			}
			resolve();
		});
	});
}


/**
 * Copy template files over. Only populate empty or missing directories
 */
async function copyTemplateFiles(appDirectory, options) {
	const files = await getTemplateFiles();

	let populateDirs = new Set();
	populateDirs.add(appDirectory);
	let filesToWrite = new Set();

	files.forEach(function(file) {
		var inFile = path.resolve(templateDirectory, file);
		var outFile = path.resolve(appDirectory, file);
		const inFileStats = fs.statSync(inFile);
		if (inFileStats.isDirectory()) {
			if (
				options.force ||
				!fs.existsSync(outFile) ||
				fs.readdirSync(outFile).length === 0
			) {
				const isSrcFile = file.startsWith('src');
				if (options.force || options.template || !isSrcFile) {
					populateDirs.add(outFile);
				}
			}
		} else if (
			inFileStats.isFile() &&
			(options.force || populateDirs.has(path.dirname(outFile)))
		) {
			filesToWrite.add(file);
		}
	});

	if (filesToWrite.size === 0) {
		console.log(chalk.blue('No files to copy'));
		return Promise.resolve();
	}

	return Promise.all(
		Array.from(filesToWrite).map(function(file) {
			return new Promise(function(resolve) {
				var inFile = path.resolve(templateDirectory, file);
				var outFile = path.resolve(appDirectory, file);
				let mergeFn = !options.force && fs.existsSync(outFile) && getMergeFunction(inFile);
				if (mergeFn){
					mergeFn(file, inFile, outFile).then(resolve);
				} else {
					copyFile(file, inFile, outFile).then(resolve);
					// console.log(chalk.blue(`Copying ${file}`));
					// var inFileContents = fs.readFileSync(inFile);
					// mkdirp(path.dirname(outFile), function(writeErr) {
					// 	if (writeErr) {
					// 		console.log(chalk.red(outFile, writeErr));
					// 	} else {
					// 		fs.writeFileSync(outFile, inFileContents);
					// 	}
					// 	resolve();
					// });
				}
			});
		})
	);
}

module.exports = copyTemplateFiles;
