var Backbone = require('backbone');
var _ = require('underscore');


module.exports = Backbone.Model.extend({

	defaults: function() {
		return {
			title: '',
			visible: true,
			fold: true,
			group: false,
			hover: false,

			image: null,
			effects: null,
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			zindex: 0,
			layers: null
		};
	},

	constructor: function() {
		Backbone.Model.apply(this, arguments);
		if (_.isNull(this.attributes.layers)) {
			// move reuqire here cause is causes circular require with layerlist
			var LayersModel = require('components/layers/model');
			this.attributes.layers = new LayersModel();
		}
	},

	parse: function(data, options) {
		this.layers.reset(data.layers);
		return data.library;
	},

	initialize: function() {

	}
});
