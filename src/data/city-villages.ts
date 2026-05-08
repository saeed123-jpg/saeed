import type { CityVillage } from "../types";

type VillageType = CityVillage["type"];
type VillageSeed = string | [string, string] | [string, string, VillageType] | [string, string, VillageType, string];

const SOURCES = {
  pcbsLocalities: "https://www.pcbs.gov.ps/Portals/_Rainbow/Documents/Local%202E.htm",
  jenin: "https://en.wikipedia.org/wiki/Jenin_Governorate",
  nablus: "https://en.wikipedia.org/wiki/Nablus_Governorate",
  hebron: "https://en.wikipedia.org/wiki/Hebron_Governorate",
  bethlehem: "https://en.wikipedia.org/wiki/Bethlehem_Governorate",
  ramallah: "https://en.wikipedia.org/wiki/Ramallah_and_al-Bireh_Governorate",
  gaza: "https://en.wikipedia.org/wiki/Gaza_Governorate",
  khanYunis: "https://en.wikipedia.org/wiki/Khan_Yunis_Governorate",
  rafah: "https://en.wikipedia.org/wiki/Rafah_Governorate",
  deirBalah: "https://en.wikipedia.org/wiki/Deir_al-Balah_Governorate",
  palestineStudies: "https://www.palestine-studies.org/en/node/1655642",
  palestineRemembered: "https://www.palestineremembered.com/"
};

function asSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function typeLabel(type: VillageType) {
  if (type === "municipality") return "بلدة/بلدية";
  if (type === "camp") return "مخيم";
  if (type === "neighborhood") return "حي";
  if (type === "depopulated") return "قرية مهجرة";
  return "قرية";
}

function describeVillage(name: string, cityName: string, district: string, type: VillageType, note?: string) {
  if (note) return note;
  if (type === "depopulated") {
    return `${name} ${typeLabel(type)} في نطاق ${district} التاريخي، ارتبطت بالريف الفلسطيني وبشبكات الأرض والطرق والأسواق حول ${cityName}. تعرضت للتهجير أو تغيّر عمرانها وسكانها خلال حرب 1948 أو ما بعدها، لذلك تظهر هنا كجزء من ذاكرة المدينة ومحيطها.`;
  }
  if (type === "camp") {
    return `${name} ${typeLabel(type)} في نطاق ${district}، نشأ ضمن تحولات اللجوء الفلسطيني وأصبح جزءا من الامتداد الاجتماعي والعمراني حول ${cityName}.`;
  }
  if (type === "neighborhood") {
    return `${name} ${typeLabel(type)} من أحياء ${cityName} أو محيطها، يساعد فهمه على قراءة المدينة كنسيج من البلدة القديمة والأحياء والامتدادات الحديثة.`;
  }
  return `${name} ${typeLabel(type)} في نطاق ${district}، ترتبط تاريخيا واجتماعيا واقتصاديا بمدينة ${cityName}. يوضح وجودها كيف تشكلت المدينة من مركز حضري تحيط به قرى زراعية وبلدات وطرق محلية.`;
}

function makeVillages(
  cityId: string,
  cityName: string,
  district: string,
  sourceHref: string,
  defaultType: VillageType,
  entries: VillageSeed[]
): CityVillage[] {
  return entries.map((entry, index) => {
    const [name, searchName = name, type = defaultType, note] = Array.isArray(entry) ? entry : [entry, entry, defaultType, undefined];
    return {
      id: `${cityId}-${asSlug(searchName || name) || index}`,
      cityId,
      name,
      searchName,
      district,
      type,
      relation: `${typeLabel(type)} ضمن محيط ${cityName}`,
      summary: describeVillage(name, cityName, district, type, note),
      imageQueries: [
        `${searchName} village view Palestine`,
        `${searchName} Palestine village`,
        `${searchName} mosque Palestine`,
        `${searchName} ${district} Palestine`,
        `${name} فلسطين`,
        `${name} ${cityName}`
      ],
      sourceHref,
      tags: [district, typeLabel(type), cityName]
    };
  });
}

const jeninVillages: VillageSeed[] = [
  ["عجة", "Ajjah", "municipality"], ["عرابة", "Arraba Jenin", "municipality"], ["برقين", "Burqin", "municipality"],
  ["دير أبو ضعيف", "Deir Abu Da'if", "municipality"], ["جبع", "Jaba Jenin", "municipality"], ["كفر دان", "Kafr Dan", "municipality"],
  ["كفر راعي", "Kafr Rai", "municipality"], ["ميثلون", "Meithalun", "municipality"], ["سيلة الحارثية", "Silat al-Harithiya", "municipality"],
  ["سيلة الظهر", "Silat ad-Dhahr", "municipality"], ["يعبد", "Ya'bad", "municipality"], ["اليامون", "al-Yamun", "municipality"],
  ["الزبابدة", "Zababdeh", "municipality"], ["عانين", "Anin"], ["عنزة", "Anzah"], ["عرقة", "Araqah"], ["عرانة", "Arranah"],
  ["العطارة", "al-Attara"], ["برطعة الشرقية", "Barta'a ash-Sharqiyah"], ["بيت قاد", "Beit Qad"], ["بئر الباشا", "Bir al-Basha"],
  ["دير غزالة", "Deir Ghazaleh"], ["فحمة", "Fahma"], ["الفندقومية", "Fandaqumiya"], ["فقوعة", "Faqqua"], ["الجلمة", "Jalamah"],
  ["جلبون", "Jalbun"], ["جلقموس", "Jalqamus"], ["الجديدة", "Judeida Jenin"], ["كفيرت", "Kufeirit"], ["مركة", "Mirka"],
  ["مسلية", "Misilyah"], ["المغير", "al-Mughayyir Jenin"], ["نزلة زيد", "Nazlet Zeid"], ["رمانة", "Rummanah"], ["صانور", "Sanur"],
  ["الشهداء", "ash-Shuhada"], ["سير", "Sir Jenin"], ["الطيبة", "at-Tayba Jenin"], ["تعنك", "Ti'inik"], ["طورة الغربية", "Tura al-Gharbiya"],
  ["أم الريحان", "Umm ar-Rihan"], ["أم التوت", "Umm at-Tut"], ["زبوبا", "Zububa"]
];

