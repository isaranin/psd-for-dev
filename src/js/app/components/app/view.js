var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');

module.exports = Backbone.View.extend({
	el: $("#psd-for-dev"),
	tagName:  "div",
	template: _.template("hello"),
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
	},
	render: function() {
		 this.$el.html('hello');
		 console.log(this.model);
	}
});
