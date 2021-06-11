enum ppTypes {
    'SOLID' = 'solid:promise',
    'FLUID' = 'fluid:deception',
    'STANDARD' = 'standard:deferred'
}

type optionsType = {
    isUnbreakable? : boolean
    type? : ppTypes
}

export {ppTypes,optionsType}