const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');

function directoryControl(tempDir, dirPath){
	let controlledDir = path.resolve(tempDir, dirPath);
	return {
		get dir(){
			return controlledDir;
		},
		create(){
			return new Promise(function(resolve, reject){
				rimraf(controlledDir, function(){
					mkdirp(controlledDir, function(err){
						if (err){
							reject(err);
						} else {
							resolve(controlledDir);
						}
					});
				});
			});
		},
		destroy(){
			return new Promise(function(resolve, reject){
				rimraf(controlledDir, function(){
					if (fs.readdirSync().length > 0){
						resolve();
					} else {
						rimraf(tempDir, resolve);
					}
				});
			});
		}
	};
}

module.exports = {
	directoryControl
};
