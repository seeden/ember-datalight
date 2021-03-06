'use strict';

// Karma configuration
module.exports = function(config) {
    var basePath = '.';

  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: basePath,

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: ['public/lib/jquery/dist/jquery.js', 
      'public/lib/handlebars/handlebars.js', 
      'public/lib/ember/ember.js',
      'node_modules/should/should.js',
      'node_modules/web-error/node_modules/base-error/index.js',
      'node_modules/web-error/index.js',
      'test/require.js',
      'lib/index.js',
      'lib/attribute.js',
      'lib/computedobject.js',
      'lib/modelbase.js',
      'lib/jsonserializer.js',
      'lib/restserializer.js',
      'lib/adapter.js',
      'lib/restadapter.js',
      'lib/model.js',
      'lib/promiseobject.js',
      'lib/wrappers/wrapper.js',
      'lib/wrappers/mixed.js',
      'lib/**/*.js',
      'test/karma/**/*.js'
      ],


    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};