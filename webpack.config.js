const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = ({ development }) => {
	return {
		mode: development ? "development" : "production",
		devtool: development ? "source-map" : undefined,
		devServer: development
			? {
					contentBase: [path.join(__dirname, "dist")],
					compress: true,
					port: 8888,
					writeToDisk: true,
			  }
			: undefined,
		entry: path.join(__dirname, "src", "index.js"),
		output: {
			path: path.join(__dirname, "dist"),
			filename: "[name].js",
			library: {
				name: "leafletCustomMarkers",
				type: "umd",
			},
			globalObject: `(typeof self !== 'undefined' ? self : this)`,
			umdNamedDefine: true,
		},
		resolve: {
			extensions: [".js"],
		},
		module: {
			rules: [
				{
					test: /\.(png|svg|jpg|gif)$/,
					use: {
						loader: "file-loader",
						options: {
							name: "[path][name].[ext]",
						},
					},
				},
				{
					test: /\.m?js$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env"],
						},
					},
				},
				{
					test: /\.css$/,
					use: ["style-loader", "css-loader"],
				},
			],
		},
		plugins: [
			new CopyPlugin({
				patterns: [
					{
						from: path.join(
							__dirname,
							"node_modules",
							"leaflet",
							"dist"
						),
						to: path.join(__dirname, "dist", "leaflet"),
					},
				],
			}),
		],
	};
};
