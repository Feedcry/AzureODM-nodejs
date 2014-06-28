/**
 * test AzureODM/fields/KeyField
 */
var basePath = './../../';
var GenericField = require(basePath + 'AzureODM/fields/GenericField.js');
var StringField = require(basePath + 'AzureODM/fields/StringField.js');
var KeyField = require(basePath + 'AzureODM/fields/KeyField.js');

describe('AzureODM', function () {
  describe('fields', function () {
    describe('KeyField', function () {
      it('should have _type of String', function () {
        KeyField.prototype._type.should.equal('string');
      });
      describe('when initializing', function () {
        var PartitionKey;
        var RowKey;
        describe('when no options', function () {
          beforeEach(function () {
            PartitionKey = new KeyField();
            RowKey = new KeyField();
          });
          it('should be an instance of KeyField', function () {
            PartitionKey.should.be.an.instanceof(KeyField);
          });
          it('should be an instance of GenericField', function () {
            PartitionKey.should.be.an.instanceof(GenericField);
          });
          it('should be an instance of StringField', function () {
            PartitionKey.should.be.an.instanceof(StringField);
          });
        });
        describe('when have options', function () {
          beforeEach(function () {
            var options = {
              require: false
            };
            PartitionKey = new KeyField(options);
          });
          it('should store to options', function () {
            PartitionKey.options.should.have.ownProperty('require', false);
          });
        });
      });
      describe('prototype', function () {
        describe('isValid()', function () {
          var PartitionKey;
          beforeEach(function () {
            PartitionKey = new KeyField();
          });
          it('should override GenericField', function () {
            PartitionKey.should.respondTo('isValid');
            PartitionKey.isValid.should.not.equal(GenericField.isValid);
          });
          it('should return true for a string', function () {
            PartitionKey.isValid('123').should.equal(true);
          });
          it('should return false for not a string', function () {
            PartitionKey.isValid(123).should.equal(false);
            PartitionKey.isValid({}).should.equal(false);
            PartitionKey.isValid(true).should.equal(false);
          });
          describe('when options.require', function () {
            it('should return false for empty string', function () {
              PartitionKey.options.require.should.equal(true);
              PartitionKey.getOption('require').should.equal(true);
              PartitionKey.isValid('').should.equal(false);
            });
          });
        });
        describe('getOption', function () {
          var PartitionKey;
          beforeEach(function () {
            PartitionKey = new KeyField();
          });
          it('should inherit from GenericField', function () {
            KeyField.prototype.getOption
              .should.equal(GenericField.prototype.getOption);
          });
          it('should return default options', function () {
            PartitionKey.getOption('require').should.equal(true);
            PartitionKey.getOption('requireSerializing')
              .should.equal(false);
            expect(PartitionKey.getOption('serializedType'))
              .to.be.a('undefined');
          });
        });
        describe('serialize()', function () {
          var PartitionKey;
          beforeEach(function () {
            PartitionKey = new KeyField();
          });
          it('should throw', function () {
            (function () {
              PartitionKey.serialize();
            }).should.
            throw ();
          });
        });
        describe('deserialize()', function () {
          var PartitionKey;
          beforeEach(function () {
            PartitionKey = new KeyField();
          });
          it('should throw', function () {
            (function () {
              PartitionKey.deserialize();
            }).should.
            throw ();
          });
        });
      });
    });
  });
});
