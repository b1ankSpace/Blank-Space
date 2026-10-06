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

const introSeen = document.documentElement.classList.contains("intro-seen");
try {
  sessionStorage.setItem("bs-intro", "1");
} catch {}

if (!reduceMotion && !introSeen && loader) {
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

/* ——— headings split into words that rise from under a mask ——— */
if (!reduceMotion) {
  document.querySelectorAll("main h2").forEach((h2) => {
    const words = h2.textContent.trim().split(/\s+/);
    h2.setAttribute("aria-label", words.join(" "));
    h2.innerHTML = words
      .map((word, i) => `<span class="w" aria-hidden="true"><span style="--wi: ${i}">${word}</span></span>`)
      .join(" ");
  });
}

/* ——— gold rules under each section ——— */
const rules = [...document.querySelectorAll("main > section")].map((section) => {
  const rule = document.createElement("div");
  rule.className = "rule";
  rule.setAttribute("aria-hidden", "true");
  section.append(rule);
  return rule;
});

/* ——— numbers flick through digits like a departure board ——— */
const scramble = (el, delay) => {
  if (!el) return;
  el.dataset.final ??= el.textContent;
  const final = el.dataset.final;
  window.setTimeout(() => {
    let frame = 0;
    const tick = window.setInterval(() => {
      frame += 1;
      if (frame > 10) {
        window.clearInterval(tick);
        el.textContent = final;
        return;
      }
      el.textContent = [...final].map((ch, i) => (frame > 6 + i * 2 ? ch : String(Math.floor(Math.random() * 10)))).join("");
    }, 48);
  }, delay);
};

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
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  reveals.forEach((el) => {
    if (el.closest(".service-list") || el.closest(".steps")) return;
    io.observe(el);
  });

  const ruleIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        ruleIo.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px" }
  );
  rules.forEach((rule) => ruleIo.observe(rule));

  const observeStagger = (section, items) => {
    if (!section || !items.length) return;
    const sectionIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          items.forEach((item) => {
            item.classList.add("is-in");
            const num = item.querySelector(".num");
            const delay = parseFloat(getComputedStyle(num).animationDelay) || 0;
            scramble(num, delay * 1000);
          });
          sectionIo.unobserve(section);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );
    sectionIo.observe(section);
  };

  observeStagger(document.querySelector("#services"), serviceItems);
  observeStagger(document.querySelector("#method"), stepItems);
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
  rules.forEach((rule) => rule.classList.add("is-in"));
}

