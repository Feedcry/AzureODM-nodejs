/**
 * AzureODM.azure.driver
 *
 * Wrapped Table Service
 *
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */

var Promise = require('bluebird');
var azure = require('azure');
var TableQuery = azure.TableQuery;

/**
 * A Module Wraps Azure Table Service
 *
 * @method
 *
 * @return  {[type]}  [description]
 */
var Driver = (function () {
  function Driver(accountName, accessKey) {
    if (!(this instanceof Driver)) {
      throw new Error('Driver has to be created using `new`');
    }
    this.accountName = accountName;
    this.accessKey = accessKey;
    this.tableService = azure.createTableService(accountName, accessKey);
  }

  /**
   * Creates a new table within a storage account if it doesnt exists.
   *
   * @method  createTableIfNotExists
   *
   * @param   {[type]}                tableName  [description]
   * @param   {[type]}                options    [description]
   *
   * @return  {Promise}                [description]
   */
  Driver.prototype.createTableIfNotExists = function (tableName, options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.tableService.createTableIfNotExists(tableName, options,
        function (err, created) {
          if (err) {
            return reject(err);
          }
          return resolve(created);
        });
    });
  };

  /**
   * A recursive function that will get all pages
   * TODO: NEED TESTING
   *
   * @param  {[type]} continuation   [description]
   * @param  {[type]} entities       [description]
   * @param  {[type]} expectedLength [description]
   *
   * @return {[type]}                [description]
   */
  Driver._getAllContinuationPages = function (continuation, entities, expectedLength) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if (expectedLength && entities.length >= expectedLength) {
        console.log('[_getAllContinuationPages] length: ' + entities.length + ' >= expectedLength: ' + expectedLength);
        return resolve(entities);
      }
      if (!continuation.hasNextPage()) {
        // got them all
        console.log('[_getAllContinuationPages] final length: ' + entities.length);
        return resolve(entities);
      }
      continuation.getNextPage(function (err, entries, entriesContinuation) {
        if (err) {
          return reject(err);
        }
        console.log('[_getAllContinuationPages] nextPage length: ' + entries.length);
        entries.forEach(function (entry) {
          entities.push(entry);
        });
        return resolve(self._getAllContinuationPages(entriesContinuation, entities, expectedLength));
      });
    });
  };
  /**
   * Wrapper of Azure.TableService.queryEntities
   *
   * @method  findAll
   *
   * @param   {[type]}  tableName    [description]
   * @param   {[type]}  queryString  [description]
   * @param   {[type]}  fields       [description]
   * @param   {[type]}  limit        [description]
   *
   * @return  {[type]}  [description]
   */
  Driver.prototype.findAll = function (tableName, queryString, fields, limit) {
    var expectedLength = limit;
    var self = this;
    return new Promise(function (resolve, reject) {
      if (!tableName || typeof tableName !== 'string' || tableName.length === 0) {
        return reject(new Error('invalid tableName'));
      }
      var query;
      if (Array.isArray(fields) && fields.length > 0) {
        query = TableQuery.select(fields);
      } else {
        query = TableQuery.select();
      }
      query.where(queryString).from(tableName);
      if (limit) {
        query.top(limit);
      }
      self.tableService.queryEntities(query,
        function (err, entities, entriesContinuation) {
          if (err) {
            return reject(err);
          }
          //console.log('inital get ' + entities.length + ' entities');
          return resolve(
            self.constructor._getAllContinuationPages(
              entriesContinuation, entities, expectedLength));
        });
    });
  };

  /**
   * Wrap for Azure Node SDK tableService.deleteEntity
   *
   * @method  deleteEntity
   *
   * @param   {string}      tableName         [description]
   * @param   {object}      entityDescriptor  [description]
   * @param   {object}      options           [description]
   *
   * @return  {Promise}      [description]
   */
  Driver.prototype.deleteEntity = function (tableName, entityDescriptor, options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.tableService.deleteEntity(tableName, entityDescriptor, options,
        function (err, successful, response) {
          if (err) {
            return reject(err);
          }
          if (!successful) {
            return reject(response);
          }
          return resolve(true);
        });
    });
  };

  /**
   * Inserts a new entity into a table
   *
   * @method  insertEntity
   *
   * @param   {string}      tableName         [description]
   * @param   {object}      entityDescriptor  [description]
   * @param   {object}      options           options pass to Azure Node
   *                                          SDK `optionsOrCallback`
   *
   * @return  {[type]}      [description]
   */
  Driver.prototype.insertEntity = function (tableName, entityDescriptor, options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.tableService.insertEntity(tableName, entityDescriptor, options,
        function (err, entity) {
          if (err) {
            return reject(err);
          }
          return resolve(entity);
        });
    });
  };

  /**
   * Inserts or updates a new entity into a table
   *
   * @method  insertOrReplaceEntity
   *
   * @param   {string}               tableName         [description]
   * @param   {object}               entityDescriptor  [description]
   * @param   {object}               options           [description]
   *
   * @return  {Promise}               [description]
   */
  Driver.prototype.insertOrReplaceEntity = function (tableName, entityDescriptor, options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.tableService.insertOrReplaceEntity(tableName, entityDescriptor, options,
        function (err, entity) {
          if (err) {
            return reject(err);
          }
          return resolve(entity);
        });
    });
  };

  /**
   * Updates an existing entity within a table by replacing it
   *
   * @method  updateEntity
   *
   * @param   {[type]}      tableName         [description]
   * @param   {[type]}      entityDescriptor  [description]
   * @param   {[type]}      options           [description]
   *
   * @return  {[type]}      [description]
   */
  Driver.prototype.updateEntity = function (tableName, entityDescriptor, options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.tableService.updateEntity(tableName, entityDescriptor, options,
        function (err, entity) {
          if (err) {
            return reject(err);
          }
          return resolve(entity);
        });
    });
  };

  /**
   * Updates an existing entity within a table by merging new property
   * values into the entity
   *
   * @method  mergeEntity
   *
   * @param   {[type]}     tableName         [description]
   * @param   {[type]}     entityDescriptor  [description]
   * @param   {[type]}     options           [description]
   *
   * @return  {[type]}     [description]
   */
  Driver.prototype.mergeEntity = function (tableName, entityDescriptor, options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.tableService.mergeEntity(tableName, entityDescriptor, options,
        function (err, entity) {
          if (err) {
            return reject(err);
          }
          return resolve(entity);
        });
    });
  };

  /**
   * Inserts or updates an existing entity within a table by merging
   * new property values into the entity.
   *
   * @method  insertOrMergeEntity
   *
   * @param   {[type]}             tableName         [description]
   * @param   {[type]}             entityDescriptor  [description]
   * @param   {[type]}             options           [description]
   *
   * @return  {[type]}             [description]
   */
  Driver.prototype.insertOrMergeEntity = function (tableName, entityDescriptor, options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.tableService.insertOrMergeEntity(tableName, entityDescriptor, options,
        function (err, entity) {
          if (err) {
            return reject(err);
          }
          return resolve(entity);
        });
    });
  };

  return Driver;
})();

module.exports = Driver;
