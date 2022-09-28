<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [THUSD\_MINIMUM\_DEBT](./lib-base.thusd_minimum_debt.md)

## THUSD\_MINIMUM\_DEBT variable

A Trove must always have at least this much debt.

<b>Signature:</b>

```typescript
THUSD_MINIMUM_DEBT: Decimal
```

## Remarks

Any transaction that would result in a Trove with less debt than this will be reverted.
