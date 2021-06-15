enum ppTypes {
    'SOLID' = 'solid:promise',
    'FLUID' = 'fluid:deferred',
    'GAS' = 'gas:deception'
}

type optionsType = {
    name? : string | symbol;
    isUnbreakable? : boolean;
    type? : ppTypes;
    secret? : string | symbol;
}

type resolveRejectArgs = [any, any?];

type keyType = string | symbol ;
/*
type registryType = {
    [key in keyof registryType ] : string | symbol
}*/


export {ppTypes,optionsType,resolveRejectArgs,keyType}