#include <ESP8266WiFi.h>
#include "DHT.h"
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ----------------------------------------------------------------------------------------------

#define DHT_PIN D5
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE); // Inisialisasi objek DHT dengan pin dan tipe yang benar

// ----------------------------------------------------------------------------------------------
// WiFi credentials
char ssid[] = "DOWNY";
char pass[] = "harumtahanlama1";

// ----------------------------------------------------------------------------------------------
#define FIREBASE_INTERVAL_SEC (1) // 1 seconds interval for Firebase
#define FIREBASE_INTERVAL_MS (FIREBASE_INTERVAL_SEC * 1000)

// ----------------------------------------------------------------------------------------------
float Temperature;
float Humidity;

// ----------------------------------------------------------------------------------------------
// Firebase credentials
#define API_KEY "AIzaSyCLxiKo8KYmWtB9hX7mWVWmjuEPXAPligw"
#define DATABASE_URL "https://cloudcomputing-fb488-default-rtdb.firebaseio.com/"

// Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;

// ----------------------------------------------------------------------------------------------
void setup()
{
  // Debug console
  Serial.begin(9600);

  // Digital output pin
  pinMode(LED_BUILTIN, OUTPUT);

  // DHT Setup
  dht.begin(); // Inisialisasi sensor DHT

  //----------------------------------------Wait for connection
  Serial.print("Connecting");
  WiFi.begin(ssid, pass); //--> Connect to your WiFi router
  while (WiFi.status() != WL_CONNECTED) 
  {
    Serial.print(".");
    digitalWrite(LED_BUILTIN, LOW);
    delay(50);
    digitalWrite(LED_BUILTIN, HIGH);
    delay(50);
  }
  
  // Matikan lampu WiFi
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  // Firebase setup
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Assign the api key (required)
  config.api_key = API_KEY;

  // Assign the RTDB URL (required)
  config.database_url = DATABASE_URL;

  // Sign up
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("ok");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  // Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

// ----------------------------------------------------------------------------------------------
unsigned long time_ms;
unsigned long time_1000_ms_buf;
unsigned long time_firebase_update_buf;
unsigned long time_dif;

void loop()
{
  time_ms = millis();
  time_dif = time_ms - time_1000_ms_buf;

  // Read and print serial data every 1 sec
  if ( time_dif >= 1000 ) // 1sec 
  {
    time_1000_ms_buf = time_ms;
    Temperature = dht.readTemperature(); // Menggunakan metode yang benar untuk membaca suhu
    Humidity = dht.readHumidity();       // Menggunakan metode yang benar untuk membaca kelembaban
  
    // Print serial messages
    Serial.print("Humidity: " + String(Humidity, 2) + " %");
    Serial.print("\t");
    Serial.println("Temperature: " + String(Temperature, 2) + " C");

    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  }

  // Update data to Firebase in specific period
  time_ms = millis();
  time_dif = time_ms - time_firebase_update_buf;  
  if ( time_dif >= FIREBASE_INTERVAL_MS ) // Specific period
  {
    time_firebase_update_buf = time_ms;

    if (Firebase.ready() && signupOK) {
      if (Firebase.RTDB.setFloat(&fbdo, "DHT/suhu", Temperature)){
        Serial.print("Suhu: ");
        Serial.println(Temperature);
      } else {
        Serial.println("FAILED");
        Serial.println("REASON: " + fbdo.errorReason());
      }

      if (Firebase.RTDB.setFloat(&fbdo, "DHT/kelembaban", Humidity)){
        Serial.print("Kelembaban: ");
        Serial.println(Humidity);
      } else {
        Serial.println("FAILED");
        Serial.println("REASON: " + fbdo.errorReason());
      }
    }
  }
}
