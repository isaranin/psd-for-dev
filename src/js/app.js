var $ = require('jquery');
var AppView = require('components/app/view');
var AppModel = require('components/app/model');

$(function() {
	var appModel = new AppModel();
	var appView = new AppView({model: appModel});
	if (window.location.hash === '#test') {
		appView.loadPSD('/samples/psd-with-layers.psd');
	} else {
		appView.render();
	}
});