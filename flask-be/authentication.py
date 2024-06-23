import pyrebase

config = {
    'apiKey': "AIzaSyC6Kgjv8GT3jmmJVw2h_SMtxdT7YKJ0p9Y",
    'authDomain': "stue-5aa46.firebaseapp.com",
    'projectId': "stue-5aa46",
    'storageBucket': "stue-5aa46.appspot.com",
    'messagingSenderId': "883988354838",
    'appId': "1:883988354838:web:d12b4798cce01ebc466237",
    'measurementId': "G-JGNKCMZPFY",
    'databaseURL': ""
}

firebase = pyrebase.initialize_app(config)
auth = firebase.auth()

email = 'test@gmail.com'
password = '123456'

# Sign up
# user = auth.create_user_with_email_and_password(email, password)
# print(user)

# Sign in
# user = auth.sign_in_with_email_and_password(email, password)

# Login return token
# info = auth.get_account_info(user['idToken']) #decoded
# info = user['idToken']
# print(info)

# Email verification
# auth.send_email_verification(user['idToken'])

# Send password reset email
# auth.send_password_reset_email(email)