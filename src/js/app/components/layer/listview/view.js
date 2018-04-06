var Backbone = require('backbone');
var template = require('./template.hbs');

module.exports = Backbone.View.extend({

	tagName: 'li',
	className: 'layer',
	template: template,

	events: {
		'click >.button-visible': 'onVisibleClick',
		'click >.button-fold': 'onFoldClick',
		'mouseover': 'onMouseEnter',
		'mouseout': 'onMouseLeave'
	},

	initialize: function() {
		this.listenTo(this.model, 'change', this.onModelChange);
	},

	render: function() {
		this.$el.html(this.template(this.model.attributes));
		this.$el.toggleClass('layer-group', this.model.get('group'));
		var that = this;
		if (this.model.get('group')) {
			var LayersListView = require('components/layers/listview/view'),
				layersListView = new LayersListView({model: this.model.get('layers')});

			layersListView.render();
			that.$el.append(layersListView.$el);
		}
		this.onModelChange();
		return this;
	},

	onModelChange: function() {
		this.$el.toggleClass('layer-hided', !this.model.get('visible'));
		this.$el.toggleClass('layer-folded', this.model.get('fold'));
		this.$el.toggleClass('hover', this.model.get('hover'));
	},

	onVisibleClick: function() {
		this.model.set({ visible: !this.model.get('visible')});
	},

	onFoldClick: function() {
		this.model.set({ fold: !this.model.get('fold')});
	},

	onMouseEnter: function() {
		if (!this.model.get('group')) {
			this.model.set({ hover: true });
			return false;
		} else {
			return true;
		}

	},

	onMouseLeave: function() {
		if (!this.model.get('group')) {
			this.model.set({ hover: false });
			return false;
		} else {
			return true;
		}
	}
});
