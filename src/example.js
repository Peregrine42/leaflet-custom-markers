import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";

import L from "leaflet";
import "leaflet-fullscreen/dist/Leaflet.fullscreen";

import { customizeMap } from "./index";

class Card {
	constructor({ x = 0, y = 0, z = 0, color = null } = {}) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.color = color;
	}
}

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
	let shadowMarker;
	let deltaLat;
	let deltaLng;
	let target;

	const testCards = [
		new Card({ color: "red", z: 5 }),
		new Card({ color: "green", z: 7 }),
		new Card({ color: "blue", z: 6 }),
	];

	const container = getElementById("container");
	customizeMap(L);
	const map = new L.CustomMap(container, {
		maxZoom: 3,
		fullscreenControl: true,
	});
	map.setMaxBounds(map.getBounds().pad(0.5));
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
					background-image: linear-gradient(45deg, rgb(6, 116, 6) 25%, transparent 25%), linear-gradient(-45deg, rgb(6, 116, 6) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(6, 116, 6) 75%), linear-gradient(-45deg, transparent 75%, rgb(6, 116, 6) 75%);
  					background-size: 100px 100px;
  					background-position: 0 0, 0 50px, 50px -50px, -50px 0px;
				"
			></div>
		`,
	}).addTo(map);

	const testMarkers = testCards.map((c) => {
		const m = new L.CustomMarker({
			x: c.x,
			y: c.y,
			z: c.z,
			innerHTML: `
				<div 
					style="
						position: absolute;
						width: 40px;
						height: 55px;
						background-color: ${c.color};
						border-radius: 1px;
						border-style: solid;
						border-color: black;
					"
				></div>
			`,
		}).addTo(map);
		return m;
	});

	const shadowMoveHandlerTouch = (event) => {
		if (shadowMarker) {
			const latlng = map.mouseEventToLatLng(event);

			const newLat = latlng.lat - deltaLat;
			const newLng = latlng.lng - deltaLng;

			shadowMarker.setLatLng({ lat: newLat, lng: newLng });
		}
	};

	L.DomEvent.on(container, "touchstart", (event) => {
		testMarkers.forEach((testMarker) => {
			if (testMarker.getIcon().contains(event.target)) {
				target = testMarker;
				map.dragging.disable();

				const latlng = map.mouseEventToLatLng(event);
				const bbox = event.target.getBoundingClientRect();

				const centerX = bbox.x + bbox.width / 2;
				const centerY = bbox.y + bbox.height / 2;

				const bboxLatLng = map.mouseEventToLatLng({
					clientX: centerX,
					clientY: centerY,
				});

				deltaLat = latlng.lat - bboxLatLng.lat;
				deltaLng = latlng.lng - bboxLatLng.lng;

				shadowMarker = new L.CustomMarker({
					latlng: bboxLatLng,
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

				L.DomEvent.on(container, "touchmove", shadowMoveHandlerTouch);
			}
		});
	});

	L.DomEvent.on(container, "touchend", (event) => {
		map.dragging.enable();
		L.DomEvent.off(container, "touchmove", shadowMoveHandlerTouch);

		if (shadowMarker) {
			const endLatLng = shadowMarker.getLatLng();
			shadowMarker.remove();
			shadowMarker = undefined;

			if (target) {
				const markers = [background].concat(testMarkers);

				const maxZ = Math.max(...markers.map((m) => m.z));

				console.log(maxZ);

				target.setZ(maxZ + 1);

				const markersRearranged = [...markers].sort((m1, m2) => {
					const a = m1.z;
					const b = m2.z;

					if (a < b) {
						return -1;
					} else {
						return 1;
					}
				});

				markersRearranged.forEach((m, i) => m.setZ(i));
				target.setLine([target.getLatLng(), endLatLng]).start();
			}
		}
	});
}

windowLoad().then(main);
