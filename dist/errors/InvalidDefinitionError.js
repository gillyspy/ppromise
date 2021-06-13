"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidDefinitionError extends TypeError {
    constructor(part, msg) {
        let message = `Illegal use of ${part} on PPromise.`;
        if (msg)
            message += ` ${msg}.`;
        super(message);
    }
}
exports.default = InvalidDefinitionError;
