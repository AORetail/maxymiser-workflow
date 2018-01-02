/* eslint-disable max-len */

function template({
	campaign,
	campaignFiles,
	variant,
	variantFiles,
	globalFiles = [],
	config = {}
}) {
	var orderIndex = 0;
	var orderMap = config.orderMap || {};

	globalFiles = globalFiles.map(function({ name, filePath, ext }, index) {
		return `
			{
				Name: '${name}',
				Type: 'script',
				Attrs: { type: 'text/javascript' },
				Data:preval\`module.exports = require("maxymiser-workflow/scripts/inline").js("${filePath}")\`,
				Order: ${
	orderMap.hasOwnProperty(name)
		? orderMap[name]
		: -50 * (globalFiles.length - index - 1)
},
				HighLevelApiVersion: '1.6'
			}`;
	});

	campaignFiles = campaignFiles
		.map(function({ name, filePath, ext }) {
			if (ext === 'js') {
				return `
					{
						Name: '${name}',
						Type: 'script',
						Attrs: { type: 'text/javascript' },
						Data: preval\`module.exports = require("maxymiser-workflow/scripts/inline").js("${filePath}")\`,
						Order: ${orderMap.hasOwnProperty(name) ? orderMap[name] : orderIndex++},
						HighLevelApiVersion: '1.6'
					}`;
			}
			return '';
		})
		.join(',\n');

	variantFiles = variantFiles
		.map(function({ name, filePath, ext }) {
			if (ext === 'js') {
				return `
								{
									Type: 'Script',
									Data: preval\`module.exports = require("maxymiser-workflow/scripts/inline").js("${filePath}")\`,
									Attrs: {}
								}`;
			} else if (ext === 'scss') {
				return `
								{
									Type: 'Css',
									Data: preval\`module.exports = require("maxymiser-workflow/scripts/inline").scss("${filePath}")\`,
									Attrs: {}
								}`;
			}

			return '';
		})
		.filter(function(str) {
			return str !== '';
		})
		.join(',\n');

	return `mmRequestCallbacks[0]({
		Scripts: [${globalFiles}
		],
		Campaigns: [
			{
				Name: '${campaign}',
				Type: 'ABnMVT',
				CSName: '',
				HighLevelApiVersion: '1.6',
				PagePrefix: '',
				Scripts: [${campaignFiles}
				],
				Elements: [
					{
						Name: 'element1',
						VariantName: '${variant}',
						HTMLId: 'Element1',
						Data: [${variantFiles}
						],
						Order: ${orderMap.hasOwnProperty(variant) ? orderMap[name] : orderIndex++}
					}
				],
				Recommendations: []
			}
		],
		MRRules: [],
		PersistData: [],
		SiteInfo: ${JSON.stringify(
		config.SiteInfo || [{ Url: 'your-domain.com', ID: 0 }]
	)},
		SystemData: [{ Version: '1.0', RequestId: 0, ResponseId: 346 }],
		GenInfo: {
			'${campaign}': { element1: '${variant}' }
		},
		ServerAttributes: {},
		Iteration: 'PFhWBOh_hVlzcx_qg-Ifq5OS0vw',
		Packages: ['mmpackage-1.6.js']
	});`;
}

module.exports = template;
