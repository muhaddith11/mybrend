# To'lov tizimini sozlash

## Click

### Kerakli ma'lumotlar
1. https://my.click.uz → Merchant bo'limi
2. "Do'konlar" → Do'koningizni tanlang
3. Quyidagilarni `.env` ga qo'ying:
   - `CLICK_SERVICE_ID` — Service ID
   - `CLICK_MERCHANT_ID` — Merchant ID
   - `CLICK_SECRET_KEY` — Secret key

### Webhook URL (Click panelida ko'rsating)
```
POST https://sizning-domen.uz/api/payment/click/webhook
```

### Lokal test (ngrok bilan)
```bash
npx ngrok http 3001
# Chiqgan URL ni Click paneliga qo'ying
```

---

## Payme

### Kerakli ma'lumotlar
1. https://merchant.payme.uz → Cashier ro'yxatdan o'tish
2. "Sozlamalar" dan quyidagilarni oling:
   - `PAYME_MERCHANT_ID` — Cashier ID
   - `PAYME_SECRET_KEY` — Kalit so'z (ishlab chiqarish)
   - `PAYME_TEST_SECRET_KEY` — Test kalit so'z

### Webhook URL (Payme panelida ko'rsating)
```
POST https://sizning-domen.uz/api/payment/payme/webhook
```

### Test karta raqamlari (Payme test muhit)
```
Karta: 8600 4954 7331 6478
Muddati: 03/99
SMS kod: 666666
```

### Payme test muhit
`.env` da `PAYME_IS_TEST=true` bo'lsa test muhit ishlatiladi.
Test URL: https://checkout.test.paycom.uz

---

## To'lov oqimi (foydalanuvchi nuqtai nazaridan)

```
Foydalanuvchi "Click bilan to'la" bosar
    → POST /api/payment/click/create-url  (bizning server)
    → Click URL qaytariladi
    → Foydalanuvchi brauzerda Click saytiga yo'naltiriladi
    → Click to'lovni amalga oshiradi
    → Click POST /api/payment/click/webhook yuboradi (prepare)
    → Bizning server tasdiqlaydi → Click yana webhook (complete)
    → Buyurtma statusi CONFIRMED ga o'zgaradi
    → Foydalanuvchi ilovaga qaytadi (deep link: libos://payment/result)
```
