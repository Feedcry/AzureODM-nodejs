AzureODM-nodejs
===============

Lightweight ODM for Azure Table Storage Services, inspired by Mongoose

**Python Version: [AzureODM-py](https://github.com/Feedcry/AzureODM-py)**

*under development*

## Features
* Mongoose like Entity and Model Definitions
* Mongoose + Mongoengine like **query** styles
* Field classes for easy validation and extension

## Features under development
* Update/Save entities
* Remove *azure-sdk-for-node* dependency
* Support dynamic tableName and query tableName as a field

## Dependencies
* bluebird (for promise)
* azure [azure-sdk-for-node](https://github.com/Azure/azure-sdk-for-node)

# Quick Guide

## Define Model

```js
var AzureODM = require('./AzureODM');
var Fields = AzureODM.Fields;

var PageSchema = AzureODM.Schema({
  RowKey: Fields.KeyField(), // hashed URL of the page
  PartitionKey: Fields.KeyField(), // netloc of the page, like example.com
  url: Fields.StringField(),
  title: Fields.StringField(),
  description: Fields.StringField(),
  pageType: Fields.StringField(),
  pageText: Fields.StringField(),
  summary: Fields.StringField(),
  author: Fields.StringField(),
  thumbnail: Fields.StringField(),
  publishedAt: Fields.DateTimeField(),
  updatedAt: Fields.DateTimeField(),
  createdAt: Fields.DateTimeField(),
  starCount: Fields.NumberField(),
  parserVersion: Fields.NumberField()
}, {
  tableName: 'pages',
  driver: new AzureODM.Driver(config.azure.storage.accountName,
    config.azure.storage.accountAccessKey)
});

// exports the compiled Page model
module.exports = AzureODM.Model.compile('Page', PageSchema);
```

## Query

query begins with `find()`

```js
var query = Page.find(QuerySet.object);
```

`query` will be a `Query.QuerySet` object with the Model `Page` attached

> find by field

```js
query.where({
        PartitionKey__eq: feedId
      });
```

> or combine multiple queries for the same fields

```js
query.where({
        PartitionKey__lt: `somethingLarge`,
        PartitionKey__gt: `somethingSmall`,
      });
```

> query chain to query multiple fields

```js
query.where({
        PartitionKey__eq: `something`
      })
     .orWhere({
        PartitionKey__eq: `somethingElse`
      })
     .andWhere({
        RowKey__eq: `somethingRow`
      });
```

> limit the fields returned

```js
query.select(['PartitionKey', 'RowKey', 'url', 'feedDesc', 'title', 'pubAt']);
```

> limit the number of entities returned

```js
query.limit(5);
```

> exectute the query (will return a promise)

```js
query.exec().then(function(pages){
    console.log(pages.length);
    });
```


## Extend Model (before compile)

```js

/**
 * get the page by partitionKey (netloc) and rowKey (hashedUrl)
 *
 * @method  getByHashedUrlsForNetloc
 *
 * @param   {String}                  netloc      PartitionKey, example.com
 * @param   {String}                  hashedUrls  RowKey, hashed url
 * @param   {Array}                  fields      a list of fields to be returned
 *
 * @return  {Page}                  Page Entity
 */
PageSchema.statics.getByHashedUrlsForNetloc = function (netloc, hashedUrls, fields) {
  return this.find().select(fields)
    .where({
      PartitionKey__eq: netloc
    })
    .andWhere({
      RowKey__in: hashedUrls
    })
    .exec();
};

/**
 * get a list of pages of urls
 *
 * @param  {Array}  urls
 * @param  {Function}     callback
 *
 * @return {[Page]}   return array of entites
 */
PageSchema.statics.getByUrls = function (urls) {
  var self = this;
  return new Promise(function (resolve, reject) {
    if (!Array.isArray(urls)) {
      return reject(new Error('urls is not an array'));
    }
    if (urls.length === 0) {
      return resolve([]);
    }

    var netlocAndHashedUrls = {}; // partition and row key pairs
   
    urls.forEach(function (url) {
      var PartitionKey = utils.netlocOfUrl(url);
      // hashUrl() returns hashed url 
      var RowKey = hashUrl(url);
      // netlocAndHashedUrls(url) returns netloc of the url
      if (!netlocAndHashedUrls.hasOwnProperty(PartitionKey)) {
        netlocAndHashedUrls[PartitionKey] = [RowKey];
      } else {
        netlocAndHashedUrls[PartitionKey].push(RowKey);
      }
    });
    // only return limitd set of fields
    var fields = ['PartitionKey',
      'RowKey',
      'url',
      'title',
      'description',
      'summary',
      'thumbnail',
      'parserVersion'
    ];

    // For async retrieving from Azure Table
    var ps = [];
    for (var pk in netlocAndHashedUrls) {
      if (netlocAndHashedUrls.hasOwnProperty(pk)) {
        ps.push(self.getByHashedUrlsForNetloc(
          pk, netlocAndHashedUrls[pk], fields));
      }
    }
    // using promise
    return resolve(Promise.all(ps).then(function (results) {
      var returnEntities = [];
      results.forEach(function (entities) {
        entities.forEach(function (entity) {
          returnEntities.push(entity);
        });
      });
      return returnEntities;
    }));
  });
};
```

## Contributing

`npm install`

test:
`make test`

Authors
-------

**Chen Liang**

+ http://chen.technology
+ http://github.com/uschen

Credits
-------
+ Inspired by [Mongoose](https://github.com/LearnBoost/mongoose)

License
-------
Licensed under the New BSD License
