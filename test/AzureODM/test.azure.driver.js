/**
 * test.azure.driver.js
 */
var driver = require('./../../AzureODM/azure/driver.js');
var config = require('./../config.azure.js');
var Promise = require('bluebird');
var azure = require('azure');
var accountName = config.accountName;
var accessKey = config.accountAccessKey;

describe('AzureODM', function () {
  describe('azure', function () {
    describe('driver', function () {
      describe('initialization', function () {
        var newDriver;
        beforeEach(function () {
          sinon.stub(azure, 'createTableService');
          azure.createTableService.returns('fakeTableService');
          newDriver = new driver(accountName, accessKey);
        });
        afterEach(function () {
          azure.createTableService.restore();
        });
        it('should throw if not using `new`', function () {
          (function () {
            driver(accountName, accessKey);
          }).should.
          throw ('Driver has to be created using `new`');
        });
        it('should set accountName, accessKey', function () {
          newDriver.should.have.ownProperty('accountName', accountName);
          newDriver.should.have.ownProperty('accessKey', accessKey);
        });
        it('should be an instance of Driver', function () {
          newDriver.should.be.an.instanceof(driver);
        });
        it('should call createTableService', function () {
          azure.createTableService.should.have.been.calledOnce;
          azure.createTableService.should.have.been.calledWith(accountName, accessKey);
        });
        it('should have tableService', function () {
          newDriver.should.have.ownProperty('tableService');
          newDriver.tableService.should.equals('fakeTableService');
        });
        it('should response to findAll()', function () {
          newDriver.should.respondTo('findAll');
        });
      });
      describe('properties', function () {
        describe('_getAllContinuationPages', function () {
          var fakeContinuation = {
            hasNextPage: function () {},
            getNextPage: function () {},
          };
          beforeEach(function () {
            sinon.stub(fakeContinuation, 'hasNextPage');
            sinon.stub(fakeContinuation, 'getNextPage');
          });
          afterEach(function () {
            fakeContinuation.hasNextPage.restore();
            fakeContinuation.getNextPage.restore();
          });
          it('should have _getAllContinuationPages', function () {
            driver.should.have.ownProperty('_getAllContinuationPages');
            driver._getAllContinuationPages.should.be.a('function');
          });
          describe('when has expectedLength that equals entities length', function () {
            var returnedEntities = ['oneFakeEntity'];
            var expectedLength = 1;
            it('should resolve entities', function (done) {
              driver._getAllContinuationPages(fakeContinuation, returnedEntities, expectedLength)
                .should.be.fulfilled
                .should.eventually.equal(returnedEntities)
                .should.notify(done);
            });
            it('should not call hasNextPage', function (done) {
              driver._getAllContinuationPages(fakeContinuation, returnedEntities, expectedLength)
                .should.be.fulfilled
                .then(function () {
                  fakeContinuation.hasNextPage.should.have.not.been.called;
                })
                .should.notify(done);
            });
          });
          describe('when have no expectedLength', function () {
            var returnedEntities = ['oneFakeEntity'];
            describe('when no hasNextPage()', function () {
              beforeEach(function () {
                fakeContinuation.hasNextPage.returns(false);
              });
              it('should resolve entities', function (done) {
                driver._getAllContinuationPages(fakeContinuation, returnedEntities)
                  .should.be.fulfilled
                  .should.eventually.equal(returnedEntities)
                  .then(function () {
                    fakeContinuation.hasNextPage.should.have.been.calledOnce;
                  })
                  .should.notify(done);
              });
            });
            describe('when with one next page', function () {
              var nextPageEntities = ['nextEntity'];
              beforeEach(function () {
                fakeContinuation.hasNextPage
                  .onFirstCall().returns(true)
                  .onSecondCall().returns(false);
                fakeContinuation.getNextPage.yieldsAsync(null, nextPageEntities, fakeContinuation);
              });
              afterEach(function () {
                fakeContinuation.getNextPage.reset();
              });
              it('should resolve with nextPageEntities', function (done) {
                driver._getAllContinuationPages(fakeContinuation, returnedEntities)
                  .should.be.fulfilled
                  .should.eventually.be.an('array')
                  .should.eventually.contains(returnedEntities[0])
                  .should.eventually.contains(nextPageEntities[0])
                  .should.eventually.have.length.of(2)
                  .then(function () {
                    fakeContinuation.hasNextPage.should.have.been.calledTwice;
                    fakeContinuation.getNextPage.should.have.been.calledOnce;
                  })
                  .should.notify(done);
              });
              describe('when getNextPage err', function () {
                beforeEach(function () {
                  fakeContinuation.getNextPage.yieldsAsync(new Error('somefakeErr'));
                });
                it('should reject with err', function (done) {
                  driver._getAllContinuationPages(fakeContinuation, returnedEntities)
                    .should.be.rejectedWith('somefakeErr')
                    .should.notify(done);
                });
              });
            });
          });
        });

      });
      describe('prototype', function () {
        var azureDriver;
        beforeEach(function () {
          sinon.spy(azure, 'createTableService');
          azureDriver = new driver(accountName, accessKey);
        });
        afterEach(function () {
          azure.createTableService.restore();
        });
        describe('createTableIfNotExists()', function () {
          beforeEach(function () {
            sinon.stub(azure.TableService.prototype, 'createTableIfNotExists');
          });
          afterEach(function () {
            azure.TableService.prototype.createTableIfNotExists.restore();
          });
          describe('when tableService.createTableIfNotExists() err', function () {
            beforeEach(function () {
              var insertErr = new Error('fake insert error');
              azure.TableService.prototype.createTableIfNotExists.yields(insertErr);
            });
            it('should reject with err', function (done) {
              var options = {};
              azureDriver.createTableIfNotExists('tableName', options)
                .should.be.rejectedWith('fake insert error')
                .then(function () {
                  azure.TableService.prototype.createTableIfNotExists
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.createTableIfNotExists
                    .should.have.been.calledWith('tableName', options);
                })
                .should.notify(done);
            });
          });
          describe('when tableService.createTableIfNotExists() created', function () {
            beforeEach(function () {
              this.created = false;
              azure.TableService.prototype
                .createTableIfNotExists.yields(null, this.created);
            });
            afterEach(function () {
              delete this.created;
            });
            it('should resolve created', function (done) {
              var options = {};
              azureDriver.createTableIfNotExists('tableName', {})
                .should.be.fulfilled
                .should.eventually.equal(this.created)
                .then(function () {
                  azure.TableService.prototype.createTableIfNotExists
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.createTableIfNotExists
                    .should.have.been.calledWith('tableName', options);
                })
                .should.notify(done);
            });
          });
        });
        describe('findAll()', function () {
          var fakeTableName = 'fakeTableName';
          var fakeQueryString = 'fakeQueryString';
          var fakeLimit = 10;
          var fakeFields = ['PartitionKey', 'RowKey'];
          var fakeReturnedEntities = ['fakeEntity'];
          beforeEach(function () {
            var fakeQueryEntities = function (query, callback) {
              return callback(null, fakeReturnedEntities, {
                hasNextPage: function () {
                  return false;
                }
              });
            };
            sinon.stub(azure.TableService.prototype, 'queryEntities', fakeQueryEntities);
            //sinon.stub(driver, '_getAllContinuationPages');
            sinon.spy(azure.TableQuery, 'select');
            sinon.spy(azure.TableQuery.prototype, 'from');
            sinon.spy(azure.TableQuery.prototype, 'where');
            sinon.spy(azure.TableQuery.prototype, 'top');
            //driver._getAllContinuationPages.returns(Promise.resolve(fakeReturnedEntities));
          });
          afterEach(function () {
            azure.TableService.prototype.queryEntities.restore();
            azure.TableQuery.select.restore();
            azure.TableQuery.prototype.from.restore();
            azure.TableQuery.prototype.where.restore();
            azure.TableQuery.prototype.top.restore();
          });
          describe('when tableName is undefined', function () {
            it('should be rejected', function (done) {
              azureDriver.findAll(undefined)
                .should.be.rejectedWith('invalid tableName')
                .should.notify(done);
            });
          });
          describe('when tableName is not a string', function () {
            it('should be rejected', function (done) {
              azureDriver.findAll(123)
                .should.be.rejectedWith('invalid tableName')
                .should.notify(done);
            });
          });
          describe('when tableName is empty string', function () {
            it('should be rejected', function (done) {
              azureDriver.findAll('')
                .should.be.rejectedWith('invalid tableName')
                .should.notify(done);
            });
          });
          describe('when fields is array thats not empty', function () {
            it('should call TableQuery.select(fields)', function (done) {
              azureDriver.findAll(fakeTableName, fakeQueryString, fakeFields)
                .should.be.fulfilled
                .should.eventually.equal(fakeReturnedEntities)
                .then(function () {
                  azure.TableQuery.select.should.have.been.calledOnce;
                  azure.TableQuery.select.should.have.been.calledWith(fakeFields);
                })
                .should.notify(done);
            });
          });
          describe('when fields is not an array or empty', function () {
            it('should call TableQuery.select(undefined)', function (done) {
              azureDriver.findAll(fakeTableName, fakeQueryString, 80)
                .should.be.fulfilled
                .should.eventually.equal(fakeReturnedEntities)
                .then(function () {
                  azure.TableQuery.select.should.have.been.calledOnce;
                  azure.TableQuery.select.should.have.been.calledWith(undefined);
                })
                .should.notify(done);
            });
          });
          describe('when limit exists', function () {
            it('should call top(limit)', function (done) {
              azureDriver.findAll(fakeTableName, fakeQueryString, fakeFields, fakeLimit)
                .should.be.fulfilled
                .should.eventually.equal(fakeReturnedEntities)
                .then(function () {
                  azure.TableQuery.prototype.top.should.have.been.calledOnce;
                  azure.TableQuery.prototype.top.should.have.been.calledWith(fakeLimit);
                })
                .should.notify(done);
            });
          });
          describe('when call azure.TableService.queryEntities', function () {
            it('should be called with query', function (done) {
              azureDriver.findAll(fakeTableName, fakeQueryString, fakeFields, fakeLimit)
                .should.be.fulfilled
                .should.eventually.equal(fakeReturnedEntities)
                .then(function () {
                  azure.TableQuery.select.should.have.been.calledOnce;
                  azure.TableQuery.select.should.have.been.calledWith(fakeFields);
                  azure.TableQuery.prototype.where.should.have.been.calledOnce;
                  azure.TableQuery.prototype.where.should.have.been.calledWith(fakeQueryString);
                  azure.TableQuery.prototype.from.should.have.been.calledOnce;
                  azure.TableQuery.prototype.from.should.have.been.calledWith(fakeTableName);
                  azure.TableQuery.prototype.top.should.have.been.calledOnce;
                  azure.TableQuery.prototype.top.should.have.been.calledWith(fakeLimit);
                  azure.TableService.prototype.queryEntities.should.have.been.calledOnce;
                })
                .should.notify(done);
            });
          });
        });
        describe('deleteEntity()', function () {
          beforeEach(function () {
            sinon.stub(azure.TableService.prototype, 'deleteEntity');
          });
          afterEach(function () {
            azure.TableService.prototype.deleteEntity.restore();
          });
          describe('when tableService.deleteEntity() err', function () {
            beforeEach(function () {
              azure.TableService.prototype.deleteEntity.yields(new Error('something wrong'));
            });
            it('should reject with err', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.deleteEntity('tableName', entity, options)
                .should.be.rejectedWith('something wrong')
                .then(function () {
                  azure.TableService.prototype.deleteEntity.should.have.been.calledOnce;
                  azure.TableService.prototype.deleteEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
          describe('when tableService.deleteEntity() sucessful', function () {
            beforeEach(function () {
              azure.TableService.prototype.deleteEntity.yields(null, true);
            });
            it('should resolve true', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.deleteEntity('tableName', entity, {})
                .should.be.fulfilled
                .should.eventually.equal(true)
                .then(function () {
                  azure.TableService.prototype.deleteEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.deleteEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
          describe('when tableService.deleteEntity() unsucessful', function () {
            beforeEach(function () {
              this.response = 'some response';
              azure.TableService.prototype.deleteEntity.yields(null, false, this.response);
            });
            it('should resolve response', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.deleteEntity('tableName', entity, {})
                .should.be.rejectedWith(this.response)
                .then(function () {
                  azure.TableService.prototype.deleteEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.deleteEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
        });
        describe('insertEntity()', function () {
          beforeEach(function () {
            sinon.stub(azure.TableService.prototype, 'insertEntity');
          });
          afterEach(function () {
            azure.TableService.prototype.insertEntity.restore();
          });
          describe('when tableService.insertEntity() err', function () {
            beforeEach(function () {
              var insertErr = new Error('fake insert error');
              azure.TableService.prototype.insertEntity.yields(insertErr);
            });
            it('should reject with err', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.insertEntity('tableName', entity, {})
                .should.be.rejectedWith('fake insert error')
                .then(function () {
                  azure.TableService.prototype.insertEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.insertEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
          describe('when tableService.insertEntity() no err', function () {
            beforeEach(function () {
              this.newEntity = {};
              azure.TableService.prototype.insertEntity.yields(null, this.newEntity);
            });
            afterEach(function () {
              delete this.newEntity;
            });
            it('should resolve newEntity', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.insertEntity('tableName', entity, {})
                .should.be.fulfilled
                .should.eventually.equal(this.newEntity)
                .then(function () {
                  azure.TableService.prototype.insertEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.insertEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
        });
        describe('insertOrReplaceEntity()', function () {
          beforeEach(function () {
            sinon.stub(azure.TableService.prototype, 'insertOrReplaceEntity');
          });
          afterEach(function () {
            azure.TableService.prototype.insertOrReplaceEntity.restore();
          });
          describe('when tableService.insertOrReplaceEntity() err', function () {
            beforeEach(function () {
              var insertErr = new Error('fake insert error');
              azure.TableService.prototype.insertOrReplaceEntity.yields(insertErr);
            });
            it('should reject with err', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.insertOrReplaceEntity('tableName', entity, {})
                .should.be.rejectedWith('fake insert error')
                .then(function () {
                  azure.TableService.prototype.insertOrReplaceEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.insertOrReplaceEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
          describe('when tableService.insertOrReplaceEntity() no err', function () {
            beforeEach(function () {
              this.newEntity = {};
              azure.TableService.prototype
                .insertOrReplaceEntity.yields(null, this.newEntity);
            });
            afterEach(function () {
              delete this.newEntity;
            });
            it('should resolve newEntity', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.insertOrReplaceEntity('tableName', entity, {})
                .should.be.fulfilled
                .should.eventually.equal(this.newEntity)
                .then(function () {
                  azure.TableService.prototype.insertOrReplaceEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.insertOrReplaceEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
        });
        describe('updateEntity()', function () {
          beforeEach(function () {
            sinon.stub(azure.TableService.prototype, 'updateEntity');
          });
          afterEach(function () {
            azure.TableService.prototype.updateEntity.restore();
          });
          describe('when tableService.updateEntity() err', function () {
            beforeEach(function () {
              var insertErr = new Error('fake insert error');
              azure.TableService.prototype.updateEntity.yields(insertErr);
            });
            it('should reject with err', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.updateEntity('tableName', entity, {})
                .should.be.rejectedWith('fake insert error')
                .then(function () {
                  azure.TableService.prototype.updateEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.updateEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
          describe('when tableService.updateEntity() no err', function () {
            beforeEach(function () {
              this.newEntity = {};
              azure.TableService.prototype
                .updateEntity.yields(null, this.newEntity);
            });
            afterEach(function () {
              delete this.newEntity;
            });
            it('should resolve newEntity', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.updateEntity('tableName', entity, {})
                .should.be.fulfilled
                .should.eventually.equal(this.newEntity)
                .then(function () {
                  azure.TableService.prototype.updateEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.updateEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
        });
        describe('mergeEntity()', function () {
          beforeEach(function () {
            sinon.stub(azure.TableService.prototype, 'mergeEntity');
          });
          afterEach(function () {
            azure.TableService.prototype.mergeEntity.restore();
          });
          describe('when tableService.mergeEntity() err', function () {
            beforeEach(function () {
              var insertErr = new Error('fake insert error');
              azure.TableService.prototype.mergeEntity.yields(insertErr);
            });
            it('should reject with err', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.mergeEntity('tableName', entity, {})
                .should.be.rejectedWith('fake insert error')
                .then(function () {
                  azure.TableService.prototype.mergeEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.mergeEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
          describe('when tableService.mergeEntity() no err', function () {
            beforeEach(function () {
              this.newEntity = {};
              azure.TableService.prototype
                .mergeEntity.yields(null, this.newEntity);
            });
            afterEach(function () {
              delete this.newEntity;
            });
            it('should resolve newEntity', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.mergeEntity('tableName', entity, {})
                .should.be.fulfilled
                .should.eventually.equal(this.newEntity)
                .then(function () {
                  azure.TableService.prototype.mergeEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.mergeEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
        });
        describe('insertOrMergeEntity()', function () {
          beforeEach(function () {
            sinon.stub(azure.TableService.prototype, 'insertOrMergeEntity');
          });
          afterEach(function () {
            azure.TableService.prototype.insertOrMergeEntity.restore();
          });
          describe('when tableService.insertOrMergeEntity() err', function () {
            beforeEach(function () {
              var insertErr = new Error('fake insert error');
              azure.TableService.prototype.insertOrMergeEntity.yields(insertErr);
            });
            it('should reject with err', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.insertOrMergeEntity('tableName', entity, {})
                .should.be.rejectedWith('fake insert error')
                .then(function () {
                  azure.TableService.prototype.insertOrMergeEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.insertOrMergeEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
          describe('when tableService.insertOrMergeEntity() no err', function () {
            beforeEach(function () {
              this.newEntity = {};
              azure.TableService.prototype
                .insertOrMergeEntity.yields(null, this.newEntity);
            });
            afterEach(function () {
              delete this.newEntity;
            });
            it('should resolve newEntity', function (done) {
              var entity = {
                PartitionKey: 'pk',
                RowKey: 'rk'
              };
              var options = {};
              azureDriver.insertOrMergeEntity('tableName', entity, {})
                .should.be.fulfilled
                .should.eventually.equal(this.newEntity)
                .then(function () {
                  azure.TableService.prototype.insertOrMergeEntity
                    .should.have.been.calledOnce;
                  azure.TableService.prototype.insertOrMergeEntity
                    .should.have.been.calledWith('tableName', entity, options);
                })
                .should.notify(done);
            });
          });
        });
      });
    });


  });
});
