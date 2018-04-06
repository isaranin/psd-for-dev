var Backbone = require('backbone');
var _ = require('underscore');
var template = require('./template.hbs');
var LayerPreviewView = require('components/layer/preview/view');

module.exports = Backbone.View.extend({

	tagName: 'div',
	className: 'layer-list',
	template: template,

	initialize: function() {
		//this.listenTo(this.model, 'add remove',  _.debounce(_.bind(this.render, this), 200));
	},

	render: function() {
		this.$el.html(this.template(this.model.attributes));
		var that = this;
		this.model.map(
			function(layer) {
				var layerView = new LayerPreviewView({model: layer});
				layerView.render();
				that.$el.prepend(layerView.$el);
			}
		);
		return this;
	}
});
