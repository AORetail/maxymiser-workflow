const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Update package.json with required scripts
 * if the `script` already exists and is different from what would be written `maxymiser-workflow-script` will be used instead.
 */
function updatePackageScripts(appDirectory) {
	const appPkgPath = path.resolve(appDirectory, 'package.json');
	if (fs.existsSync(appPkgPath)) {
		let appPkg = JSON.parse(fs.readFileSync(appPkgPath));

		if (!appPkg.hasOwnProperty('scripts')) {
			appPkg.scripts = {};
		}

		const workflowScripts = {
			'init-workflow': 'maxymiser-workflow init-workflow',
			generate: 'maxymiser-workflow generate',
			watch: 'maxymiser-workflow watch',
			extract: 'maxymiser-workflow extract',
			build: 'maxymiser-workflow build'
		};
		let scripts = appPkg.scripts;
		Object.keys(workflowScripts).forEach(function(prop) {
			const altScriptName = `maxymiser-workflow-${prop}`;
			if (!scripts.hasOwnProperty(prop)) {
				console.log(chalk.green(`Adding script: "${prop}"`));
				scripts[prop] = workflowScripts[prop];
			} else if (
				scripts[prop] !== workflowScripts[prop] &&
				!scripts.hasOwnProperty(altScriptName)
			) {
				console.log(
					chalk.green(
						`Adding script: "${altScriptName}" ("${prop}" already in use)`
					)
				);
				scripts[altScriptName] = workflowScripts[prop];
			}
		});

		fs.writeFileSync(appPkgPath, JSON.stringify(appPkg, null, 2));
	} else {
		console.log(chalk.red(`package.json not found in ${appDirectory}`));
	}
}

module.exports = updatePackageScripts;
