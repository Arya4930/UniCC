# UniCC

**Live site:** [https://github.uni-cc.site/](https://uni-cc.site/)

**Repository:** [https://github.com/Arya4930/UniCC](https://github.com/Arya4930/UniCC)

---

## Overview

UniCC is a web application designed specifically for students of a particular university.  
It provides a clean, minimalist interface to access campus-related information such as attendance, grades, schedules, hostel status, and file storage.

> Captcha solver logic is adapted from  
> [ViBoot-Enhanced](https://github.com/arshsaxena/ViBoot-Enhanced/blob/main/js/captcha/captchaparser.js)

---

## Sister Project

**ParentsCC** is a companion project built specifically for **parents**.  
It is a **stripped-down version of UniCC**, focusing only on essential information in a simpler and more accessible interface.

- **Repository:** [https://github.com/Arya4930/ParentsCC](https://github.com/Arya4930/ParentsCC)
- **Live site:** [https://parents.uni-cc.site/](https://parents.uni-cc.site/)

---

## Backend Usage (Important)

### 🔹 Recommended: Use the Hosted Backend (Preferred)

Hosting your own backend is **not recommended** unless you specifically need to, as it requires:
- A MongoDB database
- A Backblaze B2 bucket for file storage

Instead, you can directly use the **hosted UniCC backend API**: ```https://uniccapi.uni-cc.site/```
To do this, modify the API base URL in: `src/components/custom/main.tsx` Change it to:
```ts
export const API_BASE = "https://uniccapi.uni-cc.site";
```
---
## Optional: Hosting Your Own Backend
If you choose to host your own backend, create a .env file with the following variables:
```
MONGODB_URI=

B2_ENDPOINT=
B2_BUCKET_NAME=
B2_ACCESS_KEY_ID=
B2_SECRET_ACCESS_KEY=
B2_REGION=

ADMINS=
ID_SALT=
```
### Starting the backend
```bash
npm run api-build
npm run api-start
```
> Note: MongoDB and Backblaze B2 must be configured correctly for the backend to function.
---
## API Endpoints
Each endpoint performs the function implied by its name.
The backend exposes the following endpoints:

```ts
app.use("/api/status", statusRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/captcha", captchaRoutes);

app.use("/api/marks", marksRoutes);          // All marks
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

## Getting Started ( Frontend )

To run UniCC locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Arya4930/UniCC.git
   cd UniCC
   ```
2. **Install dependencies:**
   *(If a package manager like pnpm is used)*

   ```bash
   pnpm install
   ```
3. **Start the development server:**
   *(This may vary based on setup)*

   ```bash
   npx serve@latest out
   ```

## Contributing

Interested in contributing? Feel free to fork the repo and submit pull requests. Issues and feedback are welcome!

Please make sure to read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the [MIT License](LICENSE).

## Contributors

[![Arya4930](https://img.shields.io/badge/Arya4930-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Arya4930)
[![DumbTempest](https://img.shields.io/badge/DumbTempest-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DumbTempest)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/arya.dev)
