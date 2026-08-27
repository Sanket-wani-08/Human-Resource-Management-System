Human Resource Management System (HRMS)

A full-stack Human Resource Management System built with React, TypeScript, Node.js, Express, MongoDB, and Mongoose.






Overview

The Human Resource Management System (HRMS) is a web-based full-stack application developed as a technical assignment for Wellvia Wellness Private Limited. It provides a centralized platform for managing core HR operations including employee records, authentication, role-based access, departments, attendance, leave, payroll, holidays, employee profiles, dashboards, and system settings.

The system is designed around three roles:

ADMIN — overall system and HR administration

HR — day-to-day HR operations

EMPLOYEE — self-service access to personal HR information

The application uses a REST API architecture, JWT authentication, role-based authorization, MongoDB persistence, validation/error handling, and production deployment using Vercel, Render, and MongoDB Atlas.

Assignment Requirements Coverage

The following requirements from the technical assignment are implemented and documented in this repository:

Assignment Requirement

Status

Implementation

Employee Management

✓

Employee CRUD, search, filtering, status management, department assignment

Authentication

✓

JWT login, logout response, current-user endpoint, bcrypt password hashing

Role-Based Access

✓

ADMIN, HR and EMPLOYEE authorization

Employee Profiles

✓

Employee profile and account-linked employee information

Attendance & Check-In/Check-Out

✓

Check-in, check-out, history, management and working-hours calculation

Leave Management

✓

Leave application, history, approval and rejection

Payroll Management

✓

Payroll generation, calculation, update, payment status and employee access

Department Management

✓

Department CRUD, manager reference and employee relationship handling

Admin/HR Dashboard

✓

Workforce, attendance, leave and payroll summary data

Employee Dashboard

✓

Personal attendance, leave, payroll and profile summary

Backend APIs

✓

RESTful Express API under /api

Database Architecture

✓

MongoDB + Mongoose models, references and indexes

Validation

✓

Mongoose validation and controller-level business validation

Error Handling

✓

Global Express error middleware

Security & Access Control

✓

JWT, bcrypt, authorization middleware, Helmet, CORS, protected routes

README / Setup Documentation

✓

Complete setup and deployment documentation

Database Schema / Migrations

✓

Mongoose schemas documented; MongoDB does not use SQL migrations

Demo Credentials

✓

Admin, HR and Employee demo access provided below

API Documentation / Collection

✓

Endpoint documentation + Postman collection

Required Demo/Test Data

✓

Demo department, employee, attendance, leave, payroll and related data prepared for evaluation

Live Deployment

✓

Vercel frontend and Render backend

Testing & Verification

✓

Major workflows, APIs, roles, security and deployment verified

Live Application

Frontend: https://human-resource-management-system-green.vercel.app/login
Backend API: https://human-resource-management-system-1-uwxr.onrender.com/api

The frontend communicates with the backend through the VITE_API_URL environment variable.

Demo Credentials

Admin

Email:    admin@hrms.com
Password: Admin@123
Role:     ADMIN

HR

Email:    hr@hrms.com
Password: Hr@12345
Role:     HR

Employee

A demo Employee account is included in the prepared evaluation data.

Employee accounts can also be created by an authorized Admin/HR user from the Employee Management module. If a password is not supplied while creating an employee, the current backend uses:

Default@123

Security: The credentials above are demonstration credentials for technical evaluation only. Production deployments should use new credentials and strong secrets.

Key Features

Authentication & Authorization

JWT-based authentication

bcrypt password hashing

Login and logout flow

Current authenticated-user endpoint

Protected frontend routes

Protected backend routes

Role-based authorization middleware

Active/deactivated account verification

Employee Management

Create employee accounts and employee profiles

Automatic employee ID generation (EMP001, EMP002, ...)

View employee details

Search employees

Filter by department and status

Pagination support

Update employee information

Assign departments

Assign employee roles

Change employment status

Soft-delete/deactivate employees

Department Management

Create departments

View departments

View department details

Assign department managers

Update departments

Delete departments

Prevent deletion of departments that still have employees assigned

Attendance

Employee check-in

Employee check-out

Duplicate same-day check-in prevention

Checkout-without-check-in prevention

Duplicate checkout prevention

Automatic working-hours calculation

PRESENT/LATE status calculation

Employee attendance history

Admin/HR attendance management

Attendance filtering by date and employee

Attendance CSV export

IST-aware daily attendance boundaries

Leave Management

Apply for leave

Leave types and date ranges

Leave history

