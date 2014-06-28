/**
 * AzureODM.fields.DateTimeField
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */
var utils = require('./../utils.js');

var GenericField = require('./GenericField.js');

var __extends = this.__extends || utils.__extends;
__extends(DateTimeField, GenericField);

/**
 * DateTimeField
 *
 * @param {[type]} options [description]
 * @param {Number} options.max maxLength of the string
 * @param {Number} options.min minlength of the string
 * @param {Boolean} options.require whether the field is required
 */
function DateTimeField(options) {
  if (!(this instanceof DateTimeField)) {
    return new DateTimeField(options);
  }
  GenericField.call(this, options);
}

DateTimeField.prototype._instance = Date;

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
DateTimeField.prototype.isValid = function (value) {
  if (this.isRequire()) {
    if (this.isNullOrUndefined(value)) {
      return false;
    }
    return this._checkInstance(value);
  }
  if (this.isNullOrUndefined(value)) {
    return true;
  }
  return this._checkInstance(value);
};

DateTimeField.prototype.toQueryString = function (value) {
  if (this.isNullOrUndefined(value)) {
    throw new TypeError('query value cant be null or undefined');
  }
  if (!this._checkInstance(value)) {
    throw new TypeError('query value is not a Date');
  }
  return value.toJSON();
}

module.exports = DateTimeField;
