import PPromise from '../PPromise';
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";


describe('Given a new PPromise of type solid', () => {

    const newSolidPromise = (values: any[] = ['resolved immediately']) => {
        return new PPromise(values, {
            type: ppTypes.SOLID
        });
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
        });
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

    test('previously instantiated (solid) PPromise throws error when external resolve is attempted', async () => {
        let externalResolve: Function;
        externalResolve = (x: any) => {
        };
        let cb = (resolve: Function, reject: Function) => {
            externalResolve = resolve;
        }

        const solidPPromise = new PPromise(cb, {
            type: ppTypes.SOLID
        });
        expect(solidPPromise.isFulfilled).toEqual(false);

        expect(() => {
            solidPPromise.resolve('this should throw an error')
        }).toThrow(IllegalOperationError);


    });
    test('Deferred pattern passed in as a callback is not detectable by PPromise', async () => {
        let externalResolve: Function;
        let crazyString = 'this should stillforce a resolve because PPromise does not know this is a deffered pattern'
        externalResolve = (x?: any) => {
            console.log('inside external Resolve', x);
        };
        let cb = (resolve: Function, reject: Function) => {
            console.log('solidPPromise is making a callback');
            externalResolve = resolve;
        }

        const solidPPromise = new PPromise(cb, {
            name : 'solidPPromise',
            type: ppTypes.SOLID
        });
        expect(solidPPromise.isFulfilled).toEqual(false);

        await solidPPromise.promise; //this gets stuck?
        externalResolve(crazyString)
        console.log(solidPPromise);
        await solidPPromise.promise;
        expect(solidPPromise.isFulfilled).toEqual(true);

        expect(solidPPromise.result).toEqual(crazyString);
    });

    test('a function is passed in is executed immediately just as in a standard promise', async () => {
        let myValueIsAssigned = false;
        newSolidPromise([() => {
            myValueIsAssigned = true; //'assigned without PPromise.resolve';
        }]);
        await newSolidPromise;
        expect(myValueIsAssigned).not.toEqual(false);
    });

    test('an array of functions is passed in the first is called by the resolve', async () => {
        let myValueIsAssigned = false;
        newSolidPromise([() => {
            myValueIsAssigned = true; //'assigned without PPromise.resolve';
        }]);
        await newSolidPromise;
        expect(myValueIsAssigned).not.toEqual(false);
    });

    test.todo('PPromise has a promise property to access the native promise')

    test.todo('calls to then are resolved on appropriate event loop iteration');

    test.todo('an already resolved PPromise will ...');


});
