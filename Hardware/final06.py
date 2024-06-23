import serial
import time
import firebase_admin
from firebase_admin import credentials, db
import threading
import cv2
import os
import numpy as np
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from firebase_admin import storage, initialize_app, credentials
import random
import os

def clear_terminal():
        os.system('clear')

# Path to the Firebase credentials JSON file
cred_path = 'credentials.json'

# Initialize Firebase
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://sensor-ethic-default-rtdb.asia-southeast1.firebasedatabase.app/',
    'storageBucket': 'sensor-ethic.appspot.com'
})

# Reference to the Firebase Realtime Database
ref = db.reference('sensor_data')

# Kalman Filter class
class KalmanFilter:
    def __init__(self, process_variance, measurement_variance, estimated_measurement_variance):
        self.process_variance = process_variance
        self.measurement_variance = measurement_variance
        self.estimated_measurement_variance = estimated_measurement_variance
        self.posteri_estimate = 0.0
        self.posteri_error_estimate = 1.0

    def update(self, measurement):
        priori_estimate = self.posteri_estimate
        priori_error_estimate = self.posteri_error_estimate + self.process_variance

        blending_factor = priori_error_estimate / (priori_error_estimate + self.measurement_variance)
        self.posteri_estimate = priori_estimate + blending_factor * (measurement - priori_estimate)
        self.posteri_error_estimate = (1 - blending_factor) * priori_error_estimate

        return self.posteri_estimate

# Initialize Kalman Filters for temperature, humidity, gas, and distance
kalman_filter_temp = KalmanFilter(1, 1, 0.01)
kalman_filter_hum = KalmanFilter(1, 1, 0.01)
kalman_filter_gas = KalmanFilter(0.5, 0.5, 0.005)
kalman_filter_distance = KalmanFilter(2, 2, 0.01)

# Define the serial port and baud rate
serial_port = '/dev/ttyACM0'  # Change this to the appropriate port, e.g., '/dev/ttyACM0'
baud_rate = 9600

# Initialize serial connection
ser = serial.Serial(serial_port, baud_rate, timeout=1)

# Allow time for the connection to establish
time.sleep(2)
stfan = 0
stheater = 0
sthumidifier = 0
stlight = 0
stsys = 0
prev_stfan = 0
prev_stheater = 0
prev_sthumidifier = 0
prev_stlight = 0
prev_stsys = 0
prev_distance = 0
distance = 0
change_triggered = 0
def read_arduino_data():
    try:
        # Read a line of data from the Arduino
        line = ser.readline().decode('utf-8').strip()
        return line
    except serial.SerialException as e:
        print(f"Error reading data: {e}")
        return None

def limit_entries(ref, limit=20):
    snapshot = ref.order_by_key().get()
    keys = list(snapshot.keys())
    if len(keys) > limit:
        for key in keys[:-limit]:
            ref.child(key).delete()
def capture_image():
    cap = cv2.VideoCapture(0)  # Adjust the argument based on your camera setup
    ret, frame = cap.read()
    cap.release()
    if not ret:
        raise RuntimeError("Failed to capture image")
    return frame

# Function to encrypt data using AES encryption
def encrypt_data(data, key):
    # Padding data to be multiple of block size (16 bytes for AES)
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data) + padder.finalize()

    backend = default_backend()
    cipher = Cipher(algorithms.AES(key), modes.CBC(b'\0' * 16), backend=backend)
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    return ciphertext

# Function to upload encrypted image to Firebase Storage
def upload_image_to_firebase(image_data):
    bucket = storage.bucket()
    blob = bucket.blob('encrypted_image.jpg')

    # Upload encrypted image data
    blob.upload_from_string(image_data, content_type='image/jpeg')

    print('Image uploaded to Firebase Storage')

# Main function to handle the process when distance == 1
def process_image_if_distance_is_1(distance, prev_distance):
    if distance == 1 and prev_distance == 0:
        # Capture image (simulated using OpenCV here)
        image = capture_image()
        
        # Convert image to bytes
        _, image_bytes = cv2.imencode('.jpg', image)
        image_bytes = image_bytes.tobytes()

        # Encrypt image
        encryption_key = b'16_byte_enc_key!'  # AES key must be 16, 24, or 32 bytes long
        encrypted_image = encrypt_data(image_bytes, encryption_key)

        # Upload encrypted image to Firebase Storage
        upload_image_to_firebase(encrypted_image)
        
        return 1
    return 0