Pending/approved/rejected statuses

Admin/HR leave review

Approve/reject actions

Reviewer and review timestamp tracking

Overlapping leave prevention

Self-approval/self-rejection prevention

Employee status update for active approved leave

Email notifications for approval/rejection

Payroll

Payroll generation

Employee salary lookup

Allowances

Bonus

Deductions

Tax

Automatic net salary calculation

Duplicate payroll prevention for the same employee/month/year

Payroll update

Pending/Paid status

Payment date tracking

Employee payroll history

Payroll filtering

Payroll CSV export

Payslip email notification

Holidays

View holidays

Create holidays

Delete holidays

Public, company and optional holiday types

Dashboards

Admin / HR Dashboard

Total employees

Active employees

Active departments

Today's attendance

Today's absence calculation

Pending leave requests

Current-month payroll summary

Employee Dashboard

Employee identity and designation

Department

Today's attendance

Pending leaves

Recent leave requests

Recent attendance

Current-month payroll

Profile & Settings

Employee profile page

Company name setting

Late check-in time setting

Admin-only settings update

CSV Reporting

CSV export is implemented for operational reports including:

Attendance

Payroll

User Roles & Permissions

Authorization is enforced by the backend and is not dependent only on frontend navigation.

Feature

ADMIN

HR

EMPLOYEE

Admin/HR dashboard

✓

✓

—

Employee dashboard

—

—

✓

Manage employees

✓

✓

—

View departments

✓

✓

✓

Create/update/delete departments

✓

—

—

View all attendance

✓

✓

—

Own attendance

✓*

✓*

✓

Check-in/check-out

✓*

✓*

✓

Update/delete attendance

✓

✓

—

Apply for leave

✓*

✓*

✓

View all leave requests

✓

✓

—

Approve/reject leave

✓

✓

—

View all payroll

✓

✓

—

Manage payroll

✓

✓

—

View own payroll

✓*

✓*

✓

View holidays

✓

✓

✓

Manage holidays

✓

✓

—

View settings

✓

✓

✓

Update settings

✓

—

—

* The API permits authenticated users with a linked Employee record for self-service operations. The role-specific frontend navigation exposes features according to the application role.

Technology Stack

Frontend

React 19

TypeScript

Vite

Tailwind CSS

React Router DOM

Axios

TanStack React Query

React Hook Form

Yup / form resolvers

React Hot Toast

Lucide React

Backend

Node.js

Express 5

TypeScript

MongoDB

Mongoose

JSON Web Token (jsonwebtoken)

bcryptjs

Helmet

CORS

Morgan

Nodemailer

node-cron

dotenv

Development & Deployment

npm

Git / GitHub

Postman

MongoDB Atlas

Vercel

Render

System Architecture

                         ┌─────────────────────────┐
                         │        End Users        │
                         │ Admin / HR / Employee   │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │    React + TypeScript   │
                         │      Vite Frontend     │
                         │    Tailwind CSS UI     │
                         └────────────┬────────────┘
                                      │
                               HTTP / REST / JWT
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   Node.js + Express     │
                         │      REST Backend       │
                         ├─────────────────────────┤
                         │ Auth Middleware         │
                         │ Role Authorization     │
                         │ Controllers             │
                         │ Business Logic          │
                         │ Error Middleware        │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       Mongoose ODM      │
                         │ Schemas / References    │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       MongoDB Atlas     │
                         │ HRMS Persistent Data    │
                         └─────────────────────────┘

Supporting Services

Nodemailer + Ethereal: development/test email notifications

node-cron: daily employee leave-status synchronization

CSV utility: client-side operational report exports

Project Structure

Human-Resource-Management-System/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── vercel.json
│
├── postman/
│   └── HRMS_API.postman_collection.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md

Database Architecture

The application uses MongoDB with Mongoose. The data model is organized into eight collections/models.

1. User

Authentication and account information.

name
email
password
role
employee
isActive
createdAt
updatedAt

Roles:

ADMIN
HR
EMPLOYEE

Passwords are hashed with bcrypt before persistence.

2. Employee

employeeId
user
firstName
lastName
email
phone
dateOfBirth
gender
address
designation
department
joiningDate
employmentType
salary
status
profileImage
createdAt
updatedAt

Employment types:

FULL_TIME
PART_TIME
CONTRACT
INTERN

Employee statuses:

ACTIVE
ON_LEAVE
TERMINATED
RESIGNED

3. Department

name
description
manager
isActive
createdAt
updatedAt

manager references an Employee.

4. Attendance

