import "leaflet/dist/leaflet.css";
import L from "leaflet"
import "./lib/SmoothWheelZoom"
import {
	addMarker
} from "./markers";

export class CustomMap {
	leafletMap = null

	constructor(
		container
	) {
		this.container = container
	}

	init({
		maxX = 1000,
		maxY = 1000
	} = {}) {
		const map = L.map(this.container, {
			crs: L.CRS.Simple,
			scrollWheelZoom: false,
			smoothWheelZoom: true,
			doubleClickZoom: false,
			maxZoom: 4,
		})

		const bounds = new L.LatLngBounds([
			[0, 0],
			[maxX, maxY]
		])

		map.fitBounds(bounds)

		this.leafletMap = map
		this.maxX = maxX
		this.maxY = maxY
	}

	addMarker(options) {
		return addMarker(this.leafletMap, {
			...options,
			maxX: this.maxX,
			maxY: this.maxY
		})
	}
}