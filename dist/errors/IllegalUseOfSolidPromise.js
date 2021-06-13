"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IllegalUseOfSolidPromise extends Error {
    constructor(...messages) {
        let msg = `Illegal Operation on PPromise `;
        if (messages.length)
            msg += ` ${messages[0]}`;
        super(msg);
    }
}
exports.default = IllegalUseOfSolidPromise;
