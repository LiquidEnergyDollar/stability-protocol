<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [SendableLiquity](./lib-base.sendableliquity.md) &gt; [transferBammCollateralGainToTrove](./lib-base.sendableliquity.transferbammcollateralgaintotrove.md)

## SendableLiquity.transferBammCollateralGainToTrove() method

Transfer [collateral gain](./lib-base.bammdeposit.collateralgain.md) from Bamm Deposit to Trove.

**Signature:**

```typescript
transferBammCollateralGainToTrove(): Promise<SentLiquityTransaction<S, LiquityReceipt<R, CollateralGainTransferDetails>>>;
```
**Returns:**

Promise&lt;[SentLiquityTransaction](./lib-base.sentliquitytransaction.md)<!-- -->&lt;S, [LiquityReceipt](./lib-base.liquityreceipt.md)<!-- -->&lt;R, [CollateralGainTransferDetails](./lib-base.collateralgaintransferdetails.md)<!-- -->&gt;&gt;&gt;

## Remarks

The collateral gain is transfered to the Trove as additional collateral.