employee
date
checkIn
checkOut
status
totalHours
createdAt
updatedAt

Statuses:

PRESENT
ABSENT
LATE
HALF_DAY
LEAVE

A unique compound index prevents duplicate attendance for an employee/date combination:

{ employee: 1, date: 1 }

5. Leave

employee
leaveType
startDate
endDate
reason
status
reviewedBy
reviewedAt
createdAt
updatedAt

Statuses:

PENDING
APPROVED
REJECTED

reviewedBy references the User who reviewed the request.

6. Payroll

employee
month
year
basicSalary
allowances
bonus
deductions
tax
netSalary
paymentStatus
paymentDate
createdAt
updatedAt

Payment statuses:

PENDING
PAID

7. Holiday

name
date
type
createdAt
updatedAt

Types:

PUBLIC
COMPANY
OPTIONAL

8. Setting

companyName
lateCheckInTime
createdAt
updatedAt

Entity Relationships

User
 │
 └────────────── Employee
                    │
                    ├──────── Department
                    │
                    ├──────── Attendance
                    │
                    ├──────── Leave
                    │
                    └──────── Payroll

Department
 │
 └──────── manager → Employee

Leave
 │
 └──────── reviewedBy → User

Mongoose ObjectId references are used for relationships and populate() is used where related data is required.

Authentication & Authorization Flow

Login Form
    │
    ▼
POST /api/auth/login
    │
    ▼
Find user by email
    │
    ▼
Compare bcrypt password
    │
    ▼
Check isActive
    │
    ▼
Generate JWT
    │
    ▼
Return user + token
    │
    ▼
Frontend stores authentication state
    │
    ▼
Axios sends Authorization: Bearer <token>
    │
    ▼
JWT authentication middleware
    │
    ▼
Load user + verify active status
    │
    ▼
Role authorization middleware
    │
    ▼
Protected controller

The backend authorization layer is the source of truth for access control.

REST API Documentation

Base URLs

Local

http://localhost:5000/api

Production

https://human-resource-management-system-1-uwxr.onrender.com/api

Protected routes use:

Authorization: Bearer <JWT_TOKEN>

Authentication

Method

Endpoint

Access

Description

POST

/auth/login

Public

Authenticate user and return JWT

POST

/auth/logout

Public

Return logout success response; client removes token

GET

/auth/me

Authenticated

Return current authenticated user

Employees

Method

Endpoint

Access

Description

GET

/employees

ADMIN, HR

List employees with search/filter/pagination

POST

/employees

ADMIN, HR

Create linked User + Employee

GET

/employees/:id

ADMIN, HR

Get employee

PUT

/employees/:id

ADMIN, HR

Update employee

DELETE

/employees/:id

ADMIN, HR

Deactivate employee

PATCH

/employees/:id/status

ADMIN, HR

Update employee status

Employee list supports:

?department=<id>&status=<status>&search=<text>&page=1&limit=10

Departments

Method

Endpoint

Access

Description

GET

/departments

Authenticated

List departments

GET

/departments/:id

Authenticated

Get department

POST

/departments

ADMIN

Create department

PUT

/departments/:id

ADMIN

Update department

DELETE

/departments/:id

ADMIN

Delete department

Attendance

Method

Endpoint

Access

Description

POST

/attendance/check-in

Authenticated + Employee

Check in

POST

/attendance/check-out

Authenticated + Employee

Check out

GET

/attendance/my

Authenticated + Employee

Own attendance

GET

/attendance

ADMIN, HR

All attendance

PUT

/attendance/:id

ADMIN, HR

Update attendance

DELETE

/attendance/:id

ADMIN, HR

Delete attendance

Supported list filters:

?date=<date>&employeeId=<employeeId>

Leave

Method

Endpoint

Access

Description

POST

/leaves

Authenticated + Employee

Apply for leave

GET

/leaves/my

Authenticated + Employee

Own leave history

GET

/leaves

ADMIN, HR

View all leave requests

PATCH

/leaves/:id/approve

ADMIN, HR

Approve leave

PATCH

/leaves/:id/reject

ADMIN, HR

Reject leave

Supported list filters:

?status=<status>&employeeId=<employeeId>

Payroll

Method

Endpoint

Access

Description

GET

/payroll/my

Authenticated + Employee

Own payroll

POST

/payroll

ADMIN, HR

Create payroll

GET

/payroll

ADMIN, HR

List payroll

GET

/payroll/:id

ADMIN, HR

Get payroll by ID

PUT

/payroll/:id

