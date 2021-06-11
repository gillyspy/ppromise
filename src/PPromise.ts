import {optionsType, ppTypes} from './Types'
import IllegalOperationError from "./errors/IllegalOperationError";

interface promiseCb {
    (resolve: Function, reject: Function): void;
}

class PPromise {
    private _type: ppTypes = ppTypes.STANDARD;
    private _isFulfilled: boolean = false;
    private _isPending: boolean = true;
    private _isRejected: boolean = false;
    private _isResolved: boolean = false;
    private _value: any;
    private _isUnbreakable: boolean = true;
    private options: optionsType = {
        isUnbreakable: true,
        type: ppTypes.STANDARD
    };
    private _promise: Promise<promiseCb>;
    private _nativeResolve: Function = (x: any) => {
    };
    private _nativeReject: Function = (x: any) => {
    };
    private _resolveValueCache: any;
    private _rejectMessageCache: any;

    constructor();
    constructor(callback: Function);
    constructor(promise: Promise<any>);
    constructor(value: any, options?: optionsType);
    constructor(options?: optionsType);
    constructor(callback: Function, value: any, options?: optionsType);
    constructor(promise: Promise<any>, value: any, options?: optionsType);
    constructor(...args: any[]) {
        this.initStates();
        this._type = ppTypes.STANDARD;

        this._promise = PPromise.createNativePromise((resolve, reject) => {
            this._nativeResolve = resolve;
            this._nativeReject = reject;
        });
        this.promise = this._promise;

        if( args.length && typeof args[args.length - 1 ] === 'object'){
            this.options = args[args.length-1] as optionsType;
        }

            //TODO: remove this ...redudant?
        if (typeof args[1] === 'object') {
            this.options = args[1] as optionsType;
        }

        //apply options
        if (typeof this.options.type !== 'undefined') this._type = this.options.type;
        if (typeof this.options.isUnbreakable !== 'undefined') this._isUnbreakable = this.options.isUnbreakable;

        if (PPromise.isThisACallback(args[0])) {
            const cb = this.makeCallback(args[0]);
            console.log(cb)
            this._promise = PPromise.createNativePromise(cb.bind(this));
        }

        if (!(PPromise.isThisAPromise(args[0]) || PPromise.isThisACallback(args[0]))) {
            console.log('first arg is definitely a value');
            this.setValueAndResolveImmediately(args[0]);
        }

    }

    private proxyValueFromOriginalResolve(...values: any): void {
        if (values.length === 0) return this._resolve();

        if (typeof this._value === 'undefined')
            this._value = values[0];

        this._resolve();
    }

    private makeCallback(callback: Function): promiseCb {
        const resolveCb = (resolve: any) => {
            this._nativeResolve = resolve;
        };
        const rejectCb = (reject: any) => {
            this._nativeReject = reject;
        };

        const _resolve = this._resolve.bind(this);
        const _reject = this._resolve.bind(this); //TODO:  2nd arg should support reject

        return (resolve, reject) => {
            //callback( resolveCb, rejectCb );
            callback(_resolve, _reject);
            this._nativeResolve = resolve;
            this._nativeReject = reject;
        }

        /*
         this.#callback = (resolve, reject) => {
        cb(_cb.resolve, _cb.reject);
        if (that.type !== solid) {
          _arg.resolve = resolve;
          _arg.reject = reject;
        }
         */
    }

    private static isThisACallback(candidate: any): boolean {
        console.log({isThisACallback: candidate})
        if (typeof candidate === 'function') return true;
        if (Array.isArray(candidate) && candidate.length > 0) {
            return PPromise.isThisACallback(candidate[0])
        }
        return false;

    }

    private static isThisAPromise(candidate: any): boolean {
        console.log({isThisAPromise: candidate})
        if (candidate instanceof Promise) return true;
        if (Array.isArray(candidate) && candidate.length > 0) {
            return PPromise.isThisAPromise(candidate[0])
        }
        return false;
    }

    private setValueAndResolveImmediately(value: any): void {
        //this._value = value;
        this._resolve(value);
    }

    private static createNativePromise(callback: promiseCb): Promise<promiseCb> {
        return new Promise(callback);
    }

    get result(): any {
        return this._value;
    }

    get type() : ppTypes {
        return this._type;
    }

    set promise(promise: Promise<promiseCb>) {
        //do nothing
    }

    get promise(): Promise<promiseCb> {
        return this._promise;
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

    resolve(value ?: any): any {
        if (this._type === ppTypes.SOLID)
            throw new IllegalOperationError('resolve cannot be forced on ' + ppTypes.SOLID);

        return this._resolve(value);
    }

    private _resolve(...values: any): any {
        if (!this._isResolved) {
            this._value = values.length ? values[0] : this._value;
            this._isFulfilled = true;
            this._isResolved = this._isFulfilled;
            this._isPending = false;
            this._isRejected = false;
            if (this._nativeResolve)
                this._nativeResolve(this._value)
        }
        //this.result = this._value;

        return this.result;
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

    then(...args: any):
        PPromise {
        return this;
    }

    catch
    (...args: any): PPromise {
        return this;
    }

    finally
    (...args: any): PPromise {
        return this;
    }

}

export default PPromise;