def read_control_data():
    global stfan, stheater, sthumidifier, stlight, stsys
    global prev_stfan, prev_stheater, prev_sthumidifier, prev_stlight, prev_stsys

    try:
        # Get the values from the control sub-branch
        control_ref = ref.child('control')
        control_data = control_ref.get()

        # Extract the values and save them to the variables
        stfan = control_data.get('enable_fan')
        stheater = control_data.get('enable_heater')
        sthumidifier = control_data.get('enable_humidifier')
        stlight = control_data.get('enable_light')
        stsys = control_data.get('status')

        print(f"Fan: {stfan}, Heater: {stheater}, Humidifier: {sthumidifier}, Light: {stlight}, System: {stsys}")

        # Check if any of the control variables have changed
        if (stfan != prev_stfan or stheater != prev_stheater or
            sthumidifier != prev_sthumidifier or stlight != prev_stlight or
            stsys != prev_stsys):
            
            # If there's a change, send the data to Arduino
            message = f"{stlight},{stfan},{stheater},{sthumidifier},{stsys}\n"
            try:
                ser.write(message.encode('utf-8'))
                ser.flush()
                print("Data sent to Arduino:", message)
            except Exception as e:
                print(f"Error writing to serial port: {e}")

            # Update the previous values
            prev_stfan = stfan
            prev_stheater = stheater
            prev_sthumidifier = sthumidifier
            prev_stlight = stlight
            prev_stsys = stsys
        else:
            print("No change in control variables.")
    except Exception as e:
        print(f"Error reading control data: {e}")

def main():
    last_cleared_time = time.time()
    next_update_time = time.time() + 3  # Initialize next update time for Humidity, Temperature, and Gas
    next_time1 = time.time() + 4 
    distance = 0
    change_triggered = 0
    while True:
        data = read_arduino_data()
        if data:
            print(f"Raw data received: '{data}'")  # Debug output to see the raw data
            try:
                # Parse the data using known format
                prev_distance = distance
                parts = data.split()
                temperature = float(parts[1])
                humidity = float(parts[3])
                gas = float(parts[5])
                distance = float(parts[7])
                check_cam = process_image_if_distance_is_1(distance, prev_distance)
                if check_cam == 1:
                    change_triggered += 1
                    if change_triggered == 100:
                        change_triggered = 1
                    ref.child('camera-triggered').set(change_triggered)
                    
                # Apply Kalman filter to temperature, humidity, and gas
                filtered_temperature = kalman_filter_temp.update(temperature)
                filtered_humidity = kalman_filter_hum.update(humidity)
                #filtered_gas = kalman_filter_gas.update(gas)
                
                # Upload data for Humidity, Temperature, and Gas every 20 seconds
                current_time = time.time()
                if current_time - last_cleared_time >= 10:
                    clear_terminal()
                    last_cleared_time = current_time
                if current_time >= next_update_time:
                    data_to_upload = {
                        'raw': {
                            'temperature': temperature,
                            'humidity': humidity,
                            'gas': gas,
                            'distance': distance,
                            'timestamp': current_time
                        },
                        'filtered': {
                            'temperature': filtered_temperature,
                            'humidity': filtered_humidity,
                            'gas': gas,
                            'distance': distance,
                            'timestamp': current_time
                        }
                    }
                    timestamp_str = str(int(current_time))
                    ref.child('real_time_db').child(timestamp_str).set(data_to_upload)
                    ref.child('real_time_db').child(timestamp_str).set(data_to_upload)

                    # Limit entries to the last 20 under 'real_time_db'
                    limit_entries(ref.child('real_time_db'), limit=20)

                    # Limit entries to the last 20 under 'real-time-db'
                    limit_entries(ref.child('real_time_db'), limit=20)

                    # Print the data to the console for confirmation
                    print(f"Uploaded data: {data_to_upload}")
                    next_update_time = current_time + 3
                    

            except (IndexError, ValueError) as e:
                print(f"Error parsing data: {e}")
        else:
            print("No data received. Retrying...")
        
        current_time1 = time.time()
        if current_time1 >= next_time1:
            read_control_data()
            next_time1 = current_time1 + 7
        
        time.sleep(0.1)  # Adjust as necessary




if __name__ == '__main__':
    main()
