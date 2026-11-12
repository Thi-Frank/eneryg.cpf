# เผยแพร่จาก GitHub

Repository: https://github.com/Thi-Frank/eneryg.cpf

ใช้ Netlify Next.js runtime และ PostgreSQL อัตโนมัติผ่าน @netlify/database การ deploy ต้องใช้ Node 22.13+ คำสั่ง build `npm run build`, publish `.next` และ production branch `main` ตาม netlify.toml

ตั้ง environment ฝั่ง Netlify:

- SESSION_SECRET: random อย่างน้อย 32 ตัวอักษร (functions scope)
- PORTAL_API_TOKEN: random สำหรับ n8n → portal (functions scope)
- MAX_UPLOAD_MB: 4 สำหรับ serverless (เลือกต่ำกว่า request payload limit ของผู้ให้บริการ)
- N8N_INGEST_WEBHOOK_URL และ N8N_INGEST_TOKEN: ใส่หลังสร้าง n8n และเปิดใช้ production workflow

NETLIFY_DB_URL มาจาก Netlify Database ห้าม commit connection string ใน GitHub Migration ที่ netlify/database/migrations จะสร้างตาราง บัญชี Pilot Admin และข้อมูล Demo ตอน deploy ไม่ต้องรัน seed บน production

บัญชี Pilot ที่เจ้าของโปรเจกต์กำหนด: User `Admin`, Password `Admin` บทบาท admin รหัสผ่านเก็บเป็น bcrypt hash ในฐานข้อมูล ไม่มีการ bypass authentication

URL สำหรับ n8n หลังเผยแพร่: ใช้ origin ของเว็บต่อท้าย `/api/v1/observations`, `/api/v1/alerts`, `/api/v1/uploads/{upload_id}`, `/api/v1/feedback` พร้อม Authorization Bearer token ตาม API.md ต้องเผยแพร่สำเร็จและฐานข้อมูลพร้อมก่อนใช้ URL เหล่านี้

เอกสารแนบเก็บ bytea ใน PostgreSQL จึงคงอยู่ข้าม serverless instances และ redeploy สำรองฐานข้อมูลเพื่อสำรองทั้ง feedback และเอกสารแนบ

หากเว็บยังเปิด Netlify team SSO ไว้ n8n ภายนอกจะเรียกไม่ได้ ให้ใช้ application login สำหรับคนและ PORTAL_API_TOKEN สำหรับ n8n
