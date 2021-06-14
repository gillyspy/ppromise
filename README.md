
-------------------------------------------------------
About Promise Types
-------------------------------------------------------
### Solid aka Promise (solid:promise)
type === solid
essentially this is a standard promise that cannot be resolved externally (ie is NOT a deferred)
this cannot be downgraded to either standard nor fluid
* Promise pattern
  * functionally equivalent to native Promise
  * extra properties beyond native Promise
  * native promise is directly accessible 
* no phase changes possible
* unbreakable 
* secure by design
   * no key necessary as it is natively locked down
    
### Fluid aka Deferred  (fluid:deferred)
type === fluid (default type)
this is a deferred anti-pattern, but the existing attached promises cannot be removed. fluid can
be changed to a solid (but not to gas)

* Deferred
  * a Promise that is externally resolvable
  * extra properties beyond native Promise
  * native promise is directly accessible
* 1 phase change 
  * change to solid is possible
* unbreakable
* secure-able behaviour 
    * accessible only to those with key

### Gas aka Deception (gas:deception)
type === gas
this is a deferred anti-pattern where the promises can be changed (removed or added).
Gas can be transitions to a fluid or all the way to a solid

* Deferred
  * a Promise that is externally resolvable
  * extra properties beyond native Promise
  * native promise is directly accessible
* breakable 
* 2 phase changes possible 
  * fluid or solid is possible
* secure-able behaviour 
    * accessible only to those with key
    
### 1-way phase changes
#### impetus 
These changes are one-way for a reason. Your consumers should be able to count on an upper-bound of 
volatility. 
If a solid could also be changed to a gas then consumers would have to assume that every type is a gas and that 
would make the library useless. 

#### Gas -> Fluid -> Solid
consumers can rely upon this relationship

-------------------------------------------------------
About "Upgrading".  Changing Types
-------------------------------------------------------
Upgrading is a creation option
when enabled it is one way (as mentioned). 

Settled PPromises are automatically converted to a solid type.

-------------------------------------------------------
About Unbreakable (and gas:deception )
-------------------------------------------------------
Unbreakable is a concept that affects how the root promise is related to its promise chain. 
`isUnbreakable===false` is a property that only gases can have.  In fact `isUnbreakable` implies a type `gas:deception`

e.g.
APromise.then().then().then()

With native Promises, once a chain is established, there is no reversing that.  Additionally, you can branch chains 
from any point in the chain including from the root promise. However, This process is only additive. 

A PPromise that is (a fluid or solid) is unbreakable (`isUnbreakable === true`) behaves the same way. A PPromise 
`isUnbreakable` by default because the default type is `fluid:deferred` and that is part of it's nature.  

A settled promise of any type is unbreakable (`isUnbreakable === true`);

