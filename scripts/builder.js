const babel = require('babel-core');
const fs = require('fs');
const write = require('write');
const bluebird = require('bluebird');
const readFile = bluebird.promisify(fs.readFile);
const options = require('./babel.json');

const minifyOptions = Object.assign({
  minified:true
}, options);

module.exports = {
  babelFile: function(file) {
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
  },
  writeBabeled: function(babeled) {
    const destination = babeled.file.replace('src', 'dist');
    const mapDestination = `${destination}.map`;

    let promises = [
      write(destination, babeled.transform.code),
      write(mapDestination, JSON.stringify(babeled.transform.map))
    ];

    if(destination.indexOf('dist/tests') === -1) {
      const minifyDestination = destination.replace('.js', '.min.js');
      const minifyMapDestination = `${minifyDestination}.map`;

      promises = promises.concat([
          write(minifyDestination, babeled.minify.code),
          write(minifyMapDestination, JSON.stringify(babeled.minify.map))
      ]);
    }

    return bluebird.all(promises);
  }
};
