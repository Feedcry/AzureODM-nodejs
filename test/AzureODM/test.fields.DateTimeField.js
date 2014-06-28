/**
 * test AzureODM/fields/DateTimeField
 */
var basePath = './../../';
var GenericField = require(basePath + 'AzureODM/fields/GenericField.js');
var StringField = require(basePath + 'AzureODM/fields/StringField.js');
var DateTimeField = require(basePath + 'AzureODM/fields/DateTimeField.js');

describe('AzureODM', function () {
  describe('fields', function () {
    describe('DateTimeField', function () {
      it('should have _type of String', function () {
        DateTimeField.prototype._instance.should.equal(Date);
      });
      describe('prototype', function () {
        describe('isValid()', function () {
          var SomeDateField;
          beforeEach(function () {
            SomeDateField = new DateTimeField();
          });
          it('should override GenericField', function () {
            SomeDateField.should.respondTo('isValid');
            SomeDateField.isValid.should.not.equal(GenericField.isValid);
          });
          it('should return true for a Date', function () {
            SomeDateField.isValid(new Date()).should.equal(true);
          });
          it('should return false for not a string', function () {
            SomeDateField.isValid(123).should.equal(false);
            SomeDateField.isValid({}).should.equal(false);
            SomeDateField.isValid(true).should.equal(false);
          });
          describe('when options.require', function () {
            beforeEach(function () {
              SomeDateField = new DateTimeField({
                require: true
              });
            });
            it('should return false for null', function () {
              SomeDateField.options.require.should.equal(true);
              SomeDateField.getOption('require').should.equal(true);
              SomeDateField.isValid().should.equal(false);
            });
          });
        });
        describe('getOption', function () {
          var SomeDateField;
          beforeEach(function () {
            SomeDateField = new DateTimeField();
          });
          it('should inherit from GenericField', function () {
            DateTimeField.prototype.getOption
              .should.equal(GenericField.prototype.getOption);
          });
          it('should return default options', function () {
            SomeDateField.getOption('require').should.equal(false);
            SomeDateField.getOption('requireSerializing')
              .should.equal(false);
            expect(SomeDateField.getOption('serializedType'))
              .to.be.a('undefined');
          });
        });
        describe('serialize()', function () {
          var SomeDateField;
          beforeEach(function () {
            SomeDateField = new DateTimeField();
          });
          it('should throw', function () {
            (function () {
              SomeDateField.serialize();
            }).should.
            throw ();
          });
        });
        describe('deserialize()', function () {
          var SomeDateField;
          beforeEach(function () {
            SomeDateField = new DateTimeField();
          });
          it('should throw', function () {
            (function () {
              SomeDateField.deserialize();
            }).should.
            throw ();
          });
        });
      });
    });
  });
});
