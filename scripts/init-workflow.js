const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const updatePakageScripts = require('./inc/update-package-scripts');
const copyTemplateFiles = require('./inc/copy-template-files');
const spawn = require('cross-spawn');

const extract = require('./inc/extract');

const appDirectory = fs.realpathSync(process.cwd());
const appPkg = require(path.resolve(appDirectory, 'package.json'));

const helpText = `
Useage:
  $0 [options]
Options:
  -h, --help      Print usage Information.
  -t, --template  Copy template files.
  -f, --force     Forces copying of template files (will overwrite).
  -c, --campaign  Campaign name (will default to package name).
`;

function spawnGenerate(variant){
	const result = spawn.sync('node', [path.resolve(__dirname, './generate'), variant ? `--variant=${variant}` : '--auto'], { stdio: 'inherit', cwd: appDirectory });
	if (result.signal) {
		if (result.signal === 'SIGKILL') {
			console.log(
				'The build failed because the process exited too early. ' +
					'This probably means the system ran out of memory or someone called ' +
					'`kill -9` on the process.'
			);
		} else if (result.signal === 'SIGTERM') {
			console.log(
				'The build failed because the process exited too early. ' +
					'Someone might have called `kill` or `killall`, or the system could ' +
					'be shutting down.'
			);
		}
		process.exit(1);
	}
}

async function main(argv) {
	if (argv.help){
		console.log(helpText);
	} else {
		updatePakageScripts(appDirectory);

		await copyTemplateFiles(appDirectory, argv);

		const campaign = argv.campaign;
		const configDir = path.resolve(appDirectory, 'config');
		const configFile = path.resolve(configDir, 'maxymiser-workflow.json');
		const config = require(configFile);
		config.campaign = campaign;
		fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

		let variant;
		if (!argv.template && !argv.force){
			let variants = await extract();
			if (variants.length > 0) {
				variant = variants[0];
			}
		}

		spawnGenerate(variant);
	}
}

const args = process.argv.slice(2);
const argv = minimist(args, {
	boolean: ['force', 'help', 'template'],
	string: ['campaign'],
	default: {
		help: false,
		force: false,
		template: false,
		campaign: appPkg.name
	},
	alias: {
		h: 'help',
		c: 'campaign',
		f: 'force',
		t: 'template'
	}
});

main(argv);
