/**
 * test AzureODM/fields/NumberField
 */
var basePath = './../../';
var GenericField = require(basePath + 'AzureODM/fields/GenericField.js');
var StringField = require(basePath + 'AzureODM/fields/StringField.js');
var NumberField = require(basePath + 'AzureODM/fields/NumberField.js');
describe('AzureODM', function () {
  describe('fields', function () {
    describe('NumberField', function () {
      it('should have _type of number', function () {
        NumberField.prototype._type.should.equal('number');
      });
      describe('prototype', function () {
        describe('isValid()', function () {
          var ANumberField;
          beforeEach(function () {
            ANumberField = new NumberField();
          });
          it('should override GenericField', function () {
            ANumberField.should.respondTo('isValid');
            ANumberField.isValid.should.not.equal(GenericField.isValid);
          });
          it('should return true for an int', function () {
            ANumberField.isValid(123).should.equal(true);
          });
          it('should return true for a float', function () {
            ANumberField.isValid(123.12).should.equal(true);
          });
          it('should return false for a string', function () {
            ANumberField.isValid('123').should.equal(false);
          });
          it('should return true for 0', function () {
            ANumberField.isValid(0).should.equal(true);
          });
          it('should return true for -1', function () {
            ANumberField.isValid(-1).should.equal(true);
          });
          it('should return true for undefined', function () {
            ANumberField.isRequire().should.equal(false, 'not require');
            ANumberField.isValid(undefined).should.equal(true);
            ANumberField.isValid().should.equal(true);
          });
          it('should return true for null', function () {
            ANumberField.isRequire().should.equal(false, 'not require');
            ANumberField.isValid(null).should.equal(true);
          });
          describe('when options.require', function () {
            beforeEach(function () {
              ANumberField.setOption('require', true);
            });
            it('should return false for null', function () {
              ANumberField.getOption('require').should.equal(true);
              ANumberField.isValid(null).should.equal(false);
            });
            it('should return false for undefined', function () {
              ANumberField.getOption('require').should.equal(true);
              ANumberField.isValid().should.equal(false);
            });
          });
        });
        describe('toQueryString()', function () {
          var ANumberField;
          beforeEach(function () {
            ANumberField = new NumberField();
          });
          it('should throw if null', function () {
            (function () {
              ANumberField.toQueryString(null);
            }).should.
            throw ();
          });
          it('should throw if undefined', function () {
            (function () {
              ANumberField.toQueryString();
            }).should.
            throw ();
          });
          it('should throw if type not right', function () {
            (function () {
              ANumberField.toQueryString('123');
            }).should.
            throw ();
          });
          it('should return string', function () {
            var queryString = ANumberField.toQueryString(123);
            queryString.should.equal('123');
          });
          it('should return float string', function () {
            var queryString = ANumberField.toQueryString(123.123123);
            queryString.should.equal('123.123123');
          });
        });
      });
    });
  });
});
