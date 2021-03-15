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
			  }
			: undefined,
		entry: {
			bundle: path.join(__dirname, "src", "index.js"),
			"table-example": path.join(__dirname, "src", "table-example.js"),
			"basic-example": path.join(__dirname, "src", "basic-example.js"),
			"map-example": path.join(__dirname, "src", "map-example.js"),
			"stress-test-example": path.join(
				__dirname,
				"src",
				"stress-test-example.js"
			),
		},
		output: {
			path: path.join(__dirname, "dist"),
			filename: "[name].js",
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
	};
};
