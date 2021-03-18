import { SmoothWheelZoom } from "./SmoothWheelZoom";
import { AddCustomMarkers } from "./AddCustomMarkers";

export function customizeMap(L) {
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
		},
	});

	L.CustomMap = CustomMap;
}
