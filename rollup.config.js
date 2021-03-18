import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy";

const browser = [
	"src/index.js",
	"example/stress-test-example.js",
	"example/map-example.js",
	"example/table-example.js",
].map((inp, i) => {
	return {
		input: inp,
		output: {
			name: "leafletCustomMarkers",
			dir: "dist/",
			format: "umd",
		},
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: ["node_modules/**"],
				babelHelpers: "bundled",
			}),
			i === 0
				? copy({
						targets: [
							{
								src: "node_modules/leaflet/dist/**/*",
								dest: "dist/leaflet",
							},
						],
						targets: [
							{
								src:
									"node_modules/leaflet-fullscreen/dist/**/*",
								dest: "dist/leaflet-fullscreen",
							},
						],
				  })
				: null,
		],
	};
});

export default [...browser];