const nablusVillages: VillageSeed[] = [
  ["عقربا", "Aqraba", "municipality"], ["عصيرة الشمالية", "Asira ash-Shamaliya", "municipality"], ["بيتا", "Beita", "municipality"],
  ["حوارة", "Huwara", "municipality"], ["جماعين", "Jammain", "municipality"], ["قبلان", "Qabalan", "municipality"],
  ["سبسطية", "Sebastia", "municipality"], ["بيت فوريك", "Beit Furik", "municipality"], ["عصيرة القبلية", "Asira al-Qibliya"],
  ["عزموط", "Azmut"], ["عورتا", "Awarta"], ["الباذان", "Al-Badhan"], ["بلاطة البلد", "Balata al-Balad"],
  ["بيت دجن", "Beit Dajan Nablus"], ["بيت حسن", "Beit Hasan"], ["بيت إيبا", "Beit Iba"], ["بيت امرين", "Beit Imrin"],
  ["بيت وزن", "Beit Wazan"], ["بزاريا", "Bizziriya"], ["بورين", "Burin"], ["برقة", "Burqa Nablus"], ["دير الحطب", "Deir al-Hatab"],
  ["دير شرف", "Deir Sharaf"], ["دوما", "Duma Nablus"], ["عينابوس", "Einabus"], ["فروش بيت دجن", "Furush Beit Dajan"],
  ["إجنسنيا", "Ijnisinya"], ["جوريش", "Jurish"], ["كفر قليل", "Kafr Qallil"], ["اللبن الشرقية", "Al-Lubban ash-Sharqiya"],
  ["مجدل بني فاضل", "Majdal Bani Fadil"], ["الناقورة", "An-Naqura Nablus"], ["أودلا", "Odala"], ["أوصرين", "Osarin"],
  ["قريوت", "Qaryut"], ["قوصين", "Qusin"], ["قصرة", "Qusra"], ["روجيب", "Rujeib"], ["سالم", "Salim"],
  ["صرة", "Sarra Nablus"], ["الساوية", "As-Sawiya"], ["تلفيت", "Talfit"], ["طلوزة", "Talluza"], ["تل", "Tell Nablus"],
  ["عوريف", "Urif"], ["يانون", "Yanun"], ["ياصيد", "Yasid"], ["يتما", "Yatma"], ["زواتا", "Zawata"], ["زيتا جماعين", "Zeita Jammain"]
];

const ramallahVillages: VillageSeed[] = [
  ["بيت لقيا", "Beit Liqya", "municipality"], ["بيرزيت", "Bir Zeit", "municipality"], ["دير عمار", "Deir Ammar", "municipality"],
  ["دير دبوان", "Deir Dibwan", "municipality"], ["دير جرير", "Deir Jarir", "municipality"], ["خربثا المصباح", "Kharbatha al-Misbah", "municipality"],
  ["المزرعة الشرقية", "al-Mazra'a ash-Sharqiya", "municipality"], ["نعلين", "Ni'lin", "municipality"], ["سلواد", "Silwad", "municipality"],
  ["سنجل", "Sinjil", "municipality"], ["ترمسعيا", "Turmus Ayya", "municipality"], ["عابود", "Aboud"], ["أبو قش", "Abu Qash"],
  ["عبوين", "Abwein"], ["عجول", "Ajjul"], ["عطارة", "Atara"], ["بيتين", "Beitin"], ["بلعين", "Bil'in"], ["بيت سيرا", "Beit Sira"],
  ["بيت عور الفوقا", "Beit Ur al-Fauqa"], ["بيت عور التحتا", "Beit Ur al-Tahta"], ["بيتللو", "Beitillu"], ["بدرس", "Budrus"],
  ["برقة", "Burqa Ramallah"], ["دير إبزيع", "Deir Ibzi"], ["دير أبو مشعل", "Deir Abu Mash'al"], ["دير قديس", "Deir Qaddis"],
  ["دير السودان", "Deir as-Sudan"], ["دورا القرع", "Dura al-Qar"], ["عين عريك", "Ein Arik"], ["عين قينيا", "Ein Qiniya"],
  ["عين يبرود", "Ein Yabrud"], ["الجانية", "al-Janiya"], ["جفنا", "Jifna"], ["كفر عين", "Kafr Ein"], ["كفر مالك", "Kafr Malik"],
  ["كفر نعمة", "Kafr Nima"], ["خربة أبو فلاح", "Khirbet Abu Falah"], ["كوبر", "Kobar"], ["اللبن الغربي", "al-Lubban al-Gharbi"],
  ["المدية", "al-Midya"], ["المغير", "al-Mughayyir Ramallah"], ["النبي صالح", "Nabi Salih"], ["قراوة بني زيد", "Qarawat Bani Zeid"],
  ["قبيا", "Qibya"], ["رمون", "Rammun"], ["رنتيس", "Rantis"], ["رأس كركر", "Ras Karkar"], ["صفا", "Saffa"], ["شقبا", "Shuqba"],
  ["سردا", "Surda"], ["الطيبة", "Taybeh Ramallah"], ["الطيرة", "At-Tira Ramallah"], ["الأمعري", "Am'ari", "camp"], ["الجلزون", "Jalazone", "camp"]
];

