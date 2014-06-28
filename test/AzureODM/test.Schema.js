/**
 * test.Schema.js
 */
var Schema = require('./../../AzureODM/Schema.js');
var Fields = require('./../../AzureODM/fields/');

describe.only('AzureODM', function () {
  describe('Schema', function () {
    describe('when initialize', function () {
      var newSchema;
      var schemaObj = {
        field1: Fields.StringField(),
        field2: Fields.NumberField(),
      };
      var optionsObj = {
        driver: 'testDriver'
      };
      beforeEach(function (done) {
        sinon.spy(Schema.prototype, 'setSchema');
        newSchema = new Schema(schemaObj, optionsObj);
        done();
      });
      afterEach(function () {
        Schema.prototype.setSchema.restore();
      });
      it('can be created without the "new" keyword', function (done) {
        var s = Schema({});
        s.should.be.an.instanceof(Schema);
        done();
      });
      it('should call setSchema once', function () {
        Schema.prototype.setSchema.should.have.been.calledOnce;
      });
      it('should call setSchema with obj', function () {
        Schema.prototype.setSchema
          .should.have.been.calledWith(schemaObj);
      });
      it('should store schema', function (done) {
        newSchema.schema.should.be.an('object');
        newSchema.schema.should.have.property('field1')
          .that.is.an.instanceof(Fields.StringField);
        newSchema.schema.should.have.property('field2')
          .that.is.an.instanceof(Fields.NumberField);
        newSchema.options.should.equal(optionsObj);
        done();
      });
      it('should have methods and statics', function (done) {
        newSchema.should.have.property('statics').that.is.empty;
        newSchema.should.have.property('methods').that.is.empty;
        done();
      });
    });
    describe('prototype', function () {
      var newSchema;
      var schemaObj = {
        field1: Fields.StringField(),
        field2: Fields.NumberField(),
      };
      var optionsObj = {
        driver: 'testDriver',
        tableName: 'testTableName'
      };
      beforeEach(function (done) {
        newSchema = new Schema(schemaObj, optionsObj);
        done();
      });
      describe('isFieldNameRestricted(fieldName)', function () {
        it('should return true for `timestamp`', function () {
          newSchema.isFieldNameRestricted('timestamp').should.equal(true);
        });
        it('should return false for `PartitionKey`', function () {
          newSchema.isFieldNameRestricted('PartitionKey').should.equal(false);
        });
      });
      describe('isPathValid()', function () {
        describe('when path exist', function () {
          it('should return true', function (done) {
            schemaObj.should.have.property('field1');
            newSchema.isPathValid('field1').should.equal(true);
            done();
          });
        });
        describe('when path doesnt exist', function () {
          it('should return false', function (done) {
            schemaObj.should.not.have.property('fieldNotExist');
            newSchema.isPathValid('fieldNotExist').should.equal(false);
            done();
          });
        });
      });
      describe('isTableNameValid()', function () {
        it('should return false when not string', function () {
          newSchema.isTableNameValid().should.equal(false);
          newSchema.isTableNameValid(null).should.equal(false);
          newSchema.isTableNameValid(123).should.equal(false);
          newSchema.isTableNameValid({}).should.equal(false);
          newSchema.isTableNameValid([]).should.equal(false);
        });
        it('should return false for empty string', function () {
          newSchema.isTableNameValid('').should.equal(false);
        });
        it('should return true for non-empty string', function () {
          newSchema.isTableNameValid('123').should.equal(true);
        });
      });
      describe('getTableName()', function () {
        it('should return options.tableName', function () {
          optionsObj.should.have.property('tableName', 'testTableName');
          newSchema.getTableName().should.equal(optionsObj.tableName);
        });
      });
      describe('setSchema(obj)', function () {
        beforeEach(function () {
          this.testfield1 = Fields.KeyField();
          this.testfield2 = Fields.StringField({
            fieldName: 'test2'
          });
          sinon.stub(this.testfield1, 'hasFieldName');
          sinon.stub(this.testfield1, 'setFieldName');
          sinon.stub(this.testfield2, 'hasFieldName');
          sinon.stub(this.testfield2, 'setFieldName');
          this.testfield2.hasFieldName.returns(true);
          this.testfield1.hasFieldName.returns(false);
        });
        afterEach(function () {
          this.testfield1.hasFieldName.restore();
          this.testfield2.hasFieldName.restore();
          this.testfield1.setFieldName.restore();
          this.testfield2.setFieldName.restore();
        });
        it('should throw if obj not an obj', function () {
          (function () {
            Schema.prototype.setSchema(123);
          }).should.
          throw ('schema is not an object');
        });
        it('should throw Error if field is restricted `timestamp`', function () {
          var schemaObj = {
            testfield1: this.testfield1,
            timestamp: this.testfield2,
          };
          (function () {
            new Schema(schemaObj);
          }).should.
          throw ('field: timestamp is restricted');
        });
        it('should throw Error if field is restricted `set`', function () {
          var schemaObj = {
            testfield1: this.testfield1,
            set: this.testfield2,
          };
          (function () {
            new Schema(schemaObj);
          }).should.
          throw ('field: set is restricted');
        });
        it('should throw Error if field is restricted `schema`', function () {
          var schemaObj = {
            testfield1: this.testfield1,
            schema: this.testfield2,
          };
          (function () {
            new Schema(schemaObj);
          }).should.
          throw ('field: schema is restricted');
        });
        describe('when iterate obj', function () {
          beforeEach(function () {
            this.fakeThis = {
              schema: {},
              isFieldNameRestricted: function () {
                return false;
              }
            };
            this.obj = {
              testfield1: this.testfield1,
              testfield2: this.testfield2,
            };
            this.boundedSetSchema = Schema.prototype.setSchema.bind(this.fakeThis);
            //sinon.spy(Object.prototype, 'hasOwnProperty');
          });
          //afterEach(function () {
          //  Object.prototype.hasOwnProperty.restore();
          //});
          //it('it should call hasOwnProperty', function () {
          //  this.boundedSetSchema(this.obj);
          //  this.obj.hasOwnProperty.should.have.been.calledTwice;
          //  this.obj.hasOwnProperty.should.have.been.calledWith('testfield1');
          //  this.obj.hasOwnProperty.should.have.been.calledWith('testfield2');
          //});
          it('should call each field hasFieldName()', function () {
            this.boundedSetSchema(this.obj);
            this.testfield2.hasFieldName.should.have.been.calledOnce;
            this.testfield1.hasFieldName.should.have.been.calledOnce;
          });
          it('should call setFieldName() if no options.fieldName', function () {
            this.boundedSetSchema(this.obj);
            this.testfield1.setFieldName.should.have.been.calledOnce;
            this.testfield1.setFieldName.should.have.been.calledWith('testfield1');
            this.testfield2.setFieldName.should.have.not.been.called;
          });
          it('should set to this.schema', function () {
            this.boundedSetSchema(this.obj);
            this.fakeThis.schema.should.have.property('testfield1', this.testfield1);
            this.fakeThis.schema.should.have.property('testfield2', this.testfield2);
          });
        });
      });
      describe('getFieldAtPath(path)', function () {
        it('should return undefined if schema has no path', function () {
          var testSchema = new Schema({
            PartitionKey: Fields.KeyField()
          });
          expect(testSchema.getFieldAtPath('RowKey')).to.be.an('undefined');
        });
        it('should return the field path if exist', function () {
          var f = Fields.KeyField();
          var testSchema = new Schema({
            PartitionKey: f
          });
          testSchema.getFieldAtPath('PartitionKey').should.equal(f);
        });
      });
      describe('isValid()', function () {
        it('should return false if Schema has no PartitionKey', function () {
          var testSchema = new Schema({
            RowKey: Fields.KeyField()
          }, {
            tableName: 'tableName'
          });
          expect(testSchema.isValid()).to.equal(false);
        });
        it('should return false if Schema has no RowKey', function () {
          var testSchema = new Schema({
            PartitionKey: Fields.KeyField(),
          }, {
            tableName: 'tableName'
          });
          expect(testSchema.isValid()).to.equal(false);
        });
        it('should return false if Schema has no tableName', function () {
          var testSchema = new Schema({
            PartitionKey: Fields.KeyField(),
            RowKey: Fields.KeyField()
          });
          expect(testSchema.isValid()).to.equal(false);
        });
        it('should return true if Schema has PartitionKey, RowKey, valid tableName', function () {
          var testSchema = new Schema({
            PartitionKey: Fields.KeyField(),
            RowKey: Fields.KeyField()
          }, {
            tableName: 'tableName'
          });
          expect(testSchema.isValid()).to.equal(true);
        });
      });
    });
  });
});
