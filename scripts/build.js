const bluebird = require('bluebird');
const builder = require('./builder.js');

const glob = bluebird.promisify(require('glob'));
const rimraf = bluebird.promisify(require('rimraf'));

let watchers = [];

rimraf('dist').then(() => {
  return glob('src/**/*.js');
}).then(files => {
  return bluebird.all(files.map(builder.babelFile));
}).then(babeleds => {
  return bluebird.all(babeleds.map(builder.writeBabeled));
});
