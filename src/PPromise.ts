import {optionsType, ppTypes, resolveRejectArgs} from './Types'
import IllegalOperationError from "./errors/IllegalOperationError";
import InvalidDefinitionError from "./errors/InvalidDefinitionError";

interface promiseCb {
    (resolve: Function, reject: Function): void;
}

class PPromise {
    readonly name?: string;
    private _type: ppTypes = ppTypes.FLUID;
    private _isFulfilled: boolean = false;
    private _isPending: boolean = true;
    private _isRejected: boolean = false;
    private _isResolved: boolean = false;
    private _isSettled: boolean = false;
    private _value: any;
    private readonly _resolveCallback?: Function;
    private readonly _rejectCallback?: Function;
    private _reason?: string | Error;
    private _Chain?: PPromise;
    private readonly _secret?: symbol | string;
    private readonly _chainSecret: string | symbol = Symbol('chain');
    private _isTriggered: boolean = false;
    private _isUnbreakable: boolean = true;
    private _nativeResolveProxy?: Function;
    private _nativeRejectProxy?: Function;
    private _promise: Promise<promiseCb>;
    private readonly options: optionsType = {
        name: this.name,
        isUnbreakable: this._isUnbreakable,
        type: ppTypes.FLUID,
        secret: undefined
    };

    constructor();
    constructor(cbOrPromiseOrValuesOrOptions: Function | Promise<any> | resolveRejectArgs | optionsType);
    constructor(cbOrPromiseOrValuesOrOptions: Function | Promise<any> | resolveRejectArgs | object, opts: optionsType);
    //constructor(values: callbackArgs, options?: object );
    //constructor(options?: object);
    //constructor(callback: Function, value: any, options?: object );
    //constructor(promise: Promise<any>, value: any, options?: object);
    constructor(...args: any[]) {
        if (args.length > 2) throw new InvalidDefinitionError('constructor');

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
        if (typeof this.options.type !== 'undefined') this._type = this.options.type;
        if (typeof this.options.isUnbreakable !== 'undefined') this._isUnbreakable = this.options.isUnbreakable;
        if (typeof this.options.name !== 'undefined') this.name = this.options.name;
        this._secret = this.options?.secret || undefined;

        if (this._type === ppTypes.GAS)
            this._isUnbreakable = false;

        //init states
        this.initStates();

        //Build Promise
        if (args.length === 1) {
            let cbOrPromiseOrValues = args[0];
            if (cbOrPromiseOrValues instanceof Promise)
                if (this._type === ppTypes.SOLID) {
                    // Promises for SOLID can be substituted straight in more-or-less
                    this._promise = cbOrPromiseOrValues;
                } else {
                    //TODO: deal with promises
                }

            if (typeof cbOrPromiseOrValues === 'function') {
                const cb = cbOrPromiseOrValues;
                if (this._type === ppTypes.SOLID)
                    callback = cbOrPromiseOrValues;
                else
                    callback = (nativeResolve: any, nativeReject: any) => {
                        let calledOnce = false;
                        if (calledOnce) {
                            console.log('subsequent call to resolve ignored.')
                            return;
                        }
                        this._nativeResolveProxy = (deferredValue: any, deferredMsg: any) => {
                            calledOnce = true;
                            new Promise((innerResolve: any, innerReject: any) => {
                                cb(innerResolve, innerReject, deferredValue, deferredMsg);
                            }).then(nativeResolve, nativeReject)
                        }
                        this._nativeRejectProxy = (deferredMsg: any, deferredValue: any) => {
                            calledOnce = true;
                            new Promise((innerResolve: any, innerReject: any) => {
                                cb(innerResolve, innerReject, deferredValue, deferredMsg);
                            }).then(nativeResolve, nativeReject)
                        }
                    }
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
                callback = callback;
                //TODO: seems pointless to pass in a static reject value for a SOLID
            }
        }

        if (!callback)
            callback = (resolve: Function, reject: Function) => {
                that._nativeResolveProxy = (v: any) => {
                    resolve(v);
                }
                that._nativeRejectProxy = reject;
            };
        this._promise = PPromise.createNativePromise(callback.bind(this));

        if (this._type === ppTypes.SOLID)
            this._resolve(this._value);

        if (this._type === ppTypes.GAS && !this.isUnbreakable)
            this.createChain();
    }


