import { customizeMap } from "../src/index";

window.addEventListener("load", function () {
	customizeMap(L);

	const map = new L.CustomMap("container").setView([51.505, -0.09], 13);

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	L.marker([51.5, -0.09])
		.addTo(map)
		.bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
		.openPopup();

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
			[51.5, -0.09],
			[51.5, -0.1],
		],
		scaleFactor: 10000,
		innerHTML: `
			<div
				style="
					position: absolute;
					width: 50px;
					height: 50px;
					background-color: green;
					border-radius: 50px;
					border-style: solid;
					border-color: darkgreen;
				"
			></div>
		`,
	})
		.addTo(map)
		.start();
});
