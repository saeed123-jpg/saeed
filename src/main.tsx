import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { CITY_GROUPS, PALESTINE_CITIES } from "./data/cities.js";
import { HISTORY_GROUPS, PALESTINE_HISTORY_EVENTS } from "./data/history.js";
import {
  HOME_ERAS,
  HOME_GALLERY,
  HOME_GLOSSARY,
  HOME_HERITAGE_SITES,
  HOME_LEARNING_PATHS,
  HOME_MILESTONES,
  HOME_QUIZ,
  HOME_RESEARCH_DOSSIERS,
  HOME_SEQUENCE_CHALLENGE,
  HOME_SOURCES,
  HOME_THEMES
} from "./data/home";
import { ATLAS_FIGURES, ATLAS_VILLAGES, CITY_MAP_POINTS } from "./data/atlas-additions";
import { getVillagesForCity } from "./data/city-villages";
import type { City, CityVillage, HistoryEvent } from "./types";
import "./styles.css";
import "./react-overrides.css";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const cities = PALESTINE_CITIES as City[];
const historyEvents = PALESTINE_HISTORY_EVENTS as HistoryEvent[];
const villages = ATLAS_VILLAGES;
const figures = ATLAS_FIGURES;

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return hash.replace(/^#\/?/, "").split("/").filter(Boolean);
}

function pathFor(path = "") {
  return `#/${path}`;
}

function normalize(value: string) {
  return value
    .toString()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

type FavoriteItem = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
};

const FAVORITES_KEY = "atlas-favorites";
const FAVORITES_EVENT = "atlas:favorites";

