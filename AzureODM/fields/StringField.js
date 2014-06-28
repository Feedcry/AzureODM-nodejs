/**
 * AzureODM.fields.StringField
 *
 *
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */
var utils = require('./../utils.js');

var GenericField = require('./GenericField.js');

var __extends = this.__extends || utils.__extends;
__extends(StringField, GenericField);

/**
 * String Field
 * @param {[type]} options [description]
 * @param {Number} options.maxLength maxLength of the string
 * @param {Number} options.minLength minlength of the string
 * @param {Regex} options.regex require the string matches regex
 */
function StringField(options) {
  if (!(this instanceof StringField)) {
    return new StringField(options);
  }
  GenericField.call(this, options);
}

StringField.prototype._type = 'string';

/**
 * Key Field has to be a none empty string
 *
 *
 * @todo A UTF-16-encoded value. String values may be up to 64 KB in size.
 *
 * @param  {[type]}  value [description]
 * @return {Boolean}       [description]
 *
 * TODO: need to be able set something like length (max, min), regex etc
 */
StringField.prototype.isValid = function (value) {
  if (this.isRequire()) {
    if (this.isNullOrUndefined(value)) {
      return false;
    }
    if (this._checkType(value)) {
      return value.length !== 0;
    }
    return false;
  }
  if (this.isNullOrUndefined(value)) {
    return true;
  }
  if (this._checkType(value)) {
    return value.length !== 0;
  }
  return false;
};

StringField.prototype.toQueryString = function (value) {
  if (this.isNullOrUndefined(value)) {
    throw new TypeError('query value cant be null or undefined');
  }
  if (!this._checkType(value)) {
    throw new TypeError('query value is not a string');
  }
  return '\'' + value + '\'';
};


module.exports = StringField;
