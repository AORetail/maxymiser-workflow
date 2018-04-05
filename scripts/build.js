const autoprefixer = require('autoprefixer');
const babel = require('babel-core');
const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const minimist = require('minimist');
const mkdirp = require('mkdirp');
const path = require('path');
const postcss = require('postcss');
const sass = require('node-sass');
const uglifyJS = require('uglify-js');

const appDirectory = fs.realpathSync(process.cwd());

const babelOptions = require('../config/babel.config');

function build(dir, minify) {
	const scssSettings = require(dir + '/config/scss-settings');
	const srcDir = path.resolve(dir, 'src');
	const distDir = path.resolve(dir, 'dist');

	glob('**/*.js', { cwd: srcDir }, function(er, files) {
		files.forEach(function(file) {
			var filePath = path.resolve(srcDir, file);
			// console.log(chalk.blue(filePath));
			babel.transformFile(filePath, babelOptions, function(err, result) {
				if (err) {
					console.log(chalk.red(filePath, err));
				} else {
					var outFile = path.resolve(distDir, file);
					mkdirp(path.dirname(outFile), function(writeErr) {
						if (writeErr) {
							console.log(chalk.red(filePath, writeErr));
						} else {
							console.log(
								chalk.green(
									`Writing: ${file} → ${path.basename(
										outFile
									)}`
								)
							);
							let code = result.code;
							if (minify) {
								let uglyResults = uglifyJS.minify(code);
								if (uglyResults.error) {
									console.log(
										chalk.red(filePath, uglyResults.error)
									);
									return;
								}
								code = uglyResults.code;
							}
							fs.writeFileSync(outFile, code);
						}
					});
				}
			});
		});
	});

	glob('variants/**/[^_]*.scss', { cwd: srcDir }, function(er, files) {
		var processor = postcss([autoprefixer]);

		files.forEach(function(file) {
			var filePath = path.resolve(srcDir, file);
			var compiledCss = sass
				.renderSync(
					Object.assign(
						{
							file: filePath
						},
						scssSettings
					)
				)
				.css.toString();

			var processedCss = processor.process(compiledCss).css;

			var outFile = path.resolve(
				distDir,
				file.replace(/\.scss$/i, '.css')
			);
			mkdirp(path.dirname(outFile), function(writeErr) {
				if (writeErr) {
					console.log(chalk.red(filePath, writeErr));
				} else {
					console.log(
						chalk.green(
							`Writing: ${file} → ${path.basename(outFile)}`
						)
					);
					fs.writeFileSync(outFile, processedCss);
				}
			});
		}, this);
	});
}

const helpText = `
Useage:
  $0 [options]
Options:
  -h, --help         Print usage Information.
      --minify       Minify scripts (defaults to true).
`;

const args = process.argv.slice(2);
const argv = minimist(args, {
	boolean: ['help', 'minify'],
	alias: {
		h: 'help'
	},
	default: {
		help: false,
		minify: true
	}
});

console.log(argv);

if (argv.help) {
	console.log(helpText);
} else {
	build(appDirectory, argv.minify);
}
