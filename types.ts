export interface Vector3 {
  x: number | null;
  y: number | null;
  z: number | null;
}

export interface Euler {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

export interface GeolocationData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface NetworkInfo {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

// Extend Navigator for non-standard APIs
export interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
  connection?: NetworkInfo;
}

export interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}

// Augment standard events for iOS properties
declare global {
  interface DeviceOrientationEvent {
    webkitCompassHeading?: number;
  }
  interface DeviceMotionEvent {
    // requestPermission is a static method on the constructor, handled via type assertion in usage.
  }
}