const bethlehemVillages: VillageSeed[] = [
  ["بتير", "Battir", "municipality"], ["بيت فجار", "Beit Fajjar", "municipality"], ["الدوحة", "al-Dawha", "municipality"],
  ["حوسان", "Husan", "municipality"], ["جناتة", "Jannatah", "municipality"], ["الخضر", "al-Khader", "municipality"],
  ["نحالين", "Nahalin", "municipality"], ["تقوع", "Tuqu", "municipality"], ["العبيدية", "al-Ubeidiya", "municipality"],
  ["زعترة", "Za'atara Bethlehem", "municipality"], ["عرب الرشايدة", "Arab al-Rashayida"], ["أرطاس", "Artas"], ["بيت تعمر", "Beit Ta'mir"],
  ["دار صلاح", "Dar Salah"], ["هندازة", "Hindaza"], ["جبعة", "Jab'a Bethlehem"], ["جبة الذيب", "Jubbet ad-Dib"], ["جورة الشمعة", "Jurat ash Sham'a"],
  ["خلة الحداد", "Khallet al-Haddad"], ["خلة اللوزة", "Khallet al-Louza"], ["خربة بيت زكريا", "Khirbet Beit Zakariyyah"],
  ["كيسان", "Kisan"], ["المعصرة", "al-Ma'sara"], ["المنية", "al-Maniya"], ["مراح رباح", "Marah Rabah"],
  ["النعمان", "Nuaman"], ["أم سلمونة", "Umm Salamuna"], ["الشواورة", "ash-Shawawra"], ["وادي فوكين", "Wadi Fukin"], ["الولجة", "al-Walaja"],
  ["عايدة", "Aida Camp", "camp"], ["العزة", "Azza Camp", "camp"], ["الدهيشة", "Dheisheh", "camp"]
];

const hebronVillages: VillageSeed[] = [
  ["بني نعيم", "Bani Na'im", "municipality"], ["بيت عوا", "Beit Awwa", "municipality"], ["بيت أولا", "Beit Ula", "municipality"],
  ["بيت أمر", "Beit Ummar", "municipality"], ["دير سامت", "Deir Sammit", "municipality"], ["إذنا", "Idhna", "municipality"],
  ["خاراس", "Kharas", "municipality"], ["نوبا", "Nuba", "municipality"], ["سعير", "Sa'ir", "municipality"], ["السموع", "as-Samu", "municipality"],
  ["صوريف", "Surif", "municipality"], ["ترقوميا", "Tarqumiya", "municipality"], ["تفوح", "Taffuh", "municipality"],
  ["البقعة", "Al Baqa Hebron"], ["بيت عمرة", "Beit Amra"], ["بيت عينون", "Beit Einun"], ["بيت كاحل", "Beit Kahil"],
  ["بيت الروش الفوقا", "Beit ar-Rush al-Fauqa"], ["البرج", "al-Burj Hebron"], ["دير العسل الفوقا", "Deir al-Asal al-Fauqa"],
  ["الدوارة", "ad-Duwwara"], ["حدب الفوار", "Hadab al-Fawwar"], ["إمريش", "Imreish"], ["جنبا", "Jinba"],
  ["كرمة", "Karma Hebron"], ["الكرمل", "al-Karmil"], ["خلة المية", "Khalet al-Maiyya"], ["خرسا", "Khursa"],
  ["الرقعة", "Ruq'a"], ["الكوم", "al-Kum"], ["المورق", "Al-Muwarraq"], ["السميا", "As Simiya"], ["خربة صفا", "Khirbet Safa"],
  ["قويز", "Kuseis"], ["المجد", "al-Majd Hebron"], ["قلقس", "Qalqas"], ["قيلة", "Qila"], ["الرماضين", "al-Ramadien"],
  ["الريحية", "ar-Rihiya"], ["الشيوخ", "ash-Shuyukh"], ["شيوخ العروب", "Shuyukh al-Arrub"], ["السورة", "as-Sura"], ["الطبقة", "at-Tabaqa"],
  ["العديسة", "al-Uddeisa"], ["زيف", "Zif"], ["العروب", "al-Arroub", "camp"], ["الفوار", "al-Fawwar", "camp"]
];

