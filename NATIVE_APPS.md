# بناء التطبيق كملفات حقيقية

هذا المشروع أصبح يدعم:

- تطبيق ويندوز حقيقي بصيغة `EXE` عبر Electron.
- تطبيق أندرويد حقيقي بصيغة `APK` عبر Capacitor.

## ويندوز EXE

شغل:

```powershell
npm run desktop:build
```

بعد النجاح ستجد ملف التثبيت هنا:

```text
release\أطلس فلسطين التاريخي Setup 1.0.0.exe
```

## بناء تلقائي على GitHub

بعد رفع التعديلات إلى GitHub سيعمل ملف:

```text
.github/workflows/native-builds.yml
```

هذا الملف يبني نسختين حقيقيتين من التطبيق:

- `atlas-palestine-windows-exe`: ملف تثبيت ويندوز بامتداد `exe`.
- `atlas-palestine-android-apk`: ملف أندرويد بامتداد `apk`.

تجد الملفات من صفحة المستودع في GitHub ثم تبويب `Actions`. افتح آخر تشغيل باسم `Build native apps` ثم حمل الملفات من قسم `Artifacts`.

## أندرويد APK

أولا ثبت:

- Android Studio
- Java JDK
- Android SDK من داخل Android Studio

ثم شغل:

```powershell
npm run android:apk
```

بعد النجاح ستجد ملف APK هنا:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

إذا أردت فتح المشروع داخل Android Studio:

```powershell
npm run android:open
```

## ملاحظة

زر "تثبيت التطبيق" داخل الموقع يرتبط مباشرة بملف:

```text
public\downloads\atlas-palestine.apk
```

على الهاتف سيقوم المتصفح بتحميل الملف، وبعد التحميل يمكن فتحه لتثبيت التطبيق. هذه ليست إضافة اختصار إلى الشاشة الرئيسية.

شعار الموقع وأيقونة تطبيق Android مأخوذان من الملف الجديد داخل `public\brand-logo.png`، ويتم بناء APK بعد تحديث الأيقونات حتى تظهر الأيقونة الجديدة على الهاتف.

إذا ضغطت الزر ولم يبدأ تحميل ملف APK، فهذا غالبا من كاش المتصفح القديم. افتح الموقع بعد التحديث مرة أخرى أو اعمل تحديثا كاملا للصفحة، وسيقوم ملف التنظيف `public/sw.js` بإلغاء عامل التثبيت القديم وحذف كاشه.

على Render يجب أن يكون أمر التشغيل `npm start` أو `vite preview` بعد البناء، وليس `npm run dev`، حتى يعمل الموقع كنسخة إنتاجية من مجلد `dist`.
