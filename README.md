# UniCC

**Live site:** [uni-cc.vercel.app](https://uni-cc.vercel.app)

**Repository:** [Arya4930/UniCC](https://github.com/Arya4930/UniCC)

## Overview

UniCC is a web app designed specifically for students of VIT Chennai. It provides a minimalist experience to help students access campus-related resources and tools.

## Getting Started

To run UniCC locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Arya4930/UniCC.git
   cd UniCC
   ```
2. **Install dependencies:**
   *(If a package manager like npm or yarn is used)*

   ```bash
   npm install
   ```
3. **Generate VAPID Keys** (for push notifications):

   * Install the `web-push` CLI globally:

     ```bash
     npm install -g web-push
     ```
   * Generate VAPID keys:

     ```bash
     web-push generate-vapid-keys
     ```
   * Copy the output and paste the keys into your `.env` file:

     ```env
     NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
     VAPID_PRIVATE_KEY=your_private_key_here
     ```
4. **Start the development server:**
   *(This may vary based on setup)*

   ```bash
   npm run dev
   ```

## Contributing

Interested in contributing? Feel free to fork the repo and submit pull requests. Issues and feedback are welcome!

Please make sure to read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the [MIT License](LICENSE).

## Contributors

[![Arya4930](https://img.shields.io/badge/Arya4930-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Arya4930)
[![DumbTempest](https://img.shields.io/badge/DumbTempest-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DumbTempest)

