import {optionsType, ppTypes, resolveRejectArgs} from './Types'
import IllegalOperationError from "./errors/IllegalOperationError";
import InvalidDefinitionError from "./errors/InvalidDefinitionError";

interface promiseCb {
    (resolve: Function, reject: Function): void;
}

class PPromise {
    readonly name? : string;
    private _type: ppTypes = ppTypes.FLUID;
    private _isFulfilled: boolean = false;
    private _isPending: boolean = true;
    private _isRejected: boolean = false;
    private _isResolved: boolean = false;
    private _value: any;
    private _reason?: string | Error;
    private _Chain?: PPromise;
    private _isTriggered : boolean = false;
    private _isUnbreakable: boolean = true;
    private _nativeResolve?: Function;
    private _nativeReject?: Function;
    private _promise: Promise<promiseCb>;
    private options: optionsType = {
        name: this.name,
        isUnbreakable: this._isUnbreakable,
        type: ppTypes.FLUID
    };

  //  private _resolveValueCache: any;
  //  private _rejectMessageCache: any;

    /* constructor(private options : optionsType = {
         name: 'unknown',
         isUnbreakable: true,
         type: ppTypes.FLUID
     } );*/
    constructor();
    constructor(cbOrPromiseOrValuesOrOptions: Function | Promise<any> | resolveRejectArgs | optionsType | object);
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
        //default callback
        let callback = (resolve: Function, reject: Function) => {
            that._nativeResolve = resolve;
            that._nativeReject = reject;
        };

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
                if (this._type !== ppTypes.SOLID) {
                    this._promise = new Promise(cbOrPromiseOrValues);
                } else {
                    //TODO: deal with promise
                }
            }

            if (Array.isArray(cbOrPromiseOrValues)) {
                this._value = cbOrPromiseOrValues[0];
                this._reason = cbOrPromiseOrValues[1];
                callback = callback.bind(this);
                this._promise = PPromise.createNativePromise(callback);
            }
        }

        this._promise = PPromise.createNativePromise(callback.bind(this));

        //apply options
        if (typeof this.options.type !== 'undefined') this._type = this.options.type;
        if (typeof this.options.isUnbreakable !== 'undefined') this._isUnbreakable = this.options.isUnbreakable;
        if (typeof this.options.name !== 'undefined') this.name = this.options.name;

        this.initStates();

        if (this._type === ppTypes.GAS && !this.isUnbreakable) {
            this.createChain();
        }
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

    private proxyValueFromOriginalResolve(...values: any): void {
        if (values.length === 0) return this._resolve();

        if (typeof this._value === 'undefined')
            this._value = values[0];

        this._resolve();
    }

    private createChain(): void {
        if (this.isUnbreakable) return;

        this._Chain = new PPromise({
            name: 'Internal Chain',
            type: ppTypes.FLUID,
            isUnbreakable: true
        });
    }

    private linkAnyChains(): void {
        if( !this._Chain ) return

        //TODO: do we need to bind resolve/reject?
        const resolve = this.chain._resolve.bind(this.chain);
        const reject = this.chain._reject.bind(this.chain);
        this.promise.then(resolve, reject);
    }

    private get chain(): PPromise {
        return this._Chain!
    }
    private setValueAndResolveImmediately(value: any): void {
        //this._value = value;
        this._resolve(value);
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
    get isTriggered(){
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

    static resolve(value?: any): PPromise {
        return new PPromise(value, {
            isUnbreakable: true,
            type: ppTypes.SOLID
        });
    }

    resolve(...values: any[]): any {
        if (this._type === ppTypes.SOLID)
            throw new IllegalOperationError('resolve cannot be forced on ' + ppTypes.SOLID);

        if (values.length)
            return this._resolve(values[0])

        return this._resolve();
    }

    private _resolve(...values: any): any {
        let callbackForThen, resolveValue;

        if (!this.isResolved && !this.isTriggered) {
            if (typeof this._value === 'function') {
                callbackForThen = this.makeFulfillmentCallback( this._value );
                resolveValue = values[0];
            } else {
                this._value = values.length ? values[0] : this._value;
                resolveValue = this._value;
                callbackForThen = this.makeFulfillmentCallback();
            }
            this._promise = this._promise.then( callbackForThen )

            this.linkAnyChains();
            this._nativeResolve!(this._value);
        }
        return this;
    }

    private makeFulfillmentCallback( fn? : Function) : any {
        const that = this;
        return (...v : any) => {
            that._isFulfilled = true;
            that._isResolved = true;
            that._isPending = false;
            that._isRejected = false;
            return fn ? fn(v[0]) : v[0];
        };
    }

    reject(...values: any[]): any {
        //TODO:
    }

    private _reject(...values: any): any {
        return;
    }

    private initStates() {
        this._isFulfilled = false;
        this._isPending = true;
        this._isRejected = false;
        this._isResolved = false;
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