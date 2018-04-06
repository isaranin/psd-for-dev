var Backbone = require('backbone');
var template = require('./template.hbs');
var LayersPreviewView = require('components/layers/preview/view');

module.exports = Backbone.View.extend({

	className: 'image-view',
	template: template,

	// nested views
	views: {
		layerslist: null
	},

    zoomPower: 0.1,

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
		//todo: make zoom work around mouse pointer
		var zoom = this.model.get('zoom'),
			left = this.model.get('left'),
			top = this.model.get('top'),
			zoomChange = zoom;
		zoom *= Math.exp(delta/120*this.zoomPower);
		if (zoom > 100) {
			zoom = 8;
		} else if (zoom < 0.5) {
			zoom = 0.5;
		}
		zoomChange -= zoom;
		//left = left * zoomChange;
		//top = top * zoomChange;
		this.model.set({'zoom': zoom, 'left': left, 'top': top});
	},

	setPosition: function(x, y) {
		//todo: add bounds
		this.model.set({'left': x, 'top': y});
	},

	onChangeCss: function() {
		this.$el.css({
			'transform': 'matrix('+this.model.get('zoom')+',0,0,'+this.model.get('zoom')+','+
						 this.model.get('left')+','+this.model.get('top')+')'
		});
	}
});
