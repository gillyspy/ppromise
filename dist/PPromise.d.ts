import { optionsType, ppTypes, resolveRejectArgs } from './Types';
interface promiseCb {
    (resolve: Function, reject: Function): void;
}
declare class PPromise {
    readonly name?: string | symbol;
    private _type;
    private _secret;
    private _isFulfilled;
    private _isPending;
    private _isRejected;
    private _isResolved;
    private _value;
    private _reason?;
    private _Chain?;
    private _isTriggered;
    private _isUnbreakable;
    private _nativeResolve?;
    private _nativeReject?;
    private _promise;
    private options;
    constructor();
    constructor(cbOrPromiseOrValuesOrOptions: Function | Promise<any> | resolveRejectArgs | optionsType);
    constructor(cbOrPromiseOrValuesOrOptions: Function | Promise<any> | resolveRejectArgs | object, opts: optionsType);
    private parseOptions;
    private createChain;
    private linkAnyChains;
    private get chain();
    private static createNativePromise;
    get result(): any;
    get type(): ppTypes;
    get promise(): Promise<promiseCb>;
    get isTriggered(): boolean;
    get isFulfilled(): boolean;
    get isPending(): boolean;
    get isRejected(): boolean;
    get isResolved(): boolean;
    get isUnbreakable(): boolean;
    static resolve(value?: any): PPromise;
    resolve(...values: any[]): any;
    private _resolve;
    private makeFulfillmentCallback;
    reject(value?: string | Error): any;
    private _reject;
    private makeRejectCallback;
    private initStates;
    static getDeferred(...args: any[]): void;
    sever(): PPromise;
    severSafely(): PPromise;
    pushThen(...args: any): PPromise;
    then(...args: any): Promise<any>;
    catch(...args: any): Promise<any>;
    finally(...args: any): Promise<any>;
}
export default PPromise;