import L from "leaflet";

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
	const map = new L.CustomMap(container);
	new L.CustomMarker({ x: 0, y: 0 }).addTo(map);
	new L.CustomMarker({ x: 50, y: 50 }).addTo(map);
	new L.CustomMarker({ x: -50, y: -50 }).addTo(map);
	new L.CustomMarker({ x: -50, y: 50 }).addTo(map);
	new L.CustomMarker({ x: 50, y: -50 }).addTo(map);
}

windowLoad().then(main);
