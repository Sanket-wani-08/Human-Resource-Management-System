# Human Resource Management System

A full-stack Human Resource Management System (HRMS) designed to centralize and streamline core human resource operations, including employee management, attendance, leave management, payroll, departments, holidays, and role-based access control.

The application is built using React, TypeScript, Node.js, Express.js, and MongoDB, with JWT-based authentication and dedicated functionality for Admin, HR, and Employee roles.

## Features

### Authentication and Authorization

* JWT-based authentication
* Secure password hashing using bcrypt
* Role-based access control
* Support for Admin, HR, and Employee roles
* Protected frontend routes
* Protected backend APIs

### Dashboard

Role-specific dashboards provide an overview of HR operations and relevant organizational data.

#### Admin and HR

* Employee statistics
* Department overview
* Attendance information
* Leave requests
* Payroll information
* Workforce overview

#### Employee

* Personal profile
* Attendance information
* Leave requests
* Payroll information
* Account details

### Employee Management

* Create employees
* View employee details
* Update employee information
* Manage employee status
* Assign departments
* Manage employee roles
* View employee profiles

### Department Management

* Create departments
* View departments
* Update department information
* Delete departments
* Assign employees to departments

### Attendance Management

* Employee check-in
* Employee check-out
* Attendance tracking
* Attendance history
* Attendance status management

### Leave Management

* Submit leave requests
* View leave history
* Approve leave requests
* Reject leave requests
* Track leave status
* Automated leave and status processing

### Payroll Management

* Manage employee payroll
* Maintain salary information
* Create payroll records
* View payroll details

### Holiday Management

* Create holidays
* View holidays
* Update holiday information
* Delete holidays

### Profile Management

* View personal profile
* Update profile information
* Manage account details

### Additional Features

* CSV data export
* Email service using Nodemailer
* Scheduled background processing using node-cron
* API validation using Yup
* HTTP security using Helmet
* CORS configuration
* MongoDB integration using Mongoose
* Postman API collection
* Database seed functionality

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js
* TypeScript
* REST APIs
* JWT
* bcryptjs
* Yup
* Nodemailer
* node-cron
* Helmet
* CORS

### Database

* MongoDB
* Mongoose

### Development Tools

* Git
* GitHub
* Postman
* VS Code
* npm

## Project Architecture

```text
Human Resource Management System
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   ├── package.json
│   └── tsconfig.json
│
├── postman/
│   └── API collection
│
└── README.md
```

## System Architecture

```text
User
 │
 ▼
React Frontend
 │
 │ HTTP Requests
 ▼
Express REST API
 │
 ├── Authentication
 ├── Authorization
 ├── Validation
 └── Business Logic
 │
 ▼
Mongoose
 │
 ▼
MongoDB
```

## User Roles

| Role     | Responsibilities                                                                   |
| -------- | ---------------------------------------------------------------------------------- |
| Admin    | Manage employees, departments, payroll, holidays, users, and overall HR operations |
| HR       | Manage employees, attendance, leaves, payroll, and HR-related operations           |
| Employee | Manage attendance, apply for leave, view payroll, and manage personal information  |

## Authentication Flow

The application uses JWT-based authentication and role-based authorization.

```text
User Login
    |
    v
Credential Validation
    |
    v
Password Verification
    |
    v
JWT Token Generation
    |
    v
Token Stored by Client
    |
    v
Protected API Request
    |
    v
JWT Verification
    |
    v
Role Authorization
    |
    v
Requested Resource
```

## Database

MongoDB is used as the primary database, with Mongoose providing schema definitions, data modeling, validation, and database interaction.

Major entities include:

* Users
* Employees
* Departments
* Attendance
* Leaves
* Payroll
* Holidays

Mongoose references and population are used where relationships between entities are required.

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

CLIENT_URL=http://localhost:5173
```

Do not commit environment files containing credentials or secrets to GitHub.

Recommended `.gitignore` entries:

```gitignore
.env
.env.local
.env.development
.env.production
node_modules/
dist/
```

For repository setup, an `.env.example` file can be provided:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

### Navigate to the Project

```bash
cd Human_Resource_Management_system
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

## Running the Application

### Start the Backend

From the `server` directory:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### Start the Frontend

Open a separate terminal:

```bash
cd client
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

## API Testing

The project includes a Postman collection for testing and validating the backend REST APIs.

The API covers major operations including:

### Authentication

* Login
* Registration
* Current user

### Employees

* Create employee
* Get employees
* Get employee by ID
* Update employee
* Delete employee

### Departments

* Create department
* Get departments
* Update department
* Delete department

### Attendance

* Check-in
* Check-out
* Retrieve attendance records

### Leaves

* Apply for leave
* Retrieve leave requests
* Approve leave
* Reject leave

### Payroll

* Create payroll
* Retrieve payroll
* Update payroll

### Holidays

* Create holiday
* Retrieve holidays
* Update holiday
* Delete holiday

## Database Seeding

The project includes a database seed mechanism for creating initial or demonstration data.

Before running the seed process:

1. Configure the MongoDB connection string.
2. Verify that MongoDB is accessible.
3. Install all backend dependencies.
4. Run the seed command configured in the backend project.

## Security

The application implements multiple security practices, including:

* JWT-based authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected API endpoints
* Helmet security headers
* CORS configuration
* Request validation using Yup
* Environment-based configuration for sensitive values

## Future Enhancements

Potential improvements include:

* Advanced HR analytics and reporting
* Automated salary slip generation
* PDF payroll reports
* Advanced attendance reports
* Employee performance management
* Real-time notifications
* Document management
* Advanced permission management
* Audit logging
* Automated testing
* CI/CD integration
* Cloud deployment

## Project Objective

The objective of this project is to provide a centralized platform for managing core HR operations and reducing manual administrative processes.

The system brings employee management, attendance, leave management, payroll, departments, and holiday management into a single application with role-based access control.

## Learning Outcomes

This project demonstrates practical experience in:

* Full-stack web application development
* React and TypeScript
* Node.js and Express.js
* REST API development
* MongoDB and Mongoose
* JWT authentication
* Role-based authorization
* CRUD operations
* API validation
* Database modeling and relationships
* Middleware architecture
* Email service integration
* Scheduled background jobs
* Frontend and backend integration
* Git and GitHub

## Author

**Sanket Wani**

Full Stack Developer
MERN Stack | TypeScript

## License

This project was developed for educational, portfolio, and technical evaluation purposes.
