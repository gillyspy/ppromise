import PPromise from '../PPromise'
import {optionsType, ppTypes} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";

type registryType = {
    [name: string]: PPromise
}

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

    test('value array has arg 0 as resolve action and arg 1 is for reject', async () => {
        const resolvePPromise = new PPromise(['for resolve', 'for reject']);
        const rejectPPromise = new PPromise(['for resolve', 'for reject']);

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

    test('because of the event loop... resolve can only be honored the first time called', async () => {
        const myPPromise = new PPromise(['original value', 'for reject']);
        await myPPromise.resolve();
        await myPPromise.resolve('impossible value');
        expect(myPPromise.result).toEqual('original value');
    });

    test('you can pass in a symbol or string as a key', async () => {
        const mySecret = Symbol('secret');
        const myPPromise = new PPromise({
            secret: mySecret
        } as optionsType);
        expect(myPPromise instanceof PPromise).toBe(true);
        await myPPromise.resolve('does not matter', mySecret);
        expect(myPPromise.result).toBe('does not matter');

        const mySecret2 = 'string secret';
        const myPPromise2 = new PPromise({
            secret: mySecret2
        });
        expect(myPPromise2 instanceof PPromise).toBe(true);
        await myPPromise2.resolve('does not matter', mySecret2);
        expect(myPPromise2.result).toBe('does not matter');

    });


    test('when a ppromise uses a secret you cannot resolve without it', async () => {
        const mySecret = Symbol('secret');
        const myPPromise = new PPromise({
            secret: mySecret
        });

        expect(() => {
            myPPromise.resolve('updated Value but no key');
        }).toThrowError(IllegalOperationError);
        expect(myPPromise.isFulfilled).toBe(false);
    });

    test('secured PPromise requires a matching key to upgrade type or errors out', () => {
        const myPPromise = new PPromise(['original value', 'for reject'], {
            secret: 'any secret'
        } as optionsType);
        expect(() => {
            myPPromise.upgradeType(ppTypes.SOLID, 'different secret')
        }).toThrow(IllegalOperationError);
    });

    test('secured PPromise allows only a string or symbol type for a key (also type must match)', () => {
        const myPPromise = new PPromise(['original value', 'for reject'], {
            secret: '123'
        } as optionsType);
        expect(() => {
            myPPromise.upgradeType(ppTypes.SOLID, undefined)
        }).toThrow(TypeError);

        expect(() => {
            myPPromise.upgradeType(ppTypes.SOLID, Symbol('123'))
        }).toThrow(TypeError);
    });

    test('An name-index registry of PPromises is searchable by name', async () => {
        const myPPromise = new PPromise([Math.random() * 1000, 'for reject'], {
            name: '123'
        } as optionsType);
        const uniqueName = Symbol('456');
        const myPPromise2 = new PPromise([Math.random(), 'for reject'], {
            name: uniqueName
        } as optionsType);

        const whichPromise = PPromise.find('123');
        await whichPromise!.resolve();
        expect(whichPromise!.result).toEqual(myPPromise.result);
        const whichPromise2 = PPromise.find(uniqueName);
        await whichPromise2!.resolve();
        expect(whichPromise2!.result).toEqual(myPPromise2.result);

    });

    test('resolve after a given duration in ms', async ()=>{
        const key = Symbol('secret');
        const myPPromise = new PPromise(['better late than never!'],{
            secret : key
        });
        let start = new Date();
        const duration = await myPPromise.resolveAfter(3000,'i agree',key).then( value =>{
            let end = new Date();
            return (+end - +start);
        });
        expect(duration).toBeGreaterThanOrEqual(3000);
        expect(myPPromise.result).toEqual('i agree');
    });


    test.todo('pushThen does same thing as then except instance is returned insead of promise');

    test.todo('Triggered & pending PPromise is same as calling resolve on a solid promise');

    test.todo('Calling resolve on a settle PPromise will do nothing');
    /***
     * if a function is passed as the value then
     */
})