ADMIN, HR

Update payroll

Supported list filters:

?month=<month>&year=<year>&employeeId=<employeeId>

Holidays

Method

Endpoint

Access

Description

GET

/holidays

Authenticated

View holidays

POST

/holidays

ADMIN, HR

Create holiday

DELETE

/holidays/:id

ADMIN, HR

Delete holiday

Dashboard

Method

Endpoint

Access

Description

GET

/dashboard/admin

ADMIN, HR

Admin/HR dashboard metrics

GET

/dashboard/employee

Authenticated

Employee dashboard data

Settings

Method

Endpoint

Access

Description

GET

/settings

Authenticated

Get system settings

PUT

/settings

ADMIN

Update system settings

Postman API Collection

A Postman collection is included in the repository:

postman/HRMS_API.postman_collection.json

Collection groups include:

Authentication

Employees

Departments

Attendance

Leaves

Payroll

Holidays

Dashboard

Settings

The collection is intended for API verification and technical demonstration.

Validation & Error Handling

The application validates data at multiple layers.

Validation

Mongoose required fields

Mongoose enum validation

Unique email validation

Unique employee ID validation

Unique department name validation

ObjectId/resource existence checks

Employee/department relationship checks

Duplicate attendance prevention

Duplicate payroll prevention

Leave date-range validation

Overlapping leave prevention

Status/business-rule validation

Global Error Handler

The Express application uses a global error middleware for:

Mongoose validation errors

Invalid MongoDB ObjectId / CastError

Duplicate key errors

Unexpected server errors

Typical response status codes:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error

In production, stack traces are not returned to clients.

Yup is included and used on the frontend for form validation/resolution. Backend validation primarily uses Mongoose schema validation and explicit controller-level business rules.

Security

Security controls implemented in the project include:

JWT authentication

bcrypt password hashing

Role-based backend authorization

Protected React routes

Protected REST API routes

Active-user verification

Helmet security headers

CORS configuration

Environment variables for secrets/configuration

Mongoose validation

Duplicate-record protection

Production stack-trace suppression

Soft deactivation of employees instead of destructive deletion

Sensitive .env files are excluded from source control and .env.example is provided for configuration reference.

Core Business Logic

Employee Deactivation

Employee deletion is implemented as deactivation rather than physical deletion:

Employee.status = TERMINATED
User.isActive  = false

This preserves historical HR information while disabling access.

Attendance

The system:

Allows one attendance record per employee per day.

Prevents duplicate check-in.

Requires check-in before checkout.

Prevents duplicate checkout.

Calculates total working hours.

Determines PRESENT or LATE using the configured late-check-in time.

Uses IST-aware daily boundaries for self-service attendance.

Leave

The system:

Validates start/end dates.

Prevents overlapping pending/approved leave periods.

Records the reviewing user and review timestamp.

Prevents users from approving/rejecting their own leave.

Updates an employee to ON_LEAVE when an approved leave is active.

Sends development/test email notifications for approval and rejection.

Payroll

Net salary is calculated as:

Net Salary = Basic Salary + Allowances + Bonus - Deductions - Tax

The system:

Uses the employee's current salary as basic salary.

Prevents duplicate payroll for the same employee/month/year.

Supports pending and paid states.

Records payment date when marked paid.

Sends a test email notification when a payslip is generated.

Email Notifications & Scheduled Jobs

Email Service

Nodemailer is integrated with Ethereal test SMTP for development/testing.

Notifications are generated for:

Leave approval

Leave rejection

Payslip generation

The backend logs the Ethereal preview URL for test messages.

For production use, Ethereal should be replaced with a real transactional SMTP/email provider.

Scheduled Cron Job

node-cron runs a daily job at midnight to synchronize employee leave status:

Find approved leaves covering the current date.

Set eligible active employees to ON_LEAVE.

Find employees whose leave is no longer active.

Return those employees to ACTIVE.

Database Schema / Migrations

This project uses MongoDB rather than a relational SQL database, so it does not use traditional SQL migration files.

The source-of-truth schemas are located in:

server/src/models/

Model files:

user.model.ts
employee.model.ts
department.model.ts
attendance.model.ts
leave.model.ts
payroll.model.ts
holiday.model.ts
setting.model.ts

Mongoose provides:

Field definitions

Required fields

Enum constraints

References

Unique constraints

Indexes

Validation

Timestamps

Environment Variables

Create server/.env from server/.env.example.

Example:

PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173

For the frontend, configure:

VITE_API_URL=http://localhost:5000/api

