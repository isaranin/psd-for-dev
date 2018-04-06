var LayerModel = require('components/layer/model');
var _ = require('underscore');

module.exports = function() {
	var obj = {
		modelFromPSDFile: function(model, psdFile) {
			if ((psdFile.header.width === 0)
				|| (psdFile.header.height === 0)
				|| (_.isNaN(psdFile.file.pos))) {
				return false;
			}
			var root = psdFile.tree(),
				index = 0;
			model.set('width', psdFile.header.width);
			model.set('height', psdFile.header.height);
			this.fillLayerGroup(root.children(), model.attributes.layers);
			return true;
		},
		fillLayerGroup: function(origLayerGroup, destLayerGoup, index) {
			var that = this;
			origLayerGroup.map(function(origLayer) {
				var newLayer = new LayerModel();
				that.fillLayer(origLayer, newLayer);
				if (newLayer.get('group')) {
					that.fillLayerGroup(origLayer.children(), newLayer.get('layers'));
				}
				destLayerGoup.push(newLayer);
				return index;
			});
		},
		fillLayer: function(origLayer, destLayer) {
			destLayer.set({
				visible: origLayer.visible() !== false,
				group: origLayer.isGroup(),
				title: origLayer.name,
				left: origLayer.left,
				top: origLayer.top,
				width: origLayer.width,
				height: origLayer.height,
				fold: true
			});
			if (!destLayer.get('group')
					&& destLayer.get('width') > 0
					&& destLayer.get('height') > 0) {
				try {
					destLayer.set({image: origLayer.toPng().src});
				}
				catch(err) {
					console.log(err);
				}

			}
		}
	};

	return obj;
};
