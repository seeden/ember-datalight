module.exports = {
	watch: true,
	entry:  ['./lib/model', './lib/adapter', './lib/index'],
	output: {
		path: './dist/',
		publicPath: '/public/dist/',
		filename: 'ember-datalight.js',
		library: 'ember-datalight',
		libraryTarget: 'umd'
	},
	resolve: {
		modulesDirectories: ['node_modules', 'public/lib'],
		alias: {
		}
	},
	plugins: [
  		//new webpack.optimize.UglifyJsPlugin()
	],
	externals: {
        ember: "Ember"
    },
	devtool: 'source-map'				
};