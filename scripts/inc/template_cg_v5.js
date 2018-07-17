/* eslint-disable max-len, indent */

function template({
	campaign,
	campaignFiles,
	variant,
	variantFiles,
	globalFiles = [],
	config = {},
	minify = false
}) {
	let orderIndex = 0;
	let orderMap = config.orderMap || {};
	const apiVersion = config.apiVersion || '1.13';
	const requestCallback = config.apiVersion || 'mmRequestCallbacks[0]';

	if (!config.hasOwnProperty('globalUnextracted')) {
		config.globalUnextracted = {};
	}

	let globalUnextracted = Object.entries(config.globalUnextracted).map(a => ({
		name: a[0],
		data: JSON.stringify(a[1])
	}));

	globalFiles = globalFiles
		.filter(({ name }) => !config.globalUnextracted.hasOwnProperty(name))
		.map(d => {
			d.data = `preval\`module.exports = require("maxymiser-workflow/scripts/inline").js("${
				d.filePath
			}", ${minify})\``;
			return d;
		});

	globalFiles = globalUnextracted
		.concat(globalFiles)
		.map(function({ name, data }, index) {
			return `
			{
				Name: '${name}',
				Type: 'script',
				Attrs: { type: 'text/javascript' },
				Data:${data},
				Order: ${
					orderMap.hasOwnProperty(name)
						? orderMap[name]
						: -50 * (globalFiles.length - index - 1)
				},
				HighLevelApiVersion: '${apiVersion}'
			}`;
		});

	let campaignUnextracted = Object.entries(config.campaignUnextracted).map(
		a => ({
			name: a[0],
			data: JSON.stringify(a[1])
		})
	);

	campaignFiles = campaignFiles
		.filter(({ name }) => !config.campaignUnextracted.hasOwnProperty(name))
		.map(d => {
			d.data = `preval\`module.exports = require("maxymiser-workflow/scripts/inline").js("${
				d.filePath
			}", ${minify})\``;
			return d;
		});

	campaignFiles = campaignUnextracted
		.concat(campaignFiles)
		.map(function({ name, data }) {
			return `
				{
					Name: '${name}',
					Type: 'script',
					Attrs: { type: 'text/javascript' },
					Data:${data},
					Order: ${orderMap.hasOwnProperty(name) ? orderMap[name] : orderIndex++},

					HighLevelApiVersion: '${apiVersion}'
				}`;
		})
		.join(',\n');

	variantFiles = variantFiles
		.map(function({ name, filePath, ext }) {
			if (ext === 'js') {
				return `
								{
									Type: 'Script',
									Data: preval\`module.exports = require("maxymiser-workflow/scripts/inline").js("${filePath}" ,${minify})\`,
									Attrs: {}
								}`;
			} else if (ext === 'scss') {
				return `
								{
									Type: 'Css',
									Data: preval\`module.exports = require("maxymiser-workflow/scripts/inline").scss("${filePath}")\`,
									Attrs: {}
								}`;
			} else if (ext === 'html') {
				return `
								{
									Type: 'Html',
									Data: preval\`module.exports = require("maxymiser-workflow/scripts/inline").html("${filePath}")\`,
									Attrs: {}
								}`;
			}

			return '';
		})
		.filter(function(str) {
			return str !== '';
		})
		.join(',\n');

	return `${requestCallback}({
		Scripts: [${globalFiles}
		],
		Campaigns: [
			{
				Name: '${campaign}',
				Type: 'ABnMVT',
				CSName: '',
				HighLevelApiVersion: '${apiVersion}',
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
		Packages: ${JSON.stringify(config.Packages || ['mmpackage-1.12.js'])}
	});`;
}

module.exports = template;
