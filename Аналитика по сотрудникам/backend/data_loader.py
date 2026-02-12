import pandas as pd
import requests
from io import StringIO

# URL to export the specific sheet as CSV
# GID 1959968809 is the sheet ID from the user's link
SHEET_URL = "https://docs.google.com/spreadsheets/d/1PeO6whK9USt4qExTPVuhAfKZGd7BgArmOtm0mO-BpkM/export?format=csv&gid=1959968809"

def load_data():
    """
    Fetches the CSV data from Google Sheets and returns it as a list of dictionaries.
    """
    try:
        print(f"Fetching data from: {SHEET_URL}")
        response = requests.get(SHEET_URL)
        response.raise_for_status()
        response.encoding = 'utf-8' # Force UTF-8 encoding
        
        # Read CSV from response content
        csv_data = StringIO(response.text)
        df = pd.read_csv(csv_data)
        
        # Basic cleanup: Fill NaNs, ensuring consistent types if needed
        df = df.fillna("")
        
        # Convert to list of dicts for JSON response
        data = df.to_dict(orient="records")
        print(f"Successfully loaded {len(data)} rows.")
        return data
        
    except Exception as e:
        print(f"Error loading data: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # Test run
    data = load_data()
    print(data[:2])
