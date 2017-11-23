mmRequestCallbacks[0]({
		Scripts: [
			{
				Name: 'CDAPI-IF',
				Type: 'script',
				Attrs: { type: 'text/javascript' },
				Data:
					'/*!$1 *$1integrations-module 0.9.4$1 *$1-- Maxymiser Integrations Module provides a standardized approach to develop and deploy 3rd party integrations.$1 *$1-- https://gitlab.com/maxymiser-integrations/integrations-module/raw/master/src/integrations-module.min.js$1 *$1-- git+ssh://git@gitlab.com/maxymiser-integrations/integrations-module.git$1 *$1-- Built on 2015-10-30$1 */$1!function(){function a(){function a(a,b){function i(b){return a=a||"",g("Integrations.register("+a+"): "+(b||"").toString())}var j,k;return b=e(b)?b:{},(a=("string"==typeof a?a:"").toLowerCase().replace(/^$1s+|$1s+$/g,""))?l[a]?(i(m.errors.alreadyRegistered),null):(b.name=a,j=h(b,{}),k={validate:c(j.validate)?j.validate:f,check:c(j.check)?j.check:f,interval:d(j.interval)?j.interval:50,timeout:d(j.timeout)?j.timeout:2e3,exec:c(j.exec)?j.exec:f,options:j},j=h(k,j),l[a]=j):(i(m.errors.missingRegisterName),null)}function i(a,b){b=e(b)?b:{};var c,d,f,g,i=new Deferred;if(a=(a||"").toLowerCase(),i.integrationName=a,!l[a])return m.reject(i,m.errors.unregisteredIntegration);if(c=h(l[a],{}),c=h(b,c),(f=c.validate(c))!==!0)return m.reject(i,f);if(d=c.campaign,(g=m.validateCampaignRequired(c,i))!==!0)return m.reject(i,g);if(c.isProduction=m.isProduction(),c.attributeMapRequired){var j=m.isValidAttributeMap(c.attributeMap);if(j!==!0)return m.reject(i,j)}return"pending"!==i.state()?i.promise():("never"!==c.timeout&&m.setFailTimeout(c,i),m.check(c).then(function(){return m.exec(c)}).then(function(a){return c.result=a,m.resolve(i,c)}).fail(function(a){return m.reject(i,a)}),i.promise())}function j(a,b){a=(a||"").toLowerCase();var c=l[a];return c?(b=e(b)?b:{},l[a]=h(b,c),this):!1}function k(a){if(!a)return l;var b=(a||"").toLowerCase();return l[b]}var l={},m={errors:{missingRegisterName:"Invalid integration reigstration. Name argument is required.",missingRegisterExec:"Missing `exec` for integration registration",alreadyRegistered:"Integration has already been registered",missingRunName:"Missing `name` for `integration.run`",unregisteredIntegration:"Unknown integration name",noCampaignExperience:"Integration was run before the campaign has generated",noRedirectCampaign:"Redirect Integration is not in a valid campaign scope",noRedirectCampaignData:"Redirect Integration is not on a generation page",campaignRequired:"Integration must be deployed within a campaign script",failedToSaveRedirectData:"Failed to save redirect data"},HALFHOUR:1/48,isProduction:function(){function a(a){for(var c,d={},e="",f=0;c=b(a+f++);)e+=c;e=decodeURIComponent(e);try{d=JSON.parse(e)}catch(g){}return d}function b(a){var b=new RegExp("(?:^|; )"+encodeURIComponent(a).replace(/([.$?*|{}()$1[$1]$1$1$1/+^])/g,"$1$1$1")+"=([^;]+)"),c=(document.cookie.match(b)||["",""])[1];return decodeURIComponent(c)}for(var c=a("mmcore.store.p.")||{},d=a("mmcore.store.s.")||{},e=a("mmapi.store.p.")||{},f=a("mmapi.store.s.")||{},g=[c,d,e,f],h={"mmparams.p":1,"mmparams.d":1},i={un:1,cfgID:1,pruh:1},j=g.length;j--;){var k=g[j];for(var l in h||{})for(var m in i||{})if((k[l]||{})[m])return!1}return!0},isValidIntegrationName:function(a){return"string"==typeof a&&/^$1w+/.test(a)},isCampaignScope:function(a){return e(a)&&a.getName&&a.getExperience?!0:!1},getCampaignExperience:function(a){var b={};return m.isCampaignScope(a)&&(b=a.getExperience&&a.getExperience()||{}),Object.keys(b)?m.formatCampaignExperience(b):!1},formatCampaignExperience:function(a){a=e(a)?a:{};var b=[];for(var c in a)b.push(c+":"+a[c]);return b.join("|")},getData:function(a){a=(a||"").toLowerCase();var b=visitor.getData("Integrations");return b=e(b)?b:{},a&&(b[a]=b[a]||{}),b},setRedirectData:function(a,b){if(a=(a||"").toLowerCase(),!m.isCampaignScope(b))return!1;var c=m.getData(a),d=b.getName();return c[a][d]=c[a][d]||{},c[a][d].redirectData=b.getExperience(),visitor.setData("Integrations",c,m.HALFHOUR),!0},removeRedirectData:function(a,b){if(a=(a||"").toLowerCase(),!m.isCampaignScope(b))return!1;var c=m.getData(a),d=b.getName();return c[a][d]=c[a][d]||{},c[a][d].redirectData=null,visitor.setData("Integrations",c,m.HALFHOUR),!0},getRedirectData:function(a,b){if(a=(a||"").toLowerCase(),!m.isCampaignScope(b))return!1;var c=m.getData(a),d=b.getName();if(c[a][d]=c[a][d]||{},!c[a]||!c[a][d])return c[a]=c[a]||{},c[a][d]=c[a][d]||{},c[a][d].redirectData=null,visitor.setData("Integrations",c,m.HALFHOUR),!1;for(var e in c[a])if(e===d)return c[a][e].redirectData;return!1},getSessionDate:function(a,b){var c=m.getData(a),d=c[a][b.getName()]||{},e=d.sessionDate;return e},setSessionDate:function(a,b){var c=m.getData(a),d=b.getName();c[a][d]=c[a][d]||{},c[a][d].sessionDate=(new Date).getTime(),visitor.setData("Integrations",c,m.HALFHOUR)},resolve:function(a,b){return a.resolve(b),a.promise()},reject:function(a,b){var c=a.integrationName||"unknown name";return b=b||"unknown reason",g("Integration ["+c+"]: "+b.toString()),a.reject(b),a.promise()},validateCampaignRequired:function(a,b){if(!a.campaignRequired)return a.oncePerSession?"campaign option is required when using the oncePerSession option":a.redirect?"campaign option is required when using the redirect option":!0;var c=a.campaign,d=m.isCampaignScope(c);if(d!==!0)return m.errors.campaignRequired;if(a.campaignExperience=m.getCampaignExperience(c),a.campaignExperience===!1&&!a.redirect)return m.errors.noCampaignExperience(a.name);if(a.oncePerSession){var e=m.getSessionDate(a.name,c);if(m.setSessionDate(a.name,c),(new Date).getTime()-m.HALFHOUR>e)return g("Integration ["+a.name+"]: data has already been sent this session"),m.resolve(b,a),!0}if(a.redirect){var f=function(){var a=c.getElements();for(var b in a)return!0;return!1}();return f?c.isDefault()?!0:m.setRedirectData(a.name,c)?(m.resolve(b,a),!0):m.errors.failedToSaveRedirectData:(a.campaignExperience=m.getRedirectData(a.name,c),a.campaignExperience=m.formatCampaignExperience(a.campaignExperience),m.removeRedirectData(a.name,c),a.campaignExperience?!0:m.errors.noRedirectCampaignData)}return!0},setFailTimeout:function(a,b){!function(b){setTimeout(function(){setTimeout(function(){return"pending"===b.state()?m.reject(b,"Integration timed out after "+a.timeout+"ms"):void 0},0)},a.timeout+1)}(b)},isValidAttributeMap:function(a){if(!a)return"Missing required attributeMap parameter";if(!e(a)||!Object.keys(a).length)return"The attributeMap parameter is empty or not an object";for(var b in a){var c=a[b];if("string"!=typeof b||!/^[a-zA-Z]+/.test(b))return"Invalid attribute name in the attributeMap";if(!e(c))return"attributeMap values must be stored in an object";if(!Object.keys(c).length)return"attributeMap attribute object is empty";for(var d in c)if(!/^$1w+$/.test(d)&&"default"!==d)return"Invalid attribute ID in attributeMap"}return!0},check:function(a){var c=new Deferred,d=!1;return function e(){var f=a.check.call(this,a);return b(f)?void setTimeout(function(){f.done(function(){return c.resolve()}).fail(function(a){return c.reject(a)})},0):f?void setTimeout(function(){c.resolve()},0):void(d||setTimeout(e,a.interval))}(),setTimeout(function(){d=!0},a.timeout),c.promise()},exec:function(a){var c=new Deferred,d=a.exec.call(this,a);return b(d)?(setTimeout(function(){d.done(function(a){return c.resolve(a)}).fail(function(a){return c.reject(a)})},0),c.promise()):(d===!0?m.resolve(c,a.result):m.reject(c,d),c.promise())}};return{register:a,run:i,setDefaults:j,get:k}}function b(a){return e(a)&&c(a.then)}function c(a){return"function"==typeof a}function d(a){return"number"==typeof a&&a>0}function e(a){return"object"==typeof a&&!!a}function f(){return!0}function g(a){window.mm_error=window.mm_error||"",window.mm_error+=a+"$1n"}function h(a,b){a=e(a)?a:{},b=e(b)?b:{};var c={};for(var d in b)c[d]=b[d];for(var f in a)c[f]=a[f];return c}if("object"==typeof modules&&"function"==typeof modules.define){var i={autoDefine:!0,singleton:!0};modules.define("Integrations",i,a)}else modules={require:function(){return new a}}}();',
				Order: -100,
				HighLevelApiVersion: '1.6'
			},
			{
				Name: 'CDAPI-Webtrends',
				Type: 'script',
				Attrs: { type: 'text/javascript' },
				Data:
					"Integrations.register('Webtrends', {$1    campaignRequired: true,$1    oncePerSession: false,$1    validate: function(integration){$1       return true;$1    },$1    check: function(integration){$1       return typeof window.dcsMultiTrack === 'function';$1    },$1    exec: function(integration){$1       var mode = integration.isProduction ? 'MM Live' : 'MM QA';$1       var campaignExperience = mode + ' ' + integration.campaign.getName() + '=' + integration.campaignExperience;$1       window.dcsMultiTrack('DCS.dcsuri', document.location.pathname, 'WT.ti', document.title, 'WT.dl', '99', 'DCSext.dcsmvt', campaignExperience);$1    }$1});",
				Order: -90,
				HighLevelApiVersion: '1.6'
			},
			{
				Name: 'AOGlobal',
				Type: 'script',
				Attrs: { type: 'text/javascript' },
				Data:
					"$1modules.define('AOGlobal',{}, function() {$1  $1  this._hasjQueryLoadedChecker = function() {$1    $1    site.scope._hasjqueryLoaded = Deferred();$1     var timer = setInterval(function(){$1        if (typeof jQuery != 'undefined') {  $1           site.scope._hasjqueryLoaded.resolve();$1           window.clearInterval(timer);$1            }else{$1            site.scope._hasjqueryLoaded.reject();$1                         $1           }$1     },500); $1  }$1});$1$1$1$1",
				Order: 0,
				HighLevelApiVersion: '1.6'
			}
		],
		Campaigns: [
			{
				Name: 'maxymiser-workflow-campaign',
				Type: 'ABnMVT',
				CSName: '',
				HighLevelApiVersion: '1.6',
				PagePrefix: '',
				Scripts: [
					{
						Name: 'campaignScript1',
						Type: 'script',
						Attrs: { type: 'text/javascript' },
						Data: preval`module.exports = require("./inline").js("../src/campaignScripts/campaignScript1.js")`,
						Order: 0,
						HighLevelApiVersion: '1.6'
					},

					{
						Name: 'renderer',
						Type: 'script',
						Attrs: { type: 'text/javascript' },
						Data: preval`module.exports = require("./inline").js("../src/campaignScripts/renderer.js")`,
						Order: 1,
						HighLevelApiVersion: '1.6'
					}
				],
				Elements: [
					{
						Name: 'element1',
						VariantName: 'variant2',
						HTMLId: 'Element1',
						Data: [
								{
									Type: 'Script',
									Data: preval`module.exports = require("./inline").js("../src/variants/variant2.js")`,
									Attrs: {}
								}
						],
						Order: 2
					}
				],
				Recommendations: []
			}
		],
		MRRules: [],
		PersistData: [],
		SiteInfo: [{ Url: 'ao.com', ID: 993 }],
		SystemData: [{ Version: '1.0', RequestId: 0, ResponseId: 346 }],
		GenInfo: {
			SamsungTradeUpBlock: { element1: 'blockpositionone' }
		},
		ServerAttributes: {},
		Iteration: 'PFhWBOh_hVlzcx_qg-Ifq5OS0vw',
		Packages: ['mmpackage-1.6.js']
	});