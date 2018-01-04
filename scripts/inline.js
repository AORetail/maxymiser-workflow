const babel = require('babel-core');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const scssSettings = require(appDirectory + '/config/scss-settings');

const babelOptions = require('../config/babel.config');

/**
 * Use Babel to transform the JS file.
 * @param {string} file File path relative to app.
 */
function js(file) {
	file = path.resolve(appDirectory, file);
	return babel.transformFileSync(file, babelOptions).code;
}

/**
 * Use SASS & PostCSS to process styles.
 * @param {string} file File path relavite to app
 */
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

/**
 * Just read the file and pass it on through.
 * @param {string} file File path relavite to app
 */
function passThru(file) {
	let filePath = path.resolve(appDirectory, file);
	const fileStats = fs.statSync(filePath);
	if (fileStats.isDirectory()) {
		throw new Error(`${file} is a directory`);
	}
	return fs.readFileSync(filePath);
}

const typeMap = {
	js: js,
	css: scss,
	scss: scss
};

/**
 * Processes the File for inlining.
 * type can be provided to specify how to process.
 * @param {string} file File path relavite to app
 * @param {string} type (optional) How to process ['js', 'scss', 'css']. If ommited it will try to detect from file-extension. If not a valid type it will just read and pass the file contents through.
 */
function inline(file, type){
	type = typeof type === 'string' ? type.toLowerCase() : '';

	if (!type){
		type = path.extname(file).toLowerCase();
		if (type.startsWith('.')){
			type = type.substr(1);
		}
	}

	const func = typeMap.hasOwnProperty(type) ? typeMap[type] : passThru;

	return func(file);
}


module.exports = {
	js,
	scss,
	inline
};