function readFavorites(): FavoriteItem[] {
  try {
    const value = localStorage.getItem(FAVORITES_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: FavoriteItem[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
}

function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>(() => readFavorites());

  useEffect(() => {
    const sync = () => setItems(readFavorites());
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return items;
}

function FavoriteButton({ item }: { item: FavoriteItem }) {
  const favorites = useFavorites();
  const active = favorites.some((favorite) => favorite.id === item.id && favorite.type === item.type);

  function toggleFavorite() {
    const current = readFavorites();
    const exists = current.some((favorite) => favorite.id === item.id && favorite.type === item.type);
    const next = exists
      ? current.filter((favorite) => !(favorite.id === item.id && favorite.type === item.type))
      : [item, ...current].slice(0, 80);
    writeFavorites(next);
  }

  return (
    <button
      className={`favorite-button ${active ? "is-active" : ""}`}
      type="button"
      onClick={toggleFavorite}
      aria-pressed={active}
    >
      {active ? "محفوظ" : "حفظ"}
    </button>
  );
}

function Header() {
  return (
    <header className="topbar" aria-label="رأس الصفحة">
      <a className="brand" href={pathFor()} aria-label="أطلس فلسطين التاريخي">
        <span className="brand-mark" aria-hidden="true" />
        <span>أطلس فلسطين التاريخي</span>
      </a>
      <nav className="nav-links" aria-label="التنقل الرئيسي">
        <a href={pathFor()}>الرئيسية</a>
        <a href={pathFor("eras")}>العصور</a>
        <a href={pathFor("history")}>الموسوعة</a>
        <a href={pathFor("dossiers")}>ملفات</a>
        <ToolsMenu />
        <CityMenu />
        <a href={pathFor("themes")}>المحاور</a>
        <a href={pathFor("gallery")}>الصور</a>
        <a href={pathFor("sources")}>المراجع</a>
      </nav>
      <LanguageSwitcher />
    </header>
  );
}

function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const [suppressHover, setSuppressHover] = useState(false);
  const tools = [
    { href: pathFor("map"), label: "الخريطة", text: "مدن وقرى على خريطة تفاعلية" },
    { href: pathFor("search"), label: "بحث متقدم", text: "ابحث في كل محتوى المنصة" },
    { href: pathFor("timeline"), label: "خط زمني بصري", text: "استكشف الأحداث كمحطات" },
    { href: pathFor("villages"), label: "القرى المهجرة", text: "ذاكرة القرى قبل وبعد التهجير" },
    { href: pathFor("figures"), label: "شخصيات", text: "أعلام في الثقافة والسياسة والفكر" },
    { href: pathFor("activities"), label: "أنشطة", text: "اختبارات وبطاقات مراجعة خفيفة" },
    { href: pathFor("favorites"), label: "مفضلتي", text: "ما حفظته للعودة إليه لاحقا" }
  ];

  function closeMenuAfterChoice(event: React.MouseEvent<HTMLAnchorElement>) {
    setOpen(false);
    setSuppressHover(true);
    event.currentTarget.blur();
  }

  return (
    <div
      className={`nav-dropdown tools-dropdown ${open ? "is-open" : ""} ${suppressHover ? "is-suppressed" : ""}`}
      onMouseLeave={() => {
        setOpen(false);
        setSuppressHover(false);
      }}
    >
      <button
        className="nav-menu-button"
        type="button"
        aria-expanded={open}
        onClick={() => {
          setSuppressHover(false);
          setOpen((value) => !value);
        }}
      >
        أدوات
      </button>
      <div className="tools-menu-panel">
        <div className="tools-menu-grid">
          {tools.map((tool) => (
            <a href={tool.href} key={tool.href} onClick={closeMenuAfterChoice}>
              <strong>{tool.label}</strong>
              <span>{tool.text}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function CityMenu() {
  const [open, setOpen] = useState(false);
  const [suppressHover, setSuppressHover] = useState(false);
  const grouped = Object.entries(CITY_GROUPS).map(([key, group]: any) => ({
    key,
    ...group,
    cities: cities.filter((city) => city.category === key)
  }));

  function closeMenuAfterChoice(event: React.MouseEvent<HTMLAnchorElement>) {
    setOpen(false);
    setSuppressHover(true);
    event.currentTarget.blur();
  }

  return (
    <div
      className={`nav-dropdown ${open ? "is-open" : ""} ${suppressHover ? "is-suppressed" : ""}`}
      onMouseLeave={() => {
        setOpen(false);
        setSuppressHover(false);
      }}
    >
      <button
        className="nav-menu-button"
        type="button"
        aria-expanded={open}
        onClick={() => {
          setSuppressHover(false);
          setOpen((value) => !value);
        }}
      >
        مدن
      </button>
      <div className="city-menu-panel">
        <a className="city-menu-all" href={pathFor("cities")} onClick={closeMenuAfterChoice}>عرض كل المدن</a>
        <div className="city-menu-groups">
          {grouped.map((group) => (
            <section className="city-menu-group" key={group.key}>
              <h3>{group.label}</h3>
              <div className="city-menu-links">
                {group.cities.map((city) => {
                  const villageCount = getVillagesForCity(city.id).length;
                  return (
                    <a href={pathFor(`city/${city.id}`)} key={city.id} onClick={closeMenuAfterChoice}>
                      <span>{city.name}</span>
                      {villageCount > 0 && <small>{villageCount} قرية</small>}
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

const languages = [
  ["ar", "العربية"], ["en", "English"], ["fr", "Français"], ["es", "Español"], ["de", "Deutsch"],
  ["it", "Italiano"], ["pt", "Português"], ["ru", "Русский"], ["tr", "Türkçe"], ["fa", "فارسی"],
  ["ur", "اردو"], ["iw", "עברית"], ["zh-CN", "中文 简体"], ["ja", "日本語"], ["ko", "한국어"],
  ["hi", "हिन्दी"], ["bn", "বাংলা"], ["sw", "Kiswahili"], ["th", "ไทย"], ["vi", "Tiếng Việt"],
  ["id", "Indonesia"], ["nl", "Nederlands"], ["pl", "Polski"], ["uk", "Українська"], ["el", "Ελληνικά"]
];

const HERO_IMAGE_QUERIES = [
  "Jerusalem Old City panorama Palestine",
  "Dome of the Rock Jerusalem panorama",
  "Palestine landscape Jerusalem"
];

function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function ensureTranslate() {
    if (document.querySelector("#google-translate-script")) return;
    const holder = document.createElement("div");
    holder.id = "google_translate_element";
    document.body.appendChild(holder);
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "ar", autoDisplay: false, includedLanguages: languages.map(([code]) => code).join(",") },
        "google_translate_element"
      );
    };
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);
  }

  function applyLanguage(code: string) {
    if (code === "ar") {
      localStorage.setItem("atlas-language", "ar");
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      location.reload();
      return;
    }
    localStorage.setItem("atlas-language", code);
    ensureTranslate();
    const trySelect = () => {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (!select) {
        window.setTimeout(trySelect, 350);
        return;
      }
      select.value = code;
      select.dispatchEvent(new Event("change"));
    };
    trySelect();
  }

  const filtered = languages.filter(([, name]) => name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={`language-switcher ${open ? "is-open" : ""}`}>
      <button className="language-button" type="button" onClick={() => { setOpen((value) => !value); ensureTranslate(); }}>
        <span className="language-button-mark">Aa</span>
        <span>اللغة</span>
      </button>
      <div className="language-panel">
        <label className="language-search-label" htmlFor="language-search">اختر اللغة</label>
        <input id="language-search" className="language-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن لغة..." />
        <div className="language-list">
          {filtered.map(([code, name]) => (
            <button key={code} type="button" onClick={() => applyLanguage(code)}>{name}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const [query, setQuery] = useState("");
  const queryText = normalize(query);
  const cityResults = queryText
    ? cities.filter((city) => normalize([city.name, city.region, city.summary, city.history, ...city.tags].join(" ")).includes(queryText)).slice(0, 4)
    : [];
  const eraResults = queryText
    ? HOME_ERAS.filter((era) => normalize([era.period, era.type, era.title, era.summary, ...era.tags].join(" ")).includes(queryText)).slice(0, 4)
    : [];
  const dossierResults = queryText
    ? HOME_RESEARCH_DOSSIERS.filter((dossier) => normalize([dossier.label, dossier.title, dossier.summary, ...dossier.points, ...dossier.tags].join(" ")).includes(queryText)).slice(0, 4)
    : [];
  const hasSearchResults = cityResults.length > 0 || eraResults.length > 0 || dossierResults.length > 0;
  const gates = [
    { href: pathFor("history"), label: "الموسوعة", title: "الأحداث التاريخية", text: "أرشيف موسع للأحداث والحروب والتحولات من القدم حتى 2026.", meta: `${historyEvents.length} محطة` },
    { href: pathFor("cities"), label: "المدن", title: "فهرس المدن", text: "مدن الضفة والقدس، الداخل الفلسطيني، وقطاع غزة بصفحات مستقلة.", meta: `${cities.length} مدينة` },
    { href: pathFor("eras"), label: "العصور", title: "الخط الزمني", text: "قراءة مرتبة للعصور والتحولات الدينية والجغرافية والسياسية.", meta: `${HOME_ERAS.length} عصر` },
    { href: pathFor("dossiers"), label: "ملفات", title: "ملفات بحثية", text: "سكان ولاجئون وتراث وقانون وحركة واقتصاد وغزة في ملفات منظمة.", meta: `${HOME_RESEARCH_DOSSIERS.length} ملفات` },
    { href: pathFor("map"), label: "الخريطة", title: "خريطة تفاعلية", text: "نقاط للمدن والقرى المهجرة تساعد القارئ على ربط المكان بالذاكرة.", meta: `${CITY_MAP_POINTS.length + villages.length} نقطة` },
    { href: pathFor("search"), label: "بحث", title: "بحث متقدم", text: "محرك واحد للمدن والأحداث والعصور والقرى والشخصيات والمصطلحات.", meta: "كل المحتوى" },
    { href: pathFor("timeline"), label: "زمني", title: "خط زمني بصري", text: "قراءة الأحداث كمحطات قابلة للاختيار بدل قائمة طويلة فقط.", meta: `${historyEvents.length} محطة` },
    { href: pathFor("villages"), label: "قرى", title: "القرى المهجرة", text: "صفحة مستقلة لذاكرة القرى، قبل التهجير وبعده، مع صور حقيقية.", meta: `${villages.length} قرية` },
    { href: pathFor("figures"), label: "أعلام", title: "شخصيات وأعلام", text: "مدخل إلى شخصيات فلسطينية في الأدب والفكر والسياسة والعمل الوطني.", meta: `${figures.length} شخصية` },
    { href: pathFor("activities"), label: "أنشطة", title: "أنشطة ومراجعة", text: "اختبار قصير وبطاقات مراجعة وتحدي ترتيب زمني دون تحويل الموقع إلى منصة تعليمية كاملة.", meta: `${HOME_QUIZ.length} أسئلة` },
    { href: pathFor("favorites"), label: "حفظ", title: "مفضلتي", text: "احفظ مدينة أو حدثا أو قرية أو شخصية لتعود إليها بسرعة.", meta: "محلي على جهازك" },
    { href: pathFor("themes"), label: "المحاور", title: "طرق الفهم", text: "محاور الدين والجغرافيا والسياسة والمجتمع والتراث مع مصطلحات مهمة.", meta: `${HOME_THEMES.length} محاور` },
    { href: pathFor("gallery"), label: "الصور", title: "المعرض البصري", text: "صور حقيقية مفتوحة المصدر مرتبطة بالتاريخ والمدن والجغرافيا.", meta: `${HOME_GALLERY.length} صور` },
    { href: pathFor("sources"), label: "المراجع", title: "مصادر المتابعة", text: "روابط ومراجع خارجية للتوثيق والمتابعة والقراءة الأوسع.", meta: `${HOME_SOURCES.length} مصادر` }
  ];

  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <CommonsImage className="hero-image" queries={HERO_IMAGE_QUERIES} alt="صورة حقيقية لمدينة القدس أو مشهد من فلسطين التاريخية" placeholder="جاري تحميل صورة حقيقية من مصدر مفتوح..." />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="kicker">أطلس تاريخي وجغرافي وسياسي</p>
          <h1 id="hero-title">فلسطين عبر العصور</h1>
          <p className="hero-copy">مدخل هادئ إلى تاريخ فلسطين ومدنها وجغرافيتها ومحطاتها الدينية والسياسية. اختر النافذة التي تريدها من البطاقات أو من القائمة العلوية.</p>
          <div className="hero-actions" aria-label="روابط رئيسية">
            <a className="primary-link" href={pathFor("history")}>افتح الموسوعة</a>
            <a className="secondary-link" href={pathFor("cities")}>استكشف المدن</a>
          </div>
          <form className="search-panel" role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="site-search">بحث سريع</label>
            <div className="search-row">
              <input id="site-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن: القدس، النكبة، غزة، طوفان الأقصى..." />
              <button id="clear-search" type="button" aria-label="مسح البحث" onClick={() => setQuery("")}>×</button>
            </div>
          </form>
        </div>
      </section>

      <section className="overview band" aria-labelledby="overview-title">
        <div className="section-heading">
          <p className="kicker">نظرة عامة</p>
          <h2 id="overview-title">ابدأ من نافذة واحدة</h2>
          <p>الصفحة الرئيسية أصبحت بوابة مختصرة. المحتوى التفصيلي موجود في صفحات منفصلة حتى لا تكون البداية مزدحمة أو مرهقة للقارئ.</p>
        </div>
        <div className="stat-grid">
          <article className="stat-card"><strong>{historyEvents.length}</strong><span>محطة في الموسوعة التاريخية</span></article>
          <article className="stat-card"><strong>{cities.length}</strong><span>مدينة وبلدة فلسطينية</span></article>
          <article className="stat-card"><strong>{HOME_THEMES.length}</strong><span>محاور تفسيرية رئيسية</span></article>
          <article className="stat-card"><strong>2026</strong><span>تغطية زمنية حتى هذا العام</span></article>
        </div>
      </section>

      {queryText && (
        <section className="quick-results band" aria-labelledby="quick-results-title">
          <div className="section-heading">
            <p className="kicker">بحث الصفحة الرئيسية</p>
            <h2 id="quick-results-title">نتائج سريعة</h2>
            <p>نتائج مختصرة فقط. افتح صفحة المدن أو العصور أو الموسوعة للقراءة الكاملة.</p>
          </div>
          {hasSearchResults ? (
            <div className="quick-result-grid">
              {cityResults.map((city) => (
                <a className="quick-result-card" href={pathFor(`city/${city.id}`)} key={city.id}>
                  <span>مدينة</span>
                  <strong>{city.name}</strong>
                  <p>{city.region}</p>
                </a>
              ))}
              {eraResults.map((era) => (
                <a className="quick-result-card" href={pathFor("eras")} key={`${era.period}-${era.title}`}>
                  <span>{era.period}</span>
                  <strong>{era.title}</strong>
                  <p>{era.type}</p>
                </a>
              ))}
              {dossierResults.map((dossier) => (
                <a className="quick-result-card" href={pathFor("dossiers")} key={dossier.id}>
                  <span>{dossier.label}</span>
                  <strong>{dossier.title}</strong>
                  <p>{dossier.summary}</p>
                </a>
              ))}
            </div>
          ) : <div className="empty-state">لا توجد نتائج مختصرة مطابقة. جرّب البحث داخل الموسوعة أو المدن.</div>}
        </section>
      )}

      <section className="portal-section band" aria-labelledby="portal-title">
        <div className="section-heading">
          <p className="kicker">نوافذ المنصة</p>
          <h2 id="portal-title">كل موضوع في صفحته</h2>
          <p>اختر ما تريد قراءته الآن، واترك التفاصيل الثقيلة للصفحات المتخصصة.</p>
        </div>
        <div className="portal-grid">
          {gates.map((gate) => (
            <a className="portal-card" href={gate.href} key={gate.href}>
              <span>{gate.label}</span>
              <h3>{gate.title}</h3>
              <p>{gate.text}</p>
              <strong>{gate.meta}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="turning-points band home-brief" aria-labelledby="milestones-title">
        <div className="section-heading">
          <p className="kicker">لمحة سريعة</p>
          <h2 id="milestones-title">محطات تكفي كبداية</h2>
          <p>هذه لمحة مختصرة فقط. افتح الموسوعة أو العصور للقراءة الكاملة.</p>
        </div>
        <div className="milestone-grid">
          {HOME_MILESTONES.slice(0, 4).map(([date, text]) => (
            <article className="milestone" key={date}>
              <strong>{date}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function DossiersPage() {
  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">ملفات بحثية</p>
          <h1>ملفات بحثية معمقة</h1>
          <p>هذه الصفحة تجمع موضوعات لا يكفي أن تظهر كفقرات عابرة: السكان والشتات، اللاجئون، التراث العالمي، الحركة والحواجز، القانون الدولي، الاقتصاد، وغزة حتى 2026.</p>
        </div>
      </section>
      <section className="dossiers band" aria-labelledby="dossiers-title">
        <div className="section-heading">
          <p className="kicker">قراءة مركزة</p>
          <h2 id="dossiers-title">ملفات تقرأ فلسطين من أكثر من زاوية</h2>
          <p>كل ملف يحتوي خلاصة ونقاط متابعة ورابطا لمصدر موثوق حتى يستطيع القارئ الانتقال من العرض العام إلى التوثيق الأصلي.</p>
        </div>
        <div className="dossier-grid">
          {HOME_RESEARCH_DOSSIERS.map((dossier) => (
            <article className="dossier-card" key={dossier.id}>
              <div className="dossier-head">
                <span>{dossier.label}</span>
                <h3>{dossier.title}</h3>
              </div>
              <p>{dossier.summary}</p>
              <ul className="dossier-points">
                {dossier.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <div className="dossier-tags">
                {dossier.tags.map((tag) => <span key={`${dossier.id}-${tag}`}>{tag}</span>)}
              </div>
              <a className="source-chip" href={dossier.sourceHref} target="_blank" rel="noreferrer">فتح المصدر: {dossier.sourceLabel}</a>
            </article>
          ))}
        </div>
      </section>
      <section className="heritage band" aria-labelledby="heritage-title">
        <div className="section-heading">
          <p className="kicker">التراث العالمي</p>
          <h2 id="heritage-title">مواقع فلسطينية على قائمة اليونسكو</h2>
          <p>إضافة هذا القسم تمنح القارئ مدخلا واضحا إلى المواقع الأثرية والدينية والزراعية المدرجة عالميا.</p>
        </div>
        <div className="heritage-grid">
          {HOME_HERITAGE_SITES.map(([site, year, text]) => (
            <article className="heritage-card" key={site}>
              <span>{year}</span>
              <h3>{site}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ErasPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const filters = [
    ["all", "كل العصور"],
    ["ancient", "القديم"],
    ["classical", "الكلاسيكي"],
    ["islamic", "الإسلامي والوسيط"],
    ["modern", "الحديث والمعاصر"]
  ];
  const queryText = normalize(query);
  const filteredEras = HOME_ERAS.filter((era) => {
    const categoryMatch = activeFilter === "all" || era.category === activeFilter;
    const haystack = normalize([era.period, era.type, era.title, era.summary, ...era.points.flat(), ...era.tags].join(" "));
    return categoryMatch && haystack.includes(queryText);
  });

  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">الخط الزمني</p>
          <h1 id="eras-title">العصور والتحولات الكبرى</h1>
          <p>يعرض هذا الخط تحولات فلسطين من الاستقرار الزراعي المبكر والمدن الكنعانية إلى العصور الكلاسيكية والإسلامية والحديثة، مع شرح ديني وجغرافي وسياسي لكل مرحلة.</p>
        </div>
        <form className="history-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="era-search">بحث في العصور</label>
          <input id="era-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن عصر أو مدينة أو مفهوم..." />
        </form>
      </section>
      <section className="eras band" aria-labelledby="eras-title">
        <div className="filters" role="toolbar" aria-label="تصفية العصور">
          {filters.map(([key, label]) => (
            <button key={key} className={`filter-btn ${activeFilter === key ? "is-active" : ""}`} type="button" onClick={() => setActiveFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="timeline" aria-live="polite">
          {filteredEras.length ? filteredEras.map((era) => (
            <article className="era-card" key={`${era.period}-${era.title}`}>
              <div>
                <div className="era-time">{era.period}</div>
                <span className="era-type">{era.type}</span>
              </div>
              <div>
                <h3>{era.title}</h3>
                <p>{era.summary}</p>
                <div className="era-points">
                  {era.points.map(([label, text]) => (
                    <div className="era-point" key={`${era.title}-${label}`}>
                      <strong>{label}</strong>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="tags">
                  {era.tags.map((tag) => <span className="tag" key={`${era.title}-${tag}`}>{tag}</span>)}
                </div>
              </div>
            </article>
          )) : <div className="empty-state">لا توجد نتائج مطابقة للبحث الحالي.</div>}
        </div>
      </section>
    </main>
  );
}

function ThemesPage() {
  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">محاور الفهم</p>
          <h1>كيف نقرأ تاريخ فلسطين؟</h1>
          <p>لا يكتمل فهم فلسطين من زاوية واحدة؛ لذلك تقسم المنصة الشرح إلى محاور تساعد على الربط بين المكان والناس والسلطة والذاكرة.</p>
        </div>
      </section>
      <section className="themes band" aria-labelledby="themes-title">
        <div className="theme-grid">
          {HOME_THEMES.map((theme) => (
            <article className="theme-card" key={theme.title}>
              <span className="theme-icon" aria-hidden="true">{theme.icon}</span>
              <h3>{theme.title}</h3>
              <p>{theme.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="glossary band" aria-labelledby="glossary-title">
        <div className="section-heading">
          <p className="kicker">مصطلحات</p>
          <h2 id="glossary-title">مفاتيح لغوية وتاريخية</h2>
          <p>مجموعة مصطلحات تتكرر عند قراءة تاريخ فلسطين، وتساعد على فهم اختلاف الحدود والتسميات والسياقات السياسية عبر الزمن.</p>
        </div>
        <div className="glossary-grid">
          {HOME_GLOSSARY.map(([term, definition]) => (
            <article className="glossary-card" key={term}>
              <h3>{term}</h3>
              <p>{definition}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function GalleryPage() {
  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">صور حقيقية</p>
          <h1>مشاهد من مصادر مفتوحة</h1>
          <p>هذا المعرض يعتمد على صور حقيقية من Wikimedia Commons حتى تبقى الصورة مرتبطة بالمكان أو الموضوع التاريخي الذي تعرضه.</p>
        </div>
      </section>
      <section className="gallery band" aria-labelledby="gallery-title">
        <div className="gallery-grid">
          {HOME_GALLERY.map((image) => (
            <CommonsFigure key={image.caption} image={image} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SourcesPage() {
  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">مراجع ومتابعة</p>
          <h1>مصادر للقراءة والتوثيق</h1>
          <p>روابط عامة تساعد في متابعة التاريخ، القانون الدولي، التراث، والأوضاع الإنسانية، مع الاعتماد داخل صفحات المدن على صور حقيقية من مصادر مفتوحة عندما تتوفر.</p>
        </div>
      </section>
      <section className="sources band" aria-labelledby="sources-title">
        <div className="source-list">
          {HOME_SOURCES.map((source) => (
            <a href={source.href} target="_blank" rel="noreferrer" key={source.href}>{source.label}</a>
          ))}
        </div>
      </section>
    </main>
  );
}

function MapPage() {
  const [mode, setMode] = useState<"cities" | "villages">("cities");
  const [selectedKey, setSelectedKey] = useState("city-east-jerusalem");
  const cityPins = CITY_MAP_POINTS.map((point) => {
    const city = cities.find((item) => item.id === point.cityId);
    return {
      kind: "city",
      id: point.cityId,
      title: city?.name || point.cityId,
      subtitle: city?.region || "مدينة فلسطينية",
      summary: `${point.note}${city?.summary ? `: ${city.summary}` : ""}`,
      href: pathFor(`city/${point.cityId}`),
      x: point.x,
      y: point.y,
      tags: city?.tags || []
    };
  });
  const villagePins = villages.map((village) => ({
    kind: "village",
    id: village.id,
    title: village.name,
    subtitle: `${village.district} · ${village.year}`,
    summary: village.summary,
    href: pathFor("villages"),
    x: village.x,
    y: village.y,
    tags: village.tags
  }));
  const activePins = mode === "cities" ? cityPins : villagePins;
  const selected = activePins.find((pin) => `${pin.kind}-${pin.id}` === selectedKey) || activePins[0];

  useEffect(() => {
    const first = mode === "cities" ? cityPins[0] : villagePins[0];
    if (first) setSelectedKey(`${first.kind}-${first.id}`);
  }, [mode]);

  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">خريطة تفاعلية</p>
          <h1>خريطة تفاعلية لفلسطين</h1>
          <p>خريطة مبسطة تساعد على ربط المدن والقرى المهجرة بالموقع الجغرافي والذاكرة التاريخية، مع إمكانية فتح الصفحات التفصيلية وحفظ العناصر المهمة.</p>
        </div>
      </section>
      <section className="atlas-map-layout band">
        <div className="atlas-map-shell">
          <div className="map-controls" role="group" aria-label="نوع النقاط">
            <button className={mode === "cities" ? "is-active" : ""} type="button" onClick={() => setMode("cities")}>مدن</button>
            <button className={mode === "villages" ? "is-active" : ""} type="button" onClick={() => setMode("villages")}>قرى مهجرة</button>
          </div>
          <div className="atlas-map-canvas" aria-label="خريطة تفاعلية مبسطة لفلسطين">
            <svg className="atlas-map-graphic" viewBox="0 0 100 100" role="img" aria-labelledby="map-title map-desc">
              <title id="map-title">خريطة مبسطة لفلسطين التاريخية</title>
              <desc id="map-desc">رسم توضيحي تفاعلي يوضح الساحل والمرتفعات والضفة الغربية وقطاع غزة وغور الأردن والبحر الميت.</desc>
              <rect className="map-sea-shape" x="0" y="0" width="34" height="100" rx="4" />
              <path className="map-neighbor-shape" d="M73 5 C86 15 94 32 94 52 C94 73 83 89 68 96 L68 5 Z" />
              <path className="map-land-shape" d="M39 7 C45 9 49 14 51 22 C54 32 56 39 59 47 C63 58 65 66 62 78 C60 87 55 92 49 91 C43 90 40 83 38 74 C35 61 34 50 35 38 C36 25 37 15 39 7 Z" />
              <path className="map-coast-line" d="M38 8 C36 22 35 36 35 50 C35 64 37 79 40 91" />
              <path className="map-westbank-shape" d="M56 34 C63 34 68 40 69 49 C70 58 67 66 60 67 C55 68 52 62 53 54 C54 46 52 39 56 34 Z" />
              <path className="map-gaza-shape" d="M36 69 C39 71 41 76 40 84 C39 88 37 91 35 90 C33 87 34 76 36 69 Z" />
              <ellipse className="map-dead-sea-shape" cx="73" cy="61" rx="2.3" ry="15" />
              <path className="map-jordan-line" d="M71 14 C72 25 71 35 72 46 C73 58 74 70 72 86" />
              <path className="map-route-line" d="M41 25 C49 32 53 42 58 52 C63 63 66 73 63 84" />
              <text className="map-svg-label sea-label" x="13" y="12">البحر المتوسط</text>
              <text className="map-svg-label coast-label" x="39" y="12">الساحل</text>
              <text className="map-svg-label highlands-label" x="45" y="43">المرتفعات</text>
              <text className="map-svg-label westbank-label" x="58" y="55">الضفة الغربية</text>
              <text className="map-svg-label gaza-label" x="27" y="83">قطاع غزة</text>
              <text className="map-svg-label jordan-label" x="76" y="30">غور الأردن</text>
              <text className="map-svg-label dead-sea-label" x="78" y="66">البحر الميت</text>
            </svg>
            {activePins.map((pin) => {
              const key = `${pin.kind}-${pin.id}`;
              return (
                <button
                  className={`map-marker ${selectedKey === key ? "is-selected" : ""} ${pin.kind === "village" ? "is-village" : "is-city"}`}
                  key={key}
                  type="button"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  onClick={() => setSelectedKey(key)}
                  title={pin.title}
                  aria-label={pin.title}
                >
                  <i aria-hidden="true" />
                  <span>{pin.title}</span>
                </button>
              );
            })}
            <div className="map-legend" aria-hidden="true">
              <span><i className="city-dot" /> مدينة</span>
              <span><i className="village-dot" /> قرية مهجرة</span>
              <small>رسم توضيحي تقريبي للتصفح وليس خريطة حدود رسمية.</small>
            </div>
          </div>
        </div>
        {selected && (
          <aside className="map-detail-panel">
            <p className="kicker">{selected.kind === "city" ? "مدينة" : "قرية مهجرة"}</p>
            <h2>{selected.title}</h2>
            <strong>{selected.subtitle}</strong>
            <p>{selected.summary}</p>
            <div className="tags">{selected.tags.map((tag) => <span className="tag" key={`${selected.id}-${tag}`}>{tag}</span>)}</div>
            <div className="panel-actions">
              <a className="primary-link" href={selected.href}>فتح التفاصيل</a>
              <FavoriteButton item={{ id: selected.id, type: selected.kind, title: selected.title, subtitle: selected.subtitle, href: selected.href }} />
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}

function VisualTimelinePage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = historyEvents[selectedIndex] || historyEvents[0];

  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">خط زمني بصري</p>
          <h1>الأحداث كمحطات قابلة للاستكشاف</h1>
          <p>هذه الصفحة تعرض الموسوعة التاريخية بطريقة أخف: اختر محطة من الشريط، ثم اقرأ التفاصيل وافتح المصدر أو احفظ الحدث للمراجعة.</p>
        </div>
      </section>
      <section className="visual-timeline-layout band">
        <div className="visual-timeline-strip" role="list" aria-label="محطات تاريخية">
          {historyEvents.map((event, index) => (
            <button
              className={`timeline-stop ${selectedIndex === index ? "is-active" : ""}`}
              type="button"
              key={`${event.period}-${event.title}`}
              onClick={() => setSelectedIndex(index)}
            >
              <span>{event.period}</span>
              <strong>{event.title}</strong>
            </button>
          ))}
        </div>
        <article className="timeline-event-panel">
          <CommonsImage queries={selected.imageQueries} alt={`صورة حقيقية مرتبطة بحدث ${selected.title}`} placeholder="جاري تحميل صورة حقيقية للحدث..." />
          <div>
            <p className="kicker">{(HISTORY_GROUPS as any)[selected.category]}</p>
            <h2>{selected.title}</h2>
            <strong>{selected.period}</strong>
            <p>{selected.summary}</p>
            <div className="history-detail-list">{selected.details.map((detail) => <p key={detail}>{detail}</p>)}</div>
            <div className="panel-actions">
              <a className="primary-link" href={pathFor("history")}>فتح الموسوعة</a>
              <a className="source-chip" href={selected.source} target="_blank" rel="noreferrer">فتح المصدر</a>
              <FavoriteButton item={{ id: `${selected.period}-${selected.title}`, type: "history", title: selected.title, subtitle: selected.period, href: pathFor("history") }} />
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

function AdvancedSearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const queryText = normalize(query);
  const results = useMemo(() => {
    const allResults = [
      ...cities.map((city) => ({
        id: city.id,
        type: "city",
        typeLabel: "مدينة",
        title: city.name,
        subtitle: city.region,
        body: city.summary,
        href: pathFor(`city/${city.id}`),
        tags: city.tags
      })),
      ...historyEvents.map((event) => ({
        id: `${event.period}-${event.title}`,
        type: "history",
        typeLabel: "حدث",
        title: event.title,
        subtitle: event.period,
        body: event.summary,
        href: pathFor("history"),
        tags: event.tags
      })),
      ...HOME_ERAS.map((era) => ({
        id: `${era.period}-${era.title}`,
        type: "era",
        typeLabel: "عصر",
        title: era.title,
        subtitle: era.period,
        body: era.summary,
        href: pathFor("eras"),
        tags: era.tags
      })),
      ...HOME_RESEARCH_DOSSIERS.map((dossier) => ({
        id: dossier.id,
        type: "dossier",
        typeLabel: "ملف",
        title: dossier.title,
        subtitle: dossier.label,
        body: dossier.summary,
        href: pathFor("dossiers"),
        tags: dossier.tags
      })),
      ...villages.map((village) => ({
        id: village.id,
        type: "village",
        typeLabel: "قرية مهجرة",
        title: village.name,
        subtitle: `${village.district} · ${village.year}`,
        body: village.summary,
        href: pathFor("villages"),
        tags: village.tags
      })),
      ...figures.map((figure) => ({
        id: figure.id,
        type: "figure",
        typeLabel: "شخصية",
        title: figure.name,
        subtitle: `${figure.field} · ${figure.years}`,
        body: figure.summary,
        href: pathFor("figures"),
        tags: figure.tags
      })),
      ...HOME_GLOSSARY.map(([term, definition]) => ({
        id: term,
        type: "glossary",
        typeLabel: "مصطلح",
        title: term,
        subtitle: "محاور ومصطلحات",
        body: definition,
        href: pathFor("themes"),
        tags: ["مصطلحات"]
      }))
    ];
    return allResults
      .filter((result) => type === "all" || result.type === type)
      .filter((result) => !queryText || normalize([result.title, result.subtitle, result.body, ...result.tags].join(" ")).includes(queryText))
      .slice(0, 80);
  }, [queryText, type]);

  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">بحث متقدم</p>
          <h1>ابحث في كل محتوى المنصة</h1>
          <p>ابحث مرة واحدة في المدن والأحداث والعصور والملفات والقرى المهجرة والشخصيات والمصطلحات بدل التنقل بين الصفحات.</p>
        </div>
      </section>
      <section className="advanced-search-layout band">
        <form className="advanced-search-controls" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="advanced-search">كلمة البحث</label>
          <input id="advanced-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: القدس، النكبة، الجليل، غزة..." />
          <label htmlFor="advanced-filter">نوع النتائج</label>
          <select id="advanced-filter" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">كل الأنواع</option>
            <option value="city">مدن</option>
            <option value="history">أحداث</option>
            <option value="era">عصور</option>
            <option value="dossier">ملفات</option>
            <option value="village">قرى مهجرة</option>
            <option value="figure">شخصيات</option>
            <option value="glossary">مصطلحات</option>
          </select>
        </form>
        <div className="advanced-result-grid">
          {results.length ? results.map((result) => (
            <article className="advanced-result-card" key={`${result.type}-${result.id}`}>
              <span>{result.typeLabel}</span>
              <h3>{result.title}</h3>
              <strong>{result.subtitle}</strong>
              <p>{result.body}</p>
              <div className="tags">{result.tags.slice(0, 4).map((tag) => <span className="tag" key={`${result.id}-${tag}`}>{tag}</span>)}</div>
              <div className="panel-actions">
                <a href={result.href}>فتح النتيجة</a>
                <FavoriteButton item={{ id: result.id, type: result.type, title: result.title, subtitle: result.subtitle, href: result.href }} />
              </div>
            </article>
          )) : <div className="empty-state">لا توجد نتائج مطابقة. جرّب كلمة أوسع أو غيّر نوع النتائج.</div>}
        </div>
      </section>
    </main>
  );
}

function VillagesPage() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("all");
  const districts = ["all", ...Array.from(new Set(villages.map((village) => village.district)))];
  const queryText = normalize(query);
  const filtered = villages.filter((village) => {
    const districtMatch = district === "all" || village.district === district;
    const textMatch = normalize([village.name, village.district, village.location, village.summary, village.before, village.after, village.today, ...village.tags].join(" ")).includes(queryText);
    return districtMatch && textMatch;
  });

  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">ذاكرة القرى</p>
          <h1>القرى الفلسطينية المهجرة</h1>
          <p>صفحة مستقلة للقرى المهجرة، تعرض الموقع والذاكرة قبل التهجير وبعده، مع صور حقيقية من مصادر مفتوحة وروابط للمتابعة.</p>
        </div>
      </section>
      <section className="villages band">
        <form className="advanced-search-controls village-controls" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="village-search">بحث في القرى</label>
          <input id="village-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="اكتب اسم قرية أو قضاء..." />
          <label htmlFor="district-filter">القضاء</label>
          <select id="district-filter" value={district} onChange={(event) => setDistrict(event.target.value)}>
            {districts.map((item) => <option key={item} value={item}>{item === "all" ? "كل الأقضية" : item}</option>)}
          </select>
        </form>
        <div className="village-grid">
          {filtered.map((village) => <VillageCard village={village} key={village.id} />)}
        </div>
      </section>
    </main>
  );
}

function VillageCard({ village }: { village: any }) {
  return (
    <article className="village-card">
      <CommonsFigure image={{ queries: village.imageQueries, alt: `صورة حقيقية مرتبطة بقرية ${village.name}`, caption: `مشهد حقيقي من ${village.name} أو محيطها التاريخي.` }} />
      <div className="village-card-body">
        <span>{village.district} · {village.year}</span>
        <h3>{village.name}</h3>
        <strong>{village.location}</strong>
        <p>{village.summary}</p>
        <div className="before-after-notes">
          <section><h4>قبل التهجير</h4><p>{village.before}</p></section>
          <section><h4>بعد التغيير</h4><p>{village.after}</p></section>
          <section><h4>اليوم</h4><p>{village.today}</p></section>
        </div>
        <div className="tags">{village.tags.map((tag: string) => <span className="tag" key={`${village.id}-${tag}`}>{tag}</span>)}</div>
        <div className="panel-actions">
          <a className="source-chip" href={village.sourceHref} target="_blank" rel="noreferrer">مصدر متابعة</a>
          <FavoriteButton item={{ id: village.id, type: "village", title: village.name, subtitle: `${village.district} · ${village.year}`, href: pathFor("villages") }} />
        </div>
      </div>
    </article>
  );
}

const FIGURE_IMAGES: Record<string, { title: string; caption: string }> = {
  "mahmoud-darwish": { title: "MahmoudDarwish.jpg", caption: "صورة حقيقية لمحمود درويش في جامعة بيت لحم عام 2006." },
  "fadi-touqan": { title: "لوحة لفدوى طوقان في نابلس.jpg", caption: "صورة حقيقية للوحة تذكارية لفدوى طوقان في نابلس." },
  "ghassan-kanafani": { title: "غسّان كنفاني.jpg", caption: "صورة أرشيفية لغسان كنفاني من Wikimedia Commons." },
  "edward-said": { title: "SaidSis.jpg", caption: "صورة أرشيفية لإدوارد سعيد مع أخته عام 1940." },
  "khalil-sakakini": { title: "Khalil Raad, Signed portrait of Khalil Sakakini, Jerusalem, 1906 (cropped).jpg", caption: "بورتريه أرشيفي لخليل السكاكيني في القدس عام 1906." },
  "abd-al-qader-husseini": { title: "Husseini Abd Al Qader1.jpg", caption: "صورة أرشيفية لعبد القادر الحسيني." },
  "hanan-ashrawi": { title: "Hanan Ashrawi in August 2013.jpg", caption: "صورة حقيقية لحنان عشراوي عام 2013." }
};

function commonsFileUrl(title: string, width = 900) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=${width}`;
}

function commonsFilePage(title: string) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title).replace(/%20/g, "_")}`;
}

function wikipediaPageImageUrl(title: string) {
  return "https://en.wikipedia.org/w/api.php?" + new URLSearchParams({
    origin: "*",
    action: "query",
    format: "json",
    prop: "pageimages",
    piprop: "thumbnail|original|name",
    pithumbsize: "1280",
    redirects: "1",
    titles: title
  });
}

async function fetchWikipediaPageImage(title: string, badTitlePattern: RegExp) {
  try {
    const response = await fetch(wikipediaPageImageUrl(title));
    if (!response.ok) return null;
    const data = await response.json();
    const page = (Object.values(data.query?.pages || {}) as any[])[0];
    const src = page?.thumbnail?.source || page?.original?.source || "";
    const fileTitle = page?.pageimage || title;
    const haystack = `${fileTitle} ${src}`;
    if (!/\.(jpe?g|png|webp)$/i.test(src.split("?")[0]) || badTitlePattern.test(haystack)) return null;
    return {
      src,
      source: `https://en.wikipedia.org/wiki/${encodeURIComponent((page?.title || title).replaceAll(" ", "_"))}`,
      title: fileTitle
    };
  } catch {
    return null;
  }
}

function VerifiedFigureImage({ figure }: { figure: any }) {
  const image = FIGURE_IMAGES[figure.id];
  if (!image) {
    return (
      <div className="figure-image-placeholder">
        <span>صورة غير مؤكدة</span>
        <p>لم أضع صورة هنا لأنني لم أجد صورة مفتوحة المصدر ومؤكدة للشخصية.</p>
      </div>
    );
  }

  return (
    <figure className="figure-image">
      <img src={commonsFileUrl(image.title)} alt={image.caption} />
      <figcaption>{image.caption} <a href={commonsFilePage(image.title)} target="_blank" rel="noreferrer">مصدر الصورة</a></figcaption>
    </figure>
  );
}

function FiguresPage() {
  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">شخصيات وأعلام</p>
          <h1>أعلام فلسطينية في الذاكرة الحديثة</h1>
          <p>مدخل مختصر إلى شخصيات فلسطينية في الأدب والفكر والسياسة والعمل الوطني، مع روابط مصادر خارجية للتوسع.</p>
        </div>
      </section>
      <section className="figures band">
        <div className="figure-grid">
          {figures.map((figure) => (
            <article className="figure-card" key={figure.id}>
              <VerifiedFigureImage figure={figure} />
              <div>
                <span>{figure.field}</span>
                <h3>{figure.name}</h3>
                <strong>{figure.years} · {figure.place}</strong>
                <p>{figure.summary}</p>
                <div className="tags">{figure.tags.map((tag) => <span className="tag" key={`${figure.id}-${tag}`}>{tag}</span>)}</div>
                <div className="panel-actions">
                  <a className="source-chip" href={figure.sourceHref} target="_blank" rel="noreferrer">مصدر متابعة</a>
                  <FavoriteButton item={{ id: figure.id, type: "figure", title: figure.name, subtitle: figure.field, href: pathFor("figures") }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ActivitiesPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [sequence, setSequence] = useState<string[]>([]);
  const score = HOME_QUIZ.filter((question, index) => answers[index] === question.answer).length;
  const sequenceComplete = sequence.length === HOME_SEQUENCE_CHALLENGE.correctOrder.length;
  const sequenceCorrect = sequenceComplete && sequence.every((label, index) => label === HOME_SEQUENCE_CHALLENGE.correctOrder[index]);

  function chooseSequence(label: string) {
    if (sequence.includes(label)) return;
    setSequence((items) => [...items, label]);
  }

  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">أنشطة خفيفة</p>
          <h1>راجع معلوماتك بطريقة تفاعلية</h1>
          <p>هذه ليست عودة للنسخة التعليمية الكاملة؛ هي أدوات مراجعة بسيطة داخل المنصة تساعد القراء الصغار والكبار على تثبيت المعلومات.</p>
        </div>
      </section>
      <section className="activity-layout band">
        <div className="lesson-card-grid">
          {HOME_LEARNING_PATHS.map((lesson) => (
            <article className="learning-path-card" key={lesson.title}>
              <div className="lesson-meta"><span>{lesson.level}</span><span>{lesson.time}</span></div>
              <h3>{lesson.title}</h3>
              <p>{lesson.goal}</p>
              <ol>{lesson.steps.map((step) => <li key={`${lesson.title}-${step}`}>{step}</li>)}</ol>
            </article>
          ))}
        </div>
        <section className="quiz-mini">
          <div className="section-heading">
            <p className="kicker">اختبار سريع</p>
            <h2>النتيجة: {score} من {HOME_QUIZ.length}</h2>
          </div>
          <div className="quiz-mini-grid">
            {HOME_QUIZ.map((question, index) => (
              <article className="quiz-card" key={question.question}>
                <span className="quiz-number">سؤال {index + 1}</span>
                <h3>{question.question}</h3>
                <div className="quiz-options">
                  {question.options.map((option) => {
                    const selected = answers[index] === option;
                    const answered = Boolean(answers[index]);
                    const correct = option === question.answer;
                    return (
                      <button
                        className={`quiz-option ${selected ? "is-selected" : ""} ${answered && correct ? "is-correct" : ""} ${selected && !correct ? "is-wrong" : ""}`}
                        type="button"
                        key={option}
                        onClick={() => setAnswers((current) => ({ ...current, [index]: option }))}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {answers[index] && <p className="quiz-hint">{question.hint}</p>}
              </article>
            ))}
          </div>
        </section>
        <section className="sequence-mini">
          <div className="section-heading">
            <p className="kicker">تحدي ترتيب</p>
            <h2>{HOME_SEQUENCE_CHALLENGE.title}</h2>
            <p>{HOME_SEQUENCE_CHALLENGE.prompt}</p>
          </div>
          <div className="sequence-board">
            <div className="sequence-picks">
              {sequence.length ? sequence.map((label, index) => <span key={`${label}-${index}`}>{index + 1}. {label}</span>) : <p>ابدأ باختيار أقدم محطة.</p>}
            </div>
            <div className="sequence-options">
              {HOME_SEQUENCE_CHALLENGE.items.map((item) => (
                <button type="button" key={item.id} onClick={() => chooseSequence(item.label)} disabled={sequence.includes(item.label)}>
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </button>
              ))}
            </div>
          </div>
          {sequenceComplete && <div className={`activity-feedback ${sequenceCorrect ? "is-success" : "is-error"}`}>{sequenceCorrect ? "ترتيب ممتاز." : "الترتيب يحتاج مراجعة. أعد المحاولة بعد قراءة الخط الزمني."}</div>}
          <button className="quiet-button" type="button" onClick={() => setSequence([])}>إعادة التحدي</button>
        </section>
      </section>
    </main>
  );
}

function FavoritesPage() {
  const favorites = useFavorites();

  return (
    <main>
      <section className="page-hero band">
        <div className="section-heading">
          <p className="kicker">مفضلتي</p>
          <h1>العناصر المحفوظة</h1>
          <p>كل ما تحفظه يبقى محليا في المتصفح حتى تعود إليه بسرعة أثناء القراءة أو المراجعة.</p>
        </div>
      </section>
      <section className="favorites band">
        {favorites.length ? (
          <div className="favorites-grid">
            {favorites.map((item) => (
              <article className="favorite-card" key={`${item.type}-${item.id}`}>
                <span>{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
                <div className="panel-actions">
                  <a href={item.href}>فتح</a>
                  <FavoriteButton item={item} />
                </div>
              </article>
            ))}
          </div>
        ) : <div className="empty-state">لم تحفظ أي عنصر بعد. جرّب زر “حفظ” في صفحات المدن أو الموسوعة أو الخريطة.</div>}
      </section>
    </main>
  );
}

function CitiesPage() {
  const [query, setQuery] = useState("");
  const filtered = cities.filter((city) =>
    normalize([city.name, city.region, city.summary, city.history, city.geography, ...city.tags].join(" ")).includes(normalize(query))
  );

  return (
    <main>
      <section className="city-index-hero band">
        <div className="section-heading">
          <p className="kicker">فهرس المدن</p>
          <h1>مدن فلسطين</h1>
          <p>فهرس لمدن الضفة والقدس، ومدن الداخل الفلسطيني، ومدن قطاع غزة، مع بطاقة مختصرة لكل مدينة وصفحة تفصيلية للقراءة والصور.</p>
        </div>
        <form className="city-search">
          <label htmlFor="city-search">بحث في المدن</label>
          <input id="city-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="اكتب اسم مدينة أو منطقة..." />
        </form>
      </section>
      <section className="city-index band">
        <div className="city-index-grid">
          {Object.entries(CITY_GROUPS).map(([key, group]: any) => {
            const groupCities = filtered.filter((city) => city.category === key);
            if (!groupCities.length) return null;
            return (
              <section className="city-index-group" key={key}>
                <div className="city-index-group-head">
                  <span>{group.shortLabel}</span>
                  <h3>{group.label}</h3>
                  <p>{group.description}</p>
                </div>
                <div className="city-card-grid">
                  {groupCities.map((city) => <CityCard city={city} key={city.id} />)}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function CityCard({ city }: { city: City }) {
  const villageCount = getVillagesForCity(city.id).length;
  return (
    <article className="city-card">
      <CommonsImage queries={city.modernImageSearch} alt={`صورة حقيقية مرتبطة بمدينة ${city.name}`} placeholder="جاري تحميل صورة حقيقية..." />
      <div>
        <span className="city-card-region">{city.region}</span>
        <h4>{city.name}</h4>
        <p>{city.summary}</p>
        {villageCount > 0 && <strong className="city-village-count">{villageCount} قرية وبلدة في النطاق</strong>}
        <a href={pathFor(`city/${city.id}`)}>فتح صفحة المدينة</a>
        <FavoriteButton item={{ id: city.id, type: "city", title: city.name, subtitle: city.region, href: pathFor(`city/${city.id}`) }} />
      </div>
    </article>
  );
}

function buildPoliticalText(city: City) {
  if (city.political) return city.political;
  if (city.category === "gaza") return `سياسيا، تقع ${city.name} ضمن قطاع غزة، حيث تتداخل قضايا الحصار والمعابر والانقسام وإعادة الإعمار مع الحياة اليومية.`;
  if (city.category === "westbank") return `سياسيا، تقع ${city.name} ضمن مجال الضفة الغربية أو القدس الشرقية المحتل منذ 1967، وتتأثر بالحواجز والاستيطان وتقسيمات أوسلو.`;
  return `سياسيا، تعد ${city.name} من مدن الداخل الفلسطيني، حيث تتداخل المواطنة والهوية والأرض والتخطيط والذاكرة التاريخية.`;
}

function CityOverviewPanel({ city }: { city: City }) {
  const items = [
    ["الموقع", city.region],
    ["لمحة تاريخية", city.summary],
    ["السياسة والهوية", buildPoliticalText(city)],
    ["ملامح بارزة", city.highlights.slice(0, 3).join("، ")]
  ];

  return (
    <section className="city-learning-panel band" aria-labelledby="city-overview-title">
      <div className="section-heading">
        <p className="kicker">ملخص المدينة</p>
        <h2 id="city-overview-title">قراءة سريعة في {city.name}</h2>
        <p>ملخص موجز يسبق الشرح التفصيلي والصور القديمة والحديثة.</p>
      </div>
      <div className="city-learning-grid">
        {items.map(([label, text]) => (
          <article key={label}>
            <span>{label}</span>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CityPage({ id }: { id?: string }) {
  const city = cities.find((item) => item.id === id) || cities[0];
  const group: any = CITY_GROUPS[city.category];
  const related = cities.filter((item) => item.category === city.category && item.id !== city.id).slice(0, 6);
  const cityVillages = getVillagesForCity(city.id);

  return (
    <main>
      <section className="city-detail-hero">
        <CommonsImage queries={city.modernImageSearch} alt={`صورة حقيقية لمدينة ${city.name}`} placeholder={`جاري تحميل صورة حقيقية لمدينة ${city.name}...`} />
        <div className="city-detail-shade" aria-hidden="true" />
        <div className="city-detail-title">
          <p className="kicker">{group.shortLabel} · {city.region}</p>
          <h1>{city.name}</h1>
          <p>{city.summary}</p>
        </div>
      </section>
      <CityOverviewPanel city={city} />
      <section className="city-detail band">
        <aside className="city-fact-panel">
          <span>{group.label}</span>
          <h2>{city.name}</h2>
          <p>{city.region}</p>
          <div className="tags">{city.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          {cityVillages.length > 0 && <p className="city-village-side-note">يضم هذا النطاق {cityVillages.length} قرية/بلدة موثقة في الصفحة.</p>}
          <FavoriteButton item={{ id: city.id, type: "city", title: city.name, subtitle: city.region, href: pathFor(`city/${city.id}`) }} />
        </aside>
        <article className="city-story">
          <h2>شرح تفصيلي</h2>
          <p>{city.summary}</p>
          <h3>التاريخ والتحولات</h3><p>{city.history}</p>
          <h3>السياسة والهوية</h3><p>{buildPoliticalText(city)}</p>
          <h3>الجغرافيا والموقع</h3><p>{city.geography}</p>
          <h3>بماذا تشتهر المدينة؟</h3><p>تشتهر {city.name} بـ {city.highlights.join("، ")}.</p>
          <h3>المدينة اليوم</h3><p>{city.today}</p>
          <h3>ملامح بارزة</h3>
          <ul className="feature-list">{city.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>
      <CityVillagesSection city={city} villages={cityVillages} />
      <CityImages city={city} />
      <section className="related-cities band">
        <div className="section-heading"><p className="kicker">مدن ذات صلة</p><h2>من نفس التصنيف</h2></div>
        <div className="related-grid">{related.map((item) => <a href={pathFor(`city/${item.id}`)} key={item.id}>{item.name}<span>{item.region}</span></a>)}</div>
      </section>
    </main>
  );
}

function CityVillagesSection({ city, villages }: { city: City; villages: CityVillage[] }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filtered = villages.filter((village) =>
    normalize([village.name, village.searchName || "", village.district, village.summary, ...village.tags].join(" ")).includes(normalize(query))
  );
  const visible = showAll || query ? filtered : filtered.slice(0, 12);

  if (!villages.length) return null;

  return (
    <section className="city-villages band" aria-labelledby="city-villages-title">
      <div className="section-heading">
        <p className="kicker">قرى وبلدات النطاق</p>
        <h2 id="city-villages-title">قرى {city.name} ومحيطها</h2>
        <p>قائمة منظمة للقرى والبلدات والمخيمات أو القرى المهجرة المرتبطة بنطاق المدينة، مع شرح مختصر وصورة حقيقية يتم تحميلها من Wikimedia Commons عند توفرها.</p>
      </div>
      <div className="city-village-toolbar">
        <label htmlFor={`village-search-${city.id}`}>بحث داخل قرى {city.name}</label>
        <input
          id={`village-search-${city.id}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="اكتب اسم قرية أو بلدة..."
        />
        <span>{filtered.length} نتيجة</span>
      </div>
      <div className="city-village-grid">
        {visible.map((village) => <CityVillageCard village={village} key={village.id} />)}
      </div>
      {!query && filtered.length > visible.length && (
        <button className="load-more-button" type="button" onClick={() => setShowAll(true)}>
          عرض كل القرى ({filtered.length})
        </button>
      )}
    </section>
  );
}

function CityVillageCard({ village }: { village: CityVillage }) {
  return (
    <article className="city-village-card">
      <CommonsImage queries={village.imageQueries} alt={`صورة حقيقية مرتبطة بقرية ${village.name}`} placeholder={`جاري تحميل صورة من ${village.name}...`} />
      <div>
        <span>{village.relation}</span>
        <h3>{village.name}</h3>
        <p>{village.summary}</p>
        <div className="tags">{village.tags.map((tag) => <span className="tag" key={`${village.id}-${tag}`}>{tag}</span>)}</div>
        <a className="source-chip" href={village.sourceHref} target="_blank" rel="noreferrer">مصدر القوائم</a>
      </div>
    </article>
  );
}

function commonsSearchUrl(query: string) {
  return "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
    origin: "*", action: "query", format: "json", generator: "search", gsrnamespace: "6",
    gsrlimit: "7", gsrsearch: query, prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "1280"
  });
}

async function fetchCommonsImage(queries: string[]) {
  const exactPrefix = "commons-file:";
  const wikipediaPrefix = "wikipedia-page:";
  const badTitlePattern = /\b(map|maps|locator|location|flag|seal|coat|logo|diagram|chart|svg|icon|symbol|emblem|route|westbank|claimed|district|blank|osm|openstreetmap|pdf|djvu|gazetteer|index|access|restriction|restrictions|page1|book|atlas|survey|dictionary|bible|bregvadze|reim|takuma|moshav|kibbutz|nova|memorial|gazaenv|gaza envelope|car wall|route 232|sderot|beeri|kfar aza|nir oz|netiv haasara|settlement|outpost|tuba city|arizona|coconino|moenave|hopi|navajo|reservation|coal mine canyon|dinosaur tracks)\b/i;
  const strongPhotoPattern = /\b(street|old city|old|view|panorama|skyline|market|mosque|church|port|harbou?r|beach|camp|tower|hotel|city|landscape|aerial|quarter|center|centre|building|directorate|ruins|tell|monastery|khan|sea|coast|square|neighbou?rhood|alley)\b/i;
  for (const query of queries) {
    if (query.startsWith(exactPrefix)) {
      const title = query.slice(exactPrefix.length).trim();
      if (title) return { src: commonsFileUrl(title, 1280), source: commonsFilePage(title), title };
    }
    if (query.startsWith(wikipediaPrefix)) {
      const title = query.slice(wikipediaPrefix.length).trim();
      const image = title ? await fetchWikipediaPageImage(title, badTitlePattern) : null;
      if (image) return image;
      continue;
    }
    try {
      const response = await fetch(commonsSearchUrl(query));
      if (!response.ok) continue;
      const data = await response.json();
      const pages = Object.values(data.query?.pages || {}) as any[];
      const matches = pages
        .map((page) => ({ title: page.title || "", info: page.imageinfo?.[0] }))
        .filter(({ title, info }) => {
          const url = (info?.thumburl || info?.url || "").split("?")[0];
          const descriptionUrl = info?.descriptionurl || "";
          const haystack = `${title} ${url} ${descriptionUrl}`;
          return /\.(jpe?g|png|webp)$/i.test(url) && !badTitlePattern.test(haystack);
        })
        .sort((a, b) => Number(strongPhotoPattern.test(b.title)) - Number(strongPhotoPattern.test(a.title)));
      const match = matches[0];
      if (match) return { src: match.info.thumburl || match.info.url, source: match.info.descriptionurl, title: match.title };
    } catch {
      continue;
    }
  }
  return null;
}

function CommonsImage({ queries, alt, className, placeholder }: { queries: string[]; alt: string; className?: string; placeholder?: string }) {
  const [image, setImage] = useState<any>(null);
  useEffect(() => {
    let live = true;
    setImage(null);
    fetchCommonsImage(queries).then((result) => {
      if (live) setImage(result);
    });
    return () => { live = false; };
  }, [queries.join("|")]);

  if (image) return <img className={className} src={image.src} alt={alt} />;
  return <div className={`${className ? `${className} ` : ""}media-placeholder real-image-placeholder`}>{placeholder || "جاري تحميل صورة حقيقية..."}</div>;
}

function CommonsFigure({ image }: { image: { queries: string[]; alt: string; caption: string; src?: string; source?: string } }) {
  const [loadedImage, setLoadedImage] = useState<any>(null);
  useEffect(() => {
    if (image.src) {
      setLoadedImage({ src: image.src, source: image.source });
      return;
    }
    let live = true;
    setLoadedImage(null);
    fetchCommonsImage(image.queries).then((result) => {
      if (live) setLoadedImage(result);
    });
    return () => { live = false; };
  }, [image.src, image.queries.join("|")]);

  return (
    <figure>
      {loadedImage ? <img src={loadedImage.src} alt={image.alt} /> : <div className="media-placeholder">جاري تحميل صورة حقيقية...</div>}
      <figcaption>{image.caption} {loadedImage && <a href={loadedImage.source} target="_blank" rel="noreferrer">مصدر الصورة</a>}</figcaption>
    </figure>
  );
}

function CityImages({ city }: { city: City }) {
  const [oldImage, setOldImage] = useState<any>(null);
  const [modernImage, setModernImage] = useState<any>(null);
  useEffect(() => {
    setOldImage(null);
    setModernImage(null);
    fetchCommonsImage(city.oldImageSearch).then(setOldImage);
    fetchCommonsImage(city.modernImageSearch).then(setModernImage);
  }, [city.id]);

  return (
    <section className="city-media band">
      <div className="section-heading"><p className="kicker">أرشيف بصري</p><h2>صور قديمة وصور حديثة</h2></div>
      <div className="city-media-grid">
        <MediaFigure image={oldImage} label="صورة قديمة" fallback="جاري تحميل صورة قديمة..." />
        <MediaFigure image={modernImage} label="صورة حديثة" fallback="جاري تحميل صورة حديثة..." />
      </div>
      {oldImage && modernImage && <BeforeAfterCompare oldImage={oldImage} modernImage={modernImage} cityName={city.name} />}
    </section>
  );
}

function MediaFigure({ image, label, fallback }: { image: any; label: string; fallback: string }) {
  return (
    <figure>
      {image ? <img src={image.src} alt={label} /> : <div className="media-placeholder">{fallback}</div>}
      <figcaption>{label}. {image && <a href={image.source} target="_blank" rel="noreferrer">فتح مصدر الصورة</a>}</figcaption>
    </figure>
  );
}

function BeforeAfterCompare({ oldImage, modernImage, cityName }: { oldImage: any; modernImage: any; cityName: string }) {
  const [position, setPosition] = useState(50);

  return (
    <div className="before-after">
      <div className="section-heading">
        <p className="kicker">قبل / بعد</p>
        <h3>قارن بصريا بين صورة قديمة وحديثة من {cityName}</h3>
      </div>
      <div className="before-after-frame">
        <img src={oldImage.src} alt={`صورة قديمة من ${cityName}`} />
        <div className="before-after-modern" style={{ clipPath: `inset(0 0 0 ${100 - position}%)` }}>
          <img src={modernImage.src} alt={`صورة حديثة من ${cityName}`} />
        </div>
        <span className="before-after-label old">قديم</span>
        <span className="before-after-label modern">حديث</span>
      </div>
      <input
        className="before-after-slider"
        type="range"
        min="10"
        max="90"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="تحريك المقارنة بين الصورة القديمة والحديثة"
      />
      <div className="panel-actions">
        <a href={oldImage.source} target="_blank" rel="noreferrer">مصدر الصورة القديمة</a>
        <a href={modernImage.source} target="_blank" rel="noreferrer">مصدر الصورة الحديثة</a>
      </div>
    </div>
  );
}

function HistoryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = historyEvents.filter((event) => {
    const categoryMatch = filter === "all" || event.category === filter;
    const queryMatch = normalize([event.period, event.title, event.summary, ...event.details, ...event.tags].join(" ")).includes(normalize(query));
    return categoryMatch && queryMatch;
  });

  return (
    <main>
      <section className="history-hero band">
        <div className="section-heading">
          <p className="kicker">من القدم حتى 2026</p>
          <h1>الموسوعة التاريخية لفلسطين</h1>
          <p>خط موسوعي واسع يجمع العصور القديمة، الاحتلالات، الحروب، المدن، النكبة، 1967، الانتفاضات، أوسلو، غزة، وطوفان الأقصى وما بعده.</p>
        </div>
        <form className="history-search"><label htmlFor="history-search">بحث في الأحداث</label><input id="history-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن حدث..." /></form>
      </section>
      <section className="history-overview band">
        <div className="history-stats">
          <article><strong>{historyEvents.length}</strong><span>محطة تاريخية</span></article>
          <article><strong>{cities.length}</strong><span>مدينة</span></article>
          <article><strong>2026</strong><span>تغطية حتى</span></article>
        </div>
      </section>
      <section className="history-archive band">
        <div className="filters">
          <button className={`filter-btn ${filter === "all" ? "is-active" : ""}`} onClick={() => setFilter("all")}>كل الموسوعة</button>
          {Object.entries(HISTORY_GROUPS).map(([key, label]: any) => <button key={key} className={`filter-btn ${filter === key ? "is-active" : ""}`} onClick={() => setFilter(key)}>{label}</button>)}
        </div>
        <div className="history-grid">{filtered.map((event) => <HistoryCard event={event} key={`${event.period}-${event.title}`} />)}</div>
      </section>
    </main>
  );
}

function HistoryCard({ event }: { event: HistoryEvent }) {
  const [image, setImage] = useState<any>(null);
  useEffect(() => { setImage(null); fetchCommonsImage(event.imageQueries).then(setImage); }, [event.title]);
  return (
    <article className="history-card">
      <div className="history-card-image">
        {image ? <><img src={image.src} alt="صورة حقيقية مرتبطة بالحدث" /><a href={image.source} target="_blank" rel="noreferrer">مصدر الصورة</a></> : <div className="media-placeholder">جاري تحميل صورة حقيقية...</div>}
      </div>
      <div className="history-card-body">
        <div className="history-card-meta"><span>{event.period}</span><span>{(HISTORY_GROUPS as any)[event.category]}</span></div>
        <h3>{event.title}</h3>
        <p>{event.summary}</p>
        <div className="history-detail-list">{event.details.map((detail) => <p key={detail}>{detail}</p>)}</div>
        <div className="tags">{event.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
        <div className="panel-actions">
          <a className="history-source" href={event.source} target="_blank" rel="noreferrer">فتح المرجع</a>
          <FavoriteButton item={{ id: `${event.period}-${event.title}`, type: "history", title: event.title, subtitle: event.period, href: pathFor("history") }} />
        </div>
      </div>
    </article>
  );
}

function App() {
  const route = useHashRoute();
  const page = route[0] || "home";
  const content = useMemo(() => {
    if (page === "cities") return <CitiesPage />;
    if (page === "city") return <CityPage id={route[1]} />;
    if (page === "eras") return <ErasPage />;
    if (page === "history") return <HistoryPage />;
    if (page === "dossiers") return <DossiersPage />;
    if (page === "map") return <MapPage />;
    if (page === "search") return <AdvancedSearchPage />;
    if (page === "timeline") return <VisualTimelinePage />;
    if (page === "villages") return <VillagesPage />;
    if (page === "figures") return <FiguresPage />;
    if (page === "activities") return <ActivitiesPage />;
    if (page === "favorites") return <FavoritesPage />;
    if (page === "themes") return <ThemesPage />;
    if (page === "gallery") return <GalleryPage />;
    if (page === "sources") return <SourcesPage />;
    return <HomePage />;
  }, [page, route[1]]);

  return (
    <>
      <Header />
      {content}
      <footer className="footer"><p>أطلس فلسطين التاريخي · منصة عربية للتوثيق والمعرفة</p><a href={pathFor()}>الصفحة الرئيسية</a></footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
