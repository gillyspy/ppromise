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
    })

        /*with a string will establish that string as resolve value', ()=>{
        const myPPromise = new PPromise('lonely string');
        expect(myPPromise)
    })*/

    test.todo('call to PPromise.getDeferred returns PPromise instance of type standard')
});


