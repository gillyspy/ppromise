Ideas
---------------------------
---
### About Logic string

you can provide a logic string about how to relate promises together
a) 0 && 1 || (0 && 2)
b) 0 && (1 || 2)     // equivalent of a

these get translated internally.
&& is akin to "all"
|| is akin to "any"
|! is akin to "race"