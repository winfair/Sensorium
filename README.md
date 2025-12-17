# Sensorium

Sensorium is a comprehensive sensor dashboard visualizing real-time data from your device's hardware. It is optimized for iOS and macOS devices, providing insights into motion, orientation, location, and system status through a modern, Apple-inspired interface.

## Features

- **Motion & Accelerometer**: Real-time visualization of 3-axis acceleration and gravity data using responsive charts.
- **Gyroscope & Compass**: 3D orientation tracking and true magnetic compass heading (supports iOS `webkitCompassHeading`).
- **Geolocation**: High-accuracy GPS coordinates, altitude, speed, and heading tracking.
- **Media Hardware**: Detection and live preview of camera and microphone inputs.
- **System Status**: Real-time monitoring of battery level, charging status, network connection type, and hardware concurrency.

## Technologies

- **React 19**: Core UI library.
- **Tailwind CSS**: Utility-first styling for the iOS-like aesthetic.
- **Recharts**: Performance-optimized data visualization for sensor streams.
- **Lucide React**: Clean, consistent iconography.
- **Native Web APIs**: Direct integration with `DeviceMotionEvent`, `DeviceOrientationEvent`, `Navigator.geolocation`, and `Navigator.mediaDevices`.

## Getting Started

This application requires a secure context (**HTTPS**) to access most device sensors (Camera, Microphone, Geolocation, Orientation).

1. Clone the repository.
2. Serve the directory using any static web server.
3. Open on a mobile device (iOS/Safari recommended for full sensor support).
4. Grant permissions when prompted to enable sensor data streams.

## Privacy

All data is processed strictly locally on the client device. No sensor data is collected, stored, or transmitted to external servers.