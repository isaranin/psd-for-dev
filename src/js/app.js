var $ = require('jquery');
var AppView = require('components/app/view');
var AppModel = require('components/app/model');
var PSD = require('psd');
var PSDConverter = require('modules/psdconverter');

$(function() {
	var appModel = new AppModel();
	var appView = new AppView({model: appModel});
	appModel.set('status', 'loading');
	appView.render();
	PSD.fromURL('/samples/psd-with-layers.psd').then(function(psd) {
		var converter = new PSDConverter();
		converter.modelFromPSDFile(appModel.get('psd'), psd);
		appView.render();
		appModel.set('status', 'loaded');
	});
});