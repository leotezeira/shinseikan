/* global window, document */
(function () {
  "use strict";

  var Shinseikan = (window.Shinseikan = window.Shinseikan || {});
  var qs = Shinseikan.qs;
  var qsa = Shinseikan.qsa;

  function setText(id, value) {
    var el = qs("#" + id);
    if (!el) return;
    el.textContent = String(value || "");
  }

  function setHref(id, value) {
    var el = qs("#" + id);
    if (!el) return;
    el.href = String(value || "#");
  }

  function renderLogo(data) {
    var logo = qs("#brandLogo");
    if (!logo) return;
    if (data.brand.logoDataUrl) logo.src = data.brand.logoDataUrl;
    else logo.src = Shinseikan.defaultLogoDataUrl();
    logo.alt = data.brand.logoAlt || data.brand.name || "Logo";

    var adminLogo = qs("#adminLogo");
    if (adminLogo) {
      adminLogo.src = logo.src;
      adminLogo.alt = logo.alt;
    }
  }

  function renderDisciplines(data) {
    var grid = qs("#disciplinesGrid");
    if (!grid) return;
    grid.innerHTML = "";
    (data.landing.disciplines || []).forEach(function (d) {
      var card = document.createElement("article");
      card.className = "card discipline-card reveal";
      card.innerHTML =
        '<div class="disc-icon" aria-hidden="true">' +
        (d.icon || "道") +
        "</div>" +
        '<h3 class="card-title"></h3>' +
        '<p class="card-text"></p>';
      card.querySelector(".card-title").textContent = d.title || "";
      card.querySelector(".card-text").textContent = d.text || "";
      grid.appendChild(card);
    });
  }

  function renderClassGroups(data) {
    var grid = qs("#classesGroups");
    if (!grid) return;
    grid.innerHTML = "";
    (data.landing.classGroups || []).forEach(function (g) {
      var card = document.createElement("article");
      card.className = "card reveal";
      card.innerHTML = '<h3 class="card-title"></h3><p class="card-text"></p>';
      card.querySelector(".card-title").textContent = g.title || "";
      card.querySelector(".card-text").textContent = g.text || "";
      grid.appendChild(card);
    });
  }

  function renderBelts(data) {
    var row = qs("#beltsRow");
    if (!row) return;
    row.innerHTML = "";
    (data.landing.belts || []).forEach(function (b) {
      var el = document.createElement("div");
      el.className = "belt";
      el.style.setProperty("--belt", b.color || "#eee");
      var swatchBorder = b.border || "rgba(0,0,0,.12)";
      el.innerHTML = '<div class="belt-swatch"></div><p class="belt-name"></p>';
      el.querySelector(".belt-swatch").style.borderBottomColor = swatchBorder;
      el.querySelector(".belt-name").textContent = b.name || "";
      row.appendChild(el);
    });
  }

  function renderExtraBlocks(data) {
    var blocks = data.extraBlocks || [];
    if (!blocks.length) return;

    // Insertamos debajo de “Disciplinas” para cumplir “nuevas secciones/bloques”.
    var anchor = qs("#disciplinas");
    if (!anchor) return;

    var section = document.createElement("section");
    section.className = "section";
    section.id = "bloques";
    section.innerHTML =
      '<div class="container">' +
      '<div class="section-head reveal"><h2 class="section-title">Más información</h2>' +
      '<p class="section-lead">Bloques editables desde el panel admin.</p></div>' +
      '<div class="grid-3" id="extraBlocksGrid"></div></div>';
    anchor.insertAdjacentElement("afterend", section);

    var grid = section.querySelector("#extraBlocksGrid");
    blocks.forEach(function (b) {
      var card = document.createElement("article");
      card.className = "card reveal";
      card.innerHTML = '<h3 class="card-title"></h3><p class="card-text"></p>';
      card.querySelector(".card-title").textContent = b.title || "";
      card.querySelector(".card-text").textContent = b.text || "";
      grid.appendChild(card);
    });
  }

  function buildProductFilters(data) {
    var chips = qs("#productChips");
    if (!chips) return [];
    var categories = (data.shop && data.shop.categories) || [];
    if (!categories.length) {
      var seen = {};
      (data.shop.products || []).forEach(function (p) {
        var c = p.category || "Otros";
        if (!seen[c]) {
          seen[c] = true;
          categories.push(c);
        }
      });
    }

    var all = ["Todos"].concat(categories);
    chips.innerHTML = "";

    all.forEach(function (c, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = c;
      btn.dataset.value = c;
      btn.dataset.active = idx === 0 ? "true" : "false";
      chips.appendChild(btn);
    });

    return all;
  }

  function renderProducts(data, opts) {
    var grid = qs("#productsGrid");
    if (!grid) return;

    var search = (opts && opts.search) || "";
    var category = (opts && opts.category) || "Todos";

    var products = (data.shop.products || []).filter(function (p) {
      if (category !== "Todos" && (p.category || "") !== category) return false;
      if (!search) return true;
      var s = search.toLowerCase();
      return (p.name || "").toLowerCase().includes(s) || (p.desc || "").toLowerCase().includes(s);
    });

    grid.innerHTML = "";
    products.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "product reveal";

      var img = p.imageDataUrl
        ? '<img alt="' + (p.name || "Producto") + '" src="' + p.imageDataUrl + '"/>'
        : '<div class="seal" aria-hidden="true">KAI</div>';

      var hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
      var selectHtml = "";
      if (hasVariants) {
        selectHtml =
          '<select class="variant" aria-label="Elegir variante">' +
          p.variants
            .map(function (v, idx) {
              var label = (v.label || "Variante") + (v.price ? " · " + Shinseikan.formatARS(v.price) : "");
              return '<option value="' + idx + '">' + label + "</option>";
            })
            .join("") +
          "</select>";
      }

      var price = hasVariants ? p.variants[0].price : p.basePrice;

      card.innerHTML =
        '<div class="product-media">' +
        img +
        "</div>" +
        '<div class="product-body">' +
        '<div class="product-row"><h3 class="product-title"></h3><div class="price"></div></div>' +
        '<p class="product-desc"></p>' +
        (selectHtml || "") +
        '<a class="btn btn-primary" href="#" rel="noopener">Encargar por WhatsApp</a>' +
        "</div>";

      card.querySelector(".product-title").textContent = p.name || "";
      card.querySelector(".product-desc").textContent = p.desc || "";
      card.querySelector(".price").textContent = Shinseikan.formatARS(price);

      var select = card.querySelector("select.variant");
      var btn = card.querySelector("a.btn");

      function updateBtn() {
        var variantText = "";
        var priceValue = p.basePrice || 0;
        if (select && p.variants && p.variants.length) {
          var v = p.variants[Number(select.value) || 0];
          if (v) {
            variantText = v.label ? " (" + v.label + ")" : "";
            priceValue = v.price || 0;
          }
        }

        card.querySelector(".price").textContent = Shinseikan.formatARS(priceValue);

        var msg =
          "Hola, quiero encargar " +
          (p.name || "un producto") +
          (variantText || "") +
          (priceValue ? ". Precio: " + Shinseikan.formatARS(priceValue) : "") +
          ".";
        btn.href = Shinseikan.buildWaLink(data.contact.whatsappPhone, msg);
      }

      if (select) select.addEventListener("change", updateBtn);
      updateBtn();

      grid.appendChild(card);
    });
  }

  function setupNav() {
    var toggle = qs(".nav-toggle");
    var mobile = qs("#mobileNav");
    if (!toggle || !mobile) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      mobile.hidden = open;
    });

    qsa("#mobileNav a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        mobile.hidden = true;
      });
    });
  }

  function setupReveal() {
    var els = qsa(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  function setupSignupForm(data) {
    var form = qs("#signupForm");
    if (!form) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = Shinseikan.safeText(qs("#fName").value);
      var phone = Shinseikan.safeText(qs("#fPhone").value);
      var email = Shinseikan.safeText(qs("#fEmail").value);

      var msg =
        "Hola, soy " +
        (name || "—") +
        ". Quiero inscribirme en Shinseikan Karate." +
        (phone ? " Tel: " + phone + "." : "") +
        (email ? " Email: " + email + "." : "") +
        " ¿Me pasan horarios y valores?";

      window.location.href = Shinseikan.buildWaLink(data.contact.whatsappPhone, msg);
    });
  }

  function setWhatsAppLinks(data) {
    var waMsg = "Hola, quiero información sobre clases en Shinseikan Karate.";
    var wa = Shinseikan.buildWaLink(data.contact.whatsappPhone, waMsg);
    setHref("waHeaderLink", wa);
    setHref("heroWaCta", wa);
    setHref("classesWaCta", wa);
    setHref("locationWaCta", wa);
    setHref("waFooterLink", wa);
  }

  function render(data) {
    renderLogo(data);

    setText("brandName", data.brand.name);
    setText("brandTagline", data.brand.tagline);
    setText("footerName", data.brand.name);
    setText("footerSub", data.brand.tagline);

    setText("senseiName", data.brand.sensei);
    setText("waPhoneText", prettyPhone(data.contact.whatsappPhone));
    setText("waPhoneFooterText", prettyPhone(data.contact.whatsappPhone));

    setText("heroKicker", data.landing.heroKicker);
    setText("heroTitle", data.landing.heroTitle);
    setText("heroSubtitle", data.landing.heroSubtitle);
    setText("heroPrimaryCta", data.landing.heroPrimaryCta);
    setText("heroSecondaryCta", data.landing.heroSecondaryCta);
    setText("heroCardTitle", "Dojo " + data.brand.name);
    setText("heroCardSub", "San Vicente · Córdoba");

    var heroBullets = qs("#heroBullets");
    if (heroBullets) {
      heroBullets.innerHTML = "";
      (data.landing.heroBullets || []).forEach(function (t) {
        var li = document.createElement("li");
        li.textContent = t;
        heroBullets.appendChild(li);
      });
    }

    setText("aboutTitle", data.landing.aboutTitle);
    setText("aboutLead", data.landing.aboutLead);

    if (data.landing.aboutBlocks && data.landing.aboutBlocks[0]) {
      setText("aboutBlock1Title", data.landing.aboutBlocks[0].title);
      setText("aboutBlock1Text", data.landing.aboutBlocks[0].text);
    }
    if (data.landing.aboutBlocks && data.landing.aboutBlocks[1]) {
      setText("aboutBlock2Title", data.landing.aboutBlocks[1].title);
      setText("aboutBlock2Text", data.landing.aboutBlocks[1].text);
    }
    if (data.landing.aboutBlocks && data.landing.aboutBlocks[2]) {
      setText("aboutBlock3Title", data.landing.aboutBlocks[2].title);
      setText("aboutBlock3Text", data.landing.aboutBlocks[2].text);
    }

    setText("disciplinesLead", data.landing.disciplinesLead);
    renderDisciplines(data);

    setText("classesLead", data.landing.classesLead);
    setText("classesDays", data.landing.classesDays);
    renderClassGroups(data);

    setText("beltsLead", data.landing.beltsLead);
    renderBelts(data);

    setText("shopLead", (data.shop && data.shop.lead) || data.landing.shopLead || "");
    setText("locationLead", data.landing.locationLead || data.contact.address);
    setText("locationAddress", data.contact.address);
    setText("locationDays", data.landing.classesDays);

    setHref("mapsCta", data.contact.mapsUrl);
    setText("footerAddress", shortAddress(data.contact.address));

    var map = qs("#mapFrame");
    if (map) map.src = data.contact.mapsEmbed || "";

    setText("formLead", data.landing.formLead);

    setWhatsAppLinks(data);

    renderExtraBlocks(data);

    var currentCategory = "Todos";
    buildProductFilters(data);

    renderProducts(data, { category: currentCategory, search: "" });

    var chips = qs("#productChips");
    if (chips) {
      chips.addEventListener("click", function (ev) {
        var target = ev.target;
        if (!target || !target.classList.contains("chip")) return;
        qsa(".chip", chips).forEach(function (c) {
          c.dataset.active = "false";
        });
        target.dataset.active = "true";
        currentCategory = target.dataset.value || "Todos";
        var search = Shinseikan.safeText(qs("#productSearch").value).toLowerCase();
        renderProducts(data, { category: currentCategory, search: search });
        setupReveal(); // chips pueden volver a renderizar productos
      });
    }

    var searchInput = qs("#productSearch");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        var search = Shinseikan.safeText(searchInput.value).toLowerCase();
        renderProducts(data, { category: currentCategory, search: search });
        setupReveal();
      });
    }

    setupSignupForm(data);
    setupNav();
    setText("year", new Date().getFullYear());
    setupReveal();
  }

  function shortAddress(full) {
    var t = String(full || "");
    return t.length > 48 ? t.slice(0, 48) + "…" : t;
  }

  function prettyPhone(phone) {
    var p = Shinseikan.normalizePhone(phone);
    if (!p) return "";
    // Formato simple para mostrar. Para AR: 54 + area + número.
    if (p.startsWith("54") && p.length >= 11) {
      return "+54 " + p.slice(2, 5) + " " + p.slice(5);
    }
    return "+" + p;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var data = Shinseikan.Storage.load();
    render(data);
  });
})();
