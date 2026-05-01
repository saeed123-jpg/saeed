import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { CITY_GROUPS, PALESTINE_CITIES } from "./data/cities";
import { HISTORY_GROUPS, PALESTINE_HISTORY_EVENTS } from "./data/history";
import { HOME_ERAS, HOME_GALLERY, HOME_GLOSSARY, HOME_MILESTONES, HOME_SOURCES, HOME_THEMES } from "./data/home";
import type { City, HistoryEvent } from "./types";
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

function Header() {
  function openHomeSection(event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) {
    event.preventDefault();
    window.location.hash = "#/";
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  return (
    <header className="topbar" aria-label="رأس الصفحة">
      <a className="brand" href={pathFor()} aria-label="أطلس فلسطين التاريخي">
        <span className="brand-mark" aria-hidden="true" />
        <span>أطلس فلسطين التاريخي</span>
      </a>
      <nav className="nav-links" aria-label="التنقل الرئيسي">
        <a href={pathFor()} onClick={(event) => openHomeSection(event, "eras")}>العصور</a>
        <a href={pathFor("history")}>الموسوعة</a>
        <CityMenu />
        <a href={pathFor()} onClick={(event) => openHomeSection(event, "themes")}>المحاور</a>
        <a href={pathFor()} onClick={(event) => openHomeSection(event, "gallery")}>الصور</a>
        <a href={pathFor()} onClick={(event) => openHomeSection(event, "sources")}>المراجع</a>
      </nav>
      <LanguageSwitcher />
    </header>
  );
}

function CityMenu() {
  const [open, setOpen] = useState(false);
  const grouped = Object.entries(CITY_GROUPS).map(([key, group]: any) => ({
    key,
    ...group,
    cities: cities.filter((city) => city.category === key)
  }));

  return (
    <div className={`nav-dropdown ${open ? "is-open" : ""}`} onMouseLeave={() => setOpen(false)}>
      <button className="nav-menu-button" type="button" onClick={() => setOpen((value) => !value)}>
        مدن
      </button>
      <div className="city-menu-panel">
        <a className="city-menu-all" href={pathFor("cities")}>عرض كل المدن</a>
        <div className="city-menu-groups">
          {grouped.map((group) => (
            <section className="city-menu-group" key={group.key}>
              <h3>{group.label}</h3>
              <div className="city-menu-links">
                {group.cities.map((city) => (
                  <a href={pathFor(`city/${city.id}`)} key={city.id}>{city.name}</a>
                ))}
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
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <img className="hero-image" src="/assets/images/hero-palestine-history.jpg" alt="مشهد توضيحي لمناظر فلسطين التاريخية" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="kicker">منصة معرفية عن فلسطين</p>
          <h1 id="hero-title">فلسطين عبر العصور</h1>
          <p className="hero-copy">رحلة منظمة في تاريخ فلسطين الديني والجغرافي والسياسي، من بدايات الاستقرار الأولى إلى النكبة والاحتلال والتحولات المعاصرة حتى عام 2026.</p>
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
          <h2 id="overview-title">فلسطين كزمن ومدينة وقضية</h2>
          <p>تجمع المنصة بين السرد التاريخي، فهرس المدن، المحاور الدينية والجغرافية والسياسية، والصور التوضيحية والحقيقية لقراءة فلسطين بوصفها أرضا ومجتمعا وذاكرة.</p>
        </div>
        <div className="stat-grid">
          <article className="stat-card"><strong>{historyEvents.length}</strong><span>محطة في الموسوعة التاريخية</span></article>
          <article className="stat-card"><strong>{cities.length}</strong><span>مدينة وبلدة فلسطينية</span></article>
          <article className="stat-card"><strong>{HOME_THEMES.length}</strong><span>محاور تفسيرية رئيسية</span></article>
          <article className="stat-card"><strong>2026</strong><span>تغطية زمنية حتى هذا العام</span></article>
        </div>
      </section>

      <section id="eras" className="eras band" aria-labelledby="eras-title">
        <div className="section-heading">
          <p className="kicker">الخط الزمني</p>
          <h2 id="eras-title">العصور والتحولات الكبرى</h2>
          <p>يعرض هذا الخط تحولات فلسطين من الاستقرار الزراعي المبكر والمدن الكنعانية إلى العصور الكلاسيكية والإسلامية والحديثة، مع شرح ديني وجغرافي وسياسي لكل مرحلة.</p>
        </div>
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

      <section id="themes" className="themes band" aria-labelledby="themes-title">
        <div className="section-heading">
          <p className="kicker">محاور الفهم</p>
          <h2 id="themes-title">كيف نقرأ تاريخ فلسطين؟</h2>
          <p>لا يكتمل فهم فلسطين من زاوية واحدة؛ لذلك تقسم المنصة الشرح إلى محاور تساعدك على الربط بين المكان والناس والسلطة والذاكرة.</p>
        </div>
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

      <section className="turning-points band" aria-labelledby="milestones-title">
        <div className="section-heading">
          <p className="kicker">محطات فاصلة</p>
          <h2 id="milestones-title">أحداث غيّرت المسار</h2>
          <p>اختيارات موجزة لمحطات صنعت انعطافات عميقة في العمران والهوية والسياسة، وتمهّد للتوسع داخل الموسوعة التاريخية.</p>
        </div>
        <div className="milestone-grid">
          {HOME_MILESTONES.map(([date, text]) => (
            <article className="milestone" key={date}>
              <strong>{date}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="gallery" className="gallery band" aria-labelledby="gallery-title">
        <div className="section-heading">
          <p className="kicker">صور توضيحية</p>
          <h2 id="gallery-title">مشاهد تساعد على تخيل المكان</h2>
          <p>صور توضيحية صممت لتقريب طبقات التاريخ والجغرافيا والعمارة من القارئ، إلى جانب الصور الحقيقية الموجودة داخل صفحات المدن والموسوعة.</p>
        </div>
        <div className="gallery-grid">
          {HOME_GALLERY.map((image) => (
            <figure key={image.src}>
              <img src={image.src} alt={image.alt} />
              <figcaption>{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="glossary band" aria-labelledby="glossary-title">
        <div className="section-heading">
          <p className="kicker">مصطلحات أساسية</p>
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

      <section id="sources" className="sources band" aria-labelledby="sources-title">
        <div className="section-heading">
          <p className="kicker">مراجع ومتابعة</p>
          <h2 id="sources-title">مصادر للقراءة والتوثيق</h2>
          <p>روابط عامة تساعد في متابعة التاريخ، القانون الدولي، التراث، والأوضاع الإنسانية، مع الاعتماد داخل صفحات المدن على صور حقيقية من مصادر مفتوحة عندما تتوفر.</p>
        </div>
        <div className="source-list">
          {HOME_SOURCES.map((source) => (
            <a href={source.href} target="_blank" rel="noreferrer" key={source.href}>{source.label}</a>
          ))}
        </div>
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
          <p>فهرس تفاعلي لمدن الضفة والقدس، ومدن الداخل الفلسطيني، ومدن قطاع غزة.</p>
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
  return (
    <article className="city-card">
      <img src={`/${city.aiImage}`} alt={`مشهد بصري مرتبط بمدينة ${city.name}`} />
      <div>
        <span className="city-card-region">{city.region}</span>
        <h4>{city.name}</h4>
        <p>{city.summary}</p>
        <a href={pathFor(`city/${city.id}`)}>فتح صفحة المدينة</a>
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

function CityPage({ id }: { id?: string }) {
  const city = cities.find((item) => item.id === id) || cities[0];
  const group: any = CITY_GROUPS[city.category];
  const related = cities.filter((item) => item.category === city.category && item.id !== city.id).slice(0, 6);

  return (
    <main>
      <section className="city-detail-hero">
        <img src={`/${city.aiImage}`} alt={`مشهد بصري لمدينة ${city.name}`} />
        <div className="city-detail-shade" aria-hidden="true" />
        <div className="city-detail-title">
          <p className="kicker">{group.shortLabel} · {city.region}</p>
          <h1>{city.name}</h1>
          <p>{city.summary}</p>
        </div>
      </section>
      <section className="city-detail band">
        <aside className="city-fact-panel">
          <span>{group.label}</span>
          <h2>{city.name}</h2>
          <p>{city.region}</p>
          <div className="tags">{city.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
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
      <CityImages city={city} />
      <section className="related-cities band">
        <div className="section-heading"><p className="kicker">مدن ذات صلة</p><h2>من نفس التصنيف</h2></div>
        <div className="related-grid">{related.map((item) => <a href={pathFor(`city/${item.id}`)} key={item.id}>{item.name}<span>{item.region}</span></a>)}</div>
      </section>
    </main>
  );
}

function commonsSearchUrl(query: string) {
  return "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
    origin: "*", action: "query", format: "json", generator: "search", gsrnamespace: "6",
    gsrlimit: "7", gsrsearch: query, prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "1280"
  });
}

async function fetchCommonsImage(queries: string[]) {
  for (const query of queries) {
    try {
      const response = await fetch(commonsSearchUrl(query));
      if (!response.ok) continue;
      const data = await response.json();
      const pages = Object.values(data.query?.pages || {}) as any[];
      const match = pages.map((page) => page.imageinfo?.[0]).find((info) => /\.(jpe?g|png|webp)$/i.test((info?.thumburl || info?.url || "").split("?")[0]));
      if (match) return { src: match.thumburl || match.url, source: match.descriptionurl };
    } catch {
      continue;
    }
  }
  return null;
}

function CityImages({ city }: { city: City }) {
  const [oldImage, setOldImage] = useState<any>(null);
  const [modernImage, setModernImage] = useState<any>(null);
  useEffect(() => {
    setOldImage(null); setModernImage(null);
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
          <p>خط معرفي واسع يجمع العصور القديمة، الاحتلالات، الحروب، المدن، النكبة، 1967، الانتفاضات، أوسلو، غزة، وطوفان الأقصى وما بعده.</p>
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
        <a className="history-source" href={event.source} target="_blank" rel="noreferrer">فتح المرجع</a>
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
    if (page === "history") return <HistoryPage />;
    return <HomePage />;
  }, [page, route[1]]);

  return (
    <>
      <Header />
      {content}
      <footer className="footer"><p>أطلس فلسطين التاريخي · منصة معرفية عربية</p><a href={pathFor()}>الصفحة الرئيسية</a></footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
