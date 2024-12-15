#include <Wire.h>
#include <VL53L1X.h>
#include "constants.h"

VL53L1X sensor;

float initialDistance = 0.0;  // Starting distance (baseline)
bool isLiftActive = false;   // Tracks if the lift is in motion
unsigned long startTime = 0; // Time when the lift starts moving
unsigned long endTime = 0;   // Time when the lift returns to the initial position
float maxDistance = 0.0;     // Tracks the maximum distance moved

void setup()
{
  Serial.begin(115200);
  Wire.begin();
  Wire.setClock(400000); // Use 400 kHz I2C
  sensor.setTimeout(500);
  
  if (!sensor.init())
  {
    Serial.println("Failed to detect and initialize sensor!");
    while (1);
  }

  sensor.setDistanceMode(VL53L1X::Long);
  sensor.setMeasurementTimingBudget(50000);
  sensor.startContinuous(100); // Continuous readings every 100 ms

  // Read initial distance
  sensor.read();
  initialDistance = sensor.ranging_data.range_mm / 1000.0; // Convert mm to meters
}

void loop()
{
  // Read sensor data
  sensor.read();
  float currentDistance = sensor.ranging_data.range_mm / 1000.0; // Convert mm to meters

  if (!isLiftActive)
  {
    // Check if lift starts moving (distance exceeds threshold)
    if (currentDistance > initialDistance + THRESHOLD)
    {
      isLiftActive = true;
      startTime = millis();
      maxDistance = currentDistance;
      // Serial.println("Lift started moving.");
    }
  }
  else
  {
    // Update max distance
    if (currentDistance > maxDistance)
    {
      maxDistance = currentDistance;
    }

    // Check if lift has returned to the initial position
    if (currentDistance <= initialDistance + THRESHOLD)
    {
      isLiftActive = false;
      endTime = millis();
      float timeSeconds = (endTime - startTime) / 1000.0;

      // Calculate force
      float force = WEIGHT_KG * GRAVITY;

      // Calculate distance moved
      float distanceMoved = maxDistance - initialDistance;

      // Calculate horsepower
      float horsepower = (force * distanceMoved) / (timeSeconds * HORSEPOWER_CONVERSION);

      // Print results to serial
      //Serial.print("Max Distance (m): ");
      Serial.print(distanceMoved, 4);
      Serial.print(" ");
      //Serial.print("\tTime Taken (s): ");
      Serial.print(timeSeconds, 4);
      Serial.print(" ");
      //Serial.print("\tHorsepower (hp): ");
      Serial.println(horsepower, 4);

      // Reset max distance
      maxDistance = initialDistance;

      // Serial.println("Lift cycle complete.");
    }
  }

  delay(SENSOR_UPDATE_DELAY); // Adjust for sensor update rate
}
