/* global window, document, Shinseikan */
(function () {
  "use strict";

  var qs = Shinseikan.qs;
  var qsa = Shinseikan.qsa;

  // Tipos de bloques disponibles con sus configuraciones
  var BLOCK_TYPES = {
    hero: {
      label: "Hero / Portada",
      icon: "🎯",
      description: "Sección principal con título, subtítulo y CTAs",
      defaultProps: {
        kicker: "",
        title: "",
        subtitle: "",
        primaryCta: "",
        secondaryCta: "",
        bullets: []
      }
    },
    about: {
      label: "Sobre / About",
      icon: "📖",
      description: "Sección informativa con título y bloques de contenido",
      defaultProps: {
        title: "",
        lead: "",
        blocks: []
      }
    },
    disciplines: {
      label: "Disciplinas",
      icon: "🥋",
      description: "Lista de disciplinas con íconos",
      defaultProps: {
        lead: "",
        items: []
      }
    },
    classes: {
      label: "Clases / Grupos",
      icon: "👥",
      description: "Grupos de clases por nivel",
      defaultProps: {
        lead: "",
        days: "",
        groups: []
      }
    },
    belts: {
      label: "Cintos / Graduations",
      icon: "⚫",
      description: "Sistema de graduación por cintos",
      defaultProps: {
        lead: "",
        items: []
      }
    },
    location: {
      label: "Ubicación / Mapa",
      icon: "📍",
      description: "Dirección y mapa embebido",
      defaultProps: {
        lead: "",
        address: "",
        mapsEmbed: ""
      }
    },
    contact: {
      label: "Contacto / Formulario",
      icon: "📞",
      description: "Formulario de contacto y WhatsApp",
      defaultProps: {
        lead: "",
        whatsappPhone: ""
      }
    },
    text: {
      label: "Texto / Contenido",
      icon: "📝",
      description: "Bloque simple de título y texto",
      defaultProps: {
        title: "",
        text: ""
      }
    },
    image: {
      label: "Imagen / Media",
      icon: "🖼️",
      description: "Bloque con imagen, título opcional y descripción",
      defaultProps: {
        src: "",
        alt: "",
        title: "",
        caption: "",
        link: ""
      }
    },
    html: {
      label: "HTML Personalizado",
      icon: "💻",
      description: "Inserta código HTML personalizado (uso avanzado)",
      defaultProps: {
        htmlContent: ""
      }
    }
  };

  // Estado del editor visual
  var editorState = {
    blocks: [],
    selectedBlockId: null,
    breakpoint: "desktop", // desktop, tablet, mobile
    history: [],
    historyIndex: -1,
    autoSaveTimer: null,
    isDirty: false
  };

  // Utilidades para el historial (undo/redo)
  function saveHistory() {
    // Eliminar historial futuro si estamos en medio del stack
    if (editorState.historyIndex < editorState.history.length - 1) {
      editorState.history = editorState.history.slice(0, editorState.historyIndex + 1);
    }
    // Guardar estado actual
    editorState.history.push(JSON.stringify(editorState.blocks));
    // Limitar historial a 50 estados
    if (editorState.history.length > 50) {
      editorState.history.shift();
    } else {
      editorState.historyIndex++;
    }
    updateUndoRedoButtons();
  }

  function undo() {
    if (editorState.historyIndex > 0) {
      editorState.historyIndex--;
      editorState.blocks = JSON.parse(editorState.history[editorState.historyIndex]);
      renderBlocksList();
      updateUndoRedoButtons();
      markDirty(false); // No marcar como dirty porque es un estado guardado
    }
  }

  function redo() {
    if (editorState.historyIndex < editorState.history.length - 1) {
      editorState.historyIndex++;
      editorState.blocks = JSON.parse(editorState.history[editorState.historyIndex]);
      renderBlocksList();
      updateUndoRedoButtons();
      markDirty(false);
    }
  }

  function updateUndoRedoButtons() {
    var btnUndo = qs("#btnUndo");
    var btnRedo = qs("#btnRedo");
    if (btnUndo) btnUndo.disabled = editorState.historyIndex <= 0;
    if (btnRedo) btnRedo.disabled = editorState.historyIndex >= editorState.history.length - 1;
  }

  // Marcar como sucio (cambios sin guardar)
  function markDirty(isDirty) {
    editorState.isDirty = isDirty !== false;
    var statusEl = qs("#editorStatus");
    if (statusEl) {
      statusEl.textContent = editorState.isDirty ? "Cambios sin guardar..." : "Guardado";
      statusEl.className = editorState.isDirty ? "editor-status dirty" : "editor-status saved";
    }
  }

  // Autoguardado
  function scheduleAutoSave() {
    if (editorState.autoSaveTimer) {
      clearTimeout(editorState.autoSaveTimer);
    }
    editorState.autoSaveTimer = setTimeout(function () {
      saveToStorage();
    }, 2000); // Guardar después de 2 segundos sin cambios
  }

  function saveToStorage() {
    try {
      var data = Shinseikan.Storage.load();
      data.pageBlocks = editorState.blocks;
      Shinseikan.Storage.save(data);
      markDirty(false);
      showNotification("Cambios guardados automáticamente", "success");
    } catch (e) {
      console.error("Error al guardar:", e);
      showNotification("Error al guardar cambios", "error");
    }
  }

  // Notificaciones toast
  function showNotification(message, type) {
    var container = qs("#notificationsContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "notificationsContainer";
      container.className = "notifications-container";
      document.body.appendChild(container);
    }

    var toast = document.createElement("div");
    toast.className = "notification-toast " + (type || "info");
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
      toast.classList.add("fade-out");
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Renderizado de la lista de bloques
  function renderBlocksList() {
    var host = qs("#blocksList");
    if (!host) return;
    host.innerHTML = "";

    if (editorState.blocks.length === 0) {
      host.innerHTML = '<p class="empty-state">No hay bloques. Agregá uno desde el panel lateral.</p>';
      return;
    }

    editorState.blocks.forEach(function (block, index) {
      var blockType = BLOCK_TYPES[block.type] || BLOCK_TYPES.text;
      var item = document.createElement("div");
      item.className = "block-item" + (editorState.selectedBlockId === block.id ? " selected" : "");
      item.draggable = true;
      item.dataset.blockId = block.id;
      item.dataset.index = index;

      // Determinar título del bloque
      var blockTitle = getBlockTitle(block);

      item.innerHTML =
        '<div class="block-drag-handle">⋮⋮</div>' +
        '<span class="block-icon">' + blockType.icon + '</span>' +
        '<div class="block-info">' +
        '<span class="block-type">' + blockType.label + '</span>' +
        '<span class="block-title">' + (blockTitle || "Sin título") + '</span>' +
        '</div>' +
        '<div class="block-actions">' +
        '<button class="btn-icon btn-ghost" data-action="duplicate" title="Duplicar">📋</button>' +
        '<button class="btn-icon btn-ghost" data-action="remove" title="Eliminar">🗑️</button>' +
        '</div>';

      // Eventos
      item.addEventListener("click", function (e) {
        if (e.target.closest(".block-actions")) return;
        selectBlock(block.id);
      });

      item.querySelector('[data-action="remove"]').addEventListener("click", function () {
        removeBlock(block.id);
      });

      item.querySelector('[data-action="duplicate"]').addEventListener("click", function () {
        duplicateBlock(block.id);
      });

      // Drag & Drop
      item.addEventListener("dragstart", handleDragStart);
      item.addEventListener("dragover", handleDragOver);
      item.addEventListener("drop", handleDrop);
      item.addEventListener("dragend", handleDragEnd);

      host.appendChild(item);
    });
  }

  function getBlockTitle(block) {
    switch (block.type) {
      case "hero":
        return block.props.title || block.props.kicker || "";
      case "about":
        return block.props.title || "";
      case "disciplines":
        return "Disciplinas";
      case "classes":
        return "Clases";
      case "belts":
        return "Cintos";
      case "location":
        return block.props.address || "Ubicación";
      case "contact":
        return "Contacto";
      case "text":
        return block.props.title || "";
      case "image":
        return block.props.title || block.props.caption || "Imagen";
      case "html":
        return "HTML Personalizado";
      default:
        return "";
    }
  }

  // Selección de bloque
  function selectBlock(blockId) {
    editorState.selectedBlockId = blockId;
    renderBlocksList();
    renderPropertiesPanel();
    renderPreview();
  }

  // Panel de propiedades
  function renderPropertiesPanel() {
    var host = qs("#propertiesPanel");
    if (!host) return;

    if (!editorState.selectedBlockId) {
      host.innerHTML = '<p class="empty-state">Seleccioná un bloque para editar sus propiedades.</p>';
      return;
    }

    var block = editorState.blocks.find(function (b) {
      return b.id === editorState.selectedBlockId;
    });

    if (!block) {
      host.innerHTML = '<p class="empty-state">Bloque no encontrado.</p>';
      return;
    }

    var blockType = BLOCK_TYPES[block.type] || BLOCK_TYPES.text;

    host.innerHTML =
      '<div class="prop-header">' +
      '<span class="block-icon-large">' + blockType.icon + '</span>' +
      '<div>' +
      '<h3 class="prop-title">' + blockType.label + '</h3>' +
      '<p class="prop-desc">' + blockType.description + '</p>' +
      '</div>' +
      '</div>' +
      '<div class="prop-body" id="propBody"></div>';

    var propBody = qs("#propBody");
    if (!propBody) return;

    // Generar campos según el tipo de bloque
    renderBlockProperties(propBody, block);
  }

  function renderBlockProperties(host, block) {
    var props = block.props || {};

    // Campos comunes según tipo
    switch (block.type) {
      case "hero":
        createInput(host, "Kicker", props.kicker, function (v) {
          block.props.kicker = v;
          onPropertyChange();
        });
        createInput(host, "Título principal", props.title, function (v) {
          block.props.title = v;
          onPropertyChange();
        });
        createTextarea(host, "Subtítulo", props.subtitle, function (v) {
          block.props.subtitle = v;
          onPropertyChange();
        });
        createInput(host, "Botón principal", props.primaryCta, function (v) {
          block.props.primaryCta = v;
          onPropertyChange();
        });
        createInput(host, "Botón secundario", props.secondaryCta, function (v) {
          block.props.secondaryCta = v;
          onPropertyChange();
        });
        createBulletsEditor(host, props.bullets, function (v) {
          block.props.bullets = v;
          onPropertyChange();
        });
        break;

      case "about":
        createInput(host, "Título", props.title, function (v) {
          block.props.title = v;
          onPropertyChange();
        });
        createInput(host, "Bajada / Lead", props.lead, function (v) {
          block.props.lead = v;
          onPropertyChange();
        });
        createAboutBlocksEditor(host, props.blocks, function (v) {
          block.props.blocks = v;
          onPropertyChange();
        });
        break;

      case "disciplines":
        createInput(host, "Bajada / Lead", props.lead, function (v) {
          block.props.lead = v;
          onPropertyChange();
        });
        createDisciplinesEditor(host, props.items, function (v) {
          block.props.items = v;
          onPropertyChange();
        });
        break;

      case "classes":
        createInput(host, "Bajada / Lead", props.lead, function (v) {
          block.props.lead = v;
          onPropertyChange();
        });
        createInput(host, "Días", props.days, function (v) {
          block.props.days = v;
          onPropertyChange();
        });
        createClassGroupsEditor(host, props.groups, function (v) {
          block.props.groups = v;
          onPropertyChange();
        });
        break;

      case "belts":
        createInput(host, "Bajada / Lead", props.lead, function (v) {
          block.props.lead = v;
          onPropertyChange();
        });
        createBeltsEditor(host, props.items, function (v) {
          block.props.items = v;
          onPropertyChange();
        });
        break;

      case "location":
        createInput(host, "Bajada / Lead", props.lead, function (v) {
          block.props.lead = v;
          onPropertyChange();
        });
        createInput(host, "Dirección", props.address, function (v) {
          block.props.address = v;
          onPropertyChange();
        });
        createInput(host, "Map Embed URL", props.mapsEmbed, function (v) {
          block.props.mapsEmbed = v;
          onPropertyChange();
        });
        break;

      case "contact":
        createInput(host, "Bajada / Lead", props.lead, function (v) {
          block.props.lead = v;
          onPropertyChange();
        });
        createInput(host, "WhatsApp (solo números)", props.whatsappPhone, function (v) {
          block.props.whatsappPhone = Shinseikan.normalizePhone(v);
          onPropertyChange();
        });
        break;

      case "text":
        createInput(host, "Título", props.title, function (v) {
          block.props.title = v;
          onPropertyChange();
        });
        createTextarea(host, "Texto", props.text, function (v) {
          block.props.text = v;
          onPropertyChange();
        });
        break;

      case "image":
        createInput(host, "URL de la imagen", props.src, function (v) {
          block.props.src = v;
          onPropertyChange();
        });
        createInput(host, "Texto alternativo (alt)", props.alt, function (v) {
          block.props.alt = v;
          onPropertyChange();
        });
        createInput(host, "Título opcional", props.title, function (v) {
          block.props.title = v;
          onPropertyChange();
        });
        createInput(host, "Pie de foto / Caption", props.caption, function (v) {
          block.props.caption = v;
          onPropertyChange();
        });
        createInput(host, "Enlace opcional (link)", props.link, function (v) {
          block.props.link = v;
          onPropertyChange();
        });
        break;

      case "html":
        createTextarea(host, "Código HTML personalizado", props.htmlContent, function (v) {
          block.props.htmlContent = v;
          onPropertyChange();
        });
        break;
    }
  }

  function createInput(host, label, value, onChange) {
    var row = document.createElement("div");
    row.className = "prop-row";
    row.innerHTML = '<label>' + label + '</label><input type="text" />';
    var input = row.querySelector("input");
    input.value = value || "";
    input.addEventListener("input", function () {
      onChange(input.value);
    });
    host.appendChild(row);
  }

  function createTextarea(host, label, value, onChange) {
    var row = document.createElement("div");
    row.className = "prop-row";
    row.innerHTML = '<label>' + label + '</label><textarea rows="3"></textarea>';
    var input = row.querySelector("textarea");
    input.value = value || "";
    input.addEventListener("input", function () {
      onChange(input.value);
    });
    host.appendChild(row);
  }

  function createBulletsEditor(host, bullets, onChange) {
    var row = document.createElement("div");
    row.className = "prop-row full-width";
    row.innerHTML =
      '<label>Viñetas (una por línea)</label>' +
      '<textarea rows="4" placeholder="• Item 1\n• Item 2"></textarea>' +
      '<button class="btn btn-ghost btn-small" type="button">Actualizar</button>';

    var textarea = row.querySelector("textarea");
    var btn = row.querySelector("button");
    textarea.value = (bullets || []).join("\n");

    btn.addEventListener("click", function () {
      var newBullets = textarea.value
        .split("\n")
        .map(function (s) {
          return s.replace(/^[\s•\-\*]+\s*/, "").trim();
        })
        .filter(Boolean);
      onChange(newBullets);
      renderPropertiesPanel();
      renderPreview();
    });

    host.appendChild(row);
  }

  function createAboutBlocksEditor(host, blocks, onChange) {
    var container = document.createElement("div");
    container.className = "nested-editor";

    var header = document.createElement("div");
    header.className = "nested-header";
    header.innerHTML =
      '<span>Bloques de contenido</span>' +
      '<button class="btn btn-ghost btn-small" type="button">+ Agregar</button>';

    header.querySelector("button").addEventListener("click", function () {
      blocks = blocks || [];
      blocks.push({ title: "", text: "" });
      onChange(blocks);
      renderPropertiesPanel();
      renderPreview();
    });

    container.appendChild(header);

    var list = document.createElement("div");
    list.className = "nested-list";

    (blocks || []).forEach(function (b, idx) {
      var item = document.createElement("div");
      item.className = "nested-item";
      item.innerHTML =
        '<div class="nested-item-header">' +
        '<input type="text" placeholder="Título" />' +
        '<button class="btn-icon btn-ghost" type="button">🗑️</button>' +
        '</div>' +
        '<textarea rows="2" placeholder="Texto"></textarea>';

      var titleInput = item.querySelector('input[type="text"]');
      var textInput = item.querySelector("textarea");
      var removeBtn = item.querySelector(".btn-icon");

      titleInput.value = b.title || "";
      textInput.value = b.text || "";

      titleInput.addEventListener("input", function () {
        b.title = titleInput.value;
        onPropertyChange();
      });

      textInput.addEventListener("input", function () {
        b.text = textInput.value;
        onPropertyChange();
      });

      removeBtn.addEventListener("click", function () {
        blocks.splice(idx, 1);
        onChange(blocks);
        renderPropertiesPanel();
        renderPreview();
      });

      list.appendChild(item);
    });

    container.appendChild(list);
    host.appendChild(container);
  }

  function createDisciplinesEditor(host, items, onChange) {
    renderNestedListEditor(host, items, onChange, [
      { key: "title", label: "Título", type: "text" },
      { key: "icon", label: "Ícono", type: "text", placeholder: "拳" },
      { key: "text", label: "Descripción", type: "textarea" }
    ]);
  }

  function createClassGroupsEditor(host, items, onChange) {
    renderNestedListEditor(host, items, onChange, [
      { key: "title", label: "Título", type: "text" },
      { key: "text", label: "Descripción", type: "textarea" }
    ]);
  }

  function createBeltsEditor(host, items, onChange) {
    renderNestedListEditor(host, items, onChange, [
      { key: "name", label: "Nombre", type: "text" },
      { key: "color", label: "Color", type: "color" },
      { key: "border", label: "Borde", type: "color" }
    ]);
  }

  function renderNestedListEditor(host, items, onChange, fields) {
    var container = document.createElement("div");
    container.className = "nested-editor";

    var header = document.createElement("div");
    header.className = "nested-header";
    header.innerHTML =
      '<span>Items</span>' +
      '<button class="btn btn-ghost btn-small" type="button">+ Agregar</button>';

    header.querySelector("button").addEventListener("click", function () {
      items = items || [];
      var newItem = {};
      fields.forEach(function (f) {
        newItem[f.key] = f.type === "color" ? "#000000" : "";
      });
      if (fields.some(function (f) {
        return f.key === "id";
      })) {
        newItem.id = Shinseikan.uid();
      }
      items.push(newItem);
      onChange(items);
      renderPropertiesPanel();
      renderPreview();
    });

    container.appendChild(header);

    var list = document.createElement("div");
    list.className = "nested-list";

    (items || []).forEach(function (item, idx) {
      var itemEl = document.createElement("div");
      itemEl.className = "nested-item";

      fields.forEach(function (f) {
        var fieldRow = document.createElement("div");
        fieldRow.className = "nested-field";

        var label = document.createElement("label");
        label.textContent = f.label;

        var input;
        if (f.type === "textarea") {
          input = document.createElement("textarea");
          input.rows = 2;
        } else if (f.type === "color") {
          input = document.createElement("input");
          input.type = "color";
        } else {
          input = document.createElement("input");
          input.type = "text";
        }

        if (f.placeholder) input.placeholder = f.placeholder;
        input.value = item[f.key] || "";

        input.addEventListener("input", function () {
          item[f.key] = f.type === "color" ? input.value : input.value;
          onPropertyChange();
        });

        fieldRow.appendChild(label);
        fieldRow.appendChild(input);
        itemEl.appendChild(fieldRow);
      });

      // Botón eliminar
      var actions = document.createElement("div");
      actions.className = "nested-item-actions";
      actions.innerHTML = '<button class="btn btn-ghost btn-small" type="button">Eliminar</button>';
      actions.querySelector("button").addEventListener("click", function () {
        items.splice(idx, 1);
        onChange(items);
        renderPropertiesPanel();
        renderPreview();
      });
      itemEl.appendChild(actions);

      list.appendChild(itemEl);
    });

    container.appendChild(list);
    host.appendChild(container);
  }

  function onPropertyChange() {
    markDirty(true);
    saveHistory();
    renderBlocksList();
    renderPreview();
    scheduleAutoSave();
  }

  // Operaciones con bloques
  function addBlock(type) {
    var blockType = BLOCK_TYPES[type];
    if (!blockType) return;

    var newBlock = {
      id: Shinseikan.uid(),
      type: type,
      props: JSON.parse(JSON.stringify(blockType.defaultProps)),
      styles: {}
    };

    editorState.blocks.push(newBlock);
    saveHistory();
    renderBlocksList();
    selectBlock(newBlock.id);
    markDirty(true);
    scheduleAutoSave();
    showNotification("Bloque agregado", "success");
  }

  function removeBlock(blockId) {
    if (!confirm("¿Eliminar este bloque?")) return;

    var index = editorState.blocks.findIndex(function (b) {
      return b.id === blockId;
    });

    if (index > -1) {
      editorState.blocks.splice(index, 1);
      if (editorState.selectedBlockId === blockId) {
        editorState.selectedBlockId = null;
      }
      saveHistory();
      renderBlocksList();
      renderPropertiesPanel();
      renderPreview();
      markDirty(true);
      scheduleAutoSave();
      showNotification("Bloque eliminado", "success");
    }
  }

  function duplicateBlock(blockId) {
    var block = editorState.blocks.find(function (b) {
      return b.id === blockId;
    });

    if (block) {
      var newBlock = JSON.parse(JSON.stringify(block));
      newBlock.id = Shinseikan.uid();
      var index = editorState.blocks.findIndex(function (b) {
        return b.id === blockId;
      });
      editorState.blocks.splice(index + 1, 0, newBlock);
      saveHistory();
      renderBlocksList();
      selectBlock(newBlock.id);
      markDirty(true);
      scheduleAutoSave();
      showNotification("Bloque duplicado", "success");
    }
  }

  // Drag & Drop handlers
  var dragSourceIndex = null;

  function handleDragStart(e) {
    dragSourceIndex = parseInt(this.dataset.index, 10);
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", this.dataset.blockId);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    this.classList.add("drag-over");
  }

  function handleDrop(e) {
    e.preventDefault();
    this.classList.remove("drag-over");

    var dragTargetIndex = parseInt(this.dataset.index, 10);

    if (dragSourceIndex !== null && dragSourceIndex !== dragTargetIndex) {
      // Reordenar bloques
      var draggedBlock = editorState.blocks[dragSourceIndex];
      editorState.blocks.splice(dragSourceIndex, 1);
      editorState.blocks.splice(dragTargetIndex, 0, draggedBlock);

      saveHistory();
      renderBlocksList();
      renderPreview();
      markDirty(true);
      scheduleAutoSave();
    }
  }

  function handleDragEnd() {
    this.classList.remove("dragging");
    qsa(".block-item").forEach(function (el) {
      el.classList.remove("drag-over");
    });
    dragSourceIndex = null;
  }

  // Vista previa responsive
  function setBreakpoint(bp) {
    editorState.breakpoint = bp;
    qsa(".breakpoint-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.breakpoint === bp);
    });

    var previewFrame = qs("#previewFrame");
    if (previewFrame) {
      previewFrame.className = "preview-frame preview-" + bp;
    }

    renderPreview();
  }

  // Renderizado de vista previa
  function renderPreview() {
    var host = qs("#previewContent");
    if (!host) return;

    if (editorState.blocks.length === 0) {
      host.innerHTML = '<p class="empty-preview">Agregá bloques para ver la vista previa.</p>';
      return;
    }

    var html = "";
    editorState.blocks.forEach(function (block) {
      html += renderBlockPreview(block);
    });

    host.innerHTML = html;
  }

  function renderBlockPreview(block) {
    var props = block.props || {};

    switch (block.type) {
      case "hero":
        return (
          '<section class="preview-hero">' +
          '<p class="kicker">' + escapeHtml(props.kicker || "") + '</p>' +
          '<h1>' + escapeHtml(props.title || "") + '</h1>' +
          '<p class="subtitle">' + escapeHtml(props.subtitle || "") + '</p>' +
          '<div class="cta-group">' +
          (props.primaryCta ? '<button class="btn btn-primary">' + escapeHtml(props.primaryCta) + '</button>' : "") +
          (props.secondaryCta ? '<button class="btn btn-ghost">' + escapeHtml(props.secondaryCta) + '</button>' : "") +
          '</div>' +
          (props.bullets && props.bullets.length > 0
            ? '<ul class="bullets">' +
              props.bullets.map(function (b) {
                return "<li>" + escapeHtml(b) + "</li>";
              }).join("") +
              "</ul>"
            : "") +
          "</section>"
        );

      case "about":
        return (
          '<section class="preview-about">' +
          '<h2>' + escapeHtml(props.title || "") + '</h2>' +
          '<p class="lead">' + escapeHtml(props.lead || "") + '</p>' +
          '<div class="about-grid">' +
          (props.blocks || [])
            .map(function (b) {
              return (
                '<div class="about-card">' +
                '<h3>' + escapeHtml(b.title || "") + '</h3>' +
                '<p>' + escapeHtml(b.text || "") + '</p>' +
                "</div>"
              );
            })
            .join("") +
          "</div>" +
          "</section>"
        );

      case "disciplines":
        return (
          '<section class="preview-disciplines">' +
          '<p class="lead">' + escapeHtml(props.lead || "") + '</p>' +
          '<div class="disciplines-grid">' +
          (props.items || [])
            .map(function (item) {
              return (
                '<div class="discipline-card">' +
                '<span class="discipline-icon">' + escapeHtml(item.icon || "") + '</span>' +
                '<h3>' + escapeHtml(item.title || "") + '</h3>' +
                '<p>' + escapeHtml(item.text || "") + '</p>' +
                "</div>"
              );
            })
            .join("") +
          "</div>" +
          "</section>"
        );

      case "classes":
        return (
          '<section class="preview-classes">' +
          '<p class="lead">' + escapeHtml(props.lead || "") + '</p>' +
          '<p class="days">' + escapeHtml(props.days || "") + '</p>' +
          '<div class="classes-grid">' +
          (props.groups || [])
            .map(function (g) {
              return (
                '<div class="class-card">' +
                '<h3>' + escapeHtml(g.title || "") + '</h3>' +
                '<p>' + escapeHtml(g.text || "") + '</p>' +
                "</div>"
              );
            })
            .join("") +
          "</div>" +
          "</section>"
        );

      case "belts":
        return (
          '<section class="preview-belts">' +
          '<p class="lead">' + escapeHtml(props.lead || "") + '</p>' +
          '<div class="belts-flex">' +
          (props.items || [])
            .map(function (belt) {
              return (
                '<div class="belt-item">' +
                '<div class="belt-circle" style="background-color:' +
                escapeHtml(belt.color || "#fff") +
                "; border-color:" +
                escapeHtml(belt.border || "#ccc") +
                '"></div>' +
                '<span>' + escapeHtml(belt.name || "") + '</span>' +
                "</div>"
              );
            })
            .join("") +
          "</div>" +
          "</section>"
        );

      case "location":
        return (
          '<section class="preview-location">' +
          '<p class="lead">' + escapeHtml(props.lead || "") + '</p>' +
          '<p class="address">' + escapeHtml(props.address || "") + '</p>' +
          (props.mapsEmbed
            ? '<div class="map-embed"><iframe src="' + escapeHtml(props.mapsEmbed) + '" loading="lazy"></iframe></div>'
            : "") +
          "</section>"
        );

      case "contact":
        return (
          '<section class="preview-contact">' +
          '<p class="lead">' + escapeHtml(props.lead || "") + '</p>' +
          '<form class="preview-form" onsubmit="event.preventDefault()">' +
          '<input type="text" placeholder="Nombre" disabled />' +
          '<input type="email" placeholder="Email" disabled />' +
          '<textarea placeholder="Mensaje" rows="3" disabled></textarea>' +
          '<button class="btn btn-primary" type="submit">Enviar</button>' +
          '</form>' +
          "</section>"
        );

      case "text":
        return (
          '<section class="preview-text">' +
          (props.title ? '<h2>' + escapeHtml(props.title || "") + '</h2>' : "") +
          '<p>' + escapeHtml(props.text || "") + '</p>' +
          "</section>"
        );

      case "image":
        var imgHtml = '<img src="' + escapeHtml(props.src || "") + '" alt="' + escapeHtml(props.alt || "") + '" />';
        if (props.link) {
          imgHtml = '<a href="' + escapeHtml(props.link) + '" target="_blank" rel="noopener">' + imgHtml + '</a>';
        }
        return (
          '<section class="preview-image">' +
          '<div class="image-wrapper">' + imgHtml + '</div>' +
          (props.title ? '<h3>' + escapeHtml(props.title) + '</h3>' : "") +
          (props.caption ? '<p class="caption">' + escapeHtml(props.caption) + '</p>' : "") +
          "</section>"
        );

      case "html":
        return (
          '<section class="preview-html">' +
          props.htmlContent +
          "</section>"
        );

      default:
        return '<section class="preview-unknown">Bloque desconocido: ' + escapeHtml(block.type) + "</section>";
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Inicialización
  function initVisualEditor() {
    // Cargar bloques desde storage
    var data = Shinseikan.Storage.load();
    editorState.blocks = data.pageBlocks || [];

    // Inicializar historial
    saveHistory();

    // Renderizar UI
    renderBlocksList();
    renderPropertiesPanel();
    renderPreview();

    // Bindings de botones
    var btnAddHero = qs('[data-add-block="hero"]');
    var btnAddAbout = qs('[data-add-block="about"]');
    var btnAddDisciplines = qs('[data-add-block="disciplines"]');
    var btnAddClasses = qs('[data-add-block="classes"]');
    var btnAddBelts = qs('[data-add-block="belts"]');
    var btnAddLocation = qs('[data-add-block="location"]');
    var btnAddContact = qs('[data-add-block="contact"]');
    var btnAddText = qs('[data-add-block="text"]');
    var btnAddImage = qs('[data-add-block="image"]');
    var btnAddHtml = qs('[data-add-block="html"]');

    if (btnAddHero) btnAddHero.addEventListener("click", function () {
      addBlock("hero");
    });
    if (btnAddAbout) btnAddAbout.addEventListener("click", function () {
      addBlock("about");
    });
    if (btnAddDisciplines) btnAddDisciplines.addEventListener("click", function () {
      addBlock("disciplines");
    });
    if (btnAddClasses) btnAddClasses.addEventListener("click", function () {
      addBlock("classes");
    });
    if (btnAddBelts) btnAddBelts.addEventListener("click", function () {
      addBlock("belts");
    });
    if (btnAddLocation) btnAddLocation.addEventListener("click", function () {
      addBlock("location");
    });
    if (btnAddContact) btnAddContact.addEventListener("click", function () {
      addBlock("contact");
    });
    if (btnAddText) btnAddText.addEventListener("click", function () {
      addBlock("text");
    });
    if (btnAddImage) btnAddImage.addEventListener("click", function () {
      addBlock("image");
    });
    if (btnAddHtml) btnAddHtml.addEventListener("click", function () {
      addBlock("html");
    });

    // Breakpoints
    qsa(".breakpoint-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setBreakpoint(btn.dataset.breakpoint);
      });
    });

    // Undo/Redo
    var btnUndo = qs("#btnUndo");
    var btnRedo = qs("#btnRedo");
    if (btnUndo) btnUndo.addEventListener("click", undo);
    if (btnRedo) btnRedo.addEventListener("click", redo);

    // Guardado manual
    var btnSave = qs("#btnSaveVisual");
    if (btnSave) {
      btnSave.addEventListener("click", function () {
        saveToStorage();
      });
    }

    // Reset
    var btnReset = qs("#btnResetVisual");
    if (btnReset) {
      btnReset.addEventListener("click", function () {
        if (confirm("¿Restaurar bloques desde el contenido legacy? Se perderán los cambios en el editor visual.")) {
          var freshData = Shinseikan.Storage.load();
          editorState.blocks = Shinseikan.Storage.convertLegacyToBlocks(freshData);
          editorState.history = [];
          editorState.historyIndex = -1;
          saveHistory();
          renderBlocksList();
          renderPropertiesPanel();
          renderPreview();
          markDirty(false);
          showNotification("Bloques restaurados", "success");
        }
      });
    }

    // Atajos de teclado
    document.addEventListener("keydown", function (e) {
      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z o Ctrl/Cmd + Y = Redo
      if (((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === "y")) {
        e.preventDefault();
        redo();
      }
      // Ctrl/Cmd + S = Guardar
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveToStorage();
      }
      // Delete = Eliminar bloque seleccionado
      if (e.key === "Delete" && editorState.selectedBlockId) {
        removeBlock(editorState.selectedBlockId);
      }
    });

    showNotification("Editor visual cargado", "success");
  }

  // Exponer funciones globalmente
  window.Shinseikan = window.Shinseikan || {};
  window.Shinseikan.VisualEditor = {
    init: initVisualEditor,
    addBlock: addBlock,
    removeBlock: removeBlock,
    duplicateBlock: duplicateBlock,
    selectBlock: selectBlock,
    undo: undo,
    redo: redo,
    save: saveToStorage,
    setBreakpoint: setBreakpoint
  };
})();
