var Backbone = require('backbone');
var template = require('./template.hbs');
var LayerPreviewView = require('components/layer/preview/view');
var LayersPreviewView = require('components/layers/preview/view');

module.exports = Backbone.View.extend({

	className: 'image-view',
	template: template,

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

	increaseZoom: function(delta) {
		var zoom = this.model.get('zoom');
		zoom += delta*this.zoomPower;
		if (zoom > 100) {
			zoom = 8;
		} else if (zoom < 0.5) {
			zoom = 0.5;
		}
		this.model.set('zoom', zoom);
	},

	setPosition: function(x, y) {
		this.model.set({'left': x, 'top': y});
	},

	onChangeCss: function() {
		this.$el.css({
			'transform':
					'translate('+this.model.get('left')+'px,'+this.model.get('top')+'px) '+
					'scale('+this.model.get('zoom')+')'
		});
	}
});
