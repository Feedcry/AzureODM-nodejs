/**
 * AzureODM.Schema.Query
 *
 * Query builder for Azure Table
 *
 * Should support something like
 *   * where({field__eq: value})
 *   * where({field__gt: value})
 *   * andWhere({field__in: []})
 *
 * Should also support subquery obj Q
 *
 *  * where(Q({field__eq: value})._or({field__le: value})).andWhere()
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */


var Schema = require('./Schema');
var utils = require('./utils.js');
var Promise = require('bluebird');
var __extends = this.__extends || utils.__extends;

function QOperator(o) {
  this.o = o;
}
QOperator.prototype.o = null;

var AndOperator = new QOperator('and');
var OrOperator = new QOperator('or');
var NotOperator = new QOperator('not');

/**
 * The query node
 *
 * @param {QNode} obj return a new instance of self
 */
var QNode = (function () {
  function QNode() {
    if (!(this instanceof QNode)) {
      return new QNode();
    }
  }

  /**
   * Valid query operations for Azure Table
   *
   * @type  {Array}
   */
  QNode.__validOperations = ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'ne', 'in'];

  /**
   * Combine two subqueries and return an instance of QCombination
   *
   * @method  __combine
   *
   * @param   {Object}   other      The other subquery to be combined
   *                                with this.
   * @param   {QOperation}   operation  And, Or, Not
   *
   * @return  {QCombination}   the instance of QCombination object that
   *                           contains two subqueries
   */
  QNode.prototype.__combine = function (other, operation) {
    return new QCombination(operation, this, other);
  };

  QNode.prototype._or = function (other) {
    return this.__combine(other, OrOperator);
  };

  QNode.prototype._and = function (other) {
    return this.__combine(other, AndOperator);
  };

  QNode.prototype._not = function (other) {
    return this.__combine(other, NotOperator);
  };
  return QNode;
})();


/**
 * return an instance of Q
 *
 * @param {[type]} obj [description]
 */
var Q = (function (_super) {
  __extends(Q, _super);

  function Q(obj) {
    if (!(this instanceof Q)) {
      return new Q(obj);
    }
    if (typeof obj !== 'object') {
      throw new TypeError('obj is not an object');
    }
    this.query = obj;
    if (this.query) {
      var keys = Object.keys(this.query);
      if (keys.length !== 1 || !this.query.hasOwnProperty(keys[0])) {
        throw new TypeError('invalid query object');
      }
      this.k = keys[0];
      this.v = this.query[this.k];
    }
    _super.call(this);
  }
  /**
   * Compile Q into Query String
   *
   * This is the method that actually convert query like
   * `{PartitionKey__eq: '123'}` to Azure Table Service query string
   *
   * @todo use getFieldName at Path from Schema.getFieldAtPath().getFieldName()
   *
   * @param {Schema} withSchema the Schema object used to validate and
   *                            generate query string
   *
   * @return {String} Azure Table query string
   */
  Q.prototype.toQueryString = function (withSchema) {
    if (!(withSchema instanceof Schema)) {
      throw new TypeError('withSchema is not an Schema');
    }
    var parsedKey = this.k.split('__');
    if (parsedKey.length !== 2) {
      throw new Error('invalid query expression: ' + this.k);
    }
    var field = parsedKey[0];
    var operator = parsedKey[1];
    if (!withSchema.isPathValid(field)) {
      throw new Error('queried path is not valid: ' + field);
    }
    var fieldObj = withSchema.getFieldAtPath(field);
    if (this.constructor.__validOperations.indexOf(operator) === -1) {
      throw new Error('operator is not valid, ' + JSON.stringify(operator));
    }
    if (operator === 'in') {
      // When the query operation is `in`
      if (!Array.isArray(this.v)) {
        throw new TypeError('in operator must followed be list');
      } else if (this.v.length === 0) {
        throw new Error('no empty list after in operator');
      }
      var qs = '(';
      this.v.forEach(function (subV) {
        qs += (qs === '(' ? '' : ' or ') + field + ' eq ' +
          fieldObj.toQueryString(subV);
      });
      return qs + ')';
    }
    return (fieldObj.getFieldName() + ' ' +
      operator + ' ' +
      fieldObj.toQueryString(this.v));
  };
  return Q;
})(QNode);

/**
 * An Module that represents a combination of two subqueries
 *
 * @method
 *
 * @param   {[type]}  _super  [description]
 *
 * @return  {[type]}  [description]
 */
var QCombination = (function (_super) {
  __extends(QCombination, _super);

  function QCombination(operation, q1, q2) {
    if (!(this instanceof QCombination)) {
      return new QCombination(operation, q1, q2);
    }
    if (!(operation instanceof QOperator)) {
      throw new TypeError('operation is not a QOperator');
    }
    if (!(q1 instanceof QNode)) {
      q1 = new Q(q1);
    }
    if (!(q2 instanceof QNode)) {
      q2 = new Q(q2);
    }
    this.subqueries = [];
    if (q1 instanceof Q) {
      this.subqueries.push(q1);
    } else if (q1 instanceof QCombination) {
      utils.arrayAppendArray(this.subqueries, q1.subqueries);
    }
    this.subqueries.push(operation);
    if (q2 instanceof Q) {
      this.subqueries.push(q2);
    } else if (q2 instanceof QCombination) {
      utils.arrayAppendArray(this.subqueries, q2.subqueries);
    }
    _super.call(this);
  }
  QCombination.prototype = Object.create(QNode.prototype);

  /**
   * Generate the query string for Azure Table Service
   *
   * This will call each subquery's `toQueryString` method and combine
   * subquery strings with QOperators between them.
   *
   * @method  toQueryString
   *
   * @param   {Schema}       withSchema  The Schema object that will be
   *                                     used to generate query string
   *                                     for Azure Table Service
   *
   * @return  {String}       Generated Azure Table Service Query String
   */
  QCombination.prototype.toQueryString = function (withSchema) {
    if (!(withSchema instanceof Schema)) {
      throw new TypeError('withSchema is not an Schema');
    }
    var qs = '';
    var nextType = Q;
    this.subqueries.forEach(function (subq) {
      if (!(subq instanceof nextType)) {
        throw new Error('QOperator has to be used to connect two query');
      }
      if (subq instanceof Q) {
        qs += subq.toQueryString(withSchema);
        nextType = QOperator;
      } else if (subq instanceof QOperator) {
        qs += ' ' + subq.o + ' ';
        nextType = Q;
      } else {
        throw new TypeError('invalid query obj');
      }
    });
    return '(' + qs + ')';
  };
  return QCombination;
})(QNode);

