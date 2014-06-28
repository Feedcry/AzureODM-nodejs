/**
 * test AzureODM/fields/BooleanField
 */
var basePath = './../../';
var GenericField = require(basePath + 'AzureODM/fields/GenericField.js');
var BooleanField = require(basePath + 'AzureODM/fields/BooleanField.js');
describe('AzureODM', function () {
  describe('fields', function () {
    describe('BooleanField', function () {
      it('should have _type of boolean', function () {
        BooleanField.prototype._type.should.equal('boolean');
      });
    });
    describe('prototype', function () {
      describe('isValid()', function () {
        var ABooleanField;
        beforeEach(function () {
          ABooleanField = new BooleanField();
        });
        it('should override GenericField', function () {
          ABooleanField.should.respondTo('isValid');
          ABooleanField.isValid.should.not.equal(GenericField.isValid);
        });
        it('should return false for an int', function () {
          ABooleanField.isValid(123).should.equal(false);
        });
        it('should return false for a float', function () {
          ABooleanField.isValid(123.12).should.equal(false);
        });
        it('should return false for a string', function () {
          ABooleanField.isValid('123').should.equal(false);
        });
        it('should return false for 0', function () {
          ABooleanField.isValid(0).should.equal(false);
        });
        it('should return false for -1', function () {
          ABooleanField.isValid(-1).should.equal(false);
        });
        it('should return true for undefined', function () {
          ABooleanField.isRequire().should.equal(false, 'not require');
          ABooleanField.isValid(undefined).should.equal(true);
          ABooleanField.isValid().should.equal(true);
        });
        it('should return true for null', function () {
          ABooleanField.isRequire().should.equal(false, 'not require');
          ABooleanField.isValid(null).should.equal(true);
        });
        it('should return true for true', function () {
          ABooleanField.isValid(true).should.equal(true);
        });
        it('should return true for false', function () {
          ABooleanField.isValid(false).should.equal(true);
        });
        describe('when options.require', function () {
          beforeEach(function () {
            ABooleanField.setOption('require', true);
          });
          it('should return false for null', function () {
            ABooleanField.getOption('require').should.equal(true);
            ABooleanField.isValid(null).should.equal(false);
          });
          it('should return false for undefined', function () {
            ABooleanField.getOption('require').should.equal(true);
            ABooleanField.isValid().should.equal(false);
          });
        });
      });
      describe('toQueryString()', function () {
        var ABooleanField;
        beforeEach(function () {
          ABooleanField = new BooleanField();
        });
        it('should throw if type not right', function () {
          (function () {
            ABooleanField.toQueryString(0);
          }).should.
          throw ();
        });
        it('should return `true` for true', function() {
          ABooleanField.toQueryString(true).should.equal('true');
        });
        it('should return `false` for false', function() {
          ABooleanField.toQueryString(false).should.equal('false');
        });
      });
    });
  });
});