Variables

Variable

Purpose

PORT

Backend port

NODE_ENV

Runtime environment

MONGO_URI

MongoDB connection string

JWT_SECRET

JWT signing secret

CLIENT_URL

Frontend origin/configuration

VITE_API_URL

Frontend API base URL

Never commit real secrets to GitHub.

Local Development Setup

Prerequisites

Node.js

npm

MongoDB Atlas or local MongoDB

Git

Postman (recommended for API testing)

1. Clone the Repository

git clone https://github.com/Sanket-wani-08/Human-Resource-Management-System
cd Human-Resource-Management-System

2. Install Backend Dependencies

cd server
npm install

Create server/.env and configure MongoDB/JWT/frontend settings.

3. Install Frontend Dependencies

Open a second terminal:

cd client
npm install

Configure VITE_API_URL if required.

4. Start Backend

From server/:

npm run dev

Backend:

http://localhost:5000

5. Start Frontend

From client/:

npm run dev

Frontend:

http://localhost:5173

Available Scripts

Frontend

npm run dev
npm run build
npm run lint
npm run preview

Command

Purpose

npm run dev

Start Vite development server

npm run build

TypeScript build + Vite production build

npm run lint

Run Oxlint

npm run preview

Preview production build

Backend

npm run dev
npm run build
npm start
npm run seed

Command

Purpose

npm run dev

Start development server using Nodemon/tsx

npm run build

Compile TypeScript

npm start

Run compiled production server

npm run seed

Seed Admin and HR system users

Database Seeding & Demo Data

The repository includes a seed script:

cd server
npm run seed

The seed script creates the system Admin and HR accounts.

Prepared evaluation data also includes the required demonstration records for the HRMS workflow, including:

✓ Demo department data

✓ Demo employee account/data

✓ Demo attendance data

✓ Demo leave data

✓ Demo payroll data

✓ Demo holiday data

The application can additionally create and manage these records through the appropriate Admin/HR workflows.

The seed script clears User documents before recreating the Admin and HR accounts. It does not intentionally clear departments and employee records created through the dashboard.

Production Deployment

The project is deployed using:

Frontend → Vercel
Backend  → Render
Database → MongoDB Atlas

Render Backend

Build command:

npm install && npm run build

Start command:

npm start

Production configuration should include:

NODE_ENV=production
MONGO_URI=<MONGODB_ATLAS_CONNECTION_STRING>
JWT_SECRET=<STRONG_PRODUCTION_SECRET>
CLIENT_URL=<VERCEL_FRONTEND_URL>

The server listens on 0.0.0.0 for hosted deployment compatibility.

Vercel Frontend

Build command:

npm run build

Set:

VITE_API_URL=<RENDER_BACKEND_URL>/api

client/vercel.json contains the SPA rewrite required for React Router routes to resolve correctly after direct navigation/refresh.

Testing & Verification

The application has been manually tested and verified across the major HRMS workflows, user roles, API modules, security controls, and production deployment.

Authentication

✓ Login with valid Admin credentials
✓ Login with valid HR credentials
✓ Login with valid Employee credentials
✓ Invalid email/password validation
✓ Protected API access without JWT
✓ Invalid/expired JWT handling
✓ Deactivated user access prevention

Employee Management

✓ Create employee
✓ Automatic employee ID generation
✓ View employees
✓ Search employees
✓ Filter employees
✓ Update employee
✓ Change employee status
✓ Deactivate employee
✓ Deactivated employee login prevention

Department Management

✓ Create department
✓ View department
✓ Update department
✓ Assign employees to departments
✓ Prevent deletion of departments with assigned employees
✓ Delete unused department

Attendance

✓ Employee check-in
✓ Duplicate check-in prevention
✓ Employee check-out
✓ Checkout without check-in prevention
✓ Duplicate checkout prevention
✓ Working-hours calculation
✓ Attendance history
✓ Admin/HR attendance management
✓ Attendance CSV export

Leave Management

✓ Employee leave application
✓ Employee leave history
✓ Admin/HR leave request management
✓ Leave approval
✓ Leave rejection
✓ Leave reviewer information
✓ Employee leave-status handling
✓ Leave email notification flow

Payroll

✓ Payroll generation
✓ Basic salary calculation
✓ Allowances calculation
✓ Bonus calculation
✓ Deductions calculation
✓ Tax calculation
✓ Net salary calculation
✓ Duplicate payroll prevention
✓ Payroll update
✓ Mark payroll as paid
✓ Payment date handling
✓ Employee payroll access
✓ Payroll CSV export

