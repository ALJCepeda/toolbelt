function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function isNumber(value) {
  return (typeof value === 'number' || value instanceof Number) && !isNaN(value);
}

function isBoolean(value) {
  return typeof value === 'boolean' || value instanceof Boolean;
}

function isSymbol(value) {
  return typeof value === 'symbol' || value instanceof Symbol;
}

function isObject(value) {
  return value !== null && value !== undefined && value.constructor === Object;
}

function isArray(value) {
  return Array.isArray(value);
}

function isFunction(value) {
  return typeof value === 'function';
}

function isNull(value) {
  return value === null;
}

function isUndefined(value) {
  return value === undefined;
}

function isNil(value) {
  return isNull(value) || isUndefined(value);
}

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
        assert:(value) => [ isString(value) ]
      }],
      [ 'number', {
        assert:(value) => [ isNumber(value) ]
      }],
      [ 'boolean', {
        assert:(value) => [ isBoolean(value) ]
      }],
      [ 'symbol', {
        assert:(value) => [ isSymbol(value) ]
      }],
      [ 'object', {
        assert:(value) => [ isObject(value) ]
      }],
      [ 'array', {
        assert:(value) => [ isArray(value) ]
      }],
      [ 'function', {
        assert:(value) => [ isFunction(value) ]
      }],
      [ 'null', {
        assert:(value) => [ isNull(value) ]
      }],
      [ 'undefined', {
        assert:(value) => [ isUndefined(value) ]
      }],
      [ 'nil', {
        assert:(value) => [ isNil(value) ]
      }]
    ]);
  }

  isStandard(value, datatype) {
    if(value === datatype) return true;

    const standard = this.standards.get(datatype);
    const type = this.types.get(standard);

    return type.assert(value).every(test => test === true);
  }

  runTests(value, type, startTest) {
    const getError = function({error, value, index, type}) {
      if(isFunction(error)) {
        error = error(value, index, type);
      }

      if(isString(error)) {
        return error;
      } else {
        return null;
      }
    };

    return type.assert(value).map((test, index) => {
      if(isBoolean(test)) {
        return test === true;
      } else if(isString(test)) {
        return this.isType(value, test);
      } else if(isObject(test)) {
        let isValid = false;

        if(isString(test.assert)) {
          isValid = this.isType(value, test, startTest || test);
        } else if(!test.assert) {
          let errorStr = null;

          if(isObject(startTest) && !isNil(startTest.error)) {
            errorStr = getError({ error:startTest.error, value, index, type });

            if(isNull(errorStr)) {
              errorStr = getError({ error:test.error, value, index, type });
            }
          } else {
            errorStr = getError({ error:test.error, value, index, type });
          }

          if(isString(errorStr)) {
            this.errors.push(errorStr);
          }
        }

        return test.assert;
      } else {
        throw new Exception('Invalid assertion encountered');
      }
    });
  }

  isType(value, datatype, startTest) {
    debugger;
    if(isArray(datatype)) {
      return this.assertArray(value, datatype, startTest);
    } else if(isObject(datatype)) {
      debugger;
      return this.assertObject(value, datatype, startTest);
    } else if(this.types.has(datatype)) {
      const type = this.types.get(datatype);

      if(type.type && !this.isStandard(value, type.type)) {
        //This is not the specified type
        return false;
      }

      return this.runTests(value, type, startTest).every(test => test === true);
    }
  }

  is(value, datatype, errorCB) {
    this.errors = [];
    const isValid = this._is(value, datatype);

    if(isFunction(errorCB)) {
      errorCB(this.errors);
    }

    return isValid
  }

  _is(value, datatype, startTest) {
    const hasStandard = this.standards.has(datatype);

    if(this.standards.has(value)) {
      //Standard types can only be themselves
      return value === datatype;
    }

    if(!hasStandard && isFunction(datatype)) {
      //Have a function or a constructor
      if(value instanceof datatype) {
        //Is a constructor that is itself or super
        return true;
      }

      try {
        //Run tests assuming it's a function
        return this.runTests(value, { assert:datatype }, startTest).every(test => test === true);
      } catch(error) {
        //Was actually a constructor
        return false;
      }
    }

    if(hasStandard) {
      return this.isStandard(value, datatype);
    }

    if(isObject(datatype) && isString(datatype.assert)) {
      startTest = startTest || datatype;
      return this.isType(value, datatype.assert, startTest);
    }

    return this.isType(value, datatype, startTest);
  }

  assertArray(value, arr, startTest) {
    const type = arr[0];
    return value.map(entry => this._is(entry, type, startTest)).every(test => test === true);
  }

  assertObject(value, obj, startTest) {
    if(!isObject(value)) {
      return false;
    }

    const tests = [];
    for(let key in obj) {
      const type = obj[key];
      const keyValue = value[key];

      const isValid = this._is(keyValue, type, startTest);
      tests.push(isValid);
    }

    return tests.every(test => test === true);
  }

  register(name, options, type) {
    if(isFunction(options)) {
      options = {
        assert:options
      };
    } else {
      options = { ...options };
    }

    if(!isUndefined(type)) {
      options.type = type;
    }

    this.types.set(name, options);
  }
}

export default Check;
