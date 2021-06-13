import PPromise from '../PPromise'
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";

describe('Deception Pattern', () => {
    test('instantiate PPromise as type GAS will make it a fluid:deception type', () => {
        const myPPromise = new PPromise({
            type: ppTypes.GAS
        });
        expect(myPPromise.type).toEqual(ppTypes.GAS);
    });

    test('deceptions are resolved like a deferred', async () => {
        const myPromise = new PPromise(['resolve'], {
            name: 'resolvedLikeDeferrd',
            type: ppTypes.GAS
        });
        let x;
        myPromise.then((value: any) => {
            x = value;

        });
        await myPromise.resolve('new value').promise;
        expect(x).toEqual('new value');
    });

    test('deceptions have breakable promise chains ', async () => {
        const myPromise = new PPromise(['resolve'], {
            name: 'resolvedLikeDeferrd',
            type: ppTypes.GAS
        });
        let x, y;
        myPromise.then((value: any) => {
            x = value;
        });

        myPromise.sever().then( (value : any)=>{
            y = value;
        })

        await myPromise.resolve('new value').promise;
        expect(x).not.toEqual('new value');
        expect(y).toEqual('new value');
    });
});

