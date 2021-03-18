import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

export default [
	// browser-friendly UMD build
	{
		input: "src/index.js",
		output: {
			name: "leafletCustomMarkers",
			file: "dist/main.js",
			format: "umd",
		},
		plugins: [
			resolve(), // so Rollup can find `ms`
			commonjs(), // so Rollup can convert `ms` to an ES module
			babel({
				exclude: ["node_modules/**"],
				babelHelpers: "bundled",
			}),
		],
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: "src/index.js",
		external: ["ms"],
		output: [
			{ file: "dist/main.cjs.js", format: "cjs" },
			{ file: "dist/main.esm.js", format: "es" },
		],
		plugins: [
			babel({
				exclude: ["node_modules/**"],
				babelHelpers: "bundled",
			}),
		],
	},
];
