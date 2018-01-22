const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const spawn = require('cross-spawn');
const utils = require('./utils');

// const template = require('../scripts/inc/template_cg_v5');

const { getGlobalScripts, getCampaignScripts, getVariants } = require('../scripts//inc/generate');

const appDirectory = fs.realpathSync(process.cwd());
const tempDir = path.resolve(appDirectory, 'temp');

describe('generate', function(){
	describe('getGlobalScripts', function(){
		let dirControl = utils.directoryControl(
			tempDir,
			'getGlobalScripts'
		);

		let globalScripts;

		before(function(done){
			process.chdir(appDirectory);
			dirControl.create().then(async function() {
				process.chdir(dirControl.dir);

				let srcDir = path.resolve(dirControl.dir, 'src');
				let subDir = path.resolve(srcDir, 'global');

				mkdirp(subDir, async function() {
					fs.writeFileSync(path.resolve(subDir, 'global-1.js'), 'const global1 = true;\n\n');
					globalScripts = await getGlobalScripts(dirControl.dir, srcDir);
					done();
				});

			});
		});

		it('should have Global files', function(){
			expect(Array.isArray(globalScripts), 'globalScripts is not an Array').to.be.true;
			expect(globalScripts.length).to.equal(1, 'globalScripts should have a length of 1');

			expect(globalScripts[0]).to.eql(
				{
					ext: 'js',
					filePath: 'src/global/global-1.js',
					name: 'global-1'
				}
			);
		});

		after(function(done) {
			process.chdir(appDirectory);
			dirControl.destroy().then(done);
		});
	});

	describe('getCampaignScripts', function(){
		let dirControl = utils.directoryControl(
			tempDir,
			'getCampaignScripts'
		);

		let campaignScripts;

		before(function(done){
			process.chdir(appDirectory);
			dirControl.create().then(async function() {
				process.chdir(dirControl.dir);

				let srcDir = path.resolve(dirControl.dir, 'src');
				let subDir = path.resolve(srcDir, 'campaignScripts');

				mkdirp(subDir, async function() {
					fs.writeFileSync(path.resolve(subDir, 'campaign-script-1.js'), 'const campaignScript1 = true;\n\n');
					campaignScripts = await getCampaignScripts(dirControl.dir, srcDir);
					done();
				});

			});
		});

		it('should have Campaign files', function(){
			expect(Array.isArray(campaignScripts), 'campaignScripts is not an Array').to.be.true;
			expect(campaignScripts.length).to.equal(1, 'campaignScripts should have a length of 1');

			expect(campaignScripts[0]).to.eql(
				{
					ext: 'js',
					filePath: 'src/campaignScripts/campaign-script-1.js',
					name: 'campaign-script-1'
				}
			);
		});

		after(function(done) {
			process.chdir(appDirectory);
			dirControl.destroy().then(done);
		});
	});


	describe('getVariants', function(){
		let dirControl = utils.directoryControl(
			tempDir,
			'getVariants'
		);

		let variants;

		before(function(done){
			process.chdir(appDirectory);
			dirControl.create().then(async function() {
				process.chdir(dirControl.dir);

				let srcDir = path.resolve(dirControl.dir, 'src');
				let subDir = path.resolve(srcDir, 'variants');

				mkdirp(subDir, async function() {
					fs.writeFileSync(path.resolve(subDir, 'variant-1.js'), 'const variant1 = true;\n\n');
					fs.writeFileSync(path.resolve(subDir, 'variant-1.scss'), '.variant1 { color: red;}\n\n');
					fs.writeFileSync(path.resolve(subDir, 'variant-2.js'), 'const variant2 = true;\n\n');

					variants = await getVariants(dirControl.dir, srcDir);
					done();
				});

			});
		});

		it('should have variant files', function(){
			expect(Object.keys(variants)).to.eql(['variant-1', 'variant-2']);

			expect(variants).to.eql(
				{
					'variant-1': [
						{ ext: 'scss', filePath: 'src/variants/variant-1.scss' },
						{ ext: 'js', filePath: 'src/variants/variant-1.js' }
					],
					'variant-2': [
						{ ext: 'js', filePath: 'src/variants/variant-2.js' }
					] }
			);
		});

		it('should have scss before js', function(){
			let v = variants['variant-1'];
			expect(v[0].ext).to.equal('scss');
			expect(v[1].ext).to.equal('js');
		});

		after(function(done) {
			process.chdir(appDirectory);
			dirControl.destroy().then(done);
		});
	});
});

