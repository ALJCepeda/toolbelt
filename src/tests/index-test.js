import redtape from 'redtape';
import util from './../js/util';

const test = redtape();

test('Testing findMissingIndexes', t => t.end());
test('should find all missing indexes', (t) => {
  const arr = [];
  arr[3] = true;
  arr[6] = true;
  arr[7] = true;
  arr[0] = null;
  arr[5] = null;

  const result = util.findMissingIndexes(arr, 0, 10);
  t.looseEqual(result, [0, 1, 2, 4, 5, 8, 9 ]);
  t.end();
});

test('Testing rangeFromList', t => t.end());
test('should create range', (t) => {
  const result = util.rangeFromOffset(5, 5);
  t.looseEqual(result, { start:5, end:10 });
  t.end();
});

test('should adjust range to max', (t) => {
  const result = util.rangeFromOffset(10, 10, 13);
  t.looseEqual(result, { start:10, end:13 });
  t.end();
});

test('should accept negatives for limit', (t) => {
  const result = util.rangeFromOffset(10, -7);
  t.looseEqual(result, { start:3, end:10 });
  t.end();
});

test('should adjust range when negative limit dips below 0', (t) => {
  const result = util.rangeFromOffset(4, -7);
  t.looseEqual(result, { start:0, end:4 });
  t.end();
});
