const merge = require("webpack-merge");
const { spawn } = require("child_process");
const webConfigs = require("../webpack.config");

const config = merge(webConfigs, {
	target: "electron-renderer",
	devServer: {
		open: false,
		before: function () {
			spawn("electron", ["./desktop"], {
				shell: true,
				env: process.env,
				stdio: "inherit",
			})
				.on("close", (code) => process.exit(0))
				.on("error", (spawnError) => console.error(spawnError));
		},
	},
});

module.exports = config;
