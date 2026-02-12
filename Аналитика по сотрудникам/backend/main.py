from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data_loader import load_data
import pandas as pd

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Employee Analytics Backend Running"}

@app.get("/api/data")
def get_data():
    """Returns raw data from Google Sheets."""
    data = load_data()
    if isinstance(data, dict) and "error" in data:
        return data
    return data

@app.get("/api/employees")
def get_employees_stats():
    """Aggregates data by employee."""
    raw_data = load_data()
    if isinstance(raw_data, dict) and "error" in raw_data:
        return raw_data

    df = pd.DataFrame(raw_data)
    
    # Rename columns for easier access if needed, handling the Russian names
    # Based on user output: 'Фио сотрудника', 'название задачи', 'статус', 'срок', 'отклонение', 'Ссылка'
    # We'll normalize column names
    column_map = {
        'Фио сотрудника': 'name',
        'название задачи': 'task',
        'статус': 'status',
        'срок': 'deadline',
        'отклонение': 'deviation',
        'Ссылка': 'link'
    }
    df = df.rename(columns=column_map)
    
    # Aggregate stats
    stats = []
    if 'name' in df.columns:
        for name, group in df.groupby('name'):
            total_tasks = len(group)
            
            # Count statuses (case insensitive safety)
            delayed = len(group[group['status'].str.lower().str.contains('просрочена', na=False)])
            postponed = len(group[group['status'].str.lower().str.contains('отложена', na=False)])
            
            # Calculate average deviation if numeric
            # 'deviation' might be mixed strings/numbers based on log ('Нет срока', '2')
            # Extract numbers where possible
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
