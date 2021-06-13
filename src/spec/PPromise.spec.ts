import PPromise from '../PPromise'
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";
import InvalidDefinitionError from "../errors/InvalidDefinitionError";

describe('Given All PPromise Types', ()=>{

    test('0 arguments means you get a fluid type',  () => {
        const myPPromise = new PPromise();
        expect(myPPromise.type).toEqual(ppTypes.FLUID);
    });

    test.todo(' if there is only 1 arguments of type object assume it is an options object');

    test.todo('value array has arg 0 as resolve action and arg 1 is for reject');

    test('constructed with a string will establish that string as resolve value', async () => {
        const myPPromise = new PPromise(['lonely string']);
        expect(myPPromise.result).toEqual(undefined);
        expect(myPPromise.isFulfilled).toEqual(false);
        myPPromise.resolve();
        await myPPromise.promise;
        expect(myPPromise.result).toEqual('lonely string');
    });

    test.todo('because of the event loop... resolve can only be called once')
    /***
     * if a function is passed as the value then
     */



})