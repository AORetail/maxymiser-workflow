const autoprefixer = require('autoprefixer');
const babel = require('babel-core');
const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const path = require('path');
const postcss = require('postcss');
const sass = require('node-sass');

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



const srcDir = path.resolve(appDirectory, 'src');
const distDir = path.resolve(appDirectory, 'dist');

glob('**/*.js', { cwd: srcDir }, function(er, files) {
	files.forEach(function(file) {
		var filePath = path.resolve(srcDir, file);
		// console.log(chalk.blue(filePath));
		babel.transformFile(filePath, {}, function(err, result) {
			if (err){
				console.log(chalk.red(filePath, err));
			} else {
				var outFile = path.resolve(distDir, file);
				mkdirp(path.dirname(outFile), function(writeErr) {
					if (writeErr) {
						console.log(chalk.red(filePath, writeErr));
					} else {
						console.log(chalk.green(`Writing: ${file} → ${path.basename(outFile)}`));
						fs.writeFileSync(outFile, result.code);
					}
				});
			}
		});
	});
});

glob('**/[^_]*.scss', { cwd: srcDir }, function(er, files) {
	var processor = postcss([autoprefixer]);

	files.forEach(function(file) {
		var filePath = path.resolve(srcDir, file);
		var compiledCss = sass.renderSync(Object.assign({
			file: filePath
		}, scssSettings)).css.toString();

		var processedCss = processor.process(compiledCss).css;

		var outFile = path.resolve(distDir, file.replace(/\.scss$/i, '.css'));
		mkdirp(path.dirname(outFile), function(writeErr) {
			if (writeErr) {
				console.log(chalk.red(filePath, writeErr));
			} else {
				console.log(chalk.green(`Writing: ${file} → ${path.basename(outFile)}`));
				fs.writeFileSync(outFile, processedCss);
			}
		});
	}, this);
});
