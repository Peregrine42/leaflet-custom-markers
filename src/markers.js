import L, {
	marker
} from "leaflet"
import {
	MapStateInterface
} from "./map";

const AnimatedMarker = L.Marker.extend({
	options: {
		// meters
		distance: 200,
		// ms
		interval: 70,
		// animate on add?
		autoStart: false,
		// callback onend
		onEnd: function () {

		},
		clickable: false
	},

	initialize: function (options) {
		this.setLine(options.latlngs);
		L.Marker.prototype.initialize.call(this, options.latlngs[0], options);
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

	onAdd: function (map) {
		L.Marker.prototype.onAdd.call(this, map);

		// Start animating when added to the map
		if (this.options.autoStart) {
			this.start();
		}

		map.on("zoom", () => {
			if (!this.animating) {
				this.transitionCache = this._icon.style[L.DomUtil.TRANSITION]
				this._icon.style[L.DomUtil.TRANSITION] = '';
			}
		})

		map.on("zoomend", () => {
			if (!this.animating) {
				this._icon.style[L.DomUtil.TRANSITION] = this.transitionCache;
			}
		})
	},

	animate: function () {
		let self = this,
			len = this._latlngs.length,
			speed = this.options.interval;

		// Normalize the transition speed from vertex to vertex
		if (this._i < len && this.i > 0) {
			speed = this._latlngs[this._i - 1].distanceTo(this._latlngs[this._i]) / this.options.distance * this.options.interval;
		}

		// Only if CSS3 transitions are supported
		if (L.DomUtil.TRANSITION) {
			if (this._icon) {
				this._icon.style[L.DomUtil.TRANSITION] = ('all ' + speed + 'ms linear');
			}
			if (this._shadow) {
				this._shadow.style[L.DomUtil.TRANSITION] = 'all ' + speed + 'ms linear';
			}
		}

		// Move to the next vertex
		this.setLatLng(this._latlngs[this._i]);
		this._i++;

		// Queue up the animation to the next next vertex
		this._tid = setTimeout(() => {
			if (self._i === len) {
				this.animating = false
				self.options.onEnd.apply(self, Array.prototype.slice.call(this));
			} else {
				self.animate();
			}
		}, speed);
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

	setLine: function (latlngs) {
		if (L.DomUtil.TRANSITION) {
			// No need to to check up the line if we can animate using CSS3
			this._latlngs = latlngs;
		} else {
			// Chunk up the lines into options.distance bits
			this._latlngs = this._chunk(latlngs);
			this.options.distance = 10;
			this.options.interval = 30;
		}
		this._i = 0;
		return this;
	}

});

const isDefined = (val) => {
	return typeof (val) !== "undefined" && val !== null
}

const FixedMarker = AnimatedMarker.extend({
	initialize: function (options) {
		this.size = options.size

		const self = this;

		AnimatedMarker.prototype.initialize.call(this, options);
		if (!isDefined(this.size)) {
			throw "No size set"
		}

		this.updateCallback = (function (_e) {
			self._updateWeight(this);
		});

	},

	setSize: function (newSize) {
		this.size = newSize;
		if (this._map) {
			this._updateWeight(this._map)
		}
	},

	onAdd: function (map) {
		AnimatedMarker.prototype.onAdd.call(this, map);
		map.on('zoom', this.updateCallback);
		this._map = map;
		this._updateWeight(map);
	},

	onRemove: function (map) {
		map.off('zoom', this.updateCallback);
		AnimatedMarker.prototype.onRemove.call(this, map);
	},

	setClassName: function (newClassName) {
		this.className = newClassName;
		if (this._map) {
			this._updateWeight(this._map);
		}
	},

	// setBorder: function (newBorder: number) {
	// 	this.border = newBorder
	// 	if (this._map) {
	// 		this._updateWeight(this._map)
	// 	}
	// },

	_updateWeight: function (map) {
		const sizeOnScreen = this._getWeight(map)

		const divString = this.render({
			size: sizeOnScreen
		})

		const icon = new L.DivIcon({
			iconSize: [sizeOnScreen, sizeOnScreen],
			className: "zero",
			html: divString
		})

		this.setIcon(icon)
	},

	_getWeight: function (map) {
		return Math.pow(2, map.getZoom()) * this.size;
	},

	redraw: function () {
		this._updateWeight(this._map)
	}
})

const CustomMarker = FixedMarker.extend({
	initialize: function (options) {
		const {
			map,
			x = 0,
			y = 0,
			maxX = 1000,
			maxY = 1000,
			render = () => {
				return `<div class="marker" style="position: absolute; width: 50px; height: 50px"></div>`
			}
		} = options

		const self = this;

		const latlngs = [
			[-y + (maxX / 2), x + (maxY / 2)]
		];

		this.customOptions = {
			...options,
			latlngs,
			size: 1
		}

		FixedMarker.prototype.initialize.call(this, this.customOptions);

		this.render = (opts) => {
			const inner = render({
				...opts,
				marker: self,
				map
			})
			return `
				<div 
					style="display: flex; 
					justify-content: center; 
					align-items: center; 
					width: 1px; 
					height: 1px; 
					transform: translate(-50%, -50%) 
					scale(${opts.size});"
				>
					${inner}
				</div> 
			`
		}

		this.updateCallback = (function (_e) {
			self._updateWeight(this);
		})
	}
})

export function addMarker(map, options = {}) {
	const newMarker = new CustomMarker({
		map,
		...options
	})
	newMarker.addTo(map)

	return newMarker
}