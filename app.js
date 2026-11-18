/* МИСТРИ — варианты шапки: где я и как перейти в другой раздел.
   Визуал шапки из макета не трогаем: логотип, пользователь, круглые кнопки, линия снизу.
   Меняется только то, как показан текущий раздел и выбор разделов. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ic = (name, extra = "") => `<span class="ic i-${name} ${extra}" aria-hidden="true"></span>`;
  const mobile = () => matchMedia("(max-width: 767px)").matches;

  const PAGES = {
    overview: { t: "Обзор", i: "overview", sub: "Вторник, 9 августа 2026 • Кабинет 304 • Смена: 08:00 - 16:00" },
    clinic: { t: "Клиника", i: "clinic", sub: "ООО «БЗ-МЕД» — многопрофильная клиника" },
    spec: { t: "Специальности", i: "spec", sub: "Специальности врачей и услуги, которые к ним привязаны" },
    growth: { t: "Развитие продукта", i: "growth", sub: "Идеи и голосование за новые функции МИСТРИ" },
    booking: { t: "Запись на приём", i: "calendar", sub: "Вторник, 9 августа 2026 • Регистратура, окно 2" },
    patients: { t: "Пациенты", i: "users", sub: "Карты пациентов клиники" },
    workplace: { t: "Приём", i: "calendar", sub: "Вторник, 9 августа 2026 • Кабинет 304 • Смена: 08:00 - 16:00" },
    protocols: { t: "Протоколы", i: "file", sub: "Шаблоны и заполненные протоколы осмотров" },
  };
  const ROLES = {
    head: { t: "Руководитель", d: "Обзор, клиника, услуги", i: "shield", pages: ["overview", "clinic", "spec", "growth"] },
    reg: { t: "Регистратор", d: "Запись на приём, пациенты", i: "registrar", pages: ["booking", "patients", "growth"] },
    doc: { t: "Врач", d: "Приём и протоколы", i: "doctor", pages: ["workplace", "protocols", "growth"] },
  };
  const VARIANTS = [
    { id: "asis", n: "Как сейчас", d: "<b>Как сейчас (макет).</b> Разделы спрятаны в «три полоски», текущий раздел в меню отмечен только серой плашкой, в шапке не видно, где вы." },
    { id: "btn", n: "Кнопка-раздел", d: "<b>1. Кнопка-раздел.</b> На месте «трёх полосок» — та же стеклянная кнопка, но с иконкой и названием текущего раздела и шевроном. Сразу видно, где вы, и что здесь выбор. В меню текущий раздел — акцент и галочка." },
    { id: "logo", n: "У логотипа", d: "<b>2. Раздел у логотипа.</b> Справа от логотипа через разделитель — название текущего раздела с шевроном (как переключатель проектов). «Три полоски» убраны: выбор разделов теперь здесь." },
    { id: "tabs", n: "Вкладки", d: "<b>3. Вкладки в шапке.</b> Все разделы видны сразу в стеклянном переключателе, текущий — белый с акцентом. Ноль кликов, чтобы понять, где вы и куда можно. Ниже 1280 px — только иконки, на телефоне — лента под шапкой." },
    { id: "title", n: "Заголовок", d: "<b>4. Заголовок — переключатель.</b> Шапка не меняется. Заголовок страницы получает шевроном, как «Сентябрь 2026 ⌄» в календаре: нажали — выбрали другой раздел. «Три полоски» тоже работают и отмечают текущий раздел." },
    { id: "crumbs", n: "Крошки", d: "<b>5. Крошки над заголовком.</b> Шапка не меняется. Над заголовком строка «Руководитель › Клиника ⌄» из компонента Breadcrumbs: видно роль и раздел, по нажатию — выбор раздела." },
  ];

  const S = { v: "btn", role: "head", page: "overview" };
  (() => { // состояние из адреса: #btn/clinic/head
    const [v, p, r] = location.hash.slice(1).split("/");
    if (VARIANTS.some((x) => x.id === v)) S.v = v;
    if (ROLES[r]) S.role = r;
    if (PAGES[p] && ROLES[S.role].pages.includes(p)) S.page = p;
  })();
  const pages = () => ROLES[S.role].pages;
  const cur = () => PAGES[S.page];
  const sync = () => history.replaceState(null, "", `#${S.v}/${S.page}/${S.role}`);

  /* ---------- шапка ---------- */
  const userHTML = () => `
    <button class="user" id="userBtn" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Иванов Иван Иванович, роль ${ROLES[S.role].t}. Сменить роль">
      <span class="user__ava"><img src="assets/user.png" alt=""></span>
      <span class="user__txt"><span class="user__name">Иванов Иван Иванович</span>
      <span class="user__role">${ROLES[S.role].t} <span class="user__chev">${ic("chev", "ic--sm")}</span></span></span>
    </button>`;
  const menuBtn = () => `<button class="ibtn ibtn--menu" data-nav type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Разделы">${ic("menu")}</button>`;
  const navBtn = (cls) => `<button class="navbtn ${cls}" data-nav type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Раздел: ${cur().t}. Выбрать другой раздел">${ic(cur().i)}<span>${cur().t}</span>${ic("chev")}</button>`;

  function renderHeader() {
    const v = S.v;
    let logoExtra = "", mid = "", right = "";
    if (v === "logo") logoExtra = `<div class="crumb-sw"><span class="crumb-sw__line"></span><button class="crumb-sw__btn" data-nav type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Раздел: ${cur().t}. Выбрать другой раздел">${ic(cur().i)}<span>${cur().t}</span>${ic("chev")}</button></div>`;
    if (v === "tabs") mid = `<nav class="tabs" aria-label="Разделы"><span class="tabs__ind"></span>${pages().map((k) => `<button class="tabs__b${k === S.page ? " is-current" : ""}" data-go="${k}" type="button" ${k === S.page ? 'aria-current="page"' : ""} title="${PAGES[k].t}">${ic(PAGES[k].i)}<span class="tabs__t">${PAGES[k].t}</span></button>`).join("")}</nav>`;
    if (v === "btn") mid = navBtn("navbtn--m");
    right = userHTML()
      + (v === "btn" ? navBtn("navbtn--d") : "")
      + (["asis", "title", "crumbs"].includes(v) ? menuBtn() : "")
      + `<button class="ibtn ibtn--sun" type="button" aria-label="Тема">${ic("sun")}</button>`
      + `<button class="ibtn" type="button" aria-label="Уведомления">${ic("bell")}<span class="ibtn__dot"></span></button>`;
    $("#hd").innerHTML = `
      <div class="hd__logo"><a href="#" data-go="${pages()[0]}" aria-label="МИСТРИ, на главную"><img src="assets/logo.svg" alt="МИСТРИ"></a>${logoExtra}</div>
      <div class="hd__mid">${mid}</div>
      <div class="hd__right">${right}</div>`;
    placeTabs();
  }
  function placeTabs() {
    const t = $(".tabs"); if (!t) return;
    const b = $(".tabs__b.is-current", t), ind = $(".tabs__ind", t);
    if (!b) return;
    ind.style.width = b.offsetWidth + "px";
    ind.style.transform = `translateX(${b.offsetLeft}px)`;
    if (mobile()) b.scrollIntoView({ block: "nearest", inline: "center" });
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
  const list = (title, n, rows) => `<section class="card"><div class="card__h"><h2>${title} <span class="count">${n}</span></h2></div>
    <div>${rows.map(([a, b, s, c]) => `<div class="list__row"><div class="list__main"><b>${a}</b><span>${b}</span></div><span class="st ${c || ""}">${s}</span></div>`).join("")}</div></section>`;
  const stats = (arr) => `<div class="grid">${arr.map(([a, b, c]) => `<section class="card stat"><span>${a}</span><b>${b}</b><em>${c}</em></section>`).join("")}</div>`;

  const CONTENT = {
    overview: () => search("Поиск по ФИО, телефону, полису или СНИЛС") + calendar(),
    workplace: () => search("Поиск по ФИО, телефону, полису или СНИЛС") + calendar(),
    booking: () => search("Поиск пациента по ФИО, телефону или полису") + calendar(),
    clinic: () => stats([["Сотрудники", "20", "4 требуют внимания"], ["Кабинеты", "6", "все активны"], ["Услуги", "9", "+2 за месяц"]])
      + list("Сотрудники", 20, [["Кузнецова Елена Андреевна", "Врач-невролог · Неврология", "Активна"], ["Лебедева Ирина Павловна", "Врач клинической лабораторной диагностики", "Истекает сертификат", "st--warn"], ["Орлова Анна Викторовна", "Врач-терапевт · Терапия", "Активна"], ["Антонова Юлия Сергеевна", "Администратор регистратуры", "Отрицательные отзывы", "st--bad"]]),
    spec: () => search("Поиск специальности") + list("Специальности", 12, [["Терапия", "4 врача · 6 услуг", "Активна"], ["Неврология", "2 врача · 3 услуги", "Активна"], ["Кардиология", "1 врач · 2 услуги", "Нет графика", "st--warn"], ["Клиническая лабораторная диагностика", "3 сотрудника · 14 услуг", "Активна"], ["Функциональная диагностика", "Нет врачей", "Не настроена", "st--bad"]]),
    growth: () => stats([["Идей предложено", "48", "+6 за неделю"], ["В работе", "7", "2 выйдут в сентябре"], ["Ваших голосов", "12", "осталось 3"]])
      + `<section class="card"><div class="card__h"><h2>Активность по месяцам</h2></div><div class="card__b"><div class="bars">${[40, 55, 35, 70, 62, 80, 58, 90, 76, 100, 84, 96].map((h) => `<i style="height:${h}%"></i>`).join("")}</div></div></section>`,
    patients: () => search("Поиск по ФИО, телефону, полису или СНИЛС") + list("Пациенты", 1284, [["Смирнов Алексей Петрович", "12.03.1984 · полис 7755 0000 1234 5678", "Записан на 10:30"], ["Петрова Мария Игоревна", "02.11.1991 · полис 7755 0000 8765 4321", "Ожидает", "st--warn"], ["Ковалёв Дмитрий Олегович", "27.06.1976 · полис 7755 0000 1111 2222", "Без записи"]]),
    protocols: () => search("Поиск протокола") + list("Протоколы", 36, [["Первичный приём терапевта", "Шаблон · обновлён 01.08.2026", "Активен"], ["Повторный приём невролога", "Шаблон · обновлён 12.07.2026", "Активен"], ["Осмотр Смирнова А. П.", "Черновик · 9 августа, 10:42", "Не подписан", "st--warn"]]),
  };

  function renderPage(anim) {
    const p = cur(), v = S.v;
    let h1 = `<h1>${p.t}</h1>`;
    if (v === "title") h1 = `<h1><button class="title-sw" data-nav type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Раздел: ${p.t}. Выбрать другой раздел">${p.t}${ic("chev")}</button></h1>`;
    const bc = v === "crumbs" ? `<nav class="bc" aria-label="Вы здесь"><span>${ROLES[S.role].t}</span><span class="bc__sep">›</span><button class="bc__sw" data-nav type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Раздел: ${p.t}. Выбрать другой раздел">${ic(p.i, "ic--sm")}<span>${p.t}</span>${ic("chev", "ic--sm")}</button></nav>` : "";
    const el = $("#page");
    el.innerHTML = `<div class="ttl">${bc}${h1}<p>${p.sub}</p></div>${CONTENT[S.page]()}`;
    if (anim) { el.classList.remove("is-enter"); void el.offsetWidth; el.classList.add("is-enter"); }
    document.title = `${p.t} — МИСТРИ`;
  }

  function render(anim) {
    closePop();
    renderHeader();
    renderPage(anim);
    $$("#variants button").forEach((b) => b.classList.toggle("is-on", b.dataset.v === S.v));
    $("#desc").innerHTML = VARIANTS.find((x) => x.id === S.v).d;
    sync();
  }

  function go(page) {
    if (page === S.page) { closePop(); return; }
    S.page = page;
    render(true);
    test.onNav();
    const f = $("[data-nav]:not([hidden])") || $(".tabs__b.is-current");
    if (f && f.offsetParent) f.focus({ preventScroll: true });
  }

  /* ---------- поповеры ---------- */
  let pop = null, popTrig = null, scrim = null;
  function closePop(focus) {
    if (!pop) return;
    pop.remove(); pop = null;
    if (scrim) { scrim.remove(); scrim = null; }
    if (popTrig) { popTrig.setAttribute("aria-expanded", "false"); if (focus) popTrig.focus(); }
    popTrig = null;
  }
  function placeAt(trig, el, align) {
    const r = trig.getBoundingClientRect();
    const top = r.bottom + scrollY + 8;
    el.style.top = top + "px";
    if (align === "right") el.style.left = Math.max(8, r.right + scrollX - el.offsetWidth) + "px";
    else el.style.left = Math.max(8, Math.min(r.left + scrollX, innerWidth - el.offsetWidth - 8)) + "px";
  }
  function openNav(trig, kb) {
    if (popTrig === trig) { closePop(true); return; }
    closePop();
    const asis = S.v === "asis";
    pop = document.createElement("div");
    pop.className = `pop ${asis ? "pop--asis" : "pop--nav"} pop--sheet is-open`;
    pop.setAttribute("role", "menu");
    pop.innerHTML = (asis ? "" : `<div class="pop__label">Разделы · ${ROLES[S.role].t}</div>`)
      + pages().map((k) => `<button class="pop__item${k === S.page ? " is-current" : ""}" role="menuitem" data-go="${k}" type="button" ${k === S.page && !asis ? 'aria-current="page"' : ""}>${ic(PAGES[k].i)}<span>${PAGES[k].t}</span>${ic("check", "ic--check")}</button>`).join("");
    document.body.appendChild(pop);
    if (mobile()) { scrim = document.createElement("div"); scrim.className = "scrim"; scrim.onclick = () => closePop(true); document.body.appendChild(scrim); }
    else placeAt(trig, pop, trig.closest(".hd__right") ? "right" : "left");
    popTrig = trig; trig.setAttribute("aria-expanded", "true");
    if (kb) ($(".pop__item.is-current", pop) || $(".pop__item", pop)).focus();
  }
  function openRole(trig, kb) {
    if (popTrig === trig) { closePop(true); return; }
    closePop();
    pop = document.createElement("div");
    pop.className = "pop pop--role is-open";
    pop.setAttribute("role", "menu");
    pop.innerHTML = `<div class="role-head"><span class="user__ava"><img src="assets/user.png" alt=""></span><span><span class="user__name">Иванов Иван Иванович</span><span class="user__role">${ROLES[S.role].t} ${ic("chev", "ic--sm")}</span></span></div>
      <div class="role-list">${Object.entries(ROLES).map(([k, r]) => `<button class="pop__item${k === S.role ? " is-current" : ""}" role="menuitemradio" aria-checked="${k === S.role}" data-role="${k}" type="button">${ic(r.i)}<span>${r.t}<span class="pop__sub">${r.d}</span></span>${ic("check", "ic--check")}</button>`).join("")}</div>
      <div class="role-foot"><button class="pop__item" type="button" role="menuitem">${ic("clinic")}<span>Сменить мед. организацию<span class="pop__sub">БЗ-МЕД</span></span></button></div>
      <div class="role-foot"><button class="pop__item" type="button" role="menuitem">${ic("plus")}<span>Добавить роль</span></button><button class="pop__item" type="button" role="menuitem">${ic("logout")}<span>Выйти</span></button></div>`;
    $(".role-head .user__role .ic", pop).style.transform = "rotate(180deg)";
    document.body.appendChild(pop);
    const r = trig.getBoundingClientRect();
    pop.style.top = r.top + scrollY - 16 + "px";
    pop.style.left = Math.max(8, Math.min(r.left + scrollX - 16, innerWidth - pop.offsetWidth - 8)) + "px";
    popTrig = trig; trig.setAttribute("aria-expanded", "true");
    if (kb) $(".pop__item.is-current", pop).focus();
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    const nav = t.closest("[data-nav]"); if (nav) { e.preventDefault(); hideCoach(); openNav(nav, e.detail === 0); return; }
    if (t.closest("#userBtn")) { openRole(t.closest("#userBtn"), e.detail === 0); return; }
    const g = t.closest("[data-go]"); if (g) { e.preventDefault(); hideCoach(); go(g.dataset.go); return; }
    const r = t.closest("[data-role]");
    if (r) {
      if (r.dataset.role !== S.role) { S.role = r.dataset.role; S.page = pages()[0]; render(true); toast(`Роль: ${ROLES[S.role].t}. Разделы обновились`); test.onNav(); }
      else closePop(true);
      return;
    }
    if (pop && !t.closest(".pop")) closePop();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (pop) closePop(true); hideCoach(); }
    if (!pop || !["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const items = $$(".pop__item", pop), i = items.indexOf(document.activeElement);
    e.preventDefault();
    const n = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[n].focus();
  });
  // вкладки: стрелки влево/вправо
  document.addEventListener("keydown", (e) => {
    const b = e.target.closest && e.target.closest(".tabs__b"); if (!b || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const all = $$(".tabs__b"), i = all.indexOf(b);
    all[(i + (e.key === "ArrowRight" ? 1 : -1) + all.length) % all.length].focus();
  });
  addEventListener("resize", () => { placeTabs(); if (pop && !mobile() && popTrig) closePop(); });

  /* ---------- первый вход: подсказка ---------- */
  let coach = null, ring = null;
  function hideCoach() { coach?.remove(); ring?.remove(); coach = ring = null; }
  function showCoach() {
    hideCoach(); closePop();
    const target = $$("[data-nav], .tabs").find((el) => el.offsetParent);
    if (!target) return;
    target.scrollIntoView({ block: "nearest" });
    const r = target.getBoundingClientRect();
    const others = pages().filter((k) => k !== S.page).map((k) => `«${PAGES[k].t}»`).join(", ");
    ring = document.createElement("div"); ring.className = "coach-ring";
    Object.assign(ring.style, { left: r.left + scrollX - 4 + "px", top: r.top + scrollY - 4 + "px", width: r.width + 8 + "px", height: r.height + 8 + "px", borderRadius: getComputedStyle(target).borderRadius });
    coach = document.createElement("div"); coach.className = "coach"; coach.setAttribute("role", "dialog");
    coach.innerHTML = `<span class="coach__arr"></span><b>Вы в разделе «${cur().t}»</b>Здесь можно перейти в другие разделы: ${others}.<br><button class="coach__ok" type="button">Понятно</button>`;
    document.body.append(ring, coach);
    const w = coach.offsetWidth;
    const left = Math.max(16, Math.min(r.left + scrollX + r.width / 2 - w / 2, innerWidth - w - 16));
    coach.style.left = left + "px"; coach.style.top = r.bottom + scrollY + 14 + "px";
    $(".coach__arr", coach).style.left = Math.max(16, Math.min(r.left + r.width / 2 - left - 6, w - 28)) + "px";
    $(".coach__ok", coach).onclick = hideCoach;
  }
  $("#firstRun").onclick = showCoach;

  /* ---------- коридорный тест ---------- */
  const KEY = "mistri-header-test";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch {} };
  const fmt = (ms) => (ms == null ? "—" : (ms / 1000).toFixed(1) + " с");
  const test = (() => {
    const box = $("#test"), body = $("#testBody");
    let run = null, tick = null;
    const TASKS = [
      { q: "Скажите вслух: в каком разделе вы сейчас находитесь?", manual: true, prep: () => { S.role = "head"; S.page = "clinic"; } },
      { q: "Перейдите в раздел «Специальности».", done: () => S.page === "spec", prep: () => { S.role = "head"; S.page = "overview"; } },
      { q: "Вернитесь на «Обзор».", done: () => S.page === "overview" },
      { q: "Вы врач. Откройте раздел «Протоколы».", done: () => S.role === "doc" && S.page === "protocols" },
    ];
    let clicks = 0;
    document.addEventListener("click", (e) => { if (run && !e.target.closest("#test, .demo")) clicks++; }, true);
    function start() {
      run = { v: S.v, step: 0, res: [] };
      step();
    }
    function step() {
      const t = TASKS[run.step];
      if (!t) return finish();
      if (t.prep) { t.prep(); render(false); }
      clicks = 0; run.t0 = performance.now();
      draw();
      clearInterval(tick); tick = setInterval(() => { const el = $("#tTime"); if (el) el.textContent = fmt(performance.now() - run.t0); }, 100);
    }
    function record(ok) {
      const t = TASKS[run.step];
      run.res.push({ ok, ms: Math.round(performance.now() - run.t0), clicks: t.manual ? 0 : clicks });
      run.step++; step();
    }
    function finish() {
      clearInterval(tick);
      const all = load(); all.push({ v: run.v, at: Date.now(), res: run.res }); save(all);
      run = null; draw();
    }
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
          <b>4 задания: понять, где ты, перейти в раздел, вернуться, сменить роль.</b></div>
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
        <p class="test__meta">Время: <span id="tTime">0.0 с</span>${t.manual ? " · отметьте ответ" : " · засчитается само, когда откроется нужный раздел"}</p>
        <div class="test__row">${t.manual ? `<button class="pri" data-ok="1" type="button">Ответил верно</button><button data-ok="0" type="button">Ошибся</button>` : `<button data-ok="0" type="button">Не справился</button>`}</div>`;
      $$("[data-ok]", body).forEach((b) => (b.onclick = () => record(b.dataset.ok === "1")));
    }
    function onNav() { if (run && TASKS[run.step].done?.()) record(true); }
    function open() { box.classList.add("is-open"); box.setAttribute("aria-hidden", "false"); draw(); }
    function close() { box.classList.remove("is-open"); box.setAttribute("aria-hidden", "true"); clearInterval(tick); run = null; }
    $("#testBtn").onclick = () => (box.classList.contains("is-open") ? close() : open());
    $("#testClose").onclick = close;
    return { onNav, redraw: () => box.classList.contains("is-open") && !run && draw() };
  })();

  /* ---------- тост ---------- */
  let tt;
  function toast(s) { const t = $("#toast"); t.textContent = s; t.classList.add("is-on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("is-on"), 2200); }

  /* ---------- панель вариантов ---------- */
  $("#variants").innerHTML = VARIANTS.map((v, i) => `<button type="button" data-v="${v.id}">${i ? `<small>${i}</small>` : ""}${v.n}</button>`).join("");
  $$("#variants button").forEach((b) => (b.onclick = () => { S.v = b.dataset.v; hideCoach(); render(false); test.redraw(); }));

  addEventListener("hashchange", () => {
    const [v, p, r] = location.hash.slice(1).split("/");
    if (VARIANTS.some((x) => x.id === v)) S.v = v;
    if (ROLES[r]) S.role = r;
    S.page = PAGES[p] && pages().includes(p) ? p : pages()[0];
    hideCoach(); render(false);
  });
  render(false);
  document.fonts?.ready.then(placeTabs);
})();