/**
 * [QuerySet description]
 *
 * @param {[type]} obj can be object or Q, if it's an object, we will
 * wrap it with a Q
 */
var QuerySet = (function () {
  function QuerySet(model) {
    if (!(this instanceof QuerySet)) {
      throw new Error('use new to create an instance');
    }
    this.model = null;
    this._queryCombination = null;
    this._fields = null;
    this._top = null;
    this._offset = null;
    if (model) {
      this.setModel(model);
    }
  }

  /**
   * Set Model which will be attached with Schema, to the Query
   *
   * @method  setModel
   *
   * @param   {Model}  model  the Model on which to be queried based
   */
  QuerySet.prototype.setModel = function (model) {
    // if (!(model instanceof Model)) {
    //   throw new TypeError('model is not a Model');
    // }
    this.model = model;
    return this;
  };

  /**
   * Get `queryString`
   *
   * @method  getQueryString
   *
   * @return  {String}        `this.queryString`
   */
  QuerySet.prototype.getQueryString = function () {
    return this.queryString;
  };

  /**
   * append filtering Query
   *
   * @param  {QOperator} operation And, Or, Not
   * @param  {Object} obj       The object that contains query or An
   *                            instance of QNode
   *
   * @return {QuerySet}         Return the QuerySet instance
   */
  QuerySet.prototype.__where = function (operation, obj) {
    if (!(obj instanceof QNode)) {
      obj = new Q(obj);
    }
    if (!this._queryCombination) {
      this._queryCombination = obj;
    } else {
      if (!operation) {
        throw new Error('you can only call where before *Where()');
      }
      this._queryCombination = new QCombination(operation, this._queryCombination, obj);
    }

    return this;
  };

  /**
   * append where
   *
   * @param  {[type]} obj [description]
   *
   * @return {[type]}     [description]
   */
  QuerySet.prototype.where = function (obj) {
    return this.__where(null, obj);
  };

  /**
   * append and where
   *
   * @param  {[type]} obj [description]
   *
   * @return {[type]}     [description]
   */
  QuerySet.prototype.andWhere = function (obj) {
    return this.__where(AndOperator, obj);
  };

  /**
   * append or where
   *
   * @param  {[type]} obj [description]
   *
   * @return {[type]}     [description]
   */
  QuerySet.prototype.orWhere = function (obj) {
    return this.__where(OrOperator, obj);
  };

  /**
   * append not where
   *
   * @param  {[type]} obj [description]
   *
   * @return {[type]}     [description]
   */
  QuerySet.prototype.notWhere = function (obj) {
    return this.__where(NotOperator, obj);
  };

  /**
   * select fields
   *
   *
   * @todo Check whether each field is defined in Schema
   *
   * @param  {[type]} fields * or null -> all fields
   *
   * @return {[type]}        [description]
   */
  QuerySet.prototype.select = function (fields) {
    if (!fields ||
      fields === '*' ||
      fields === '' || (Array.isArray(fields) && fields.length === 0)) {
      fields = null;
    } else if (!Array.isArray(fields)) {
      throw new TypeError('fields is not an array');
    }
    this._fields = fields;
    return this;
  };

  /**
   * [limit description]
   *
   * @param  {[type]} limit  [description]
   * @param  {[type]} offset [description]
   *
   * @return {[type]}        [description]
   */
  QuerySet.prototype.limit = function (limit, offset) {
    this._top = limit;
    this._offset = offset;
    return this;
  };

  /**
   * Generate Azure Table Query String from `_queryCombination`
   *
   * @method  toQueryString
   *
   * @param   {[type]}       withSchema  [description]
   *
   * @return  {[type]}       [description]
   */
  QuerySet.prototype.toQueryString = function (withSchema) {
    if (!this._queryCombination) {
      return null;
    }
    return this._queryCombination.toQueryString(withSchema);
  };

  /**
   * Will call driver's find
   *
   * @method  exec
   *
   * @return  {[type]}  [description]
   */
  QuerySet.prototype.exec = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      if (!self.model) {
        return reject(new Error('invalid model'));
      }
      if (!self.model.driver) {
        return reject(new Error('invalid model driver'));
      }
      self.queryString = self.toQueryString(self.model.schema);
      var tableName = self.model.schema.getTableName();
      return resolve(
        self.model.driver.findAll(
          tableName, self.queryString, self._fields, self._top)
        .then(function (entities) {
          return self.model.fromAzureEntities(entities);
        })
      );
    });
  };
  return QuerySet;
})();


exports.QOperator = QOperator;
exports.AndOperator = AndOperator;
exports.OrOperator = OrOperator;
exports.NotOperator = NotOperator;
exports.QNode = QNode;
exports.Q = Q;
exports.QCombination = QCombination;
exports.QuerySet = QuerySet;
