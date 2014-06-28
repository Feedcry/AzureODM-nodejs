/**
 * test AzureODM/fields/StringField
 */
var basePath = './../../';
var GenericField = require(basePath + 'AzureODM/fields/GenericField.js');
var StringField = require(basePath + 'AzureODM/fields/StringField.js');

describe('AzureODM', function () {
  describe('fields', function () {
    describe('StringField', function () {
      it('should have _type of String', function () {
        StringField.prototype._type.should.equal('string');
      });
      describe('when initializing', function () {
        var SomethingStringy;
        describe('when no options', function () {
          beforeEach(function () {
            SomethingStringy = new StringField();
          });
          it('should be an instance of StringField', function () {
            SomethingStringy.should.be.an.instanceof(StringField);
          });
          it('should be an instance of GenericField', function () {
            SomethingStringy.should.be.an.instanceof(GenericField);
          });
        });
        describe('when have options', function () {
          beforeEach(function () {
            var options = {
              require: true
            };
            SomethingStringy = new StringField(options);
          });
          it('should store to options', function () {
            SomethingStringy.options.should.have.ownProperty('require', true);
          });
        });
      });
      describe('prototype', function () {
        describe('isValid()', function () {
          var SomethingStringy;
          beforeEach(function () {
            SomethingStringy = new StringField();
            SomethingStringy.isRequire().should.equal(false, 'not require');
          });
          it('should override GenericField', function () {
            SomethingStringy.should.respondTo('isValid');
            SomethingStringy.isValid.should.not.equal(GenericField.isValid);
          });
          it('should return true for a string', function () {
            SomethingStringy.isValid('123').should.equal(true);
          });
          it('should return false for not a string', function () {
            SomethingStringy.isValid(123).should.equal(false);
            SomethingStringy.isValid({}).should.equal(false);
            SomethingStringy.isValid(true).should.equal(false);
          });
          it('should return true for undefined', function () {
            SomethingStringy.isRequire().should.equal(false, 'not require');
            SomethingStringy.isValid(undefined).should.equal(true);
            SomethingStringy.isValid().should.equal(true);
          });
          it('should return true for null', function () {
            SomethingStringy.isRequire().should.equal(false, 'not require');
            SomethingStringy.isValid(null).should.equal(true);

          });
          describe('when options.require', function () {
            beforeEach(function () {
              SomethingStringy.setOption('require', true);
            });
            it('should return false for empty string', function () {
              SomethingStringy.getOption('require').should.equal(true);
              SomethingStringy.isValid('').should.equal(false);
            });
          });
        });
        describe('toQueryString()', function () {
          var SomethingStringy;
          beforeEach(function () {
            SomethingStringy = new StringField();
          });
          it('should throw if null', function () {
            (function () {
              SomethingStringy.toQueryString(null);
            }).should.
            throw ();
          });
          it('should throw if undefined', function () {
            (function () {
              SomethingStringy.toQueryString();
            }).should.
            throw ();
          });
          it('should throw if type not right', function () {
            (function () {
              SomethingStringy.toQueryString(123);
            }).should.
            throw ();
          });
          it('should return string with single quotes', function () {
            var queryString = SomethingStringy.toQueryString('s');
            queryString.should.equal("'s'");
          });
          it('should return \'\' for empty string', function () {
            var queryString = SomethingStringy.toQueryString('');
            queryString.should.equal("''");
          });
        });
        describe('getOption', function () {
          var SomethingStringy;
          beforeEach(function () {
            SomethingStringy = new StringField();
          });
          it('should inherit from GenericField', function () {
            StringField.prototype.getOption
              .should.equal(GenericField.prototype.getOption);
          });
          it('should return default options', function () {
            SomethingStringy.getOption('require').should.equal(false);
            SomethingStringy.getOption('requireSerializing')
              .should.equal(false);
            expect(SomethingStringy.getOption('serializedType'))
              .to.be.a('undefined');
          });
        });
        describe('serialize()', function () {
          var SomethingStringy;
          beforeEach(function () {
            SomethingStringy = new StringField();
          });
          it('should throw', function () {
            (function () {
              SomethingStringy.serialize();
            }).should.
            throw ();
          });
        });
        describe('deserialize()', function () {
          var SomethingStringy;
          beforeEach(function () {
            SomethingStringy = new StringField();
          });
          it('should throw', function () {
            (function () {
              SomethingStringy.deserialize();
            }).should.
            throw ();
          });
        });
      });
    });
  });
});
