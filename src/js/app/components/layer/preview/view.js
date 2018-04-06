var Backbone = require('backbone');
var template = require('./template.hbs');

module.exports = Backbone.View.extend({

	tagName: 'div',
	className: 'layer',
	template: template,

	events: {
		'mouseenter': 'onMouseEnter',
		'mouseleave': 'onMouseLeave'
	},

	initialize: function() {
		this.listenTo(this.model, 'change', this.onModelChange);
	},

	render: function() {
		var that = this;

		if (this.model.get('group')) {
			this.$el.html('');
			var LayersPreviewView = require('components/layers/preview/view'),
				layersPreviewView = new LayersPreviewView({model: this.model.get('layers')});
			layersPreviewView.render();
			that.$el.addClass('group-layer');
			that.$el.append(layersPreviewView.$el);
		} else {
			this.$el.html(this.template(this.model.attributes));
			this.$el.css({
				'left': this.model.get('left')+'px',
				'top': this.model.get('top')+'px',
				'width': this.model.get('width')+'px',
				'height': this.model.get('height')+'px'
			});
		}
		this.onModelChange();
		return this;
	},

	onModelChange: function() {
		this.$el.toggleClass('is-visible', this.model.get('visible'));
		this.$el.toggleClass('hover', this.model.get('hover'));
	},

	onMouseEnter: function(e) {
		if (!this.model.get('group')) {
			this.model.set({ hover: true });
		}
	},

	onMouseLeave: function(e) {
		if (!this.model.get('group')) {
			this.model.set({ hover: false });
		}
	}
});