    private parseOptions(options: any): optionsType {
        if (typeof options === 'undefined') return this.options;

        options = options as optionsType;
        if (options.type === ppTypes.GAS && options.isUnbreakable === true)
            throw new InvalidDefinitionError('isUnbreakable',
                `Must be ${!this.isUnbreakable} for type ${options.type}`);

        if (options.type !== ppTypes.GAS && options.isUnbreakable === false)
            throw new InvalidDefinitionError('isUnbreakable',
                `Must be ${!this.isUnbreakable} for type ${options.type}`);

        return options;
    }

    private hasValidKey(matchingKey?: string | symbol): boolean {
        if (!this.isSecured) return true;

        if (typeof matchingKey === 'undefined') return false;

        return matchingKey === this._secret;
    }

    private createChain(): void {
        if (this.isUnbreakable) return;
        this._Chain = new PPromise({
            name: 'chain of ' + this.name,
            type: ppTypes.FLUID,
            isUnbreakable: true,
            secret: this._chainSecret
        });
    }

    private linkAnyChains(): void {
        if (!this._Chain) return

        //TODO: do we need to bind resolve/reject?
        const resolve = this.chain._resolve.bind(this.chain);
        const reject = this.chain._reject.bind(this.chain);
        this._promise.then(resolve, reject);
    }

    private get chain(): PPromise {
        return this._Chain!
    }

    private static createNativePromise(callback: promiseCb): Promise<promiseCb> {
        return new Promise(callback);
    }

    get result(): any {
        if (!this._isPending) {
            return this._value;
        }
    }

    get type(): ppTypes {
        return this._type;
    }

    get promise(): Promise<promiseCb> {
        if (this.chain instanceof PPromise) return this.chain.promise;

        return this._promise; // also implies unbreakable
    }

    get isTriggered() {
        return this._isTriggered;
    }

    get isSettled() {
        return this._isSettled;
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
        return this._isUnbreakable;
    }

    resolveRejectPrep(values: any[]): any[] {
        if (this._type === ppTypes.SOLID || this.isSettled || this.isTriggered)
            console.log(`Promise (name: ${this.name} already Settled earlier with and is now ${this._type}`);
        //throw new IllegalOperationError('resolve cannot be forced on ' + ppTypes.SOLID);

        const key = this.isSecured ? values.pop() : undefined;
        if (!this.hasValidKey(key))
            throw new IllegalOperationError(
                `This instance (${this.name} is secure. You must provide matching key as the last argument`
            );

        return values;
    }

    static resolve(value?: any): PPromise {
        return new PPromise([value], {
            isUnbreakable: true,
            type: ppTypes.SOLID
        });
    }

    /* same as resolve except it returns current instance for object chaining */
    pushResolve(...values: any[]): PPromise {
        this.resolve(...values);
        return this;
    }

    resolve(...values: any[]): Promise<promiseCb> {
        values = this.resolveRejectPrep(values);

        if (values.length)
            this._resolve(values[0])
        else
            this._resolve();

        return this.promise;
    }

    private _resolve(...values: any): any {
        let callbackForThen, resolveValue;

        if (this.isSettled || this.isTriggered) return this;

        this._value = values.length ? values[0] : this._value;
        resolveValue = this._value;
        callbackForThen = this.makeFulfillmentCallback();

        this._isTriggered = true;
        this._promise = this._promise.then(callbackForThen)

        this.linkAnyChains();
        //TODO: native resolve and then above is only needed if the promises was constructed from a callback
        this._nativeResolveProxy?.(resolveValue);

        return this;
    }

