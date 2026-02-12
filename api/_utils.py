"""Shared utilities for Vercel API functions - No Pandas version"""
import requests
import csv
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
        reader = csv.DictReader(csv_data)
        data = list(reader)

        return data
    except Exception as e:
        return {"error": str(e)}

def get_employees_stats(raw_data):
    """Aggregates data by employee without Pandas"""
    if isinstance(raw_data, dict) and "error" in raw_data:
        return raw_data

    # Group by employee name
    employees_dict = {}

    for row in raw_data:
        name = row.get('Фио сотрудника', '').strip()
        if not name:
            continue

        if name not in employees_dict:
            employees_dict[name] = {
                'name': name,
                'total_tasks': 0,
                'delayed': 0,
                'postponed': 0,
                'deviations': [],
                'tasks': []
            }

        # Count tasks
        employees_dict[name]['total_tasks'] += 1

        # Count statuses
        status = row.get('статус', '').lower()
        if 'просрочена' in status:
            employees_dict[name]['delayed'] += 1
        if 'отложена' in status:
            employees_dict[name]['postponed'] += 1

        # Collect deviations
        deviation = row.get('отклонение', '')
        try:
            dev_num = float(deviation)
            employees_dict[name]['deviations'].append(dev_num)
        except (ValueError, TypeError):
            pass

        # Add task to list
        employees_dict[name]['tasks'].append({
            'name': name,
            'task': row.get('название задачи', ''),
            'status': row.get('статус', ''),
            'deadline': row.get('срок', ''),
            'deviation': deviation,
            'link': row.get('Ссылка', '')
        })

    # Calculate averages and format output
    stats = []
    for emp_data in employees_dict.values():
        # Calculate average deviation
        deviations = emp_data['deviations']
        avg_deviation = sum(deviations) / len(deviations) if deviations else 0

        stats.append({
            'name': emp_data['name'],
            'total_tasks': emp_data['total_tasks'],
            'delayed': emp_data['delayed'],
            'postponed': emp_data['postponed'],
            'avg_deviation': round(avg_deviation, 1),
            'tasks': emp_data['tasks']
        })

    return stats

def cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
