/**
 * test.Entity.js
 */

var Entity = require('./../../AzureODM/Entity.js');
var Schema = require('./../../AzureODM/Schema.js');
var Fields = require('./../../AzureODM/fields/');
describe('AzureODM', function () {
  describe('Entity', function () {
    describe('initialize', function () {
      beforeEach(function () {
        sinon.spy(Entity.prototype, 'set');
        sinon.stub(Schema.prototype, 'isPathValid');
        Schema.prototype.isPathValid.returns(true);
      });
      afterEach(function () {
        Entity.prototype.set.restore();
        Schema.prototype.isPathValid.restore();
      });
      it('should create an instance with new', function () {
        var newEntity = new Entity();
        newEntity.should.be.an.instanceof(Entity);
      });
      it('should throw if not using new', function () {
        (function () {
          Entity();
        }).should.
        throw ('use new to create an instance');
      });
      describe('when it called', function () {
        beforeEach(function () {
          //sinon.stub(Entity.prototype, 'schema');
          Entity.prototype.schema = new Schema({
            somefield: Fields.StringField()
          });
        });
        afterEach(function () {
          Entity.prototype.schema = null;
        });
        it('should call .set()', function () {
          var obj = {
            'somefield': 'someObj'
          };
          var fields = ['somefield'];
          var newEntity = new Entity(obj, fields);
          Entity.prototype.set.should.have.been.calledWith(obj, fields);
        });
      });

    });
    describe('instance initialize', function () {
      beforeEach(function () {
        sinon.spy(Entity.prototype, 'set');
      });
      afterEach(function () {
        Entity.prototype.set.restore();
      });
      it('should have _doc', function () {
        var newEntity = new Entity();
        newEntity.should.have.ownProperty('_doc', {});
      });
      it('should have _selectedFields', function () {
        var newEntity = new Entity();
        newEntity.should.have.ownProperty('_selectedFields', []);
      });
      it('should have _timestamp inital value of null', function () {
        var newEntity = new Entity();
        newEntity.should.have.ownProperty('_timestamp', null);
      });
      describe('_status property', function () {
        it('should have isNew = true', function () {
          var newEntity = new Entity();
          newEntity._status.should.have.ownProperty('isNew', true);
        });
        it('should have isPartial = false', function () {
          var newEntity = new Entity();
          newEntity._status.should.have.ownProperty('isPartial', false);
        });
        it('should have isChanged = false', function () {
          var newEntity = new Entity();
          newEntity._status.should.have.ownProperty('isChanged', false);
        });
      });
      it('should call set(obj, fields)', function () {
        var obj = {};
        var fields = ['fieldName1'];
        var newEntity = new Entity(obj, fields);
        Entity.prototype.set.should.have.been.calledOnce;
        Entity.prototype.set.should.have.been.calledWith(obj, fields);
      });
    });
    describe('prototype', function () {
      describe('set(obj, fields)', function () {
        it('should throw if fields not array', function () {
          (function () {
            Entity.prototype.set(null, 123);
          }).should.
          throw ('fields is not an array');
        });
        describe('when called with obj and fields', function () {
          beforeEach(function () {
            //this.stubbed = sinon.createStubInstance(Entity);
            sinon.stub(Entity.prototype, 'constructor');
            sinon.stub(Entity.prototype, 'setValue');
            this.stubObj = {
              fieldName1: 'value1',
              fieldName2: 'value2'
            };
            this.stubFields = ['fieldName1', 'fieldName2'];

            this.stubbed = new Entity();
            this.stubbed.should.be.an.instanceof(Entity);
            this.stubbed.schema = {
              isPathValid: function () {}
            };
            sinon.stub(this.stubbed.schema, 'isPathValid');
            this.stubbed.schema.isPathValid.returns(true);
          });
          afterEach(function () {
            Entity.prototype.constructor.restore();
            Entity.prototype.setValue.restore();
            delete this.stubbed;
          });
          it('should set _selectedFields with fields', function () {

            this.stubbed.set(this.stubObj, this.stubFields);
            expect(this.stubbed._selectedFields).to.equal(this.stubFields);
          });
          it('should check each field with schema.isPathValid', function () {
            this.stubbed.set(this.stubObj, this.stubFields);
            this.stubbed.schema.isPathValid
              .should.have.been.calledTwice;
            this.stubbed.schema.isPathValid
              .should.have.been.calledWith('fieldName1');
            this.stubbed.schema.isPathValid
              .should.have.been.calledWith('fieldName2');
          });
          it('should call setValue for each value in obj', function () {
            this.stubbed.set(this.stubObj, this.stubFields);
            this.stubbed.setValue
              .should.have.been.calledTwice;
            this.stubbed.setValue
              .should.have.been.calledWith('fieldName1', 'value1');
            this.stubbed.setValue
              .should.have.been.calledWith('fieldName2', 'value2');
          });
          it('should ignore fields that are not defined in schema', function () {
            this.stubbed.schema.isPathValid.withArgs('fieldName2').returns(false);
            this.stubbed.set(this.stubObj, this.stubFields);
            this.stubbed.setValue
              .should.have.been.calledOnce;
            this.stubbed.setValue
              .should.have.been.calledWith('fieldName1', 'value1');
          });
        });
      });
      describe('getValue(path)', function () {
        describe('when path is invalid', function () {
          beforeEach(function () {
            this.testingEntity = new Entity();
          });
          it('should throw', function () {

          });
        });
      });
      describe('_getTimestamp()', function () {
        it('should return _timestamp', function () {
          var newEntity = new Entity();
          newEntity._timestamp = 123;
          newEntity._getTimestamp().should.equal(123);
        });
      });
      describe.skip('_toEntityDescriptor()', function () {
        beforeEach(function () {
          sinon.stub(Entity.prototype, 'getValue');
        });
        afterEach(function () {
          Entity.prototype.getValue.restore();
        });
      });
      describe('_isPartial()', function () {
        it('should return _status.isPartial', function () {
          var newEntity = new Entity();
          newEntity._status.isPartial = {};
          newEntity._isPartial().should.equal(newEntity._status.isPartial);
        });
      });
      describe('_isNew()', function () {
        it('should return _status.isNew', function () {
          var newEntity = new Entity();
          newEntity._status.isNew = {};
          newEntity._isNew().should.equal(newEntity._status.isNew);
        });
      });
      describe('_isChanged()', function () {
        it('should return _status.isChanged', function () {
          var newEntity = new Entity();
          newEntity._status.isChanged = {};
          newEntity._isChanged().should.equal(newEntity._status.isChanged);
        });
      });
    });
  });
});
