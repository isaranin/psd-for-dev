var Backbone = require('backbone');
var $ = require('jquery');
require('jquery.events');
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
		'dragenter': 'onDragStart',
		'dragover': 'onDragOver',
		'dragleave': 'onDragEnd',
		'dragstart *': 'onChildsStartDrap',
		'drop': 'onDrop',
		'mousewheel #psd-preview': 'onMouseWheelPreview',
		'tapmove #psd-preview': 'onTapMove',
		'click .button.menu': 'onMenuButtonClick',
		'swipe': 'onSwipe'
	},

	initialize: function() {
		this.listenTo(this.model, 'change:status', this.onChangeStatus);
		this.listenTo(this.model, 'change:message', this.onChangeMessage);

		$(window).on('hashchange', _.bind(this.onHashChange, this));

		this.views.preview = new PreviewView({
			model: new PreviewModel({psd: this.model.get('psd')})
		});
		this.views.layerslist = new LayersListView({
			model: this.model.get('psd').get('layers')
		});

		this.onHashChange();
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
		this.model.get('psd').reset();
		if (converter.modelFromPSDFile(this.model.get('psd'), psd)) {
			this.model.set('status', 'loaded');
		} else {
			this.model.set({
				'status':'message',
				'message': 'Wrong file format.'
			});
		}
		this.render();
	},

	loadPSD: function(obj) {
		this.model.set('status', 'loading');

		var func = null,
			param = null;
		if (obj instanceof DragEvent) {
			var dragItems = obj.dataTransfer.items;
			if (dragItems.length !== 1) {
				this.model.set({
					'message': 'You add to much files at once.',
					'status': 'message'
				});
				return;
			} else if (dragItems[0].kind === 'file') {
				func = 'fromEvent';
				param = obj;
			} else if (dragItems[0].kind === 'string') {
				func = 'fromURL';
				param = obj.dataTransfer.getData('text');
			}
		} else if (_.isString(obj)) {
			func = 'fromURL';
			param = obj;
		}
		if (_.isNull(func)
			|| _.isNull(param)) {
			this.model.set({
				'message': 'You add wrong file.',
				'status': 'message'
			});
		} else {
			PSD[func](param).then(
				_.bind(this.convertPSD, this),
				_.bind(function(e) {this.onLoadError(e.currentTarget.error.message); }, this));
		}
	},

	onLoadError: function(error) {
		this.model.set({
				'message': 'Error: '+error,
				'status': 'message'
			});
	},

	onChangeStatus: function() {
		this.$el.attr({'data-status': this.model.get('status')});
	},

	onChangeMessage: function() {
		this.$('#msg-message').html(this.model.get('message'));
	},

	onChildsStartDrap: function(e) {
		e.preventDefault();
		e.result = false;
		return false;
	},

	onDragStart: function(e) {
		e.preventDefault();
		var dragItems = e.originalEvent.dataTransfer.items;
		if ((dragItems.length !== 1)
			|| ((dragItems[0].kind !== 'file')
				&& (dragItems[0].kind !== 'string'))) {
			this.model.set({
				'message': 'Drop only one file or link.',
				'status': 'message'
			});
			e.originalEvent.dataTransfer.effectAllowed = 'none';
			return false;
		}
		this.model.set('status', 'drag-over');
	},

	onDragOver: function(e) {
		e.preventDefault();
	},

	onDragEnd: function(e) {
		if (e.target === this.el) {
			if (this.model.get('psd').get('loaded')) {
				this.model.set('status', 'loaded');
			} else {
				this.model.set('status', 'start');
			}
		}
	},

	onDrop: function(e) {
		e.preventDefault();
		this.loadPSD(e.originalEvent);
	},

	onMouseWheelPreview: function(event) {
		this.views.preview.increaseZoom(
			event.originalEvent.wheelDelta/120, {
				x: event.clientX,
				y: event.clientY
			});
		event.preventDefault();
	},

	onTapMove: function(event, data) {
		if (!data.delta.points.last || data.type !== 'move') {
			return;
		}
		if (data.delta.points.last.length === 1) {
			this.views.preview.moveBy(
				-data.delta.points.last[0].clientX,
				-data.delta.points.last[0].clientY
			);
		}
	},

	onSwipe: function(event, data) {
		if (['left', 'right'].indexOf(data.direction) >= 0) {
			this.$('#psd-layer-list').toggleClass('opened' , data.direction === 'left');
		}
	},

	onMenuButtonClick: function(event) {
		this.$('#psd-layer-list').toggleClass('opened');
	},

	onHashChange: function(event) {
		var hash = window.location.hash.slice(1);
		if (hash.length > 0) {
			this.loadPSD(hash);
		} else {
			this.model.set('status', 'start');
		}
	}
});
