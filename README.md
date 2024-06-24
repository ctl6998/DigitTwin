# STUE Digital Twin Project

## Overview
The STUE Digital Twin project aims to create a digital representation of a physical system using sensors and IoT devices. The system consists of hardware components such as Arduino and Raspberry Pi for sensor data collection, a Flask backend for data processing, and a NextJS front-end application for user interaction and visualization.

## Project Structure
The project is organized into the following main folders:

1. **Hardware**
2. **Flask-be**
3. **Stue-app**

### Hardware
This folder contains code and configurations for the hardware components, including Arduino and Raspberry Pi. The hardware setup collects data from various sensors and sends it to the backend for processing.

**Components:**
- **Arduino:** Used for interfacing with sensors.
- **Raspberry Pi:** Runs Python scripts to handle sensor data and communicate with the backend.

**Key Files:**
- `final06.py`: Python code to handle sensor data and communicate with the Firebase real-time database.

### Flask-be
The `Flask-be` folder contains the backend server code. The backend is built using Flask and acts as a proxy server to handle requests from the front-end, process sensor data, and predict the result with YOLOv6 model.

**Components:**
- **Flask Application:** Handles API requests, processes Firebase storage data with YOLOv6.
**Key Files:**
- `my_api.py`: Main Flask application file.
- `my_yolov6.py`: Custom YOLOv6 components for API initialization.
- `requirements.txt`: List of dependencies required for the Flask application.
- `setup.txt`: Configuration file for the Flask application.
- `flask-be/Flask-STUE.postman_collection.json`: JSON file for Postman to check API.

### Stue-app
The `Stue-app` folder contains the front-end application built using NextJS. This application provides a user interface for interacting with the digital twin, visualizing sensor data, and controlling the physical system.

**Components:**
- **NextJS Application:** Provides a responsive and interactive UI for users to monitor and control the system.

**Key Files:**
- `app/page.tsx`: Main entry point for the front-end application (login screen).
- `app/dashboard/page.tsx`: Main entry point for the dashboard.
- `components/`: Directory containing React components.
- `styles/`: Directory containing CSS and styling files.
- `package.json`: Lists dependencies and scripts for the NextJS application.

## Getting Started
(Additional Firebase SDK is required to initialize the connection, we can not share the SDK here as it is private information)
To get the project up and running, follow these steps:

### Hardware Setup
1. Connect the sensors to the Arduino.
2. Set up the Arduino with `.ino` file.
3. Set up the Raspberry Pi and ensure it has Python installed.
4. Run the `fianl06.py` on the Raspberry Pi to start collecting and sending sensor data to Firebase.

### Backend Setup
1. Navigate to the `flask-be` directory: cd flask-be
2. Install required package: pip instal setup.txt requirements.txt
3. Run the `my_apy.py`: python

### Frontend Setup
1. Navigate to the `stue-app` directory: cd stue-app
2. Install required package: npm install package.json
3. Run the application (developer mode): npm run dev

## Contact
For any questions or suggestions, please contact ctl6998 at chithanhle.0609@gmail.com.
