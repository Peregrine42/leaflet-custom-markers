import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { customizeMap } from "./index";

window.addEventListener("load", function () {
	const container = document.getElementById("container");

	customizeMap(L);

	// const map = new L.CustomMap(container, {
	// 	maxZoom: 3,
	// 	fullscreenControl: true,
	// 	doubleClickZoom: false,
	// 	minZoom: -0.5,
	// });

	const map = new L.CustomMap("container").setView([51.505, -0.09], 13);

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	L.marker([51.5, -0.09])
		.addTo(map)
		.bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
		.openPopup();

	// map.setMaxBounds(map.getBounds().pad(0.5));

	// `innerHTML` determines how the icon will look.
	// The only requirement is to include `position: absolute`,
	// so that the icon's width is used, and not the
	// containing div (which is one pixel in size).
	// This marker will scale with the map,
	// appearing the same relative size.
	new L.CustomMarker({
		latlng: [51.5, -0.09],
		scaleFactor: 10000, // we do this because the projection makes everything tiny.
		innerHTML: `
			<div 
				style="
					position: absolute;
					width: 50px;
					height: 50px;
					background-color: green;
					border-color: darkgreen;
				"
			></div>
		`,
	}).addTo(map);

	// To animate a marker, specify `latlngs` as an array,
	// instead of using `latlng`.
	// new L.CustomMarker({
	// 	latlngs: [
	// 		[51.5, -0.09],
	// 		[51.5, -0.19],
	// 	],
	// 	innerHTML: `
	// 		<div
	// 			style="
	// 				position: absolute;
	// 				width: 5px;
	// 				height: 5px;
	// 				background-color: green;
	// 				border-radius: 25px;
	// 				border-style: solid;
	// 				border-color: darkgreen;
	// 			"
	// 		></div>
	// 	`,
	// })
	// 	.addTo(map)
	// 	.start();
});
