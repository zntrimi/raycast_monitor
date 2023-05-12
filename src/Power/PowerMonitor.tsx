import { Color, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import {
  getBatteryCondition,
  getBatteryLevel,
  getBatteryTime,
  getCycleCount,
  getIsCharging,
  getMaxBatteryCapacity,
  getChargingWattage,
  isValidTime,
} from "./PowerUtils";
import { useInterval } from "usehooks-ts";
import { ExecError, PowerMonitorState } from "../Interfaces";

const PowerMonitor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ExecError>();
  const [state, setState] = useState<PowerMonitorState>({
    batteryLevel: "Loading...",
    isCharging: false,
    cycleCount: "Loading...",
    batteryCondition: "Loading...",
    chargingWattage: "Loading...",
    maxBatteryCapacity: "Loading...",
    batteryTime: "Calculating...",
  });

  const updateState = async () => {
    setIsLoading(true);
    try {
      const newState = await powerMonitor.getState();
      setState(newState);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateState();
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, []);

  useInterval(async () => {
    try {
      const newBatteryLevel = await getBatteryLevel();
      const newIsCharging = await getIsCharging();
      const newBatteryTime = await getBatteryTime();
      const newChargingWattage = await getChargingWattage();

      setState((prevState) => {
        return {
          ...prevState,
          batteryLevel: newBatteryLevel,
          isCharging: newIsCharging,
          batteryTime: newBatteryTime,
          chargingWattage: newChargingWattage,
        };
      });
      setIsLoading(false);
    } catch (error: any) {
      setError(error);
    }
  }, 1000);

  useEffect(() => {
    (async () => {
      try {
        const newCycleCount = await getCycleCount();
        const newBatteryCondition = await getBatteryCondition();
        const newMaxBatteryCapacity = await getMaxBatteryCapacity();
        const newChargingWattage = await getChargingWattage();

        setState((prevState) => {
          return {
            ...prevState,
            cycleCount: newCycleCount,
            batteryCondition: newBatteryCondition,
            maxBatteryCapacity: newMaxBatteryCapacity,
            chargingWattage: newChargingWattage,
          };
        });
      } catch (error: any) {
        setError(error);
      }
    })();
  }, []);

  // useEffect(() => {
  //   if (error) {
  //     showToast({
  //       style: Toast.Style.Failure,
  //       title: "Couldn't fetch Power Info [Error Code: " + error.code + "]",
  //       message: error.stderr,
  //     });
  //   }
  // }, [error]);

  return (
    <List.Item
      title={`Power`}
      icon={{ source: "lightning.png", tintColor: Color.Yellow }}
      accessoryTitle={isLoading ? "Loading..." : `${state.batteryLevel}%`}
      detail={
        <List.Item.Detail
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Battery Level" text={state.batteryLevel + "%"} />
              <List.Item.Detail.Metadata.Label title="Charging" text={state.isCharging ? "Yes" : "No"} />
              <List.Item.Detail.Metadata.Label title="Cycle Count" text={state.cycleCount} />
              <List.Item.Detail.Metadata.Label title="Condition" text={state.batteryCondition} />
              <List.Item.Detail.Metadata.Label title="Wattage" text={state.chargingWattage} />
              <List.Item.Detail.Metadata.Label title="Maximum Battery Capacity" text={state.maxBatteryCapacity} />
              <List.Item.Detail.Metadata.Label
title={state.isCharging ? "Time to charge" : "Time to discharge"}
text={isValidTime(state.batteryTime) ? state.batteryTime : "Calculating..."}
/>
</List.Item.Detail.Metadata>
}
/>
}
/>
);
};
export default PowerMonitor;