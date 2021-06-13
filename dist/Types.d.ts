declare enum ppTypes {
    'SOLID' = "solid:promise",
    'FLUID' = "fluid:deferred",
    'GAS' = "gas:deception"
}
declare type optionsType = {
    name?: string | symbol;
    isUnbreakable?: boolean;
    type?: ppTypes;
};
declare type resolveRejectArgs = [any, any?];
export { ppTypes, optionsType, resolveRejectArgs };