const jerusalemVillages: VillageSeed[] = [
  ["أبو ديس", "Abu Dis", "municipality"], ["العيزرية", "al-Eizariya", "municipality"], ["الرام", "al-Ram", "municipality"],
  ["بدو", "Biddu", "municipality"], ["بيت عنان", "Beit Anan", "municipality"], ["بيت إجزا", "Beit Ijza"], ["بيت إكسا", "Beit Iksa"],
  ["بيت سوريك", "Beit Surik"], ["حزما", "Hizma"], ["قطنة", "Qatanna"], ["قلنديا", "Qalandiya"], ["رافات", "Rafat Jerusalem"],
  ["عناتا", "Anata"], ["الزعيم", "az-Za'ayyem"], ["السواحرة الشرقية", "as-Sawahira ash-Sharqiya"], ["الجيب", "Al Jib"],
  ["بيت دقو", "Beit Duqqu"], ["بيت حنينا البلد", "Beit Hanina"], ["كفر عقب", "Kafr Aqab", "neighborhood"], ["شعفاط", "Shuafat", "neighborhood"],
  ["العيسوية", "Isawiya", "neighborhood"], ["سلوان", "Silwan", "neighborhood"], ["الطور", "At-Tur Jerusalem", "neighborhood"], ["مخيم قلنديا", "Qalandiya Camp", "camp"],
  ["لفتا", "Lifta", "depopulated"], ["دير ياسين", "Deir Yassin", "depopulated"], ["عين كارم", "Ein Karem", "depopulated"],
  ["المالحة", "al-Maliha Jerusalem", "depopulated"], ["القسطل", "Al-Qastal", "depopulated"], ["قالونيا", "Qalunya", "depopulated"],
  ["صوبا", "Soba Palestine", "depopulated"], ["بيت محسير", "Bayt Mahsir", "depopulated"]
];

const jerichoVillages: VillageSeed[] = [
  ["العوجا", "al-Auja Jericho", "municipality"], ["الجفتلك", "al-Jiftlik", "municipality"], ["فصايل", "Fasayil"], ["الزبيدات", "az-Zubeidat"],
  ["مرج نعجة", "Marj Na'ja"], ["مرج الغزال", "Marj al-Ghazal"], ["النويعمة", "an-Nuway'imah"], ["الديوك", "ad-Duyuk"],
  ["عين السلطان", "Ein as-Sultan", "camp"], ["عقبة جبر", "Aqabat Jabr", "camp"]
];

const tulkarmVillages: VillageSeed[] = [
  ["عنبتا", "Anabta", "municipality"], ["بلعا", "Bal'a", "municipality"], ["دير الغصون", "Deir al-Ghusun", "municipality"],
  ["عتيل", "Attil", "municipality"], ["علار", "Illar", "municipality"], ["زيتا", "Zeita Tulkarm", "municipality"], ["قفين", "Qaffin", "municipality"],
  ["كفر اللبد", "Kafr al-Labad"], ["شوفة", "Shufa"], ["سفارين", "Saffarin"], ["كفر صور", "Kafr Sur"], ["باقة الشرقية", "Baqa ash-Sharqiyya"],
  ["النزلة الشرقية", "Nazla ash-Sharqiya"], ["النزلة الغربية", "Nazla al-Gharbiya"], ["نزلة عيسى", "Nazlat Isa"], ["رامين", "Ramin"],
  ["فرعون", "Far'un"], ["كور", "Kur"], ["كفر جمال", "Kafr Jammal"], ["كفر زيباد", "Kafr Zibad"], ["قاقون", "Qa'qun", "depopulated"],
  ["مسكة", "Miska", "depopulated"], ["خربة بيت ليد", "Khirbat Bayt Lid", "depopulated"]
];

const qalqilyaVillages: VillageSeed[] = [
  ["عزون", "Azzun", "municipality"], ["كفر ثلث", "Kafr Thulth", "municipality"], ["حبلة", "Hableh", "municipality"], ["جيوس", "Jayyus"],
  ["النبي إلياس", "Nabi Ilyas"], ["رأس عطية", "Ras Atiya"], ["سنيريا", "Sanniriya"], ["عزبة الطبيب", "Izbat at-Tabib"], ["كفر قدوم", "Kafr Qaddum"],
  ["جينصافوط", "Jinsafut"], ["باقة الحطب", "Baqat al-Hatab"], ["فلامية", "Falamya"], ["حجة", "Hajja"], ["إماتين", "Immatain"],
  ["فرعتا", "Far'ata"], ["كفر لاقف", "Kafr Laqif"]
];

const salfitVillages: VillageSeed[] = [
  ["بديا", "Biddya", "municipality"], ["بروقين", "Bruqin", "municipality"], ["دير بلوط", "Deir Ballut", "municipality"],
  ["دير استيا", "Deir Istiya", "municipality"], ["كفر الديك", "Kafr ad-Dik", "municipality"], ["كفل حارس", "Kifl Haris", "municipality"],
  ["قراوة بني حسان", "Qarawat Bani Hassan", "municipality"], ["مردا", "Marda"], ["مسحة", "Mas-ha"], ["الزاوية", "az-Zawiya Salfit"],
  ["ياسوف", "Yasuf"], ["حارس", "Haris"], ["إسكاكا", "Iskaka"], ["رافات", "Rafat Salfit"], ["سرطة", "Sarta"], ["فرخة", "Farkha"], ["عمورية", "Ammuriya"]
];

