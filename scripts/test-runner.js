const runTests = (tests, solo) => {
  if(solo) {
    require(`../src/tests/${solo}`);
    return;
  }

  tests.forEach(test => {
    require(`../src/tests/${test}`);
  });
};

runTests([
  'index-test.js',
  'check-tests.js'
], 'check-tests.js');
