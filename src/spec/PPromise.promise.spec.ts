import PPromise from '../PPromise';
import {ppTypes, optionsType} from '../Types'
import IllegalOperationError from "../errors/IllegalOperationError";


describe('new PPromise of type solid returns a ppromise-looking object', () => {

    const newSolidPromise = (value : any = 'resolved immediately') => {
        return new PPromise(value , {
            type: ppTypes.SOLID
        });
    }

    test('call the constructor with a static string is equivalent to calling PPromise.resolve statically with a string', () => {
        const value = 'resolved immediately';
        const myStaticPPromise = PPromise.resolve(value )
        const myPPromise = newSolidPromise( value );

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

    test('new solid promise can be provided with a resolve function ',()=>{
          const myPPromise = new PPromise((resolve:Function)=>{ resolve() }, {
            type: ppTypes.SOLID
        });
          expect(myPPromise instanceof PPromise).toBe(true);

    })

    test('statically calling resolve will create a solid,fulfilled PPromise', async ()=>{
        const myPPromise = PPromise.resolve(true);
        expect(myPPromise instanceof PPromise).toBe(true);
        expect( myPPromise instanceof Promise).toBe(false);
        expect( myPPromise.promise instanceof Promise).toBe(true);
        const result = await myPPromise.promise;
        expect(result).toEqual(true);
    });

    test('previously instantiated (solid) PPromise cannot be resolved early by PPromise',async ()=>{
        let externalResolve :Function;
        externalResolve = (x :any) =>{};
        let cb = (resolve : Function, reject : Function)=>{
            externalResolve = resolve;
        }

        const solidPPromise = new PPromise( cb, {
            type : ppTypes.SOLID
        });
        expect(solidPPromise.isFulfilled).toEqual(false);

        expect(()=>{
            solidPPromise.resolve('this should throw an error')
        }).toThrow(IllegalOperationError);
        externalResolve('this should force a resolve');
        console.log(solidPPromise);
        await solidPPromise.promise;
        expect(solidPPromise.isFulfilled).toEqual(true);

        expect(solidPPromise.result).toEqual('this should force a resolve');


    });

    test.todo('PPromise has a promise property to access the native promise')

    test.todo('calls to then are resolved on appropriate event loop iteration');

    test.todo('an already resolved PPromise will ...');



});
