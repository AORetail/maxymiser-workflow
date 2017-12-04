const babel = require('babel-core');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const scssSettings = require(appDirectory + '/config/scss-settings');

const babelOptions = {
	babelrc: false,
	plugins: [require('babel-plugin-preval')],
	presets: [
		[
			require('babel-preset-env'),
			{
				modules: false
			}
		]
	]
};

function js(file) {
	file = path.resolve(appDirectory, file);
	return babel.transformFileSync(file, babelOptions).code;
}

function scss(file) {
	file = path.resolve(appDirectory, file);
	var processor = postcss([autoprefixer]);
	var compiledCss = sass
		.renderSync(
			Object.assign(
				{
					file: file
				},
				scssSettings
			)
		)
		.css.toString();

	var processedCss = processor.process(compiledCss).css;

	return processedCss;
}

module.exports = {
	js,
	scss
};
