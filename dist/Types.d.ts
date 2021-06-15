import PPromise from "./PPromise";
declare type registryType = {
    [name: string]: PPromise;
};
declare enum ppTypes {
    'SOLID' = "solid:promise",
    'FLUID' = "fluid:deferred",
    'GAS' = "gas:deception"
}
declare type keyType = string | symbol;
declare type optionsType = {
    name?: keyType;
    isUnbreakable?: boolean;
    type?: ppTypes;
    secret?: keyType;
    registry?: registryType;
};
declare type resolveRejectArgs = [any, any?];
export { ppTypes, optionsType, resolveRejectArgs, keyType };
