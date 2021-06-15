import PPromise from '../PPromise'
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";

describe('Deception Pattern', () => {
    test('instantiate PPromise as type GAS will make it a fluid:deception type', () => {
        const myPPromise = new PPromise({
            type: ppTypes.GAS
        } as optionsType);
        expect(myPPromise.type).toEqual(ppTypes.GAS);
    });

    test('deceptions are resolved like a deferred', async () => {
        const myPromise = new PPromise(['resolve'], {
            name: 'resolvedLikeDeferrd',
            type: ppTypes.GAS
        } as optionsType);
        let x;
        myPromise.then((value: any) => {
            x = value;

        });
        await myPromise.resolve('new value');
        expect(x).toEqual('new value');
    });

    test('deceptions have breakable promise chains ', async () => {
        const myPromise = new PPromise(['resolve'], {
            name: 'resolvedLikeDeferrd',
            type: ppTypes.GAS
        } as optionsType);
        let x, y;
        myPromise.then((value: any) => {
            x = value;
        });

        myPromise.sever().then((value: any) => {
            y = value;
        })

        await myPromise.resolve('new value');
        expect(x).not.toEqual('new value');
        expect(y).toEqual('new value');
    });

    test('PPromises can be upgraded from Gas to Fluid', () => {
        const myPPromise = new PPromise(['resolve'], {
            name: 'resolvedLikeDeferred',
            type: ppTypes.GAS
        } as optionsType);
        expect(myPPromise.isUnbreakable).toBe(false);
        myPPromise.upgradeType(ppTypes.FLUID);
        expect(myPPromise.type).toBe(ppTypes.FLUID);
        expect(myPPromise.isUnbreakable).toBe(true);
        expect(() => {
            myPPromise.sever();
        }).toThrow(IllegalOperationError);

    });
    test('PPromises can be upgraded from Gas to Solid', async () => {
        const myPPromise = new PPromise(['output'], {
            name: 'resolvedLikeDeferred',
            type: ppTypes.GAS
        } as optionsType);
        expect(myPPromise.type).toEqual(ppTypes.GAS)
        expect(myPPromise.result).toEqual(undefined);
        expect(myPPromise.isUnbreakable).toBe(false);
        myPPromise.upgradeType(ppTypes.SOLID);
        expect(myPPromise.isTriggered).toEqual(true);
        expect(myPPromise.isPending).toEqual(true);
        expect(myPPromise.type).toEqual(ppTypes.SOLID)
        expect(myPPromise.isUnbreakable).toBe(true);
        await myPPromise.resolve();
        expect(myPPromise.isPending).toEqual(false);
        expect(myPPromise.result).toBe('output');
        expect(() => {
            myPPromise.sever();
        }).toThrow(IllegalOperationError);
    });

    test('sever can be instructed to reject or resolve the dropped chain', (done) => {
        const mySeverable = new PPromise({type: ppTypes.GAS});
        let externalMsg: any, externalValue: any;

        mySeverable.catch((x: any) => {
            externalMsg = x;
            expect(externalMsg).toEqual('rejection message');
        });
        //new chain automatically

        mySeverable.sever('reject', 'rejection message')

        mySeverable.then((x: any) => {
            externalValue = x;
            expect(externalValue).toEqual('resolution value');
            done();
        });
        mySeverable.sever('resolve', 'resolution value');
    })
});

