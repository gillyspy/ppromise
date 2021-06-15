import PPromise from '../PPromise';
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";
import {clearInterval} from "timers";


describe('Given a new PPromise of type solid', () => {

    const newSolidPromise = (values: any[] = ['resolved immediately']) => {
        return new PPromise(values, {
            type: ppTypes.SOLID
        } as optionsType);
    }

    test('call the constructor with resolve value as a string is equivalent to calling PPromise.resolve statically with a string', async () => {
        const value = 'resolved immediately';
        const myStaticPPromise = PPromise.resolve(value)
        const myPPromise = newSolidPromise([value]);

        expect(myStaticPPromise.isFulfilled).toBe(false);
        expect(myStaticPPromise.isResolved).toBe(false);
        expect(myStaticPPromise.isPending).toBe(true);
        expect(myStaticPPromise.isRejected).toBe(false);
        expect(myPPromise.isFulfilled).toBe(false);
        expect(myPPromise.isResolved).toBe(false);
        expect(myPPromise.isPending).toBe(true);
        expect(myPPromise.isRejected).toBe(false);
        expect(myPPromise.result).toEqual(myStaticPPromise.result);
        //myStaticPPromise;
        await myPPromise.promise;

        expect(myStaticPPromise.isFulfilled).toBe(true);
        expect(myStaticPPromise.isResolved).toBe(true);
        expect(myStaticPPromise.isPending).toBe(false);
        expect(myStaticPPromise.isRejected).toBe(false);
        expect(myPPromise.isFulfilled).toBe(true);
        expect(myPPromise.isResolved).toBe(true);
        expect(myPPromise.isPending).toBe(false);
        expect(myPPromise.isRejected).toBe(false);
        expect(myPPromise.result).toEqual(myStaticPPromise.result);
    });

    test('solid PPromise is unbreakable by default', () => {
        const myPPromise = newSolidPromise();
        expect(myPPromise.isUnbreakable).toBe(true);
    })

    test('new (solid) PPromise as same methods as a normalPromise', () => {
        const normalPromise = new Promise(() => {
        });
        const myPPromise = newSolidPromise();

        expect(typeof myPPromise.then).toEqual('function');
        expect(typeof normalPromise.then).toEqual('function');

        expect(typeof myPPromise.catch).toEqual('function');
        expect(typeof normalPromise.catch).toEqual('function');

        expect(typeof myPPromise.finally).toEqual('function');
        expect(typeof normalPromise.finally).toEqual('function');

    });

    test('new solid promise can be provided with a resolve function ', () => {
        const myPPromise = new PPromise((resolve: Function) => {
            resolve()
        }, {
            type: ppTypes.SOLID
        } as optionsType);
        expect(myPPromise instanceof PPromise).toBe(true);

    })

    test('statically calling resolve will create a solid,fulfilled PPromise', async () => {
        const myPPromise = PPromise.resolve(true);
        expect(myPPromise instanceof PPromise).toBe(true);
        expect(myPPromise instanceof Promise).toBe(false);
        expect(myPPromise.promise instanceof Promise).toBe(true);
        const result = await myPPromise.promise;
        expect(result).toEqual(true);
    });

    test('(solid) PPromise ignores calls to resolve or reject', async () => {
        const solidPPromise = new PPromise(['resolution value'], {
            type: ppTypes.SOLID
        } as optionsType);
        await solidPPromise.promise;
        expect(solidPPromise.isFulfilled).toEqual(true);
        expect(solidPPromise.result).toEqual('resolution value');
        await solidPPromise.resolve('subsequent value');
        expect(solidPPromise.result).not.toEqual('subsequent value');
        expect(solidPPromise.result).toEqual('resolution value');
    });

    test('a function is passed in is executed immediately just as in a standard promise', async () => {
        let myValueIsAssigned = false;
        newSolidPromise([() => {
            myValueIsAssigned = true; //'assigned without PPromise.resolve';
        }]);
        await newSolidPromise;
        expect(myValueIsAssigned).not.toEqual(false);
    });

    test('this test will go quickly because PPromises constructed from callbacks CAN force resolve',
        async () => {

            let externalResolve: Function;
            let maxTimeToWait = 6000, minTimeToWait = 1000, duration = 0;
            let startTime = new Date();
            const calcDuration = (startTime: any): number => {
                let end = new Date();
                return Math.abs((+end - +startTime))
            };
            externalResolve = (x?: any) => {
                //
            };
            let myInterval : any;
            let tick = 0;
            const solidPPromise = new PPromise(
                (resolve: Function, reject: Function) => {
                    console.log('solidPPromise is making a callback');
                    externalResolve = resolve;
                }, {
                    name: 'solidPPromise',
                    type: ppTypes.SOLID
                } as optionsType );

            solidPPromise.promise.then(x=>{
                clearInterval(myInterval);
            })

            await new Promise((resolve: Function, reject): void => {
               myInterval =  setInterval((): void => {
                    externalResolve();
                    duration = calcDuration(startTime);
                    resolve();
                    tick += 100;
                    if( tick > minTimeToWait )
                        clearInterval(myInterval);
                }, 100);
            });
            await solidPPromise.promise;
            expect(solidPPromise.isFulfilled).toEqual(true);
            expect(duration).toBeLessThanOrEqual(minTimeToWait);
        },
        20000
    );

    test('an array of functions is passed in the first is called by the resolve', async () => {
        let myValueIsAssigned = false;
        newSolidPromise([() => {
            myValueIsAssigned = true; //'assigned without PPromise.resolve';
        }]);
        await newSolidPromise;
        expect(myValueIsAssigned).not.toEqual(false);
    });

    test('PPromise type can not be downgraded from Solid -- throw error', async() => {
        const myPPromise = new PPromise(['output'], {
            name: 'resolvedLikeDeferred',
            type: ppTypes.SOLID
        } as optionsType);

        expect(myPPromise.isTriggered).toEqual(true);
        await myPPromise.promise;
        expect(myPPromise.result).toEqual('output');
        expect(myPPromise.isUnbreakable).toBe(true);
        expect(() => {
            myPPromise.upgradeType(ppTypes.GAS);
        }).toThrow(IllegalOperationError);
        expect(() => {
            myPPromise.upgradeType(ppTypes.FLUID);
        }).toThrow(IllegalOperationError);
        expect(myPPromise.result).toEqual('output');
        expect(myPPromise.isUnbreakable).toBe(true);
        expect(myPPromise.type).toBe(ppTypes.SOLID);
    });

    test.todo('PPromise has a promise property to access the native promise')

    test.todo('calls to then are resolved on appropriate event loop iteration');

    test.todo('an already resolved PPromise will ...');


});
