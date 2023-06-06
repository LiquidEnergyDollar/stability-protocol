import { useCallback, useEffect } from "react";
import { Button, Flex, Link } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState, Decimal, Trove as Vault, Decimalish, THUSD_MINIMUM_DEBT } from "@liquity/lib-base";

import { ThresholdStoreUpdate, useThresholdReducer, useThresholdSelector} from "@liquity/lib-react";

import { ActionDescription } from "../ActionDescription";
import { useMyTransactionState } from "../Transaction";

import { VaultEditor } from "./VaultEditor";
import { VaultAction } from "./VaultAction";
import { useVaultView } from "./context/VaultViewContext";

import {
  selectForVaultChangeValidation,
  validateVaultChange
} from "./validation/validateVaultChange";
import { checkTransactionCollateral } from "../../utils/checkTransactionCollateral";

const init = ({ trove }: ThresholdStoreState) => ({
  original: trove,
  edited: new Vault(trove.collateral, trove.debt),
  changePending: false,
  debtDirty: false,
  addedMinimumDebt: false
});

type VaultManagerState = ReturnType<typeof init>;
type VaultManagerAction =
  | ThresholdStoreUpdate
  | { type: "startChange" | "finishChange" | "revert" | "addMinimumDebt" | "removeMinimumDebt" }
  | { type: "setCollateral" | "setDebt"; newValue: Decimalish };

const reduceWith = (action: VaultManagerAction) => (state: VaultManagerState): VaultManagerState =>
  reduce(state, action);

const addMinimumDebt = reduceWith({ type: "addMinimumDebt" });
const removeMinimumDebt = reduceWith({ type: "removeMinimumDebt" });
const finishChange = reduceWith({ type: "finishChange" });
const revert = reduceWith({ type: "revert" });

const reduce = (state: VaultManagerState, action: VaultManagerAction): VaultManagerState => {
  const { original, edited, changePending, debtDirty, addedMinimumDebt } = state;

  switch (action.type) {
    case "startChange": {
      console.log("starting change");
      return { ...state, changePending: true };
    }

    case "finishChange":
      return { ...state, changePending: false };

    case "setCollateral": {
      const newCollateral = Decimal.from(action.newValue);

      const newState = {
        ...state,
        edited: edited.setCollateral(newCollateral)
      };

      if (!debtDirty) {
        if (edited.isEmpty && newCollateral.nonZero) {
          return addMinimumDebt(newState);
        }
        if (addedMinimumDebt && newCollateral.isZero) {
          return removeMinimumDebt(newState);
        }
      }
      return newState;
    }

    case "setDebt":
      return {
        ...state,
        edited: edited.setDebt(action.newValue),
        debtDirty: true
      };

    case "addMinimumDebt":
      return {
        ...state,
        edited: edited.setDebt(THUSD_MINIMUM_DEBT),
        addedMinimumDebt: true
      };

    case "removeMinimumDebt":
      return {
        ...state,
        edited: edited.setDebt(0),
        addedMinimumDebt: false
      };

    case "revert":
      return {
        ...state,
        edited: new Vault(original.collateral, original.debt),
        debtDirty: false,
        addedMinimumDebt: false
      };

    case "updateStore": {
      const {
        newState: { trove },
        stateChange: { troveBeforeRedistribution: changeCommitted }
      } = action;

      const newState = {
        ...state,
        original: trove
      };

      if (changePending && changeCommitted) {
        return finishChange(revert(newState));
      }

      const change = original.whatChanged(edited, 0);

      if (
        (change?.type === "creation" && !trove.isEmpty) ||
        (change?.type === "closure" && trove.isEmpty)
      ) {
        return revert(newState);
      }
      return { ...newState, edited: trove.apply(change, 0) };
    }
  }
};

const feeFrom = (original: Vault, edited: Vault, borrowingRate: Decimal): Decimal => {
  const change = original.whatChanged(edited, borrowingRate);

  if (change && change.type !== "invalidCreation" && change.params.borrowTHUSD) {
    return change.params.borrowTHUSD.mul(borrowingRate);
  } else {
    return Decimal.ZERO;
  }
};

const select = (state: ThresholdStoreState) => ({
  fees: state.fees,
  validationContext: selectForVaultChangeValidation(state),
  symbol: state.symbol
});

