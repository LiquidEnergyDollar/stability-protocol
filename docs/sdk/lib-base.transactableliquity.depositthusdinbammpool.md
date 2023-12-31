<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [TransactableLiquity](./lib-base.transactableliquity.md) &gt; [depositTHUSDInBammPool](./lib-base.transactableliquity.depositthusdinbammpool.md)

## TransactableLiquity.depositTHUSDInBammPool() method

Make a new Bamm Deposit, or top up existing one.

**Signature:**

```typescript
depositTHUSDInBammPool(amount: Decimalish): Promise<BammDepositChangeDetails>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of thUSD to add to new or existing deposit. |

**Returns:**

Promise&lt;[BammDepositChangeDetails](./lib-base.bammdepositchangedetails.md)<!-- -->&gt;

## Exceptions

Throws [TransactionFailedError](./lib-base.transactionfailederror.md) in case of transaction failure.

As a side-effect, the transaction will also pay out an existing Stability Deposit's [collateral gain](./lib-base.bammdeposit.collateralgain.md)

