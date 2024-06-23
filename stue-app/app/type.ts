export interface TemperatureData {
  timestamp: number;
  temperatureRaw: number;
  temperatureFilter: number;
}

export interface HumidityData {
  timestamp: number;
  humidityRaw: number;
  humidityFilter: number;
}

export interface GasData {
  gas: number;
  timestamp: number;
}

export interface ControlData {
  status: number | boolean;
  enable_fan: number | boolean;
  enable_light: number | boolean;
  enable_heater: number | boolean;
  enable_humidifier: number | boolean;
}