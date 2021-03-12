import L, { map } from "leaflet";

import { customizeMap } from "./index";

function windowLoad() {
	return new Promise((res) => {
		window.addEventListener("load", () => {
			res();
		});
	});
}

function getElementById(id) {
	const el = document.getElementById(id);
	if (!el) {
		throw new Error(`Element with ID ${id} not found.`);
	}
	return el;
}

function main() {
	const container = getElementById("container");
	customizeMap(L);
	const map = new L.CustomMap(container, {
		maxZoom: 4,
	});
	map.setMaxBounds(map.getBounds());
	const background = new L.CustomMarker({
		x: 0,
		y: 0,
		innerHTML: `
			<div 
				style="
					position: absolute;
					width: 500px;
					height: 500px;
					background-color: green;
					border-radius: 250px;
					border-style: solid;
					border-color: darkgreen;
				"
			></div>
		`,
	}).addTo(map);

	const testMarker = new L.CustomMarker({
		x: 0,
		y: 0,
		z: 1,
		innerHTML: `
			<div 
				style="
					position: absolute;
					width: 40px;
					height: 55px;
					background-color: brown;
					border-radius: 1px;
					border-style: solid;
					border-color: black;
				"
			></div>
		`,
	}).addTo(map);

	let shadowMarker;

	const shadowMoveHandler = (event) => {
		console.log("hi");
		shadowMarker.setLatLng(event.latlng);
	};

	testMarker.on("mousedown", () => {
		map.dragging.disable();

		shadowMarker = new L.CustomMarker({
			x: testMarker.customOptions.x,
			y: testMarker.customOptions.y,
			z: 9999,
			innerHTML: `
				<div 
					style="
						position: absolute;
						width: 40px;
						height: 55px;
						background-color: brown;
						border-radius: 1px;
						border-style: solid;
						border-color: black;
						opacity: 0.4;
					"
				></div>
			`,
		}).addTo(map);

		map.on("mousemove", shadowMoveHandler);
	});

	map.on("mouseup", () => {
		map.dragging.enable();

		if (shadowMarker) {
			shadowMarker.remove();
			map.off("mousemove", shadowMoveHandler);
			shadowMarker = undefined;
		}
	});
}

windowLoad().then(main);
