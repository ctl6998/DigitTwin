from flask import Flask, jsonify, url_for
from flask_cors import CORS, cross_origin
from flask import request, session, render_template, redirect
from flask import make_response, render_template, session, flash
import os
import my_yolov6
import cv2
import pyrebase
import firebase_admin
from firebase_admin import credentials, auth, db
import jwt
from datetime import datetime, timedelta
import time
from functools import wraps
from firebase_admin import storage
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend


# Khởi tạo Flask Server Backend
app = Flask(__name__)

# Environment
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['UPLOAD_FOLDER'] = "static"
app.secret_key = 'cf5542a7bd3f44b0a1d31f8b20fabdd0' #UUID

# Apply Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

# Apply Flask Pyrebae config
config = {
  "apiKey": "AIzaSyCc7y56Rr9mHmWJdEJOG-whJUS9GQ21FOY",
  "authDomain": "sensor-ethic.firebaseapp.com",
  "databaseURL": "https://sensor-ethic-default-rtdb.asia-southeast1.firebasedatabase.app",
  "projectId": "sensor-ethic",
  "storageBucket": "sensor-ethic.appspot.com",
  "messagingSenderId": "1037106927899",
  "appId": "1:1037106927899:web:e4fd0db7ad34caf87fdbbe",
  "measurementId": "G-RFPJWC8VHH"
};
firebase = pyrebase.initialize_app(config)
pyre_auth = firebase.auth()
pyre_storage = firebase.storage()

####################################################################################################
# Authorization
def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        id_token = None

        # Check for token in the Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                id_token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Malformed token'}), 401

        if not id_token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(id_token)
            email = decoded_token['email']
            print(email)

        except Exception as e:
            return jsonify({'error': 'Failed to authenticate token', 'message': str(e)}), 401

        return func(*args)

    return decorated

####################################################################################################
# YOLOv6 API
yolov6_model = my_yolov6.my_yolov6("weights/yolov6s.pt", "cpu", "data/coco.yaml", 640, False)
@app.route('/yolov6', methods=['POST'] )
@token_required
def predict_yolov6():
    image = request.files['file']
    if image:
        # Lưu file
        path_to_save = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
        print("Save = ", path_to_save)
        image.save(path_to_save)
        frame = cv2.imread(path_to_save)
        # print(frame)
        # print(type(frame))

        # Nhận diên qua model Yolov6
        frame, no_person = yolov6_model.infer(frame)

        if no_person >0:
            cv2.imwrite(path_to_save, frame)

        del frame #clean memory
        # Trả về đường dẫn tới file ảnh đã bounding box và số lượng người
        return jsonify({
            'image_path': path_to_save,
            'number_of_persons': no_person
        })

    return 'Upload file to detect'

####################################################################################################
# Proxy server retrieves image from Firebase Storage and processes YOLOv6
# Function to download encrypted image from Firebase Storage
def download_encrypted_image():
    # Download encrypted image data as bytes from Firebase
    encrypted_image_path = "./static/encrypted_image.jpg"
    pyre_storage.child('encrypted_image.jpg').download(path="./static", filename="./static/encrypted_image.jpg")
    with open(encrypted_image_path, 'rb') as f:
        encrypted_image_data = f.read()
    return encrypted_image_data

# Function to decrypt data using AES decryption
def decrypt_data(encrypted_data, key):
    backend = default_backend()
    cipher = Cipher(algorithms.AES(key), modes.CBC(b'\0' * 16), backend=backend)
    decryptor = cipher.decryptor()
    decrypted_padded_data = decryptor.update(encrypted_data) + decryptor.finalize()

    # Unpad the decrypted data
    unpadder = padding.PKCS7(128).unpadder()
    decrypted_data = unpadder.update(decrypted_padded_data) + unpadder.finalize()

    return decrypted_data

# Function to save decrypted image to Firebase Storage
def save_decrypted_image_locally(decrypted_data, output_filename='normal_image.jpg'):
    decrypted_image_path = "./static/" + output_filename
    with open(decrypted_image_path, 'wb') as f:
        f.write(decrypted_data)
    return decrypted_image_path

def predict_yolov6_firebase(image_path):
    path_to_save = os.path.join(app.config['UPLOAD_FOLDER'], 'result.jpg')
    frame = cv2.imread(image_path)

    # Nhận diện qua model Yolov6
    frame, no_person = yolov6_model.infer(frame)
    print(frame)
    print(type(frame))
    if no_person > 0:
        cv2.imwrite(path_to_save, frame)

    del frame  # clean memory
    # Trả về đường dẫn tới file ảnh đã bounding box và số lượng người
    full_image_path = url_for('static', filename='result.jpg', _external=True)

    # Get current timestamp
    timestamp = time.time()

    return jsonify({
        'image_path': full_image_path,
        'number_of_persons': no_person,
        'timestamp': timestamp
    })

    return 'No image to detect'

# Route to download encrypted image, decrypt, and save as normal_image.jpg in Firebase Storage
@app.route('/storage', methods=['GET'])
# @token_required
def storage():
    try:
        print("Download from Firebase Storage")
        # Download encrypted image from Firebase Storage
        encrypted_image_data = download_encrypted_image()

        print("Decrypt image")
        # Decrypt image
        encryption_key = b'16_byte_enc_key!'  # AES key must match the one used for encryption
        decrypted_image = decrypt_data(encrypted_image_data, encryption_key)

        print("Save image")
        # Save decrypted image to Firebase Storage
        decrypted_image_url = save_decrypted_image_locally(decrypted_image)

        # Call YOLOv6 prediction function
        print("Start YOLOv6")
        prediction_result = predict_yolov6_firebase(decrypted_image_url)

        return prediction_result, 200
    except Exception as e:
        return str(e), 500




####################################################################################################
@app.route('/public')
def public():
    return 'For Public'

@app.route('/private', methods=['GET'])
@token_required
def private():
    return 'JWT is verified. Welcome to your dashboard ! '

####################################################################################################
# Registration
@app.route('/register', methods=['POST'])
@cross_origin(origin='*')
def signup():
    data = request.get_json()

    # Validate incoming data
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email')
    password = data.get('password')

    # Ensure email and password are provided
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        user = pyre_auth.create_user_with_email_and_password(email, password)
        session['user'] = email
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to sign up', 'message': str(e)}), 400

####################################################################################################
# Authentication
@app.route('/login', methods=['POST'])
@cross_origin(origin='*')
def login():
    data = request.get_json()

    # Validate incoming data
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email')
    password = data.get('password')

    # Ensure email and password are provided
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        user = pyre_auth.sign_in_with_email_and_password(email, password)
        session['user'] = email
        info = user['idToken']
        return jsonify({
            'message': f'You are logged in, {session["user"]}',
            'token': info
        })
    except Exception as e:
        return jsonify({'error': 'Failed to login', 'message': str(e)}), 401


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user')
    return "Logged out succesfully"

####################################################################################################
@app.route('/', methods=['POST', 'GET'] )
@cross_origin(origin='*')
def dashboard():
    return "Welcome to back-end server"

# Start Backend
if __name__ == '__main__':
    app.run(host='0.0.0.0', port='9999')