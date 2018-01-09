const http = require('https');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const inquirer = require('inquirer');

const appDirectory = fs.realpathSync(process.cwd());
const packageJson = require(path.resolve(appDirectory, 'package.json'));

const srcDir = path.resolve(appDirectory, 'src');
const configDir = path.resolve(appDirectory, 'config');

/**
 * Gets the script fromm the url and strips off unneeded jquery callback.
 *
 * @param {string} url
 */
async function extractFromUrl(url) {
	return new Promise(function(resolve, reject) {
		var request = http.get(url, function(res) {
			var body = '';

			if (res.statusCode !== 200) {
				reject('Response status was ' + res.statusCode);
			}

			res.on('data', function(chunk) {
				body += chunk;
			});

			res.on('end', function() {
				const st = 'mmRequestCallbacks[0]('.length;
				const ed = body.length - ');'.length;
				body = body.substring(st, ed);
				resolve(JSON.parse(body));
			});
		});

		request.on('error', function(err) {
			reject(err);
		});
	});
}

function writeFile(outFile, contents) {
	return new Promise(function(resolve, reject) {
		let relFile = path.relative(appDirectory, outFile);
		mkdirp(path.dirname(outFile), function(writeErr) {
			if (writeErr) {
				console.log(
					chalk.red(relFile, writeErr)
				);
			} else {
				console.log(
					chalk.green(
						`Writing: ${relFile}`
					)
				);
				fs.writeFileSync(outFile, contents);
			}
			resolve();
		});
	});
}

/**
 * Interactive extraction of assets from file.
 */
async function extract() {
	const configFile = path.resolve(configDir, 'maxymiser-workflow.json');
	const configData = require(configFile);

	let campaign = configData.campaign || packageJson.name;

	let answers = await inquirer.prompt([
		{
			name: 'url',
			type: 'input',
			message:
				'Url to extract from' +
				(configData.extractUrl ? ' (leave empty to use last)' : ''),
			validate: function(val) {
				const validExp = /^https?:\/\/service\.maxymiser\.net\/cg\/v5\//;
				console.log(val, validExp.test(val));
				if (val.length && !validExp.test(val)) {
					return 'URL Must match https?://service.maxymiser.net/cg/v5/';
				}
				return val.length || configData.extractUrl
					? true
					: 'Please enter a url';
			}
		}
	]);

	let url = answers.url || configData.extractUrl;
	configData.extractUrl = url;

	const resp = await extractFromUrl(url);

	if (!configData.hasOwnProperty('ordermap')) {
		configData.orderMap = {};
	}

	const allFiles = [];

	answers = await inquirer.prompt([
		{
			name: 'extractScripts',
			message: 'Global Scripts to extract',
			type: 'checkbox',
			choices: resp.Scripts.map(s => ({ name: s.Name }))
		}

	]);
	let scriptsToExtract = answers.extractScripts;
	configData.globalUnextracted = {};

	// Global scripts
	resp.Scripts.forEach(function(sc) {
		const { Name: name, Data: data, Order: order } = sc;

		configData.orderMap[name] = order;
		if (scriptsToExtract.includes(name)){
			const outFile = path.resolve(srcDir, `global/${name}.js`);
			allFiles.push({ file: outFile, data: data });
		} else {
			configData.globalUnextracted[name] = data;
		}
	});

	// Select Campaign if none specified
	let campaignList = resp.Campaigns.map(x => x.Name);
	if (campaignList.indexOf(campaign) === -1) {
		answers = await inquirer.prompt([
			{
				name: 'campaign',
				type: 'list',
				message: 'Campaign to extract',
				choices: campaignList
			}
		]);
		campaign = answers.campaign;
	}
	configData.campaign = campaign;

	// Get variants of requested campaign
	const variants = [];
	const camp = resp.Campaigns.find(x => x.Name === campaign);
	if (camp) {
		camp.Scripts.forEach(function(sc) {
			const { Name: name, Data: data, Order: order } = sc;
			// console.dir(data);
			configData.orderMap[name] = order;
			const outFile = path.resolve(srcDir, `campaignScripts/${name}.js`);
			allFiles.push({ file: outFile, data: data });
		});
		camp.Elements.forEach(function(element) {
			let variant = element.VariantName;
			variants.push(variant);
			element.Data.forEach(function(d) {
				let type = d.Type.toLowerCase();
				if (type === 'script' || type === 'css') {
					let ext = type === 'css' ? 'scss' : 'js';
					const outFile = path.resolve(
						srcDir,
						`variants/${variant}.${ext}`
					);
					allFiles.push({ file: outFile, data: d.Data });
				}
			});
		});
	}

	// prompt for overwrites

	let filesThatExist = allFiles.filter(({ file }) => fs.existsSync(file));

	answers = await inquirer.prompt(filesThatExist.map(({ file }) => {
		let relFile = path.relative(appDirectory, file);
		return {
			name: relFile,
			message: `Overwrite ${relFile}?`,
			type: 'confirm',
			default: true
		};
	}));

	const filesToWrite = allFiles.filter(async ({ file }) => answers.hasOwnProperty(file)  ? answers[file] : true);

	configData.SiteInfo = resp.SiteInfo;

	filesToWrite.push({ file: configFile, data: JSON.stringify(configData, null, 2) });

	const allFilesPromises = filesToWrite.map(({ file, data }) => writeFile(file, data));

	return new Promise(function(resolve, reject) {
		Promise.all(allFilesPromises).then(() => {
			resolve(variants);
		});
	});
}

module.exports = extract;