    private makeFulfillmentCallback(fn?: Function): any {
        const that = this;
        return (v: any) => {
            let fn = that._resolveCallback;
            that._isFulfilled = true;
            that._isResolved = true;
            that._isPending = false;
            that._isRejected = false;
            that._isSettled = true;

            // update internal _value ( result )
            that._value = fn ? fn(v) : v;
            return that._value;
        };
    }

    pushReject(...values: any[]): PPromise {
        this.reject(...values);
        return this;
    }

    reject(...values: any[]): Promise<promiseCb> {
        values = this.resolveRejectPrep(values);
        const value = values[0]
        if (typeof value === 'string' || value instanceof Error)
            this._reject(value);

        this._reject();
        return this.promise;
    }

    private _reject(...values: any[]): PPromise {
        let callbackForCatch, rejectValue;
        if (!this.isSettled && !this.isTriggered) {
            if (typeof this._reason === 'function') {
                callbackForCatch = this.makeRejectCallback(this._reason);
                rejectValue = values[0];
            } else {
                this._reason = values.length ? values[0] : this._reason;
                rejectValue = this._reason;
                callbackForCatch = this.makeRejectCallback();
            }
            this._isTriggered = true;
            this._promise = this._promise.catch(callbackForCatch);

            this.linkAnyChains();
            this._nativeRejectProxy?.(rejectValue);
        }
        return this;
    }

    private makeRejectCallback(fn?: Function): any {
        const that = this;
        return (...v: any) => {
            that._isFulfilled = false;
            that._isResolved = false;
            that._isPending = false;
            that._isRejected = true;
            that._isSettled = true;
            that._reason = fn ? fn(v[0]) : v[0];
            return that._reason
        };
    }

    private initStates() {
        this._isFulfilled = false;
        this._isPending = true;
        this._isRejected = false;
        this._isResolved = false;
        this._isSettled = false;
        this._isTriggered = false;
    }

    static getDeferred(...args: any[]) {
        //  return new PPromise(...args);
    }

    sever(): PPromise {
        if (this.isUnbreakable)
            throw new IllegalOperationError(`You cannot sever a ${this.options.type}`);

        if (typeof this.chain !== 'undefined') {
            //new chain
            this.createChain();
        }
        return this; //include case: not-unbreakable
    }

    severSafely(): PPromise {
        try {
            this.sever();
        } catch (e) {
            console.log(e);
        }
        return this;
    }

    upgradeType( type?: ppTypes ):void{
        // no change
        if( this._type === type ) return;

        //impossible change
        // SOLID to !SOLID
        // !GAS to GAS
        if( type === ppTypes.GAS || this._type === ppTypes.SOLID )
            throw new IllegalOperationError(`Cannot downgrade ${this._type} to ${type}`);

        //allowed change
        if( type === ppTypes.FLUID && this._type === ppTypes.GAS ){
            try {
                //remove the chain
                //--> don't think this is necessary

                //set unbreakable = true
                this._isUnbreakable = true;

                //continue to allow deferred

                //change the type
                this._type = ppTypes.GAS;

            }catch(e){
                console.log(e);
                throw new IllegalOperationError(`upgrade from ${this._type} to ${type} failed. See log`);
            }
        }

         if( type === ppTypes.SOLID ){
            try {
                //remove the chain
                //--> don't think this is necessary

                //set unbreakable = true
                this._isUnbreakable = true;

                //disallow deferred
                //resolve immediately
                this._resolve();

                //change the type
                this._type = ppTypes.SOLID;

            }catch(e){
                console.log(e);
                throw new IllegalOperationError(`upgrade from ${this._type} to ${type} failed. See log`);
            }
        }

    }


    pushThen(...args: any): PPromise {
        this.then(args);
        return this;
    }

    then(...args: any): Promise<any> {
        console.log('then called by ', this.options.name);
        if (this.isUnbreakable) return this.promise.then(...args);
        return this.chain.then(...args)
    }

    catch(...args: any): Promise<any> {
        return this.promise.catch(...args);
    }

    finally(...args: any): Promise<any> {
        return this.promise.finally(...args);
    }
}

export default PPromise;