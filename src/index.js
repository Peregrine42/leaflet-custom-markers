import {
	CustomMap
} from "./map";

function windowLoad() {
	return new Promise(res => {
		window.addEventListener("load", () => {
			res()
		})
	})
}

function getElementById(id) {
	const el = document.getElementById(id)
	if (!el) {
		throw new Error(`Element with ID ${id} not found.`)
	}
	return el
}

function main() {
	const container = getElementById("container")
	const map = new CustomMap(container)
	map.init()
	map.addMarker()
	map.addMarker({
		x: -50,
		y: -50,
		render: () => `<div style="border-radius: 10px; position: absolute; width: 50px; height: 50px; background-color: orange"></div>`
	})
	map.addMarker({
		x: 50,
		y: 50,
		render: () => `<div style="border-radius: 10px; position: absolute; width: 50px; height: 50px; background-color: orange"></div>`
	})
	map.addMarker({
		x: -50,
		y: 50,
		render: () => `<div style="border-radius: 10px; position: absolute; width: 50px; height: 50px; background-color: orange"></div>`
	})
	map.addMarker({
		x: 50,
		y: -50,
		render: () => `<div style="border-radius: 10px; position: absolute; width: 50px; height: 50px; background-color: orange"></div>`
	})

	map.leafletMap.flyTo([500, 500], 2)
}

windowLoad().then(main)