if (parallax && !reduceMotion) {
  const onScroll = () => {
    const y = window.scrollY;
    const shift = Math.min(y * 0.18, 70);
    const scale = 1 - Math.min(y / 2400, 0.08);
    parallax.style.transform = `translate3d(0, ${shift}px, 0) scale(${scale})`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ——— ticker eases down under the pointer ——— */
const ticker = document.querySelector(".ticker");
const tickerAnim = ticker?.querySelector(".ticker-track")?.getAnimations?.()[0];

if (ticker && tickerAnim && finePointer && !reduceMotion) {
  let rate = 1;
  let target = 1;
  let raf = 0;

  const ease = () => {
    rate += (target - rate) * 0.06;
    if (Math.abs(target - rate) < 0.005) rate = target;
    tickerAnim.playbackRate = rate;
    raf = rate === target ? 0 : requestAnimationFrame(ease);
  };

  const slowTo = (value) => {
    target = value;
    if (!raf) raf = requestAnimationFrame(ease);
  };

  ticker.addEventListener("pointerenter", () => slowTo(0.18));
  ticker.addEventListener("pointerleave", () => slowTo(1));
}

/* ——— footer wordmark fills as the page runs out ——— */
const footGiant = document.querySelector("[data-foot-giant]");

if (footGiant) {
  if (reduceMotion) {
    footGiant.style.setProperty("--fill", "1");
  } else {
    let pending = false;
    const fillGiant = () => {
      pending = false;
      const remaining = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      const span = footGiant.offsetHeight * 2.4;
      const fill = 1 - Math.min(Math.max(remaining / span, 0), 1);
      footGiant.style.setProperty("--fill", fill.toFixed(3));
    };
    window.addEventListener(
      "scroll",
      () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(fillGiant);
      },
      { passive: true }
    );
    window.addEventListener("resize", fillGiant);
    fillGiant();
  }
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

// Letters land one by one; screen readers get the plain phrase.
const renderToneTitle = (text) => {
  let ci = 0;
  const words = text.split(" ").map(
    (word) =>
      `<span class="tw">${[...word].map((ch) => `<span class="ch" style="--ci: ${ci++}">${ch}</span>`).join("")}</span>`
  );
  toneTitle.innerHTML = `<span class="sr-only">${text}</span><span aria-hidden="true">${words.join(" ")}</span>`;
};

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
  if (instant || reduceMotion) toneTitle.textContent = tone.title;
  else renderToneTitle(tone.title);
  toneCopy.textContent = tone.copy;
  if (toneContent) toneContent.dataset.mode = key;

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
const briefBack = document.querySelector("[data-brief-back]");
const briefPreview = document.querySelector("[data-brief-preview]");

const briefText = () =>
  [
    "Заявка в blank space",
    `Имя: ${brief.name || "—"}`,
    `Нужно: ${brief.need || "—"}`,
    `Срок: ${brief.when || "—"}`,
    "",
    brief.note || "Без дополнительного описания",
  ].join("\n");

const updatePreview = () => {
  if (!briefPreview) return;
  brief.note = (briefNote?.value || "").trim();
  briefPreview.textContent = briefText();
};

briefNote?.addEventListener("input", updatePreview);

const showBriefStep = (step) => {
  brief.step = step;
  briefPanels.forEach((panel) => {
    const active = Number(panel.dataset.briefPanel) === step;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  if (briefLabel) briefLabel.textContent = `шаг ${step + 1} из 4`;
  if (briefBar) briefBar.style.width = `${((step + 1) / 4) * 100}%`;
  if (briefBack) briefBack.hidden = step === 0;
  if (step === 3) updatePreview();
};

briefBack?.addEventListener("click", () => {
  if (brief.step > 0) showBriefStep(brief.step - 1);
});

document.querySelectorAll("[data-brief-opt]").forEach((btn) => {
  btn.addEventListener("pointerdown", (event) => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--x", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--y", `${event.clientY - rect.top}px`);
  });

  btn.addEventListener("click", () => {
    const key = btn.dataset.briefOpt;
    const value = btn.dataset.value;
    brief[key] = value;

    btn.parentElement.querySelectorAll("button").forEach((b) => b.classList.remove("is-picked"));
    btn.classList.add("is-picked");

    window.setTimeout(() => {
      if (key === "need") showBriefStep(1);
      if (key === "when") showBriefStep(2);
    }, reduceMotion ? 180 : 420);
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

  const text = briefText();

  // Start the copy and open Telegram in the same tick as the tap:
  // after an await, iOS Safari treats window.open as a blocked popup.
  const copied = navigator.clipboard?.writeText(text) ?? Promise.reject();
  const url = `https://t.me/dmprnk?text=${encodeURIComponent(text)}`;
  const win = window.open(url, "_blank");
  if (win) win.opener = null;
  else window.location.href = url;

  try {
    await copied;
    if (briefOk) briefOk.hidden = false;
  } catch {
    if (briefOk) {
      briefOk.textContent = "Если Telegram открылся пустым — напишите нам @dmprnk.";
      briefOk.hidden = false;
    }
  }
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
      "Начинаем не с макета, а со смысла. Зачем бренд выходит в digital и какое ощущение должен оставить.",
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
const detailClose = document.querySelector("[data-detail-close]");

let detailKey = "";
let detailReturnFocus = null;

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
  if (!wasOpen) detailReturnFocus = originEl || document.activeElement;

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
  detailClose?.focus({ preventScroll: true });
};

const closeDetail = () => {
  if (!detailCard || !detailVeil) return;
  detailKey = "";
  detailCard.classList.remove("is-on");
  detailVeil.classList.remove("is-on");
  detailTriggers.forEach((el) => el.setAttribute("aria-expanded", "false"));
  detailReturnFocus?.focus({ preventScroll: true });
  detailReturnFocus = null;
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
detailClose?.addEventListener("click", closeDetail);

window.addEventListener("keydown", (event) => {
  if (!detailCard?.classList.contains("is-on")) return;
  if (event.key === "Escape") closeDetail();
  // The close button is the only focusable thing in the card, so keep Tab on it.
  if (event.key === "Tab") {
    event.preventDefault();
    detailClose?.focus();
  }
});
