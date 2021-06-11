export default class IllegalOperationError extends Error{
    constructor(...messages :string[] ) {
        let msg = `Illegal Operation on PPromise `;
        if(messages.length)
            msg += ` ${messages[0]}`;
        super(msg);
    }
}
