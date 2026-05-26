# API Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Application                       │
│                  (Web/Mobile/Desktop)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/HTTPS Requests
                             │
        ┌────────────────────▼────────────────────┐
        │    Express.js API Server                │
        │  (Port 5000, Base URL: /api/v1)        │
        │                                         │
        │  ┌──────────────────────────────────┐  │
        │  │    Security Middleware           │  │
        │  │ • Helmet (secure headers)        │  │
        │  │ • CORS                           │  │
        │  │ • Rate Limiting                  │  │
        │  │ • Mongo Sanitization             │  │
        │  │ • JWT Authentication             │  │
        │  └──────────────────────────────────┘  │
        │                                         │
        │  ┌──────────────────────────────────┐  │
        │  │    API Route Handlers            │  │
        │  │ • /auth/register                 │  │
        │  │ • /auth/login                    │  │
        │  │ • /classes (create/join/list)    │  │
        │  │ • /attendance (mark/report)      │  │
        │  └──────────────────────────────────┘  │
        │                                         │
        │  ┌──────────────────────────────────┐  │
        │  │    Swagger UI                    │  │
        │  │  /api/v1/docs                    │  │
        │  └──────────────────────────────────┘  │
        └────────────────┬─────────────────────────┘
                         │
        ┌────────────────▼──────────────────────┐
        │    Database Layer                    │
        │   (MongoDB with Mongoose)            │
        │                                      │
        │  Collections:                        │
        │  • Users (Teachers & Students)       │
        │  • Classes                           │
        │  • AttendanceSessions               │
        │  • AttendanceRecords                 │
        └──────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
└──────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ┌─────────────┐                ┌──────────────┐
   │   Client    │ POST /register │  API Server  │
   │             │──────────────►│              │
   │             │                │  Validate    │
   │             │                │  Hash Pass   │
   │             │◄──────────────│  Save User   │
   │             │ User + Token   │              │
   └─────────────┘                └──────────────┘
                                        │
                                        ▼
                                   MongoDB
                                 (Users Collection)

2. LOGIN
   ┌─────────────┐                ┌──────────────┐
   │   Client    │  POST /login   │  API Server  │
   │             │──────────────►│              │
   │   email     │                │  Find User   │
   │   password  │                │  Verify Pass │
   │             │◄──────────────│  Create JWT  │
   │             │ JWT Token      │              │
   └─────────────┘                └──────────────┘
                                   + Refresh Token
                                   (in cookie/response)

3. AUTHENTICATED REQUEST
   ┌─────────────┐                ┌──────────────┐
   │   Client    │  GET /classes  │  API Server  │
   │             │  Bearer: JWT   │              │
   │             │──────────────►│              │
   │             │                │  Verify JWT  │
   │             │                │  Check Role  │
   │             │◄──────────────│  Return Data │
   │             │ Classes List   │              │
   └─────────────┘                └──────────────┘

4. TOKEN REFRESH
   ┌─────────────┐                ┌──────────────┐
   │   Client    │ POST /refresh  │  API Server  │
   │             │  RefreshToken  │              │
   │             │──────────────►│              │
   │             │                │  Validate RT │
   │             │◄──────────────│  New JWT     │
   │             │ New JWT Token  │              │
   └─────────────┘                └──────────────┘
```

## Class Management Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    Class Management Flow                         │
└──────────────────────────────────────────────────────────────────┘

TEACHER CREATES CLASS:
   Teacher (JWT)
        │
        ▼
   POST /api/v1/classes
   {name, description}
        │
        ▼
   Verify Role = "Teacher"
        │
        ▼
   Create Class Document
   Generate Class Code (ABC123XYZ)
        │
        ▼
   Save to MongoDB
        │
        ▼
   Return Class + Code to Teacher

STUDENT JOINS CLASS:
   Student (JWT)
        │
        ▼
   POST /api/v1/classes/:classId/join
   {classCode}
        │
        ▼
   Verify Role = "Student"
        │
        ▼
   Validate Class Code
        │
        ▼
   Add Student ID to Class.students[]
        │
        ▼
   Save to MongoDB
        │
        ▼
   Return Updated Class to Student

GET CLASSES:
   Teacher/Student (JWT)
        │
        ▼
   GET /api/v1/classes
        │
        ▼
   If Teacher: Return Classes where teacher = userId
   If Student: Return Classes where userId in students[]
        │
        ▼
   Return Classes List
```

