/**
 * AzureODM.Model
 *
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */
var Entity = require('./Entity.js');
var Schema = require('./Schema.js');
var Query = require('./Query.js');
var utils = require('./utils.js');
var __extends = this.__extends || utils.__extends;
// import Promise = module('bluebird');
/**
 * The Model Class, should inherit from Entity
 *
 * @param {[type]} obj    [description]
 * @param {[type]} fields [description]
 */

var Model = (function (_super) {
  __extends(Model, _super);

  function Model(obj, fields) {
    _super.call(this, obj, fields);
  }
  Model.prototype.modelName = null;

  /**
   * Save the Entity
   *
   * @method  save
   *
   * @param   {[type]}  options  [description]
   *
   * @return  {[type]}  [description]
   */
  Model.prototype.save = function (options) {
    throw new Error('NIM');
  };

  /**
   * Delete the Entity
   *
   * @method  delete
   *
   * @param   {[type]}  options  [description]
   *
   * @return  {[type]}  [description]
   */
  Model.prototype.delete = function (options) {
    throw new Error('NIM');
  };
  /**
   * Initiate a Query.QuerySet
   *
   * @method  find
   *
   * @param   {object}  queryObj  [description]
   *
   * @return  {Query.QuerySet}  [description]
   */
  Model.find = function (queryObj) {
    if (!queryObj) {
      // just return a QuerySet with model
      return new Query.QuerySet(this);
    }
    // put queryObj to .where(queryObj)
    return new Query.QuerySet(this).where(queryObj);
  };

  /**
   * populate azure entities to Model instances
   *
   * @method  fromAzureEntities
   *
   * @param   {array}           azureEntitis  raw Azure entities
   * @param {array} fields selected fields
   *
   * @return  {array}           array of model instances
   */
  Model.fromAzureEntities = function (azureEntitis, fields) {
    var entities = [];
    var self = this;
    azureEntitis.forEach(function (azureEntity) {
      entities.push(new self(azureEntity, fields));
    });
    return entities;
  };

  /**
   * [findOne description]
   *
   * @method  findOne
   *
   * @param   {Query.QuerySet}  queryObj  [description]
   *
   * @return  {Promise}  [description]
   */
  Model.findOne = function (queryObj, fields) {
    return this.find(queryObj).select(fields).limit(1).exec();
  };

  /**
   * Compile an Model
   *
   * @method  compile
   *
   * @param   {[type]}  name    [description]
   * @param   {Schema}  schema  [description]
   *
   * @throws {TypeError} If `name` is not an string or empty string
   * @throws {TypeError} If schema is not an instance of `Schema`
   * @throws {Error} If schema.isValid() returns false
   *
   * @return  {[type]}  [description]
   */
  Model.compile = function (name, schema) {
    if (typeof name !== 'string') {
      throw new TypeError('name is not a string');
    }
    if (name.length === 0) {
      throw new TypeError('name is an empty string');
    }
    if (!(schema instanceof Schema)){
      throw new TypeError('schema is not an instance of Schema');
    }
    if (!schema.isValid()) {
      throw new Error('schema is not valid');
    }

    var __extend = this.__extends || utils.__extends;
    // generate new class
    var model = (function (_super) {
      __extend(model, _super);

      function model(obj, fields) {
        _super.call(this, obj, fields);
      }
      return model;
    })(Model);
    //model.prototype = Object.create(Model.prototype);
    model.modelName = name;
    //model.__proto__ = Model;
    //model.prototype.__proto__ = Model.prototype;
    model.driver = schema.options.driver;
    model.prototype.__setSchema(schema);
    //model.prototype.set(schema.schema, undefined);
    for (var i in schema.methods) {
      if (schema.methods.hasOwnProperty(i)) {
        model.prototype[i] = schema.methods[i];
      }
    }
    for (var j in schema.statics) {
      if (schema.statics.hasOwnProperty(j)) {
        model[j] = schema.statics[j];
      }
    }
    model.schema = model.prototype.schema;
    model.options = model.prototype.options;
    return model;
  };
  return Model;
})(Entity);

module.exports = Model;
