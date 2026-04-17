/* global window, document */
(function () {
  "use strict";

  var Shinseikan = (window.Shinseikan = window.Shinseikan || {});
  var qs = Shinseikan.qs;
  var qsa = Shinseikan.qsa;

  var ADMIN_USER = "admin";
  var ADMIN_PASS = "karatedo";

  var state = {
    data: null,
    dirty: false
  };

  function markDirty(value) {
    state.dirty = value !== false;
    var btn = qs("#btnSaveAll");
    if (btn) btn.textContent = state.dirty ? "Guardar cambios *" : "Guardar cambios";
  }

  function showTab(tabId) {
    qsa(".admin-content").forEach(function (el) {
      el.hidden = el.id !== tabId;
    });
    qsa(".admin-tab").forEach(function (b) {
      b.dataset.active = b.dataset.tab === tabId ? "true" : "false";
    });
  }

  function bindInput(id, getter, setter) {
    var el = qs("#" + id);
    if (!el) return;
    el.value = getter() || "";
    el.addEventListener("input", function () {
      setter(el.value);
      markDirty(true);
    });
  }

  function ensureArray(arr) {
    return Array.isArray(arr) ? arr : [];
  }

  function itemShell(title, onRemove) {
    var wrap = document.createElement("div");
    wrap.className = "item";
    wrap.innerHTML =
      '<div class="item-head">' +
      '<p class="item-title"></p>' +
      '<div class="item-actions">' +
      '<button class="btn btn-ghost btn-small" type="button">Eliminar</button>' +
      "</div></div>" +
      '<div class="item-grid"></div>';
    wrap.querySelector(".item-title").textContent = title;
    wrap.querySelector("button").addEventListener("click", function () {
      if (confirm("¿Eliminar este item?")) onRemove();
    });
    return wrap;
  }

  function renderDisciplinesEditor() {
    var host = qs("#disciplinesEditor");
    if (!host) return;
    host.innerHTML = "";
    state.data.landing.disciplines = ensureArray(state.data.landing.disciplines);

    state.data.landing.disciplines.forEach(function (d, idx) {
      var wrap = itemShell(d.title || "Disciplina", function () {
        state.data.landing.disciplines.splice(idx, 1);
        renderDisciplinesEditor();
        markDirty(true);
      });

      var grid = wrap.querySelector(".item-grid");
      grid.appendChild(field("Título", d.title || "", function (v) {
        d.title = v;
        wrap.querySelector(".item-title").textContent = v || "Disciplina";
      }));
      grid.appendChild(field("Icono (1–2 caracteres)", d.icon || "", function (v) {
        d.icon = v;
      }));
      grid.appendChild(textareaField("Descripción", d.text || "", function (v) {
        d.text = v;
      }));
      host.appendChild(wrap);
    });
  }

  function renderClassesEditor() {
    var host = qs("#classesEditor");
    if (!host) return;
    host.innerHTML = "";
    state.data.landing.classGroups = ensureArray(state.data.landing.classGroups);

    state.data.landing.classGroups.forEach(function (g, idx) {
      var wrap = itemShell(g.title || "Grupo", function () {
        state.data.landing.classGroups.splice(idx, 1);
        renderClassesEditor();
        markDirty(true);
      });

      var grid = wrap.querySelector(".item-grid");
      grid.appendChild(field("Título", g.title || "", function (v) {
        g.title = v;
        wrap.querySelector(".item-title").textContent = v || "Grupo";
      }));
      grid.appendChild(textareaField("Descripción", g.text || "", function (v) {
        g.text = v;
      }));
      host.appendChild(wrap);
    });
  }

  function renderBlocksEditor() {
    var host = qs("#blocksEditor");
    if (!host) return;
    host.innerHTML = "";
    state.data.extraBlocks = ensureArray(state.data.extraBlocks);

    state.data.extraBlocks.forEach(function (b, idx) {
      var wrap = itemShell(b.title || "Bloque", function () {
        state.data.extraBlocks.splice(idx, 1);
        renderBlocksEditor();
        markDirty(true);
      });
      var grid = wrap.querySelector(".item-grid");
      grid.appendChild(field("Título", b.title || "", function (v) {
        b.title = v;
        wrap.querySelector(".item-title").textContent = v || "Bloque";
      }));
      grid.appendChild(textareaField("Texto", b.text || "", function (v) {
        b.text = v;
      }));
      host.appendChild(wrap);
    });
  }

  function renderProductsEditor() {
    var host = qs("#productsEditor");
    if (!host) return;
    host.innerHTML = "";

    state.data.shop.products = ensureArray(state.data.shop.products);

    state.data.shop.products.forEach(function (p, idx) {
      var wrap = itemShell(p.name || "Producto", function () {
        state.data.shop.products.splice(idx, 1);
        renderProductsEditor();
        markDirty(true);
      });

      var grid = wrap.querySelector(".item-grid");
      grid.appendChild(field("Nombre", p.name || "", function (v) {
        p.name = v;
        wrap.querySelector(".item-title").textContent = v || "Producto";
      }));
      grid.appendChild(field("Categoría", p.category || "", function (v) {
        p.category = v;
      }));
      grid.appendChild(textareaField("Descripción", p.desc || "", function (v) {
        p.desc = v;
      }));
      grid.appendChild(field("Precio base (ARS)", String(p.basePrice || 0), function (v) {
        p.basePrice = Number(v) || 0;
      }));

      var imgRow = document.createElement("div");
      imgRow.className = "form-row";
      imgRow.innerHTML = '<label>Imagen</label><input type="file" accept="image/*" />';
      var inputFile = imgRow.querySelector("input");
      inputFile.addEventListener("change", function () {
        var file = inputFile.files && inputFile.files[0];
        if (!file) return;
        Shinseikan.fileToDataUrl(file)
          .then(function (dataUrl) {
            p.imageDataUrl = dataUrl;
            markDirty(true);
          })
          .catch(function () {
            alert("No se pudo cargar la imagen.");
          });
      });
      grid.appendChild(imgRow);

      // Variantes
      var variantsWrap = document.createElement("div");
      variantsWrap.className = "form-row";
      variantsWrap.innerHTML =
        '<label>Variantes</label>' +
        '<div class="variants"></div>' +
        '<button class="btn btn-ghost btn-small" type="button">+ Agregar variante</button>' +
        '<p class="form-note">Si no hay variantes, el sitio usa el “precio base”.</p>';

      var variantsHost = variantsWrap.querySelector(".variants");

      function renderVariants() {
        variantsHost.innerHTML = "";
        p.variants = ensureArray(p.variants);

        p.variants.forEach(function (v, vIdx) {
          var row = document.createElement("div");
          row.className = "variant-row";
          row.innerHTML =
            '<input placeholder="Etiqueta (ej: Talle M)" />' +
            '<input placeholder="Precio" inputmode="numeric" />' +
            '<button class="btn btn-ghost btn-small" type="button" aria-label="Eliminar">✕</button>';

          var label = row.querySelectorAll("input")[0];
          var price = row.querySelectorAll("input")[1];
          var del = row.querySelector("button");
          label.value = v.label || "";
          price.value = String(v.price || 0);

          label.addEventListener("input", function () {
            v.label = label.value;
            markDirty(true);
          });
          price.addEventListener("input", function () {
            v.price = Number(price.value) || 0;
            markDirty(true);
          });
          del.addEventListener("click", function () {
            p.variants.splice(vIdx, 1);
            renderVariants();
            markDirty(true);
          });

          variantsHost.appendChild(row);
        });
      }

      variantsWrap.querySelector("button").addEventListener("click", function () {
        p.variants = ensureArray(p.variants);
        p.variants.push({ label: "Nueva variante", price: 0 });
        renderVariants();
        markDirty(true);
      });

      renderVariants();
      grid.appendChild(variantsWrap);

      host.appendChild(wrap);
    });
  }

  function field(labelText, value, onChange) {
    var row = document.createElement("div");
    row.className = "form-row";
    row.innerHTML = "<label></label><input />";
    row.querySelector("label").textContent = labelText;
    var input = row.querySelector("input");
    input.value = value || "";
    input.addEventListener("input", function () {
      onChange(input.value);
      markDirty(true);
    });
    return row;
  }

  function textareaField(labelText, value, onChange) {
    var row = document.createElement("div");
    row.className = "form-row";
    row.innerHTML = "<label></label><textarea rows='3'></textarea>";
    row.querySelector("label").textContent = labelText;
    var input = row.querySelector("textarea");
    input.value = value || "";
    input.addEventListener("input", function () {
      onChange(input.value);
      markDirty(true);
    });
    return row;
  }

  function setupBrandBindings() {
    bindInput(
      "brand_name",
      function () {
        return state.data.brand.name;
      },
      function (v) {
        state.data.brand.name = v;
      }
    );
    bindInput(
      "brand_tagline",
      function () {
        return state.data.brand.tagline;
      },
      function (v) {
        state.data.brand.tagline = v;
      }
    );
    bindInput(
      "sensei_name",
      function () {
        return state.data.brand.sensei;
      },
      function (v) {
        state.data.brand.sensei = v;
      }
    );
    bindInput(
      "whatsapp_phone",
      function () {
        return state.data.contact.whatsappPhone;
      },
      function (v) {
        state.data.contact.whatsappPhone = Shinseikan.normalizePhone(v);
      }
    );
    bindInput(
      "address_full",
      function () {
        return state.data.contact.address;
      },
      function (v) {
        state.data.contact.address = v;
      }
    );
    bindInput(
      "maps_url",
      function () {
        return state.data.contact.mapsUrl;
      },
      function (v) {
        state.data.contact.mapsUrl = v;
      }
    );
    bindInput(
      "maps_embed",
      function () {
        return state.data.contact.mapsEmbed;
      },
      function (v) {
        state.data.contact.mapsEmbed = v;
      }
    );
  }

  function setupLandingBindings() {
    state.data.landing.aboutBlocks = ensureArray(state.data.landing.aboutBlocks);
    while (state.data.landing.aboutBlocks.length < 3) {
      state.data.landing.aboutBlocks.push({ title: "", text: "" });
    }

    bindInput(
      "hero_kicker",
      function () {
        return state.data.landing.heroKicker;
      },
      function (v) {
        state.data.landing.heroKicker = v;
      }
    );
    bindInput(
      "hero_title",
      function () {
        return state.data.landing.heroTitle;
      },
      function (v) {
        state.data.landing.heroTitle = v;
      }
    );

    var heroSubtitle = qs("#hero_subtitle");
    if (heroSubtitle) {
      heroSubtitle.value = state.data.landing.heroSubtitle || "";
      heroSubtitle.addEventListener("input", function () {
        state.data.landing.heroSubtitle = heroSubtitle.value;
        markDirty(true);
      });
    }

    var heroBullets = qs("#hero_bullets");
    if (heroBullets) {
      heroBullets.value = ensureArray(state.data.landing.heroBullets).join("\n");
      heroBullets.addEventListener("input", function () {
        state.data.landing.heroBullets = heroBullets.value
          .split("\n")
          .map(function (s) {
            return Shinseikan.safeText(s);
          })
          .filter(Boolean);
        markDirty(true);
      });
    }

    bindInput(
      "hero_primary_cta",
      function () {
        return state.data.landing.heroPrimaryCta;
      },
      function (v) {
        state.data.landing.heroPrimaryCta = v;
      }
    );
    bindInput(
      "hero_secondary_cta",
      function () {
        return state.data.landing.heroSecondaryCta;
      },
      function (v) {
        state.data.landing.heroSecondaryCta = v;
      }
    );
    bindInput(
      "about_title",
      function () {
        return state.data.landing.aboutTitle;
      },
      function (v) {
        state.data.landing.aboutTitle = v;
      }
    );
    bindInput(
      "about_lead",
      function () {
        return state.data.landing.aboutLead;
      },
      function (v) {
        state.data.landing.aboutLead = v;
      }
    );

    bindInput(
      "about_b1_title",
      function () {
        return state.data.landing.aboutBlocks[0].title;
      },
      function (v) {
        state.data.landing.aboutBlocks[0].title = v;
      }
    );
    bindTextarea(
      "about_b1_text",
      function () {
        return state.data.landing.aboutBlocks[0].text;
      },
      function (v) {
        state.data.landing.aboutBlocks[0].text = v;
      }
    );
    bindInput(
      "about_b2_title",
      function () {
        return state.data.landing.aboutBlocks[1].title;
      },
      function (v) {
        state.data.landing.aboutBlocks[1].title = v;
      }
    );
    bindTextarea(
      "about_b2_text",
      function () {
        return state.data.landing.aboutBlocks[1].text;
      },
      function (v) {
        state.data.landing.aboutBlocks[1].text = v;
      }
    );
    bindInput(
      "about_b3_title",
      function () {
        return state.data.landing.aboutBlocks[2].title;
      },
      function (v) {
        state.data.landing.aboutBlocks[2].title = v;
      }
    );
    bindTextarea(
      "about_b3_text",
      function () {
        return state.data.landing.aboutBlocks[2].text;
      },
      function (v) {
        state.data.landing.aboutBlocks[2].text = v;
      }
    );

    bindInput(
      "disciplines_lead",
      function () {
        return state.data.landing.disciplinesLead;
      },
      function (v) {
        state.data.landing.disciplinesLead = v;
      }
    );

    bindInput(
      "classes_lead",
      function () {
        return state.data.landing.classesLead;
      },
      function (v) {
        state.data.landing.classesLead = v;
      }
    );
    bindInput(
      "classes_days",
      function () {
        return state.data.landing.classesDays;
      },
      function (v) {
        state.data.landing.classesDays = v;
      }
    );

    bindInput(
      "belts_lead",
      function () {
        return state.data.landing.beltsLead;
      },
      function (v) {
        state.data.landing.beltsLead = v;
      }
    );
    bindInput(
      "shop_lead",
      function () {
        return state.data.shop.lead || state.data.landing.shopLead;
      },
      function (v) {
        state.data.shop.lead = v;
      }
    );

    bindInput(
      "location_lead",
      function () {
        return state.data.landing.locationLead;
      },
      function (v) {
        state.data.landing.locationLead = v;
      }
    );
    bindInput(
      "form_lead",
      function () {
        return state.data.landing.formLead;
      },
      function (v) {
        state.data.landing.formLead = v;
      }
    );
  }

  function bindTextarea(id, getter, setter) {
    var el = qs("#" + id);
    if (!el) return;
    el.value = getter() || "";
    el.addEventListener("input", function () {
      setter(el.value);
      markDirty(true);
    });
  }

  function setupMediaBindings() {
    var preview = qs("#logoPreview");
    var adminLogo = qs("#adminLogo");

    function updatePreview() {
      var src = state.data.brand.logoDataUrl || Shinseikan.defaultLogoDataUrl();
      if (preview) preview.src = src;
      if (adminLogo) adminLogo.src = src;
    }

    var alt = qs("#logoAlt");
    if (alt) {
      alt.value = state.data.brand.logoAlt || "";
      alt.addEventListener("input", function () {
        state.data.brand.logoAlt = alt.value;
        markDirty(true);
      });
    }

    var file = qs("#logoFile");
    if (file) {
      file.addEventListener("change", function () {
        var f = file.files && file.files[0];
        if (!f) return;
        Shinseikan.fileToDataUrl(f)
          .then(function (dataUrl) {
            state.data.brand.logoDataUrl = dataUrl;
            updatePreview();
            markDirty(true);
          })
          .catch(function () {
            alert("No se pudo cargar el logo.");
          });
      });
    }

    var clear = qs("#btnClearLogo");
    if (clear) {
      clear.addEventListener("click", function () {
        state.data.brand.logoDataUrl = "";
        updatePreview();
        markDirty(true);
      });
    }

    updatePreview();
  }

  function setupBackup() {
    var btnExport = qs("#btnExport");
    if (btnExport) {
      btnExport.addEventListener("click", function () {
        var filename = "shinseikan-backup-" + new Date().toISOString().slice(0, 10) + ".json";
        Shinseikan.downloadTextFile(filename, JSON.stringify(state.data, null, 2));
      });
    }

    var importFile = qs("#importFile");
    if (importFile) {
      importFile.addEventListener("change", function () {
        var f = importFile.files && importFile.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var json = JSON.parse(String(reader.result || ""));
            state.data = json;
            Shinseikan.Storage.save(state.data);
            markDirty(false);
            bootstrapEditors();
            alert("Importado. Recargá la landing para ver cambios.");
          } catch (e) {
            alert("JSON inválido.");
          }
        };
        reader.readAsText(f);
      });
    }
  }

  function bootstrapEditors() {
    setupBrandBindings();
    setupLandingBindings();
    setupMediaBindings();
    renderDisciplinesEditor();
    renderClassesEditor();
    renderProductsEditor();
    renderBlocksEditor();
    setupBackup();
  }

  function setupActions() {
    var btnSave = qs("#btnSaveAll");
    if (btnSave) {
      btnSave.addEventListener("click", function () {
        Shinseikan.Storage.save(state.data);
        markDirty(false);
        alert("Guardado en este navegador.");
      });
    }

    var btnReset = qs("#btnReset");
    if (btnReset) {
      btnReset.addEventListener("click", function () {
        if (!confirm("¿Restaurar el contenido por defecto? Se perderán los cambios locales.")) return;
        Shinseikan.Storage.reset();
        state.data = Shinseikan.Storage.load();
        markDirty(false);
        bootstrapEditors();
      });
    }

    var btnLogout = qs("#btnLogout");
    if (btnLogout) {
      btnLogout.addEventListener("click", function () {
        Shinseikan.Storage.setAuthed(false);
        window.location.reload();
      });
    }

    var addDisc = qs("#btnAddDiscipline");
    if (addDisc) {
      addDisc.addEventListener("click", function () {
        state.data.landing.disciplines = ensureArray(state.data.landing.disciplines);
        state.data.landing.disciplines.push({
          id: Shinseikan.uid(),
          title: "Nueva disciplina",
          icon: "道",
          text: "Descripción…"
        });
        renderDisciplinesEditor();
        markDirty(true);
      });
    }

    var addGroup = qs("#btnAddClassGroup");
    if (addGroup) {
      addGroup.addEventListener("click", function () {
        state.data.landing.classGroups = ensureArray(state.data.landing.classGroups);
        state.data.landing.classGroups.push({
          id: Shinseikan.uid(),
          title: "Nuevo grupo",
          text: "Descripción…"
        });
        renderClassesEditor();
        markDirty(true);
      });
    }

    var addProd = qs("#btnAddProduct");
    if (addProd) {
      addProd.addEventListener("click", function () {
        state.data.shop.products = ensureArray(state.data.shop.products);
        state.data.shop.products.push({
          id: Shinseikan.uid(),
          name: "Nuevo producto",
          desc: "",
          category: "Otros",
          imageDataUrl: "",
          basePrice: 0,
          variants: []
        });
        renderProductsEditor();
        markDirty(true);
      });
    }

    var addBlock = qs("#btnAddBlock");
    if (addBlock) {
      addBlock.addEventListener("click", function () {
        state.data.extraBlocks = ensureArray(state.data.extraBlocks);
        state.data.extraBlocks.push({
          id: Shinseikan.uid(),
          title: "Nuevo bloque",
          text: "Texto…"
        });
        renderBlocksEditor();
        markDirty(true);
      });
    }

    qsa(".admin-tab").forEach(function (b, idx) {
      b.addEventListener("click", function () {
        showTab(b.dataset.tab);
      });
      if (idx === 0) b.dataset.active = "true";
    });
    showTab("tabBrand");
  }

  function setupLogin() {
    var loginPanel = qs("#loginPanel");
    var adminPanel = qs("#adminPanel");
    var form = qs("#loginForm");
    var err = qs("#loginError");

    function showLoggedIn(isIn) {
      loginPanel.hidden = isIn;
      adminPanel.hidden = !isIn;
    }

    if (Shinseikan.Storage.isAuthed()) {
      showLoggedIn(true);
      return true;
    }

    showLoggedIn(false);
    if (!form) return false;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var u = Shinseikan.safeText(qs("#u").value);
      var p = Shinseikan.safeText(qs("#p").value);

      if (u === ADMIN_USER && p === ADMIN_PASS) {
        Shinseikan.Storage.setAuthed(true);
        showLoggedIn(true);
        if (err) err.hidden = true;
        initAdmin();
      } else {
        if (err) {
          err.textContent = "Usuario o contraseña incorrectos.";
          err.hidden = false;
        }
      }
    });

    return false;
  }

  function initAdmin() {
    state.data = Shinseikan.Storage.load();
    markDirty(false);

    // Header logo
    var adminLogo = qs("#adminLogo");
    if (adminLogo) {
      adminLogo.src = state.data.brand.logoDataUrl || Shinseikan.defaultLogoDataUrl();
      adminLogo.alt = state.data.brand.logoAlt || "Shinseikan Karate";
    }

    bootstrapEditors();
    setupActions();
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Evita ícono roto antes de loguear.
    var adminLogo = qs("#adminLogo");
    if (adminLogo && !adminLogo.getAttribute("src")) {
      adminLogo.src = Shinseikan.defaultLogoDataUrl();
      adminLogo.alt = "Shinseikan Karate";
    }
    if (setupLogin()) initAdmin();
  });
})();