## Attendance Tracking Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              Attendance Tracking Flow                            │
└──────────────────────────────────────────────────────────────────┘

SESSION LIFECYCLE:

1. TEACHER STARTS SESSION
   ┌──────────┐
   │ Teacher  │
   │ (JWT)    │
   └─────┬────┘
         │ POST /api/v1/attendance/start
         │ {classId}
         ▼
   ┌──────────────────────┐
   │ Verify Teacher Role  │
   │ Verify Class Exists  │
   │ Verify Teacher       │
   │ owns Class           │
   └─────┬────────────────┘
         │
         ▼
   ┌──────────────────────┐
   │ Create Session Doc   │
   │ status: "active"     │
   │ startTime: now()     │
   │ attendance: []       │
   └─────┬────────────────┘
         │
         ▼
   Return Session to Teacher

2. STUDENTS MARK ATTENDANCE (DURING SESSION)
   ┌──────────┐
   │ Student  │
   │ (JWT)    │
   └─────┬────┘
         │ POST /api/v1/attendance/mark
         │ {sessionId, status}
         ▼
   ┌──────────────────────┐
   │ Verify Session Active│
   │ Verify Student in    │
   │ Class                │
   │ Validate Status      │
   └─────┬────────────────┘
         │
         ▼
   ┌──────────────────────┐
   │ Add to               │
   │ Session.attendance[] │
   │ {studentId, status}  │
   └─────┬────────────────┘
         │
         ▼
   Confirm Marked

3. TEACHER ENDS SESSION
   ┌──────────┐
   │ Teacher  │
   │ (JWT)    │
   └─────┬────┘
         │ PUT /api/v1/attendance/end/:sessionId
         ▼
   ┌──────────────────────┐
   │ Verify Teacher Role  │
   │ Verify Session       │
   │ Owner                │
   └─────┬────────────────┘
         │
         ▼
   ┌──────────────────────┐
   │ Update Session:      │
   │ status: "closed"     │
   │ endTime: now()       │
   └─────┬────────────────┘
         │
         ▼
   Return Closed Session

4. TEACHER VIEWS REPORTS
   ┌──────────┐
   │ Teacher  │
   │ (JWT)    │
   └─────┬────┘
         │ GET /api/v1/attendance/reports/:classId
         │ ?startDate=2024-05-01&endDate=2024-05-31
         ▼
   ┌──────────────────────┐
   │ Verify Teacher Role  │
   │ Verify Ownership     │
   │ Query Sessions       │
   │ Calculate Stats      │
   └─────┬────────────────┘
         │
         ▼
   ┌──────────────────────┐
   │ For Each Student:    │
   │ • Count Present      │
   │ • Count Absent       │
   │ • Count Late         │
   │ • Calculate %        │
   └─────┬────────────────┘
         │
         ▼
   Return Detailed Report
```

## Role-Based Access Control (RBAC)

```
┌────────────────────────────────────────────────────┐
│         Role-Based Access Control                  │
└────────────────────────────────────────────────────┘

ENDPOINT                        TEACHER    STUDENT
────────────────────────────────────────────────────
/auth/register                    ✓          ✓
/auth/login                       ✓          ✓
/auth/logout                      ✓          ✓
/auth/refresh-token               ✓          ✓
/auth/forgot-password             ✓          ✓
/auth/reset-password              ✓          ✓
────────────────────────────────────────────────────
POST /classes (create)            ✓          ✗
GET /classes (list)               ✓          ✓
POST /classes/join                ✗          ✓
DELETE /classes/:id               ✓          ✗
────────────────────────────────────────────────────
POST /attendance/start            ✓          ✗
PUT /attendance/end               ✓          ✗
POST /attendance/mark             ✓          ✓
POST /attendance/override         ✓          ✗
GET /attendance/reports           ✓          ✗
────────────────────────────────────────────────────

