/**
 * test/AzureODM/fixtures.js
 */
var Model = require('./../../AzureODM/Model.js');
var Schema = require('./../../AzureODM/Schema.js');
var Fields = require('./../../AzureODM/fields/');
exports.ModelWithoutDriver = function () {
  var FakeSchema = new Schema({
    PartitionKey: Fields.KeyField(),
    RowKey: Fields.KeyField(),
    field1: Fields.StringField(),
    field2: Fields.NumberField()
  }, {
    tableName: 'fakeTableName'
  });
  return Model.compile('ModelWithoutDriver', FakeSchema);
};
