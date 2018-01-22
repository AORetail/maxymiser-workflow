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

function parseMaxymiserBody(response) {
	// eslint-disable-next-line no-unused-vars
	let mmRequestCallbacks = {
		0: function(x) {
			return x;
		}
	};
	// eslint-disable-next-line no-eval
	let body = eval(response);
	return body;
}

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
				body = parseMaxymiserBody(body);
				resolve(body);
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
				console.log(chalk.red(relFile, writeErr));
			} else {
				console.log(chalk.green(`Writing: ${relFile}`));
				fs.writeFileSync(outFile, contents);
			}
			resolve();
		});
	});
}

function shouldWriteFile({name, file, data }) {
	if (fs.existsSync(file) && data === fs.readFileSync(file).toString()){
		console.log(chalk.green(`File unchanged: ${name}`));
		return false;
	}
	return true;
}

/**
 * Interactive extraction of assets from file.
 */
async function extract() {
	const configFile = path.resolve(configDir, 'maxymiser-workflow.json');
	const configData = require(configFile);

	let campaign = configData.campaign || packageJson.name;
	let answers = {};

	answers = await inquirer.prompt([
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

	let allFiles = [];

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
		if (scriptsToExtract.includes(name)) {
			const outFile = path.resolve(srcDir, `global/${name}.js`);
			allFiles.push({ file: outFile, data: data });
		} else {
			configData.globalUnextracted[name] = data;
		}
	});

	// Select Campaign if none specified
	let campaignList = resp.Campaigns.map(x => x.Name);
	answers = await inquirer.prompt([
		{
			name: 'campaign',
			type: 'list',
			message: 'Campaign to extract',
			choices: campaignList,
			default: campaign || campaignList[0]
		}
	]);
	campaign = answers.campaign;
	configData.campaign = campaign;

	// Get variants of requested campaign
	const variants = [];
	const camp = resp.Campaigns.find(x => x.Name === campaign);
	if (camp) {
		if (camp.Scripts) {
			camp.Scripts.forEach(function(sc) {
				const { Name: name, Data: data, Order: order } = sc;
				configData.orderMap[name] = order;
				const relFile = `campaignScripts/${name}.js`;
				const outFile = path.resolve(srcDir, relFile);
				allFiles.push({ name: relFile, file: outFile, data: data });
			});
		}

		if (camp.Elements) {
			camp.Elements.forEach(function(element) {
				if (element.Data) {
					let variant = element.VariantName;
					variants.push(variant);
					element.Data.forEach(function(d) {
						let type = d.Type.toLowerCase();
						if (type === 'script' || type === 'css') {
							let ext = type === 'css' ? 'scss' : 'js';
							let relFile = `variants/${variant}.${ext}`;
							const outFile = path.resolve(srcDir, relFile);
							allFiles.push({
								name: relFile,
								file: outFile,
								data: d.Data
							});
						}
					});
				}
			});
		}
	}

	// prompt for overwrites

	// remove unchanged files
	allFiles = allFiles.filter(shouldWriteFile);

	let filesThatExist = allFiles.filter(({ file }) => fs.existsSync(file));
	let deDot = function(str) {
		return str.replace(/\./gm, '');
	};

	answers = await inquirer.prompt(
		filesThatExist.map(({ name }) => {
			return {
				name: `${deDot(name)}`,
				message: `Overwrite ${name}?`,
				type: 'confirm',
				default: true
			};
		})
	);

	let filesToWrite = allFiles.filter(({ name }) => {
		let answerKey = deDot(name);
		return answers.hasOwnProperty(answerKey) ? answers[answerKey] : true;
	});

	configData.SiteInfo = resp.SiteInfo;

	filesToWrite.push({
		name: path.relative(appDirectory, configFile),
		file: configFile,
		data: JSON.stringify(configData, null, 2)
	});

	filesToWrite = filesToWrite.filter(shouldWriteFile);

	const allFilesPromises = filesToWrite.map(({ file, data }) =>
		writeFile(file, data)
	);


	return new Promise(function(resolve, reject) {
		Promise.all(allFilesPromises).then(() => {
			resolve(variants);
		});
	});
}

module.exports = extract;
module.exports.parseMaxymiserBody = parseMaxymiserBody;
