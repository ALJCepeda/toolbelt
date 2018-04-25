const babel = require('babel-core');
const bluebird = require('bluebird');
const fs = require('fs');
const write = require('write');

const options = require('./babel.json');
const glob = bluebird.promisify(require('glob'));
const readFile = bluebird.promisify(fs.readFile);

const minifyOptions = Object.assign({
  minified:true
}, options);

glob(`src/**/*.js`).then(files => {
  return bluebird.all(files.map(file => {
    return readFile(file).then(content => {
      const transformed = babel.transform(content.toString(), options);
      const minified = babel.transform(content.toString(), minifyOptions);

      return {
        file:file,
        transform: {
          code:transformed.code,
          map:transformed.map
        },
        minify: {
          code:minified.code,
          map:minified.map
        }
      };
    });
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
