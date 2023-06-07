<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [SendableLiquity](./lib-base.sendableliquity.md) &gt; [withdrawTHUSDFromBammPool](./lib-base.sendableliquity.withdrawthusdfrombammpool.md)

## SendableLiquity.withdrawTHUSDFromBammPool() method

Withdraw thUSD from Bamm.

**Signature:**

```typescript
withdrawTHUSDFromBammPool(amount: Decimalish): Promise<SentLiquityTransaction<S, LiquityReceipt<R, BammDepositChangeDetails>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of thUSD to withdraw. |

**Returns:**

Promise&lt;[SentLiquityTransaction](./lib-base.sentliquitytransaction.md)<!-- -->&lt;S, [LiquityReceipt](./lib-base.liquityreceipt.md)<!-- -->&lt;R, [BammDepositChangeDetails](./lib-base.bammdepositchangedetails.md)<!-- -->&gt;&gt;&gt;

## Remarks

As a side-effect, the transaction will also pay out the Stability Deposit's [collateral gain](./lib-base.bammdeposit.collateralgain.md)<!-- -->.
