# Validation

ตรวจในสภาพแวดล้อมพัฒนา:

- TypeScript: ผ่าน (`tsc --noEmit`)
- Production build: ผ่าน (`next build --webpack` บน Node 22)
- Schema/login/origin tests: 4 ผ่าน (missing/null, invalid calendar date, unknown feedback, invalid feedback enum, Admin username mapping และ trusted origin หลัง proxy)
- UX notification update: TypeScript และ unit tests รวม 5 กรณีผ่าน เพิ่มการตรวจไม่แจ้ง Alert ซ้ำ การเรียงตาม severity การยกเว้นเคสที่ตรวจไปแล้ว และการรับทราบโดยไม่แก้สถานะต้นทาง
- Dependency audit หลังปรับ Next.js 16.4.6 และ Zod 4.6.7: 0 vulnerabilities
- Integration test: ผ่านบน local PostgreSQL-compatible engine และ n8n acknowledgement mock รวม Admin/Admin login, upload, observations, alerts, feedback, export, duplicate preservation, missing, viewer denial และ API token
- Browser visual/interaction acceptance: ยังไม่ตรวจ
- Production online smoke test: ผ่านที่ https://boiler-nongchok.netlify.app (Admin/Admin, API token, upload record, observations/null, Alert, engineer feedback, duplicate preserving result, feedback export และ upload status callback) ใช้ Demo และจำลอง n8n callbacks; ยังไม่ใช่การทดสอบ Excel parser/workflow n8n จริง
- Production deploy ที่ตรวจผ่าน: https://app.netlify.com/projects/boiler-nongchok/deploys/6af56be09f3b088d2915c217
- ตรวจ client assets: ไม่พบ hosted session/API secrets ใน static output

Integration test ตรวจ server permission ของ viewer, API token, upload acknowledgement, observation null, Alert creation, feedback append, duplicate event_key preserving resolved status และ feedback export พร้อมหลักฐาน แต่ไม่ได้ทดสอบ Excel parsing ใน workflow n8n จริง
