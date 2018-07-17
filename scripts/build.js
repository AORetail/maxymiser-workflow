const chalk = require('chalk');
const fs = require('fs');
const minimist = require('minimist');
const mkdirp = require('mkdirp');
const path = require('path');

const {
	getGlobalScripts,
	getCampaignScripts,
	getVariants
} = require('./inc/generate');

const { inline } = require('./inline');

const appDirectory = fs.realpathSync(process.cwd());

async function build(dir, minify) {
	const srcDir = path.resolve(dir, 'src');
	const distDir = path.resolve(dir, 'dist');

	function buildIt(fileObject) {
		let { ext, filePath } = fileObject;
		let fullFilePath = path.resolve(appDirectory, filePath);
		var file = path.relative(srcDir, filePath);
		try {
			let code = '';
			inline(filePath, '', minify);
			var outFile = path.resolve(distDir, file);
			mkdirp(path.dirname(outFile), function(writeErr) {
				if (writeErr) {
					console.log(chalk.red(fullFilePath, writeErr));
				} else {
					console.log(
						chalk.green(
							`Writing: ${file} → ${path.basename(outFile)}`
						)
					);
					fs.writeFileSync(outFile, code);
				}
			});
		} catch (err) {
			console.log(chalk.red(fullFilePath, err));
		}
	}

	let globalFiles = await getGlobalScripts(appDirectory, srcDir);
	let campaignFiles = await getCampaignScripts(appDirectory, srcDir);
	const variants = await getVariants(appDirectory, srcDir);

	[...globalFiles, ...campaignFiles].forEach(buildIt);
	Object.entries(variants).forEach(function([variant, files]) {
		let snippet = files.reduce((text, fileObject) => {
			let { ext, filePath } = fileObject;
			let code = inline(filePath, ext, true);
			switch (ext) {
				case 'js':
					text += `<script>${code}</script>\n`;
					break;
				case 'scss':
					text += `<style>${code}</style>\n`;
					break;
				case 'html':
					text += code + '\n';
					break;
				default:
					break;
			}
			return text;
		}, '');

		var outFile = path.resolve(distDir, `variants/${variant}.html`);
		mkdirp(path.dirname(outFile), function(writeErr) {
			if (writeErr) {
				console.log(chalk.red(outFile, writeErr));
			} else {
				console.log(
					chalk.green(
						`Writing: ${variant} → ${path.basename(outFile)}`
					)
				);
				fs.writeFileSync(outFile, snippet);
			}
		});
	});
}

const helpText = `
Useage:
  $0 [options]
Options:
  -h, --help         Print usage Information.
      --minify       Minify scripts (defaults to true).
`;

const args = process.argv.slice(2);
const argv = minimist(args, {
	boolean: ['help', 'minify'],
	alias: {
		h: 'help'
	},
	default: {
		help: false,
		minify: true
	}
});

if (argv.help) {
	console.log(helpText);
} else {
	build(appDirectory, argv.minify);
}
