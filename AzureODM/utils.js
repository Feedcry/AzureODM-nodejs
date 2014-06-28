/**
 * AzureODM.utils
 *
 * @author Chen Liang [code@chen.technology]
 * @license MIT
 */
/* jshint camelcase:false */
function arrayAppendArray(toArray, withArray) {
  withArray.forEach(function (item) {
    toArray.push(item);
  });
}


var __extends = function (d, b) {
  for (var p in b) {
    if (b.hasOwnProperty(p)) {
      d[p] = b[p];
    }
  }

  function __() {
    this.constructor = d;
  }
  __.prototype = b.prototype;
  d.prototype = new __();
};

exports.arrayAppendArray = arrayAppendArray;
exports.__extends = __extends;
