# 🧳 JourneyMate — Silver vs Gold Travel Comparison

A full-stack travel comparison platform that shows Budget (Silver) vs Luxury (Gold) travel plans side-by-side, built with **React 18 + Vite** on the frontend and **Java 21 Spring Boot** on the backend.

---

## ✨ Features

| Feature | Details |
|---|---|
| ⚡ Instant Compare | Silver vs Gold plans side-by-side in <3 seconds |
| 🎛️ Smart Toggle | Optimize for Savings / Both / Comfort |
| 📅 Day-by-Day Itinerary | Full plans for both tiers |
| 💰 Savings Banner | Floating CTA showing exact savings amount |
| 🌐 Virtual Threads | Java 21 Project Loom — 10,000+ concurrent users |
| 🗄️ JSONB Storage | Flexible itinerary data in PostgreSQL |
| 📱 Fully Responsive | Mobile-first dark theme design |

---

## 🚀 Quick Start

### Option 1: Docker (Recommended — One Command)

```bash
docker-compose up --build
```

- Frontend: http://localhost:80
- API: http://localhost:8080/api/v1
- DB: localhost:5432/travel_db

---

### Option 2: Local Development

#### Prerequisites
- Node.js 20+
- Java 21+
- Maven 3.9+
- PostgreSQL 16

#### 1. Start Database
```bash
psql -U postgres -c "CREATE DATABASE travel_db;"
```

#### 2. Start Backend
```bash
cd backend
mvn spring-boot:run
# API runs on http://localhost:8080
```

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🏗️ Architecture

```
journeymate/
├── frontend/                    # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Fixed navigation
│   │   │   ├── HeroSearch.jsx   # Landing search UI
│   │   │   ├── ComparisonPage.jsx  # Main split-view
│   │   │   ├── FeaturesSection.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Footer.jsx
│   │   ├── services/
│   │   │   └── travelService.js  # API calls / mock data
│   │   └── App.jsx
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                     # Java 21 Spring Boot 3.4
│   └── src/main/java/com/travel/
│       ├── TravelApplication.java
│       ├── controller/
│       │   └── TravelController.java    # GET /api/v1/compare
│       ├── service/
│       │   └── TravelComparisonService.java
│       ├── entity/
│       │   └── TravelPackage.java       # JSONB column
│       ├── repository/
│       │   └── TravelPackageRepository.java
│       ├── dto/
│       │   └── ComparisonResponse.java
│       └── config/
│           ├── WebConfig.java    # CORS
│           └── DataSeeder.java   # Sample data on startup
│
└── docker-compose.yml
```

---

## 🔌 API Reference

### `GET /api/v1/compare`

**Parameters:**
| Param | Type | Example |
|---|---|---|
| `from` | string | `Hyderabad` |
| `to` | string | `Varanasi` |

**Response:**
```json
{
  "origin": "Hyderabad",
  "destination": "Varanasi",
  "duration": "5 Days / 4 Nights",
  "silver": {
    "price": 14500,
    "transport": "Train (Sleeper)",
    "accommodation": "Budget Hostel",
    "dining": "Local Street Food",
    "perks": ["Free WiFi", "City Map"],
    "itinerary": [
      { "day": 1, "title": "Arrival & Ghats", "activities": ["..."] }
    ]
  },
  "gold": { "...same structure..." },
  "savings": {
    "amount": 12500,
    "percentage": 46,
    "message": "Silver saves you ₹12,500 (46% less than Gold)"
  }
}
```

---

## ☁️ Cloud Deployment

| Layer | Provider | Command |
|---|---|---|
| Frontend | **Vercel** | `vercel deploy` in `/frontend` |
| Backend | **Railway** | Push Docker image |
| Database | **Supabase / Neon** | Update `application.properties` with connection URL |

### Environment Variables (Production)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/travel_db
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<password>
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE travel_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin VARCHAR(50) NOT NULL,
    destination VARCHAR(50) NOT NULL,
    duration VARCHAR(50),
    silver_price DECIMAL(10,2),
    silver_transport VARCHAR(100),
    silver_accommodation VARCHAR(100),
    silver_dining VARCHAR(200),
    silver_transport_detail VARCHAR(200),
    silver_accommodation_detail VARCHAR(200),
    silver_dining_detail VARCHAR(200),
    gold_price DECIMAL(10,2),
    gold_transport VARCHAR(100),
    gold_accommodation VARCHAR(100),
    gold_dining VARCHAR(200),
    gold_transport_detail VARCHAR(200),
    gold_accommodation_detail VARCHAR(200),
    gold_dining_detail VARCHAR(200),
    itinerary JSONB,          -- Day-by-day plans + perks (flexible)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧵 Java 21 Virtual Threads

Enabled in `application.properties`:
```properties
spring.threads.virtual.enabled=true
```

This single line makes every HTTP request run on a **Virtual Thread** (Project Loom), allowing your Spring Boot app to handle **10,000+ concurrent users** with a single small server — no reactive programming complexity needed.

---

## 📦 Pre-loaded Routes

| Route | Silver | Gold | Savings |
|---|---|---|---|
| Hyderabad → Varanasi | ₹14,500 | ₹27,000 | ₹12,500 |
| Hyderabad → Goa | ₹9,800 | ₹22,500 | ₹12,700 |
| Hyderabad → Manali | ₹18,200 | ₹38,500 | ₹20,300 |

---

## 🛠️ Tech Stack

**Frontend:** React 18 · Vite · Tailwind CSS · Lucide React  
**Backend:** Java 21 · Spring Boot 3.4 · Spring Data JPA · Virtual Threads  
**Database:** PostgreSQL 16 · JSONB  
**DevOps:** Docker · Docker Compose · Nginx  
**Deploy:** Vercel (FE) · Railway/Render (BE) · Supabase/Neon (DB)
