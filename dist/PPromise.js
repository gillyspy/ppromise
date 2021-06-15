"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const IllegalOperationError_1 = __importDefault(require("./errors/IllegalOperationError"));
const InvalidDefinitionError_1 = __importDefault(require("./errors/InvalidDefinitionError"));
const Registry = {};
class PPromise {
    //constructor(values: callbackArgs, options?: object );
    //constructor(options?: object);
    //constructor(callback: Function, value: any, options?: object );
    //constructor(promise: Promise<any>, value: any, options?: object);
    constructor(...args) {
        var _a, _b;
        this.name = Symbol(Math.random().toString());
        this._type = Types_1.ppTypes.FLUID;
        this._isFulfilled = false;
        this._isPending = true;
        this._isRejected = false;
        this._isResolved = false;
        this._chainSecret = Symbol('chain');
        this._isTriggered = false;
        this.options = {
            name: Symbol(Math.random().toString()),
            isUnbreakable: true,
            type: Types_1.ppTypes.FLUID,
            secret: undefined,
            registry: Registry
        };
        if (args.length > 2)
            throw new InvalidDefinitionError_1.default('constructor');
        //deal with options argument first
        if (args.length === 2)
            //options has to be the second one
            this.options = this.parseOptions(args.pop());
        //args.length === 1
        if (args.length === 1 && !Array.isArray(args[0]) && typeof args[0] === 'object' && !(args[0] instanceof Promise))
            this.options = this.parseOptions(args.pop());
        //args.length = 0
        const that = this;
        let callback, registry, promise;
        //apply options
        if (typeof this.options.type !== 'undefined')
            this._type = this.options.type;
        this.name = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.name) || Symbol('unknown');
        this._secret = (_b = this.options) === null || _b === void 0 ? void 0 : _b.secret;
        registry = this.options.registry || Registry;
        //init states
        this.initStates();
        //Build Promise
        if (args.length === 1) {
            let cbOrPromiseOrValues = args[0];
            if (cbOrPromiseOrValues instanceof Promise)
                if (this._type === Types_1.ppTypes.SOLID) {
                    // Promises for SOLID can be substituted straight in more-or-less
                    promise = cbOrPromiseOrValues;
                }
                else {
                    //TODO: deal with promises
                    throw new InvalidDefinitionError_1.default('Native Promise', `They are only currently supported for ${Types_1.ppTypes.SOLID}. Please use Promise.all, any, etc instead`);
                }
            if (typeof cbOrPromiseOrValues === 'function') {
                const cb = cbOrPromiseOrValues;
                if (this._type === Types_1.ppTypes.SOLID)
                    callback = cbOrPromiseOrValues;
                else
                    callback = (nativeResolve, nativeReject) => {
                        let calledOnce = false;
                        if (calledOnce) {
                            console.log('subsequent call to resolve ignored.');
                            return;
                        }
                        this._nativeResolveProxy = (deferredValue, deferredMsg) => {
                            calledOnce = true;
                            new Promise((innerResolve, innerReject) => {
                                cb(innerResolve, innerReject, deferredValue, deferredMsg);
                            }).then(nativeResolve, nativeReject);
                        };
                        this._nativeRejectProxy = (deferredMsg, deferredValue) => {
                            calledOnce = true;
                            new Promise((innerResolve, innerReject) => {
                                cb(innerResolve, innerReject, deferredValue, deferredMsg);
                            }).then(nativeResolve, nativeReject);
                        };
                    };
            }
            if (Array.isArray(cbOrPromiseOrValues)) {
                let [v, r] = cbOrPromiseOrValues;
                if (typeof v === 'function')
                    this._resolveCallback = v;
                else
                    this._value = v;
                if (typeof r === 'function')
                    this._rejectCallback = r;
                else
                    this._reason = r;
                //TODO: seems pointless to pass in a static reject value for a SOLID
            }
        }
        if (!callback)
            callback = (resolve, reject) => {
                that._nativeResolveProxy = (v) => {
                    resolve(v);
                };
                that._nativeRejectProxy = reject;
            };
        if (typeof promise === 'undefined')
            promise = PPromise.createNativePromise(callback.bind(this));
        this._promise = promise;
        if (this._type === Types_1.ppTypes.SOLID)
            this._resolve(this._value);
        if (this._type === Types_1.ppTypes.GAS)
            this.createChain();
        //TODO: https://github.com/microsoft/TypeScript/issues/1863
        if (!/^symbol.chain/i.test(this.name.toString()))
            registry[this.name.toString()] = this;
    }
    parseOptions(options) {
        if (typeof options === 'undefined')
            return this.options;
        options = options;
        if (options.type === Types_1.ppTypes.GAS && options.isUnbreakable === true)
            throw new InvalidDefinitionError_1.default('isUnbreakable', `Must be ${!this.isUnbreakable} for type ${options.type}`);
        if (options.type !== Types_1.ppTypes.GAS && options.isUnbreakable === false)
            throw new InvalidDefinitionError_1.default('isUnbreakable', `Must be ${!this.isUnbreakable} for type ${options.type}`);
        return options;
    }
    static checkPermissions(key, secret) {
        let keyType = typeof key;
        if (keyType === 'undefined' || keyType !== typeof secret)
            throw new TypeError(`Key provided is type ${keyType} and not in the correct format of ${typeof secret}`);
        if (keyType !== 'string' && keyType !== 'symbol')
            throw new TypeError(`Key provided is type ${keyType} and not in the correct format of ${typeof secret}`);
        if (secret !== key && typeof key !== 'undefined')
            throw new IllegalOperationError_1.default(`Key ${key.toString()} does not match secret`);
    }
    isValidKey(candidateKey) {
        if (!this.isSecured)
            return true;
        if (typeof candidateKey === 'undefined')
            return false;
        return candidateKey === this._secret;
    }
    createChain() {
        if (this.isUnbreakable)
            return;
        const opts = {
            name: this._chainSecret,
            type: Types_1.ppTypes.FLUID,
            secret: this._chainSecret
        };
        this._Chain = new PPromise(opts);
    }
    linkAnyChains() {
        if (!this._Chain)
            return;
        //TODO: do we need to bind resolve/reject?
        const resolve = this.chain._resolve.bind(this.chain);
        const reject = this.chain._reject.bind(this.chain);
        this._promise.then(resolve, reject);
    }
    get chain() {
        return this._Chain;
    }
    static createNativePromise(callback) {
        return new Promise(callback);
    }
    get result() {
        if (!this._isPending) {
            return this._value;
        }
    }
    get type() {
        return this._type;
    }
    get promise() {
        //note: types change so... do not rely upon isUnbreakable
        //if it has a chain then return it
        if (this.chain instanceof PPromise)
            return this.chain.promise;
        return this._promise; // also implies unbreakable
    }
    get isTriggered() {
        return this._isTriggered;
    }
    get isSettled() {
        return this.isFulfilled || this.isRejected;
    }
    get isFulfilled() {
        return this._isFulfilled;
    }
    get isPending() {
        return this._isPending;
    }
    get isSecured() {
        return !!this._secret;
    }
    get isRejected() {
        return this._isRejected;
    }
    get isResolved() {
        return this._isResolved;
    }
    get isUnbreakable() {
        return (this._type === Types_1.ppTypes.SOLID || this._type === Types_1.ppTypes.FLUID);
    }
    resolveRejectPrep(values) {
        const name = this.name;
        if (this._type === Types_1.ppTypes.SOLID || this.isSettled || this.isTriggered)
            console.log(`Promise (name: ${name.toString()} already Settled earlier with and is now ${this._type}`);
        //throw new IllegalOperationError('resolve cannot be forced on ' + ppTypes.SOLID);
        const key = this.isSecured ? values.pop() : undefined;
        if (!this.isValidKey(key))
            throw new IllegalOperationError_1.default(`This instance (${name.toString()} is secure. You must provide matching key as the last argument`);
        return values;
    }
    static resolve(value) {
        return new PPromise([value], {
            type: Types_1.ppTypes.SOLID
        });
    }
    /* same as resolve except it returns current instance for object chaining */
    pushResolve(...values) {
        this.resolve(...values);
        return this;
    }
    resolve(...values) {
        values = this.resolveRejectPrep(values);
        if (values.length)
            this._resolve(values[0]);
        else
            this._resolve();
        return this.promise;
    }
    _resolve(...values) {
        var _a;
        let callbackForThen, resolveValue;
        if (this.isSettled || this.isTriggered)
            return this;
        this._value = values.length ? values[0] : this._value;
        resolveValue = this._value;
        callbackForThen = this.makeFulfillmentCallback();
        this._isTriggered = true;
        this._promise = this._promise.then(callbackForThen);
        this.linkAnyChains();
        //TODO: native resolve and then above is only needed if the promises was constructed from a callback
        (_a = this._nativeResolveProxy) === null || _a === void 0 ? void 0 : _a.call(this, resolveValue);
        return this;
    }
    makeFulfillmentCallback() {
        const that = this;
        return (v) => {
            let fn = that._resolveCallback;
            that._isFulfilled = true;
            that._isResolved = true;
            that._isPending = false;
            that._isRejected = false;
            // update internal _value ( result )
            that._value = fn ? fn(v) : v;
            return that._value;
        };
    }
    pushReject(...values) {
        this.reject(...values);
        return this;
    }
    reject(...values) {
        values = this.resolveRejectPrep(values);
        const value = values[0];
        if (typeof value === 'string' || value instanceof Error)
            this._reject(value);
        this._reject();
        return this.promise;
    }
    _reject(...values) {
        var _a;
        let callbackForCatch, rejectValue;
        if (!this.isSettled && !this.isTriggered) {
            if (typeof this._reason === 'function') {
                callbackForCatch = this.makeRejectCallback(this._reason);
                rejectValue = values[0];
            }
            else {
                this._reason = values.length ? values[0] : this._reason;
                rejectValue = this._reason;
                callbackForCatch = this.makeRejectCallback();
            }
            this._isTriggered = true;
            this._promise = this._promise.catch(callbackForCatch);
            this.linkAnyChains();
            (_a = this._nativeRejectProxy) === null || _a === void 0 ? void 0 : _a.call(this, rejectValue);
        }
        return this;
    }
    makeRejectCallback(fn) {
        const that = this;
        return (...v) => {
            that._isFulfilled = false;
            that._isResolved = false;
            that._isPending = false;
            that._isRejected = true;
            that._reason = fn ? fn(v[0]) : v[0];
            return that._reason;
        };
    }
    initStates() {
        this._isFulfilled = false;
        this._isPending = true;
        this._isRejected = false;
        this._isResolved = false;
        this._isTriggered = false;
    }
    static getDeferred(...args) {
        return new PPromise(...args);
    }
    static find(name, key) {
        if (typeof name === 'undefined')
            return;
        //Symbols not supported as keys yet
        //TODO: https://github.com/microsoft/TypeScript/issues/1863
        let idx = name.toString();
        const candidate = Registry[idx];
        if (!candidate)
            return;
        if (!candidate.isSecured)
            return candidate;
        if (typeof key === 'undefined')
            return;
        if (candidate.isValidKey(key))
            return candidate;
        return;
    }
    sever(...args) {
        if (this.isSecured) {
            let key = args.pop();
            PPromise.checkPermissions(key, this._secret);
        }
        let chainEvent = args[0];
        if (chainEvent === 'resolve') {
            try {
                this.chain.resolve(this._chainSecret);
            }
            catch (e) {
                console.log('chain failed to resolve', e.message);
            }
        }
        else if (chainEvent === 'reject') {
            try {
                this.chain.reject(this._chainSecret);
            }
            catch (e) {
                console.log('chain failed to resolve', e.message);
            }
        }
        else if (typeof chainEvent !== 'undefined') {
            throw new IllegalOperationError_1.default(`${chainEvent} is not a valid sever operation`);
        }
        if (this.isUnbreakable)
            throw new IllegalOperationError_1.default(`You cannot sever a ${this.options.type}`);
        if (typeof this.chain !== 'undefined') {
            //new chain
            this.createChain();
        }
        return this; //include case: not-unbreakable
    }
    upgradeType(type, key) {
        if (this.isSecured)
            PPromise.checkPermissions(key, this._secret);
        // no change
        if (this._type === type)
            return;
        //impossible change
        // SOLID to !SOLID
        // !GAS to GAS
        if (type === Types_1.ppTypes.GAS || this._type === Types_1.ppTypes.SOLID)
            throw new IllegalOperationError_1.default(`Cannot downgrade ${this._type} to ${type}`);
        //allowed change
        if (type === Types_1.ppTypes.FLUID && this._type === Types_1.ppTypes.GAS) {
            try {
                //remove the chain
                //--> don't think this is necessary
                //continue to allow deferred
                //set unbreakable = true
                //change the type
                this._type = Types_1.ppTypes.FLUID;
            }
            catch (e) {
                console.log(e);
                throw new IllegalOperationError_1.default(`upgrade from ${this._type} to ${type} failed. See log`);
            }
        }
        if (type === Types_1.ppTypes.SOLID) {
            try {
                //remove the chain
                //--> don't think this is necessary
                //disallow deferred
                //resolve immediately
                this._resolve();
                //set unbreakable = true
                //change the type
                this._type = Types_1.ppTypes.SOLID;
            }
            catch (e) {
                console.log(e);
                throw new IllegalOperationError_1.default(`upgrade from ${this._type} to ${type} failed. See log`);
            }
        }
    }
    pushThen(...args) {
        this.then(args);
        return this;
    }
    then(...args) {
        console.log('then called by ', this.name.toString());
        return this.promise.then(...args);
        /*
        if (this.isUnbreakable) return this.promise.then(...args);
        return this.chain.then(...args) */
    }
    catch(...args) {
        return this.promise.catch(...args);
    }
    finally(...args) {
        return this.promise.finally(...args);
    }
}
exports.default = PPromise;
