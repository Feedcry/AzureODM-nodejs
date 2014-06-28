/**
 * AzureODM.Schema
 *
 * Define the Schema for Azure Table Entity
 *
 * @param {object} obj An object contains field names and Fields
 *                     The schema will only support one
 *                     level (no nested)
 * @param {object} options options for the schema
 * @param {string} options.tableName define the table name
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */


var GenericField = require('./fields/GenericField.js');

var Schema = (function () {
  function Schema(obj, options) {
    if (!(this instanceof Schema)) {
      return new Schema(obj, options);
    }
    this.schema = {};
    if (obj) {
      this.setSchema(obj);
    }
    this.options = options || {};
    this.statics = {};
    this.methods = {};
  }

  Schema._restrictedFieldNames = ['timestamp', 'set', 'schema'];

  /**
   * Check whether a fieldName is restricted
   *
   * @method  isFieldNameRestricted
   *
   * @param   {string}               fieldName  field name to check
   *
   * @return  {Boolean}              true: restricted
   *                                 false: not
   */
  Schema.prototype.isFieldNameRestricted = function (fieldName) {
    if (this.constructor._restrictedFieldNames.indexOf(fieldName) !== -1) {
      return true;
    }
    return false;
  };

  /**
   * Set Schema
   *
   * Will:
   *   * check if the fieldName is defined in options of the Field:
   *     * by calling hasFieldName
   *   * if not exist, use the path name as the fieldName by calling:
   *     * SomeField.setFieldName()
   *
   * @todo Will check if the field name is value by using
   *
   *
   * @method  setSchema
   *
   * @throws {TypeError} If `obj` is not an object
   * @throws {TypeError} If `obj.field` is not an instance of
   *                     GenericField
   * @throws {Error} If `fieldName` is restricted
   *
   * @param   {object}   obj  an object contains definition of fields.
   *                          Only object's ownProperties will be used
   */
  Schema.prototype.setSchema = function (obj) {
    if (typeof obj !== 'object') {
      throw new TypeError('schema is not an object');
    }
    for (var fieldName in obj) {
      if (obj.hasOwnProperty(fieldName)) {
        if (!(obj[fieldName] instanceof GenericField)) {
          throw new TypeError('field: ' + fieldName + ' is not a valid field');
        }
        if (this.isFieldNameRestricted(fieldName)) {
          throw new Error('field: ' + fieldName + ' is restricted');
        }
        if (!obj[fieldName].hasFieldName()) {
          obj[fieldName].setFieldName(fieldName);
        }
        this.schema[fieldName] = obj[fieldName];
      }
    }
  };

  /**
   * check if the tableName is valid for Azure Table Service
   *   * has to be an not empty string
   *
   * @method  isTableNameValid
   *
   * @param   {[type]}          tableName  [description]
   *
   * @return  {Boolean}         [description]
   */
  Schema.prototype.isTableNameValid = function (tableName) {
    if (typeof tableName !== 'string') {
      return false;
    }
    if (tableName.length === 0) {
      return false;
    }
    return true;
  };

  /**
   * check whether the schema is valid
   *   * will check if both PartitionKey and RowKey are defined
   *   * will check if tableName is defined in the option, using
   *     this._isTableNameValid();
   *
   *
   * @todo add support to TableKeyField()
   *
   *
   * @method  isValid
   *
   * @return  {Boolean}  false if no `PartitionKey`, or no `RowKey`, or
   *                           no options.tableName
   *                     true otherwise
   */
  Schema.prototype.isValid = function () {
    if (!this.isPathValid('PartitionKey')) {
      return false;
    }
    if (!this.isPathValid('RowKey')) {
      return false;
    }
    if (!this.isTableNameValid(this.getTableName())) {
      return false;
    }
    return true;
  };

  /**
   * [getFieldAtPath description]
   *
   * @method  getFieldAtPath
   *
   * @param   {String}        path  the path of the field (field name)
   *
   * @return  {GenericField}        [description]
   */
  Schema.prototype.getFieldAtPath = function (path) {
    if (this.isPathValid(path)) {
      return this.schema[path];
    }
    return undefined;
  };

  /**
   * Get the table name definited in the schema.options
   *
   * @todo if we add something like TableNameKey() in the future
   * as we will do something like PartitionKey() and RowKey() soon.
   *
   * @method  getTableName
   *
   * @return  {[type]}      [description]
   */
  Schema.prototype.getTableName = function () {
    return this.options.tableName;
  };

  /**
   * check whether the path defined in schema
   *
   * currently only check if schema obj has ownProperty of path
   *
   * @param  {[type]}  path  [description]
   *
   * @return {Boolean}       [description]
   */
  Schema.prototype.isPathValid = function (path) {
    return (typeof path === 'string') && this.schema.hasOwnProperty(path);
  };

  return Schema;
})();

module.exports = Schema;
