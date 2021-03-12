import "leaflet/dist/leaflet.css";
import { SmoothWheelZoom } from "./SmoothWheelZoom";
import { AddCustomMarkers } from "./AddCustomMarkers";

export function customizeMap(L, { maxX = 1000, maxY = 1000 } = {}) {
	SmoothWheelZoom(L);
	AddCustomMarkers(L, maxX, maxY);

	const CustomMap = L.Map.extend({
		initialize: function (container, options) {
			console.log(container, options);
			L.Map.prototype.initialize.call(this, container, {
				...options,
				crs: L.CRS.Simple,
				scrollWheelZoom: false,
				smoothWheelZoom: true,
				doubleClickZoom: false,
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
