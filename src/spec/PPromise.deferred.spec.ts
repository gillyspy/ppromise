import PPromise from '../PPromise'
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";
import InvalidDefinitionError from "../errors/InvalidDefinitionError";

describe('fluid:deferred type', () => {
    test('instantiate PPromise as type fluid will make it a fluid:deferred ', () => {
        const myPPromise = new PPromise({
            type: ppTypes.FLUID
        });
        expect(myPPromise.type).toEqual(ppTypes.FLUID);
        expect(myPPromise.isUnbreakable).toEqual(true);
    });

    test('default type is FLUID', () => {
        const myPPromise = new PPromise();
        expect(myPPromise.type).toEqual(ppTypes.FLUID);
    });

    test('making a fluid "breakable" throws a Type error', () => {
        expect(() => {
            new PPromise({
                type: ppTypes.FLUID,
                isUnbreakable: false
            })
        }).toThrow(InvalidDefinitionError);

    });

    test('a pending FLUID:deferred can be updated and will resolve with updated value', async () => {
        const myPPromise = new PPromise(['initial value']);
        expect(myPPromise.result).toEqual(undefined);
        expect(myPPromise.isFulfilled).toEqual(false);
        myPPromise.resolve('different value');
        await myPPromise.promise;
        expect(myPPromise.result).toEqual('different value');
        myPPromise.resolve('post resolve value will fail');
        expect(myPPromise.result).not.toEqual('post resolve value will fail');
    });

    test('FLUID:deferred supports `then` method for chaining', async () => {
        const myPPromise = new PPromise(['initial value']);
        let external = 'default value';
        Promise.resolve(true).then(x => {
            console.log('inside different promise')
            myPPromise.resolve();
        })
        const _p = myPPromise.then((x: any) => x).then((x: any) => {
            external = x
        });
        console.log('_p', _p);
        await _p;

        expect(external).toEqual('initial value');
    });

    test('can chain directly on the promise using then or through PPromise using pushThen', () => {
        const myPPromise = new PPromise(['initial value']);
        let external: any = 'default value';

        const x = myPPromise.pushThen((x: any) => {
            external = x
        });
        const y = myPPromise.then((x: any) => {
            x
        });
        const z = x.then((x: any) => x);

        expect(x instanceof PPromise).toEqual(true);
        expect(y instanceof Promise).toEqual(true);
        expect(z instanceof Promise).toEqual(true);
    });

    test(
        'a pending fluid:deferred is not breakable -- can not have its dependency chain severed ',
        () => {
            const myPPromise = new PPromise();
            expect(() => {
                myPPromise.sever()
            }).toThrow(IllegalOperationError)
            expect(myPPromise.isUnbreakable).toBe(true);

        }
    );

    test('PPromises can be upgraded from Fluid to Solid', async () => {
        const myPPromise = new PPromise(['output'], {
            name: 'resolvedLikeDeferred',
            type: ppTypes.FLUID
        });
        expect(myPPromise.type).toEqual(ppTypes.FLUID)
        expect(myPPromise.result).toEqual(undefined);
        expect(myPPromise.isUnbreakable).toBe(true);
        myPPromise.upgradeType(ppTypes.SOLID);
        expect(myPPromise.isUnbreakable).toBe(true);
        await myPPromise.resolve();
        expect(myPPromise.result).toBe('output');
        expect(myPPromise.type).toEqual(ppTypes.SOLID)
        expect(() => {
            myPPromise.sever();
        }).toThrow(IllegalOperationError);
    });

    test('PPromises can not be downgraded from Fluid -- throw error', () => {
        const myPPromise = new PPromise(['output'], {
            name: 'resolvedLikeDeferred',
            type: ppTypes.FLUID
        });

        expect(myPPromise.result).toEqual(undefined);
        expect(myPPromise.isUnbreakable).toBe(true);
        expect(myPPromise.type).toEqual(ppTypes.FLUID);
        expect(()=>{
            myPPromise.upgradeType(ppTypes.GAS);
        }).toThrow(IllegalOperationError);
        expect(myPPromise.result).toEqual(undefined);
        expect(myPPromise.isUnbreakable).toBe(true);
        expect(myPPromise.type).toEqual(ppTypes.FLUID)
    });

    test.todo('call to PPromise.getDeferred returns PPromise instance of type FLUID')
});


