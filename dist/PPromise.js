"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("./Types");
const IllegalOperationError_1 = __importDefault(require("./errors/IllegalOperationError"));
const InvalidDefinitionError_1 = __importDefault(require("./errors/InvalidDefinitionError"));
class PPromise {
    //constructor(values: callbackArgs, options?: object );
    //constructor(options?: object);
    //constructor(callback: Function, value: any, options?: object );
    //constructor(promise: Promise<any>, value: any, options?: object);
    constructor(...args) {
        this._type = Types_1.ppTypes.FLUID;
        this._secret = Symbol('secret');
        this._isFulfilled = false;
        this._isPending = true;
        this._isRejected = false;
        this._isResolved = false;
        this._isTriggered = false;
        this._isUnbreakable = true;
        this.options = {
            name: this.name,
            isUnbreakable: this._isUnbreakable,
            type: Types_1.ppTypes.FLUID
        };
        if (args.length > 2)
            throw new InvalidDefinitionError_1.default('constructor');
        //deal with options argument first
        if (args.length === 2)
            //options has to be the second one
            this.options = this.parseOptions(args.pop());
        //args.length === 1
        if (args.length === 1 && !Array.isArray(args[0]) && typeof args[0] === 'object')
            this.options = this.parseOptions(args.pop());
        //args.length = 0
        const that = this;
        let callback;
        //apply options
        if (typeof this.options.type !== 'undefined')
            this._type = this.options.type;
        if (typeof this.options.isUnbreakable !== 'undefined')
            this._isUnbreakable = this.options.isUnbreakable;
        if (typeof this.options.name !== 'undefined')
            this.name = this.options.name;
        if (this._type === Types_1.ppTypes.GAS)
            this._isUnbreakable = false;
        //init states
        this.initStates();
        //Build Promise
        if (args.length === 1) {
            let cbOrPromiseOrValues = args[0];
            if (cbOrPromiseOrValues instanceof Promise)
                if (this._type === Types_1.ppTypes.SOLID) {
                    // Promises for SOLID can be substituted straight in more-or-less
                    this._promise = cbOrPromiseOrValues;
                }
                else {
                    //TODO: deal with promises
                }
            if (typeof cbOrPromiseOrValues === 'function') {
                callback = cbOrPromiseOrValues;
            }
            if (Array.isArray(cbOrPromiseOrValues)) {
                this._value = cbOrPromiseOrValues[0];
                this._reason = cbOrPromiseOrValues[1];
                callback = callback;
                //TODO: seems pointless to pass in a static reject value for a SOLID
            }
        }
        if (!callback)
            callback = (resolve, reject) => {
                that._nativeResolve = (v) => {
                    resolve(v);
                };
                that._nativeReject = reject;
            };
        this._promise = PPromise.createNativePromise(callback.bind(this));
        if (this._type === Types_1.ppTypes.SOLID)
            this._resolve(this._value);
        if (this._type === Types_1.ppTypes.GAS && !this.isUnbreakable)
            this.createChain();
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
    createChain() {
        if (this.isUnbreakable)
            return;
        const secret = this._secret;
        this._Chain = new PPromise({
            name: secret,
            type: Types_1.ppTypes.FLUID,
            isUnbreakable: true
        });
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
        if (this.chain instanceof PPromise)
            return this.chain.promise;
        return this._promise; // also implies unbreakable
    }
    get isTriggered() {
        return this._isTriggered;
    }
    get isFulfilled() {
        return this._isFulfilled;
    }
    get isPending() {
        return this._isPending;
    }
    get isRejected() {
        return this._isRejected;
    }
    get isResolved() {
        return this._isResolved;
    }
    get isUnbreakable() {
        return this._isUnbreakable;
    }
    static resolve(value) {
        return new PPromise([value], {
            isUnbreakable: true,
            type: Types_1.ppTypes.SOLID
        });
    }
    resolve(...values) {
        if (this._type === Types_1.ppTypes.SOLID)
            throw new IllegalOperationError_1.default('resolve cannot be forced on ' + Types_1.ppTypes.SOLID);
        if (values.length)
            return this._resolve(values[0]);
        return this._resolve();
    }
    _resolve(...values) {
        var _a;
        let callbackForThen, resolveValue;
        if (!this.isResolved && !this.isTriggered) {
            if (typeof this._value === 'function') {
                callbackForThen = this.makeFulfillmentCallback(this._value);
                resolveValue = values[0];
            }
            else {
                this._value = values.length ? values[0] : this._value;
                resolveValue = this._value;
                callbackForThen = this.makeFulfillmentCallback();
            }
            this._isTriggered = true;
            this._promise = this._promise.then(callbackForThen);
            this.linkAnyChains();
            //TODO: native resolve and then above is only needed if the promises was constructed from a callback
            (_a = this._nativeResolve) === null || _a === void 0 ? void 0 : _a.call(this, resolveValue);
        }
        return this;
    }
    makeFulfillmentCallback(fn) {
        const that = this;
        return (...v) => {
            that._isFulfilled = true;
            that._isResolved = true;
            that._isPending = false;
            that._isRejected = false;
            that._value = fn ? fn(v[0]) : v[0];
            return that._value;
        };
    }
    reject(value) {
        if (this._type === Types_1.ppTypes.SOLID)
            throw new IllegalOperationError_1.default('reject cannot be forced on ' + Types_1.ppTypes.SOLID);
        if (typeof value !== 'undefined')
            return this._reject(value);
        return this._reject();
    }
    _reject(...values) {
        var _a;
        let callbackForCatch, rejectValue;
        if (!this.isRejected && !this.isTriggered) {
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
            (_a = this._nativeReject) === null || _a === void 0 ? void 0 : _a.call(this, rejectValue);
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
    }
    static getDeferred(...args) {
        //  return new PPromise(...args);
    }
    sever() {
        if (this.isUnbreakable)
            throw new IllegalOperationError_1.default(`You cannot sever a ${this.options.type}`);
        if (typeof this.chain !== 'undefined') {
            //new chain
            this.createChain();
        }
        return this; //include case: not-unbreakable
    }
    severSafely() {
        try {
            this.sever();
        }
        catch (e) {
            console.log(e);
        }
        return this;
    }
    pushThen(...args) {
        this.then(args);
        return this;
    }
    then(...args) {
        console.log('then called by ', this.options.name);
        if (this.isUnbreakable)
            return this.promise.then(...args);
        return this.chain.then(...args);
    }
    catch(...args) {
        return this.promise.catch(...args);
    }
    finally(...args) {
        return this.promise.finally(...args);
    }
}
exports.default = PPromise;
