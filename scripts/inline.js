var babel = require('babel-core');
var sass = require('node-sass');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');
var scssSettings = require('../config/scss-settings');
const path = require('path');

function js(file) {
	file = path.resolve(__dirname, file);
	return babel.transformFileSync(file).code;
}

function scss(file) {
	file = path.resolve(__dirname, file);
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
