/**
 * AzureODM/test.index.js
 */
var AzureODM = require('./../../AzureODM');
describe('AzureODM', function() {
  describe('index', function() {
    describe('exports', function() {
      it('should exports Model', function() {
        AzureODM.should.have.property('Model');
      });
      it('should exports Entity', function() {
        AzureODM.should.have.property('Entity');
      });
      it('should exports Query', function() {
        AzureODM.should.have.property('Query');
      });
      it('should exports Schema', function() {
        AzureODM.should.have.property('Schema');
      });
    });
  });
});
