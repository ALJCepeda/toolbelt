const babel = require('babel-core');
const fs = require('fs');
const write = require('write');
const bluebird = require('bluebird');
const less = require('less');

const readFile = bluebird.promisify(fs.readFile);

const babelOptions = require('./babel.json');
const babelMinifyOptions = Object.assign({
  minified:true
}, babelOptions);

const lessOptions = require('./less.json');
const lessMinifyOptions = Object.assign({
  minified:true
}, lessOptions);

module.exports = {
  copyFile: function(file) {
    return readFile(file).then(content => {
      const strContent = content.toString();

      const destination = file.replace('src', 'dist');
      return write(destination, strContent);
    });
  },
  babelFile: function(file) {
    return readFile(file).then(content => {
      const strContent = content.toString();
      const transformed = babel.transform(strContent, babelOptions);
      const minified = babel.transform(strContent, babelMinifyOptions);

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
    const rootDestination = babeled.file.replace('src/js/', '');

    let promises = [
      write(destination, babeled.transform.code),
      write(mapDestination, JSON.stringify(babeled.transform.map))
    ];

    if(destination.indexOf('dist/tests') === -1) {
      const minifyDestination = destination.replace('.js', '.min.js');
      const minifyMapDestination = `${minifyDestination}.map`;

      promises = promises.concat([
          write(minifyDestination, babeled.minify.code),
          write(minifyMapDestination, JSON.stringify(babeled.minify.map)),
          write(rootDestination, babeled.transform.code)
      ]);
    }

    return bluebird.all(promises);
  },
  lessFile: function(file) {
    return readFile(file).then(content => {
      const strContent = content.toString();

      return bluebird.all([
        less.render(strContent, lessOptions),
        less.render(strContent, lessMinifyOptions)
      ]).then((results) => ({
        file:file,
        less: {
          css:results[0].css,
          map:results[0].map
        },
        minify: {
          css:results[1].css,
          map:results[1].map
        }
      }));
    });
  },
  writeLessed: function(lessed) {
    const destination = lessed.file.replace('src', 'dist').replace(/less/g, 'css');
    const mapDestination = `${destination}.map`;
    const minifyDestination = destination.replace('.css', '.min.css');
    const minifyMapDestination = `${minifyDestination}.map`;

    return bluebird.all([
      write(destination, lessed.less.css),
      write(mapDestination, JSON.stringify(lessed.less.map)),
      write(minifyDestination, lessed.minify.css),
      write(minifyMapDestination, JSON.stringify(lessed.minify.map))
    ]);
  }
};