const tubasVillages: VillageSeed[] = [
  ["طمون", "Tammun", "municipality"], ["عقابا", "Aqqaba", "municipality"], ["تياسير", "Tayasir"], ["بردلة", "Bardala"],
  ["عين البيضا", "Ein al-Beida"], ["كردلة", "Kardala"], ["وادي الفارعة", "Wadi al-Far'a"], ["خربة عاطوف", "Khirbet Atuf"],
  ["الرأس الأحمر", "Ras al-Ahmar"], ["الفارعة", "Far'a Camp", "camp"]
];

const gazaCityVillages: VillageSeed[] = [
  ["البلدة القديمة", "Old City Gaza", "neighborhood"], ["الزيتون", "Zaytun Quarter", "neighborhood"], ["الدرج", "Daraj Quarter", "neighborhood"],
  ["التفاح", "Tuffah Gaza", "neighborhood"], ["الشجاعية", "Shuja'iyya", "neighborhood"], ["الرمال", "Rimal Gaza", "neighborhood"],
  ["الصبرة", "Sabra Gaza", "neighborhood"], ["الشيخ عجلين", "Sheikh Ijlin", "neighborhood"], ["الشيخ رضوان", "Sheikh Radwan", "neighborhood"],
  ["تل الهوى", "Tel al-Hawa", "neighborhood"], ["المغراقة", "al-Mughraqa Gaza", "municipality"], ["الزهراء", "al-Zahra Gaza", "municipality"],
  ["جحر الديك", "Juhor ad-Dik"], ["مخيم الشاطئ", "al-Shati Camp", "camp"]
];

const northGazaVillages: VillageSeed[] = [
  ["بيت لاهيا", "Beit Lahia", "municipality"], ["بيت حانون", "Beit Hanoun", "municipality"], ["جباليا البلد", "Jabalia"], ["جباليا النزلة", "Jabalia al-Nazla"],
  ["أم النصر", "Umm al-Nasr"], ["عزبة بيت حانون", "Izbat Beit Hanoun"], ["مخيم جباليا", "Jabalia Camp", "camp"]
];

const deirBalahVillages: VillageSeed[] = [
  ["الزوايدة", "az-Zawayda", "municipality"], ["المصدر", "al-Musaddar"], ["وادي السلقا", "Wadi as-Salqa"], ["البريج", "Bureij", "camp"],
  ["مخيم دير البلح", "Deir al-Balah Camp", "camp"], ["المغازي", "Maghazi", "camp"], ["النصيرات", "Nuseirat", "camp"]
];

const khanYunisVillages: VillageSeed[] = [
  ["بني سهيلا", "Bani Suheila", "municipality"], ["عبسان الكبيرة", "Abasan al-Kabira", "municipality"], ["عبسان الصغيرة", "Abasan al-Saghira", "municipality"],
  ["الفخاري", "al-Fukhari", "municipality"], ["القرارة", "al-Qarara", "municipality"], ["خزاعة", "Khuza'a", "municipality"],
  ["المواصي", "Al-Mawasi", "neighborhood"], ["أم الكلاب", "Umm al-Kilab"], ["قيزان النجار", "Qizan an-Najjar"], ["مدينة حمد", "Hamad City", "neighborhood"]
];

const rafahVillages: VillageSeed[] = [
  ["البيوك", "al-Bayuk", "municipality"], ["الشوكة", "Shokat as-Sufi", "municipality"], ["المواصي", "Al-Mawasi Rafah"], ["القرية السويدية", "Al Qarya as Suwaydiya"],
  ["مخيم رفح", "Rafah Camp", "camp"], ["تل السلطان", "Tel al-Sultan", "camp"], ["خربة العدس", "Khirbet al-Adas", "neighborhood"], ["حي السلام", "Hay al-Salam Rafah", "neighborhood"]
];

const galileeVillages: VillageSeed[] = [
  ["الرينة", "Reineh", "municipality"], ["كفر كنا", "Kafr Kanna", "municipality"], ["المشهد", "Mashhad Israel", "municipality"], ["إكسال", "Iksal", "municipality"],
  ["عين ماهل", "Ein Mahil", "municipality"], ["يافة الناصرة", "Yafa an-Naseriyye", "municipality"], ["دبورية", "Daburiyya", "municipality"],
  ["طرعان", "Turan Israel", "municipality"], ["عيلوط", "Ilut", "municipality"], ["عيلبون", "Eilabun", "municipality"], ["دير حنا", "Deir Hanna", "municipality"],
  ["كوكب أبو الهيجاء", "Kaukab Abu al-Hija", "municipality"], ["كفر مندا", "Kafr Manda", "municipality"], ["البعنة", "Bi'ina", "municipality"],
  ["دير الأسد", "Deir al-Asad", "municipality"], ["نحف", "Nahf", "municipality"], ["كابول", "Kabul Israel", "municipality"], ["شعب", "Sha'ab", "municipality"],
  ["إعبلين", "I'billin", "municipality"], ["إبطن", "Ibtin"], ["صفورية", "Saffuriya", "depopulated"], ["البروة", "Al-Birwa", "depopulated"]
];

