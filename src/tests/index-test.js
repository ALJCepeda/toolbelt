import toolbelt from './../index.js';

describe('toolbelt.js', () => {
  describe('findMissingIndexes', () => {
    it('should find all missing indexes', () => {
      const arr = [];
      arr[3] = true;
      arr[6] = true;
      arr[7] = true;
      arr[0] = null;
      arr[5] = null;

      const result = toolbelt.findMissingIndexes(arr, 0, 10);
      expect(result).toEqual([0, 1, 2, 4, 5, 8, 9 ]);
    });
  });

  describe('rangeFromLimit', () => {
    it('should create range', () => {
      const result = toolbelt.rangeFromOffset(5, 5);
      expect(result).toEqual({ start:5, end:10 });
    });

    it('should adjust range to max', () => {
      const result = toolbelt.rangeFromOffset(10, 10, 13);
      expect(result).toEqual({ start:10, end:13 });
    });

    it('should accept negatives for limit', () => {
      const result = toolbelt.rangeFromOffset(10, -7);
      expect(result).toEqual({ start:3, end:10 });
    });

    it('should adjust range when negative limit dips below 0', () => {
      const result = toolbelt.rangeFromOffset(4, -7);
      expect(result).toEqual({ start:0, end:4 });
    })
  });
});
