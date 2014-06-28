/**
 * AzureODM.Entity
 *
 * The actual Entity that reflects the Azure Table Entity
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */


/**
 * Entity Class
 *
 * @param {[type]} obj    the obj that contains available inital values
 * @param {[type]} fields the selected fields returned from query
 */
var Entity = (function () {
  function Entity(obj, fields) {
    if (!(this instanceof Entity)) {
      throw new Error('use new to create an instance');
    }
    this._doc = {};
    this._selectedFields = [];
    this._timestamp = null;

    /**
     * store the status of the entity
     *
     * @type  {Object}
     */
    this._status = {
      isNew: true,
      isPartial: false,
      isChanged: false
    };
    this.set(obj, fields);
  }
  Entity.prototype.schema = null;

  /**
   * Set the entity values and selected fields
   *
   * @todo need to change the isPartial based on fields
   *
   * @method  set
   *
   * @param   {Object}  obj     inital values
   * @param   {Array}  fields  selected fields
   */
  Entity.prototype.set = function (obj, fields) {
    if ( !! fields && !Array.isArray(fields)) {
      throw new TypeError('fields is not an array');
    }
    this._selectedFields = fields;
    if (typeof obj !== 'object') {
      return;
    }
    for (var key in obj) {
      //console.log('set field' + field);
      if (obj.hasOwnProperty(key)) {
        if (this.schema.isPathValid(key)) {
          this.setValue(key, obj[key]);
        }
      }
    }
  };

  /**
   * Set the value at path
   *
   * @todo * check if the Field.getOption('requireSerializing')
   *       * if not, return the value
   *
   * @method  getValue
   *
   * @throws {Error} If path is invalid
   *
   * @param   {string}  path   currently supports only one level path
   *
   * @return  {null}  returns nothing
   */
  Entity.prototype.getValue = function (path) {
    if (!this.schema.isPathValid(path)) {
      throw new Error('path is invalid ' + path);
    }
    return this._doc[path] ? this._doc[path] : null;
  };

  /**
   * Get the value at the path of the Entity
   *
   * @todo will get the field from schema.getFieldAtPath()
   *       check if the Field.getOption('requireSerializing')
   *       if no, check Field.isValid(value)

   * @method  setValue
   *
   * @param   {[type]}  path   [description]
   * @param   {[type]}  value  [description]
   *
   * @throws {Error} If path is not valid in the schema
   * @throws {Error} If value is not valid for field at the path
   *
   */
  Entity.prototype.setValue = function (path, value) {
    //console.log('[setValue][path:' + path + '][value:' + value);
    if (!this.schema.isPathValid(path)) {
      throw new Error('path is invalid ' + path);
    }
    if (!this.schema.getFieldAtPath(path).isValid(value)) {
      throw new Error('value is invalid for path');
    }
    this._doc[path] = value;
  };

  /**
   * Add getters and setters to Entity
   *
   *
   * @method  addGetterSetters
   *
   * @param   {[type]}          obj   [description]
   * @param   {[type]}          name  [description]
   */
  var addGetterSetters = function (obj, name) {
    Object.defineProperty(obj, name, {
      get: function () {
        return this.getValue(name);
      },
      set: function (value) {
        this.setValue(name, value);
      }
    });
  };
  /**
   * Attach the schema to the Entity and
   * add setters and getters
   *
   * It will also store field names to the this.paths
   *
   * @param  {[type]} schema A Single Level Object (not nested)
   *
   * @return {[type]}        [description]
   */
  Entity.prototype.__setSchema = function (schema) {
    if (!this._doc) {
      this._doc = {};
    }
    this.schema = schema;
    for (var key in schema.schema) {
      if (schema.schema.hasOwnProperty(key)) {
        addGetterSetters(this, key);
      }
    }
  };

  /**
   * Get the timestamp of the entity
   *
   * @method  _getTimestamp
   *
   * @return  {[type]}       [description]
   */
  Entity.prototype._getTimestamp = function () {
    return this._timestamp;
  };

  /**
   * get `_status.isPartial`
   *
   * @method  _isPartial
   *
   * @return  {Boolean}   [description]
   */
  Entity.prototype._isPartial = function () {
    return this._status.isPartial;
  };

  /**
   * get `_status.isNew`
   *
   * @method  _isNew
   *
   * @return  {Boolean}  [description]
   */
  Entity.prototype._isNew = function () {
    return this._status.isNew;
  };

  /**
   * get `_status.isChanged`
   *
   * @method  _isChanged
   *
   * @return  {Boolean}   [description]
   */
  Entity.prototype._isChanged = function () {
    return this._status.isChanged;
  };

  /**
   * Generate a new entity descriptor object which only contains
   * `PartitionKey` and `RowKey`
   *
   * @method  _toEntityDescriptor
   *
   * @return  {[type]}             [description]
   */
  Entity.prototype._toEntityDescriptor = function () {
    return {
      PartitionKey: this.getValue('PartitionKey'),
      RowKey: this.getValue('RowKey')
    };
  };

  /**
   * Check if the entity is valid
   *
   * @method  validate
   *
   * @return  {[type]}  [description]
   */
  Entity.prototype.validate = function () {
    throw new Error('not implemented');
  };
  return Entity;
})();

module.exports = Entity;
