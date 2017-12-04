const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const mkdirp = require('mkdirp');
const minimist = require('minimist');

const templateDirectory = path.resolve(__dirname, '../template');
const appDirectory = fs.realpathSync(process.cwd());

/**
 * Update package.json
 */
function updatePackageJson(argv) {
	const appPkgPath = path.resolve(appDirectory, 'package.json');
	if (fs.existsSync(appPkgPath)) {
		let appPkg = JSON.parse(fs.readFileSync(appPkgPath));

		if (!appPkg.hasOwnProperty('scripts')) {
			appPkg.scripts = {};
		}

		const workflowScripts = {
			init: 'maxymiser-workflow init',
			generate: 'maxymiser-workflow generate',
			watch: 'maxymiser-workflow watch',
			build: 'maxymiser-workflow build'
		};
		let scripts = appPkg.scripts;
		Object.keys(workflowScripts).forEach(function(prop) {
			const altScriptName = `maxymiser-workflow-${prop}`;
			if (!scripts.hasOwnProperty(prop)) {
				console.log(chalk.green(`Adding script: "${prop}"`));
				scripts[prop] = workflowScripts[prop];
			} else if (scripts[prop] !== workflowScripts[prop] && !scripts.hasOwnProperty(altScriptName)) {
				console.log(chalk.green(`Adding script: "${altScriptName}" ("${prop}" already in use)`));
				scripts[altScriptName] = workflowScripts[prop];
			}
		});

		if (!appPkg.hasOwnProperty('maxymiser-workflow')) {
			appPkg['maxymiser-workflow'] = {};
		}

		const workflowDefaults = {
			campaign: argv.campaign || appPkg.name
		};
		let workflowConfig = appPkg['maxymiser-workflow'];
		Object.keys(workflowDefaults).forEach(function(prop) {
			if (!workflowConfig.hasOwnProperty(prop)) {
				workflowConfig[prop] = workflowDefaults[prop];
			}
		});

		fs.writeFileSync(appPkgPath, JSON.stringify(appPkg, null, 2));
	}
}

/**
 * Copy template files over. Only populate empty or missing directories
 */
function copyTemplateFiles(argv) {
	let populateDirs = new Set();
	glob('**/**', { cwd: templateDirectory, dot: true }, function(er, files) {
		// console.log(files);
		files.forEach(function(file) {
			var inFile = path.resolve(templateDirectory, file);
			var outFile = path.resolve(appDirectory, file);
			const inFileStats = fs.statSync(inFile);
			if (inFileStats.isDirectory()){
				if (!fs.existsSync(outFile) || fs.readdirSync(outFile).length === 0){
					populateDirs.add(outFile);
				}
			} else if (inFileStats.isFile() && (argv.force || populateDirs.has(path.dirname(outFile)))){
				console.log(chalk.blue(`Copying ${file}`));
				var inFileContents = fs.readFileSync(inFile);
				mkdirp(path.dirname(outFile), function(writeErr) {
					if (writeErr) {
						console.log(chalk.red(outFile, writeErr));
					} else {
						fs.writeFileSync(outFile, inFileContents);
					}
				});
			}
		});
	});
}

const helpText = `
Useage:
  $0 [options]
Options:
  -h, --help      Print usage Information.
  -f, --force     Forces copying of initial files.
  -c, --campaign  Campaign name (will default to package name).
`;

function main(argv) {
	if (argv.help){
		console.log(helpText);
	} else {
		updatePackageJson(argv);
		copyTemplateFiles(argv);
	}
}

const args = process.argv.slice(2);
const argv = minimist(args, {
	boolean: ['force', 'help'],
	string: ['campaign'],
	default: {
		help: false,
		force: false
	},
	alias: {
		c: 'campaign',
		f: 'force'
	}
});
main(argv);
