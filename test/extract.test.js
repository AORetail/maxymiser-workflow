const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const parseMaxymiserBody = require('../scripts/inc/extract').parseMaxymiserBody;

describe('extract', function(){
	describe('parseMaxymiserBody', function(){
		console.log(__dirname);
		let body = fs.readFileSync(path.resolve(__dirname, 'mocks/extract-body.txt')).toString();
		let parsedBody = parseMaxymiserBody(body);

		it('should exist', function(){
			expect(parsedBody).to.exist;
		});

	});
});
