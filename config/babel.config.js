const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const appPkg = require(appDirectory + '/package.json');
const pkg = require('../package.json');

module.exports = {
	babelrc: false,
	plugins: [require('babel-plugin-preval')],
	presets: [
		[
			require('babel-preset-env'),
			{
				targets: {
					browsers: appPkg.browserlist || pkg.browserlist
				},
				modules: false
			}
		]
	]
};
