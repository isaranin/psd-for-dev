var Backbone = require('backbone');
var _ = require('underscore');
var LayersModel = require('components/layers/model');

module.exports = Backbone.Model.extend({

	defaults: function() {
		return {
			width: 0,
			height: 0,
			loaded: false,
			layers: null
		};
	},

	constructor: function() {
		Backbone.Model.apply(this, arguments);
		if (_.isNull(this.attributes.layers)) {
			this.attributes.layers = new LayersModel();
		}
	},

	parse: function(data, options) {
		this.layers.reset(data.layers);
		return data.library;
	},

	reset: function() {
		var layers = this.attributes.layers;
		layers.reset();
		this.clear().set(this.defaults());
		this.attributes.layers = layers;
	}
});

