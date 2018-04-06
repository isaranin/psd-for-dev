var Backbone = require('backbone');
var $ = require('jquery');
var template = require('./template.hbs');
var PreviewModel = require('components/preview/model');
var PreviewView = require('components/preview/view');
var LayersListView = require('components/layers/listview/view');

module.exports = Backbone.View.extend({

	el: '#psd-for-dev',
	tagName:  "div",
	template: template,

	// nested views
	views: {
		preview: null,
		layerslist: null
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

	onChangeStatus: function() {
		this.$el.attr({'data-status': this.model.get('status')});
	}
});
