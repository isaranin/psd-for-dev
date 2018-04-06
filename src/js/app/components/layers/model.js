var Backbone = require('backbone');
var LayerModel = require('components/layer/model');

module.exports = Backbone.Collection.extend({
	model: LayerModel
});