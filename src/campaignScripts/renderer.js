const AOGlobal = modules.require('AOGlobal');
//eslint-disable-next-line no-underscore-dangle
AOGlobal._hasjQueryLoadedChecker();

renderer
	.when(function() {
		return window.AoModal && window.jQuery;
	})
	.then(function() {
		renderer.runVariantJs();
	});
