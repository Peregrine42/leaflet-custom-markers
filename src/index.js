import { SmoothWheelZoom } from "./SmoothWheelZoom";
import { AddCustomMarkers } from "./AddCustomMarkers";

export function customizeMap(L, { maxX = 1000, maxY = 1000 } = {}) {
	SmoothWheelZoom(L);
	AddCustomMarkers(L);

	const CustomMap = L.Map.extend({
		initialize: function (container, options) {
			L.Map.prototype.initialize.call(this, container, {
				scrollWheelZoom: false,
				smoothWheelZoom: true,
				doubleClickZoom: false,
				zoomSnap: false,
				...options,
			});

			const bounds = new L.LatLngBounds([
				[0, 0],
				[maxX, maxY],
			]);

			this.fitBounds(bounds);
		},
	});

	L.CustomMap = CustomMap;
}
