export default class IllegalUseOfSolidPromise extends Error{
    constructor(...messages :string[] ) {
        let msg = `Illegal Operation on PPromise `;
        if(messages.length)
            msg += ` ${messages[0]}`;
        super(msg);
    }
}
