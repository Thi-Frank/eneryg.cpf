# เผยแพร่จาก GitHub

Repository: https://github.com/Thi-Frank/eneryg.cpf

Production URL: https://boiler-nongchok.netlify.app
Project dashboard: https://app.netlify.com/projects/boiler-nongchok
เว็บ production เข้าจากภายนอกได้โดยใช้ application login; preview คง Netlify team SSO ตามที่เจ้าของอนุญาต

ใช้ Netlify Next.js runtime และ PostgreSQL อัตโนมัติผ่าน @netlify/database การ deploy ต้องใช้ Node 22.13+ คำสั่ง build `npm run build`, publish `.next` และ production branch `main` ตาม netlify.toml

ตั้ง environment ฝั่ง Netlify:

- SESSION_SECRET: random อย่างน้อย 32 ตัวอักษร (functions scope)
- PORTAL_API_TOKEN: random สำหรับ n8n → portal (functions scope)
- MAX_UPLOAD_MB: 4 สำหรับ serverless (เลือกต่ำกว่า request payload limit ของผู้ให้บริการ)
- PORTAL_ORIGIN: https://boiler-nongchok.netlify.app (production functions scope) สำหรับตรวจ Origin หลัง reverse proxy
- N8N_INGEST_WEBHOOK_URL และ N8N_INGEST_TOKEN: ใส่หลังสร้าง n8n และเปิดใช้ production workflow

NETLIFY_DB_URL มาจาก Netlify Database ห้าม commit connection string ใน GitHub Migration ที่ netlify/database/migrations จะสร้างตาราง บัญชี Pilot Admin และข้อมูล Demo ตอน deploy ไม่ต้องรัน seed บน production

บัญชี Pilot ที่เจ้าของโปรเจกต์กำหนด: User `Admin`, Password `Admin` บทบาท admin รหัสผ่านเก็บเป็น bcrypt hash ในฐานข้อมูล ไม่มีการ bypass authentication

URL สำหรับ n8n หลังเผยแพร่: ใช้ origin ของเว็บต่อท้าย `/api/v1/observations`, `/api/v1/alerts`, `/api/v1/uploads/{upload_id}`, `/api/v1/feedback` พร้อม Authorization Bearer token ตาม API.md ต้องเผยแพร่สำเร็จและฐานข้อมูลพร้อมก่อนใช้ URL เหล่านี้

เอกสารแนบเก็บ bytea ใน PostgreSQL จึงคงอยู่ข้าม serverless instances และ redeploy สำรองฐานข้อมูลเพื่อสำรองทั้ง feedback และเอกสารแนบ

ค่า API token ที่สร้างให้เก็บอยู่ใน `storage/hosting-secrets.json` ในเครื่องเจ้าของและ secret environment ของ Netlify ไม่อยู่บน GitHub นำเฉพาะ PORTAL_API_TOKEN ไปใส่ n8n credential แบบ Bearer เมื่อสร้าง workflow แล้ว ห้ามใส่ token ใน URL หรือ client code

การเผยแพร่ครั้งนี้ใช้ Netlify CLI จากซอร์สชุดเดียวกับ GitHub ยังไม่ได้เปิด continuous deployment อัตโนมัติจาก GitHub การ push โค้ดอย่างเดียวจึงยังไม่เปลี่ยนเว็บ production

สำหรับ deploy จากเครื่องนี้ ใช้ `scripts/deploy-hosted.cjs` (ต้องติดตั้ง Netlify CLI และ login ก่อน) สคริปต์ใช้ secret จากไฟล์ที่ ignore ไว้และส่งด้วย `--secret-env` ห้ามมี `.env` ของ local test อยู่ที่ project root ขณะ build/deploy ให้ย้ายไป `storage/local-run.env` ก่อน production ใช้ NETLIFY_DB_URL ที่ provider กำหนดให้ก่อน DATABASE_URL

หากเว็บยังเปิด Netlify team SSO ไว้ n8n ภายนอกจะเรียกไม่ได้ ให้ใช้ application login สำหรับคนและ PORTAL_API_TOKEN สำหรับ n8n
