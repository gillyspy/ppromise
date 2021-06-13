enum ppTypes {
    'SOLID' = 'solid:promise',
    'FLUID' = 'fluid:deferred',
    'GAS' = 'gas:deception'
}

type optionsType = {
    name? : string|symbol;
    isUnbreakable? : boolean;
    type? : ppTypes;
}

type resolveRejectArgs = [any, any?];

export {ppTypes,optionsType,resolveRejectArgs}