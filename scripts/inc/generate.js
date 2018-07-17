const glob = require('glob');
const path = require('path');

async function getVariants(appDirectory, srcDir) {
	return new Promise(function(resolve, reject) {
		glob(
			'./variants/*.@(js|scss|html)',
			{
				cwd: srcDir
			},
			function(er, files) {
				if (files.length > 0) {
					let order = ['scss', 'html', 'js'];

					const variants = files.reduce(function(acc, file) {
						var filePath = path.resolve(srcDir, file);
						var ext = path
							.extname(filePath)
							.toLowerCase()
							.substring(1);
						let priority = order.indexOf(ext);

						if (priority !== -1) {
							var baseName = path.basename(
								filePath,
								path.extname(filePath)
							);
							if (!acc.hasOwnProperty(baseName)) {
								acc[baseName] = [];
							}
							acc[baseName].push({
								ext,
								priority,
								filePath: path
									.relative(appDirectory, filePath)
									.replace(/\\/gim, '/')
							});
						}

						return acc;
					}, {});

					Object.keys(variants).forEach(k => {
						variants[k].sort((a, b) => {
							return a.priority - b.priority;
						});
						variants[k].forEach(f => delete f.priority);
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
