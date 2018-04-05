/**
 * This script will generate the `replace_cg_v5.js` file for a given variant.
 * use `--help` for more info.
 */

const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const minimist = require('minimist');
const mkdirp = require('mkdirp');
const path = require('path');

const template = require('./inc/template_cg_v5');

const appDirectory = fs.realpathSync(process.cwd());

const packageJson = require(path.resolve(appDirectory, 'package.json'));

const srcDir = path.resolve(appDirectory, 'src');
const configDir = path.resolve(appDirectory, 'config');

const { getGlobalScripts, getCampaignScripts, getVariants } = require('./inc/generate');

/**
 * Collates relevant files to be injected into `template_cg_v5.js` to generate `replace_cg_v5.js`
 * @param {string} variant Variant Name
 * @param {Array <string>} variantFiles Array of variant files.
 */
async function generateVariant(variant, variantFiles, minify = false) {
	console.log(chalk.blue(`Generating ${variant}`));

	const config = require(path.resolve(configDir, 'maxymiser-workflow.json'));

	let campaign = config.campaign || packageJson.name;

	let globalFiles = await getGlobalScripts(appDirectory, srcDir);

	let campaignFiles = await getCampaignScripts(appDirectory, srcDir);

	var options = {
		globalFiles,
		campaign: campaign,
		campaignFiles: campaignFiles,
		variant,
		variantFiles,
		config,
		minify
	};

	return fs.writeFileSync(
		path.resolve(configDir, 'replace_cg_v5.js'),
		template(options)
	);
}

async function generateFromArgs(variant, minify) {
	const variants = await getVariants(appDirectory, srcDir);

	if (variants.length === 0) {
		console.log(chalk.red('No variants exist'));
		return;
	}
	const foundVariants = Object.keys(variants).sort();
	let defaultVariant = foundVariants[0];

	if (variant) {
		if (!variants[variant]) {
			console.log(
				chalk.red(
					`Invalid variant "${variant}": Please choose from "${foundVariants.join(
						', '
					)}"`
				)
			);
		} else {
			generateVariant(variant, variants[variant], minify);
		}
	} else if (foundVariants.length > 0) {
		generateVariant(defaultVariant, variants[defaultVariant]);
	} else {
		console.log(chalk.red('No variants found'));
	}
}

async function promptUser(minify) {
	const variants = await getVariants(appDirectory, srcDir);
	const foundVariants = Object.keys(variants).sort();
	const variantChoices = [...foundVariants, '* Create new'];

	let answers = await inquirer.prompt([
		{
			name: 'variant',
			type: 'list',
			message: 'Variant?',
			default: 0,
			choices: variantChoices
		}
	]);

	let variant = answers.variant;
	if (variant === '* Create new') {
		let index = 1;
		let defaultVariant = `variant${index++}`;
		while (foundVariants.indexOf(defaultVariant) > -1) {
			defaultVariant = `variant${index++}`;
		}
		answers = await inquirer.prompt([
			{
				name: 'variantName',
				type: 'input',
				message: 'New Name',
				default: defaultVariant,
				validate: function(value) {
					console.log(value);
					var pass = value.match(/^[\w\d]+$/i);
					if (!pass) {
						return 'Variants can only contain alpha-numeric characters [a-z0-9]';
					}

					if (foundVariants.indexOf(value) > -1) {
						return `Variant "${value}" already exists`;
					}

					return true;
				}
			},
			{
				name: 'includeCss',
				type: 'confirm',
				message: 'Include CSS?',
				default: true
			}
		]);

		variant = answers.variantName;
		variants[variant] = [];

		let includeCss = answers.includeCss;

		mkdirp.sync(path.resolve(srcDir, 'variants'));

		if (includeCss) {
			let cssFilePath = path.resolve(srcDir, `variants/${variant}.scss`);
			fs.writeFileSync(cssFilePath, '');
			variants[variant].push({
				ext: 'scss',
				filePath: path
					.relative(appDirectory, cssFilePath)
					.replace(/\\/gim, '/')
			});
		}

		let jsFilePath = path.resolve(srcDir, `variants/${variant}.js`);
		fs.writeFileSync(jsFilePath, includeCss ? 'dom.addCss(css);' : '');

		variants[variant].push({
			ext: 'js',
			filePath: path
				.relative(appDirectory, jsFilePath)
				.replace(/\\/gim, '/')
		});
	}

	generateVariant(variant, variants[variant], minify);
}

const helpText = `
Useage:
  $0 [options]
Options:
  -h, --help      Print usage Information.
  -v, --variant   Variant to want to generate for.
  -a, --auto      Uses first vaiant it finds.
      --minify    Minify scripts.
`;

const args = process.argv.slice(2);
const argv = minimist(args, {
	boolean: ['auto', 'minify'],
	string: ['variant'],
	alias: {
		h: 'help',
		a: 'auto',
		v: 'variant'
	},
	default: {
		help: false,
		auto: false,
		minify: false
	}
});

if (argv.help) {
	console.log(helpText);
} else if (argv.auto || argv.variant) {
	generateFromArgs(argv.variant, argv.minify);
} else {
	promptUser(argv.minify);
}
