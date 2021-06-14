enum ppTypes {
    'SOLID' = 'solid:promise',
    'FLUID' = 'fluid:deferred',
    'GAS' = 'gas:deception'
}

type optionsType = {
    name? : string;
    isUnbreakable? : boolean;
    type? : ppTypes;
    secret? : string | symbol;
}

type resolveRejectArgs = [any, any?];

export {ppTypes,optionsType,resolveRejectArgs}