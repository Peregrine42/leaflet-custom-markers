export function SmoothWheelZoom(L) {
	L.Map.mergeOptions({
		// @section Mousewheel options
		// @option smoothWheelZoom: Boolean|String = true
		// Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
		// it will zoom to the center of the view regardless of where the mouse was.
		smoothWheelZoom: true,

		// @option smoothWheelZoom: number = 1
		// setting zoom speed
		smoothSensitivity: 1,
	});

	L.Map.SmoothZoomControl = L.Control.Zoom.extend({
		_zoomIn: function (e) {
			if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
				this._map.flyTo(
					this._map.getCenter(),
					this._map.getZoom() +
						this._map.options.zoomDelta * (e.shiftKey ? 3 : 1)
				);
			}
		},

		_zoomOut: function (e) {
			if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
				this._map.flyTo(
					this._map.getCenter(),
					this._map.getZoom() -
						this._map.options.zoomDelta * (e.shiftKey ? 3 : 1)
				);
			}
		},
	});

	L.Map.SmoothWheelZoom = L.Handler.extend({
		addHooks: function () {
			L.DomEvent.on(
				this._map._container,
				"wheel",
				this._onWheelScroll,
				this
			);
			L.DomEvent.on(this._map, "dblclick", this._onDblClick, this);
			this._map.zoomControl.remove();
			this._map.addControl(new L.Map.SmoothZoomControl());
		},

		removeHooks: function () {
			L.DomEvent.off(
				this._map._container,
				"wheel",
				this._onWheelScroll,
				this
			);
			L.DomEvent.off(this._map, "dblclick", this._onDblClick, this);
		},

		_onWheelScroll: function (e) {
			if (!this._isWheeling) {
				this._onWheelStart(e);
			}
			this._onWheeling(e);
		},

		_onDblClick: function (e) {
			if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
				this._map.flyTo(
					e.latlng,
					this._map.getZoom() +
						this._map.options.zoomDelta * (e.shiftKey ? 3 : 1)
				);
			}
		},

		_onWheelStart: function (e) {
			var map = this._map;
			this._isWheeling = true;
			this._wheelMousePosition = map.mouseEventToContainerPoint(e);
			this._centerPoint = map.getSize()._divideBy(2);
			this._startLatLng = map.containerPointToLatLng(this._centerPoint);
			this._wheelStartLatLng = map.containerPointToLatLng(
				this._wheelMousePosition
			);
			this._startZoom = map.getZoom();
			this._moved = false;
			this._zooming = true;

			map._stop();
			if (map._panAnim) map._panAnim.stop();

			this._goalZoom = map.getZoom();
			this._prevCenter = map.getCenter();
			this._prevZoom = map.getZoom();

			this._zoomAnimationId = requestAnimationFrame(
				this._updateWheelZoom.bind(this)
			);
		},

		_onWheeling: function (e) {
			var map = this._map;

			this._goalZoom =
				this._goalZoom +
				L.DomEvent.getWheelDelta(e) *
					0.003 *
					map.options.smoothSensitivity;
			if (
				this._goalZoom < map.getMinZoom() ||
				this._goalZoom > map.getMaxZoom()
			) {
				this._goalZoom = map._limitZoom(this._goalZoom);
			}
			this._wheelMousePosition = this._map.mouseEventToContainerPoint(e);

			clearTimeout(this._timeoutId);
			this._timeoutId = setTimeout(this._onWheelEnd.bind(this), 200);

			L.DomEvent.preventDefault(e);
			L.DomEvent.stopPropagation(e);
		},

		_onWheelEnd: function (e) {
			this._isWheeling = false;
			cancelAnimationFrame(this._zoomAnimationId);
			this._map._moveEnd(true);
		},

		_updateWheelZoom: function () {
			var map = this._map;

			if (
				!map.getCenter().equals(this._prevCenter) ||
				map.getZoom() != this._prevZoom
			)
				return;

			this._zoom = map.getZoom() + (this._goalZoom - map.getZoom()) * 0.3;
			this._zoom = Math.floor(this._zoom * 100) / 100;

			var delta = this._wheelMousePosition.subtract(this._centerPoint);
			if (delta.x === 0 && delta.y === 0) return;

			if (map.options.smoothWheelZoom === "center") {
				this._center = this._startLatLng;
			} else {
				this._center = map.unproject(
					map
						.project(this._wheelStartLatLng, this._zoom)
						.subtract(delta),
					this._zoom
				);
			}

			if (!this._moved) {
				map._moveStart(true, false);
				this._moved = true;
			}

			map._move(this._center, this._zoom);
			this._prevCenter = map.getCenter();
			this._prevZoom = map.getZoom();

			this._zoomAnimationId = requestAnimationFrame(
				this._updateWheelZoom.bind(this)
			);
		},
	});

	L.Map.addInitHook("addHandler", "smoothWheelZoom", L.Map.SmoothWheelZoom);
}
