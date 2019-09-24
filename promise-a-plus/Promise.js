"use strict";
var nextTick = function (cb) { return void setTimeout(cb); };
var PromiseStatus;
(function (PromiseStatus) {
    PromiseStatus[PromiseStatus["Pending"] = 1] = "Pending";
    PromiseStatus[PromiseStatus["Resolved"] = 2] = "Resolved";
    PromiseStatus[PromiseStatus["Rejected"] = 3] = "Rejected";
})(PromiseStatus || (PromiseStatus = {}));
;
var MyPromise = /** @class */ (function () {
    function MyPromise(cb) {
        this.reason = null;
        this.value = null;
        this.status = PromiseStatus.Pending;
        this.fulfillCbs = [];
        this.rejectedCbs = [];
        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);
        this.makeNextCallback = this.makeNextCallback.bind(this);
        try {
            cb(this.resolve, this.reject);
        }
        catch (err) {
            this.reject(err);
        }
    }
    MyPromise.resolve = function (data) {
        return new MyPromise(function (resolve) { return resolve(data); });
    };
    MyPromise.reject = function (data) {
        return new MyPromise(function (resolve, reject) { return reject(data); });
    };
    MyPromise.resolvePromise = function (promise, maybe, resolve, reject) {
        if (promise === maybe) {
            return reject(new TypeError('cannot return the same promise object from onfulfilled or on rejected callback.'));
        }
        if (maybe instanceof MyPromise) {
            if (maybe.status === PromiseStatus.Pending) {
                maybe.then(function (val) {
                    MyPromise.resolvePromise(promise, val, resolve, reject);
                }, reject);
            }
            else {
                maybe.then(resolve, reject);
            }
        }
        else if ((maybe !== null && typeof maybe === 'object') || typeof maybe === 'function') {
            var called_1 = false;
            var handleError = function (reason) {
                if (!called_1) {
                    called_1 = true;
                    reject(reason);
                }
            };
            var handleSuccess = function (val) {
                if (!called_1) {
                    called_1 = true;
                    MyPromise.resolvePromise(promise, val, resolve, reject);
                }
            };
            try {
                var then = maybe.then;
                if (typeof then === 'function') {
                    then.call(maybe, handleSuccess, handleError);
                }
                else {
                    resolve(maybe);
                }
            }
            catch (err) {
                handleError(err);
            }
        }
        else {
            resolve(maybe);
        }
    };
    MyPromise.deferred = function () {
        var d = {};
        d.promise = new MyPromise(function (resolve, reject) {
            d.resolve = resolve;
            d.reject = reject;
        });
        return d;
    };
    MyPromise.prototype.makeNextCallback = function (deferred, cb) {
        var promise = deferred.promise, resolve = deferred.resolve, reject = deferred.reject;
        return function (v) {
            nextTick(function () {
                try {
                    var val = cb(v);
                    MyPromise.resolvePromise(promise, val, resolve, reject);
                }
                catch (err) {
                    // pass error to next handler
                    reject(err);
                }
            });
        };
    };
    MyPromise.prototype.resolve = function (data) {
        var _this = this;
        if (this.status !== PromiseStatus.Pending) {
            return;
        }
        nextTick(function () {
            _this.status = PromiseStatus.Resolved;
            _this.value = data;
            if (_this.fulfillCbs.length) {
                _this.fulfillCbs.forEach(function (cb) { return cb(_this.value); });
                _this.fulfillCbs = [];
            }
        });
    };
    MyPromise.prototype.reject = function (err) {
        var _this = this;
        if (this.status !== PromiseStatus.Pending) {
            return;
        }
        nextTick(function () {
            _this.status = PromiseStatus.Rejected;
            _this.reason = err;
            if (_this.rejectedCbs.length) {
                _this.rejectedCbs.forEach(function (cb) { return cb(_this.reason); });
                _this.rejectedCbs = [];
            }
        });
    };
    MyPromise.prototype.then = function (onFulfill, onError) {
        onFulfill = typeof onFulfill === 'function' ? onFulfill : function (v) { return v; };
        onError = typeof onError === 'function' ? onError : function (e) { throw e; };
        var deferred = MyPromise.deferred();
        if (this.status === PromiseStatus.Pending) {
            this.fulfillCbs.push(this.makeNextCallback(deferred, onFulfill));
            this.rejectedCbs.push(this.makeNextCallback(deferred, onError));
        }
        else if (this.status === PromiseStatus.Resolved) {
            this.makeNextCallback(deferred, onFulfill)(this.value);
        }
        else {
            this.makeNextCallback(deferred, onError)(this.reason);
        }
        return deferred.promise;
    };
    MyPromise.prototype["catch"] = function (onError) {
        return this.then(null, onError);
    };
    return MyPromise;
}());
var p = new MyPromise(function (r) { return r(new Error('')); });
p.then(function () { return console.log(1); })["catch"](function () { return console.log(2); });
module.exports = MyPromise;
