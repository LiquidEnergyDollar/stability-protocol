import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { Decimal, THUSD_MINIMUM_NET_DEBT, Trove } from "@liquity/lib-base";

import App from "./App";

const params = { depositCollateral: Decimal.from(20), borrowTHUSD: THUSD_MINIMUM_NET_DEBT };
const trove = Trove.create(params);

console.log(`${trove}`);

/*
 * Just a quick and dirty testcase to prove that the approach can work in our CI pipeline.
 */
test("there's no smoke", async () => {
  const { getByText, getByLabelText, findByText } = render(<App />);

  expect(await findByText(/open a vault/i)).toBeInTheDocument();

  fireEvent.click(getByText(/open a vault/i));
  fireEvent.click(getByText(/open a vault/i));
  fireEvent.click(getByLabelText(/collateral/i));
  fireEvent.change(getByLabelText(/^collateral$/i), { target: { value: `${trove.collateral}` } });
  fireEvent.click(getByLabelText(/^borrow$/i));
  fireEvent.change(getByLabelText(/^borrow$/i), { target: { value: `${trove.debt}` } });

  const confirmButton = await findByText(/confirm/i);
  fireEvent.click(confirmButton);

  expect(await findByText(/adjust/i)).toBeInTheDocument();
});
