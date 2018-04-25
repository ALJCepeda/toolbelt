const babel = require('babel-core');
const bluebird = require('bluebird');
const fs = require('fs');
const write = require('write');

const options = require('./babel.json');
const glob = bluebird.promisify(require('glob'));
const readFile = bluebird.promisify(fs.readFile);
const transformFile = bluebird.promisify(babel.transformFile);

const minifyOptions = Object.assign({
  minified:true
}, options);

glob(`src/**/*.js`).then(files => {
  return bluebird.all(files.map(file => {
    return bluebird.all([
      transformFile(file, options),
      transformFile(file, minifyOptions)
    ]).then((compiled) => ({
      file:file,
      transform: {
        code:compiled[0].code,
        map:compiled[0].map
      },
      minify: {
        code:compiled[1].code,
        map:compiled[1].map
      }
    }));
  }));
}).then(babeleds => {
  return bluebird.all(babeleds.map(babeled => {
    const destination = babeled.file.replace('src', 'dist');
    const mapDestination = `${destination}.map`;
    const minifyDestination = destination.replace('.js', '.min.js');
    const minifyMapDestination = `${minifyDestination}.map`;

    return bluebird.all([
      write(destination, babeled.transform.code),
      write(mapDestination, JSON.stringify(babeled.transform.map)),
      write(minifyDestination, babeled.minify.code),
      write(minifyMapDestination, JSON.stringify(babeled.minify.map))
    ]);
  }));
});
