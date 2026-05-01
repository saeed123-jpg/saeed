# أطلس فلسطين التاريخي

منصة عربية تفاعلية عن فلسطين ومدنها وتاريخها من العصور القديمة حتى عام 2026، تشمل الخط الزمني، الموسوعة التاريخية، فهرس المدن، الصور التوضيحية، والصور الحقيقية التي تُحمّل من مصادر مفتوحة داخل صفحات المدن والأحداث.

## التقنيات

- React
- TypeScript
- Vite
- CSS

## التشغيل

يحتاج المشروع إلى Node.js مع npm.

```powershell
npm install
npm run dev
```

ثم افتح الرابط الذي يظهر في الطرفية، غالبا:

```text
http://localhost:5173
```

## البناء للنشر

```powershell
npm run build
```

ينتج مجلد:

```text
dist
```

يمكن رفعه على Vercel أو Netlify أو أي استضافة ويب.

## التحويل إلى تطبيق موبايل لاحقا

المسار المقترح:

1. إكمال نسخة الويب بـ React.
2. تحويلها إلى PWA.
3. إضافة Capacitor لتوليد تطبيق Android/iOS من نفس الواجهة.

الأوامر المستقبلية بعد تثبيت الحزم:

```powershell
npm install @capacitor/core @capacitor/cli
npx cap init
npm run build
npx cap add android
npx cap add ios
```

## الملفات المهمة

- `src/main.tsx`: التطبيق والصفحات والمكونات.
- `src/data/cities.js`: بيانات المدن.
- `src/data/history.js`: بيانات الموسوعة التاريخية.
- `src/data/home.ts`: بيانات الصفحة الرئيسية.
- `src/styles.css`: التصميم الأساسي.
- `public/assets`: الصور والملفات العامة.
