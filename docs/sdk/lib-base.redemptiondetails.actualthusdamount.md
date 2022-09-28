<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [RedemptionDetails](./lib-base.redemptiondetails.md) &gt; [actualTHUSDAmount](./lib-base.redemptiondetails.actualthusdamount.md)

## RedemptionDetails.actualTHUSDAmount property

Amount of thUSD that was actually redeemed by the transaction.

<b>Signature:</b>

```typescript
actualTHUSDAmount: Decimal;
```

## Remarks

This can end up being lower than `attemptedTHUSDAmount` due to interference from another transaction that modifies the list of Troves.
