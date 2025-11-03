#!/usr/bin/env python3
"""Test all API endpoints to verify functionality"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_endpoint(name, url, method="GET", data=None):
    """Test an API endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response:")
        
        try:
            result = response.json()
            print(json.dumps(result, indent=2))
            
            if response.status_code == 200 and result.get('success'):
                print(f"\n[OK] {name} - Working correctly!")
            elif response.status_code == 400:
                error_msg = result.get('error', 'Unknown error')
                print(f"\n[EXPECTED] {name} - Returns 400: {error_msg}")
                print("This is expected if minimum data requirements are not met")
            else:
                print(f"\n[WARNING] {name} - Unexpected status or response")
        except:
            print(response.text[:200])
            
    except requests.exceptions.ConnectionError:
        print(f"\n[ERROR] Cannot connect to backend. Is it running on port 5000?")
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")

# Test all endpoints
print("="*60)
print("API ENDPOINT TESTING")
print("="*60)

# Health check
test_endpoint("Health Check", f"{BASE_URL}/health")

# Dashboard
test_endpoint("Dashboard Stats", f"{BASE_URL}/dashboard/stats")
test_endpoint("Dashboard Charts", f"{BASE_URL}/dashboard/charts")

# Analytics
test_endpoint("Analytics Trends", f"{BASE_URL}/analytics/trends")

# Cycle
test_endpoint("Cycle Predict", f"{BASE_URL}/cycle/predict")
test_endpoint("Cycle Symptoms", f"{BASE_URL}/cycle/symptoms")

# Reports
test_endpoint("Weekly Report", f"{BASE_URL}/reports/weekly")
test_endpoint("Monthly Report", f"{BASE_URL}/reports/monthly")

# Entries
test_endpoint("Get All Entries", f"{BASE_URL}/entries")
test_endpoint("Get Recent Entries", f"{BASE_URL}/entries/recent?limit=5")

print("\n" + "="*60)
print("TEST SUMMARY")
print("="*60)
print("\nStatus Legend:")
print("  [OK] - Endpoint working correctly")
print("  [EXPECTED] - 400 error is expected (not enough data)")
print("  [WARNING] - Unexpected behavior")
print("  [ERROR] - Connection or other error")

