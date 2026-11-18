/* МИСТРИ — варианты навигации: где я и как перейти в другой раздел.
   Единая система из макета: раздел → подраздел (вкладки страницы, как «Список пациентов / Возможные дубли»)
   → карточка (крошки + стрелка назад, как «Дашборд руководителя / Услуги»).
   Визуал шапки из макета не трогаем: логотип, пользователь, круглые кнопки, линия снизу. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ic = (name, extra = "") => `<span class="ic i-${name} ${extra}" aria-hidden="true"></span>`;
  const mobile = () => matchMedia("(max-width: 767px)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* ---------- структура разделов (по страницам макета) ---------- */
  const SEC = {
    overview: { t: "Обзор", i: "overview", d: "Вторник, 9 августа 2026 • Кабинет 304 • Смена: 08:00 - 16:00" },
    clinic: { t: "Клиника", i: "clinic", d: "ООО «БЗ-МЕД» — многопрофильная клиника", subs: [["structure", "Структура"], ["rooms", "Кабинеты"], ["equipment", "Оборудование"]] },
    staff: { t: "Сотрудники", i: "users", d: "Сотрудники, их документы и сроки проверки", subs: [["list", "Список"], ["docs", "Документы"], ["import", "Импорт"]] },
    services: { t: "Услуги", i: "receipt", d: "Прайс-лист клиники и источники финансирования", subs: [["price", "Прайс-лист"], ["sources", "Источники финансирования"], ["import", "Импорт прайс-листа"]] },
    schedule: { t: "Графики работы", i: "clock", d: "Рабочие графики врачей и исключения", subs: [["list", "Графики"], ["settings", "Настройки"]] },
    spec: { t: "Специальности", i: "spec", d: "Специальности врачей и услуги, которые к ним привязаны" },
    growth: { t: "Развитие продукта", i: "growth", d: "Идеи и голосование за новые функции МИСТРИ", subs: [["ideas", "Идеи"], ["mine", "Мои голоса"]] },
    booking: { t: "Запись на приём", i: "calendar", d: "Вторник, 9 августа 2026 • Регистратура, окно 2" },
    patients: { t: "Пациенты", i: "users", d: "Карты пациентов клиники", subs: [["list", "Список пациентов"], ["dupes", "Возможные дубли"]] },
    campaigns: { t: "Кампании", i: "spec", d: "Профосмотры для компаний-партнёров", subs: [["companies", "Компании"], ["routes", "Маршруты сотрудников"]] },
    workplace: { t: "Рабочее место", i: "calendar", d: "Вторник, 9 августа 2026 • Кабинет 304 • Смена: 08:00 - 16:00" },
    protocols: { t: "Протоколы", i: "file", d: "Протоколы амбулаторного приёма", subs: [["drafts", "Черновики"], ["signed", "Подписанные"], ["templates", "Шаблоны"]] },
  };
  const ROLES = {
    head: { t: "Руководитель", d: "Обзор, клиника, услуги", i: "shield", pages: ["overview", "clinic", "spec", "growth"] },
    reg: { t: "Регистратор", d: "Запись на приём, пациенты", i: "registrar", pages: ["booking", "patients", "campaigns", "growth"] },
    doc: { t: "Врач", d: "Приём и протоколы", i: "doctor", pages: ["workplace", "patients", "protocols", "growth"] },
  };
  // строки списков: [название, подпись, статус, класс статуса]; строки открывают карточку (3-й уровень)
  const ROWS = {
    "clinic/structure": ["Подразделения", 5, [["GMS Clinic Садовническая", "Филиал · 3 отделения", "Активен"], ["GMS Clinic Смоленская", "Филиал · 2 отделения", "Активен"], ["Базовая амбулатория", "Отделение · 4 кабинета", "Активно"], ["Процедурный кабинет и пункт забора анализов", "Отделение · нет графика", "Требует настройки", "st--warn"]]],
    "clinic/rooms": ["Кабинеты", 6, [["101 терапевтический кабинет", "Базовая амбулатория", "Активный"], ["Кабинет 101", "Базовая амбулатория", "Активный"], ["Кабинет Кузнецовой", "Базовая амбулатория", "Активный"], ["Кабинет Орловой", "Базовая амбулатория", "Нет врача", "st--warn"]]],
    "clinic/equipment": ["Оборудование", 1, [["Демонстрационный электрокардиограф", "Диагностическое оборудование · Кабинет Орловой", "Активно"]]],
    "staff/list": ["Сотрудники", 20, [["Кузнецова Елена Андреевна", "Врач-невролог · Неврология", "Активна"], ["Лебедева Ирина Павловна", "Врач клинической лабораторной диагностики", "Истекает сертификат", "st--warn"], ["Орлова Анна Викторовна", "Врач-терапевт · Терапия", "Активна"], ["Антонова Юлия Сергеевна", "Администратор регистратуры", "Отрицательные отзывы", "st--bad"]]],
    "staff/docs": ["Документы сотрудников", 48, [["Сертификат специалиста — Лебедева И. П.", "Действует до 30.09.2026", "Истекает", "st--warn"], ["Диплом — Кузнецова Е. А.", "Проверен 12.03.2026", "Проверен"], ["Аккредитация — Орлова А. В.", "Не загружена", "Нет документа", "st--bad"]]],
    "services/price": ["Найдено: 8 услуг", 8, [["Диспансерный приём (осмотр, консультация) врача-терапевта", "B04.047.001 · 7 врачей · 30 мин", "Активный"], ["Общий анализ крови", "LAB-CBC · 3 врача · 10 мин", "Активный"], ["Первичный приём врача-кардиолога", "SERVICE-DEMO-CARDIOLOGIST · 5 врачей · 40 мин", "Активный"], ["Приём врача-терапевта повторный", "B01.047.002 · 1 врач · 30 мин", "Без цены ДМС", "st--warn"]]],
    "services/sources": ["Источники финансирования", 4, [["Самооплата", "Цены заданы для 8 услуг", "Активен"], ["ДМС", "Цены заданы для 3 услуг", "Активен"], ["ОМС", "Цены заданы для 2 услуг", "Активен"], ["Государственная программа", "Цены заданы для 3 услуг", "Активен"]]],
    "schedule/list": ["Действующие графики", 75, [["Пятидневная рабочая неделя", "08:00–16:00 · с 2026-07-29", "Лебедева И. П."], ["Сменный график", "08:00–16:00 · с 2026-08-26", "Орлова А. В."], ["Режим гибкого рабочего времени", "08:00–16:00 · с 2026-03-26", "Соколов М. С."]]],
    "spec/": ["Специальности", 12, [["Терапия", "4 врача · 6 услуг", "Активна"], ["Неврология", "2 врача · 3 услуги", "Активна"], ["Кардиология", "1 врач · 2 услуги", "Нет графика", "st--warn"], ["Функциональная диагностика", "Нет врачей", "Не настроена", "st--bad"]]],
    "growth/ideas": ["Идеи", 48, [["Шаблоны протоколов для узких специалистов", "132 голоса · в работе", "В работе"], ["Напоминания пациентам в мессенджерах", "98 голосов", "Обсуждается", "st--warn"], ["Тёмная тема", "76 голосов · выйдет в сентябре", "Скоро"]]],
    "growth/mine": ["Ваши голоса", 12, [["Шаблоны протоколов для узких специалистов", "Вы проголосовали 2 августа", "В работе"], ["Тёмная тема", "Вы проголосовали 14 июля", "Скоро"]]],
    "patients/list": ["Найдено: 36 пациентов", 36, [["Иванов Иван Иванович", "03.02.1991 · +7 (495) 876-54-32", "ЭМК активна"], ["Никитина Ольга Викторовна", "13.05.1995 · +7 (495) 876-54-32", "Нет ЭМК", "st--warn"], ["Захаров Олег Сергеевич", "27.01.1979 · +7 (495) 876-54-32", "ЭМК активна"], ["Фёдорова Наталья Романовна", "03.02.1991 · +7 (495) 876-54-32", "ЭМК активна"]]],
    "patients/dupes": ["Возможные дубли", 3, [["Иванов Иван Иванович", "2 карты · совпадает телефон и дата рождения", "Проверить", "st--warn"], ["Смирнова Ольга Викторовна", "2 карты · совпадает полис", "Проверить", "st--warn"]]],
    "campaigns/companies": ["Кампании", 4, [["ООО Промконтур", "7 сотрудников · 3 прошли осмотр", "Идёт"], ["АО Северсталь-Сервис", "24 сотрудника · не начата", "Запланирована", "st--warn"]]],
    "campaigns/routes": ["Маршруты сотрудников", 7, [["Захаров Олег Сергеевич", "ООО Промконтур · 4 из 6 кабинетов", "В пути"], ["Морозов Кирилл Павлович", "ООО Промконтур · не начат", "Ожидает", "st--warn"], ["Смирнов Денис Олегович", "ООО Промконтур · завершён", "Завершён"]]],
    "protocols/drafts": ["Черновики", 3, [["Протокол амбулаторного приёма — Ветров В. С.", "9 августа, 10:12", "Не подписан", "st--warn"], ["Консультация — Смирнов А. П.", "8 августа, 16:40", "Не подписан", "st--warn"]]],
    "protocols/signed": ["Подписанные", 36, [["Протокол амбулаторного приёма — Иванов И. И.", "Подписан УКЭП 8 августа", "Подписан"], ["Повторный приём — Петрова М. И.", "Подписан УКЭП 7 августа", "Подписан"]]],
    "protocols/templates": ["Шаблоны", 6, [["Первичный приём терапевта", "Обновлён 01.08.2026", "Активен"], ["Повторный приём невролога", "Обновлён 12.07.2026", "Активен"]]],
  };

  // короткие подписи подразделов в меню — те же, что в макетах Figma
  const SHORT = { clinic: "Структура, кабинеты, оборудование", staff: "Список, документы, импорт", services: "Прайс-лист, источники, импорт", schedule: "Графики, настройки", growth: "Идеи, мои голоса", patients: "Список, возможные дубли", campaigns: "Компании, маршруты", protocols: "Черновики, подписанные, шаблоны" };
  const VARIANTS = [
    { id: "asis", n: "Как сейчас", d: "<b>Как сейчас (макет).</b> Разделы спрятаны в «три полоски», в шапке не видно, на какой вы странице." },
    { id: "btn", n: "Вариант 1 · Кнопка-раздел", d: "<b>Вариант 1 · Кнопка-раздел.</b> На месте «трёх полосок» — кнопка Secondary L с иконкой и названием текущего раздела и шевроном. Нажатие открывает то же меню разделов." },
    { id: "logo", n: "Вариант 2 · У логотипа", d: "<b>Вариант 2 · Раздел у логотипа.</b> Справа от логотипа через разделитель — кнопка Secondary M с текущим разделом. «Три полоски» убраны." },
  ];

  const S = { v: "btn", role: "head", page: "overview", sub: null, ent: null, side: true };
  const pages = () => ROLES[S.role].pages;
  const cur = () => SEC[S.page];
  const subs = (k = S.page) => SEC[k].subs || [];
  const subT = () => (subs().find((x) => x[0] === S.sub) || [])[1];
  const firstSub = (k) => (subs(k)[0] || [])[0] || null;
  (() => { // адрес: #вариант/раздел/подраздел/роль
    const [v, p, sb, r] = location.hash.slice(1).split("/");
    if (VARIANTS.some((x) => x.id === v)) S.v = v;
    if (ROLES[r]) S.role = r;
    if (SEC[p] && pages().includes(p)) S.page = p;
    S.sub = subs().some((x) => x[0] === sb) ? sb : firstSub(S.page);
  })();
  const sync = () => history.replaceState(null, "", `#${S.v}/${S.page}/${S.sub || "-"}/${S.role}`);
  const loc = () => [cur().t, subT(), S.ent].filter(Boolean);

  /* ---------- шапка ---------- */
  const userHTML = () => `
    <button class="user" id="userBtn" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Иванов Иван Иванович, роль ${ROLES[S.role].t}. Сменить роль">
      <span class="user__ava"><img src="assets/user.png" alt=""></span>
      <span class="user__txt"><span class="user__name">Иванов Иван Иванович</span>
      <span class="user__role">${ROLES[S.role].t} <span class="user__chev">${ic("chev", "ic--sm")}</span></span></span>
    </button>`;
  const lbl = () => `Раздел: ${cur().t}. Выбрать другой раздел`;
  const menuBtn = (kind = "nav") => `<button class="ibtn ibtn--menu" data-nav="${kind}" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Разделы">${ic("menu")}</button>`;
  const navBtn = (cls, kind = "nav") => `<button class="navbtn ${cls}" data-nav="${kind}" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="${lbl()}">${ic(cur().i)}<span>${cur().t}</span>${ic("chev")}</button>`;
  const tabsHTML = () => `<nav class="tabs" aria-label="Разделы"><span class="tabs__ind"></span>${pages().map((k) => `<button class="tabs__b${k === S.page ? " is-current" : ""}" data-go="${k}" type="button" ${k === S.page ? 'aria-current="page"' : ""} title="${SEC[k].t}">${ic(SEC[k].i)}<span class="tabs__t">${SEC[k].t}</span></button>`).join("")}</nav>`;

  function renderHeader() {
    const v = S.v;
    let logoExtra = "", mid = "", right = userHTML();
    if (v === "logo") logoExtra = `<div class="crumb-sw"><span class="crumb-sw__line"></span><button class="crumb-sw__btn" data-nav="nav" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="${lbl()}">${ic(cur().i)}<span>${cur().t}</span>${ic("chev")}</button></div>`;
    if (v === "tabs" || v === "sys") mid = tabsHTML();
    if (v === "btn") right += navBtn("navbtn--d");
    if (v === "mega") { mid = navBtn("navbtn--m", "mega"); right += navBtn("navbtn--d", "mega"); }
    if (v === "cmdk") mid = `<button class="kpill" data-nav="cmdk" type="button" aria-haspopup="dialog" aria-label="Вы здесь: ${loc().join(", ")}. Быстрый переход">${ic("search")}<span class="kpill__loc">${loc().map((x, i) => `<span class="${i === loc().length - 1 ? "is-last" : ""}">${esc(x)}</span>`).join('<span class="kpill__sep">›</span>')}</span><kbd>Ctrl K</kbd></button>`;
    if (["asis", "title", "crumbs"].includes(v)) right += menuBtn();
    if (v === "side") right += `<button class="ibtn ibtn--menu ibtn--mob" data-nav="drawer" type="button" aria-label="Разделы">${ic("menu")}</button>`;
    if (v === "sys") right += `<button class="ibtn" data-nav="cmdk" type="button" aria-label="Быстрый переход (Ctrl+K)" title="Быстрый переход · Ctrl+K">${ic("search")}</button>`;
    right += `<button class="ibtn ibtn--sun" type="button" aria-label="Тема">${ic("sun")}</button><button class="ibtn" type="button" aria-label="Уведомления">${ic("bell")}<span class="ibtn__dot"></span></button>`;
    // В1 и В2: порядок справа — разделы, тема, уведомления, аккаунт
    if (v === "btn" || v === "logo") {
      const sw = v === "btn" ? navBtn("navbtn--d") : `<div class="crumb-sw crumb-sw--right"><button class="crumb-sw__btn" data-nav="nav" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="${lbl()}">${ic(cur().i)}<span>${cur().t}</span>${ic("chev")}</button></div>`;
      logoExtra = "";
      right = sw + `<button class="ibtn ibtn--sun" type="button" aria-label="Тема">${ic("sun")}</button><button class="ibtn" type="button" aria-label="Уведомления">${ic("bell")}<span class="ibtn__dot"></span></button>` + userHTML();
    }
    const hd = $("#hd");
    hd.className = "hd" + (v === "tabs" || v === "sys" ? " hd--tabs" : "") + (v === "cmdk" ? " hd--cmdk" : "");
    hd.innerHTML = `<div class="hd__logo"><a href="#" data-go="${pages()[0]}" aria-label="МИСТРИ, на главную"><img src="assets/logo.svg" alt="МИСТРИ"></a>${logoExtra}</div>
      <div class="hd__mid">${mid}</div><div class="hd__right">${right}</div>`;
    fixNavWidth();
    placeTabs();
  }
  // ширина переключателя — по самому длинному названию раздела роли, чтобы шапка не прыгала
  function fixNavWidth() {
    const label = $(".navbtn--d > span:not(.ic)");
    if (!label) return;
    const cur = label.textContent;
    label.style.width = "auto";
    let max = 0;
    for (const k of pages()) { label.textContent = SEC[k].t; max = Math.max(max, label.getBoundingClientRect().width); }
    label.textContent = cur;
    label.style.width = Math.ceil(max) + "px";
  }
  function placeTabs() {
    const t = $(".tabs"); if (!t) return;
    const b = $(".tabs__b.is-current", t), ind = $(".tabs__ind", t);
    if (!b) return;
    ind.style.width = b.offsetWidth + "px";
    ind.style.transform = `translateX(${b.offsetLeft}px)`;
    if (b.offsetLeft + b.offsetWidth > t.clientWidth + t.scrollLeft || b.offsetLeft < t.scrollLeft) t.scrollLeft = b.offsetLeft - 16;
  }

  /* ---------- боковая панель (вариант 7) ---------- */
  const treeHTML = () => pages().map((k) => {
    const on = k === S.page, ss = subs(k);
    return `<div class="tree__g${on ? " is-open" : ""}">
      <button class="tree__s${on ? " is-current" : ""}" data-go="${k}" type="button" title="${SEC[k].t}" ${on && !S.sub ? 'aria-current="page"' : ""}>${ic(SEC[k].i)}<span class="tree__t">${SEC[k].t}</span>${ss.length ? ic("chev", "tree__chev ic--sm") : ""}</button>
      ${on && ss.length ? `<div class="tree__subs">${ss.map(([sk, st]) => `<button class="tree__sub${sk === S.sub ? " is-current" : ""}" data-go="${k}" data-sub="${sk}" type="button" ${sk === S.sub ? 'aria-current="page"' : ""}>${st}</button>`).join("")}</div>` : ""}
    </div>`;
  }).join("");
  function renderSide() {
    const el = $("#side"), on = S.v === "side";
    $("#app").classList.toggle("has-side", on);
    $("#app").classList.toggle("side-min", on && !S.side);
    el.hidden = !on;
    if (!on) return;
    el.innerHTML = `<div class="side__label">Разделы<span> · ${ROLES[S.role].t}</span></div><nav class="tree" aria-label="Разделы">${treeHTML()}</nav>
      <button class="tree__min" id="sideMin" type="button" aria-label="${S.side ? "Свернуть панель" : "Развернуть панель"}">${ic("sidebar")}<span class="tree__t">Свернуть</span></button>`;
  }

  /* ---------- страница ---------- */
  const calendar = () => {
    const wd = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
    const load = { 9: "danger", 10: "warning", 11: "attention", 12: "attention", 15: "danger", 16: "danger", 17: "warning", 18: "attention", 19: "success", 20: "success", 21: "success", 22: "success", 25: "danger", 26: "danger", 27: "attention", 28: "warning", 29: "danger", 30: "success", 31: "success" };
    const pad = { danger: 6, attention: 10, warning: 12, success: 14 };
    let w = "", d = "";
    for (let i = 1; i <= 31; i++) {
      const day = wd[(i - 1) % 7], we = day === "сб" || day === "вс";
      w += `<span class="${we ? "we" : ""}">${day}</span>`;
      const cls = i < 9 ? "past" : i === 9 ? "today" : [13, 14, 23, 24].includes(i) ? "off" : "";
      const l = load[i];
      d += `<span class="cal__d ${cls}"><b>${i}</b>${l ? `<i style="width:${32 - pad[l] * 2}px;background:var(--c-${l})"></i>` : ""}</span>`;
    }
    return `<section class="card cal"><div class="card__h"><h2>Сентябрь 2026 ${ic("chev")}</h2><span class="pill">Сегодня</span></div>
      <div class="card__b"><div class="cal__wd">${w}</div><div class="cal__days"><span class="cal__nav">${ic("left")}</span><div class="cal__row">${d}</div><span class="cal__nav">${ic("right")}</span></div></div></section>`;
  };
  const search = (ph) => `<label class="inp">${ic("search")}<input type="search" placeholder="${ph}"></label>`;
  const list = ([title, n, rows]) => `<section class="card"><div class="card__h"><h2>${title} <span class="count">${n}</span></h2></div>
    <div>${rows.map(([a, b, s, c]) => `<button class="list__row" data-ent="${esc(a)}" type="button"><span class="list__main"><b>${a}</b><span>${b}</span></span><span class="st ${c || ""}">${s}</span>${ic("right", "list__go")}</button>`).join("")}</div></section>`;
  const empty = (t) => `<section class="card"><div class="card__b empty">${ic(cur().i)}<b>${t}</b><span>Здесь появятся данные подраздела «${subT() || cur().t}».</span></div></section>`;
  // обзор руководителя — ярлыки разделов: дашборд ведёт туда же, куда и навигация
  const shortcuts = () => `<div class="grid grid--4">${pages().filter((k) => k !== S.page).slice(0, 4).map((k) => `<button class="card stat stat--go" data-go="${k}" type="button">${ic(SEC[k].i)}<span>${SEC[k].t}</span><b>${{ clinic: "5", staff: "20", services: "8", schedule: "75", spec: "12", growth: "48", patients: "36", campaigns: "4", protocols: "3", booking: "14" }[k] || "—"}</b><em>${{ clinic: "1 требует настройки", spec: "1 без врачей", growth: "6 новых за неделю" }[k] || "открыть раздел"}</em></button>`).join("")}</div>`;

  function content() {
    const k = `${S.page}/${S.sub || ""}`;
    if (["overview", "workplace", "booking"].includes(S.page)) return search("Поиск по ФИО, телефону, полису или СНИЛС") + calendar();
    if (ROWS[k]) return (k.startsWith("patients/list") || k.startsWith("services/price") ? search("Поиск по названию, коду или ФИО") : "") + list(ROWS[k]);
    if (S.sub === "import") return `<section class="card"><div class="card__b drop">${ic("file")}<b>Перетащите файл .xlsx или .csv</b><span>или выберите на компьютере · до 10 МБ</span></div></section>`;
    return empty(subT() || cur().t);
  }
  function entity() {
    return `<section class="card"><div class="card__h"><h2>Основные данные</h2><span class="pill">Редактировать</span></div>
      <div class="card__b kv"><span>Раздел</span><b>${cur().t}</b><span>Подраздел</span><b>${subT() || "—"}</b><span>Статус</span><b><span class="st">Активен</span></b><span>Изменено</span><b>9 августа 2026, 10:42</b></div></section>`;
  }

  function renderPage(anim) {
    const p = cur(), v = S.v, deep = !!S.ent;
    const title = deep ? S.ent : p.t;
    let h1 = `<h1>${deep ? `<button class="back" data-back type="button" aria-label="Назад к «${subT() || p.t}»">${ic("back")}</button>` : ""}${esc(title)}</h1>`;
    if (v === "title" && !deep) h1 = `<h1><button class="title-sw" data-nav="nav" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="${lbl()}">${p.t}${ic("chev")}</button></h1>`;
    // крошки: в «Крошках» — всегда, с переключателем раздела; в остальных — только на карточке (3-й уровень), как в макете
    let bc = "";
    if (v === "crumbs") bc = `<nav class="bc" aria-label="Вы здесь"><span>${ROLES[S.role].t}</span><span class="bc__sep">›</span><button class="bc__sw" data-nav="nav" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="${lbl()}">${ic(p.i, "ic--sm")}<span>${p.t}</span>${ic("chev", "ic--sm")}</button>${S.sub ? `<span class="bc__sep">›</span>${deep ? `<a href="#" class="bc__a" data-go="${S.page}" data-sub="${S.sub}">${subT()}</a>` : `<span class="bc__cur">${subT()}</span>`}` : ""}${deep ? `<span class="bc__sep">›</span><span class="bc__cur">${esc(S.ent)}</span>` : ""}</nav>`;
    else if (deep) bc = `<nav class="bc" aria-label="Вы здесь"><a href="#" class="bc__a" data-go="${S.page}">${ic(p.i, "ic--sm")}${p.t}</a>${S.sub ? `<span class="bc__sep">›</span>${deep ? `<a href="#" class="bc__a" data-go="${S.page}" data-sub="${S.sub}">${subT()}</a>` : `<span class="bc__cur">${subT()}</span>`}` : ""}${deep ? `<span class="bc__sep">›</span><span class="bc__cur">${esc(S.ent)}</span>` : ""}</nav>`;
    // подразделы — вкладки страницы (как «Список пациентов / Возможные дубли» в макете); в боковой панели они в дереве
    const st = false ? `<nav class="stabs" aria-label="Подразделы «${p.t}»">${subs().map(([sk, t]) => `<button class="stabs__b${sk === S.sub ? " is-current" : ""}" data-go="${S.page}" data-sub="${sk}" type="button" ${sk === S.sub ? 'aria-current="page"' : ""}>${t}</button>`).join("")}</nav>` : "";
    const el = $("#page");
    el.innerHTML = `<div class="ttl">${bc}${h1}<p>${deep ? `${p.t}${subT() ? " · " + subT() : ""}` : p.d}</p>${st}</div>${deep ? entity() : content()}`;
    if (anim) { el.classList.remove("is-enter"); void el.offsetWidth; el.classList.add("is-enter"); }
    document.title = `${loc().slice().reverse().join(" — ")} — МИСТРИ`;
  }

  function render(anim) {
    closePop();
    renderHeader();
    renderSide();
    renderPage(anim);
    $$("#variants button").forEach((b) => b.classList.toggle("is-on", b.dataset.v === S.v));
    const on = $("#variants .is-on"), seg = $("#variants");
    if (on && seg.scrollWidth > seg.clientWidth) seg.scrollLeft = on.offsetLeft - seg.clientWidth / 2 + on.offsetWidth / 2;
    $("#desc").innerHTML = VARIANTS.find((x) => x.id === S.v).d;
    sync();
  }

  function go(page, sub, ent) {
    sub = sub || firstSub(page);
    if (page === S.page && sub === S.sub && (ent || null) === S.ent) { closePop(); return; }
    S.page = page; S.sub = sub; S.ent = ent || null;
    render(true);
    test.onNav();
  }

  /* ---------- поповеры ---------- */
  let pop = null, popTrig = null, scrim = null;
  function closePop(focus) {
    if (!pop) return;
    pop.remove(); pop = null;
    if (scrim) { scrim.remove(); scrim = null; }
    if (popTrig) { popTrig.setAttribute("aria-expanded", "false"); if (focus && popTrig.isConnected) popTrig.focus(); }
    popTrig = null;
  }
  function addScrim(cls = "") { scrim = document.createElement("div"); scrim.className = "scrim " + cls; scrim.onclick = () => closePop(true); document.body.appendChild(scrim); }
  function placeAt(trig, el, align) {
    const r = trig.getBoundingClientRect();
    el.style.top = r.bottom + scrollY + 8 + "px";
    if (align === "right") el.style.left = Math.max(8, r.right + scrollX - el.offsetWidth) + "px";
    else el.style.left = Math.max(8, Math.min(r.left + scrollX, innerWidth - el.offsetWidth - 8)) + "px";
  }
  function mount(trig, cls, html, role = "menu") {
    closePop();
    pop = document.createElement("div");
    pop.className = cls + " is-open";
    pop.setAttribute("role", role);
    pop.innerHTML = html;
    document.body.appendChild(pop);
    popTrig = trig; trig.setAttribute("aria-expanded", "true");
  }
  function openNav(trig, kb) {
    const asis = S.v === "asis";
    mount(trig, `pop pop--asis pop--sheet`, pages().map((k) => `<button class="pop__item${k === S.page ? " is-current" : ""}" role="menuitem" data-go="${k}" type="button" ${k === S.page && !asis ? 'aria-current="page"' : ""}>${ic(SEC[k].i)}<span>${SEC[k].t}</span>${ic("check", "ic--check")}</button>`).join(""));
    if (mobile()) addScrim(); else {
      placeAt(trig, pop, trig.closest(".hd__right") ? "right" : "left");
      // меню разделов опускаем под линию шапки, чтобы не наезжало на неё
      if (S.v === "logo") pop.style.top = $("#hd").getBoundingClientRect().bottom + scrollY + 8 + "px";
    }
    if (kb) ($(".pop__item.is-current", pop) || $(".pop__item", pop)).focus();
  }
  function openMega(trig, kb) {
    mount(trig, "pop mega pop--sheet", `<label class="mega__q">${ic("search")}<input type="search" placeholder="Найти раздел или подраздел" aria-label="Найти раздел"></label>
      <div class="mega__grid">${pages().map((k) => `<div class="mega__col${k === S.page ? " is-current" : ""}">
        <button class="mega__s" data-go="${k}" type="button" role="menuitem">${ic(SEC[k].i)}<span>${SEC[k].t}</span>${k === S.page ? "<em>Вы здесь</em>" : ""}</button>
        ${subs(k).map(([sk, t]) => `<button class="mega__sub${k === S.page && sk === S.sub ? " is-current" : ""}" data-go="${k}" data-sub="${sk}" type="button" role="menuitem">${t}</button>`).join("")}
      </div>`).join("")}</div>`);
    if (mobile()) addScrim(); else { addScrim("scrim--light"); placeAt(trig, pop, trig.closest(".hd__right") ? "right" : "left"); }
    const q = $("input", pop);
    q.addEventListener("input", () => {
      const s = q.value.trim().toLowerCase();
      $$(".mega__col", pop).forEach((col) => {
        let any = false;
        $$(".mega__s, .mega__sub", col).forEach((b) => { const hit = !s || b.textContent.toLowerCase().includes(s); b.classList.toggle("is-dim", !hit); any = any || hit; });
        col.hidden = !any;
      });
    });
    if (kb || !mobile()) q.focus();
  }
  // быстрый переход: разделы, подразделы, пациенты
  function cmdkItems() {
    const out = [];
    pages().forEach((k) => {
      out.push({ g: "Разделы", t: SEC[k].t, i: SEC[k].i, go: [k, null], here: k === S.page && !S.ent });
      subs(k).forEach(([sk, t]) => out.push({ g: "Подразделы", t: `${SEC[k].t} › ${t}`, i: SEC[k].i, go: [k, sk], here: k === S.page && sk === S.sub && !S.ent }));
    });
    if (pages().includes("patients")) ["Иванов Иван Иванович", "Никитина Ольга Викторовна", "Захаров Олег Сергеевич"].forEach((n) => out.push({ g: "Пациенты", t: n, i: "users", go: ["patients", "list", n] }));
    const order = ["Разделы", "Подразделы", "Пациенты"];
    return out.sort((a, b) => order.indexOf(a.g) - order.indexOf(b.g));
  }
  function openCmdk(trig) {
    mount(trig, "cmdk", `<div class="cmdk__box"><label class="cmdk__q">${ic("search")}<input type="search" placeholder="Куда перейти? Раздел, подраздел или пациент" aria-label="Быстрый переход"><kbd>Esc</kbd></label>
      <div class="cmdk__here">Вы здесь: <b>${loc().map(esc).join(" › ")}</b></div><div class="cmdk__list" role="listbox"></div></div>`, "dialog");
    addScrim("scrim--dark");
    const q = $("input", pop), listEl = $(".cmdk__list", pop), items = cmdkItems();
    let sel = 0, shown = [];
    const draw = () => {
      const s = q.value.trim().toLowerCase();
      shown = items.filter((x) => !s || x.t.toLowerCase().includes(s));
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      let g = "";
      listEl.innerHTML = shown.length ? shown.map((x, i) => (x.g !== g ? `<div class="cmdk__g">${(g = x.g)}</div>` : "") + `<button class="cmdk__it${i === sel ? " is-sel" : ""}" data-i="${i}" type="button" role="option" aria-selected="${i === sel}">${ic(x.i)}<span>${esc(x.t)}</span>${x.here ? "<em>Вы здесь</em>" : ""}</button>`).join("") : `<div class="cmdk__none">Ничего не нашлось</div>`;
      $(".cmdk__it.is-sel", listEl)?.scrollIntoView({ block: "nearest" });
    };
    const pick = (i) => { const x = shown[i]; if (!x) return; closePop(); go(...x.go); };
    q.addEventListener("input", () => { sel = 0; draw(); });
    q.addEventListener("keydown", (e) => {
      if (!shown.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % shown.length; draw(); }
      if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; draw(); }
      if (e.key === "Enter") { e.preventDefault(); pick(sel); }
    });
    listEl.addEventListener("click", (e) => { const b = e.target.closest(".cmdk__it"); if (b) { e.stopPropagation(); pick(+b.dataset.i); } });
    draw(); q.focus();
  }
  function openDrawer(trig) {
    mount(trig, "drawer", `<div class="drawer__h"><img src="assets/logo.svg" alt="МИСТРИ"><button class="drawer__x" type="button" aria-label="Закрыть">✕</button></div><nav class="tree" aria-label="Разделы">${treeHTML()}</nav>`, "dialog");
    addScrim("scrim--dark");
    $(".drawer__x", pop).onclick = () => closePop(true);
  }
  function openRole(trig, kb) {
    mount(trig, "pop pop--role", `<div class="role-head"><span class="user__ava"><img src="assets/user.png" alt=""></span><span><span class="user__name">Иванов Иван Иванович</span><span class="user__role">${ROLES[S.role].t} ${ic("chev", "ic--sm")}</span></span></div>
      <div class="role-list">${Object.entries(ROLES).map(([k, r]) => `<button class="pop__item${k === S.role ? " is-current" : ""}" role="menuitemradio" aria-checked="${k === S.role}" data-role="${k}" type="button">${ic(r.i)}<span>${r.t}<span class="pop__sub">${r.d}</span></span>${ic("check", "ic--check")}</button>`).join("")}</div>
      <div class="role-foot"><button class="pop__item" type="button" role="menuitem">${ic("clinic")}<span>Сменить мед. организацию<span class="pop__sub">БЗ-МЕД</span></span></button></div>
      <div class="role-foot"><button class="pop__item" type="button" role="menuitem">${ic("plus")}<span>Добавить роль</span></button><button class="pop__item" type="button" role="menuitem">${ic("logout")}<span>Выйти</span></button></div>`);
    $(".role-head .user__role .ic", pop).style.transform = "rotate(180deg)";
    const r = trig.getBoundingClientRect();
    pop.style.top = r.top + scrollY - 16 + "px";
    pop.style.left = Math.max(8, Math.min(r.left + scrollX - 16, innerWidth - pop.offsetWidth - 8)) + "px";
    if (kb) $(".pop__item.is-current", pop).focus();
  }
  const OPEN = { nav: openNav, mega: openMega, cmdk: openCmdk, drawer: openDrawer };

  document.addEventListener("click", (e) => {
    const t = e.target;
    const nav = t.closest("[data-nav]");
    if (nav) { e.preventDefault(); hideCoach(); if (popTrig === nav) closePop(true); else OPEN[nav.dataset.nav](nav, e.detail === 0); return; }
    const u = t.closest("#userBtn"); if (u) { if (popTrig === u) closePop(true); else openRole(u, e.detail === 0); return; }
    if (t.closest("#sideMin")) { S.side = !S.side; renderSide(); return; }
    if (t.closest("[data-back]")) { go(S.page, S.sub); return; }
    const en = t.closest("[data-ent]"); if (en) { go(S.page, S.sub, en.dataset.ent); return; }
    const g = t.closest("[data-go]"); if (g) { e.preventDefault(); hideCoach(); go(g.dataset.go, g.dataset.sub); return; }
    const r = t.closest("[data-role]");
    if (r) {
      if (r.dataset.role !== S.role) { S.role = r.dataset.role; S.page = pages()[0]; S.sub = firstSub(S.page); S.ent = null; render(true); toast(`Роль: ${ROLES[S.role].t}. Разделы обновились`); test.onNav(); }
      else closePop(true);
      return;
    }
    if (pop && !t.closest(".pop, .cmdk__box, .drawer")) closePop();
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyK") {
      e.preventDefault();
      const trig = $('[data-nav="cmdk"]');
      if (trig) openCmdk(trig);
      return;
    }
    if (e.key === "Escape") { if (pop) closePop(true); hideCoach(); }
    if (!pop || pop.classList.contains("cmdk") || !["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const items = $$(".pop__item, .mega__s, .mega__sub, .tree__s, .tree__sub", pop).filter((x) => x.offsetParent), i = items.indexOf(document.activeElement);
    e.preventDefault();
    const n = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[n]?.focus();
  });
  document.addEventListener("keydown", (e) => {
    const b = e.target.closest && e.target.closest(".tabs__b, .stabs__b"); if (!b || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const all = $$("." + b.classList[0], b.parentNode), i = all.indexOf(b);
    all[(i + (e.key === "ArrowRight" ? 1 : -1) + all.length) % all.length].focus();
  });
  addEventListener("resize", () => { placeTabs(); if (pop && !mobile() && popTrig && !pop.classList.contains("cmdk")) closePop(); });

  /* ---------- первый вход: подсказка ---------- */
  let coach = null, ring = null;
  function hideCoach() { coach?.remove(); ring?.remove(); coach = ring = null; }
  function showCoach() {
    hideCoach(); closePop();
    const target = [...$$("#side .tree"), ...$$(".tabs"), ...$$("[data-nav]")].find((el) => el.offsetParent && !(S.v === "sys" && el.dataset.nav === "cmdk"));
    if (!target) return;
    target.scrollIntoView({ block: "nearest" });
    const r = target.getBoundingClientRect();
    const others = pages().filter((k) => k !== S.page).map((k) => `«${SEC[k].t}»`).join(", ");
    ring = document.createElement("div"); ring.className = "coach-ring";
    Object.assign(ring.style, { left: r.left + scrollX - 4 + "px", top: r.top + scrollY - 4 + "px", width: r.width + 8 + "px", height: r.height + 8 + "px", borderRadius: getComputedStyle(target).borderRadius });
    coach = document.createElement("div"); coach.className = "coach"; coach.setAttribute("role", "dialog");
    coach.innerHTML = `<span class="coach__arr"></span>Здесь переключаются разделы`; coach.classList.add("coach--tip"); ring.style.display = "none";
    document.body.append(ring, coach);
    const w = coach.offsetWidth, side = S.v === "side" && !mobile();
    const left = side ? r.right + scrollX + 14 : Math.max(16, Math.min(r.left + scrollX + r.width / 2 - w / 2, innerWidth - w - 16));
    coach.style.left = left + "px"; coach.style.top = (side ? r.top + scrollY + 8 : r.bottom + scrollY + 14) + "px";
    const arr = $(".coach__arr", coach);
    if (side) Object.assign(arr.style, { left: "-6px", top: "20px" });
    else arr.style.left = Math.max(16, Math.min(r.left + r.width / 2 - left - 6, w - 28)) + "px";
    coach.onclick = hideCoach;
  }
  $("#firstRun").onclick = showCoach;

  /* ---------- коридорный тест ---------- */
  const KEY = "mistri-header-test-v2";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch {} };
  const fmt = (ms) => (ms == null ? "—" : (ms / 1000).toFixed(1) + " с");
  const test = (() => {
    const box = $("#test"), body = $("#testBody");
    let run = null, tick = null, clicks = 0;
    const TASKS = [
      { q: "Скажите вслух: на какой странице вы сейчас?", manual: true, prep: () => { S.role = "head"; S.page = "clinic"; S.sub = firstSub("clinic"); S.ent = null; } },
      { q: "Перейдите на страницу «Специальности».", done: () => S.page === "spec", prep: () => { S.role = "head"; S.page = "overview"; S.sub = null; S.ent = null; } },
      { q: "Вернитесь на «Обзор».", done: () => S.page === "overview" },
      { q: "Перейдите в «Развитие продукта».", done: () => S.page === "growth" },
    ];
    document.addEventListener("click", (e) => { if (run && !e.target.closest("#test, .demo")) clicks++; }, true);
    function start() { run = { v: S.v, step: 0, res: [] }; step(); }
    function step() {
      const t = TASKS[run.step];
      if (!t) return finish();
      if (t.prep) { t.prep(); render(false); }
      clicks = 0; run.t0 = performance.now(); run.sawEnt = false;
      draw();
      clearInterval(tick); tick = setInterval(() => { const el = $("#tTime"); if (el) el.textContent = fmt(performance.now() - run.t0); }, 100);
    }
    function record(ok) {
      const t = TASKS[run.step];
      run.res.push({ ok, ms: Math.round(performance.now() - run.t0), clicks: t.manual ? 0 : clicks });
      run.step++; step();
    }
    function finish() { clearInterval(tick); const all = load(); all.push({ v: run.v, at: Date.now(), res: run.res }); save(all); run = null; draw(); }
    function table() {
      const all = load();
      if (!all.length) return `<p class="test__meta">Пока нет результатов.</p>`;
      const rows = VARIANTS.map((v) => {
        const rs = all.filter((x) => x.v === v.id); if (!rs.length) return "";
        const ok = rs.reduce((s, x) => s + x.res.filter((r) => r.ok).length, 0), tot = rs.reduce((s, x) => s + x.res.length, 0);
        const nav = rs.flatMap((x) => x.res.slice(1).filter((r) => r.ok));
        const avg = nav.length ? nav.reduce((s, r) => s + r.ms, 0) / nav.length : null;
        const cl = nav.length ? (nav.reduce((s, r) => s + r.clicks, 0) / nav.length).toFixed(1) : "—";
        return `<tr><td>${v.n}</td><td>${rs.length}</td><td>${Math.round((ok / tot) * 100)}%</td><td>${fmt(avg)}</td><td>${cl}</td></tr>`;
      }).join("");
      return `<table><tr><th>Вариант</th><th>Чел.</th><th>Успех</th><th>Время</th><th>Клики</th></tr>${rows}</table>`;
    }
    function draw() {
      const vn = VARIANTS.find((x) => x.id === S.v).n;
      if (!run) {
        body.innerHTML = `<div class="test__task"><small>Вариант «${vn}» · респондент №${load().filter((x) => x.v === S.v).length + 1}</small>
          <b>${TASKS.length} заданий: понять, где ты, найти подраздел, открыть карточку и вернуться, сменить роль.</b></div>
          <div class="test__row"><button class="pri" id="tStart" type="button">Начать</button></div>
          ${table()}
          <div class="test__row"><button id="tCopy" type="button">Скопировать CSV</button><button id="tClear" type="button">Сбросить</button></div>`;
        $("#tStart").onclick = start;
        $("#tCopy").onclick = () => {
          const csv = ["вариант;задание;успех;мс;клики"].concat(load().flatMap((x) => x.res.map((r, i) => `${x.v};${i + 1};${r.ok ? 1 : 0};${r.ms};${r.clicks}`))).join("\n");
          navigator.clipboard?.writeText(csv).then(() => toast("CSV скопирован"), () => toast("Не удалось скопировать"));
        };
        $("#tClear").onclick = () => { if (confirm("Удалить все результаты теста?")) { save([]); draw(); } };
        return;
      }
      const t = TASKS[run.step];
      body.innerHTML = `<div class="test__task"><small>Задание ${run.step + 1} из ${TASKS.length} · ${vn}</small><b>${t.q}</b></div>
        <p class="test__meta">Время: <span id="tTime">0.0 с</span>${t.manual ? " · отметьте ответ" : " · засчитается само"}</p>
        <div class="test__row">${t.manual ? `<button class="pri" data-ok="1" type="button">Ответил верно</button><button data-ok="0" type="button">Ошибся</button>` : `<button data-ok="0" type="button">Не справился</button>`}</div>`;
      $$("[data-ok]", body).forEach((b) => (b.onclick = () => record(b.dataset.ok === "1")));
    }
    function onNav() { if (!run) return; const t = TASKS[run.step]; t.watch?.(); if (t.done?.()) record(true); }
    function open() { box.classList.add("is-open"); box.setAttribute("aria-hidden", "false"); draw(); }
    function close() { box.classList.remove("is-open"); box.setAttribute("aria-hidden", "true"); clearInterval(tick); run = null; }
    $("#testBtn").onclick = () => (box.classList.contains("is-open") ? close() : open());
    $("#testClose").onclick = close;
    return { onNav, redraw: () => box.classList.contains("is-open") && !run && draw() };
  })();

  let tt;
  function toast(s) { const t = $("#toast"); t.textContent = s; t.classList.add("is-on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("is-on"), 2200); }

  /* ---------- панель вариантов ---------- */
  $("#variants").innerHTML = VARIANTS.map((v, i) => `<button type="button" data-v="${v.id}"${v.id === "sys" ? ' class="is-star"' : ""}>${v.n}</button>`).join("");
  $$("#variants button").forEach((b) => (b.onclick = () => { S.v = b.dataset.v; hideCoach(); render(false); test.redraw(); }));

  addEventListener("hashchange", () => {
    const [v, p, sb, r] = location.hash.slice(1).split("/");
    if (VARIANTS.some((x) => x.id === v)) S.v = v;
    if (ROLES[r]) S.role = r;
    S.page = SEC[p] && pages().includes(p) ? p : pages()[0];
    S.sub = subs().some((x) => x[0] === sb) ? sb : firstSub(S.page);
    S.ent = null;
    hideCoach(); render(false);
  });
  const demoH = () => document.documentElement.style.setProperty("--demo-h", $("#demo").offsetHeight + "px");
  new ResizeObserver(demoH).observe($("#demo"));
  render(false);
  document.fonts?.ready.then(() => { fixNavWidth(); placeTabs(); });
})();
