# UniCC

**Live site:** [https://github.uni-cc.site/](https://uni-cc.site/)

**Repository:** [https://github.com/Arya4930/UniCC](https://github.com/Arya4930/UniCC)
**API Docs:** [https://api.uni-cc.site/docs](https://api.uni-cc.site/docs)
**API Stats:** [https://api.uni-cc.site/stats](https://api.uni-cc.site/docs)

---

## Why UniCC

University life spreads critical information across multiple portals and logins. UniCC exists to bring those essentials together in one focused experience so students can check attendance, grades, schedules, hostel status, and personal files without context switching.

UniCC is built for a single university and prioritizes reliability, clarity, and fast access to the data students check daily.

> Captcha solver logic is adapted from
> [ViBoot-Enhanced](https://github.com/arshsaxena/ViBoot-Enhanced/blob/main/js/captcha/captchaparser.js)

---

## What UniCC provides

**Student essentials in one place**
- Attendance tracking and status checks
- Grades and CGPA overview, plus semester-wise grades
- Timetables and schedules
- Hostel and mess status
- File upload, download, and management

**Clean, minimal UI**
- A focused interface for quick access to campus information

---

## Architecture at a glance

**Frontend**
- Next.js app in the root [src](src) directory
- UI components in [src/components](src/components)

**Backend**
- TypeScript server under [backend/src](backend/src)
- Route handlers in [backend/src/routes](backend/src/routes)
- Integrations and clients in [backend/src/lib/clients](backend/src/lib/clients)

**API**
- Documented at [https://api.uni-cc.site/docs](https://api.uni-cc.site/docs)
- Health and usage stats at [https://api.uni-cc.site/stats](https://api.uni-cc.site/docs)

---

## Hosted backend advantage

UniCC offers a hosted backend for most users. It removes the need to manage database and storage infrastructure while keeping the client setup straightforward.

**Recommended: Use the hosted backend**

The hosted UniCC backend API is available at `https://uniccapi.uni-cc.site/`.
To use it, update the API base URL in [src/components/custom/Main.tsx](src/components/custom/Main.tsx):

```ts
export const API_BASE = "https://uniccapi.uni-cc.site";
```

---

## Self-hosted backend (optional)

If you choose to host your own backend, you will need:
- A MongoDB database
- A Backblaze B2 bucket for file storage

Create a `.env` file in the backend with the following variables:

```
MONGODB_URI=

B2_ENDPOINT=
B2_BUCKET_NAME=
B2_ACCESS_KEY_ID=
B2_SECRET_ACCESS_KEY=
B2_REGION=

ADMINS=
ID_SALT=

SMTP_PASS=
SMTP_USER=
SMTP_HOST=
```

Start the backend:

```bash
npm run api-build
npm run api-start
```

> MongoDB and Backblaze B2 must be configured correctly for the backend to function.

---

## API endpoints

Each endpoint performs the function implied by its name:

```ts
app.use("/api/status", statusRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/login", loginRoutes);

app.use("/api/hostel", hostelRoutes);        // Hostel / mess status
app.use("/api/grades", gradesRoutes);        // Overall grades + CGPA
app.use("/api/schedule", scheduleRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/all-grades", allGradesRoutes); // Semester-wise grades

app.use("/api/files/upload/:userID", UploadFile);
app.use("/api/files/fetch/:userID", fetchFiles);
app.use("/api/files/delete/:userID/:fileID", deleteFile);
app.use("/api/files/download/:userID/:fileID", downloadFile);
```

---

## Getting started

### For students

Use the live site at [https://github.uni-cc.site/](https://uni-cc.site/) and sign in with your university credentials.

### For developers

1. Clone the repository:

   ```bash
   git clone https://github.com/Arya4930/UniCC.git
   cd UniCC
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the frontend:

   ```bash
   npx serve@latest out
   ```

4. (Optional) Configure the backend as described above.

---

## Sister project: ParentsCC

ParentsCC is a companion project built specifically for parents. It is a simplified, essentials-only version of UniCC with a more accessible interface.

- **Repository:** [https://github.com/Arya4930/ParentsCC](https://github.com/Arya4930/ParentsCC)
- **Live site:** [https://parents.uni-cc.site/](https://parents.uni-cc.site/)

---

## Contributing and community

Contributions are welcome. If you want to improve UI, add tests, refine documentation, or help with backend reliability, your input is valuable.

- Open an issue for bugs, ideas, or questions
- Fork the repository and submit a pull request
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

---

## License and credits

This project is licensed under the [MIT License](LICENSE).

Contributors:
- [Arya4930](https://github.com/Arya4930)
- [DumbTempest](https://github.com/DumbTempest)
- [Buy Me a Coffee](https://buymeacoffee.com/arya.dev)
