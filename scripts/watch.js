const bluebird = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const childProcess = require('child_process');

const builder = require('./builder.js');

const glob = bluebird.promisify(require('glob'));

let watchers = [];

const runScript = function(scriptPath, callback) {
    var process = childProcess.fork(scriptPath);

    process.on('error', function (err) {
        console.log(err);
    });

    process.on('exit', function (code) {
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });
}

const runTests = function() {
  runScript('./scripts/test-runner.js', (err) => {
    if(err) {
      console.log(err);
      console.log('Error running tests');
    } else {
      console.log('Finished running tests');
    }
  });
};

const onChange = _.debounce((file) => {
  console.log(`Change to: ${file}`);
  builder.babelFile(file).then(builder.writeBabeled).then(() => {
    console.log('Finished Building');
    console.log('Running Tests');
    runTests();
  });
}, 200);

glob(`src/**/*.js`).then(files => {
  watchers = files.map(file => {
    return fs.watch(file, () => {
      onChange(file);
    });
  });

  console.log('Watching files');
  runTests()
});
