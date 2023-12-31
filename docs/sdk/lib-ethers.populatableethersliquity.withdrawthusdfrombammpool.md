<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-ethers](./lib-ethers.md) &gt; [PopulatableEthersLiquity](./lib-ethers.populatableethersliquity.md) &gt; [withdrawTHUSDFromBammPool](./lib-ethers.populatableethersliquity.withdrawthusdfrombammpool.md)

## PopulatableEthersLiquity.withdrawTHUSDFromBammPool() method

Withdraw thUSD from Bamm.

**Signature:**

```typescript
withdrawTHUSDFromBammPool(amount: Decimalish, overrides?: EthersTransactionOverrides): Promise<PopulatedEthersLiquityTransaction<BammDepositChangeDetails>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of thUSD to withdraw. |
|  overrides | [EthersTransactionOverrides](./lib-ethers.etherstransactionoverrides.md) |  |

**Returns:**

Promise&lt;[PopulatedEthersLiquityTransaction](./lib-ethers.populatedethersliquitytransaction.md)<!-- -->&lt;[BammDepositChangeDetails](./lib-base.bammdepositchangedetails.md)<!-- -->&gt;&gt;

## Remarks

As a side-effect, the transaction will also pay out the Stability Deposit's [collateral gain](./lib-base.bammdeposit.collateralgain.md)<!-- -->.

