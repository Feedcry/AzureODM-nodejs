/**
 * test.Model.js
 */
var Model = require('./../../AzureODM/Model.js');
var Schema = require('./../../AzureODM/Schema.js');
var Entity = require('./../../AzureODM/Entity.js');
var Query = require('./../../AzureODM/Query.js');
var Fields = require('./../../AzureODM/fields/');
describe('AzureODM', function () {
  describe('Model', function () {
    var FakeClient;
    var FakeSchema;
    var FakeSchema2;
    before(function () {
      FakeSchema = new Schema({
        PartitionKey: Fields.KeyField(),
        RowKey: Fields.KeyField(),
        field1: Fields.StringField(),
        field2: Fields.NumberField()
      }, {
        tableName: 'fakeTable',
        driver: 'someDriver'
      });
      FakeSchema.statics.classMethod = function () {
        return 'lol';
      };
      FakeSchema.methods.instanceMethod = function () {
        return this.field1;
      };
      FakeSchema2 = new Schema({
        PartitionKey: Fields.KeyField(),
        RowKey: Fields.KeyField(),
        field3: Fields.StringField(),
        field4: Fields.NumberField()
      }, {
        tableName: 'fakeTable2',
        driver: 'someOtherDriver'
      });
    });
    beforeEach(function () {
      FakeClient = sinon.stub();
    });
    describe('prototypes', function () {
      it('should inherit `schema` from Entity', function () {
        Model.prototype.should.have.property('schema', Entity.prototype.schema);
      });
      it('should inherit `set` from Entity', function () {
        Model.prototype.should.have.property('set', Entity.prototype.set);
      });
      it('should inherit `getValue` from Entity', function () {
        Model.prototype.should.have.property('getValue', Entity.prototype.getValue);
      });
      it('should inherit `setValue` from Entity', function () {
        Model.prototype.should.have.property('setValue', Entity.prototype.setValue);
      });
      it('should inherit `__setSchema` from Entity', function () {
        Model.prototype.should.have.property('__setSchema', Entity.prototype.__setSchema);
      });
      it('should inherit `validate` from Entity', function () {
        Model.prototype.should.have.property('validate', Entity.prototype.validate);
      });
      it('should have `modelName`', function () {
        Model.prototype.should.have.property('modelName', null);
      });
    });
    describe('classMethod', function () {
      it('should have `compile()`', function () {
        expect(Model).itself.to.respondTo('compile');
      });
    });
    describe('compile()', function () {
      describe('when called', function () {
        beforeEach(function () {
          sinon.spy(Entity.prototype, '__setSchema');
        });
        afterEach(function () {
          Entity.prototype.__setSchema.restore();
        });
        describe('when name is not a string', function () {
          it('should throw TypeError', function () {
            (function () {
              Model.compile(123, FakeSchema);
            }).should.
            throw ('name is not a string');
          });
        });
        describe('when name is an empty string', function () {
          it('should throw TypeError', function () {
            (function () {
              Model.compile('', FakeSchema);
            }).should.
            throw ('name is an empty string');
          });
        });
        describe('when schema not an instance of Schema', function () {
          it('should throw TypeError', function () {
            (function () {
              Model.compile('sometable', 123);
            }).should.
            throw ('schema is not an instance of Schema');
          });
        });
        describe('when schema.isValid() return false', function () {
          beforeEach(function () {
            sinon.stub(FakeSchema, 'isValid');
            FakeSchema.isValid.returns(false);
          });
          afterEach(function () {
            FakeSchema.isValid.should.have.been.calledOnce;
            FakeSchema.isValid.restore();
          });
          it('should throw Error', function () {
            (function () {
              Model.compile('sometable', FakeSchema);
            }).should.
            throw ('schema is not valid');
          });
        });
        it('should call `schema.__setSchema()`', function () {
          Model.compile('SomeModel', FakeSchema);
          Entity.prototype.__setSchema.should.have.been.calledOnce;
          Entity.prototype.__setSchema.should.have.been.calledWith(FakeSchema);
        });
      });
      describe('compiled model', function () {
        var TestModel;
        var TestModel2;
        beforeEach(function () {
          TestModel = Model.compile('TestModel', FakeSchema);
          TestModel2 = Model.compile('TestModel2', FakeSchema2);
        });
        it('should have Model methods', function () {
          TestModel.should.respondTo('delete');
          TestModel.should.respondTo('save');
        });
        it('should have modelName', function () {
          TestModel.should.have.ownProperty('modelName', 'TestModel');
        });
        it('should isolate modelName property between compiled models', function () {
          TestModel2.should.have.ownProperty('modelName', 'TestModel2');
        });
        it('should have property schema', function () {
          TestModel.should.have.ownProperty('schema', FakeSchema);
        });
        it('should isolate property schema between compiled models', function () {
          TestModel2.should.have.ownProperty('schema', FakeSchema2);
        });
        describe('prototypes', function () {
          it('should have schema from Schema', function () {
            TestModel.prototype.should.have.property('schema', FakeSchema);
          });
          it('should isolate schema between compiled models', function () {
            TestModel2.prototype.should.have.property('schema', FakeSchema2);
          });
          it('should add from Schema.methods', function () {
            TestModel.prototype.should.have
              .property('instanceMethod', FakeSchema.methods.instanceMethod);
          });
          it('should isolate between compiled models', function () {
            TestModel2.prototype.should.not.have
              .property('instanceMethod');
          });
        });
        describe('classMethod', function () {
          it('should add from Schema.statics', function () {
            TestModel.should.have
              .property('classMethod', FakeSchema.statics.classMethod);
          });
          it('should isolate between compiled models', function () {
            TestModel2.should.not.have
              .property('classMethod');
          });
        });
        it('should have driver from Schema', function () {
          TestModel.should.have.property('driver', 'someDriver');
        });
        it('should have driver isolated from compiled models', function () {
          TestModel2.should.have.property('driver', 'someOtherDriver');
        });
        it('should create new entity instance using `new`', function () {
          var entity = new TestModel({
            field1: '123',
            field2: 123
          });
          entity.should.be.an.instanceof(TestModel);
        });
        it('should isolated when create new entities', function () {
          var entity = new TestModel();
          entity.should.be.an.instanceof(TestModel);
          entity.should.not.be.an.instanceof(TestModel2);
        });
        it('should NOT support creating instance without `new`', function () {
          (function () {
            var entity = TestModel({
              field1: '123',
              field2: 123
            });
          }).should.
          throw ();
        });
        describe('fromAzureEntities()', function () {
          var rawEntity1 = {
            PartitionKey: 'p1',
            RowKey: 'r1',
            field1: '123',
            field2: 123,
          };
          var rawEntity2 = {
            PartitionKey: 'p2',
            RowKey: 'r2',
            field1: '124',
            field2: 124,
          };
          it('should return entities', function () {
            var entities = TestModel.fromAzureEntities([rawEntity1, rawEntity2]);
            entities.should.be.an('array');
            entities.should.have.length.of(2);
            entities[0].should.be.an.instanceof(TestModel);
            entities[1].should.be.an.instanceof(TestModel);
            entities[0].PartitionKey.should.equal('p1');
            entities[0].RowKey.should.equal('r1');
            entities[0].field1.should.equal('123');
            entities[0].field2.should.equal(123);
            entities[1].PartitionKey.should.equal('p2');
            entities[1].RowKey.should.equal('r2');
          });
        });
        describe('find()', function () {
          describe('when called without queryObj', function () {
            var res;
            beforeEach(function () {
              res = TestModel.find();
            });
            it('should return an instance of QuerySet', function () {
              res.should.be.an.instanceof(Query.QuerySet);
            });
            describe('returned QuerySet', function () {
              it('should have compiled model', function () {
                var res = TestModel.find();
                res.should.have.ownProperty('model', TestModel);
              });
              it('should not have _queryCombination', function () {
                res.should.have.ownProperty('_queryCombination').that.not.exists;
              });
            });
          });
          describe('when called with queryObj', function () {
            var queryObj = {
              PartitionKey__eq: 'p1'
            };
            var res;
            beforeEach(function () {
              res = TestModel.find(queryObj);
            });
            it('should return an instance of QuerySet', function () {
              res.should.be.an.instanceof(Query.QuerySet);
            });
            describe('returned QuerySet', function () {
              it('should have compiled model', function () {
                var res = TestModel.find();
                res.should.have.ownProperty('model', TestModel);
              });
              it('should have _queryCombination', function () {
                res.should.have.property('_queryCombination').that.exists;
              });
            });
          });
        });
        describe('findOne()', function () {
          beforeEach(function () {
            sinon.spy(Query.QuerySet.prototype, 'where');
            sinon.spy(Query.QuerySet.prototype, 'select');
            sinon.spy(Query.QuerySet.prototype, 'limit');
            sinon.stub(Query.QuerySet.prototype, 'exec');
            Query.QuerySet.prototype.exec.returns('something exec');
          })
          afterEach(function () {
            Query.QuerySet.prototype.where.restore();
            Query.QuerySet.prototype.select.restore();
            Query.QuerySet.prototype.limit.restore();
            Query.QuerySet.prototype.exec.restore();
          })
          describe('when called with queryObj', function () {
            var queryObj = {
              PartitionKey__eq: 'p1'
            };
            var res;
            beforeEach(function () {
              res = TestModel.findOne(queryObj);
            })
            it('should call where', function () {
              Query.QuerySet.prototype.where.should.have.been.calledOnce;
              Query.QuerySet.prototype.where.should.have.been.calledWith(queryObj);
            });
            it('should call select', function () {
              Query.QuerySet.prototype.select.should.have.been.calledOnce;
              Query.QuerySet.prototype.select.should.have.been.calledWith(undefined);
            });
            it('should call limit with 1', function () {
              Query.QuerySet.prototype.limit.should.have.been.calledOnce;
              Query.QuerySet.prototype.limit.should.have.been.calledWith(1);
            });
            it('should return exec', function () {
              Query.QuerySet.prototype.exec.should.have.been.calledOnce;
              res.should.equal('something exec');
            });
          });
          describe('when called without queryObj', function () {
            var res;
            beforeEach(function () {
              res = TestModel.findOne();
            });
            it('should call where', function () {
              Query.QuerySet.prototype.where.should.have.not.been.called;
            });
            it('should call select', function () {
              Query.QuerySet.prototype.select.should.have.been.calledOnce;
              Query.QuerySet.prototype.select.should.have.been.calledWith(undefined);
            });
            it('should call limit with 1', function () {
              Query.QuerySet.prototype.limit.should.have.been.calledOnce;
              Query.QuerySet.prototype.limit.should.have.been.calledWith(1);
            });
            it('should return exec', function () {
              Query.QuerySet.prototype.exec.should.have.been.calledOnce;
              res.should.equal('something exec');
            });
          });
          describe('when called with fields', function () {
            var res;
            var fields = ['PartitionKey', 'RowKey'];
            beforeEach(function () {
              res = TestModel.findOne(null, fields);
            });
            it('should call select with fields', function () {
              it('should call select', function () {
                Query.QuerySet.prototype.select.should.have.been.calledOnce;
                Query.QuerySet.prototype.select.should.have.been.calledWith(fields);
              });
            });
          });
        });
        describe('entity instance of compiled model', function () {
          var entity;
          beforeEach(function () {
            entity = new TestModel({
              field1: '123',
              field2: 123
            });
          });
          it('should be an instance of compiled model', function () {
            entity.should.be.an.instanceof(TestModel);
          });
          it('should be an instance of Model', function () {
            entity.should.be.an.instanceof(Model);
          });
          it('should be an instance of Entity', function () {
            entity.should.be.an.instanceof(Entity);
          });
          it('should set initial values from obj', function () {
            entity.field1.should.equal('123');
            entity.field2.should.equal(123);
          });
          it('should have model methods', function () {
            entity.should.respondTo('instanceMethod');
          });
          it('should have compiled model as constructor', function () {
            entity.constructor.should.equal(TestModel);
          });
          it('should able to access constructor methods', function () {
            entity.constructor.modelName.should.equal('TestModel');
            entity.constructor.driver.should.equal('someDriver');
          });
          it('should inherit `save()` method', function () {
            entity.should.respondTo('save');
          });
          it('should inherit `delete` method', function () {
            entity.should.respondTo('delete');
          });
          it('should not inherit `find` method', function () {
            entity.should.not.respondTo('find');
          });
        });

      });
    });
  });
});
