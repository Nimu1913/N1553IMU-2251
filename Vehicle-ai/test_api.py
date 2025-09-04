#!/usr/bin/env python3
import requests
import sys

def test_api():
    """Test the API endpoints"""
    base_url = "http://localhost:8000"
    
    # Test health
    print("Testing health endpoint...")
    r = requests.get(f"{base_url}/health")
    print(f"Health: {r.json()}")
    
    # Test car replacement
    print("\nTesting car replacement...")
    with open("test_images/test_car.jpg", "rb") as car:
        with open("test_images/sporty.jpg", "rb") as bg:
            files = {
                "car_image": car,
                "background": bg
            }
            data = {
                "scale": 1.0,
                "position": "auto"
            }
            
            r = requests.post(f"{base_url}/api/v1/replace", files=files, data=data)
            
            if r.status_code == 200:
                with open("api_result.jpg", "wb") as f:
                    f.write(r.content)
                print("✓ Result saved as api_result.jpg")
            else:
                print(f"✗ Error: {r.text}")

if __name__ == "__main__":
    test_api()
