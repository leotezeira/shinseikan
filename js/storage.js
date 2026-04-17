/* global window */
(function () {
  "use strict";

  var Shinseikan = (window.Shinseikan = window.Shinseikan || {});

  var KEY = "shinseikan_site_v1";
  var AUTH_KEY = "shinseikan_admin_authed_v1";

  // Defaults: contenido inicial listo para publicar.
  var DEFAULTS = {
    version: 1,
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
    extraBlocks: []
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
        if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
        var parsed = JSON.parse(raw);
        return mergeDeep(DEFAULTS, parsed);
      } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULTS));
      }
    },
    save: function (data) {
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
    }
  };
})();

