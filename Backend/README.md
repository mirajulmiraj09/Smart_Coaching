# 📚 Smart Coaching System (Full Stack)

Smart Coaching System is an **AI-powered coaching management platform** that helps coaching centers manage students, teachers, and generate exam questions automatically using AI.

---

## 🚀 Features

### 👨‍🏫 Admin Dashboard

* Manage coaching centers
* Approve / reject coaching applications
* Monitor system activities

### 🏫 Coaching Management

* Create and manage coaching profiles
* Student enrollment system
* Teacher management

### 🧠 AI Question Generation

* Generate questions using AI
* Modes:

  * ✅ Manual
  * ✅ Random
  * ⚠️ Guided AI (partial)
  * ⚠️ Zero-shot (basic)

### 🔐 Authentication System

* JWT-based authentication
* OTP verification via email (Gmail SMTP)
* Secure API access

### 📄 Document Module

* Upload and manage documents
* AI-based processing (in progress)

### 🎨 Frontend Dashboard

* Responsive UI (React + Vite)
* Role-based interface
* API integration with backend

---

## 🛠️ Tech Stack

### 🔹 Backend

* Django
* Django REST Framework
* Simple JWT

### 🔹 Frontend

* React
* Vite
* Axios
* Tailwind CSS

### 🔹 AI Integration
* LangChain
* OpenAI API

### 🔹 Database

* SQLite (Development)

---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/mirajulmiraj09/Smart_Coaching.git
cd Smart_Coaching
```

---

## 🔹 Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Create `.env`

```env
SECRET_KEY=your_secret_key
DEBUG=True

EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_password

OPENAI_API_KEY=your_openai_api_key
```

### Run Backend

```bash
python manage.py migrate
python manage.py runserver
```

---

## 🔹 Frontend Setup

```bash
cd ../frontend
npm install
```

### Create `.env`

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Run Frontend

```bash
npm run dev
```

---

## 🔑 Authentication Flow

1. User login
2. Backend returns JWT token
3. Token stored in browser (localStorage)
4. Access protected APIs using token

---

## 🧪 Example AI Prompt

```text
Generate exam questions based on the topic.

Topic: {topic}
Difficulty: {difficulty}
Type: MCQ/CQ

- Provide 4 options
- Include correct answer
- Add explanation
```

---

## 🔗 API Integration

* Frontend communicates with backend using Axios
* JWT token used for secured endpoints
* Supports:

  * Authentication
  * Question Generation
  * Coaching Management

---

## 📌 Future Improvements

* 🎯 Live quiz system
* 📊 Analytics dashboard

---

## 👨‍💻 Developers

* Md. Merajul Islam
* Md. Akidul Islam

🔗 GitHub: https://github.com/mirajulmiraj09

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
