backend
/api/chat
   ↓
Query products
   ↓
IF found
   → return product
ELSE
   → insert missing_request
   → call AI
   → return AI text
   ↓
Insert chat_history
   ↓
Append rating prompt

frontend
Landing
   ↓
/login (Google)
   ↓
/chat
   ↓
ChatBox
   ↓
Axios POST /api/chat
   ↓
Typing animation
   ↓
Render bubble
   ↓
Show rating modal


DATABASE RULES (STRICT)

Wajib:

Semua message masuk:

chat_history


Semua produk tidak ada:

missing_request


Semua user:

users


Tidak boleh:

langsung pakai AI tanpa cek DB

langsung tampil rekomendasi tanpa log

nyimpen state di frontend doang


structure folder backend
apps/api/src
 ├─ main.ts          (bootstrap)
 ├─ app.ts           (express init)
 ├─ modules/
 │   ├─ auth/
 │   │   ├─ auth.controller.ts
 │   │   ├─ auth.service.ts
 │   │   ├─ auth.guard.ts
 │   │   └─ auth.schema.ts
 │   ├─ chat/
 │   │   ├─ chat.controller.ts
 │   │   ├─ chat.service.ts
 │   │   ├─ chat.schema.ts
 │   │   └─ chat.route.ts
 │   ├─ products/
 │   └─ rating/
 ├─ common/
 │   ├─ db.service.ts
 │   ├─ ai.service.ts
 │   ├─ zod.middleware.ts
 │   └─ auth.middleware.ts
 └─ config/
     └─ env.ts


flow final backend
POST /api/chat
   ↓
Zod validate
   ↓
Auth guard
   ↓
ChatController
   ↓
ChatService
   ↓
DBService
   ↓
AIService (if needed)
   ↓
Return DTO