However, you can set `isUnbreakable===false` in the constructor options.  This option is a facade -- you can only set 
this
for `type : GAS`, so it is technically redundant.  However, if you do not set the type explicitly, but you set the 
`isUnbreakable:false` property then it will imply `type : GAS`.  see [#contructor] behaviour 
<pre>
PPromise({ isUnbreakable : false })
</pre>
`isUnbreakfase === false` means that the head of the PPromise (the root promise) is internally separate from the chain
network.  This chain is intended for internal use only.  

Until the root (of a gas:deception type only) promise is settled then the head/root is removable (via `.sever()`) from 
the chain.  
A `sever()` will not return the chain to you, but you can choose to `sever('resolve')` or `sever('reject')`.  
`sever` in all forms will return the "re-newed" PPromise (for continued) chaining. e.g. 
<pre>
//sever the chain and then resolve the head with newValue
myPPromise.sever.resolve(newValue) 

//sever the chain; resolve the chain; resolve the head with newValue; 
myOtherPP.sever('resolve').resolve(newValue)
   .then(value=>{ actOn(value)}) 

//
myLonglostPP
   .update(newValue,coolError )  //update root resolve value w newValue AND update reject action w coolError
   .sever('resolve')             //sever the chain and resolve the chain (which will resolve with newValue) 
   .updateValue(newerValue)      //update root value with newerValue. (reject is still coolError)
   .resolve();                   //resolve the root (with newerValue)
</pre>

Severing the PPromise from the chain does not convert a PPromise to `isUnbreakable : true`.  Sever replaces the 
chain with a new, zero-length chain.  

Note that the PPromise instances above would have been instantiated with something equivalent to: 
`PPromise({ isUnbreakable : false })`

### use-case
In an animation, you might want your animator to commit to moving an element to some location and/or in some time. 

Consumers can latch on to that promise and go along for the ride or commit to a response for when you arrive. 

With PPromise you can easily break your promise -- and change course, arrival time, etc. 

With regular promises you cannot do this.  You have several options with PPromise to make things interesting... 
#### option: do nothing
You could use a `solid:promise` pattern which is the normal case

#### option: force a reject 
You could use a `fluid:deferred` pattern to reject the promise which would notify the consumer to mitigate

#### option: force a resolve
You could use a `fluid:deferred` pattern to resolve the promise which would notify the consumer to believe your 
promise.  This case is very powerful because you can make the decision on when / what conditions to resolve AFTER 
making the promise contract, and your consumers will believe you regardless. remember: with great power comes great 
responsibility - but also -- those consumers might just be minions

#### option: break the chain (maybe settle that; keep your original promise unsettled)
you could use the `gas:deception` pattern (aka `isUnbreakable:false` )  which will allow you to break the chain. On 
sever, the severed, dangling chain can be settled separately.  Down-stream consumers are none-the-wiser. They think 
this is the settling of the original promise .  The original promise remains unfulfilled and will continue to carry 
out its purpose and potentially even pick up new minions.

Consumers of your library can know the nature of the PPromise by inspecting properties. `isUnbreakable` property is 
a helpful boolean for this. The definitive property is `type`.  Pending promises behave differently and that 
can be inspected via [#properties] like the `isPending` boolean.
<pre>
//TODO: example
</pre>

-------------------------------------------------------
About Security
-------------------------------------------------------
You can secure a PPromise instance during creation. 

A secured PPromise has certain methods and properties that behave slightly differently.  The biggest change is that 
secured methods will take an extra argument for the secret/key.  When the key is not provided by default they will 
fail / passthrough as silently as possible. i.e. the instance will be returned and no error will be thrown.  However,
with an additional option `errorsWithoutKey===true` will cause an illegaloperationerror to be thrown.  

Properties that are secure will return null and a method will need to be used instead of a getter.

The following methods are secured :


The following properties are secured :

## use-case
You have an animation that is dynamically resolving promises that it has been given.  


-------------------------------------------------------
Constructor Behaviour
-------------------------------------------------------
## options object
### options.key
A symbol or a string that secures mutable operations on the PPromise. 
<pre>
{
   ...,
   secret : 'whatever'
}
</pre>

### options.type
#### solid
`{ type : 'solid'} ` is equivalent to: 
<pre>
{ 
   type : 'solid',
   isUnbreakable : true
} 
</pre>

#### fluid equivalents
This is the default type so you do not need the options for it.   
` {} ` is equivalent to:
<pre>
{ 
   type : 'fluid',
   isUnbreakable : true
} 
</pre>
#### gas equivalents
`{ type : 'gas'}` is equivalent to :

`{ isUnbreakable : false }` is equivalent to : 
<pre>
{ 
   type : 'gas',
   isUnbreakable : false 
}
</pre>

#### exceptions
the following constructor options are contradictory and will cause a type exception
<pre>
{ 
   type : 'solid',
   isUnbreakable : false 
}
</pre>
<pre>
{ 
   type : 'fluid',
   isUnbreakable : false 
}
</pre>
<pre>
{ 
   type : 'gas',
   isUnbreakable : true 
}
</pre>
-------------------------------------------------------
About Native Promise Methods (e.g. 'any', 'all',...):
-------------------------------------------------------
you can use any of these and in any combination...  
They will be applied to the native promises internally (ppromise.promise)

-------------------------------------------------------
Behaviour of a Pending PPromise and Resolve of such
-------------------------------------------------------
Only pending PPromises are subject to the functionality of their types.  e.g. You can only resolve a pending PPromise. 

More specifically you can only `resolve` an `isPending === true` PPromise. 

However, a `resolve` is asynchronous.  Engines will NOT resolve Promises on the current event cycle.  There is a 
state called `isTriggered` to help with this.  When a PPromise already `isTriggered || isSettled` then any additional 
attempt to resolve it will be ignored an `IllegalOperationError`.

i.e. 
A settled|triggered PPromise cannot be resolved or rejected differently regardless of its type. 

A settled|triggered PPromise cannot be severed regardless of its type.  


-------------------------------------------------------
Future Possibilities
-------------------------------------------------------
