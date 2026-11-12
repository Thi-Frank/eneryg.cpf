# Boiler Insight — Boiler 1 อสร.หนองจอก

Pilot ภาษาไทย: Next.js App Router + TypeScript + PostgreSQL เก็บผลคัดกรองแยกจากประวัติการตรวจหน้างาน ไม่มีการเขียนคำสั่งไปยังเครื่องจักร ข้อมูลเริ่มต้นทุกเคสระบุ Demo ไม่ใช่ข้อมูลโรงงานจริง

## รันในเครื่อง

ใช้ Node.js 22 LTS และ Docker (หรือ PostgreSQL 16 ที่มีอยู่)

```powershell
Copy-Item .env.example .env
# แก้ token, SESSION_SECRET, SEED_PASSWORD และ URL n8n ใน .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

เปิด http://localhost:3000 เข้าด้วย User `Admin` / Password `Admin` ตามที่เจ้าของ Pilot กำหนด บัญชีนี้ถูกสร้างโดย migration และตรวจรหัสผ่าน bcrypt ฝั่งเซิร์ฟเวอร์ บัญชีทดสอบเพิ่มเติม `engineer@boiler.local`, `viewer@boiler.local` ใช้รหัสผ่าน SEED_PASSWORD ไม่มี public signup

หากไม่มี Docker ใช้ `npm run db:local` เพื่อเปิด PostgreSQL-compatible test engine ที่ port 55432 และสร้าง .env ครั้งแรก จากนั้นเปิด terminal อีกหน้ารัน migrate/seed/dev ตามปกติ ไม่ใช้ local test engine แทนฐานข้อมูล production

```powershell
npm test
npm run typecheck
npm run build
npm start
```

`npm run test:integration` ต้องมีฐานข้อมูลที่ migrate/seed แล้วและเว็บรันอยู่ ใช้ SEED_PASSWORD เดียวกัน และ n8n mock (`npm run mock:n8n`) ที่พอร์ต 5678 ก่อนทดสอบ ตั้ง URL webhook ให้ตรง .env.example การทดสอบสร้างข้อมูลใน DB ทดสอบ ควรใช้ฐานข้อมูลแยก

Integration test เป็นการทดสอบ transport/callback ด้วย mock acknowledgement และไฟล์ signature fixture ไม่ได้ทดสอบ Excel parser ภายใน n8n หรือการคลิกจุดบนกราฟใน browser ต้องทดสอบ acceptance เพิ่มด้วยไฟล์ Excel จริงและ workflow n8n ของโรงงาน: อัปโหลด → ตรวจตัวเลขแถว → เปิด Dashboard เลือกจุดสีส้ม → บันทึกผลตรวจ → ดึง feedback → ส่ง event_key เดิมซ้ำ → ยืนยันว่าผลตรวจยังอยู่ และลอง login ด้วย viewer เพื่อยืนยันว่าไม่มีสิทธิ์เขียน

## สิทธิ์และข้อมูล

viewer อ่านข้อมูล; engineer/admin อัปโหลดและบันทึกผลตรวจได้ ตรวจทุกครั้งบน backend บัญชี admin ใช้ workflow เดียวกับ engineer ใน Pilot นี้ ไม่มีหน้าจัดการผู้ใช้ Cookie HttpOnly, SameSite Strict, mutation ตรวจ Origin; production ต้องใช้ HTTPS เพื่อ Secure cookie เก็บ token เฉพาะ backend ห้ามใช้ NEXT_PUBLIC_ สำหรับ token

แนบ PDF/PNG/JPEG ผ่าน engineer form; backend ตรวจ signature และขนาด เก็บใน PostgreSQL (bytea) พร้อมข้อมูลผู้แนบ คงอยู่ข้าม redeploy ดาวน์โหลดต้อง login ขนาด Excel ตรวจฝั่งเซิร์ฟเวอร์ด้วย MAX_UPLOAD_MB และ signature; ต้องตั้ง reverse proxy request-body limit ให้ตรงค่านี้ด้วย เพราะ multipart ถูกอ่านก่อนตรวจขนาด สำหรับ production เพิ่ม rate limit/login lockout, malware scanning, การสำรอง/กู้คืน และ retention ตามโรงงาน

กราฟใช้ metric key `steam_pressure` หน่วย bar ไม่มีการแปลงหน่วยอัตโนมัติ ค่า null, missing, bad และหลายแถวในวันเดียวเว้นช่อง ไม่แทนด้วยศูนย์ กรองเครื่องจักรเมื่อมีหลาย asset ขีดจำกัดหน้าจอ Pilot: 1,000 alerts / 20,000 observation rows / 100 uploads; API feedback แบ่งหน้าได้ ไม่ควรใช้หน้าจอนี้เป็นรายงานข้อมูลทั้งหมดเมื่อเกินขีดจำกัด

Alert event_key เป็น immutable first-write-wins ส่งซ้ำคืนเคสเดิม ไม่ทับ payload หรือผลตรวจ; เปลี่ยนผลวิเคราะห์ให้ส่ง event_key ใหม่ ประวัติ feedback เป็น append-only ไม่มี update/delete endpoint `unknown` นับเป็นวิศวกรตรวจแล้วและส่งออกพร้อม result ชัดเจน เพื่อให้ผู้ฝึก AI เลือกตัดออกเอง

หากส่ง webhook ไม่สำเร็จ upload เป็น failed ไฟล์ Excel ไม่เก็บถาวรใน portal; n8n ควรเก็บต้นฉบับเอง ไม่มี retry อัตโนมัติ ตรวจฝั่ง n8n ก่อนอัปโหลดใหม่เพื่อป้องกันงานซ้ำ n8n ต้องใช้ event_key ที่คงที่ข้ามการอัปโหลดไฟล์ซ้ำ เช่น asset/date/rule/version/metric ไม่ใช้ upload_id อย่างเดียว

ดู [API contract](docs/API.md) สำหรับ n8n

ดู [การเผยแพร่จาก GitHub ไป Netlify](docs/DEPLOY.md) สำหรับ backend พร้อม PostgreSQL โดย GitHub Pages อย่างเดียวไม่รองรับ API ของระบบนี้
