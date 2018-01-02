const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const updatePakageScripts = require('./inc/update-package-scripts');

const startCwd = fs.realpathSync(process.cwd());
let cwd = startCwd;
try {
	cwd = path.resolve(cwd, '..');
	while (!fs.existsSync(path.resolve(cwd, 'package.json'))) {
		let prevCwd = cwd;
		cwd = path.resolve(cwd, '..');

		if (cwd === prevCwd) {
			throw new Error('package.json not found');
		}
	}

	updatePakageScripts(cwd);
} catch (error) {
	cwd = false;
	console.log(error);
}
/*
if (cwd) {
	const initScripts = [
		path.resolve(startCwd, './scripts/init'),
		path.resolve(startCwd, './scripts/generate'),
		path.resolve(startCwd, './scripts/build')
	];

	initScripts.forEach(function(script) {
		const result = spawn.sync('node', [script], { stdio: 'inherit', cwd });
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
	});
}
*/
