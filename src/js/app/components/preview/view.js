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

	increaseZoom: function(delta, center) {
		//todo: make zoom work around mouse pointer
		var zoom = this.model.get('zoom'),
			left = this.model.get('left'),
			top = this.model.get('top'),
			zoomChange = zoom;
		zoom *= Math.exp(delta*this.zoomPower);
		if (zoom > 100) {
			zoom = 8;
		} else if (zoom < 0.5) {
			zoom = 0.5;
		}
		zoomChange -= zoom;

		//left = center.x*zoom;
		//top = center.y*zoom;
		this.model.set({'zoom': zoom, 'left': left, 'top': top});

		this.constrainPos(left, top);
	},

	moveTo: function(x, y) {
		this.constrainPos(x, y);
	},

	moveBy: function (dx, dy) {
		if (!dx && !dy) {
			return;
		}
		this.moveTo(
			this.model.get('left')+dx,
			this.model.get('top')+dy
		);
	},

	pointToLocal: function(x,y) {
		var $parent = this.$el.parent(),
			parentWidth = $parent.width()/2,
			parentHeight = $parent.height()/2,
			zoom = this.model.get('zoom'),
			thisWidth = this.$el.width()/2*zoom,
			thisHeight = this.$el.height()/2*zoom;

		return {
			x: -parentWidth + thisWidth + x,
			y: -parentHeight + thisHeight + y
		};
	},

	pointToParent: function(x,y) {
		var $parent = this.$el.parent(),
			parentWidth = $parent.width()/2,
			parentHeight = $parent.height()/2,
			zoom = this.model.get('zoom'),
			thisWidth = this.$el.width()/2*zoom,
			thisHeight = this.$el.height()/2*zoom;

		return {
			x: parentWidth - thisWidth + x,
			y: parentHeight - thisHeight + y
		};
	},

	constrainPos: function(x, y) {
		var x = (x !== undefined)?x:this.model.get('left'),
			y = (y !== undefined)?y:this.model.get('top'),
			$parent = this.$el.parent(),
			parentWidth = $parent.width(),
			parentHeight = $parent.height(),
			zoom = this.model.get('zoom'),
			thisWidth = this.$el.width()*zoom,
			thisHeight = this.$el.height()*zoom,
			parentPointLT = this.pointToParent(x, y),
			parentPointRB = this.pointToParent(
				x+thisWidth,
				y+thisHeight
			);
		if (thisWidth < parentWidth) {
			x = 0;
//			if (parentPointLT.x <= 0) {
//				x = this.pointToLocal(0).x;
//			} else if (parentPointRB.x > parentWidth) {
//				x = this.pointToLocal(parentWidth - thisWidth).x;
//			}

		} else {
			if (parentPointLT.x >= 0) {
				x = this.pointToLocal(0).x;
			} else if (parentPointRB.x < parentWidth) {
				x = this.pointToLocal(parentWidth - thisWidth).x;
			}
		}
		if (thisHeight < parentHeight) {
			y = 0;
//			if (parentPointLT.y <= 0) {
//				y = this.pointToLocal(0,0).y;
//			} else if (parentPointRB.y > parentHeight) {
//				y = this.pointToLocal(0, parentHeight - thisHeight).y;
//			}
		} else {
			if (parentPointLT.y >= 0) {
				y = this.pointToLocal(0,0).y;
			} else if (parentPointRB.y < parentHeight) {
				y = this.pointToLocal(0, parentHeight - thisHeight).y;
			}
		}

		this.model.set({'left': x, 'top': y});
	},

	onChangeCss: function() {
		this.$el.css({
			'transform': 'matrix('+this.model.get('zoom')+',0,0,'+this.model.get('zoom')+','+
					 this.model.get('left')+','+this.model.get('top')+')'
		});
	}
});