Legend: ✓ = Allowed  ✗ = Blocked
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                   Error Handling Flow                            │
└──────────────────────────────────────────────────────────────────┘

Request Received
    │
    ▼
Validate Input
    │
    ├─ Invalid Format ──► 400 Bad Request
    │
    ▼
Check Authentication
    │
    ├─ No Token ────────► 401 Unauthorized
    ├─ Invalid Token ───► 401 Unauthorized
    │
    ▼
Verify Authorization (Role)
    │
    ├─ Wrong Role ──────► 403 Forbidden
    │
    ▼
Check Resource Exists
    │
    ├─ Not Found ───────► 404 Not Found
    │
    ▼
Check Business Logic
    │
    ├─ Duplicate ───────► 409 Conflict
    ├─ Invalid State ───► 400 Bad Request
    │
    ▼
Execute Operation
    │
    ├─ Success ────────► 200/201 OK/Created
    ├─ DB Error ───────► 500 Internal Server Error
    │
    ▼
Return Response with
- status code
- success flag
- message
- data (if applicable)
```

## Data Flow Example: Complete Attendance Session

```
┌─────────────────────────────────────────────────────────────────────┐
│              Complete Attendance Session Flow                      │
└─────────────────────────────────────────────────────────────────────┘

9:00 AM - TEACHER CREATES CLASS
         Create Class: "Physics 101"
         Class Code: ABC123
         │
         ▼
         MongoDB: Class {
           name: "Physics 101",
           code: "ABC123",
           teacher: teacher_id,
           students: []
         }

9:15 AM - STUDENTS JOIN CLASS
         3 Students join using code ABC123
         │
         ▼
         MongoDB: Class updated
         students: [student1_id, student2_id, student3_id]

2:00 PM - TEACHER STARTS ATTENDANCE SESSION
         POST /attendance/start
         classId: class_id
         │
         ▼
         MongoDB: AttendanceSession {
           classId: class_id,
           startTime: 2024-05-25 14:00:00,
           status: "active",
           attendance: []
         }
         │
         ▼
         Teacher gets: Session ID

2:05 PM - STUDENTS MARK ATTENDANCE
         Student 1: POST /attendance/mark
                    status: "present"
         │
         ├─► MongoDB: Session.attendance.push({
                     studentId: student1_id,
                     status: "present"
                   })
         │
         Student 2: POST /attendance/mark
                    status: "present"
         │
         ├─► MongoDB: Session.attendance.push({
                     studentId: student2_id,
                     status: "present"
                   })
         │
         Student 3: (didn't mark)
         │
         (Session auto-marks as absent)

3:00 PM - TEACHER ENDS SESSION
         PUT /attendance/end/:sessionId
         │
         ▼
         MongoDB: AttendanceSession updated
         {
           endTime: 2024-05-25 15:00:00,
           status: "closed",
           attendance: [
             {studentId: student1_id, status: "present"},
             {studentId: student2_id, status: "present"},
             {studentId: student3_id, status: "absent"}
           ]
         }

3:30 PM - TEACHER VIEWS REPORT
         GET /attendance/reports/class_id
         │
         ▼
         API generates report:
         {
           totalSessions: 1,
           students: [
             {
               studentId: student1_id,
               name: "Student 1",
               presentDays: 1,
               absentDays: 0,
               lateDays: 0,
               percentage: 100%
             },
             {
               studentId: student2_id,
               name: "Student 2",
               presentDays: 1,
               absentDays: 0,
               lateDays: 0,
               percentage: 100%
             },
             {
               studentId: student3_id,
               name: "Student 3",
               presentDays: 0,
               absentDays: 1,
               lateDays: 0,
               percentage: 0%
             }
           ]
         }
         │
         ▼
         Return to Teacher UI
```

---

**These diagrams help understand:**
- ✅ How authentication works
- ✅ Class lifecycle management
- ✅ Attendance tracking process
- ✅ Role-based access control
- ✅ Error handling mechanisms
- ✅ Complete data flow with timestamps

