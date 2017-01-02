var proxyPrefix = '_proxy_';
var unproxyOriginalName = proxyPrefix + '___unproxy';
var propertyDescriptionNonEnumerable = {
  enumerable: false,
  writable: false,
  configurable: true
};

/**
 * This tool can be used to wrap functions in an object.
 *
 * This is useful if there are circular references and there are unfinished objects required.
 *
 * If `oneShot` is true, the function unproxies itself after first use.
 * Otherwise you can call the `.unproxy` function of the object to remove the proxy.
 *
 * `fun` might return a thenable (like a promise), we respect that and wait for it.
 *
 * @param {Object}      obj               the object we want to proxy the functions
 * @param {Boolean}     [oneShot=false]   if true, unproxies itself after first use
 * @param {Function}    fun               the function which should be called before calling the original function
 */
module.exports = function Proxy (obj, oneShot, fun) {
  // `oneShot` is optional
  if (typeof oneShot === 'function') {
    fun = oneShot;
    oneShot = false;
  }

  obj[unproxyOriginalName] = obj.unproxy;

  /**
   * This function restores the original functions.
   *
   * @method unproxy
   */
  obj.unproxy = function () {
    Object.keys(obj).forEach(function (propertyName) {
      var backup = proxyPrefix + propertyName;
      var value = obj[propertyName];
      var backupFun = obj[backup];

      if (typeof value === 'function' && typeof backupFun === 'function') {
        obj[propertyName] = backupFun;
      }
    });

    obj.unproxy = obj[unproxyOriginalName];
    delete obj[unproxyOriginalName];
  };

  // We do not want that the unproxy function is enumerable
  Object.defineProperty(obj, 'unproxy', propertyDescriptionNonEnumerable);

  // Do the wrapping
  Object.keys(obj).forEach(function (propertyName) {
    var functionToWrap = obj[propertyName];
    var backupName = proxyPrefix + propertyName;

    // Wrap our functions
    if (typeof functionToWrap === 'function') {
      // Save the backup
      obj[backupName] = functionToWrap;

      // We do not want our backup enumerable
      Object.defineProperty(obj, backupName, propertyDescriptionNonEnumerable);

      // Set the function to our wrapper
      obj[propertyName] = function () {
        // Unproxy self if one-shot
        if (oneShot) {
          oneShot = false;
          obj.unproxy();
        }

        var wrapReturnValue = fun.apply(obj, arguments);
        var args = Array.prototype.slice.call(arguments);

        if (wrapReturnValue && wrapReturnValue.then) {
          return wrapReturnValue.then(function () {
            return functionToWrap.apply(obj, args);
          });
        } else {
          return functionToWrap.apply(obj, args);
        }
      };
    }
  });
};
