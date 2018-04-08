var Backbone = require('backbone');
var _ = require('underscore');
var PSDModel = require('models/psd');

module.exports = Backbone.Model.extend({

	defaults: function() {
		return {
			status: 'start',
			message: '',
			siteUrl: window.location.origin+window.location.pathname,
			helpUrl: 'https://github.com/isaranin/psd-for-dev/issues',
			author: 'Ivan Saranin',
			authorEmail: 'ivan@saranin.co',
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
