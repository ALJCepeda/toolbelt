class Check {
  constructor() {
    this.standards = new Map([
      [ String, 'string' ],
      [ Number, 'number' ],
      [ Boolean, 'boolean' ],
      [ Symbol, 'symbol' ],
      [ Object, 'object' ],
      [ Array, 'array' ],
      [ Function, 'function' ],
      [ null, 'null' ],
      [ undefined, 'undefined' ]
    ]);

    this.types = new Map([
      [ 'string', {
        test:(value) => [
          typeof value === 'string' || value instanceof String
        ]
      }],
      [ 'number', {
        test:(value) => [
          typeof value === 'number' || value instanceof Number,
          !isNaN(value)
        ]
      }],
      [ 'boolean', {
        test:(value) => [
          typeof value === 'boolean' || value instanceof Boolean
        ]
      }],
      [ 'symbol', {
        test:(value) => [
          typeof value === 'symbol' || value instanceof Symbol
        ]
      }],
      [ 'object', {
        test:(value) => [
          value !== null && value !== undefined && this.standards.get(value.constructor) === 'object'
        ]
      }],
      [ 'array', {
        test:(value) => [
          Array.isArray(value)
        ]
      }],
      [ 'function', {
        test:(value) => [
          typeof value === 'function'
        ]
      }],
      [ 'null', {
        test:(value) => [
          value === null
        ]
      }],
      [ 'undefined', {
        test:(value) => [
          value === undefined
        ]
      }]
    ]);
  }

  isStandard(value, datatype) {
    if(value === datatype) return true;

    const standard = this.standards.get(datatype);
    const type = this.types.get(standard);

    return type.test(value).every(test => test === true);
  }

  runTests(value, type) {
    return type.test(value).every(test => {
      if(this.isStandard(test, String)) {
        return this.isType(value, test);
      } else {
        return test === true;
      }
    });
  }

  isType(value, datatype) {
    if(this.is(datatype, Array)) {
      return this.testArray(value, datatype);
    } else if(this.is(datatype, Object)) {
      return this.testObject(value, datatype);
    } else if(this.types.has(datatype)) {
      const type = this.types.get(datatype);

      if(type.type && !this.isStandard(value, type.type)) {
        //This is not the specified type
        return false;
      }

      return this.runTests(value, type);
    }
  }

  is(value, datatype) {
    const hasStandard = this.standards.has(datatype);
    const isFunction = this.isStandard(datatype, Function);

    if(this.standards.has(value)) {
      //Standard types can only be themselves
      return value === datatype;
    }

    if(!hasStandard && isFunction) {
      //Have a function or a constructor
      if(value instanceof datatype) {
        //Is a constructor that is itself or super
        return true;
      }

      try {
        //Run tests assuming it's a function
        return this.runTests(value, { test:datatype });
      } catch(error) {
        //Was actually a constructor
        return false;
      }
    }

    if(hasStandard) {
      return this.isStandard(value, datatype);
    } else {
      return this.isType(value, datatype);
    }

    return false
  }

  testArray(value, arr) {
    const type = arr[0];
    return value.every(entry => this.is(entry, type));
  }

  testObject(value, obj) {
    if(!this.is(value, Object)) {
      return false;
    }

    for(let key in obj) {
      const type = obj[key];
      const keyValue = value[key];

      if(!this.is(keyValue, type)) {
        return false;
      }
    }

    return true;
  }

  register(name, options, type) {
    if(this.is(options, Function)) {
      options = {
        test:options
      };
    } else {
      options = { ...options };
    }

    if(!this.is(type, undefined)) {
      options.type = type;
    }

    this.types.set(name, options);
  }
}

export default Check;
