'use strict';

module.exports = function(grunt) {
	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			js: {
				files: ['gruntfile.js',
					'test/**/*.js'],
				tasks: ['jshint'],
				options: {
					livereload: true,
				},
			}
		},
		jshint: {
			all: {
				src: ['gruntfile.js',
					'test/**/*.js',
					'!test/coverage/**/*.js'],
				options: {
					jshintrc: true
				}
			}
		},
		concurrent: {
			tasks: ['watch'],
			options: {
				logConcurrentOutput: true
			}
		},
		mochaTest: {
			options: {
				timeout: 7000,
				reporter: 'spec'
			},
			src: ['test/mocha/**/*.js']
		},
		env: {
			test: {
				NODE_ENV: 'test'
			}
		},
		karma: {
	      unit: {
	        configFile: 'karma.conf.js'
	      }
	    }
	});

	//Load NPM tasks
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-karma');

	//Making grunt default to force in order not to break the project.
	grunt.option('force', true);

	//Default task(s).
	grunt.registerTask('default', ['jshint', 'concurrent']);

	//Test task.
	grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);
};
