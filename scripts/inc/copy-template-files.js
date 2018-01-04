const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const mkdirp = require('mkdirp');

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

/**
 * Copy template files over. Only populate empty or missing directories
 */
async function copyTemplateFiles(appDirectory, options) {
	const files = await getTemplateFiles();

	/*
	TODO: Make this a bit smarter. Merge/Update files?
	i.e. Readme.md should only update it's section or append to current readme.md if it exists.
	.eslintrc, config/* should merge.
	*/

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
		})
	);
}

module.exports = copyTemplateFiles;
