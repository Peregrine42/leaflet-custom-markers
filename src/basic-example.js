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
	new L.CustomMarker({
		x: -50,
		y: 0,
		innerHTML: `
			<div 
				style="
					position: absolute;
					width: 50px;
					height: 50px;
					background-color: green;
					border-radius: 25px;
					border-style: solid;
					border-color: darkgreen;
				"
			></div>
		`,
	}).addTo(map);

	new L.CustomMarker({
		x: 50,
		y: 0,
		innerHTML: `
			<div 
				style="
					position: absolute;
					width: 50px;
					height: 50px;
					background-color: green;
					border-radius: 25px;
					border-style: solid;
					border-color: darkgreen;
				"
			></div>
		`,
	}).addTo(map);
});
