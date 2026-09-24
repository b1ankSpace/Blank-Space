const page = document.querySelector("[data-page]");
const loader = document.querySelector("[data-loader]");
const parallax = document.querySelector("[data-parallax]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
});

/* ——— loader ——— */
let loaderDone = false;
const heroLogo = document.querySelector(".hero-logo");
const loaderLetters = document.querySelectorAll(".loader-letter");

const revealHero = () => {
  heroLogo?.classList.add("is-ready");
};

const finishLoader = () => {
  if (loaderDone || !loader) return;
  loaderDone = true;

  loader.classList.add("is-assembled");
  void loader.offsetWidth;
  loader.classList.add("is-burst");
  revealHero();
  window.setTimeout(() => loader.classList.add("is-done"), 100);
  window.setTimeout(() => loader.remove(), 1900);
};

if (!reduceMotion && loader) {
  const lastLetter = loaderLetters[loaderLetters.length - 1];
  let armed = false;

  const armBurst = () => {
    if (armed) return;
    armed = true;
    window.setTimeout(finishLoader, 120);
  };

  if (lastLetter) {
    lastLetter.addEventListener(
      "animationend",
      (event) => {
        if (event.animationName !== "letterIn") return;
        armBurst();
      },
      { once: true }
    );
  }

  window.addEventListener("load", () => {
    window.setTimeout(armBurst, 2100);
  });
  window.setTimeout(armBurst, 3200);
} else {
  if (loader) loader.remove();
  revealHero();
}

/* ——— magnetic buttons ——— */
if (finePointer && !reduceMotion) {
  const magnets = document.querySelectorAll(
    ".btn, .btn-text, .tone-btn, .brief-options button, .mail, .channel a, .foot a"
  );

  magnets.forEach((el) => {
    el.classList.add("is-magnetic");

    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.28}px, ${y * 0.34}px)`;
    });

    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

/* ——— reveal + parallax ——— */
const reveals = document.querySelectorAll("[data-reveal]");
const serviceItems = document.querySelectorAll(".service-list [data-reveal]");
const stepItems = document.querySelectorAll(".steps [data-reveal]");

if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { root: page, threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  reveals.forEach((el) => {
    if (el.closest(".service-list") || el.closest(".steps")) return;
    io.observe(el);
  });

  const observeStagger = (section, items) => {
    if (!section || !items.length) return;
    const sectionIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          items.forEach((item) => item.classList.add("is-in"));
          sectionIo.unobserve(section);
        });
      },
      { root: page, threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );
    sectionIo.observe(section);
  };

  observeStagger(document.querySelector("#services"), serviceItems);
  observeStagger(document.querySelector("#method"), stepItems);
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

if (parallax && !reduceMotion) {
  const onScroll = () => {
    const y = page.scrollTop;
    const shift = Math.min(y * 0.18, 70);
    const scale = 1 - Math.min(y / 2400, 0.08);
    parallax.style.transform = `translate3d(0, ${shift}px, 0) scale(${scale})`;
  };
  page.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ——— tone moodboard ——— */
const tones = {
  cafe: {
    eyebrow: "кофейня",
    title: "утро без спешки",
    copy: "Тёплый свет, зерно, спокойный ритм. Сайт и лента звучат как место, куда возвращаются.",
  },
  clinic: {
    eyebrow: "клиника",
    title: "ясность и доверие",
    copy: "Чистый воздух, аккуратные акценты. Digital-присутствие, которое успокаивает ещё до визита.",
  },
  fashion: {
    eyebrow: "fashion",
    title: "тихий статус",
    copy: "Воздух, контраст, характер. Кадр и типографика держат бренд без лишнего шума.",
  },
  studio: {
    eyebrow: "студия",
    title: "пространство формы",
    copy: "Тёмный фон, золото, воздух. Так выглядит blank space — и так собираем чужие бренды.",
  },
};

const toneStage = document.querySelector("[data-tone-stage]");
const toneContent = document.querySelector("[data-tone-content]");
const toneEyebrow = document.querySelector("[data-tone-eyebrow]");
const toneTitle = document.querySelector("[data-tone-title]");
const toneCopy = document.querySelector("[data-tone-copy]");
const toneBtns = document.querySelectorAll("[data-tone-btn]");
const toneBgs = document.querySelectorAll("[data-tone-bg]");

let currentTone = "";
let toneHoverTimer = 0;
let toneToken = 0;

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const setTone = async (key, { instant = false } = {}) => {
  const tone = tones[key];
  if (!tone || !toneStage || key === currentTone) return;

  const token = ++toneToken;
  currentTone = key;

  toneBtns.forEach((btn) => {
    const active = btn.dataset.toneBtn === key;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  toneBgs.forEach((bg) => {
    bg.classList.toggle("is-on", bg.dataset.toneBg === key);
  });
  toneStage.dataset.mode = key;

  if (!instant && !reduceMotion && toneContent) {
    toneContent.classList.add("is-out");
    await wait(220);
    if (token !== toneToken) return;
  }

  if (token !== toneToken) return;

  toneEyebrow.textContent = tone.eyebrow;
  toneTitle.textContent = tone.title;
  toneCopy.textContent = tone.copy;

  if (!instant && !reduceMotion && toneContent) {
    void toneContent.offsetWidth;
    toneContent.classList.remove("is-out");
  }
};

toneBtns.forEach((btn) => {
  const key = btn.dataset.toneBtn;

  const apply = () => {
    window.clearTimeout(toneHoverTimer);
    setTone(key);
  };

  btn.addEventListener("click", apply);

  btn.addEventListener("pointerenter", () => {
    if (!finePointer) return;
    window.clearTimeout(toneHoverTimer);
    toneHoverTimer = window.setTimeout(apply, 60);
  });

  btn.addEventListener("focus", apply);
});

setTone("cafe", { instant: true });

/* ——— interactive brief ——— */
const brief = {
  need: "",
  when: "",
  name: "",
  note: "",
  step: 0,
};

const briefLabel = document.querySelector("[data-brief-label]");
const briefBar = document.querySelector("[data-brief-bar]");
const briefPanels = document.querySelectorAll("[data-brief-panel]");
const briefName = document.querySelector("[data-brief-name]");
const briefNote = document.querySelector("[data-brief-note]");
const briefOk = document.querySelector("[data-ok]");

const showBriefStep = (step) => {
  brief.step = step;
  briefPanels.forEach((panel) => {
    const active = Number(panel.dataset.briefPanel) === step;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  if (briefLabel) briefLabel.textContent = `шаг ${step + 1} из 4`;
  if (briefBar) briefBar.style.width = `${((step + 1) / 4) * 100}%`;
};

document.querySelectorAll("[data-brief-opt]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.briefOpt;
    const value = btn.dataset.value;
    brief[key] = value;

    btn.parentElement.querySelectorAll("button").forEach((b) => b.classList.remove("is-picked"));
    btn.classList.add("is-picked");

    window.setTimeout(() => {
      if (key === "need") showBriefStep(1);
      if (key === "when") showBriefStep(2);
    }, 180);
  });
});

document.querySelector("[data-brief-next]")?.addEventListener("click", () => {
  const name = (briefName?.value || "").trim();
  if (!name) {
    briefName?.focus();
    return;
  }
  brief.name = name;
  showBriefStep(3);
});

document.querySelector("[data-brief-send]")?.addEventListener("click", async () => {
  brief.note = (briefNote?.value || "").trim();
  if (!brief.name) brief.name = (briefName?.value || "").trim();

  const text = [
    "Заявка в blank space",
    `Имя: ${brief.name || "—"}`,
    `Нужно: ${brief.need || "—"}`,
    `Срок: ${brief.when || "—"}`,
    "",
    brief.note || "Без дополнительного описания",
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    if (briefOk) briefOk.hidden = false;
  } catch {
    if (briefOk) {
      briefOk.textContent = "Сейчас откроется Telegram — вставьте текст вручную.";
      briefOk.hidden = false;
    }
  }

  window.open(
    `https://t.me/dmprnk?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener"
  );
});

