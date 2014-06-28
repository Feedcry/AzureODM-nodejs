/**
 * test.Query.js
 */
/* jshint camelcase:false */
var Query = require('./../../AzureODM/Query.js');
var Model = require('./../../AzureODM/Model.js');
var Schema = require('./../../AzureODM/Schema.js');
var Entity = require('./../../AzureODM/Entity.js');
var Fields = require('./../../AzureODM/fields/');
var fixtures = require('./fixtures.js');
var Promise = require('bluebird');
describe('AzureODM', function () {
  describe('Query', function () {
    describe('QOperator', function () {
      it('should be a function', function () {
        expect(Query.QOperator).to.be.a('function');
        var newOperator = new Query.QOperator(null);
        newOperator.should.have.property('o', null);
      });
      describe('AndOperator', function () {
        it('should be an instance of QOperator', function () {
          Query.AndOperator.should.be.instanceof(Query.QOperator);
        });
        it('should have o = and', function () {
          Query.AndOperator.should.have.property('o', 'and');
        });
      });
      describe('OrOperator', function () {
        it('should be an instance of QOperator', function () {
          Query.OrOperator.should.be.instanceof(Query.QOperator);
        });
        it('should have o = and', function () {
          Query.OrOperator.should.have.property('o', 'or');
        });
      });
      describe('NotOperator', function () {
        it('should be an instance of QOperator', function () {
          Query.NotOperator.should.be.instanceof(Query.QOperator);
        });
        it('should have o = and', function () {
          Query.NotOperator.should.have.property('o', 'not');
        });
      });
    });
    describe('QNode', function () {
      it('should have __validOperations as []', function (done) {
        Query.QNode.should.have.ownProperty('__validOperations')
        Query.QNode.__validOperations.should.be.an('array')
          .that.contains('eq', 'ne', 'gt', 'ge', 'lt', 'le', 'ne', 'in');
        done();
      });
      describe('when called with obj', function () {
        it('should return an instance of QNode', function () {
          var query = {
            q__eq: '1'
          };
          var node = Query.QNode(query);
          node.should.be.an.instanceof(Query.QNode);
        });
      });
    });
    var q1 = Query.Q({
      q1__eq: '123'
    });
    var q2 = Query.Q({
      q2__lt: 123
    });
    var q3 = Query.Q({
      q3__in: [123, 124]
    });
    var qc = Query.QCombination(Query.AndOperator, q1, q2);
    describe('Q', function () {
      describe('when initialized', function () {
        it('should return an instance of QCombination', function () {
          q1.should.be.an.instanceof(Query.Q);
        });
        it('should be an instance of QNode', function () {
          q1.should.be.an.instanceof(Query.QNode);
        });
        describe('when called with obj', function () {
          it('should have query property = obj', function () {
            q1.should.have.ownProperty('query', {
              q1__eq: '123'
            });
          });
          it('should throw if obj is not object', function () {
            (function () {
              Query.Q('123');
            }).should.
            throw (TypeError);
          });
          it('should throw if obj dont have exact 1 own property', function () {
            (function () {
              Query.Q({
                field1__gt: 123,
                field2__gt: '123'
              });
            }).should.
            throw (TypeError);
          });
          it('should parse obj and set k, v', function (done) {
            var q = Query.Q({
              field1__gt: 123
            });
            q.should.have.property('k', 'field1__gt');
            q.should.have.property('v', 123);
            done();
          });
        });
      });
      describe('toQueryString()', function () {
        var FakeSchema;
        var FakeModel;
        beforeEach(function () {
          FakeSchema = new Schema({
            PartitionKey: Fields.KeyField(),
            RowKey: Fields.KeyField(),
            field1: Fields.StringField(),
            field2: Fields.NumberField()
          }, {
            tableName: 'fakeTable'
          });
          FakeModel = Model.compile('FakeModel', FakeSchema);
        });
        it('should throw if withEntity is not instanceof Entity', function () {
          var q = Query.Q({
            field1__gt: 123
          });
          (function () {
            q.toQueryString(123);
          }).should.
          throw (TypeError);
        });
        describe('when with Entity', function () {
          beforeEach(function () {
            FakeSchema.should.be.instanceof(Schema);
            sinon.stub(FakeSchema, 'isPathValid');
            sinon.spy(FakeSchema, 'getFieldAtPath');
          });
          afterEach(function () {
            FakeSchema.isPathValid.restore();
            FakeSchema.getFieldAtPath.restore();
          });
          describe('when query exp is not valid', function () {
            it('should throw', function () {
              var invalidQuerys = [{
                field1_gt: '123'
              }, {
                field1gt: 123
              }, {
                '': 123
              }];
              invalidQuerys.forEach(function (query) {
                var q = Query.Q(query);
                (function () {
                  q.toQueryString(FakeSchema);
                }).should.
                throw ('invalid query expression: ' + Object.keys(query)[0]);
              });
            });
          });
          describe('when field is not valid', function () {
            beforeEach(function () {
              FakeSchema.isPathValid.returns(false);
            });
            it('should throw', function (done) {
              var q = Query.Q({
                field__gt: 123
              });
              (function () {
                q.toQueryString(FakeSchema);
              }).should.
              throw ('queried path is not valid: field');
              FakeSchema.isPathValid.should.have.been.calledOnce;
              done();
            });
          });
          describe('when the operator is valid', function () {
            beforeEach(function () {
              FakeSchema.isPathValid.returns(true);
            });
            afterEach(function () {
              FakeSchema.isPathValid.should.have.been.called;
            });
            it('should throw', function (done) {
              var q = Query.Q({
                field1__xx: 123
              });
              q.constructor.__validOperations.should.not.contains('xx');
              (function () {
                q.toQueryString(FakeSchema);
              }).should.
              throw ('operator is not valid, "xx"');
              done();
            });
          });
          describe('when expresion is valid', function () {
            beforeEach(function () {
              FakeSchema.isPathValid.returns(true);
            });
            afterEach(function () {
              FakeSchema.getFieldAtPath.should.have.been.calledOnce;
              FakeSchema.isPathValid.should.have.been.calledTwice;
            });
            it('should return schema.getFieldAtPath().toQueryString()', function (done) {
              var q = Query.Q({
                field1__gt: '123'
              });
              q.toQueryString(FakeSchema)
                .should.equal('field1 gt \'123\'');
              FakeSchema.getFieldAtPath
                .should.have.been.calledWith('field1');
              done();
            });
          });
        });
        describe('compare with expected values', function () {
          it('should match', function () {
            var queries = [{
              PartitionKey__eq: 'lol'
            }, {
              RowKey__gt: 'r1'
            }, {
              RowKey__ge: 'o1'
            }, {
              RowKey__ne: 'true'
            }];
            var expected = [
              "PartitionKey eq 'lol'",
              "RowKey gt 'r1'",
              "RowKey ge 'o1'",
              "RowKey ne 'true'",
            ];
            for (var i = queries.length - 1; i >= 0; i--) {
              var q = Query.Q(queries[i]);
              q.toQueryString(FakeSchema).should.equal(expected[i]);
            }
          });
        });
        describe('when operator is in', function () {
          it('should iterate value', function (done) {
            var query = {
              RowKey__in: ['1', '2', '3']
            };
            var q = Query.Q(query);
            q.toQueryString(FakeSchema)
              .should
              .equal('(RowKey eq \'1\' or RowKey eq \'2\' or RowKey eq \'3\')');
            done();
          });
        });
      });
    });
    describe('QCombination', function () {
      describe('when called', function () {
        it('should return an instance of QCombination', function () {
          var qc1 = Query.QCombination(Query.AndOperator, q1, q2);
          qc1.should.be.an.instanceof(Query.QCombination);
        });
        it('should also be an instance of QNode', function () {
          var qc1 = Query.QCombination(Query.AndOperator, q1, q2);
          qc1.should.be.an.instanceof(Query.QNode);
        });
        it('should not be an instance of Q', function () {
          var qc1 = Query.QCombination(Query.AndOperator, q1, q2);
          qc1.should.not.be.an.instanceof(Query.Q);
        });
        describe('when operation is not a QOperator', function () {
          it('should throw TypeError', function () {
            (function () {
              Query.QCombination('and', q1, q2);
            }).should.
            throw (TypeError);
          });
          describe('when q1 or q2 is not a QNode', function () {
            it('should throw TypeError', function () {
              (function () {
                Query.QCombination(Query.AndOperator, 'string', q2);
              }).should.
              throw (TypeError);
              (function () {
                Query.QCombination(Query.AndOperator, q1, 'string');
              }).should.
              throw (TypeError);
            });
          });
        });
      });
      describe('instance', function () {
        it('should have property subqueries', function () {
          var qc = Query.QCombination(Query.AndOperator, q1, q2);
          qc.should.have.ownProperty('subqueries');
        });
        it('should response to toQueryString', function () {
          var qc = Query.QCombination(Query.AndOperator, q1, q2);
          qc.should.respondTo('toQueryString');
        });
        describe('append queries', function () {
          describe('when q1 or q2 is Q', function () {
            it('should append directly to subqueries', function () {
              qc.subqueries.should.be.an('array').that.has.length.of(3);
              qc.subqueries[0].should.equal(q1);
              qc.subqueries[1].should.equal(Query.AndOperator);
              qc.subqueries[2].should.equal(q2);
            });
          });
          describe('when q1 or q2 is QCombination', function () {
            it('should append q?.subqueries', function () {
              var qc2 = Query.QCombination(Query.OrOperator, qc, q3);
              qc2.subqueries.should.be.an('array').that.has.length.of(5);
              qc2.subqueries[0].should.equal(q1);
              qc2.subqueries[1].should.equal(Query.AndOperator);
              qc2.subqueries[2].should.equal(q2);
              qc2.subqueries[3].should.equal(Query.OrOperator);
              qc2.subqueries[4].should.equal(q3);
            });
          });
        });
        describe('toQueryString()', function () {
          var FakeSchema;
          var qc;
          beforeEach(function () {
            FakeSchema = new Schema({
              PartitionKey: Fields.KeyField(),
              RowKey: Fields.KeyField(),
              field1: Fields.StringField(),
              field2: Fields.NumberField()
            }, {});
            qc = Query.QCombination(Query.OrOperator, q1, q2);
          });
          it('should throw if withEntity is not instanceof Entity', function () {
            (function () {
              qc.toQueryString(123);
            }).should.
            throw ('withSchema is not an Schema');
          });
          describe('when compare to expected string', function () {
            it('should match', function (done) {
              var q1 = Query.Q({
                PartitionKey__eq: 'p1'
              })._and({
                RowKey__gt: 'r1'
              })._and({
                RowKey__lt: 'r5'
              });
              q1.should.be.an.instanceof(Query.QCombination);
              q1.toQueryString(FakeSchema)
                .should.equal(
                  "(PartitionKey eq 'p1' and RowKey gt 'r1' and RowKey lt 'r5')"
              );
              done();
            });
          });
          describe('when combine with in query', function () {
            it('should match', function (done) {
              var q1 = Query.Q({
                PartitionKey__eq: 'p1'
              })._and({
                RowKey__in: ['r1', 'r2']
              });
              q1.toQueryString(FakeSchema)
                .should.equal(
                  "(PartitionKey eq 'p1' and (RowKey eq 'r1' or RowKey eq 'r2'))"
              );
              done();
            });
          });
        });
      });
    });
    describe('QuerySet', function () {
      it('should return an instance when called', function () {
        var qs = new Query.QuerySet();
        qs.should.be.an.instanceof(Query.QuerySet);
      });
      it('should throw if called without new', function () {
        (function () {
          Query.QuerySet();
        }).should.
        throw ('use new to create an instance');
      });
      describe('instance', function () {
        describe('setModel()', function () {
          it.skip('should throw TypeError if model not Model', function () {
            var qs = new Query.QuerySet();
            (function () {
              qs.setModel(123);
            }).should.
            throw (TypeError);
          });
        });
        describe('where()s', function () {
          describe('__where()', function () {
            describe('when its first query', function () {
              it('should set as a new Q', function (done) {
                var qs = new Query.QuerySet();
                expect(qs._queryCombination).to.be.a('null');
                qs.__where(Query.OrOperator, {
                  field1__eq: '134'
                });
                qs._queryCombination.should.be.instanceof(Query.Q);
                qs._queryCombination.should.have.property('query').that.deep.equal({
                  field1__eq: '134'
                });
                done();
              });
            });
            describe('when its not the first where', function () {
              it('should return a new QCombination', function (done) {
                var qs = new Query.QuerySet();
                qs._queryCombination = new Query.Q({
                  field1__eq: '134'
                });
                var res = qs.__where(Query.OrOperator, {
                  field1__eq: '134'
                });
                res.should.equal(qs);
                res._queryCombination.should.be.an.instanceof(Query.QCombination);
                res._queryCombination.subqueries.should.have.length.of(3);
                done();
              });
            });
          });
          describe('where()', function () {
            it('should append query without operation', function () {
              var qs = new Query.QuerySet();
              qs.where({
                field1__eq: '134'
              });
              qs._queryCombination.query.should.deep.equal({
                field1__eq: '134'
              });
            });
            it('should throw if called after xxWhere', function () {
              var qs = new Query.QuerySet();
              qs.where({
                field1__eq: '134'
              });
              (function () {
                qs.where(Query.OrOperator, {
                  field1__gt: '134'
                });
              }).should.
              throw ();
            });
          });
          describe('andWhere()', function () {
            it('should append query with AndOperator', function () {
              var qs = new Query.QuerySet();
              qs.where({
                field1__eq: '134'
              }).andWhere({
                field2__eq: 123
              });
              qs._queryCombination.subqueries.should.have.length.of(3);
              qs._queryCombination.subqueries[1].should.equal(Query.AndOperator);
              qs._queryCombination.subqueries[2].query.should.deep.equal({
                field2__eq: 123
              });
            });
          });
          describe('orWhere()', function () {
            it('should append query with OrOperator', function () {
              var qs = new Query.QuerySet();
              qs.where({
                field1__eq: '134'
              }).orWhere({
                field2__eq: 123
              });
              qs._queryCombination.subqueries.should.have.length.of(3);
              qs._queryCombination.subqueries[1].should.equal(Query.OrOperator);
              qs._queryCombination.subqueries[2].query.should.deep.equal({
                field2__eq: 123
              });
            });
          });
          describe('notWhere()', function () {
            it('should append query with NotOperator', function () {
              var qs = new Query.QuerySet();
              qs.where({
                field1__eq: '134'
              }).notWhere({
                field2__eq: 123
              });
              qs._queryCombination.subqueries.should.have.length.of(3);
              qs._queryCombination.subqueries[1].should.equal(Query.NotOperator);
              qs._queryCombination.subqueries[2].query.should.deep.equal({
                field2__eq: 123
              });
            });
          });
        });
        describe('select()', function () {
          describe('when "*"', function () {
            it('should set null', function () {
              var qs = new Query.QuerySet();
              qs.select('*');
              expect(qs._fields).to.be.a('null');
            });
          });
          describe('when ""', function () {
            it('should set null', function () {
              var qs = new Query.QuerySet();
              qs.select('*');
              expect(qs._fields).to.be.a('null');
            });
          });
          describe('when undefined', function () {
            it('should set null', function () {
              var qs = new Query.QuerySet();
              qs.select('*');
              expect(qs._fields).to.be.a('null');
            });
          });
          describe('when []', function () {
            it('should set null', function () {
              var qs = new Query.QuerySet();
              qs.select('*');
              expect(qs._fields).to.be.a('null');
            });
          });
          it('should set fields', function () {
            var fields = ['filed1', 'field2'];
            var qs = new Query.QuerySet();
            qs.select(fields);
            qs._fields.should.equal(fields);
          });
        });
        describe('limit()', function () {
          it('should set top', function () {
            var qs = new Query.QuerySet();
            qs.limit(5);
            qs._top.should.equal(5);
          });
          describe('when have offset', function () {
            it('should set offset', function () {
              var qs = new Query.QuerySet();
              qs.limit(5, 1);
              qs._top.should.equal(5);
              qs._offset.should.equal(1);
            });
          });
        });
        describe('toQueryString()', function () {
          var FakeSchema;
          beforeEach(function () {
            FakeSchema = new Schema({
              PartitionKey: Fields.KeyField(),
              RowKey: Fields.KeyField(),
              field1: Fields.StringField(),
              field2: Fields.NumberField()
            }, {});
          });
          it('should return null if no where', function () {
            var qs = new Query.QuerySet();
            expect(qs.toQueryString()).to.be.a('null');
          });
          it('should return _queryCombination.toQueryString()', function () {
            var q = new Query.QuerySet();
            q.where({
              PartitionKey__eq: 'p1'
            }).andWhere({
              RowKey__gt: 'r1'
            }).andWhere({
              RowKey__lt: 'r5'
            });
            expect(q._queryCombination).to.be.not.a('null');
            q.toQueryString(FakeSchema)
              .should.equal(
                "(PartitionKey eq 'p1' and RowKey gt 'r1' and RowKey lt 'r5')"
            );
          });
        });
        describe('exec()', function () {
          describe('when no model', function () {
            it('should reject', function (done) {
              var q = new Query.QuerySet();
              q.exec().should.be.rejectedWith('invalid model')
                .should.notify(done);
            });
          });
          describe('when model no driver', function () {
            it('should reject', function (done) {
              var q = new Query.QuerySet(fixtures.ModelWithoutDriver());
              q.exec().should.be.rejectedWith('invalid model driver')
                .should.notify(done);
            });
          });
          describe('when call driver.findAll()', function () {
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
            var qs;
            var driver;
            var m;
            beforeEach(function () {
              m = fixtures.ModelWithoutDriver();
              driver = {
                findAll: function () {}
              };
              m.driver = driver;
              qs = new Query.QuerySet(m);
              sinon.stub(driver, 'findAll');
              driver.findAll.returns(Promise.resolve([rawEntity1, rawEntity2]));
              sinon.spy(m.schema, 'getTableName');
              sinon.spy(m, 'fromAzureEntities');
            });
            it('should call findAll() and fromAzureEntities', function (done) {
              var fields = ['PartitionKey', 'RowKey'];
              qs.select(fields).where({
                PartitionKey__eq: 'p1'
              }).limit(2)
                .exec()
                .should.be.fulfilled
                .should.eventually.be.an('array')
                .should.eventually.have.length.of(2)
                .then(function (entities) {
                  m.schema.getTableName.should.have.been.calledOnce;
                  m.driver.findAll.should.have.been.calledOnce;
                  m.driver.findAll
                    .should.have.been
                    .calledWith('fakeTableName', 'PartitionKey eq \'p1\'', fields, 2);
                  m.fromAzureEntities.should.have.been.calledOnce;
                })
                .should.notify(done);
            });
          });
        });
      });
    });
  });
});
