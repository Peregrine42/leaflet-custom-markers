import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { customizeMap } from "./index";

window.addEventListener("load", function () {
	const container = document.getElementById("container");
	customizeMap(L);
	const map = new L.CustomMap(container, {
		maxZoom: 3,
		fullscreenControl: true,
		doubleClickZoom: false,
		minZoom: -0.5,
	});
	map.setMaxBounds(map.getBounds().pad(0.5));

	const amount = 16;
	const size = 50;
	const margin = 10;
	for (let j = 0; j < amount; j += 1) {
		for (let i = 0; i < amount; i += 1) {
			new L.CustomMarker({
				x: -((amount / 2) * (size + margin)) + i * (size + margin),
				y: -((amount / 2) * (size + margin)) + j * (size + margin),
				innerHTML: `
					<div 
						style="
							position: absolute;
							width: ${size}px;
							height: ${size}px;
							background-color: green;
							border-radius: 25px;
							border-style: solid;
							border-color: darkgreen;
						"
					></div>
				`,
			}).addTo(map);
		}
	}
});
