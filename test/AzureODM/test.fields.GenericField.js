/**
 * test AzureODM/fields/GenericField
 */
var basePath = './../../';
var GenericField = require(basePath + 'AzureODM/fields/GenericField.js');
describe('AzureODM', function () {
  describe('fields', function () {
    describe('GenericField', function () {
      describe('initialize', function () {
        describe('options', function () {
          describe('defaults', function () {
            describe('require', function () {
              it('should be false', function () {
                var someField = new GenericField();
                someField.options.require.should.equal(false);
              });
              it('should be false when getOption()', function () {
                var someField = new GenericField();
                someField.getOption('require').should.equal(false);
              });
            });
            describe('requireSerializing', function () {
              it('should be false', function () {
                var someField = new GenericField();
                someField.options.requireSerializing.should.equal(false);
              });
              it('should be false when getOption()', function () {
                var someField = new GenericField();
                someField.getOption('requireSerializing').should.equal(false);
              });
            });
            describe('serializedType', function () {
              it('should be undefined', function () {
                var someField = new GenericField();
                expect(someField.options.serializedType).to.be.an('undefined');
              });
              it('should be undefined when getOption()', function () {
                var someField = new GenericField();
                expect(someField.getOption('serializedType')).to.be.an('undefined');
              });
            });
          });
          describe('when override options', function () {
            var newField;
            var options = {
              require: true,
              requireSerializing: true,
              serializedType: 'string',
            };
            beforeEach(function () {
              newField = new GenericField(options);
            });
            describe('require', function () {
              it('should be true', function () {
                newField.options.require.should.equal(true);
              });
              it('should be true when getOption()', function () {
                newField.getOption('require').should.equal(true);
              });
            });
            describe('requireSerializing', function () {
              it('should be true', function () {
                newField.options.requireSerializing.should.equal(true);
              });
              it('should be true when getOption()', function () {
                newField.getOption('requireSerializing').should.equal(true);
              });
            });
            describe('serializedType', function () {
              it('should be undefined', function () {
                expect(newField.options.serializedType).to.equal('string');
              });
              it('should be undefined when getOption()', function () {
                expect(newField.getOption('serializedType')).to.equal('string');
              });
            });
          });
        });
      });
      describe('prototype', function () {
        describe('_isFieldNameValid()', function () {
          it('should return true to anything', function () {
            var SomeField = new GenericField();
            SomeField._isFieldNameValid().should.equal(true);
            SomeField._isFieldNameValid(123).should.equal(true);
          });
        });
        describe('getFieldName()', function () {
          it('should return options.fieldName', function () {
            var SomeField = new GenericField();
            expect(SomeField.getFieldName()).to.be.a('undefined');
          });
          it('should return options.fieldName when not undefined', function () {
            var SomeField = new GenericField({
              fieldName: 'SomeField'
            });
            expect(SomeField.getFieldName()).to.equal('SomeField');
          });
        });
        describe('hasFieldName()', function () {
          it('should return false for null', function () {
            var SomeField = new GenericField({
              fieldName: null
            });
            SomeField.hasFieldName().should.equal(false);
          });
          it('should return false for undefined', function () {
            var SomeField = new GenericField({
              fieldName: undefined
            });
            SomeField.hasFieldName().should.equal(false);
          });
          it('should return false for default', function () {
            var SomeField = new GenericField();
            SomeField.hasFieldName().should.equal(false);
          });
          it('should return true for valid fieldName', function () {
            var SomeField = new GenericField({
              fieldName: 'somefield'
            });
            SomeField.hasFieldName().should.equal(true);
          });
        });
        describe('setFieldName(fieldName, override)', function () {
          describe('when fieldName is not valid', function () {
            var SomeField;
            beforeEach(function () {
              SomeField = new GenericField();
              sinon.stub(SomeField, '_isFieldNameValid');
              SomeField._isFieldNameValid.returns(false);
            });
            it('should throw TypeError', function () {
              SomeField._isFieldNameValid('sadf').should.equal(false);
              (function () {
                SomeField.setFieldName('sadf');
              }).should.
              throw ('field name: sadf is invalid');
            });
          });
          describe('when options.fieldName exist and not override', function () {
            var SomeField;
            beforeEach(function () {
              SomeField = new GenericField({
                fieldName: 'sadf'
              });
            });
            it('should throw', function () {
              (function () {
                SomeField.setFieldName('newfieldname');
              }).should.
              throw ('field name exists');
            });
          });
          describe('when options.fieldName exists and override=true', function () {
            var SomeField;
            beforeEach(function () {
              SomeField = new GenericField({
                fieldName: 'sadf'
              });
            });
            it('should not throw', function () {
              (function () {
                SomeField.setFieldName('newfieldname', true);
              }).should.not.
              throw ('field name exists');
            });
            it('should replace the existing fieldName', function () {
              SomeField.setFieldName('newfieldname', true);
              SomeField.options.fieldName.should.equal('newfieldname');
            });
          });
          describe('when options.fieldName is null or undefined', function () {
            var SomeField;
            beforeEach(function () {
              SomeField = new GenericField({
                fieldName: null
              });
            });
            it('will replace when override=false', function () {
              SomeField.setFieldName('newfieldname', false);
              SomeField.options.fieldName.should.equal('newfieldname');
            });
          });
        });
        describe('getOption()', function () {});
      });
    });
  });
});