Holidays

✓ View holidays
✓ Create holidays
✓ Delete holidays
✓ Holiday type handling

Role-Based Access Control

✓ Admin permissions verified
✓ HR permissions verified
✓ Employee permissions verified
✓ Protected frontend routes verified
✓ Protected backend routes verified
✓ Unauthorized role access rejected

Security

✓ JWT authentication verified
✓ Password hashing verified
✓ Bearer-token authentication verified
✓ Role-based authorization verified
✓ Helmet security headers verified
✓ CORS configuration verified
✓ Environment-based secrets verified
✓ Production error handling verified

API Testing

✓ Authentication APIs tested
✓ Employee APIs tested
✓ Department APIs tested
✓ Attendance APIs tested
✓ Leave APIs tested
✓ Payroll APIs tested
✓ Holiday APIs tested
✓ Dashboard APIs tested
✓ Settings APIs tested
✓ Postman collection tested

Frontend / Backend Integration

✓ Frontend connected to backend APIs
✓ Authentication flow verified
✓ CRUD operations verified
✓ Role-based dashboards verified
✓ Error handling verified
✓ Form validation verified
✓ Production deployment verified

Submission Deliverables

The technical assignment requested the following deliverables, all included/prepared for submission:

Deliverable

Status

GitHub Repository

✓

Live Deployment Link

✓

README / Setup Documentation

✓

Database Schema / Migrations Documentation

✓

Demo Credentials

✓

API Documentation

✓

Postman API Collection

✓

Required Demo/Test Data

✓

Tested Application

✓

Repository Contents

✓ Full frontend source code
✓ Full backend source code
✓ MongoDB/Mongoose models
✓ REST API routes/controllers
✓ Authentication and authorization middleware
✓ Seed script
✓ Postman collection
✓ Environment example file
✓ Vercel configuration
✓ README documentation

Technical Design Decisions

Why React + TypeScript?

React provides component-based UI development while TypeScript improves type safety and maintainability across pages, API data, forms, and shared application types.

Why Node.js + Express?

Express provides a lightweight REST API layer suitable for implementing HRMS modules, middleware-based authentication, authorization, validation, and error handling.

Why MongoDB + Mongoose?

MongoDB is suitable for the application's document-oriented HR records, while Mongoose provides structured schemas, validation, references, indexes, and convenient population of related records.

Why JWT?

JWT provides stateless API authentication and works well with a separate React frontend and Express backend.

Why Soft Deactivation?

Employee history such as attendance, leave and payroll should remain available even after an employee leaves the organization. Therefore, employee deletion deactivates the account instead of physically removing the employee record.

Known Implementation Notes

Admin and HR system accounts are separate User records and are not automatically represented as Employee records by the seed script.

Employee accounts are linked User + Employee records created through the employee-management workflow.

Employee deletion is implemented as deactivation (TERMINATED + inactive user) to preserve history.

Department modification is Admin-only at the API level.

Holiday modification is available to Admin and HR.

Payroll management is restricted to Admin/HR, while employees can access their own payroll records.

The email service uses Ethereal test SMTP in the current implementation.

MongoDB/Mongoose models serve as the database schema; there is no SQL migration framework.

The Postman collection is committed under postman/HRMS_API.postman_collection.json.

The application has been tested using the prepared Admin, HR, Employee and demonstration HRMS data.

Future Enhancements

Potential production enhancements include:

Automated unit and integration test suite

Production transactional email provider

PDF payslip generation

Advanced attendance analytics

Employee performance management

HR document management

Audit logging

Fine-grained permissions

Real-time notifications

CI/CD automation

Automated database backups

Advanced HR analytics and reporting

Final Submission Checklist

✓ Functional HRMS application
✓ Authentication and role-based access
✓ Employee management
✓ Employee profiles
✓ Attendance check-in/check-out
✓ Leave management
✓ Payroll management
✓ Department management
✓ Holiday management
✓ Admin/HR dashboards
✓ Employee dashboard
✓ REST backend APIs
✓ MongoDB database architecture
✓ Validation and error handling
✓ Security and access control
✓ Demo credentials
✓ Demo/test data
✓ Postman API collection
✓ API documentation
✓ Deployment documentation
✓ Live frontend deployment
✓ Live backend deployment
✓ Testing and verification completed
✓ README documentation completed

Author

Sanket Wani
Full Stack Developer | MERN Stack | TypeScript

License

This project was developed for educational, portfolio, and technical evaluation purposes.