const triangleVillages: VillageSeed[] = [
  ["معاوية", "Mu'awiya Israel"], ["مصمص", "Musmus"], ["مشيرفة", "Mushayrifa"], ["زلفة", "Zalafa"], ["سالم", "Salem Israel"],
  ["قلنسوة", "Qalansawe", "municipality"], ["جلجولية", "Jaljulia", "municipality"], ["كفر برا", "Kafr Bara", "municipality"], ["جت", "Jatt Israel", "municipality"],
  ["زيمر", "Zemer Israel", "municipality"], ["كفر قرع", "Kafr Qara", "municipality"], ["عرعرة", "Ar'ara Israel", "municipality"], ["عين السهلة", "Ein as-Sahla"],
  ["برطعة", "Barta'a", "municipality"], ["اللجون", "Lajjun", "depopulated"], ["قنير", "Qannir", "depopulated"]
];

const negevVillages: VillageSeed[] = [
  ["حورة", "Hura", "municipality"], ["كسيفة", "Kuseife", "municipality"], ["اللقية", "Lakiya", "municipality"], ["تل السبع", "Tel as-Sabi", "municipality"],
  ["عرعرة النقب", "Ar'arat an-Naqab", "municipality"], ["شقيب السلام", "Shaqib al-Salam", "municipality"], ["أم بطين", "Umm Batin", "municipality"],
  ["السيد", "Al-Sayyid"], ["أبو قرينات", "Abu Qrenat"], ["الفرعة", "al-Fur'ah Negev"], ["وادي النعم", "Wadi al-Na'am"], ["أم الحيران", "Umm al-Hiran"],
  ["العراقيب", "Al-Araqeeb"], ["تل عراد", "Tel Arad Bedouin"], ["بير هداج", "Bir Hadaj"]
];

const jaffaVillages: VillageSeed[] = [
  ["سلمة", "Salama Jaffa", "depopulated"], ["يازور", "Yazur", "depopulated"], ["بيت دجن", "Bayt Dajan Jaffa", "depopulated"],
  ["الشيخ مونس", "Sheikh Munis", "depopulated"], ["العباسية", "Al-Abbasiyya", "depopulated"], ["جماسين الغربي", "Al-Jammasin al-Gharbi", "depopulated"],
  ["إجليل", "Ijlit", "depopulated"], ["أبو كشك", "Abu Kishk", "depopulated"], ["الخيرية", "Al-Khayriyya", "depopulated"],
  ["كفر عانة", "Kafr 'Ana", "depopulated"], ["ساقية", "Saqiya", "depopulated"], ["فجة", "Fajja", "depopulated"]
];

const haifaVillages: VillageSeed[] = [
  ["الطنطورة", "Tantura", "depopulated"], ["عين غزال", "Ein Ghazal Haifa", "depopulated"], ["إجزم", "Ijzim", "depopulated"],
  ["جبع", "Jaba Haifa", "depopulated"], ["أم الزينات", "Umm al-Zinat", "depopulated"], ["بلد الشيخ", "Balad al-Shaykh", "depopulated"],
  ["الطيرة", "Tira Haifa", "depopulated"], ["كفر لام", "Kafr Lam", "depopulated"], ["صبارين", "Sabbarin", "depopulated"],
  ["عين حوض", "Ein Hod", "depopulated"], ["هوشة", "Husha", "depopulated"], ["الكفرين", "Al-Kafrayn", "depopulated"]
];

const acreVillages: VillageSeed[] = [
  ["البروة", "Al-Birwa", "depopulated"], ["إقرث", "Iqrit", "depopulated"], ["الكابري", "Al-Kabri", "depopulated"], ["الزيب", "Az-Zeeb", "depopulated"],
  ["عمقا", "Amqa", "depopulated"], ["كويكات", "Kuweikat", "depopulated"], ["الغابسية", "Al-Ghabisiyya", "depopulated"], ["الدامون", "Al-Damun", "depopulated"],
  ["سحماتا", "Suhmata", "depopulated"], ["ميعار", "Mi'ar", "depopulated"], ["البصة", "Al-Bassa", "depopulated"], ["النهر", "Al-Nahr", "depopulated"]
];

const safedVillages: VillageSeed[] = [
  ["كفر برعم", "Kafr Bir'im", "depopulated"], ["عين الزيتون", "Ein al-Zeitun", "depopulated"], ["صفصاف", "Safsaf", "depopulated"],
  ["الجاعونة", "Ja'una", "depopulated"], ["ميرون", "Meiron", "depopulated"], ["قدس", "Qadas", "depopulated"], ["ديشوم", "Dishon", "depopulated"],
  ["علما", "Alma Safad", "depopulated"], ["عموقة", "Ammuqa", "depopulated"], ["فراضية", "Farradiyya", "depopulated"], ["الخالصة", "Al-Khalisa", "depopulated"]
];

const tiberiasVillages: VillageSeed[] = [
  ["لوبية", "Lubya", "depopulated"], ["الشجرة", "al-Shajara", "depopulated"], ["حطين", "Hittin", "depopulated"], ["سمخ", "Samakh", "depopulated"],
  ["ناصر الدين", "Nasir ad-Din", "depopulated"], ["المجدل", "Al-Majdal Tiberias", "depopulated"], ["ياقوق", "Yaquq", "depopulated"], ["كفر سبت", "Kafr Sabt", "depopulated"],
  ["المنارة", "Al-Manara Tiberias", "depopulated"], ["الدلهمية", "Al-Dalhamiyya", "depopulated"]
];

