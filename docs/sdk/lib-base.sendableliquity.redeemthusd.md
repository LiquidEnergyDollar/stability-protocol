<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [SendableLiquity](./lib-base.sendableliquity.md) &gt; [redeemTHUSD](./lib-base.sendableliquity.redeemthusd.md)

## SendableLiquity.redeemTHUSD() method

Redeem thUSD to native currency (e.g. Ether) at face value.

**Signature:**

```typescript
redeemTHUSD(amount: Decimalish, maxRedemptionRate?: Decimalish): Promise<SentLiquityTransaction<S, LiquityReceipt<R, RedemptionDetails>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of thUSD to be redeemed. |
|  maxRedemptionRate | [Decimalish](./lib-base.decimalish.md) | Maximum acceptable [redemption rate](./lib-base.fees.redemptionrate.md)<!-- -->. |

**Returns:**

Promise&lt;[SentLiquityTransaction](./lib-base.sentliquitytransaction.md)<!-- -->&lt;S, [LiquityReceipt](./lib-base.liquityreceipt.md)<!-- -->&lt;R, [RedemptionDetails](./lib-base.redemptiondetails.md)<!-- -->&gt;&gt;&gt;

## Remarks

If `maxRedemptionRate` is omitted, the current redemption rate (based on `amount`<!-- -->) plus 0.1% is used as maximum acceptable rate.

