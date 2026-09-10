# 🎬 VOX Cinema

> A modern full-stack cinema management and movie ticket booking platform.

VOX Cinema is a full-stack web application designed to provide a complete digital cinema experience, allowing users to discover movies, explore cinemas and showtimes, select seats, and book movie tickets online.

The project is built with **Angular** on the frontend and **Node.js / Express.js** on the backend, with **MongoDB** as the database.

---

## ✨ Features

### 👤 Authentication & User Management

* User registration
* User login
* Password hashing
* Email verification
* OTP generation and verification
* OTP expiration
* Resend OTP
* Forgot password
* Reset password
* JWT authentication
* Protected routes
* Role-based authorization
* User management
* Admin users
* Ban / unban users

---

### 🎬 Movies

Users can browse available movies and view detailed information about each movie.

Movie information can include:

* Movie title
* Description
* Poster
* Duration
* Genre
* Release date
* Rating
* Language
* Age classification

Movies are connected to available showtimes and cinema halls.

---

### 🏢 Cinemas

The system supports multiple cinema branches.

Each cinema can have:

* Cinema name
* Location
* Description
* Multiple halls
* Multiple showtimes

This allows the platform to represent a complete cinema chain rather than a single cinema location.

---

### 🎦 Halls

Each cinema can contain multiple halls.

Halls are responsible for organizing:

* Hall information
* Capacity
* Seats
* Showtimes

Example:

```text
Cinema
│
├── Hall 1
│   ├── Seats
│   └── Showtimes
│
├── Hall 2
│   ├── Seats
│   └── Showtimes
│
└── Hall 3
    ├── Seats
    └── Showtimes
```

---

### 💺 Seat Management

The platform provides seat selection during the booking process.

Users can:

* View available seats
* Select specific seats
* See unavailable/reserved seats
* Book multiple seats
* Prevent duplicate seat reservations

Seats belong to specific halls and their availability is handled according to the selected showtime.

---

### 🕐 Showtimes

Showtimes connect movies with specific cinema halls.

A showtime can contain:

* Movie
* Cinema
* Hall
* Date
* Start time
* End time
* Ticket price
* Seat availability

Example:

```text
Movie: Interstellar
Cinema: VOX Cinema
Hall: IMAX 1
Date: 20/09/2026
Time: 08:30 PM
Price: 250 EGP
```

---

### 🎟️ Booking System

The booking system is one of the core features of VOX Cinema.

The booking flow is:

```text
Select Movie
      ↓
Select Cinema
      ↓
Select Showtime
      ↓
View Seats
      ↓
Select Seats
      ↓
Check Availability
      ↓
Confirm Booking
      ↓
Booking Created
```

Before creating a booking, the system validates the selected seats to prevent conflicting reservations.

---

### 📧 Email & OTP

The system uses email services for authentication-related operations.

Email functionality includes:

* Sending verification OTP
* Sending password reset information
* Account verification
* Authentication notifications

OTP codes are generated dynamically and expire after a defined period.

---

## 🛠️ Tech Stack

### Frontend

* **Angular**
* **TypeScript**
* **HTML5**
* **CSS3**
* **Angular Router**
* **Angular HttpClient**

Angular components provide the UI building blocks, while Angular Router handles SPA navigation and `HttpClient` handles communication with the backend REST API.

---

### Backend

* **Node.js**
* **Express.js**
* **JavaScript**
* **REST API**

---

### Database

* **MongoDB**
* **Mongoose**
* **MongoDB Atlas**

---

### Authentication & Security

* **JWT**
* **bcrypt**
* **OTP**
* **Role-Based Authorization**
* **Protected Routes**

---

### Email

* **Nodemailer**

---

### Development Tools

* Git
* GitHub
* Postman
* VS Code
* MongoDB Atlas

---

## 🏗️ Architecture

The project follows a client-server architecture:

```text
┌───────────────────────┐
│       Angular         │
│       Frontend        │
└───────────┬───────────┘
            │
            │ HTTP / REST API
            ▼
┌───────────────────────┐
│   Node.js + Express   │
│       Backend         │
└───────────┬───────────┘
            │
            │ Mongoose
            ▼
┌───────────────────────┐
│        MongoDB        │
│      Database         │
└───────────────────────┘
```

---

## 📁 Backend Structure

The backend is organized into separate modules for better maintainability and scalability.

```text
backend/
│
├── modules/
│   │
│   ├── users/
│   │   ├── users.model.js
│   │   ├── users.controller.js
│   │   └── users.routes.js
│   │
│   ├── movies/
│   │   ├── movies.model.js
│   │   ├── movies.controller.js
│   │   └── movies.routes.js
│   │
│   ├── cinemas/
│   │   ├── cinemas.model.js
│   │   ├── cinemas.controller.js
│   │   └── cinemas.routes.js
│   │
│   ├── halls/
│   │   ├── halls.model.js
│   │   ├── halls.controller.js
│   │   └── halls.routes.js
│   │
│   ├── seats/
│   │   ├── seats.model.js
│   │   ├── seats.controller.js
│   │   └── seats.routes.js
│   │
│   ├── showtimes/
│   │   ├── showtimes.model.js
│   │   ├── showtimes.controller.js
│   │   └── showtimes.routes.js
│   │
│   └── bookings/
│       ├── bookings.model.js
│       ├── bookings.controller.js
│       └── bookings.routes.js
│
├── middleware/
│
├── utils/
│
├── app.js
└── server.js
```

---

## 📁 Angular Structure

The frontend follows a modular Angular structure.