const beisanVillages: VillageSeed[] = [
  ["زرعين", "Zir'in", "depopulated"], ["الأشرفية", "Al-Ashrafiyya", "depopulated"], ["فرونة", "Farwana", "depopulated"], ["كفر مصر", "Kafr Misr", "depopulated"],
  ["كوكب الهوا", "Kawkab al-Hawa", "depopulated"], ["الطيرة", "Tira Baysan", "depopulated"], ["تل الشوك", "Tall al-Shawk", "depopulated"],
  ["المرصص", "Al-Murassas", "depopulated"], ["عرب البواطي", "Arab al-Bawati", "depopulated"]
];

const ramlaVillages: VillageSeed[] = [
  ["عمواس", "Imwas", "depopulated"], ["يالو", "Yalu", "depopulated"], ["بيت نوبا", "Beit Nuba", "depopulated"], ["عنابة", "Innaba", "depopulated"],
  ["أبو شوشة", "Abu Shusha Ramle", "depopulated"], ["البرية", "Al-Burj Ramle", "depopulated"], ["دير أيوب", "Dayr Ayyub", "depopulated"],
  ["جمزو", "Jimzu", "depopulated"], ["القباب", "Al-Qubab", "depopulated"], ["البرج", "Al-Burj Ramla", "depopulated"], ["برفيلية", "Barfiliya", "depopulated"]
];

const lodVillages: VillageSeed[] = [
  ["دانيال", "Daniyal", "depopulated"], ["بيت نبالا", "Bayt Nabala", "depopulated"], ["دير طريف", "Dayr Tarif", "depopulated"],
  ["قولة", "Qula", "depopulated"], ["المزيرعة", "Al-Muzayri'a", "depopulated"], ["رنتية", "Rantiya", "depopulated"],
  ["الطيرة", "Al-Tira Lydda", "depopulated"], ["خربة الضهيرية", "Khirbat al-Duhayriyya", "depopulated"], ["جنداس", "Jindas", "depopulated"]
];

const majdalVillages: VillageSeed[] = [
  ["الجورة", "al-Jura", "depopulated"], ["حمامة", "Hamama", "depopulated"], ["بيت دراس", "Bayt Daras", "depopulated"], ["بربرة", "Barbara Palestine", "depopulated"],
  ["هربيا", "Hiribya", "depopulated"], ["دير سنيد", "Dayr Sunayd", "depopulated"], ["نعليا", "Ni'ilya", "depopulated"], ["برقة", "Barqa Gaza", "depopulated"],
  ["بيت عفا", "Bayt Affa", "depopulated"], ["جولس", "Julis Gaza", "depopulated"], ["السوافير", "Al-Sawafir", "depopulated"]
];

