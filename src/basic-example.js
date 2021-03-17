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
		crs: L.CRS.Simple,
		zoom: 0,
		center: [500, 500],
	});

	// `innerHTML` determines how the icon will look.
	// The only requirement is to include `position: absolute`,
	// so that the icon's width is used, and not the
	// containing div (which is one pixel in size).
	// This marker will scale with the map,
	// appearing the same relative size.
	new L.CustomMarker({
		latlng: [500 - 0, 500 - 50],
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

	// To animate a marker, specify `latlngs` as an array,
	// instead of using `latlng`.
	new L.CustomMarker({
		latlngs: [
			[500 - 0, 500 + 50],
			[500 - 50, 500 + 100],
		],
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
	})
		.addTo(map)
		.start();
});
