const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
// const mkdirp = require('mkdirp');
const path = require('path');
const template = require('./inc/template_cg_v5');
const packageJson = require('../package.json');

var args = process.argv.slice(2);

const srcDir = path.resolve(__dirname, '../src');
async function getVariants() {
	return new Promise(function(resolve, reject) {
		glob('./variants/*.@(js|scss)', { cwd: srcDir }, function(er, files) {
			if (files.length > 0) {
				const variants = files.reduce(function(acc, file) {
					var filePath = path.resolve(srcDir, file);
					var ext = path.extname(filePath).substring(1);
					var baseName = path.basename(filePath, path.extname(filePath));
					if (!acc.hasOwnProperty(baseName)) {
						acc[baseName] = [];
					}
					acc[baseName].push({
						ext,
						filePath: path.relative(__dirname, filePath).replace(/\\/gmi, '/')
					});
					return acc;
				}, {});
				resolve(variants);
			} else {
				// console.log(chalk.red(`Variant ${variant} dosn't exist: Can't find "${variant}.js" or "${variant}.scss"`));
				resolve([]);
			}
		});
	});
}

async function getCampaignScripts() {
	return new Promise(function(resolve, reject) {
		glob('./campaignScripts/*.@(js|scss)', { cwd: srcDir }, function(er, files) {
			if (files.length > 0) {
				const campaignFiles = files.map(function(file) {
					var filePath = path.resolve(srcDir, file);
					var ext = path.extname(filePath).substring(1);
					var name = path.basename(filePath, path.extname(filePath));
					return {
						ext,
						filePath: path.relative(__dirname, filePath).replace(/\\/gmi, '/'),
						name
					};
				});
				resolve(campaignFiles);
			} else {
				// console.log(chalk.red(`Variant ${variant} dosn't exist: Can't find "${variant}.js" or "${variant}.scss"`));
				resolve([]);
			}
		});
	});
}

async function generateVariant(variant, variantFiles) {
	console.log(`Generating ${variant}`);

	let campaign = packageJson.name;
	if (packageJson['maxymiser-workflow'] && packageJson['maxymiser-workflow'].campaign){
		campaign = packageJson['maxymiser-workflow'].campaign;
	}

	let campaignFiles = await getCampaignScripts();

	var options = {
		campaign: campaign,
		campaignFiles: campaignFiles,
		variant,
		variantFiles
	};

	return fs.writeFileSync(path.resolve(__dirname, 'replace_cg_v5.js'), template(options));
}

async function main(variant) {
	const variants = await getVariants();

	if (variants.length === 0){
		console.log(chalk.red('No variants exist'));
		return;
	}
	const foundVariants = Object.keys(variants).sort();
	let defaultVariant = foundVariants[0];

	if (variant) {
		if (!variants[variant]) {
			console.log(chalk.red(`Invalid variant "${variant}": Please choose from "${foundVariants.join(', ')}"`));
		} else {
			generateVariant(variant, variants[variant]);
		}
	} else if (foundVariants.length > 0) {
		generateVariant(defaultVariant, variants[defaultVariant]);
	} else {
		console.log(chalk.red('No variants found'));
	}
}

main(args[0]);

// if(variant){

// }else{
// 	console.log(chalk.red('please provide a variant name'));
// }
