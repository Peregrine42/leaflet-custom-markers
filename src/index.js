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
		render: () => `<div style="position: absolute; width: 50px; height: 50px; background-color: red"></div>`
	})
	map.addMarker({
		x: 50,
		y: 50,
		render: () => `<div style="position: absolute; width: 50px; height: 50px; background-color: yellow"></div>`
	})
	map.addMarker({
		x: -50,
		y: 50,
		render: () => `<div style="position: absolute; width: 50px; height: 50px; background-color: orange"></div>`
	})
	const moving = map.addMarker({
		x: 300,
		y: -50,
		render: () => `<div style="position: absolute; width: 50px; height: 50px; background-color: blue"></div>`
	})

	moving.setLine([
		[550, 800],
		[550, 550],
	])

	moving.start()

	map.leafletMap.flyTo([500, 500], 2)
}

windowLoad().then(main)