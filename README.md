
-------------------------------------------------------
About Promise Types
-------------------------------------------------------
### Solid aka Promise (solid:promise)
type = solid:
essentially this is a standard promise that cannot be resolved externally (ie is NOT a deferred)
this cannot be downgraded to either standard nor fluid

### Standard aka Deferred  (standard:deferred)
type = standard (default type)
this is a deferred pattern but the existing attached promises cannot be removed. standard can
be upgraded to solid (but not downgraded to fluid)

### Fluid aka Deception (fluid:deception)
type = fluid:
this is a deferred pattern where the the promises can be changed (removed or added).
fluid can be upgraded to solid or standard.

-------------------------------------------------------
About "Upgrading".  Changing Types
-------------------------------------------------------
upgrading is a creation option
when enabled it is one way (as mentioned)

-------------------------------------------------------
About Native Promise Methods (e.g. 'any', 'all',...):
-------------------------------------------------------
you can use any of these and in any combination...  
They will be applied to the native promises internally (ppromise.promise)

-------------------------------------------------------
About fluidity & deferred
-------------------------------------------------------
if a ppromise is fulfilled then you cannot change that promise itself.
if a ppromise is pending then you can as long as the type is not `solid:promise`

