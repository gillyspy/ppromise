import PPromise from '../PPromise'
import {ppTypes, optionsType,resolveRejectArgs} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";
import InvalidDefinitionError from "../errors/InvalidDefinitionError";

describe('Given All PPromise Types', () => {

    test('0 arguments means you get a fluid type', () => {
        const myPPromise = new PPromise();
        expect(myPPromise.type).toEqual(ppTypes.FLUID);
    });

    /* not sure how to test this as it correctly fails during compilation
    * but as such no error is caught by Jest
    */
    /*
    test(' if there is only 1 argument and it is of type object then treat it as an options object or error', () => {
        expect(() => {
            try {
                const badOptionsPPromise = new PPromise({
                    fake: 'fake'
                });
            } catch (e) {
                console.log(e)
            }
        }).toThrow(Error);

        const goodOptionsPromise =  new PPromise({  });
        expect(goodOptionsPromise.isPending).toEqual(true);
    });

     */

    /* similar problem to above
    test('if there are 2 arguments of type object then throw a type error', () => {
        const badPPromise = new PPromise({
            fake: 'fake'
        }, {
            fake: 'fake'
        });
        expect(badOptionsPPromise.isPending).toEqual(true);
    });*/

    test('value array has arg 0 as resolve action and arg 1 is for reject', async()=>{
        const resolvePPromise = new PPromise( ['for resolve', 'for reject']);
        const rejectPPromise = new PPromise( ['for resolve', 'for reject']);

        await resolvePPromise.resolve();
        expect(resolvePPromise.isFulfilled).toEqual(true);

        await rejectPPromise.reject();
        expect(rejectPPromise.isFulfilled).not.toEqual(true);
    });

    test('constructed with a string will establish that string as resolve value', async () => {
        const myPPromise = new PPromise(['lonely string']);
        expect(myPPromise.result).toEqual(undefined);
        expect(myPPromise.isFulfilled).toEqual(false);
        myPPromise.resolve();
        await myPPromise.promise;
        expect(myPPromise.result).toEqual('lonely string');
    });

    test('because of the event loop... resolve can only be honored the first time called', async()=>{
        const myPPromise = new PPromise(['original value', 'for reject']);
        await myPPromise.resolve();
        await myPPromise.resolve('impossible value');
        expect(myPPromise.result).toEqual('original value');
    });

    test('you can pass in a symbol or string as a key', ()=>{
        const mySecret = Symbol('secret');
        const myPPromise = new PPromise({
            secret : mySecret
        });
        expect(myPPromise instanceof PPromise).toBe(true);
    });


    test( 'when a ppromise uses a secret you cannot resolve without it',async()=>{
        const mySecret = Symbol('secret');
        const myPPromise = new PPromise({
            secret : mySecret
        });

        expect(  ()=>{
            myPPromise.resolve('updated Value but no key');
        }).toThrowError(IllegalOperationError);
        expect(myPPromise.isFulfilled).toBe(false);
    });

    test.todo('Calling resolve on an already triggered & pending PPromise is same as calling resolve on a solid promise');

    test.todo('Calling resolve on a settle PPromise will ????');
    /***
     * if a function is passed as the value then
     */
})