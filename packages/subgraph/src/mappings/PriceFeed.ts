import { LastGoodPrice } from "../../generated/PriceFeed/PriceFeed";

import { updatePrice } from "../entities/SystemState";

export function handleLastGoodPrice(event: LastGoodPrice): void {
  updatePrice(event, event.params.newPrice);
}
