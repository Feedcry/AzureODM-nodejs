/**
 * AzureODM.fields.GenericField
 *
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */

/**
 * The Basic Field
 * @param {[type]} options options for the field
 * @param {String} options.fieldName the field name on Azure Table
 * @param {Boolean} options.require Whether this field is required
 * @param {Function} options.validator a function will be called with the value
 *                                     should return true if the value is valid
 *                                     should return false if invalid
 */
function GenericField(options) {
  if (!(this instanceof GenericField)) {
    return new GenericField(options);
  }
  //console.log('[GenericField][init]');
  this.defaultOptions = this.defaultOptions || {
    require: false,
    requireSerializing: false,
    serializedType: undefined,
    validator: undefined
  };
  this.options = {};
  this.setOptions(options);
}

//GenericField.fieldName = 'GenericField';
//
/**
 * Check whether the fieldName is valid
 *
 * @todo  meet Azure Standard
 *        http://msdn.microsoft.com/en-US/library/azure/dd179338
 *
 * @method  _isFieldNameValid
 *
 * @param   {[type]}           fieldName  [description]
 *
 * @return  {Boolean}          [description]
 */
GenericField.prototype._isFieldNameValid = function (fieldName) {
  return true;
};

/**
 * Get the options.FieldName
 *
 * @method  getFieldName
 *
 * @return  {[type]}      [description]
 */
GenericField.prototype.getFieldName = function () {
  return this.options.fieldName;
};

/**
 * Check whether options.hasFieldName is not empty
 *
 * @method  hasFieldName
 *
 * @return  {Boolean}     [description]
 */
GenericField.prototype.hasFieldName = function () {
  return !this.isNullOrUndefined(this.getFieldName());
};

/**
 * Set options.fieldName, will override if `override` is true
 *
 * @method  setFieldName
 *
 * @throws {Error} If fieldName is not valid
 * @throws {Error} If options.fieldName exist and not override
 *
 * @param   {[type]}      fieldName  [description]
 */
GenericField.prototype.setFieldName = function (fieldName, override) {
  if (!this._isFieldNameValid(fieldName)) {
    throw new Error('field name: ' + fieldName + ' is invalid');
  }
  if (!this.hasFieldName()) {
    this.setOption('fieldName', fieldName);
  } else if (override) {
    this.setOption('fieldName', fieldName);
  } else {
    throw new Error('field name exists');
  }
};

GenericField.prototype.setOptions = function (options) {
  // console.log('[setOptions]: ' + JSON.stringify(this.defaultOptions));
  if (options) {
    for (var option in options) {
      if (options.hasOwnProperty(option)) {
        // console.log('[override option]' + option);
        this.options[option] = options[option];
      }
    }
  }
  for (var defaultOption in this.defaultOptions) {
    if (!this.options.hasOwnProperty(defaultOption)) {
      // console.log('[set ][' + defaultOption + '][' + this.constructor.defaultOptions[defaultOption] + ']');
      this.options[defaultOption] = this.defaultOptions[defaultOption];
    }
  }
};

GenericField.prototype.setOption = function (optionName, value) {
  this.options[optionName] = value;
};

GenericField.prototype.getOption = function (option) {
  if (this.options.hasOwnProperty(option)) {
    return this.options[option];
  }
  return this.constructor.defaultOptions[option];
};

// GenericField.defaultOptions = {
//   require: false,
//   requireSerializing: false,
//   serializedType: undefined
// };

GenericField.prototype.isRequire = function () {
  return this.getOption('require');
};

//GenericField.requireSerializing = false;

//GenericField._type = undefined;

/**
 * serializer
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
GenericField.prototype.serialize = function () {
  throw new Error('NotImplemented');
};

/**
 * deserializer
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
GenericField.prototype.deserialize = function () {
  throw new Error('NotImplemented');
};


GenericField.prototype._checkType = function (value) {
  return (typeof value === this._type);
};

GenericField.prototype._checkInstance = function (value) {
  return (value instanceof this._instance);
};

GenericField.prototype.isNullOrUndefined = function (value) {
  return (value === null || typeof value === 'undefined');
};

/**
 * validator
 * @param  {[type]}  value [description]
 * @return {Boolean}       [description]
 */
GenericField.prototype.isValid = function () {
  throw new Error('NotImplemented');
};

/**
 * convert value to proper query string
 *
 * @method  toQueryString
 *
 * @param   {[type]}       value  [description]
 *
 * @return  {[type]}       [description]
 */
GenericField.prototype.toQueryString = function (value) {
  throw new Error('NotImplemented');
};
module.exports = GenericField;
