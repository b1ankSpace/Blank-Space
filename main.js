const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-toggle]");
const menu = document.querySelector("[data-menu]");
const page = document.querySelector("[data-page]");
const form = document.querySelector("[data-form]");
const ok = document.querySelector("[data-ok]");

const setMenu = (open) => {
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  page.style.overflow = open ? "hidden" : "";
};

toggle.addEventListener("click", () => {
  setMenu(!nav.classList.contains("is-open"));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const text = `Заявка в blank space\nИмя: ${data.get("name")}\n\n${data.get("message")}`;

  try {
    await navigator.clipboard.writeText(text);
    ok.hidden = false;
  } catch {
    ok.textContent = "Сейчас откроется Telegram — напишите задачу в чат.";
    ok.hidden = false;
  }

  window.open("https://t.me/dmprnk", "_blank", "noopener");
});
