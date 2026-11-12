# n8n API v1

Production base URL: `https://boiler-nongchok.netlify.app`

ทุก inbound request ใช้ `Authorization: Bearer <PORTAL_API_TOKEN>`; JSON ใช้ Content-Type application/json วันที่สังเกตการณ์เป็น YYYY-MM-DD เท่านั้น timezone Asia/Bangkok และ granularity daily เวลา upload/feedback เก็บ timestamptz แยกกัน

## 1. Portal → n8n

POST N8N_INGEST_WEBHOOK_URL multipart/form-data: file (binary .xls/.xlsx), upload_id (UUID), asset_id (string) พร้อม Authorization: Bearer N8N_INGEST_TOKEN ต้องตอบ HTTP 202 `{"upload_id":"UUID ที่รับมา"}` ก่อนเริ่มงานนาน จากนั้น callback processing → observations → alerts → completed หรือ completed_with_errors/failed

## 2. POST /api/v1/observations

```json
{"upload_id":"11111111-1111-4111-8111-111111111111","asset_id":"boiler-1","rows":[{"observed_date":"2026-11-06","timezone":"Asia/Bangkok","source_sheet":"Daily","source_row":7,"metrics":{"steam_pressure":{"value":0,"unit":"bar","quality":"good"},"steam_flow":{"value":null,"unit":"t/h","quality":"missing"}}}]}
```

200 `{"accepted":1}`. quality: good/uncertain/bad/missing; value number หรือ null; ชุดข้อมูลสูงสุด 20,000 แถวต่อคำขอ การส่งซ้ำใช้ upload_id/sheet/row upsert และ transaction ทั้งชุด asset_id ต้องตรง upload

## 3. POST /api/v1/alerts

```json
{
 "event_key":"boiler-1:2026-11-06:steam-pressure-conflict:v1",
 "upload_id":"11111111-1111-4111-8111-111111111111",
 "asset_id":"boiler-1","observed_date":"2026-11-06",
 "timezone":"Asia/Bangkok","granularity":"daily",
 "category":"Instrument/Data anomaly","severity":"warning","status":"new",
 "rule_id":"steam-pressure-conflict","rule_version":"1",
 "source":{"file":"daily.xlsx","sheet":"Daily","row":7},
 "evidence":[
  {"metric":"Steam Pressure","value":0,"unit":"bar","baseline":6.8},
  {"metric":"Boiler Pressure","value":6.89,"unit":"bar"},
  {"metric":"Running Time","value":24,"unit":"ชั่วโมง"},
  {"metric":"Steam Flow","value":20.6,"unit":"t/h","quality":"ค่าที่รายงาน ต้องยืนยันความน่าเชื่อถือของ Tag"}
 ],
 "diagnosis":"ค่า Steam Pressure เป็นศูนย์ขณะที่ข้อมูลแรงดันในตัวหม้อและชั่วโมงเดินเครื่องบ่งชี้ว่า Boiler มีการเดินเครื่อง สัญญาณขัดแย้งกันและต้องตรวจหน้างาน",
 "suspected_causes":["Steam Pressure transmitter","สัญญาณ 4–20 mA หรือ PLC input","Tag mapping และ scaling","Main Steam Stop Valve และตำแหน่งจุดวัด","การรวมข้อมูลรายวันผิดช่วงเวลา"],
 "reference_docs":[],"analysis_method":"rules"
}
```

201 คืน Alert ที่สร้างพร้อม id; ส่ง event_key เดิมตอบ 200 และ Alert เดิม ไม่แก้สถานะหรือ feedback severity info/warning/high; analysis_method rules/rules_with_ai_summary; status new/investigating/resolved/false_positive reference_docs ใช้ `[{"title":"ชื่อคู่มือ","url":"https://..."}]` เฉพาะ HTTP(S) ไม่มี URL ตัวอย่างที่แอบอ้างว่าเป็นเอกสารโรงงาน

## 4. PATCH /api/v1/uploads/{upload_id}

```json
{"status":"completed_with_errors","row_count":24,"rejected_count":1,"alert_count":1,"errors":["Daily row 5: invalid date"]}
```

200 คืน upload. สถานะ queued/processing/completed/completed_with_errors/failed; row_count จำนวนแถวอ่านทั้งหมด rejected_count จำนวนแถวที่ปฏิเสธ alert_count จำนวน Alert ที่ประมวลผล n8n เป็นผู้คำนวณตัวเลข

## 5. GET /api/v1/feedback

`?updated_since=2026-11-01T00%3A00%3A00Z&limit=50` (1–200)

```json
{"data":[{"id":"1","alert_id":"UUID","result":"instrument_issue","cause":"transmitter เสีย","correction":"เปลี่ยน transmitter","tags":"PT-001","outcome":"อ่านได้ตามปกติ","reviewed_at":"2026-11-06T03:00:00.000Z","reviewer":"Demo engineer","reviewer_id":"UUID","updated_at":"2026-11-06T04:00:00.000Z","attachments":[],"alert_evidence":{"event_key":"...","evidence":[]},"cursor_time":"2026-11-06T04:00:00.000000Z"}],"next_cursor":null}
```

ทุก record คือประวัติการตรวจหนึ่งครั้ง รวม unknown ไม่คืนเคสที่ยังไม่มี feedback ถ้ามี next_cursor ให้ส่ง cursor ที่ได้กลับพร้อม updated_since เดิมจนเป็น null เก็บ updated_at ล่าสุดเป็น watermark สำหรับรอบถัดไป (inclusive; consumer deduplicate ด้วย feedback id) cursor ใช้ microsecond timestamp + id จึงไม่ข้าม record ที่ timestamp เท่ากัน ไม่มีการ export labels จากผลคัดกรองให้เป็นผลยืนยันเอง

ข้อผิดพลาด: 400 schema ไม่ถูกต้อง, 401 ไม่มี/ผิด token, 403 สิทธิ์ไม่พอ, 404 ไม่พบ upload/asset, 413 เกินขนาด POST observations เป็น atomic จึงต้องแก้ชุดที่ไม่ผ่านแล้วส่งใหม่ PATCH uploads errors[] เป็น string[]
