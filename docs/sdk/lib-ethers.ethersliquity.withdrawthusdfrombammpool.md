<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-ethers](./lib-ethers.md) &gt; [EthersLiquity](./lib-ethers.ethersliquity.md) &gt; [withdrawTHUSDFromBammPool](./lib-ethers.ethersliquity.withdrawthusdfrombammpool.md)

## EthersLiquity.withdrawTHUSDFromBammPool() method

Withdraw thUSD from Bamm.

**Signature:**

```typescript
withdrawTHUSDFromBammPool(amount: Decimalish, overrides?: EthersTransactionOverrides): Promise<BammDepositChangeDetails>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of thUSD to withdraw. |
|  overrides | [EthersTransactionOverrides](./lib-ethers.etherstransactionoverrides.md) |  |

**Returns:**

Promise&lt;[BammDepositChangeDetails](./lib-base.bammdepositchangedetails.md)<!-- -->&gt;

## Exceptions

Throws [EthersTransactionFailedError](./lib-ethers.etherstransactionfailederror.md) in case of transaction failure. Throws [EthersTransactionCancelledError](./lib-ethers.etherstransactioncancellederror.md) if the transaction is cancelled or replaced.

## Remarks

As a side-effect, the transaction will also pay out the Stability Deposit's [collateral gain](./lib-base.bammdeposit.collateralgain.md)<!-- -->.

