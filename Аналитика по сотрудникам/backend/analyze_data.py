# -*- coding: utf-8 -*-
import requests
import json
from collections import Counter
import sys

# Установка UTF-8 для вывода в консоль Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# Получаем данные из API
response = requests.get('http://localhost:8000/api/employees')
employees = response.json()

print(f"{'='*70}")
print(f"АНАЛИТИКА ПО СОТРУДНИКАМ")
print(f"{'='*70}\n")

print(f"Всего сотрудников: {len(employees)}\n")

# Общая статистика
total_tasks = sum(emp['total_tasks'] for emp in employees)
total_delayed = sum(emp['delayed'] for emp in employees)
total_postponed = sum(emp['postponed'] for emp in employees)

print(f"Общая статистика:")
print(f"  Всего задач: {total_tasks}")
print(f"  Просрочено: {total_delayed} ({total_delayed/total_tasks*100:.1f}%)")
print(f"  Отложено: {total_postponed} ({total_postponed/total_tasks*100:.1f}%)")
print(f"\n{'='*70}\n")

# Топ сотрудников по количеству задач
print(f"ТОП-10 сотрудников по количеству задач:\n")
sorted_by_tasks = sorted(employees, key=lambda x: x['total_tasks'], reverse=True)[:10]
for i, emp in enumerate(sorted_by_tasks, 1):
    print(f"{i:2}. {emp['name']:30} - {emp['total_tasks']:3} задач(и)")

print(f"\n{'='*70}\n")

# Топ сотрудников по просроченным задачам
print(f"ТОП-10 сотрудников с просроченными задачами:\n")
sorted_by_delayed = sorted(employees, key=lambda x: x['delayed'], reverse=True)[:10]
for i, emp in enumerate(sorted_by_delayed, 1):
    delayed_pct = (emp['delayed'] / emp['total_tasks'] * 100) if emp['total_tasks'] > 0 else 0
    print(f"{i:2}. {emp['name']:30} - {emp['delayed']:3} ({delayed_pct:5.1f}%)")

print(f"\n{'='*70}\n")

# Топ сотрудников по среднему отклонению
print(f"ТОП-10 сотрудников по среднему отклонению от срока:\n")
sorted_by_deviation = sorted(
    [emp for emp in employees if emp['avg_deviation'] > 0],
    key=lambda x: x['avg_deviation'],
    reverse=True
)[:10]
for i, emp in enumerate(sorted_by_deviation, 1):
    print(f"{i:2}. {emp['name']:30} - {emp['avg_deviation']:6.1f} дней")

print(f"\n{'='*70}\n")

# Статусы задач
raw_response = requests.get('http://localhost:8000/api/data')
raw_data = raw_response.json()

statuses = Counter(task['статус'] for task in raw_data if task.get('статус'))
print(f"Распределение по статусам:\n")
for status, count in statuses.most_common():
    print(f"  {status:20} - {count:3} ({count/len(raw_data)*100:.1f}%)")

print(f"\n{'='*70}")