showBriefStep(0);

/* ——— detail cards ——— */
const detailMap = {
  "service-sites": {
    kicker: "услуга · 01",
    title: "Сайты",
    body: [
      "Собираем digital-витрину, через которую бизнес сразу читается: кто вы, зачем вы и куда написать.",
      "От одностраничника до продуктовой страницы — без лишнего шума и шаблонной структуры.",
    ],
    points: [
      "структура и сценарий первого экрана",
      "дизайн и вёрстка под ваш тон",
      "адаптив, скорость, понятный контакт",
      "базовая SEO-логика и передача материалов",
    ],
  },
  "service-smm": {
    kicker: "услуга · 02",
    title: "SMM",
    body: [
      "Соцсети продолжают сайт, а не живут своей жизнью. Одна система: визуал, ритм, голос.",
      "Настраиваем присутствие так, чтобы лента усиливала бренд, а не просто «закрывала контент-план».",
    ],
    points: [
      "логика каналов и рубрик",
      "визуальная система под бренд",
      "регулярность без выгорания формата",
      "связка постов с сайтом и заявками",
    ],
  },
  "service-content": {
    kicker: "услуга · 03",
    title: "Контент",
    body: [
      "Тексты и сценарии, которые держат характер бренда от hero до последнего поста.",
      "Не «наполнить страницы», а собрать голос: как говорить, что обещать, где молчать.",
    ],
    points: [
      "тональность и ключевые формулировки",
      "тексты сайта и посадочных",
      "сценарии для роликов и рилсов",
      "редактура под единый стиль",
    ],
  },
  "service-media": {
    kicker: "услуга · 04",
    title: "Фото / видео",
    body: [
      "Съёмка и визуальный ряд под ту же систему, что сайт и SMM.",
      "Картинка собирает образ: свет, кадр, ритм — чтобы материалы не выглядели чужими друг другу.",
    ],
    points: [
      "фото и видео под бренд",
      "подбор локаций и референсов",
      "обработка в одной палитре",
      "нарезка под сайт, ленту и stories",
    ],
  },
  "method-space": {
    kicker: "подход · 01",
    title: "Пространство",
    body: [
      "Начинаем не с макета, а с смысла. Зачем бренд выходит в digital и какое ощущение должен оставить.",
      "Слушаем задачу, пока не станет ясно пространство: аудитория, контекст, ограничения, цель.",
    ],
    points: [
      "разбор бизнеса и запроса",
      "что уже есть и чего не хватает",
      "рамка проекта и приоритеты",
      "понятный следующий шаг",
    ],
  },
  "method-voice": {
    kicker: "подход · 02",
    title: "Голос",
    body: [
      "Собираем характер бренда: как говорить, как выглядеть, чем отличаться без крика.",
      "Голос — это и текст, и визуал, и ритм. Он должен узнаваться в каждом касании.",
    ],
    points: [
      "тональность и ключевые слова",
      "визуальные ориентиры",
      "что «похоже на вас», а что нет",
      "единый характер для всех каналов",
    ],
  },
  "method-craft": {
    kicker: "подход · 03",
    title: "Производство",
    body: [
      "Сайт, контент, SMM, фото и видео собираются в одной системе — не разными подрядчиками вразнобой.",
      "Производство идёт параллельно там, где это усиливает цельность, а не ломает сроки.",
    ],
    points: [
      "дизайн и разработка",
      "контент и медиа под тот же тон",
      "согласованные форматы",
      "проверка на одном «дыхании» бренда",
    ],
  },
  "method-presence": {
    kicker: "подход · 04",
    title: "Присутствие",
    body: [
      "Запускаем цельный образ. Бизнес становится видимым — с нуля и без разрозненных кусков.",
      "После запуска остаётся система, которой можно жить: сайт, каналы, материалы, понятный контакт.",
    ],
    points: [
      "запуск и связка каналов",
      "передача доступов и гайдов",
      "что поддерживать дальше",
      "точка входа к следующим задачам",
    ],
  },
};

