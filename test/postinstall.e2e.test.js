const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const spawn = require('cross-spawn');
const utils = require('./utils');

require('timers');

const appDirectory = fs.realpathSync(process.cwd());
const tempDir = path.resolve(appDirectory, 'temp');

describe('postinstall', function() {
	let dirControl = utils.directoryControl(tempDir, 'postinstall');

	let subDir;

	let expectedScripts = [
		'init-workflow',
		'generate',
		'watch',
		'extract',
		'build'
	];
	let child;

	before(function(done) {
		process.chdir(appDirectory);
		dirControl.create().then(function() {
			subDir = path.resolve(
				dirControl.dir,
				'mock_node_modules/maxymiser-workflow'
			);

			mkdirp(subDir, function() {
				process.chdir(subDir);
				done();
			});
		});
	});

	describe('Adds scripts to package.json (firstrun)', function() {
		let scripts;
		before(function(done) {
			fs.writeFileSync(
				path.resolve(dirControl.dir, 'package.json'),
				'{}'
			);
			child = spawn(
				'node',
				[path.resolve(appDirectory, 'scripts/postinstall')],
				{ cwd: subDir }
			);
			child.stdout.on('end', function() {
				let pkg = utils.getPackageJson(dirControl.dir);
				expect(pkg.hasOwnProperty('scripts')).to.be.equal(true);
				scripts = pkg.scripts;
				done();
			});
		});

		expectedScripts.forEach(function(s) {
			it(`has ${s}`, function() {
				expect(scripts.hasOwnProperty(s)).to.be.equal(true);
			});
		});
	});

	describe('Adds scripts to package.json (already defined and same)', function() {
		let scripts;
		before(function(done) {
			fs.writeFileSync(
				path.resolve(dirControl.dir, 'package.json'),
				`{
					"scripts": {
					  "init-workflow": "maxymiser-workflow init-workflow",
					  "generate": "maxymiser-workflow generate",
					  "watch": "maxymiser-workflow watch",
					  "extract": "maxymiser-workflow extract",
					  "build": "maxymiser-workflow build"
					}
				  }`
			);
			child = spawn(
				'node',
				[path.resolve(appDirectory, 'scripts/postinstall')],
				{ cwd: subDir }
			);
			child.stdout.on('end', function() {
				let pkg = utils.getPackageJson(dirControl.dir);
				expect(pkg.hasOwnProperty('scripts')).to.be.equal(true);
				scripts = pkg.scripts;
				done();
			});
		});

		expectedScripts.forEach(function(s) {
			it(`has ${s}`, function() {
				expect(scripts.hasOwnProperty(s)).to.be.equal(true);
			});
		});

		expectedScripts
			.map(s => `maxymiser-workflow-${s}`)
			.forEach(function(s) {
				it(`doesn't have ${s}`, function() {
					expect(scripts.hasOwnProperty(s)).to.be.equal(false);
				});
			});
	});

	describe('Adds scripts to package.json (already defined and not same)', function() {
		let scripts;
		before(function(done) {
			fs.writeFileSync(
				path.resolve(dirControl.dir, 'package.json'),
				`{
					"scripts": {
					  "init-workflow": "maxymiser-workflow init-workflow && DIFFERENT",
					  "generate": "maxymiser-workflow generate && DIFFERENT",
					  "watch": "maxymiser-workflow watch && DIFFERENT",
					  "extract": "maxymiser-workflow extract && DIFFERENT",
					  "build": "maxymiser-workflow build && DIFFERENT"
					}
				  }`
			);
			child = spawn(
				'node',
				[path.resolve(appDirectory, 'scripts/postinstall')],
				{ cwd: subDir }
			);
			child.stdout.on('end', function() {
				let pkg = utils.getPackageJson(dirControl.dir);
				expect(pkg.hasOwnProperty('scripts')).to.be.equal(true);
				scripts = pkg.scripts;
				done();
			});
		});

		expectedScripts.forEach(function(s) {
			it(`has ${s}`, function() {
				expect(scripts.hasOwnProperty(s)).to.be.equal(true);
			});
		});

		expectedScripts
			.map(s => `maxymiser-workflow-${s}`)
			.forEach(function(s) {
				it(`has ${s}`, function() {
					expect(scripts.hasOwnProperty(s)).to.be.equal(true);
				});
			});
	});

	after(function(done) {
		process.chdir(appDirectory);
		dirControl.destroy().then(done);
	});
});
