# CoVoiture — Full-Stack Ride-Sharing Platform

A production-ready carpooling web application connecting drivers and passengers for intercity travel in Morocco.

Live Demo: http://79.137.73.134:3000

## Features

### For Drivers
- Publish trip announcements with multi-step itinerary and interactive map
- Accept or reject passenger booking requests
- Real-time notifications when a passenger books a seat
- Manage vehicles, view passengers, rate them after trip completion

### For Passengers
- Search trips by city, date, and available seats
- Book a seat and track reservation status in real time
- Cancel reservations, view trip history, rate drivers

### Technical Highlights
- Real-time bidirectional notifications via WebSocket + STOMP
- Interactive maps with Leaflet and OpenStreetMap
- Route calculation with OSRM (distance, duration, geometry)
- JWT authentication with role-based access control
- End-to-end tests with Selenium + pytest
- API tests managed in Postman
- Test cases tracked in Jira + Zephyr Essential

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + Vite |
| Backend | Spring Boot 3.2.5 |
| Database | MySQL 8.0 |
| Authentication | JWT |
| Real-Time | WebSocket + STOMP (SockJS) |
| Mapping | Leaflet + OpenStreetMap + OSRM |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | nginx |
| Testing | Selenium, Postman, Jira, Zephyr |
| Java Version | Java 21 |

## Getting Started

### With Docker Compose
```bash
git clone https://github.com/llTahall/Co-voiturage-App.git
cd Co-voiturage-App
docker-compose up --build -d
```
App runs at http://localhost:3000

### Manual Setup

**Backend**
```bash
cd Backend
./mvnw spring-boot:run
```

**Frontend**
```bash
cd Frontend
npm install
npm run dev
```

### Prerequisites
- Java 21+
- Node.js 20+
- MySQL 8.0
- Docker (optional)

## Team
- SRHIRI Mohammed Taha
- AYOUBI Salah Eddine
- MOULAYE ELY BABA Ainina

Supervised by Prof. NAJIB Mehdi — UIR, S8 2025-2026
