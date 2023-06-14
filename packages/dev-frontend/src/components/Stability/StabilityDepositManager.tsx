import { useCallback, useEffect } from "react";
import { Button, Flex, Link } from "theme-ui";

import { Decimal, Decimalish, LiquityStoreState } from "@liquity/lib-base";
import { ThresholdStoreUpdate, useThresholdReducer, useThresholdSelector } from "@liquity/lib-react";

import { useMyTransactionState } from "../Transaction";

import { StabilityDepositEditor } from "./StabilityDepositEditor";
import { StabilityDepositAction } from "./StabilityDepositAction";
import { useStabilityView } from "./context/StabilityViewContext";
import {
  selectForStabilityDepositChangeValidation,
  validateStabilityDepositChange
} from "./validation/validateStabilityDepositChange";
import { checkTransactionCollateral } from "../../utils/checkTransactionCollateral";

const init = ({ stabilityDeposit }: LiquityStoreState) => ({
  originalDeposit: stabilityDeposit,
  editedUSD: stabilityDeposit.currentTHUSD,
  changePending: false
});

type StabilityDepositManagerState = ReturnType<typeof init>;
type StabilityDepositManagerAction =
  | ThresholdStoreUpdate
  | { type: "startChange" | "finishChange" | "revert" }
  | { type: "setDeposit"; newValue: Decimalish };

const reduceWith = (action: StabilityDepositManagerAction) => (
  state: StabilityDepositManagerState
): StabilityDepositManagerState => reduce(state, action);

const finishChange = reduceWith({ type: "finishChange" });
const revert = reduceWith({ type: "revert" });

const reduce = (
  state: StabilityDepositManagerState,
  action: StabilityDepositManagerAction
): StabilityDepositManagerState => {

  const { originalDeposit, editedUSD, changePending } = state;

  switch (action.type) {
    case "startChange": {
      console.log("changeStarted");
      return { ...state, changePending: true };
    }
    case "finishChange":
      return { ...state, changePending: false };
    case "setDeposit":
      return { ...state, editedUSD: Decimal.from(action.newValue) };
    case "revert":
      return { ...state, editedUSD: originalDeposit.currentTHUSD };
    case "updateStore": {
      const {
        stateChange: { stabilityDeposit: updatedDeposit }
      } = action;
      if (!updatedDeposit) {
        return state;
      }
      
      const newState = { ...state, originalDeposit: updatedDeposit };

      const changeCommitted =
        updatedDeposit.initialTHUSD.lt(originalDeposit.initialTHUSD) ||
        updatedDeposit.currentTHUSD.lt(originalDeposit.currentTHUSD) ||
        updatedDeposit.collateralGain.lt(originalDeposit.collateralGain);

      if (changePending && changeCommitted) {
        return finishChange(revert(newState));
      }

      return {
        ...newState,
        editedUSD: updatedDeposit.apply(originalDeposit.whatChanged(editedUSD))
      };
    }
  }
};

const transactionId = "stability-deposit";

type StabilityDepositManagerProps = {
  version: string;
  collateral: string;
  isMintList: boolean;
  children?: React.ReactNode;
}

export const StabilityDepositManager = (props: StabilityDepositManagerProps): JSX.Element  => {
  const { version, collateral, isMintList } = props;
  const [{ originalDeposit, editedUSD, changePending }, dispatch] = useThresholdReducer(version, collateral, reduce, init, );
  const thresholdSelectorStores = useThresholdSelector(selectForStabilityDepositChangeValidation);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });

  const isStabilityPools = thresholdStore?.store!.isStabilityPools;
  const { dispatchEvent } = useStabilityView();

  const handleCancel = useCallback(() => {
    dispatchEvent("CANCEL_PRESSED", version, collateral);
  }, [version, collateral, dispatchEvent]);

  const [validChange] = validateStabilityDepositChange(
    version,
    collateral,
    isMintList,
    originalDeposit,
    editedUSD,
    thresholdStore?.store!,
    undefined,
    undefined,
  );

  const myTransactionState = useMyTransactionState(transactionId, version, collateral);
  const isCollateralChecked = checkTransactionCollateral(
    myTransactionState,
    version,
    collateral
  );

  useEffect(() => {
    if (
      isCollateralChecked &&
      (myTransactionState.type === "waitingForApproval" ||
      myTransactionState.type === "waitingForConfirmation")
    ) {
      dispatch({ type: "startChange" });
    } else if (isCollateralChecked && (myTransactionState.type === "failed" || myTransactionState.type === "cancelled")) {
      dispatch({ type: "finishChange" });
    } else if (isCollateralChecked && (myTransactionState.type === "confirmedOneShot")) {
      dispatchEvent("DEPOSIT_CONFIRMED", version, collateral);
    }
  }, [version, collateral, isCollateralChecked, myTransactionState.type, dispatch, dispatchEvent]);

  return (
    <StabilityDepositEditor
      version={version}
      collateral={collateral}
      isMintList={isMintList}
      originalDeposit={originalDeposit}
      editedUSD={editedUSD}
      changePending={changePending}
      dispatch={dispatch}
    >
      <Flex variant="layout.actions" sx={{ flexDirection: "column" }}>
        {validChange ? (
          <StabilityDepositAction 
            version={version} 
            collateral={collateral} 
            transactionId={transactionId} 
            change={validChange}
            isStabilityPools={isStabilityPools}
          >
            Confirm
          </StabilityDepositAction>
        ) : (
          <Button disabled>Confirm</Button>
        )}
        <Button variant="cancel" onClick={handleCancel} sx={{ borderRadius: "12px", mt: 3 }}>
          Cancel
        </Button>
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
      </Flex>
    </StabilityDepositEditor>
  );
};
