const isDefined = (val) => {
	return typeof val !== "undefined" && val !== null;
};

export function AddCustomMarkers(L) {
	const CustomMarker = L.Marker.extend({
		options: {
			// meters
			distance: 200,
			// ms
			interval: 70,
			// animate on add?
			autoStart: false,
			// callback onend
			onEnd: function () {},
			clickable: false,
		},

		initialize: function (options) {
			const {
				latlng,
				latlngs,
				z = 0,
				scaleFactor = 1,
				innerHTML = `
					<div 
						class="marker" 
						style="
							position: absolute; 
							width: 50px; 
							height: 50px;
							border-radius: 10px;
							background-color: orange;
						"
					>
					</div>
				`,
			} = options;

			const self = this;

			this.customOptions = {
				...options,
				forceZIndex: z,
				latlng,
				latlngs,
				size: 1,
			};

			this.innerHTML = innerHTML;
			this.z = z;
			this.scaleFactor = scaleFactor;

			this.size = this.customOptions.size;

			let initialLatLng;
			if (this.customOptions.latlng) {
				initialLatLng = this.customOptions.latlng;
			} else {
				initialLatLng = this.customOptions.latlngs[0];
				this.setLine(this.customOptions.latlngs);
			}

			L.Marker.prototype.initialize.call(
				this,
				initialLatLng,
				this.customOptions
			);

			if (!isDefined(this.customOptions.size)) {
				throw "No size set";
			}

			this.updateCallback = function (_e) {
				self._updateWeight(this);
			};

			this.render = (opts) => {
				const inner = this.innerHTML;

				return `
					<div 
						style="
							position: absolute;
							display: flex;
							justify-content: center;
							align-items: center;
							width: 0px; 
							height: 0px; 
							transform: scale(${opts.size / this.scaleFactor});
						";
					>
						${inner}
					</div> 
				`;
			};

			this.updateCallback = function (_e) {
				self._updateWeight(this);
			};
		},

		animate: function () {
			let self = this,
				len = this._latlngs.length,
				speed = this.options.interval;

			// Normalize the transition speed from vertex to vertex
			if (this._i < len && this.i > 0) {
				speed =
					(this._latlngs[this._i - 1].distanceTo(
						this._latlngs[this._i]
					) /
						this.options.distance) *
					this.options.interval;
			}

			// Only if CSS3 transitions are supported
			if (L.DomUtil.TRANSITION) {
				if (this._icon) {
					this._icon.style[L.DomUtil.TRANSITION] =
						"all " + speed + "ms linear";
				}
			}

			// Move to the next vertex
			this.setLatLng(this._latlngs[this._i]);
			this._i++;

			// Queue up the animation to the next next vertex
			this._tid = setTimeout(
				function () {
					if (self._i >= len) {
						this.animating = false;

						// if (this._icon) {
						// 	this._icon.style[L.DomUtil.TRANSITION] = "";
						// }

						self.options.onEnd.apply(
							self,
							Array.prototype.slice.call(this)
						);
					} else {
						self.animate();
					}
				}.bind(this),
				speed
			);
		},

		getIcon: function () {
			return this._icon;
		},

		// Start the animation
		start: function () {
			this.animating = true;
			this.animate();
		},

		// Stop the animation in place
		stop: function () {
			if (this._tid) {
				clearTimeout(this._tid);
			}
		},

		// Breaks the line up into tiny chunks (see options) ONLY if CSS3 animations
		// are not supported.
		_chunk: function (latlngs) {
			let i,
				len = latlngs.length,
				chunkedLatLngs = [];

			for (i = 1; i < len; i++) {
				let cur = latlngs[i - 1],
					next = latlngs[i],
					dist = cur.distanceTo(next),
					factor = this.options.distance / dist,
					dLat = factor * (next.lat - cur.lat),
					dLng = factor * (next.lng - cur.lng);

				if (dist > this.options.distance) {
					while (dist > this.options.distance) {
						cur = new L.LatLng(cur.lat + dLat, cur.lng + dLng);
						dist = cur.distanceTo(next);
						chunkedLatLngs.push(cur);
					}
				} else {
					chunkedLatLngs.push(cur);
				}
			}
			chunkedLatLngs.push(latlngs[len - 1]);

			return chunkedLatLngs;
		},

		setZ: function (newZ) {
			this.z = newZ;
			this.setForceZIndex(newZ);
			this.redraw();
		},

		setSize: function (newSize) {
			this.size = newSize;
			if (this._map) {
				this._updateWeight(this._map);
			}
		},

		setLine: function (latlngs) {
			if (L.DomUtil.TRANSITION) {
				// No need to chunk up the line if we can animate using CSS3
				this._latlngs = latlngs;
			} else {
				// Chunk up the lines into options.distance bits
				this._latlngs = this._chunk(latlngs);
				this.options.distance = 10;
				this.options.interval = 30;
			}
			this._i = 0;
			return this;
		},

		onAdd: function (map) {
			L.Marker.prototype.onAdd.call(this, map);

			// Start animating when added to the map
			if (this.options.autoStart) {
				this.start();
			}

			map.on("zoomstart", () => {
				const i = this.getIcon();
				if (i) {
					i.style[L.DomUtil.TRANSITION] = "";
					i.style.transition = "";
				}
			});
			map.on("movestart", () => {
				const i = this.getIcon();
				if (i) {
					i.style[L.DomUtil.TRANSITION] = "";
					i.style.transition = "";
				}
			});
			map.on("zoom", this.updateCallback);
			this._map = map;
			this._updateWeight(map);
		},

		onRemove: function (map) {
			map.off("zoom", this.updateCallback);
			L.Marker.prototype.onRemove.call(this, map);
		},

		setClassName: function (newClassName) {
			this.className = newClassName;
			if (this._map) {
				this._updateWeight(this._map);
			}
		},

		setInnerHTML: function (innerHTML) {
			this.innerHTML = innerHTML;
			if (this._map) {
				this._updateWeight(this._map);
			}
		},

		_updateWeight: function (map) {
			const sizeOnScreen = this._getWeight(map);

			const divString = this.render({
				size: sizeOnScreen,
			});

			const icon = new L.DivIcon({
				iconSize: [1, 1],
				className: "zero",
				html: divString,
			});

			this.setIcon(icon);
		},

		_getWeight: function (map) {
			return Math.pow(2, map.getZoom()) * this.size;
		},

		redraw: function () {
			this._updateWeight(this._map);
		},

		_updateZIndex: function (offset) {
			this._icon.style.zIndex = isDefined(this.options.forceZIndex)
				? this.options.forceZIndex + (this.options.zIndexOffset || 0)
				: this._zIndex + offset;
		},

		setForceZIndex: function (forceZIndex) {
			this.options.forceZIndex = isDefined(forceZIndex)
				? forceZIndex
				: null;
		},
	});

	L.CustomMarker = CustomMarker;
}
