/**
 * test.root.js
 *
 * root test for mocha
 */
/* global after, before, afterEach, beforeEach, chai*/

var sinonChai = require('sinon-chai');
global.sinon = require('sinon');
global.chai = require('chai');
global.should = chai.should();
global.expect = chai.expect;
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
chai.use(sinonChai);
