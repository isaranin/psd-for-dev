var Backbone = require('backbone');
module.exports = Backbone.Model.extend({
	defaults: function() {
		return {
			psd: null,
			loaded: true
		};
	}
});