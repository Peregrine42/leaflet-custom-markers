import { customizeMap } from "../src/index";

class Card {
	constructor({ id, x = 0, y = 0, z = 0, color = null, image = null } = {}) {
		this.id = "card-" + id;
		this.x = x;
		this.y = y;
		this.z = z;
		this.color = color;
		this.image = image;
		this.kind = "card";
	}
}

class Stack {
	constructor({
		id,
		staggered = false,
		x = 0,
		y = 0,
		z = 0,
		color = null,
	} = {}) {
		this.id = "stack-" + id;
		this.x = x;
		this.y = y;
		this.z = z;
		this.color = color;
		this.staggered = staggered;
		this.kind = "stack";
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

function findById(id, stacks) {
	const result = stacks.find((s) => s.customOptions.id === id);
	if (!result) {
		throw "Could not find stack with ID: " + id;
	}
	return result;
}

function main() {
	let shadowMarker;
	let deltaLat;
	let deltaLng;
	let target;
	let startDragLatLng;
	let endDragLatLng;
	let selected;

	const testCards = [
		new Card({ id: "red", color: "red", z: 5 }),
		new Card({
			id: "image",
			color: "green",
			z: 7,
			image: "/img/test-image.jpeg",
		}),
		new Card({ id: "blue", color: "blue", z: 6 }),
		new Card({ id: "orange", color: "orange", z: 8 }),
	];

	const testStacks = [
		new Stack({
			id: "north",
			staggered: true,
			x: 0,
			y: -200,
			color: "orange",
			z: 9990,
		}),
		new Stack({ id: "south", x: 0, y: 200, color: "orange", z: 9991 }),
		new Stack({ id: "east", x: 200, y: 0, color: "orange", z: 9992 }),
		new Stack({ id: "west", x: -200, y: 0, color: "orange", z: 9993 }),
	];

	const container = getElementById("container");
	customizeMap(L);
	const map = new L.CustomMap(container, {
		maxZoom: 3,
		fullscreenControl: true,
		doubleClickZoom: false,
		center: [500, 500],
		minZoom: -0.5,
		zoom: -0.5,
		crs: L.CRS.Simple,
	});

	const background = new L.CustomMarker({
		latlng: [0 + 500, 0 + 500],
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

	const cardInnerHTML = (c) => {
		let backgroundImage = "";

		if (c.image) {
			backgroundImage = `
				background-image: url(${c.image});
				background-repeat: no-repeat;
				background-position: center;
				background-size: contain;
			`;
		}

		return `
			<div 
				data-id=${c.id}
				style="
					position: absolute;
					width: 40px;
					height: 55px;
					background-color: ${c.image ? "transparent" : c.color};
					border-radius: 3px;
					border-style: solid;
					border-color: ${c.selected ? "orange" : "black"};
					border-width: ${c.image && !c.selected ? "0px" : "1px"};
					${backgroundImage}
				"
			></div>
		`;
	};

	// const testMarkers = [];
	const testMarkers = testCards.map((c) => {
		return new L.CustomMarker({
			id: c.id,
			latlng: [500 - c.y, 500 + c.x],
			z: c.z,
			stackedBy: null,
			kind: c.kind,
			innerHTML: cardInnerHTML(c),
		}).addTo(map);
	});

	const testStackMarkers = testStacks.map((s) => {
		const m = new L.CustomMarker({
			id: s.id,
			latlng: [500 - s.y, 500 + s.x],
			z: s.z,
			staggered: s.staggered,
			stacked: [],
			kind: s.kind,
			innerHTML: `
				<div
					data-id=${s.id}
					style="
						position: absolute;
						width: 150px;
						height: 150px;
						display: flex;
						justify-content: center;
						align-items: center;
						border-radius: 75px;
						opacity: 0.2;
					"
				>
					<div
						data-id=${s.id}
						style="
							width: 25px;
							height: 25px;
							background-color: ${s.color};
							border-radius: 50px;
							border-style: solid;
							border-color: white;
							border-width: 3px;
						"
					>
					</div>
				</div>
			`,
		}).addTo(map);

		// const m = L.marker([500 - s.y, 500 + s.x]).addTo(map);

		m.getIcon().style.pointerEvents = "none";
		return m;
	});

	testStackMarkers.forEach((s) => {
		testMarkers.forEach((m) => {
			if (
				s.getLatLng() === m.getLatLng() &&
				m.customOptions.stackedBy === null
			) {
				m.stackedBy = s;
				s.customOptions.stacked.push(m);
			}
		});
	});

	const shadowMoveHandlerTouch = (event) => {
		if (shadowMarker) {
			const latlng = map.mouseEventToLatLng(event);

			const newLat = latlng.lat - deltaLat;
			const newLng = latlng.lng - deltaLng;

			shadowMarker.setLatLng({ lat: newLat, lng: newLng });

			testStackMarkers.forEach(
				(s) => (s.getIcon().style.pointerEvents = "all")
			);
		}
	};

	L.DomEvent.on(container, "touchstart", (event) => {
		testMarkers.forEach((testMarker) => {
			if (testMarker.customOptions.id === event.target.dataset.id) {
				target = testMarker;
				map.dragging.disable();

				const latlng = map.mouseEventToLatLng(event);
				startDragLatLng = latlng;
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
					innerHTML: testMarker.innerHTML,
				}).addTo(map);

				shadowMarker.getIcon().style.opacity = 0.4;
				shadowMarker.getIcon().style.pointerEvents = "none";

				L.DomEvent.on(container, "touchmove", shadowMoveHandlerTouch);
			}
		});
	});

	L.DomEvent.on(container, "touchend", (event) => {
		map.dragging.enable();
		L.DomEvent.off(container, "touchmove", shadowMoveHandlerTouch);

		if (shadowMarker) {
			shadowMarker.remove();
			shadowMarker = undefined;

			const currentTarget = document.elementFromPoint(
				event.clientX,
				event.clientY
			);

			if (currentTarget && currentTarget.dataset.id) {
				if (target) {
					const latlng = map.mouseEventToLatLng(event);
					endDragLatLng = latlng;

					const distance = map.distance(
						startDragLatLng,
						endDragLatLng
					);
					const threshold = 10;

					if (distance > threshold) {
						let stackMarker;

						try {
							stackMarker = findById(
								currentTarget.dataset.id,
								testStackMarkers
							);
						} catch {
							stackMarker = findById(
								currentTarget.dataset.id,
								testMarkers
							);
							while (
								stackMarker &&
								stackMarker.customOptions.kind !== "stack"
							) {
								stackMarker =
									stackMarker.customOptions.stackedBy;
							}
						}

						if (target.customOptions.stackedBy !== stackMarker) {
							const markers = [background].concat(testMarkers);

							const maxZ = Math.max(...markers.map((m) => m.z));

							target.setZ(maxZ + 1);

							const markersRearranged = [...markers].sort(
								(m1, m2) => {
									const a = m1.z;
									const b = m2.z;

									if (a < b) {
										return -1;
									} else {
										return 1;
									}
								}
							);

							markersRearranged.forEach((m, i) => m.setZ(i));

							if (target.customOptions.stackedBy) {
								const i = target.customOptions.stackedBy.customOptions.stacked.findIndex(
									(m) =>
										m.customOptions.id ===
										target.customOptions.id
								);

								target.customOptions.stackedBy.customOptions.stacked.splice(
									i,
									1
								);

								refreshStack(target.customOptions.stackedBy);
							}
							target.customOptions.stackedBy = stackMarker;
							stackMarker.customOptions.stacked.push(target);
							refreshStack(stackMarker);
						}
					} else {
						const c = testCards.find(
							(c) => c.id === target.customOptions.id
						);
						if (c) {
							if (selected) {
								selected.selected = false;
								const marker = testMarkers.find(
									(m) => m.customOptions.id === selected.id
								);

								marker.setInnerHTML(cardInnerHTML(selected));
							}
							selected = c;
							c.selected = true;
							target.setInnerHTML(cardInnerHTML(c));
						}
					}
				}
			}
		}

		testStackMarkers.forEach((s) => {
			s.getIcon().style.pointerEvents = "none";
		});
	});
}

function refreshStack(s) {
	if (s.customOptions.staggered) {
		let base = s.getLatLng().clone();
		s.customOptions.stacked.forEach((m) => {
			m.setLine([m.getLatLng(), base]).start();
			base = base.clone();
			base.lat -= 20;
			base.lng += 20;
		});
	} else {
		const base = s.getLatLng().clone();
		s.customOptions.stacked.forEach((m) => {
			m.setLine([m.getLatLng(), base]).start();
		});
	}
}

windowLoad().then(main);
