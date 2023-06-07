<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [PopulatableLiquity](./lib-base.populatableliquity.md) &gt; [depositTHUSDInBammPool](./lib-base.populatableliquity.depositthusdinbammpool.md)

## PopulatableLiquity.depositTHUSDInBammPool() method

Make a new Bamm Deposit, or top up existing one.

**Signature:**

```typescript
depositTHUSDInBammPool(amount: Decimalish): Promise<PopulatedLiquityTransaction<P, SentLiquityTransaction<S, LiquityReceipt<R, BammDepositChangeDetails>>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of thUSD to add to new or existing deposit. |

**Returns:**

Promise&lt;[PopulatedLiquityTransaction](./lib-base.populatedliquitytransaction.md)<!-- -->&lt;P, [SentLiquityTransaction](./lib-base.sentliquitytransaction.md)<!-- -->&lt;S, [LiquityReceipt](./lib-base.liquityreceipt.md)<!-- -->&lt;R, [BammDepositChangeDetails](./lib-base.bammdepositchangedetails.md)<!-- -->&gt;&gt;&gt;&gt;
