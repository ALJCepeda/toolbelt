import redtape from 'redtape';
import sinon from 'sinon';

import Check from './../js/check';

let check;

const should = redtape({
  beforeEach(cb) {
    check = new Check();
    cb();
  }
});

should('Testing Check', t => t.end());
should('identify primitives', (t) => {
  var nodefined;
  const isnull = null;
  const isnan = 'num'/12;

  t.true(check.is('String', String));
  t.true(check.is(101, Number));
  t.true(check.is(true, Boolean));
  t.true(check.is({ moo:'cow' }, Object));
  t.true(check.is([ 1 ], Array));
  t.true(check.is(nodefined, undefined));
  t.true(check.is(isnull, null));
  t.true(check.is(new Map(), Map));
  t.true(check.is(new Set(), Set));
  t.true(check.is(/regex/, RegExp));
  t.true(check.is(new String('string'), String));
  t.true(check.is(new Number(1), Number));
  t.true(check.is(Map, Function));

  t.false(check.is(0, Boolean));
  t.false(check.is('1', Number));
  t.false(check.is([ 1 ], Object));
  t.false(check.is(false, Number));
  t.false(check.is({ 1:'2' }, Array));
  t.false(check.is(null, Object));
  t.false(check.is(null, undefined));
  t.false(check.is(new String('string object'), Object));
  t.false(check.is(new Number(1), Object));
  t.false(check.is(new Map(), Object));
  t.false(check.is(/regex/, Object));
  t.false(check.is(isnan, Number));
  t.false(check.is(Map, Set));
  t.false(check.is(String, Function));

  t.end();
});

should('test against registerd types', (t) => {
  check.register('length', (value) => [
    value.length > 3
  ]);

  t.true(check.is('OfLength', 'length'));
  t.false(check.is('No', 'length'));

  t.end();
});

should('use nested types', (t) => {
  check.register('length', (value) => [
    value.length > 3
  ]);

  check.register('lowercase', (value) => [
    value === value.toLowerCase()
  ]);

  check.register('username', (value) => [
    'length',
    'lowercase'
  ], String);

  t.true(check.is('thename', 'username'));
  t.end();
});

should('check properties are standard types', (t) => {
  const result = check.is({
    name:'Alfred',
    age: 29,
    active: true,
    config: { admin:true },
    skills: [ 'developing' ]
  }, {
    name:String,
    age:Number,
    active:Boolean,
    config:Object,
    skills:Array
  });

  t.true(result);
  t.end();
});

should('check properties are inline custom types', (t) => {
  const result = check.is({
    name:'alfred',
    age:29,
    active:true
  }, {
    name:(name) => [ name.length > 3, name === name.toLowerCase() ],
    age:(age) => [ age > 18, age < 32 ],
    active:(active) => [ active === true ]
  });

  t.true(result);
  t.end();
});

should('check properties for registered types', (t) => {
  check.register('name', (name) => [
    name.length > 3,
    name === name.toLowerCase()
  ]);

  check.register('age', (age) => [
    age > 18,
    age < 32
  ]);

  check.register('active', (active) => [ active === true ]);

  const result = check.is({
    name:'alfred',
    age:29,
    active:true
  }, {
    name:'name',
    age:'age',
    active:'active'
  });

  t.true(result);
  t.end();
});

should('validate array of primitives', (t) => {
  t.true(check.is([ 1, 2, 3 ], [ Number ]));
  t.end();
});

should('validate array of assertions', (t) => {
  t.true(check.is(['name1', 'name2', 'name3'], [(value) => [
    value.length > 3,
    value === value.toLowerCase()
  ]]));

  t.false(check.is(['name1', 'name2', 'no'], [(value) => [
    value.length > 3,
    value === value.toLowerCase()
  ]]));

  t.end();
});

should('validate array of registered types', (t) => {
  check.register('name', (name) => [
    name.length > 3,
    name === name.toLowerCase()
  ]);

  t.true(check.is(['name1', 'name2', 'name3'], [ 'name' ]));
  t.false(check.is(['name1', 'name2', 'no'], [ 'name' ]));
  t.end();
});

