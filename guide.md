# API Guide
## Login Flow

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET / POST | `/vtop/prelogin/setup` | Prelogin setup for session cookies and CSRF token |
| GET / POST | `/vtop/login` | Login page (get captcha & submit details) |
| POST | `/vtop/open/page` | Landing/Dashboard page after login |

---

## Student Details

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/vtop/studentsRecord/StudentProfileAllView` | Fetch complete student profile details |

---

## Academics

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/vtop/academics/common/StudentTimeTableChn` | Get Semester IDs (for timetable) |
| POST | `/vtop/processViewTimeTable` | Get student timetable for a semester |
| POST | `/vtop/academics/common/StudentAttendance` | Get Semester IDs (for attendance) |
| POST | `/vtop/processViewStudentAttendance` | Get student attendance for a semester |
| POST | `/vtop/processViewAttendanceDetail` | Get detailed subject-wise attendance |

---

## Examinations

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/vtop/examinations/StudExamSchedule` | Get Semester IDs (for exams) |
| POST | `/vtop/examinations/doSearchExamScheduleForStudent` | Get exam schedule for a semester |
| POST | `/vtop/examinations/examGradeView/StudentGradeHistory` | Fetch CGPA and course grade history |
| POST | `/vtop/examinations/StudentMarkView` | Get Semester IDs (for marks) |
| POST | `/vtop/examinations/doStudentMarkView` | Get student marks for a semester |

---

## Hostel

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/vtop/hostels/student/leave/1` | Open leave request page |
| POST | `/vtop/hostels/student/leave/2` | Leave request step (details) |
| POST | `/vtop/hostels/student/leave/3` | Submit leave request |
| POST | `/vtop/hostels/student/leave/4` | View leave status |
| POST | `/vtop/hostels/student/leave/5` | Cancel leave request *(assumed)* |
| POST | `/vtop/hostels/student/leave/6` | Leave history page |
| POST | `/vtop/hostels/room/allotment/info/student/1` | Get student hostel information |

---
