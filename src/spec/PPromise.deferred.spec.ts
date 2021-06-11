import PPromise from '../PPromise'
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";

describe( 'Deferred Pattern', ()=>{
    test('instantiate PPromise as type fluid will make it a standard:deception type',()=> {
        const myPPromise = new PPromise({
            type : ppTypes.STANDARD
        });
        expect(myPPromise.type).toEqual(ppTypes.STANDARD);
    });

    test('default type is standard', ()=>{
        const myPPromise = new PPromise();
        expect(myPPromise.type).toEqual(ppTypes.STANDARD);
    });

    test('constructed with a string will establish that string as resolve value but resolve is deferred', async()=>{
        const myPPromise = new PPromise('lonely string');
        expect(myPPromise.result).toEqual(undefined);
        expect(myPPromise.isFulfilled).toEqual(false);
        myPPromise.resolve();
        await myPPromise.promise;
        expect(myPPromise.result).toEqual('lonely string');
    })

    test.todo('call to PPromise.getDeferred returns PPromise instance of type standard')
});


