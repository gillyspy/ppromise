import { keyType, optionsType, ppTypes, resolveRejectArgs } from './Types';
interface promiseCb {
    (resolve: Function, reject: Function): void;
}
declare class PPromise {
    readonly name: keyType;
    private _type;
    private _isFulfilled;
    private _isPending;
    private _isRejected;
    private _isResolved;
    private _value;
    private readonly _resolveCallback?;
    private readonly _rejectCallback?;
    private _reason?;
    private _Chain?;
    private readonly _secret?;
    private readonly _chainSecret;
    private _isTriggered;
    private _nativeResolveProxy?;
    private _nativeRejectProxy?;
    private _promise;
    private readonly options;
    constructor();
    constructor(cbOrPromiseOrValuesOrOptions: Function | Promise<any> | resolveRejectArgs | object | optionsType);
    constructor(cbOrPromiseOrValuesOrOptions: Function | Promise<any> | resolveRejectArgs | object, opts: optionsType);
    private parseOptions;
    private static checkPermissions;
    private isValidKey;
    private createChain;
    private linkAnyChains;
    private get chain();
    private static createNativePromise;
    get result(): any;
    get type(): ppTypes;
    get promise(): Promise<promiseCb>;
    get isTriggered(): boolean;
    get isSettled(): boolean;
    get isFulfilled(): boolean;
    get isPending(): boolean;
    get isSecured(): boolean;
    get isRejected(): boolean;
    get isResolved(): boolean;
    get isUnbreakable(): boolean;
    resolveRejectPrep(values: any[]): any[];
    static resolve(value?: any): PPromise;
    pushResolve(...values: any[]): PPromise;
    resolve(...values: any[]): Promise<promiseCb>;
    private _resolve;
    private makeFulfillmentCallback;
    pushReject(...values: any[]): PPromise;
    reject(...values: any[]): Promise<promiseCb>;
    private _reject;
    private makeRejectCallback;
    private initStates;
    static getDeferred(...args: any[]): PPromise;
    static find(name: keyType, key?: keyType): PPromise | undefined;
    sever(...args: any[]): PPromise;
    upgradeType(type: ppTypes, key?: keyType): void;
    pushThen(...args: any): PPromise;
    then(...args: any): Promise<any>;
    catch(...args: any): Promise<any>;
    finally(...args: any): Promise<any>;
}
export default PPromise;