should('validate custom class', (t) => {
  class Test {
    constructor(value) {
      this.prop = value;
    }
  }

  const inst = new Test();

  t.true(check.is(inst, Test));
  t.false(check.is(inst, Object));
  t.end();
});

should('validate subclass of class', (t) => {
  class Test {
    constructor(value) {
      this.prop = value;
    }
  }

  class Exam extends Test {
    constructor(value, question) {
      super(value);

      this.question = question;
    }
  }

  const inst = new Exam();

  t.true(check.is(inst, Exam));
  t.true(check.is(inst, Test));
  t.false(check.is(inst, Object));
  t.end();
});

should('record errors when provided in check', (t) => {
  check.register('name', (name) => [
    { assert:name.length > 3, error:'Name must be great than 3 characters' },
    { assert:name === name.toLowerCase(), error:'Name must be in all lowercase' }
  ]);

  check.register('age', (age) => [
    { assert:age > 18, error:'You must be 18 years or older' }
  ]);

  const result = check.is({
    name:'No',
    age:15
  }, {
    name:'name',
    age:'age'
  });

  t.false(result);
  t.deepEqual(check.errors, [
    'Name must be great than 3 characters',
    'Name must be in all lowercase',
    'You must be 18 years or older'
  ]);
  t.end();
});

should('handle individual errors in check tests', (t) => {
  const nameError = sinon.spy();
  const ageError = sinon.spy();

  const result = check.is({
    name:'No',
    age:15
  }, {
    name:(name) => [
      { assert:name > 3, error:nameError },
      { assert:name === name.toLowerCase(), error:nameError }
    ],
    age:(age) => [
      { assert:age > 18, error:ageError }
    ]
  });

  t.false(result);
  t.equal(nameError.callCount, 2);
  t.equal(ageError.callCount, 1);
  t.end();
})

should('record override registered errors', (t) => {
  check.register('name', (name) => [
    { assert:name.length > 3, error:'Name must be great than 3 characters' },
    { assert:name === name.toLowerCase(), error:'Name must be in all lowercase' }
  ]);

  check.register('age', (age) => [
    { assert:age > 18, error:'You must be 18 years or older' }
  ]);

  const result = check.is({
    name:'No',
    age:15
  }, {
    name:{ assert:'name', error:[
      'Your must enter a name that\'s greater than 3 characters',
      'You cannot have any uppercase characters'
    ]},
    age:{ assert:'age', error:(index, id) => {
      if(index === 0) {
        return 'You must be at least 18 years old'
      }
    }}
  });

  t.false(result);
  t.deepEqual(check.errors, [
    'Name must be great than 3 characters',
    'Name must be in all lowercase',
    'You must be 18 years or older'
  ]);
  t.end();
});

should('call back with errors', (t) => {
  const errorCB = sinon.spy();
  const result = check.is('No', (name) => [
    { assert:name.length > 3, error:'Name must be great than 3 characters' },
    { assert:name === name.toLowerCase(), error:'Name must be in all lowercase' }
  ], errorCB);

  t.false(result);
  t.deepEqual(check.errors, [
    'Name must be great than 3 characters',
    'Name must be in all lowercase',
  ]);
  t.equal(errorCB.callCount, 1);
  t.deepEqual(errorCB.firstCall.args, [
    [
      'Name must be great than 3 characters',
      'Name must be in all lowercase',
    ]
  ]);
  t.end();
});

should('override registered errors by index', (t) => {
  check.register('name', (name) => [
    { assert:name.length > 3, error:'Name must be great than 3 characters' },
    { assert:name === name.toLowerCase(), error:'Name must be in all lowercase' }
  ]);

  const result = check.is({
    name:'No',
    age:15
  }, {
    name:{
      assert:'name',
      error:(value, index, type) => {
        if(index === 0) {
          return 'Error in first index is replaced'
        }
      }
    }
  });

  t.false(result);
  t.deepEqual(check.errors, [
    'Error in first index is replaced',
    'Name must be in all lowercase'
  ]);
  t.end();
});
