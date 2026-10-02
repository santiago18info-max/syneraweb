(function () {
  var WHATSAPP = "59897226657";
  var EMAIL = "synerasa.soporte@gmail.com";
  var root = document.documentElement;

  root.classList.add("js");
  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Modo claro / oscuro ----------
  var themeBtn = document.getElementById("themeToggle");
  function setThemeLabel() {
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }
  setThemeLabel();
  themeBtn.addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark";
    if (dark) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", "dark");
    try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch (e) {}
    setThemeLabel();
  });

  // ---------- Menú: fondo al scrollear ----------
  var nav = document.getElementById("nav");
  function updateNav() { nav.classList.toggle("is-scrolled", window.scrollY > 20); }
  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });

  // ---------- Menú mobile ----------
  var toggle = document.getElementById("menuToggle");
  var menu = document.getElementById("menu");
  function closeMenu() {
    menu.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") closeMenu(); });

  // ---------- Link activo según la sección visible ----------
  var links = Array.prototype.slice.call(menu.querySelectorAll("a"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".cat-tabs a"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function updateActive() {
    var pos = window.scrollY + 140;
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= pos) current = i; });
    var id = current >= 0 ? links[current].getAttribute("href") : null;
    links.forEach(function (a, i) { a.classList.toggle("is-active", i === current); });
    tabs.forEach(function (t) { t.classList.toggle("is-active", t.getAttribute("href") === id); });
  }
  updateActive();
  window.addEventListener("scroll", updateActive, { passive: true });

  // ---------- Aparición al scrollear ----------
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains("reveal"); });
      el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 0.08 + "s";
      observer.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // ---------- Filtro de demos por rubro ----------
  // Se puede abrir ya filtrado con ?rubro=iphone#web
  var rubroBar = document.getElementById("rubroFilter");
  if (rubroBar) {
    var rubroBtns = Array.prototype.slice.call(rubroBar.querySelectorAll("button"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("#web .project"));
    var rows = Array.prototype.slice.call(document.querySelectorAll("#web .plan-row"));

    function applyRubro(rubro) {
      rubroBtns.forEach(function (b) {
        var on = b.getAttribute("data-rubro") === rubro;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      cards.forEach(function (c) {
        c.hidden = rubro !== "todos" && c.getAttribute("data-rubro") !== rubro;
      });
      rows.forEach(function (row) {
        var visibles = row.querySelectorAll(".project:not([hidden])").length;
        row.hidden = visibles === 0;
        var hint = row.querySelector(".plan-row-hint");
        if (hint) hint.hidden = visibles <= 3;
        var scroller = row.querySelector(".projects-scroll");
        if (scroller) scroller.scrollLeft = 0;
      });
      updateActive();
    }

    rubroBar.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) applyRubro(b.getAttribute("data-rubro"));
    });

    var rubroInicial = null;
    try { rubroInicial = new URLSearchParams(window.location.search).get("rubro"); } catch (e) {}
    if (rubroInicial && rubroBar.querySelector('[data-rubro="' + rubroInicial + '"]')) applyRubro(rubroInicial);
  }

  // ---------- Formulario: arma el mensaje y lo manda por WhatsApp o email ----------
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");

  function buildMessage() {
    var nombre = document.getElementById("nombre").value.trim();
    var negocio = document.getElementById("negocio").value.trim();
    var tipo = document.getElementById("tipo").value;
    var mensaje = document.getElementById("mensaje").value.trim();
    if (!nombre || !negocio) {
      note.textContent = "Completá tu nombre y el de tu negocio.";
      return null;
    }
    note.textContent = "";
    var text = "Hola Santiago, soy " + nombre + " de " + negocio + ".";
    if (tipo) text += "\nMe interesa: " + tipo + ".";
    if (mensaje) text += "\n" + mensaje;
    return text;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = buildMessage();
    if (text) window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text), "_blank", "noopener");
  });

  document.getElementById("sendEmail").addEventListener("click", function () {
    var text = buildMessage();
    if (text) {
      window.location.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent("Consulta desde la web") +
        "&body=" + encodeURIComponent(text);
    }
  });
})();