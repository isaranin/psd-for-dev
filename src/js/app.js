var $ = require('jquery');
var AppView = require('components/app/view');
var AppModel = require('components/app/model');

$(function() {
	var appModel = new AppModel();
	var appView = new AppView({model: appModel});
	appView.render();
});