```text
frontend/
│
└── src/
    │
    ├── app/
    │   │
    │   ├── core/
    │   │   ├── guards/
    │   │   ├── interceptors/
    │   │   └── services/
    │   │
    │   ├── shared/
    │   │   ├── components/
    │   │   ├── pipes/
    │   │   └── models/
    │   │
    │   ├── features/
    │   │   ├── auth/
    │   │   ├── movies/
    │   │   ├── cinemas/
    │   │   ├── showtimes/
    │   │   ├── seats/
    │   │   └── bookings/
    │   │
    │   ├── app.routes.ts
    │   └── app.config.ts
    │
    ├── assets/
    ├── styles.css
    └── index.html
```

---

## 🔗 Main Entities

The main entities of the system are:

```text
User
 │
 └── Bookings
       │
       ├── Showtime
       │     │
       │     ├── Movie
       │     │
       │     └── Hall
       │           │
       │           └── Seats
       │
       └── Selected Seats


Cinema
 │
 └── Halls
       │
       └── Seats
```

### Relationships

* A **Cinema** has many Halls.
* A **Hall** has many Seats.
* A **Movie** can have many Showtimes.
* A **Showtime** belongs to a Movie and Hall.
* A **User** can have many Bookings.
* A **Booking** belongs to a User and Showtime.
* A **Booking** contains one or more selected Seats.

---

## 🔐 Authentication Flow

```text
Register
   ↓
Generate OTP
   ↓
Send OTP via Email
   ↓
Verify OTP
   ↓
Account Verified
   ↓
Login
   ↓
JWT Authentication
   ↓
Access Protected Resources
```

---

## 👑 Admin System

Administrators have additional permissions to manage the cinema platform.

Admin functionality includes:

* Manage users
* Ban users
* Manage movies
* Manage cinemas
* Manage halls
* Manage seats
* Manage showtimes
* Manage bookings

Authorization is handled using user roles.

```text
Normal User
    │
    ├── Browse Movies
    ├── View Showtimes
    ├── Select Seats
    └── Create Bookings


Admin
    │
    ├── User Management
    ├── Movie Management
    ├── Cinema Management
    ├── Hall Management
    ├── Seat Management
    ├── Showtime Management
    └── Booking Management
```

---

## 📡 API

The Angular frontend communicates with the backend through RESTful APIs.

Example API structure:

```text
/api/v1/users
/api/v1/movies
/api/v1/cinemas
/api/v1/halls
/api/v1/seats
/api/v1/showtimes
/api/v1/bookings
```

Example requests:

```http
GET /api/v1/movies
```

```http
GET /api/v1/cinemas
```

```http
GET /api/v1/showtimes
```

```http
POST /api/v1/bookings
```

The Angular application uses `HttpClient` to send HTTP requests and receive data from these endpoints.

---

## 🧪 API Testing

The backend APIs can be tested using:

* Postman
* Thunder Client
* Insomnia

Recommended testing flow:

```text
Register
   ↓
Verify OTP
   ↓
Login
   ↓
Get Movies
   ↓
Get Cinemas
   ↓
Get Showtimes
   ↓
Get Seats
   ↓
Create Booking
   ↓
Get User Bookings
```

---

## ⚙️ Installation

### Backend

Clone the repository:

```bash
git clone https://github.com/seif-amr-dev/Modern_Cinema_Project.git
```

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

Run the backend:

```bash
npm run dev
```

---

### Frontend

Navigate to the Angular application:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the Angular development server:

```bash
ng serve
```

The application will be available at:

```text
http://localhost:4200
```

---

## 🔒 Environment Variables

Never commit sensitive environment variables to GitHub.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

Add `.env` to `.gitignore`:

```text
.env
```

---

## 🗄️ Database Collections

The main MongoDB collections include:

```text
users
movies
cinemas
halls
seats
showtimes
bookings
```

MongoDB Atlas can be used to host the production database.

---

## 🚀 Future Improvements

Potential future improvements include:

* Online payment integration
* QR-code tickets
* Digital ticket generation
* Booking cancellation
* Refund system
* Movie reviews
* User ratings
* Favorite movies
* Discount codes
* Promotional offers
* Admin dashboard
* Revenue analytics
* Real-time seat locking
* Push notifications
* Automated testing
* CI/CD pipeline
* Production deployment

---

## 🎯 Project Goals

VOX Cinema was built to simulate a real-world cinema booking platform while applying modern web development practices.

The main goals include:

* Building a complete full-stack application
* Designing scalable REST APIs
* Implementing secure authentication
* Working with MongoDB and Mongoose
* Building an Angular frontend
* Connecting Angular with REST APIs
* Implementing real-world booking logic
* Managing relationships between multiple entities
* Applying role-based authorization
* Working collaboratively using Git and GitHub

---

## 👥 Team Project

VOX Cinema was developed as a team project as part of an **NTI training / graduation project**.

The project combines frontend and backend development to deliver a complete cinema management and ticket booking platform.

---

## 📸 Screenshots

Add screenshots of the application here:

```markdown
![Home Page](./screenshots/home.png)

![Movies](./screenshots/movies.png)

![Movie Details](./screenshots/movie-details.png)

![Seat Selection](./screenshots/seats.png)

![Booking](./screenshots/booking.png)

![Admin Dashboard](./screenshots/admin-dashboard.png)
```

---

## 📄 License

This project was developed for educational and training purposes.

---

# 🎬 VOX Cinema

### Discover. Choose. Book. Enjoy.

**A complete digital cinema experience built with Angular, Node.js, Express.js, and MongoDB.**
