import PPromise from "./PPromise";

type registryType = {
    [ name : string] : PPromise
}

enum ppTypes {
    'SOLID' = 'solid:promise',
    'FLUID' = 'fluid:deferred',
    'GAS' = 'gas:deception'
}

type keyType = string | symbol ;

type optionsType = {
    name? : keyType;
    isUnbreakable? : boolean;
    type? : ppTypes;
    secret? : keyType;
    registry : object | registryType;
}

type resolveRejectArgs = [any, any?];

export {ppTypes,optionsType,resolveRejectArgs,keyType}