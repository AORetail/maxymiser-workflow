const glob = require('glob');
const path = require('path');

async function getVariants(appDirectory, srcDir) {
	return new Promise(function(resolve, reject) {
		glob(
			'./variants/*.@(js|scss)',
			{
				cwd: srcDir
			},
			function(er, files) {
				if (files.length > 0) {
					const variants = files.reduce(function(acc, file) {
						var filePath = path.resolve(srcDir, file);
						var ext = path.extname(filePath).substring(1);
						var baseName = path.basename(
							filePath,
							path.extname(filePath)
						);
						if (!acc.hasOwnProperty(baseName)) {
							acc[baseName] = [];
						}
						acc[baseName].push({
							ext,
							filePath: path
								.relative(appDirectory, filePath)
								.replace(/\\/gim, '/')
						});
						return acc;
					}, {});
					Object.keys(variants).forEach(k => {
						variants[k].sort((a, b) => {
							if (a.ext === b.ext) {
								return 0;
							} else if (a.ext === 'scss') {
								return -1;
							}

							return 1;
						});
					});
					resolve(variants);
				} else {
					// console.log(chalk.red(`Variant ${variant} dosn't exist: Can't find "${variant}.js" or "${variant}.scss"`));
					resolve([]);
				}
			}
		);
	});
}

async function getGlobalScripts(appDirectory, srcDir) {
	return new Promise(function(resolve, reject) {
		glob(
			'./global/*.@(js)',
			{
				cwd: srcDir
			},
			function(er, files) {
				if (files.length > 0) {
					const campaignFiles = files.map(function(file) {
						let filePath = path.resolve(srcDir, file);
						let ext = path.extname(filePath).substring(1);
						let name = path.basename(
							filePath,
							path.extname(filePath)
						);
						return {
							ext,
							filePath: path
								.relative(appDirectory, filePath)
								.replace(/\\/gim, '/'),
							name
						};
					});
					resolve(campaignFiles);
				} else {
					// console.log(chalk.red(`Variant ${variant} dosn't exist: Can't find "${variant}.js" or "${variant}.scss"`));
					resolve([]);
				}
			}
		);
	});
}

async function getCampaignScripts(appDirectory, srcDir) {
	return new Promise(function(resolve, reject) {
		glob(
			'./campaignScripts/*.@(js)',
			{
				cwd: srcDir
			},
			function(er, files) {
				if (files.length > 0) {
					const campaignFiles = files.map(function(file) {
						var filePath = path.resolve(srcDir, file);
						var ext = path.extname(filePath).substring(1);
						var name = path.basename(
							filePath,
							path.extname(filePath)
						);
						return {
							ext,
							filePath: path
								.relative(appDirectory, filePath)
								.replace(/\\/gim, '/'),
							name
						};
					});
					resolve(campaignFiles);
				} else {
					// console.log(chalk.red(`Variant ${variant} dosn't exist: Can't find "${variant}.js" or "${variant}.scss"`));
					resolve([]);
				}
			}
		);
	});
}

module.exports = {
	getGlobalScripts,
	getCampaignScripts,
	getVariants
};