const transactionIdPrefix = "vault-";
const transactionIdMatcher = new RegExp(`^${transactionIdPrefix}`);

type VaultManagerProps = {
  version: string,
  collateral: string,
  isMintList: boolean;
  collateralAmount?: Decimalish;
  debt?: Decimalish;
};

export const  VaultManager = (props: VaultManagerProps): JSX.Element => {
  const { version, collateral, collateralAmount, debt } = props;
  const [{ original, edited, changePending }, dispatch] = useThresholdReducer(version, collateral, reduce, init);
  const thresholdSelectorStores = useThresholdSelector(select);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const fees = store.fees;
  const symbol = store.symbol;
  const validationContext = store.validationContext;

  useEffect(() => {
    if (collateralAmount !== undefined) {
      dispatch({ type: "setCollateral", newValue: collateralAmount });
    }
    if (debt !== undefined) {
      dispatch({ type: "setDebt", newValue: debt });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collateralAmount, debt, dispatch]);

  const borrowingRate = fees.borrowingRate();
  const maxBorrowingRate = borrowingRate.add(0.005); // TODO slippage tolerance

  const [validChange, description] = validateVaultChange(
    original,
    edited,
    borrowingRate,
    validationContext,
  );

  const { dispatchEvent } = useVaultView();

  const handleCancel = useCallback(() => {
    dispatchEvent("CANCEL_ADJUST_VAULT_PRESSED", version, collateral);
  }, [dispatchEvent, version, collateral]);

  const openingNewVault = original.isEmpty;

  const myTransactionState = useMyTransactionState(transactionIdMatcher, version, collateral);
  const isCollateralChecked = checkTransactionCollateral(
    myTransactionState,
    version,
    collateral
  );

  useEffect(() => {
    if (!isCollateralChecked) {
      return;
    }

    if (myTransactionState.type === "waitingForApproval" || myTransactionState.type === "waitingForConfirmation") {
      dispatch({ type: "startChange" });
    } else if (myTransactionState.type === "failed" || myTransactionState.type === "cancelled")
    {
      dispatch({ type: "finishChange" });
    } else if (myTransactionState.type === "confirmedOneShot") {
      
      if (myTransactionState.id === `${transactionIdPrefix}closure`) {
        dispatchEvent("VAULT_CLOSED", version, collateral);
      } else {
        dispatchEvent("VAULT_ADJUSTED", version, collateral);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollateralChecked, myTransactionState.type, dispatch, dispatchEvent, version, collateral]);

  return (
    <VaultEditor
      version={version}
      collateral={collateral}
      original={original}
      edited={edited}
      fee={feeFrom(original, edited, borrowingRate)}
      borrowingRate={borrowingRate}
      changePending={changePending}
      dispatch={dispatch}
    >
      {description ??
        (openingNewVault ? (
          <ActionDescription>
            Start by entering the amount of { symbol } you'd like to deposit as collateral.
          </ActionDescription>
        ) : (
          <ActionDescription>
            Adjust your Vault by modifying its collateral, debt, or both.
          </ActionDescription>
        ))}
      <Flex variant="layout.actions" sx={{ flexDirection: "column" }}>
        {validChange ? (
          <VaultAction
            version={version}
            collateral={collateral}
            transactionId={`${transactionIdPrefix}${validChange.type}`}
            change={validChange}
            maxBorrowingRate={maxBorrowingRate}
            borrowingFeeDecayToleranceMinutes={60}
          >
            Confirm
          </VaultAction>
        ) : (
          <Button disabled>Confirm</Button>
        )}
        <Button variant="cancel" onClick={handleCancel} sx={{ borderRadius: "12px", mt: 3 }}>
          Cancel
        </Button>
      </Flex>
      <Flex sx={{ 
        alignSelf: "center",
        fontSize: 11,
        fontWeight: "body",
        justifyContent: "space-between",
        width: "100%",
        px: "1em",
        pt: "1em",
        display: "none !important"
      }}>
        <Flex>
          <Link variant="cardLinks" href="https://docs.threshold.network/fundamentals/threshold-usd" target="_blank">Read about</Link>
          in the documentation
        </Flex>
        <Flex>Deployment version: {version}</Flex>
      </Flex>
    </VaultEditor>
  );
};
