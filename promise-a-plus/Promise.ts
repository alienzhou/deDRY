const nextTick = (cb: Function): void => void setTimeout(cb);

enum PromiseStatus {
    Pending = 1,
    Resolved = 2,
    Rejected = 3
};

type ThenableCallback<argsType> = (data: argsType) => any;

interface Deferred<resultType> {
    promise?: MyPromise<resultType>;
    resolve?: ThenableCallback<resultType>;
    reject?: ThenableCallback<any>;
}

type ResolveFunction<resultType> = (data: resultType) => void;
type RejectFunction = (data: any) => void;

class MyPromise<resultType> {

    reason: any;
    value: resultType;
    status: PromiseStatus;
    fulfillCbs: ThenableCallback<resultType>[];
    rejectedCbs: ThenableCallback<any>[];

    constructor(
        cb: (resolve: ResolveFunction<resultType>, reject: RejectFunction) => void
    ) {
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

    static resolve<resultType>(data: resultType): MyPromise<resultType> {
        return new MyPromise(resolve => resolve(data));
    }

    static reject(data: any): MyPromise<any> {
        return new MyPromise((resolve, reject) => reject(data));
    }

    static resolvePromise(
        promise: MyPromise<any>,
        maybe: any,
        resolve: (data: any) => void,
        reject: (data: any) => void,
    ) {
        if (promise === maybe){
            return reject(
                new TypeError('cannot return the same promise object from onfulfilled or on rejected callback.')
            );
        }

        if (maybe instanceof MyPromise) {
            if (maybe.status === PromiseStatus.Pending) {
                maybe.then(
                    val => {
                        MyPromise.resolvePromise(promise, val, resolve, reject)
                    },
                    reject
                );
            }

            else {
                maybe.then(resolve, reject);
            }
        }

        else if ((maybe !== null && typeof maybe === 'object') || typeof maybe === 'function') {
            let called = false;

            const handleError = reason => {
                if (!called) {
                    called = true;
                    reject(reason);
                }
            };

            const handleSuccess = val => {
                if (!called) {
                    called = true;
                    MyPromise.resolvePromise(promise, val, resolve, reject);
                }
            };

            try {
                const then = maybe.then;
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
    }

    static deferred<returnType>(): Deferred<returnType> {
        const d: Deferred<returnType> = {};
        d.promise = new MyPromise((resolve, reject) => {
            d.resolve = resolve;
            d.reject = reject;
        });
        return d;
    }

    private makeNextCallback(
        deferred: Deferred<any>,
        cb: ThenableCallback<any>
    ) {
        const {
            promise,
            resolve,
            reject
        } = deferred;
        return v => {
            nextTick(() => {
                try {
                    const val = cb(v);
                    MyPromise.resolvePromise(promise, val, resolve, reject);
                }
                catch (err) {
                    // pass error to next handler
                    reject(err);
                }
            });
        }
    }

    private resolve(data: resultType): void {
        if (this.status !== PromiseStatus.Pending) {
            return;
        }

        nextTick(() => {
            this.status = PromiseStatus.Resolved;
            this.value = data;
        
            if (this.fulfillCbs.length) {
                this.fulfillCbs.forEach(cb => cb(this.value));
                this.fulfillCbs = [];
            }
        });
    }

    private reject(err: any): void {
        if (this.status !== PromiseStatus.Pending) {
            return;
        }

        nextTick(() => {
            this.status = PromiseStatus.Rejected;
            this.reason = err;
    
            if (this.rejectedCbs.length) {
                this.rejectedCbs.forEach(cb => cb(this.reason));
                this.rejectedCbs = [];
            }
        })
    }

    then(
        onFulfill?: ThenableCallback<resultType>,
        onError?: ThenableCallback<any>
    ): MyPromise<ReturnType<typeof onFulfill>> {
        onFulfill = typeof onFulfill === 'function' ? onFulfill : v => v;
        onError = typeof onError === 'function' ? onError : e => {throw e;};

        const deferred = MyPromise.deferred();

        if (this.status === PromiseStatus.Pending) {
            this.fulfillCbs.push(
                this.makeNextCallback(deferred, onFulfill)
            );

            this.rejectedCbs.push(
                this.makeNextCallback(deferred, onError)
            );
        }

        else if (this.status === PromiseStatus.Resolved) {
            this.makeNextCallback(deferred, onFulfill)(this.value);
        }

        else {
            this.makeNextCallback(deferred, onError)(this.reason);
        }

        return deferred.promise;
    }

    catch(onError: ThenableCallback<any>): MyPromise<ReturnType<typeof onError>> {
        return this.then(null, onError);
    }
}

export = MyPromise;