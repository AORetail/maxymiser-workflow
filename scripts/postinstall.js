const fs = require('fs');
const path = require('path');

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
	// eslint-disable-next-line no-empty
} catch (error) {
}
