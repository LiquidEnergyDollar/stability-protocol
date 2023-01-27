import { Decimal } from "@liquity/lib-base";

type CoinGeckoSimplePriceResponse<T extends string, U extends string> = {
  [P in T]: {
    [Q in U]: number;
  };
};

const hasProp = <T, P extends string>(o: T, p: P): o is T & { [_ in P]: unknown } => p in o;

const validateCoinGeckoSimplePriceResponse = <T extends string, U extends string>(
  expectedCoinIds: readonly T[],
  expectedCurrencies: readonly U[],
  body: unknown
): CoinGeckoSimplePriceResponse<T, U> => {
  if (typeof body !== "object" || body === null) {
    throw new Error(`unexpected response from CoinGecko`);
  }

  for (const coinId of expectedCoinIds) {
    if (!hasProp(body, coinId)) {
      throw new Error(`coin "${coinId}" missing from CoinGecko response`);
    }

    const coinPrices = body[coinId];

    for (const currency of expectedCurrencies) {
      if (!hasProp(coinPrices, currency)) {
        throw new Error(`currency "${currency}" missing from CoinGecko response`);
      }

      if (typeof coinPrices[currency] !== "number") {
        throw new Error(`price of coin "${coinId}" in currency "${currency}" is not a number`);
      }
    }
  }

  return body as CoinGeckoSimplePriceResponse<T, U>;
};

const fetchCoinGeckoSimplePrice = async <T extends string, U extends string>(
  coinIds: readonly T[],
  vsCurrencies: readonly U[]
): Promise<CoinGeckoSimplePriceResponse<T, U>> => {
  const simplePriceUrl =
    "https://api.coingecko.com/api/v3/simple/price?" +
    new URLSearchParams({
      ids: coinIds.join(","),
      vs_currencies: vsCurrencies.join(",")
    });

  const response = await fetch(simplePriceUrl, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    console.error(response.status)
  }

  return validateCoinGeckoSimplePriceResponse(coinIds, vsCurrencies, await response.json());
};

export type tokenPriceResponse = {
  tokenPriceUSD: Decimal;
}

export const fetchCoinGeckoPrice = async ( coingeckoId: string ): Promise<tokenPriceResponse> => {
  const response = await fetchCoinGeckoSimplePrice([coingeckoId] as const, ["usd"] as const);
  return {
    tokenPriceUSD: Decimal.from(response[coingeckoId].usd),
  };
};
