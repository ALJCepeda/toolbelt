export default {
  // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffle: function(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },
  findMissingIndexes: function(array, start, end) {
    const missing = [];
    for(let i=start; i<end; i++) {
      if(array[i] === undefined || array[i] === null) {
        missing.push(i);
      }
    }

    return missing;
  },
  rangeFromOffset: function(offset, limit, max = 0) {
    let start = offset;
    let end = offset + limit;

    if(limit < 0) {
      start = end;
      end = offset;

      if(start < 0) {
        start = 0;
        end = end + Math.abs(start);
      }
    }

    if(max !== 0 && end > max) {
      end = max;
    }

    return { start, end };
  },
  once: function(fn, context) {
		var result;
		return function() {
			if(fn) {
				result = fn.apply(context || this, arguments);
				fn = null;
			}
			return result;
		};
	},
  isNil(value) {
    return value === null || value === undefined;
  }
};
