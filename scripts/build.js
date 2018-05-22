const bluebird = require('bluebird');
const globby = require('globby');
const _ = require('lodash');

const builder = require('./builder.js');
const rimraf = bluebird.promisify(require('rimraf'));

let watchers = [];

rimraf('dist').then(() => {
  const buildJS = globby('src/**/*.js').then(files => {
    return bluebird.all(files.map(builder.babelFile));
  }).then(babeleds => {
    return bluebird.all(babeleds.map(builder.writeBabeled));
  });

  const buildLess = globby('src/**/*.less').then(files => {
    files = _.without(files, 'src/less/resources/mixins.less', 'src/less/resources/sizes.less');

    return bluebird.all(files.map(builder.lessFile));
  }).then(lessed => {
    return bluebird.all(lessed.map(builder.writeLessed));
  });

  const copyLess = globby('src/**/*.less').then(files => {
    return bluebird.all(files.map(builder.copyFile));
  });

  return bluebird.all([ buildJS, buildLess, copyLess ]);
})
