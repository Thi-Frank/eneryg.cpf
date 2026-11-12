# Validation

ตรวจในสภาพแวดล้อมพัฒนา:

- TypeScript: ผ่าน (`tsc --noEmit`)
- Production build: ผ่าน (`next build --webpack` บน Node 22)
- Schema/login tests: 3 ผ่าน (missing/null, invalid calendar date, unknown feedback, invalid feedback enum, Admin username mapping)
- Dependency audit หลังปรับ Next.js 16.4.6 และ Zod 4.6.7: 0 vulnerabilities
- Integration test: ผ่านบน local PostgreSQL-compatible engine และ n8n acknowledgement mock รวม Admin/Admin login, upload, observations, alerts, feedback, export, duplicate preservation, missing, viewer denial และ API token
- Browser visual/interaction acceptance: ยังไม่ตรวจ

Integration test ตรวจ server permission ของ viewer, API token, upload acknowledgement, observation null, Alert creation, feedback append, duplicate event_key preserving resolved status และ feedback export พร้อมหลักฐาน แต่ไม่ได้ทดสอบ Excel parsing ใน workflow n8n จริง
