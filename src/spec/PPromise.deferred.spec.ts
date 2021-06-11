import PPromise from '../PPromise'
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";

describe( 'Deferred Pattern', ()=>{
    test('instantiate PPromise as type fluid will make it a fluid:deception type',()=> {
        const myPPromise = new PPromise({
            type : ppTypes.STANDARD
        });
        expect(myPPromise.type).toEqual(ppTypes.STANDARD);
    });

    test('')

        /*with a string will establish that string as resolve value', ()=>{
        const myPPromise = new PPromise('lonely string');
        expect(myPPromise)
    })*/

    test.todo('call to PPromise.getDeferred returns PPromise instance of type standard')
});


