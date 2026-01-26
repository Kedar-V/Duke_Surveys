import { PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

export function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  );
}
