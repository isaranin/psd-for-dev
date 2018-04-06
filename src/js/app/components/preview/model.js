var Backbone = require('backbone');
var _ = require('underscore');
var PSDModel = require('models/psd');

module.exports = Backbone.Model.extend({

	defaults: function() {
		return {
			zoom: 1,
			left: 0,
			top: 0,
			psd: null
		};
	},

	constructor: function() {
		Backbone.Model.apply(this, arguments);
		if (_.isNull(this.attributes.psd)) {
			this.attributes.psd = new PSDModel();
		}
	},

	parse: function(data, options) {
		this.psd.reset(data.psd);
		return data.library;
	}
});