const detailCard = document.querySelector("[data-detail-card]");
const detailVeil = document.querySelector("[data-detail-veil]");
const detailKicker = document.querySelector("[data-detail-kicker]");
const detailTitle = document.querySelector("[data-detail-title]");
const detailBody = document.querySelector("[data-detail-body]");
const detailTriggers = document.querySelectorAll("[data-detail]");

let detailKey = "";

const renderDetail = (key) => {
  const data = detailMap[key];
  if (!data || !detailBody) return;

  detailKicker.textContent = data.kicker;
  detailTitle.textContent = data.title;
  detailBody.innerHTML = [
    ...data.body.map((p) => `<p>${p}</p>`),
    `<ul>${data.points.map((item) => `<li>${item}</li>`).join("")}</ul>`,
  ].join("");
};

const setDetailOrigin = (originEl) => {
  if (!detailCard || !originEl) return;
  const rect = originEl.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - window.innerWidth / 2;
  const dy = rect.top + rect.height / 2 - window.innerHeight / 2;
  detailCard.style.setProperty("--detail-dx", `${dx}px`);
  detailCard.style.setProperty("--detail-dy", `${dy}px`);
};

const openDetail = (key, originEl) => {
  if (!detailCard || !detailVeil || !detailMap[key]) return;

  const wasOpen = detailCard.classList.contains("is-on");

  if (key !== detailKey) {
    renderDetail(key);
    detailKey = key;
  }

  if (originEl) setDetailOrigin(originEl);

  detailCard.hidden = false;
  detailVeil.hidden = false;

  if (wasOpen) {
    detailCard.classList.remove("is-on");
    void detailCard.offsetWidth;
  } else {
    void detailCard.offsetWidth;
  }

  detailCard.classList.add("is-on");
  detailVeil.classList.add("is-on");
  detailTriggers.forEach((el) => {
    el.setAttribute("aria-expanded", String(el.dataset.detail === key));
  });
};

const closeDetail = () => {
  if (!detailCard || !detailVeil) return;
  detailKey = "";
  detailCard.classList.remove("is-on");
  detailVeil.classList.remove("is-on");
  detailTriggers.forEach((el) => el.setAttribute("aria-expanded", "false"));
  window.setTimeout(() => {
    if (detailCard.classList.contains("is-on")) return;
    detailCard.hidden = true;
    detailVeil.hidden = true;
  }, 650);
};

detailTriggers.forEach((el) => {
  const key = el.dataset.detail;

  el.addEventListener("click", () => {
    if (detailKey === key && detailCard?.classList.contains("is-on")) {
      setDetailOrigin(el);
      closeDetail();
      return;
    }
    openDetail(key, el);
  });

  el.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    el.click();
  });
});

detailVeil?.addEventListener("click", closeDetail);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && detailCard?.classList.contains("is-on")) {
    closeDetail();
  }
});
