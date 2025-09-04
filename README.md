<img width="1920" height="1080" alt="Screenshot (683)" src="https://github.com/user-attachments/assets/2967c3f7-0d8e-49ea-87a6-b39c45de00d0" /># 🩺 CarePulse – Doctor Appointment Platform  

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)  
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0ea5e9?style=for-the-badge&logo=tailwind-css&logoColor=white)  
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge)  
![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)  
![Sentry](https://img.shields.io/badge/Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white)  
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)  

> A modern **Doctor Appointment & Patient Management Platform** built with **Next.js**, featuring smooth UI, secure backend with **Appwrite**, SMS notifications with **Twilio**, and error monitoring via **Sentry**.  

---

## ✨ Features  

✅ **Patient Registration** – Easy onboarding with validated forms  
✅ **Book & Manage Appointments** – Patients can schedule, reschedule, or cancel  
✅ **Doctor Dashboard** – Admin/Doctors view with schedules and patient records  
✅ **SMS Notifications** – Appointment reminders powered by **Twilio**  
✅ **Secure Backend** – Built on **Appwrite** for auth & data handling  
✅ **Error Monitoring** – Integrated **Sentry** for production-grade reliability  
✅ **Modern UI** – Styled with **Tailwind CSS + shadcn/ui**  

---

## 🚀 Tech Stack  

- **Frontend**: [Next.js 15](https://nextjs.org) + [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)  
- **Backend**: [Appwrite](https://appwrite.io) (Database, Auth, API)  
- **Notifications**: [Twilio](https://www.twilio.com/) for SMS reminders  
- **Error Tracking**: [Sentry](https://sentry.io)  
- **Deployment**: [Vercel](https://vercel.com)  

---
📸 Screenshots

[Uploading Screenshot (683).png…]()
<img width="1920" height="1080" alt="Screenshot (684)" src="https://github.com/user-attachments/assets/2f9d18b8-f8c7-4d44-8f0e-6691edc2019f" />
<img width="1920" height="1080" alt="Screenshot (685)" src="https://github.com/user-attachments/assets/dd4ec277-727b-4287-a60f-c844f810ee59" />
<img width="1920" height="1080" alt="Screenshot (686)" src="https://github.com/user-attachments/assets/f1499be2-7706-4635-a736-1c1110299f5c" />
<img width="1920" height="1080" alt="Screenshot (687)" src="https://github.com/user-attachments/assets/9edc7415-626d-4934-83a3-c95f0302107e" />
<img width="1920" height="1080" alt="Screenshot (688)" src="https://github.com/user-attachments/assets/392be2d4-6e48-4bb5-bf8f-f18cd34564e3" />
<img width="1920" height="1080" alt="Screenshot (689)" src="https://github.com/user-attachments/assets/0e07f776-4a80-402f-983f-a09a0ff46a3e" />
<img width="1920" height="1080" alt="Screenshot (690)" src="https://github.com/user-attachments/assets/0dbd0174-4453-48f9-bfb8-10933ddae67d" />

## 🛠️ Getting Started  

Clone the repo:  

```bash
git clone https://github.com/your-username/dr-appointment-platform.git
cd dr-appointment-platform
Install dependencies:
npm install
# or
yarn install
# or
pnpm install
# or
bun install

Run the development server:
npm run dev
⚙️ Environment Variables

Create a .env.local file in the project root and add:
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_ADMIN_PASSKEY=your_secret_passkey

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

SENTRY_AUTH_TOKEN=your_sentry_auth_token
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

📦 Deployment

Easily deploy with Vercel!

