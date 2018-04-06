var Backbone = require('backbone');
var _ = require('underscore');
var template = require('./template.hbs');
var PreviewModel = require('components/preview/model');
var PreviewView = require('components/preview/view');
var LayersListView = require('components/layers/listview/view');

var PSD = require('psd');
var PSDConverter = require('modules/psdconverter');

module.exports = Backbone.View.extend({

	el: '#psd-for-dev',
	tagName:  "div",
	template: template,

	// nested views
	views: {
		preview: null,
		layerslist: null
	},

	events: {
		'dragover': 'onDragStart',
		'dragleave': 'onDragEnd',
		'drop': 'onDrop',
		'mousewheel #psd-preview': 'onMouseWheelPreview',
		'mousedown #psd-preview': 'onMouseDownPreview',
		'mousemove #psd-preview': 'onMouseMovePreview',
		'mouseup #psd-preview': 'onMouseUpPreview'
	},

	imageDrag: {
		dragging: false,
		offsetX: 0,
		offsetY: 0
	},

	initialize: function() {
		this.listenTo(this.model, 'change:status', this.onChangeStatus);
		this.views.preview = new PreviewView({
			model: new PreviewModel({psd: this.model.get('psd')})
		});
		this.views.layerslist = new LayersListView({
			model: this.model.get('psd').get('layers')
		});
	},

	render: function() {
		this.$el.html(this.template(this.model.attributes));

		this.views.preview.render();
		this.$('#working-space #psd-preview')
			.append(this.views.preview.$el);

		this.views.layerslist.render();
		this.$('#working-space #psd-layer-list')
			.append(this.views.layerslist.$el);

		this.onChangeStatus();

		return this;
	},

	convertPSD: function(psd) {
		var converter = new PSDConverter();
		this.model.get('psd').get('layers').reset();
		if (converter.modelFromPSDFile(this.model.get('psd'), psd)) {
			this.model.set('status', 'loaded');
		} else {
			this.model.set('status', 'error');
		}
		this.render();
	},

	loadPSD: function(obj) {
		this.model.set('status', 'loading');
		if (_.isString(obj)) {
			PSD.fromURL(obj).then(_.bind(this.convertPSD, this));
		} else {
			PSD.fromEvent(obj).then(_.bind(this.convertPSD, this));
		}
	},

	onChangeStatus: function() {
		this.$el.attr({'data-status': this.model.get('status')});
	},

	onDragStart: function(e) {
		this.model.set('status', 'drag-over');
		e.preventDefault();
	},

	onDragEnd: function(e) {
		this.model.set('status', 'start');
	},

	onDrop: function(e) {
		e.preventDefault();
		this.model.set('status', 'loading');
		this.loadPSD(e.originalEvent);
	},

	onMouseWheelPreview: function(event) {
		this.views.preview.increaseZoom(event.originalEvent.wheelDelta);
		event.preventDefault();
	},

	onMouseDownPreview: function(event) {
		if (event.which === 1) {
			this.imageDrag.dragging = true;
			this.imageDrag.offsetX = event.originalEvent.screenX;
			this.imageDrag.offsetY = event.originalEvent.screenY;
			this.imageDrag.offsetX -= this.views.preview.model.get('left');
			this.imageDrag.offsetY -= this.views.preview.model.get('top');
		}
	},

	onMouseUpPreview: function(event) {
		if (event.which === 1) {
			this.imageDrag.dragging = false;
		}
	},

	onMouseMovePreview: function(event) {
		if (event.which === 1 && this.imageDrag.dragging) {
			this.views.preview.setPosition(
				-this.imageDrag.offsetX+event.originalEvent.screenX,
				-this.imageDrag.offsetY+event.originalEvent.screenY);
		}
	}

});
