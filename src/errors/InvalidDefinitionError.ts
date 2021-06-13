export default class InvalidDefinitionError extends TypeError{
    constructor( part :string, msg? : string ) {
        let message = `Illegal use of ${part} on PPromise.`;
        if( msg )
            message += ` ${msg}.`;
        super(message);
    }
}
