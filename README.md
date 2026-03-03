## Table of contents
* [About the project](#About-the-project)
* [Technologies](#Technologies)
* [Features](#Features)
* [Tests](#Tests)
* [Quick start](#Quick-start)
* [To do](#To-do)

## About the project
A full-stack project management application built with NestJS, Next.js, and PostgreSQL.
The application allows managing projects, tasks, and users with role-based access control.

The backend follows a layered architecture (controller–service–repository)
and is covered with unit tests.
## Technologies
* Node.js (developed on v22, compatible with LTS)
* Backend: NestJS 10, Prisma 6
* PostgreSQL
* Swagger (OpenAPI)
* Jest
* Frontend: Next.js (React)
* Docker
## Features
* JWT Authentication
* Role-based authorization
* Projects and tasks management
* Pagination in backend
* Swagger API documentation
* Database migrations and seed data
* Dockerized development environment
## Tests
* Jest testing framework
* Unit tests for controllers and services
* Prisma client mocked to isolate business logic from the database
## Quick start

### Backend
Clone repository and start database:
```bash
git clone https://github.com/Br4chi4lus/projects.git
cd projects
docker compose up -d db
```
Prepare environment, run migrations and seed data:  
Linux:
```bash
cd nestjs
mv .env.example .env
npm install
npx prisma migrate dev
npm run seed
```
Windows:
```md
cd nestjs
ren .env.example .env
npm install
npx prisma migrate dev
npm run seed
```
Start backend application:
```
docker compose up --build
```
Swagger is available at:
```
http://localhost:8080/api/swagger
```
To change role of first user you need to use pgadmin. Credentials are in docker-compose.yml file. Connecting to database with pgAdmin in given docker-compose.yml:
* Host - db
* user - postgres
* password - password
### Frontend
```
cd frontend
npm install
npm run dev
```
## To do
* Add pagination to frontend
* Improve frontend UI
* Add integration tests 
