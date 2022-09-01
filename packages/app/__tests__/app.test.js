'use strict';

const app = require('..');
const assert = require('assert').strict;

assert.strictEqual(app(), 'Hello from app');
console.info("app tests passed");
