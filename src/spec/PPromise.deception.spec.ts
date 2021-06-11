import PPromise from '../PPromise'
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";

describe('Deception Pattern', ()=>{
    test('instantiate PPromise as type fluid will make it a fluid:deception type',()=>{
        const myPPromise = new PPromise({
            type : ppTypes.FLUID
        });
        expect(myPPromise.type).toEqual(ppTypes.FLUID);
    });
});

