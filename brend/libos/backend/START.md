# Backend ishga tushirish — qadamba-qadam

## 1. Neon.tech da baza yaratish

1. https://neon.tech → Sign Up (GitHub bilan)
2. "Create project" → name: libos → Region: eu-central-1
3. "Connection string" ni nusxalang (postgresql://... ko'rinishida)

## 2. .env faylini to'ldirish

`backend/.env` faylini oching va DATABASE_URL ni o'zgartiring:

```
DATABASE_URL="postgresql://neondb_owner:SIZNING_PAROL@ep-xxx.neon.tech/libos?sslmode=require"
```

## 3. Jadvallarni yaratish

```bash
cd libos/backend
npx prisma db push
```

## 4. Test ma'lumotlar kiritish

```bash
npx prisma db seed
```

## 5. Serverni ishga tushirish

```bash
npm run dev
```

## 6. Tekshirish

Brauzerda oching: http://localhost:3001/health
Natija:
{
  "status": "ok",
  "app": "Libos API"
}

Barcha do'konlar: http://localhost:3001/api/stores
Erkaklar bo'limi: http://localhost:3001/api/stores?gender=MEN
