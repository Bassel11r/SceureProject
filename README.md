# Secure Web Application – Secure Project

## Description
A secure web application developed as part of an application security-focused project.  
This system demonstrates secure coding practices including authentication, authorization, input validation, encryption, role-based access control, and threat modeling using STRIDE and DREAD methodologies.

---

## Tech Stack
- Frontend: HTML / CSS / JavaScript (Vanilla)
- Backend: Node.js with Express.js
- Database: MongoDB (Mongoose)
- Authentication: JWT + bcrypt
- Security Middleware: Helmet, CORS, express-mongo-sanitize
- Environment Management: dotenv

---

## Features
- User Registration and Login system
- Role-based access control (Admin / User)
- Secure session handling using JWT
- Password hashing using bcrypt
- Encryption of sensitive data using AES
- Input validation and sanitization
- Protection against NoSQL injection
- Secure API structure (RESTful design)
- STRIDE & DREAD threat modeling included in documentation

---

## Security Implementations

- Input Validation: Express validation + schema validation (Mongoose)
- Output Sanitization: Data filtering before API responses
- Password Hashing: bcrypt with salt rounds
- Encryption: AES encryption for sensitive fields (e.g., phone numbers)
- Session Management: JWT with expiration time and secure signing
- Security Headers: Helmet (CSP, XSS protection, HSTS, etc.)
- CORS Policy: Restricted origin access control
- Rate Limiting: Prevent brute force attacks
- Authorization: Role-based middleware for admin/user access

---

## How to Run the Project


# Clone repository
git clone https://github.com/Bassel11r/SceureProject.git

# Enter project folder
cd SceureProject

# Install dependencies
npm install

# Start backend server
node server.js

#Start the front end
live-server frontend --port= replace with port number
