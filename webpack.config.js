const path = require("path");

module.exports = ({ development }) => {
	return {
		mode: development ? "development" : "production",
		devtool: development ? "source-map" : undefined,
		devServer: development
			? {
					contentBase: path.join(__dirname, "dist"),
					compress: true,
					port: 8888,
			  }
			: undefined,
		entry: {
			bundle: path.join(__dirname, "src", "index.js"),
			example: path.join(__dirname, "src", "example.js"),
		},
		output: {
			path: path.join(__dirname, "dist", "js"),
			filename: "[name].js",
		},
		resolve: {
			extensions: [".js"],
		},
		module: {
			rules: [
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
					test: /\.css$/i,
					use: ["style-loader", "css-loader"],
				},
				{
					test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
					loader: "url-loader",
					options: {
						limit: 8192,
					},
				},
			],
		},
	};
};
