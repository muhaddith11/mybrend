# App Review — Guideline 2.1(a) javobi (build 1.0.0 (9))

`1.0.0 (6)` va `1.0.0 (7)` bir xil sabab bilan rad etildi:
*"the Get code button still produces no action"*.

Asl sabab topildi va tuzatildi — qarang commit `fbe2fc1` va
`app/_layout.tsx` dagi izoh. Qisqacha: `auth/login` `'modal'`,
`auth/verify` esa `'card'` edi; react-native-screens iOS'da ekranlarni
tartibiga qaramay presentation turi bo'yicha ajratgani uchun kod ekrani
login oynasining ORQASIDA ochilardi. Android'da bu sezilmaydi.

---

## Holat: TESTFLIGHT'DA TASDIQLANDI (2026-08-21)

`1.0.0 (9)` real iPhone'ga TestFlight orqali o'rnatildi va sinaldi:
`+998123456789` → "Kod olish" → kod ekrani CHIQADI → `007700` → kirish
muvaffaqiyatli.

Ya'ni pastdagi matndagi "physical iPhone'da tasdiqladik" degan jumla rost —
o'zgartirishsiz yuborilishi mumkin.

Joylash tartibi:
1. **App Store Connect → App Review → Messages → Reply** — pastdagi matn
2. So'ng `1.0.0 (9)` build'ini tanlab **Submit for Review**

---

## Reply matni

```
Hello App Review Team,

Thank you for the report and for including the screenshot — it was what
allowed us to find the problem. We are sorry that this took two
submissions to resolve.

We have reproduced and fixed the issue. The "Get code" button was in fact
working: it was calling our server correctly and the verification-code
screen was being created. However, a navigation configuration error in our
app placed that screen behind the sign-in screen instead of on top of it,
so nothing appeared to change when the button was tapped. The defect was
specific to iOS, which is why our testing did not catch it.

This is fixed in build 1.0.0 (9). We have installed that build on a
physical iPhone and confirmed that the code screen now appears and that
sign-in completes.

Steps to sign in with the demo account:

1. Name field: any text, for example "Test"
2. Phone field: +998123456789
3. Tap "Get code" — the six-digit code screen now appears
4. Enter the code: 007700

Real SMS messages are delivered only to Uzbek mobile numbers, so this demo
number accepts a fixed code instead. Please use exactly this number; the
code is not accepted for any other number.

If anything is still unclear or does not work as described, we would be
grateful if you could reply with a screenshot again — it was genuinely
helpful.

Thank you for your patience.
```
