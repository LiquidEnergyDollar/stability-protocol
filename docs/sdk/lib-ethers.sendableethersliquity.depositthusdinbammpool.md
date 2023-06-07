<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-ethers](./lib-ethers.md) &gt; [SendableEthersLiquity](./lib-ethers.sendableethersliquity.md) &gt; [depositTHUSDInBammPool](./lib-ethers.sendableethersliquity.depositthusdinbammpool.md)

## SendableEthersLiquity.depositTHUSDInBammPool() method

Make a new Bamm Deposit, or top up existing one.

**Signature:**

```typescript
depositTHUSDInBammPool(amount: Decimalish, overrides?: EthersTransactionOverrides): Promise<SentEthersLiquityTransaction<BammDepositChangeDetails>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of thUSD to add to new or existing deposit. |
|  overrides | [EthersTransactionOverrides](./lib-ethers.etherstransactionoverrides.md) |  |

**Returns:**

Promise&lt;[SentEthersLiquityTransaction](./lib-ethers.sentethersliquitytransaction.md)<!-- -->&lt;[BammDepositChangeDetails](./lib-base.bammdepositchangedetails.md)<!-- -->&gt;&gt;
