#include <Wire.h>
#include <VL53L1X.h>
#include "constants.h"

// Declare sensor object
VL53L1X sensor;

float initialDistance = 0.0;   // Starting distance (baseline)
float smoothedDistance = 0.0; // Smoothed sensor reading
float minDistance = 0.0;      // Tracks the minimum distance during the lift
bool isLiftActive = false;    // Tracks if the lift is in motion
bool tryInProgress = false;   // Tracks if a single "try" is in progress
bool cooldownActive = false;  // Tracks cooldown state
unsigned long startTime = 0;  // Time when the lift starts moving
unsigned long endTime = 0;    // Time when the lift reaches the topmost point
unsigned long cooldownStart = 0; // Time when cooldown starts
const int smoothingWindowSize = 5; // Number of readings for smoothing
float distanceBuffer[smoothingWindowSize] = {0}; // Buffer for rolling average
int bufferIndex = 0;          // Index for the buffer

void setup()
{
  Serial.begin(115200);
  Wire.begin();
  Wire.setClock(400000); // Use 400 kHz I2C
  sensor.setTimeout(500);

  if (!sensor.init())
  {
    Serial.println("ERROR Sensor initialization failed!");
    while (1);
  }

  sensor.setDistanceMode(VL53L1X::Long);
  sensor.setMeasurementTimingBudget(50000);
  sensor.startContinuous(100); // Continuous readings every 100 ms

  // Read initial distance
  sensor.read();
  initialDistance = sensor.ranging_data.range_mm / 1000.0; // Convert mm to meters
  smoothedDistance = initialDistance; // Initialize smoothed distance
  Serial.println("LOG Initial Distance Set: " + String(initialDistance, 4));
}

float calculateSmoothedDistance(float newDistance)
{
  // Add the new reading to the buffer
  distanceBuffer[bufferIndex] = newDistance;
  bufferIndex = (bufferIndex + 1) % smoothingWindowSize;

  // Calculate the average of the buffer
  float sum = 0;
  for (int i = 0; i < smoothingWindowSize; i++)
  {
    sum += distanceBuffer[i];
  }
  return sum / smoothingWindowSize;
}

void loop()
{
  // Read sensor data
  sensor.read();
  float currentDistance = sensor.ranging_data.range_mm / 1000.0; // Convert mm to meters

  // Smooth the sensor reading
  smoothedDistance = calculateSmoothedDistance(currentDistance);

  // Send smoothed distance logs for debugging
  // Serial.println("LOG Smoothed Distance (m): " + String(smoothedDistance, 4));

  // Handle cooldown phase
  if (cooldownActive)
  {
    if (smoothedDistance > initialDistance - THRESHOLD && smoothedDistance < initialDistance + THRESHOLD)
    {
      if (millis() - cooldownStart > 1000) // Cooldown duration (1 second)
      {
        cooldownActive = false;
        Serial.println("LOG Cooldown complete. Ready for next try.");
      }
    }
    return; // Skip further processing during cooldown
  }

  if (!isLiftActive && !tryInProgress)
  {
    // Detect start of try
    if (smoothedDistance < initialDistance - THRESHOLD)
    {
      isLiftActive = true;
      tryInProgress = true;
      startTime = millis();
      minDistance = smoothedDistance;
      Serial.println("LOG Lift started moving.");
    }
  }
  else if (isLiftActive)
  {
    // Update minimum distance
    if (smoothedDistance < minDistance)
    {
      minDistance = smoothedDistance;
      Serial.println("LOG Updated Min Distance (m): " + String(minDistance, 4));
    }

    // Detect stabilization at the top
    if (smoothedDistance > minDistance + THRESHOLD)
    {
      isLiftActive = false;
      endTime = millis();
      float timeSeconds = (endTime - startTime) / 1000.0;
      float distanceMoved = initialDistance - minDistance;

      // Calculate horsepower
      // const float WEIGHT_KG = 10.0;       // Weight of the lifted object
      // const float GRAVITY = 9.8;          // Gravitational acceleration
      // const float HORSEPOWER_CONVERSION = 745.7;
      float force = WEIGHT_KG * GRAVITY;
      float horsepower = (force * distanceMoved) / (timeSeconds * HORSEPOWER_CONVERSION);

      // Send final try data
      Serial.print("DATA ");
      Serial.print(distanceMoved, 4);
      Serial.print(" ");
      Serial.print(timeSeconds, 4);
      Serial.print(" ");
      Serial.println(horsepower, 4);

      // Reset for cooldown
      minDistance = initialDistance;
      tryInProgress = false;
      cooldownActive = true;
      cooldownStart = millis();
      Serial.println("LOG Lift cycle complete. Cooldown started.");
    }
  }
}