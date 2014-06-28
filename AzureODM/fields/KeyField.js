/**
 * AzureODM.fields.KeyField
 *
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */
var utils = require('./../utils.js');
var __extends = this.__extends || utils.__extends;
var StringField = require('./StringField.js');

__extends(KeyField, StringField);

/**
 * KeyField for PartitionKey or RowKey
 *
 * @todo need to check whether the value is valid:
 *       http://msdn.microsoft.com/en-US/library/azure/dd179338
 *       * not include:
 *        * The forward slash (/) character
 *        * The backslash (\) character
 *        * The number sign (#) character
 *        * The question mark (?) character
 *        * Control characters from U+0000 to U+001F
 *        * Control characters from U+007F to U+009F
 *       * size:
 *        * The partition/row key may be a string value up to 1 KB in size
 *
 * @param {object} options options
 *
 */
function KeyField(options) {
  if (!(this instanceof KeyField)) {
    return new KeyField(options);
  }
  this.defaultOptions = this.defaultOptions || {
    require: true,
    requireSerializing: false,
    serializedType: undefined
  };
  StringField.call(this, options);
}

module.exports = KeyField;
