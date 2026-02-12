"""Shared utilities for Vercel API functions"""
import pandas as pd
import requests
from io import StringIO

# Google Sheets URL
SHEET_URL = "https://docs.google.com/spreadsheets/d/1PeO6whK9USt4qExTPVuhAfKZGd7BgArmOtm0mO-BpkM/export?format=csv&gid=1959968809"

def load_data():
    """
    Fetches CSV data from Google Sheets and returns it as a list of dictionaries.
    """
    try:
        response = requests.get(SHEET_URL, timeout=10)
        response.raise_for_status()
        response.encoding = 'utf-8'

        csv_data = StringIO(response.text)
        df = pd.read_csv(csv_data)
        df = df.fillna("")

        data = df.to_dict(orient="records")
        return data
    except Exception as e:
        return {"error": str(e)}

def get_employees_stats(raw_data):
    """Aggregates data by employee"""
    if isinstance(raw_data, dict) and "error" in raw_data:
        return raw_data

    df = pd.DataFrame(raw_data)

    # Normalize column names
    column_map = {
        'Фио сотрудника': 'name',
        'название задачи': 'task',
        'статус': 'status',
        'срок': 'deadline',
        'отклонение': 'deviation',
        'Ссылка': 'link'
    }
    df = df.rename(columns=column_map)

    stats = []
    if 'name' in df.columns:
        for name, group in df.groupby('name'):
            total_tasks = len(group)

            delayed = len(group[group['status'].str.lower().str.contains('просрочена', na=False)])
            postponed = len(group[group['status'].str.lower().str.contains('отложена', na=False)])

            deviations = pd.to_numeric(group['deviation'], errors='coerce').fillna(0)
            avg_deviation = deviations.mean()

            stats.append({
                "name": name,
                "total_tasks": total_tasks,
                "delayed": delayed,
                "postponed": postponed,
                "avg_deviation": round(avg_deviation, 1),
                "tasks": group.to_dict(orient="records")
            })

    return stats

def cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