export const CITY_VILLAGES: CityVillage[] = [
  ...makeVillages("jenin", "جنين", "محافظة جنين", SOURCES.jenin, "village", jeninVillages),
  ...makeVillages("qabatiya", "قباطية", "محافظة جنين", SOURCES.jenin, "village", jeninVillages),
  ...makeVillages("nablus", "نابلس", "محافظة نابلس", SOURCES.nablus, "village", nablusVillages),
  ...makeVillages("ramallah", "رام الله", "محافظة رام الله والبيرة", SOURCES.ramallah, "village", ramallahVillages),
  ...makeVillages("al-bireh", "البيرة", "محافظة رام الله والبيرة", SOURCES.ramallah, "village", ramallahVillages),
  ...makeVillages("bethlehem", "بيت لحم", "محافظة بيت لحم", SOURCES.bethlehem, "village", bethlehemVillages),
  ...makeVillages("beit-jala", "بيت جالا", "محافظة بيت لحم", SOURCES.bethlehem, "village", bethlehemVillages),
  ...makeVillages("beit-sahour", "بيت ساحور", "محافظة بيت لحم", SOURCES.bethlehem, "village", bethlehemVillages),
  ...makeVillages("hebron", "الخليل", "محافظة الخليل", SOURCES.hebron, "village", hebronVillages),
  ...makeVillages("yatta", "يطا", "محافظة الخليل", SOURCES.hebron, "village", hebronVillages),
  ...makeVillages("dhahiriya", "الظاهرية", "محافظة الخليل", SOURCES.hebron, "village", hebronVillages),
  ...makeVillages("dura", "دورا", "محافظة الخليل", SOURCES.hebron, "village", hebronVillages),
  ...makeVillages("halhul", "حلحول", "محافظة الخليل", SOURCES.hebron, "village", hebronVillages),
  ...makeVillages("east-jerusalem", "القدس الشرقية", "محافظة القدس", SOURCES.pcbsLocalities, "village", jerusalemVillages),
  ...makeVillages("abu-dis", "أبو ديس", "محافظة القدس", SOURCES.pcbsLocalities, "village", jerusalemVillages),
  ...makeVillages("west-jerusalem", "القدس الغربية", "قضاء القدس التاريخي", SOURCES.palestineStudies, "depopulated", jerusalemVillages),
  ...makeVillages("jericho", "أريحا", "محافظة أريحا والأغوار", SOURCES.pcbsLocalities, "village", jerichoVillages),
  ...makeVillages("tulkarm", "طولكرم", "محافظة طولكرم", SOURCES.pcbsLocalities, "village", tulkarmVillages),
  ...makeVillages("qalqilya", "قلقيلية", "محافظة قلقيلية", SOURCES.pcbsLocalities, "village", qalqilyaVillages),
  ...makeVillages("salfit", "سلفيت", "محافظة سلفيت", SOURCES.pcbsLocalities, "village", salfitVillages),
  ...makeVillages("tubas", "طوباس", "محافظة طوباس والأغوار الشمالية", SOURCES.pcbsLocalities, "village", tubasVillages),
  ...makeVillages("gaza-city", "غزة", "محافظة غزة", SOURCES.gaza, "neighborhood", gazaCityVillages),
  ...makeVillages("jabalia", "جباليا", "محافظة شمال غزة", SOURCES.pcbsLocalities, "village", northGazaVillages),
  ...makeVillages("beit-lahia", "بيت لاهيا", "محافظة شمال غزة", SOURCES.pcbsLocalities, "village", northGazaVillages),
  ...makeVillages("beit-hanoun", "بيت حانون", "محافظة شمال غزة", SOURCES.pcbsLocalities, "village", northGazaVillages),
  ...makeVillages("deir-al-balah", "دير البلح", "محافظة دير البلح", SOURCES.deirBalah, "village", deirBalahVillages),
  ...makeVillages("khan-yunis", "خان يونس", "محافظة خان يونس", SOURCES.khanYunis, "village", khanYunisVillages),
  ...makeVillages("rafah", "رفح", "محافظة رفح", SOURCES.rafah, "village", rafahVillages),
  ...makeVillages("nazareth", "الناصرة", "الجليل والناصرة", SOURCES.pcbsLocalities, "village", galileeVillages),
  ...makeVillages("sakhnin", "سخنين", "الجليل الأسفل", SOURCES.pcbsLocalities, "village", galileeVillages),
  ...makeVillages("shefa-amr", "شفاعمرو", "الجليل الغربي", SOURCES.pcbsLocalities, "village", galileeVillages),
  ...makeVillages("tamra", "طمرة", "الجليل الغربي", SOURCES.pcbsLocalities, "village", galileeVillages),
  ...makeVillages("arraba", "عرابة", "الجليل", SOURCES.pcbsLocalities, "village", galileeVillages),
  ...makeVillages("majd-al-krum", "مجد الكروم", "الجليل الأعلى", SOURCES.pcbsLocalities, "village", galileeVillages),
  ...makeVillages("umm-al-fahm", "أم الفحم", "المثلث الشمالي", SOURCES.pcbsLocalities, "village", triangleVillages),
  ...makeVillages("tayibe", "الطيبة", "المثلث الجنوبي", SOURCES.pcbsLocalities, "village", triangleVillages),
  ...makeVillages("tira", "الطيرة", "المثلث الجنوبي", SOURCES.pcbsLocalities, "village", triangleVillages),
  ...makeVillages("kafr-qasim", "كفر قاسم", "المثلث الجنوبي", SOURCES.pcbsLocalities, "village", triangleVillages),
  ...makeVillages("baqa", "باقة الغربية", "المثلث الشمالي", SOURCES.pcbsLocalities, "village", triangleVillages),
  ...makeVillages("rahat", "رهط", "النقب", SOURCES.pcbsLocalities, "village", negevVillages),
  ...makeVillages("beersheba", "بئر السبع", "النقب التاريخي", SOURCES.palestineRemembered, "village", negevVillages),
  ...makeVillages("jaffa", "يافا", "قضاء يافا التاريخي", SOURCES.palestineStudies, "depopulated", jaffaVillages),
  ...makeVillages("haifa", "حيفا", "قضاء حيفا التاريخي", SOURCES.palestineStudies, "depopulated", haifaVillages),
  ...makeVillages("acre", "عكا", "قضاء عكا التاريخي", SOURCES.palestineStudies, "depopulated", acreVillages),
  ...makeVillages("safed", "صفد", "قضاء صفد التاريخي", SOURCES.palestineStudies, "depopulated", safedVillages),
  ...makeVillages("tiberias", "طبريا", "قضاء طبريا التاريخي", SOURCES.palestineStudies, "depopulated", tiberiasVillages),
  ...makeVillages("beisan", "بيسان", "قضاء بيسان التاريخي", SOURCES.palestineStudies, "depopulated", beisanVillages),
  ...makeVillages("ramla", "الرملة", "قضاء الرملة التاريخي", SOURCES.palestineStudies, "depopulated", ramlaVillages),
  ...makeVillages("lod", "اللد", "قضاء اللد/الرملة التاريخي", SOURCES.palestineStudies, "depopulated", lodVillages),
  ...makeVillages("majdal", "المجدل عسقلان", "قضاء غزة التاريخي", SOURCES.palestineStudies, "depopulated", majdalVillages)
];

export function getVillagesForCity(cityId: string) {
  return CITY_VILLAGES.filter((village) => village.cityId === cityId);
}
