#include <Servo.h>
#include <DHT.h>

#define DHTPIN 2       // Digital pin connected to the DHT sensor
#define DHTTYPE DHT22  // DHT 22 (AM2302), AM2321

unsigned long previousMillis = 0; // Stores the last time data was sent
const long interval = 1000; // Interval at which to send data (1 second)

DHT dht(DHTPIN, DHTTYPE);
const int sys_status = 0; // 0 represent for automatic mode and 1 represent for manual mode 
const int trigPin = 9;    // Pin connected to TRIG of HC-SR04
const int echoPin = 10;   // Pin connected to ECHO of HC-SR04
const int servoPin = 13;  // Pin connected to Signal of SG90 servo
const int light = 12;  // Pin connected to Relay IN
const int fan = 11;  
const int heater = 7;
const int humidifier = 6;

const int threshold = 10; // Distance threshold in cm
const int gasSensorPin = 8;  // Analog pin connected to the MQ2 sensor

int stlight = 0;
int stfan = 0;
int stheater = 0;
int sthumidifier = 0;
int stsys =0;


Servo myServo;  // Create a servo object

unsigned long openStartTime = 0; // Variable to store the time when the door opens
bool doorOpen = false;           // State of the door

void setup() {
  Serial.begin(9600);         // Initialize serial communication at 9600 bps
  Serial.println("DHT22 and HC-SR04 test!");
  pinMode(gasSensorPin, INPUT);   
  pinMode(trigPin, OUTPUT);   // Set TRIG pin as an output
  pinMode(echoPin, INPUT);    // Set ECHO pin as an input
  pinMode(light, OUTPUT);  // Set relay pin as an output
  pinMode(fan, OUTPUT);    // Set LED pin as an output
  pinMode(heater, OUTPUT); 
  pinMode(humidifier, OUTPUT); 
  pinMode(52, OUTPUT); 
  digitalWrite(52, HIGH);
  digitalWrite(fan, HIGH);

  myServo.attach(servoPin);   // Attach the servo to the servo pin
  myServo.write(0);           // Initialize servo to the closed position (0 degrees)
  digitalWrite(light, HIGH); // Ensure the relay is off initially (light off)

  dht.begin();                // Initialize the DHT sensor
}


void automatic(float temp, float hum ,int gas){
  if(gas == 1){
    digitalWrite(fan, LOW);
  }
  else{
    digitalWrite(fan, HIGH);
  }
  if(temp <15){
    digitalWrite(heater,LOW);
  }
  else{
    digitalWrite(heater,HIGH);
  }

  if(hum < 40){
    digitalWrite(humidifier,LOW);
  }
  else{
    digitalWrite(humidifier,HIGH);
  }
  
}

void loop() {
  // Clear the TRIG pin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  // Trigger the ultrasonic pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read the duration of the echo pulse
  long duration = pulseIn(echoPin, HIGH);

  // Calculate the distance in centimeters
  long distanceCm = duration * 0.034 / 2;

  // Check the distance and control the servo and relay accordingly
  if (distanceCm < threshold || stlight == 1) {
    if (!doorOpen) {
      myServo.write(90);             // Open the door
      digitalWrite(light, LOW);  // Turn on the light
      openStartTime = millis();      // Record the time the door was opened
      doorOpen = true;
    } else if (millis() - openStartTime >= 10000) {
      openStartTime = millis();      // Reset the timer if the person is still detected
    }
  } else {
    if (doorOpen && millis() - openStartTime >= 10000) {
      myServo.write(0);              // Close the door
      digitalWrite(light, HIGH);   // Turn off the light
      doorOpen = false;
    }
  }

  // Read temperature and humidity from the DHT sensor
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // Check if any reads failed and exit early (to try again)
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  int gasValue = digitalRead(gasSensorPin);
  // Send all values in a single line

  unsigned long currentMillis = millis();

  // Check if it's time to send the data
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print(" Humidity: ");
    Serial.print(humidity);
    Serial.print(" Gas: ");
    Serial.print(gasValue);
    Serial.print(" Distance: ");
    Serial.println(distanceCm < threshold ? 1 : 0);
  }
//  Serial.print("Temperature: ");
//  Serial.print(temperature);
//  Serial.print(" Humidity: ");
//  Serial.print(humidity);
//  Serial.print(" Gas: ");
//  Serial.print(gasValue);
//  Serial.print(" Distance: ");
//  Serial.println(distanceCm < threshold ? 1 : 0);
 
  if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n'); // Read the incoming data as a string
    data.trim(); // Remove any trailing whitespace

    int commaIndex1 = data.indexOf(',');
    int commaIndex2 = data.indexOf(',', commaIndex1 + 1);
    int commaIndex3 = data.indexOf(',', commaIndex2 + 1);
    int commaIndex4 = data.indexOf(',', commaIndex3 + 1);

    if (commaIndex1 > 0 && commaIndex2 > commaIndex1 && commaIndex3 > commaIndex2 && commaIndex4 > commaIndex3) {
        stlight = data.substring(0, commaIndex1).toInt();
        stfan = data.substring(commaIndex1 + 1, commaIndex2).toInt();
        stheater = data.substring(commaIndex2 + 1, commaIndex3).toInt();
        sthumidifier = data.substring(commaIndex3 + 1, commaIndex4).toInt();
        stsys = data.substring(commaIndex4 + 1).toInt();
    }
}
  if(stsys == 0){
    automatic(temperature, humidity, gasValue);
  }
  else{
    if(stlight == 1 || distanceCm < threshold){
      digitalWrite(light, LOW);
    }
    else{
      digitalWrite(light, HIGH);
    }
    if(stfan == 1){
      digitalWrite(fan, LOW);
    }
    else{
      digitalWrite(fan, HIGH);
    }
    if(stheater == 1){
      digitalWrite(heater,LOW);
    }
    else{
      digitalWrite(heater,HIGH);
    }
  
    if(sthumidifier == 1){
      digitalWrite(humidifier,LOW);
    }
    else{
      digitalWrite(humidifier,HIGH);
    }
  }

  /*
  if(stfan == 1){
    digitalWrite(fan, LOW);
  }
  else{
    digitalWrite(fan, HIGH);
  }
  if(stheater == 1){
    digitalWrite(heater,LOW);
  }
  else{
    digitalWrite(heater,HIGH);
  }

  if(sthumidifier == 1){
    digitalWrite(humidifier,LOW);
  }
  else{
    digitalWrite(humidifier,HIGH);
  }
  
  */
  //temperature = 5; 
  //humidity = 39;
  
  
  delay(100);
}
