var webpack = require("webpack");
var webpackConfig = require("./webpack.config");

webpack(webpackConfig, function(err, stats) {
	if(err) {
		throw err;
	}

	console.log(stats.toString({
		colors: true
	}));
});