/**
 * AzureODM/fields/NumberField.js
 *
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */
var utils = require('./../utils.js');
var GenericField = require('./GenericField.js');

var __extends = this.__extends || utils.__extends;
__extends(NumberField, GenericField);

/**
 * NumberField
 *
 * @param {[type]} options [description]
 * @param {Number} options.max maxLength of the string
 * @param {Number} options.min minlength of the string
 * @param {Boolean} options.require whether the field is required
 */
function NumberField(options) {
  if (!(this instanceof NumberField)) {
    return new NumberField(options);
  }
  GenericField.call(this, options);
}

NumberField.prototype._type = 'number';

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
NumberField.prototype.isValid = function (value) {
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

NumberField.prototype.toQueryString = function (value) {
  if (this.isNullOrUndefined(value)) {
    throw new TypeError('query value cant be null or undefined');
  }
  if (!this._checkType(value)) {
    throw new TypeError('query value is not a string');
  }
  return value.toString();
};

module.exports = NumberField;
