var $ = require('jquery');
var _ = require('underscore');

module.exports = (function() {
	var touchCapable = ('ontouchstart' in window);

	var settings = {
		events: {
			start:(touchCapable) ? 'touchstart' : 'mousedown',
            end: (touchCapable) ? 'touchend' : 'mouseup',
            move: (touchCapable) ? 'touchmove' : 'mousemove'
		},
		gestures: {
			time: 200
		}
	};

	var eventPoints = {
		pointPrefixes: ['client', 'screen', 'page'],
		eachPrefixes: function(callback) {
			if (!_.isFunction(callback)) {
				return;
			}
			var that = this;
			return _.each(this.pointPrefixes, function(prefix) {
				var res;
				res = callback.call(that, prefix+'X');
				res = res && callback.call(that, prefix+'Y');
				return res;
			});
		},
		getFromEvent: function(event) {
			var that = this,
				touches = {0:event};
			if (event.touches
				&& (event.touches.length > 0)) {
				touches = event.touches;
			} else if (event.originalEvent
				&& event.originalEvent.changedTouches
				&& (event.originalEvent.changedTouches.length > 0)) {
				touches = event.originalEvent.changedTouches;
			}
			return _.map(touches, function(point) {
				var res = {};
				that.eachPrefixes(function(prefix) {
					res[prefix] = point[prefix];
					return true;
				});
				return res;
			});
		},
		add: function(touches1, touches2, mult) {
			var that = this,
				mult = mult || 1;
			return _.map(touches1, function(point, index) {
				if (touches2[index]) {
					var res = {};
					that.eachPrefixes(function(prefix) {
						res[prefix] = point[prefix] + mult*touches2[index][prefix];
						return true;
					});
					return res;
				} else {
					return false;
				}
			});
		},
		isEqual: function(touches, value, gap) {
			if (value === undefined) {
				return false;
			}
			var that = this,
				gap = gap || 0,
				res = true;
			_.each(touches, function(point, index) {
				that.eachPrefixes(function(prefix) {
					res = Math.abs(point[prefix]-value) <= gap;
					return res;
				});
				return res;
			});
			return res;
		}
	};

	var isTapEvent = function(event) {
		if (!touchCapable) {
			return event.originalEvent
					&& event.which
					&& (event.which === 1);
		} else {
			return event.originalEvent
					&& ((event.originalEvent.touches.length > 0)
						|| (event.originalEvent.changedTouches.length > 0));
		}
	};

	$.event.special.tapmove = {
		setup: function () {
			var defaults = {
			};
			var $this = $(this),
				options = $.extend({}, defaults),
				tapMoveData = {
					delta: {
						points: {
							start: [],
							last: []
						},
						time: {
							start: 0,
							last: 0
						}
					},
					points: {
						start: [],
						last: []
					},
					time: {
						start: 0,
						last: 0
					},
					type: '',
					isTouch: touchCapable
				},
				gesturesTimer = 0,
				gesturesFinished = false;

			var data = {
				mousedown: function(event) {
					if (!isTapEvent) {
						return;
					}
					tapMoveData.points.start = eventPoints.getFromEvent(event);
					tapMoveData.points.last = tapMoveData.points.start;
					tapMoveData.time.start = event.timeStamp;
					tapMoveData.time.last = event.timeStamp;
					tapMoveData.delta.points.start
							= tapMoveData.delta.points.last
							= eventPoints.add(tapMoveData.points.start, tapMoveData.points.start, -1);
					tapMoveData.delta.time.start = 0;
					tapMoveData.delta.time.last = 0;
					tapMoveData.type = 'start';
					$(event.target).trigger('tapmove', tapMoveData);
					gesturesFinished = false;
					gesturesTimer = setTimeout(function() {
						gesturesFinished = true;
						$(event.target).trigger('tapmove', tapMoveData);
					}, settings.gestures.time);
				},

				mousemove: function(event) {
					if (!isTapEvent(event)) {
						return;
					}
					var newLastPoints = eventPoints.getFromEvent(event),
						newLastTimeStamp = event.timeStamp,
						lastPointsDelta = eventPoints.add(tapMoveData.points.last, newLastPoints, -1);

					if (eventPoints.isEqual(lastPointsDelta, 0, 0)) {
						return;
					}


					tapMoveData.delta.points.start = eventPoints.add(tapMoveData.points.start, newLastPoints, -1);
					tapMoveData.delta.points.last = lastPointsDelta;

					tapMoveData.delta.time.start = newLastTimeStamp - tapMoveData.time.start;
					tapMoveData.delta.time.last = newLastTimeStamp - tapMoveData.time.last;

					tapMoveData.points.last = newLastPoints;
					tapMoveData.time.last = newLastTimeStamp;

					tapMoveData.type = 'move';

					if (gesturesFinished) {
						$(event.target).trigger('tapmove', tapMoveData);
					}
				},

				mouseup: function(event) {
					if (!isTapEvent(event)) {
						return;
					}
					var newLastPoints = eventPoints.getFromEvent(event),
						newLastTimeStamp = event.timeStamp;

					tapMoveData.delta.points.start = eventPoints.add(tapMoveData.points.start, newLastPoints, -1);
					tapMoveData.delta.points.last = eventPoints.add(tapMoveData.points.last, newLastPoints, -1);

					tapMoveData.delta.time.start = newLastTimeStamp - tapMoveData.time.start;
					tapMoveData.delta.time.last = newLastTimeStamp - tapMoveData.time.last;

					tapMoveData.points.last = newLastPoints;
					tapMoveData.time.last = newLastTimeStamp;
					tapMoveData.type = 'end';

					if (gesturesFinished) {
						$(event.target).trigger('tapmove', tapMoveData);
					}
				}
			};

			$this.on(settings.events.start, data.mousedown);
			$this.on(settings.events.move, data.mousemove);
			$this.on(settings.events.end, data.mouseup);

			$this.data('tapmove', data);
		},
		teardown: function() {
			var $this = $(this),
				data = $this.data('tapmove');
			$this.off(settings.events.start, data.mousedown);
			$this.off(settings.events.move, data.mousemove);
			$this.removeData('tapmove');
		}
	};

	$.event.special.swipe = {
		setup: function (options) {
			var defaults = {
				positionGap: 60
			};
			var $this = $(this),
				options = $.extend({}, defaults, options),
				swipeData = {
					fired: false
				};

			var data = {
				tapmove: function(event, obj) {
					if (obj.delta.points.start.length !== 1) {
						return;
					}

					if (obj.type === 'start') {
						swipeData.fired = false;
						return;
					}

					if (obj.type === 'move') {
						return;
					}

					if (swipeData.fired) {
						return;
					}

					var direction = '';
					//if (Math.abs(obj.delta.time.start-settings.gestures.time) < options.timeGap) {
						var xGap = obj.delta.points.start[0].screenX,
							yGap = obj.delta.points.start[0].screenY;
						if (Math.abs(xGap) > options.positionGap) {
							direction = xGap<0?'right':'left';
						} else if (Math.abs(yGap) > options.positionGap) {
							direction = yGap<0?'bottom':'top';
						}

						if (direction !== '') {
							$(event.target).trigger('swipe', {direction: direction});
							swipeData.fired = true;
						}
					//}
				}
			};

			$this.on('tapmove', data.tapmove);

			$this.data('swipe', data);
		},
		teardown: function() {
			var $this = $(this),
				data = $this.data('swipe');
			$this.off('tapmove', data.tapmove);
			$this.removeData('swipe');
		}
	};

})();