/* global window */
(function () {
  "use strict";

  var Shinseikan = (window.Shinseikan = window.Shinseikan || {});

  var KEY = "shinseikan_site_v1";
  var AUTH_KEY = "shinseikan_admin_authed_v1";

  // Estructura de bloques para el Editor Visual
  // Cada bloque tiene: id, type, props, styles (opcional), meta (opcional)
  function convertLegacyToBlocks(data) {
    var blocks = [];
    
    // Hero block
    blocks.push({
      id: Shinseikan.uid(),
      type: "hero",
      props: {
        kicker: data.landing.heroKicker || "",
        title: data.landing.heroTitle || "",
        subtitle: data.landing.heroSubtitle || "",
        primaryCta: data.landing.heroPrimaryCta || "",
        secondaryCta: data.landing.heroSecondaryCta || "",
        bullets: data.landing.heroBullets || []
      },
      styles: {}
    });
    
    // About block
    blocks.push({
      id: Shinseikan.uid(),
      type: "about",
      props: {
        title: data.landing.aboutTitle || "",
        lead: data.landing.aboutLead || "",
        blocks: data.landing.aboutBlocks || []
      },
      styles: {}
    });
    
    // Disciplines block
    blocks.push({
      id: Shinseikan.uid(),
      type: "disciplines",
      props: {
        lead: data.landing.disciplinesLead || "",
        items: data.landing.disciplines || []
      },
      styles: {}
    });
    
    // Classes block
    blocks.push({
      id: Shinseikan.uid(),
      type: "classes",
      props: {
        lead: data.landing.classesLead || "",
        days: data.landing.classesDays || "",
        groups: data.landing.classGroups || []
      },
      styles: {}
    });
    
    // Belts block
    blocks.push({
      id: Shinseikan.uid(),
      type: "belts",
      props: {
        lead: data.landing.beltsLead || "",
        items: data.landing.belts || []
      },
      styles: {}
    });
    
    // Location block
    blocks.push({
      id: Shinseikan.uid(),
      type: "location",
      props: {
        lead: data.landing.locationLead || "",
        address: data.contact.address || "",
        mapsEmbed: data.contact.mapsEmbed || ""
      },
      styles: {}
    });
    
    // Contact form block
    blocks.push({
      id: Shinseikan.uid(),
      type: "contact",
      props: {
        lead: data.landing.formLead || "",
        whatsappPhone: data.contact.whatsappPhone || ""
      },
      styles: {}
    });
    
    // Extra blocks (legacy)
    if (data.extraBlocks && Array.isArray(data.extraBlocks)) {
      data.extraBlocks.forEach(function(b) {
        blocks.push({
          id: b.id || Shinseikan.uid(),
          type: "text",
          props: {
            title: b.title || "",
            text: b.text || ""
          },
          styles: {}
        });
      });
    }
    
    return blocks;
  }
  
  function convertBlocksToLegacy(blocks, data) {
    // Convierte bloques de vuelta al formato legacy para compatibilidad
    blocks.forEach(function(block) {
      switch(block.type) {
        case "hero":
          data.landing.heroKicker = block.props.kicker || "";
          data.landing.heroTitle = block.props.title || "";
          data.landing.heroSubtitle = block.props.subtitle || "";
          data.landing.heroPrimaryCta = block.props.primaryCta || "";
          data.landing.heroSecondaryCta = block.props.secondaryCta || "";
          data.landing.heroBullets = block.props.bullets || [];
          break;
        case "about":
          data.landing.aboutTitle = block.props.title || "";
          data.landing.aboutLead = block.props.lead || "";
          data.landing.aboutBlocks = block.props.blocks || [];
          break;
        case "disciplines":
          data.landing.disciplinesLead = block.props.lead || "";
          data.landing.disciplines = block.props.items || [];
          break;
        case "classes":
          data.landing.classesLead = block.props.lead || "";
          data.landing.classesDays = block.props.days || "";
          data.landing.classGroups = block.props.groups || [];
          break;
        case "belts":
          data.landing.beltsLead = block.props.lead || "";
          data.landing.belts = block.props.items || [];
          break;
        case "location":
          data.landing.locationLead = block.props.lead || "";
          data.contact.address = block.props.address || "";
          data.contact.mapsEmbed = block.props.mapsEmbed || "";
          break;
        case "contact":
          data.landing.formLead = block.props.lead || "";
          data.contact.whatsappPhone = block.props.whatsappPhone || "";
          break;
        case "text":
          data.extraBlocks = data.extraBlocks || [];
          data.extraBlocks.push({
            id: block.id,
            title: block.props.title || "",
            text: block.props.text || ""
          });
          break;
      }
    });
    return data;
  }

  // Defaults: contenido inicial listo para publicar.
  var DEFAULTS = {
    version: 2,
    brand: {
      name: "Shinseikan Karate",
      tagline: "Asociación de Okinawa Karate Do",
      sensei: "Alejandro Peralta",
      logoDataUrl: "",
      logoAlt: "Shinseikan Karate"
    },
    contact: {
      whatsappPhone: "543516742868",
      address: "Carlos Tejedor 1165, Córdoba, Argentina (Barrio San Vicente)",
      mapsUrl: "https://www.google.com/maps?q=Carlos+Tejedor+1165,+C%C3%B3rdoba,+Argentina",
      mapsEmbed:
        "https://www.google.com/maps?q=Carlos+Tejedor+1165,+C%C3%B3rdoba,+Argentina&output=embed"
    },
    landing: {
      heroKicker: "Okinawa Karate Do",
      heroTitle: "Disciplina, respeto y tradición",
      heroSubtitle:
        "Karate (Goju Ryu) · Kobudo · Aikido · Defensa personal — Clases de lunes a sábados en San Vicente, Córdoba.",
      heroPrimaryCta: "Inscribite ahora",
      heroSecondaryCta: "Ver clases",
      heroBullets: [
        "Clases para niños, adolescentes y adultos",
        "Formación tradicional con enfoque moderno",
        "Consultas e inscripción por WhatsApp"
      ],
      aboutTitle: "Sobre el Dojo",
      aboutLead: "Una escuela para entrenar cuerpo y mente, con respeto por la tradición.",
      aboutBlocks: [
        {
          title: "La escuela",
          text: "Shinseikan Karate es una asociación dedicada al Okinawa Karate Do, con un entrenamiento serio, claro y progresivo."
        },
        {
          title: "Filosofía",
          text: "Formamos disciplina y carácter: respeto, constancia, autocontrol y mejora continua dentro y fuera del tatami."
        },
        {
          title: "Goju Ryu",
          text: "Un estilo tradicional que integra dureza y suavidad: técnica, respiración y aplicación práctica con fundamentos sólidos."
        }
      ],
      disciplinesLead: "Entrenamiento integral: técnica, control, coordinación y conciencia corporal.",
      disciplines: [
        { id: "karate", title: "Karate (Goju Ryu)", icon: "拳", text: "Técnica, kata, kumite y valores. Base principal del dojo." },
        { id: "kobudo", title: "Kobudo", icon: "棒", text: "Armas tradicionales: coordinación, distancia y control." },
        { id: "aikido", title: "Aikido", icon: "合", text: "Proyección, equilibrio y armonía del movimiento." },
        { id: "defensa", title: "Defensa personal", icon: "盾", text: "Recursos prácticos: prevención, respuesta y confianza." }
      ],
      classesLead: "De lunes a sábados. Consultá horarios y niveles disponibles.",
      classesDays: "Lunes a Sábados",
      classGroups: [
        { id: "kids", title: "Niños", text: "Coordinación, respeto y hábitos. Clases dinámicas y seguras." },
        { id: "teens", title: "Adolescentes", text: "Técnica y condición física con disciplina, enfoque y motivación." },
        { id: "adults", title: "Adultos", text: "Entrenamiento progresivo: defensa, técnica y bienestar." }
      ],
      beltsLead: "Progresión visual — constancia, técnica y valores.",
      belts: [
        { name: "Blanco", color: "#ffffff", border: "#dcdcdc" },
        { name: "Amarillo", color: "#f4d35e", border: "#e5c34f" },
        { name: "Naranja", color: "#f08c3a", border: "#e07d2c" },
        { name: "Verde", color: "#2a9d55", border: "#258a4a" },
        { name: "Azul", color: "#2b6edb", border: "#2159b5" },
        { name: "Marrón", color: "#7a4a2a", border: "#6a3f23" },
        { name: "Negro", color: "#0b0b0b", border: "#0b0b0b" }
      ],
      locationLead: "Carlos Tejedor 1165, Córdoba, Argentina (Barrio San Vicente)",
      formLead: "Dejanos tus datos y te contactamos por WhatsApp."
    },
    shop: {
      lead: "Equipamiento y marca del dojo — encargá por WhatsApp.",
      categories: ["Uniformes", "Protección", "Accesorios", "Marca KAI"],
      products: [
        {
          id: "belt",
          name: "Cinto",
          desc: "Cintos para práctica (consultar graduación).",
          category: "Accesorios",
          imageDataUrl: "",
          basePrice: 0,
          variants: [
            { label: "Blanco", price: 0 },
            { label: "Amarillo", price: 0 },
            { label: "Naranja", price: 0 },
            { label: "Verde", price: 0 },
            { label: "Azul", price: 0 },
            { label: "Marrón", price: 0 },
            { label: "Negro", price: 0 }
          ]
        },
        {
          id: "gi",
          name: "Karate Gi (Kimono)",
          desc: "Uniforme para entrenamiento. Elegí talle.",
          category: "Uniformes",
          imageDataUrl: "",
          basePrice: 0,
          variants: [
            { label: "Talle S", price: 0 },
            { label: "Talle M", price: 0 },
            { label: "Talle L", price: 0 },
            { label: "Talle XL", price: 0 }
          ]
        },
        {
          id: "tshirt",
          name: "Remera KAI",
          desc: "Remera de la marca KAI.",
          category: "Marca KAI",
          imageDataUrl: "",
          basePrice: 0,
          variants: [
            { label: "Negra - S", price: 0 },
            { label: "Negra - M", price: 0 },
            { label: "Negra - L", price: 0 },
            { label: "Negra - XL", price: 0 }
          ]
        },
        {
          id: "mug",
          name: "Taza KAI",
          desc: "Taza cerámica — ideal para regalo.",
          category: "Marca KAI",
          imageDataUrl: "",
          basePrice: 0,
          variants: []
        },
        {
          id: "chest",
          name: "Pechera",
          desc: "Protección para entrenamiento.",
          category: "Protección",
          imageDataUrl: "",
          basePrice: 0,
          variants: [{ label: "Talle único", price: 0 }]
        },
        {
          id: "gloves",
          name: "Guantes",
          desc: "Guantes de entrenamiento.",
          category: "Protección",
          imageDataUrl: "",
          basePrice: 0,
          variants: [
            { label: "S", price: 0 },
            { label: "M", price: 0 },
            { label: "L", price: 0 }
          ]
        },
        {
          id: "mouthguard",
          name: "Bucal",
          desc: "Protección dental para práctica.",
          category: "Protección",
          imageDataUrl: "",
          basePrice: 0,
          variants: [
            { label: "Niños", price: 0 },
            { label: "Adultos", price: 0 }
          ]
        }
      ]
    },
    extraBlocks: [],
    // Nueva estructura de bloques para el Editor Visual
    pageBlocks: []
  };

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function mergeDeep(base, patch) {
    if (Array.isArray(base) && Array.isArray(patch)) return patch.slice();
    if (isObject(base) && isObject(patch)) {
      var out = {};
      Object.keys(base).forEach(function (k) {
        out[k] = base[k];
      });
      Object.keys(patch).forEach(function (k) {
        if (k in base) out[k] = mergeDeep(base[k], patch[k]);
        else out[k] = patch[k];
      });
      return out;
    }
    return patch === undefined ? base : patch;
  }

  Shinseikan.Storage = {
    key: KEY,
    authKey: AUTH_KEY,
    defaults: DEFAULTS,
    load: function () {
      try {
        var raw = window.localStorage.getItem(KEY);
        var data;
        if (!raw) {
          data = JSON.parse(JSON.stringify(DEFAULTS));
        } else {
          var parsed = JSON.parse(raw);
          data = mergeDeep(DEFAULTS, parsed);
        }
        // Inicializar pageBlocks si no existe (migración desde v1)
        if (!data.pageBlocks || data.pageBlocks.length === 0) {
          data.pageBlocks = convertLegacyToBlocks(data);
        }
        return data;
      } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULTS));
      }
    },
    save: function (data) {
      // Antes de guardar, sincronizar legacy con pageBlocks
      if (data.pageBlocks && data.pageBlocks.length > 0) {
        // Crear una copia limpia para legacy
        var cleanData = JSON.parse(JSON.stringify(data));
        cleanData.extraBlocks = [];
        convertBlocksToLegacy(data.pageBlocks, cleanData);
        // Copiar valores legacy de vuelta al data original
        data.landing = cleanData.landing;
        data.contact = cleanData.contact;
        data.extraBlocks = cleanData.extraBlocks;
      }
      window.localStorage.setItem(KEY, JSON.stringify(data));
    },
    reset: function () {
      window.localStorage.removeItem(KEY);
    },
    isAuthed: function () {
      return window.localStorage.getItem(AUTH_KEY) === "1";
    },
    setAuthed: function (value) {
      window.localStorage.setItem(AUTH_KEY, value ? "1" : "0");
    },
    // Funciones públicas para el editor visual
    convertLegacyToBlocks: convertLegacyToBlocks,
    convertBlocksToLegacy: convertBlocksToLegacy
  };
})();

