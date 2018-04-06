var Backbone = require('backbone');
var template = require('./template.hbs');
var LayerPreviewView = require('components/layer/preview/view');
var LayersPreviewView = require('components/layers/preview/view');

module.exports = Backbone.View.extend({

	className: 'image-view',
	template: template,

	events: {
		'mousewheel': 'onMouseWheel',
		'DOMMouseScroll': 'onMouseWheel'
	},
	// nested views
	views: {
		layerslist: null
	},

	zoomPower: 0.001,

	initialize: function() {
		this.listenTo(this.model, 'change', this.onChangeCss);
		this.views.layerslist = new LayersPreviewView({
			model: this.model.get('psd').get('layers')
		});
	},

	render: function() {
		this.$el.html(this.template(this.model.attributes));
		this.$el.css({
			width: this.model.get('psd').get('width'),
			height: this.model.get('psd').get('height')
		});

		this.views.layerslist.render();
		this.$el.append(this.views.layerslist.$el);


		this.onChangeCss();

		return this;
	},

	onMouseWheel: function(event) {
		var zoom = this.model.get('zoom');
		console.log(event.originalEvent.wheelDelta);
		zoom += event.originalEvent.wheelDelta*this.zoomPower;
		if (zoom > 100) {
			zoom = 8;
		} else if (zoom < 0.01) {
			zoom = 0.5;
		}
		event.preventDefault();
		this.model.set('zoom', zoom);
	},

	onChangeCss: function() {
		this.$el.css({
			'left': this.model.get('left'),
			'top': this.model.get('top'),
			'zoom': this.model.get('zoom')
		});
	}
});
