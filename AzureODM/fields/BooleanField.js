/**
 * AzureODM.fields.BooleanField
 *
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */
var utils = require('./../utils.js');
var GenericField = require('./GenericField.js');

var __extends = this.__extends || utils.__extends;
__extends(BooleanField, GenericField);

/**
 * BooleanField
 *
 * @param {[type]} options [description]
 * @param {Number} options.max maxLength of the string
 * @param {Number} options.min minlength of the string
 * @param {Boolean} options.require whether the field is required
 */
function BooleanField(options) {
  if (!(this instanceof BooleanField)) {
    return new BooleanField(options);
  }
  GenericField.call(this, options);
}

BooleanField.prototype._type = 'boolean';

/**
 * Check whether value is a valid number
 *
 *
 * @method  isValid
 *
 * @param   {any}  value  [description]
 *
 * @return  {Boolean}  return false if not undefined and not
 */
BooleanField.prototype.isValid = function (value) {
  if (this.isRequire()) {
    if (this.isNullOrUndefined(value)) {
      return false;
    }
    return this._checkType(value);
  }
  if (this.isNullOrUndefined(value)) {
    return true;
  }
  return this._checkType(value);
};


BooleanField.prototype.toQueryString = function (value) {
  if (this.isNullOrUndefined(value)) {
    throw new TypeError('query value cant be null or undefined');
  }
  if (!this._checkType(value)) {
    throw new TypeError('query value is not a boolean');
  }
  return value.toString();
};

module.exports = BooleanField;
