# เชื่อม n8n เมื่อสร้าง workflow แล้ว

เว็บพร้อมรับ API ที่ `https://boiler-nongchok.netlify.app`

| ทิศทาง | Method | URL |
|---|---|---|
| n8n ส่งข้อมูลรายวัน | POST | https://boiler-nongchok.netlify.app/api/v1/observations |
| n8n ส่ง Alert | POST | https://boiler-nongchok.netlify.app/api/v1/alerts |
| n8n อัปเดตงานอัปโหลด | PATCH | https://boiler-nongchok.netlify.app/api/v1/uploads/{upload_id} |
| n8n ดึงผลตรวจที่วิศวกรบันทึกแล้ว | GET | https://boiler-nongchok.netlify.app/api/v1/feedback |

ใน n8n HTTP Request node ใช้ Generic Credential แบบ Header Auth:

- Name: Authorization
- Value: Bearer ตามด้วย PORTAL_API_TOKEN จากไฟล์ `storage/hosting-secrets.json` ในเครื่องเจ้าของ (เก็บใน n8n Credentials ไม่ใส่ใน workflow JSON หรือ URL)
- JSON Content-Type: application/json

1. สร้าง n8n Webhook สำหรับ POST multipart file และเปิดใช้ production workflow
2. ให้ Webhook ตอบ HTTP 202 พร้อม upload_id เดิมทันที ก่อนเริ่มอ่านไฟล์
3. ตรวจ Authorization Bearer N8N_INGEST_TOKEN ที่ฝั่ง n8n
4. อ่าน asset_id, upload_id และ file แล้วแยกแถว Excel, วันที่, sheet, row และ metric quality
5. เรียก PATCH uploads → processing, POST observations, POST alerts จากนั้น PATCH → completed หรือ completed_with_errors/failed
6. ตั้ง N8N_INGEST_WEBHOOK_URL และ N8N_INGEST_TOKEN ใน production backend แล้ว redeploy
7. ตั้ง workflow อีกชุด GET feedback พร้อม updated_since และไล่ next_cursor จน null เก็บ watermark และ deduplicate ด้วย feedback id

ตัวอย่าง payload และกติกา event_key อยู่ใน [API contract](API.md) token สำหรับ ingress กับ portal ควรแยกกัน

ขณะส่งมอบยังไม่มี n8n workflow จริง ปุ่มอัปโหลดจะรายงาน failed พร้อมข้อความส่งไป n8n ไม่สำเร็จจนกว่าจะตั้ง webhook/token การทดสอบออนไลน์ใช้ fixture และจำลอง callbacks เพื่อยืนยันฝั่ง portal เท่านั้น
