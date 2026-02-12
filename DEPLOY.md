# 🚀 Инструкция по деплою на GitHub и Vercel

## Шаг 1: Создание репозитория на GitHub

1. Откройте [GitHub](https://github.com/new)
2. Создайте новый репозиторий:
   - **Имя:** `employee-analytics-dashboard` (или любое другое)
   - **Описание:** `📊 Employee Analytics Dashboard - React + FastAPI`
   - **Видимость:** Public или Private
   - **НЕ добавляйте** README, .gitignore, license (они уже созданы)

3. Нажмите **Create repository**

## Шаг 2: Подключение локального репозитория к GitHub

Скопируйте URL вашего нового репозитория (например: `https://github.com/USERNAME/employee-analytics-dashboard.git`)

Выполните в терминале:

```bash
# Добавьте remote
git remote add origin https://github.com/USERNAME/employee-analytics-dashboard.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Запушьте код
git push -u origin main
```

## Шаг 3: Деплой frontend на Vercel

### Вариант A: Через Vercel CLI (Рекомендуется)

1. Установите Vercel CLI:
```bash
npm install -g vercel
```

2. Войдите в аккаунт:
```bash
vercel login
```

3. Деплой frontend:
```bash
cd "Аналитика по сотрудникам/frontend"
vercel --prod
```

4. Следуйте инструкциям:
   - **Set up and deploy?** Yes
   - **Which scope?** Выберите ваш аккаунт
   - **Link to existing project?** No
   - **Project name:** employee-analytics-frontend
   - **Directory:** `./`
   - **Override settings?** No

### Вариант B: Через веб-интерфейс Vercel

1. Откройте [Vercel](https://vercel.com/new)
2. Нажмите **Import Git Repository**
3. Выберите ваш GitHub репозиторий
4. Настройте проект:
   - **Framework Preset:** Vite
   - **Root Directory:** `Аналитика по сотрудникам/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Нажмите **Deploy**

## Шаг 4: Деплой backend на Render (Бесплатно)

Backend лучше задеплоить отдельно на Render.com, так как Vercel имеет ограничения для Python API:

1. Откройте [Render](https://render.com)
2. Создайте аккаунт / войдите
3. Нажмите **New** → **Web Service**
4. Подключите GitHub репозиторий
5. Настройте сервис:
   - **Name:** employee-analytics-api
   - **Region:** Выберите ближайший
   - **Root Directory:** `Аналитика по сотрудникам/backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
6. Нажмите **Create Web Service**

## Шаг 5: Обновление API URL в frontend

После деплоя backend, получите его URL (например: `https://employee-analytics-api.onrender.com`)

Обновите файл `frontend/src/App.jsx`:

```javascript
// Было:
const API_URL = 'http://localhost:8000'

// Стало:
const API_URL = 'https://employee-analytics-api.onrender.com'
```

Закоммитьте и запушьте изменения:

```bash
git add "Аналитика по сотрудникам/frontend/src/App.jsx"
git commit -m "Update API URL for production"
git push
```

Vercel автоматически задеплоит новую версию!

## Шаг 6: Настройка CORS на backend

Обновите `backend/main.py` для разрешения запросов с Vercel:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "https://your-app.vercel.app",  # Замените на ваш URL
        "https://*.vercel.app"  # Для preview деплоев
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Закоммитьте и запушьте:

```bash
git add "Аналитика по сотрудникам/backend/main.py"
git commit -m "Update CORS for production"
git push
```

Render автоматически задеплоит обновление!

## ✅ Готово!

Ваше приложение теперь доступно онлайн:
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://employee-analytics-api.onrender.com
- **API Docs:** https://employee-analytics-api.onrender.com/docs

## 🔧 Дополнительные настройки

### Автоматический деплой

Теперь при каждом push в GitHub:
- **Vercel** автоматически деплоит frontend
- **Render** автоматически деплоит backend

### Environment Variables (Опционально)

Если нужно добавить переменные окружения:

**Vercel:**
1. Settings → Environment Variables
2. Добавьте `VITE_API_URL` = URL вашего backend

**Render:**
1. Environment → Add Environment Variable
2. Добавьте нужные переменные

### Custom Domain (Опционально)

**Vercel:**
1. Settings → Domains
2. Добавьте ваш домен

**Render:**
1. Settings → Custom Domain
2. Добавьте ваш домен

---

## 🆘 Troubleshooting

### Frontend не загружает данные
- Проверьте CORS настройки в backend
- Проверьте API_URL в frontend
- Проверьте логи в Render dashboard

### Backend не запускается
- Проверьте Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Проверьте requirements.txt
- Проверьте логи в Render

### Slow loading
- Render Free tier "засыпает" после 15 минут неактивности
- Первый запрос после сна может занять ~30 секунд
- Рассмотрите платный план Render ($7/месяц) для постоянной работы

---

Made with ❤️ using Claude AI
