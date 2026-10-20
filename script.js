/* =====================================================
   MEMORY F1 · Projecte JavaScript (2n DAW)
   Estructura: constants -> estat -> funcions (de dalt cap avall)
   ===================================================== */

/* ---------- 1. CONSTANTS ---------- */
const FILES = 4;
const COLUMNES = 6;
const TOTAL_PARELLES = (FILES * COLUMNES) / 2;   // 12 parelles
const TEMPS_ESPERA = 1000;                       // 1 segon abans de tapar un error

// Les 12 imatges: rutes de les fotos img/pilot1.jpg ... img/pilot12.jpg.
// Cada una apareixerà DUES vegades al tauler.
const ITEMS = Array.from({ length: 12 }, (_, i) => `img/pilot${i + 1}.jpg`);
const PAS_SEMAFOR = 600;                        // ms entre cada llum de sortida

// Efectes de so (carpeta audio/)
const SONS = {
  encert:   new Audio("audio/correct.mp3"),    // parella trobada
  error:    new Audio("audio/error.mp3"),      // parella errònia
  victoria: new Audio("audio/victoria.mp3"),   // joc guanyat
  derrota:  new Audio("audio/derrota.mp3")     // s'ha acabat el temps
};

// 5 nivells: com més difícil, menys temps (en segons) i un fons propi
const NIVELLS = [
  { nom: "Molt fàcil", segons: 300, fons: "img/fondo5.jpg" },
  { nom: "Fàcil",      segons: 240, fons: "img/fondo4.jpg" },
  { nom: "Normal",     segons: 180, fons: "img/fondo3.jpg" },
  { nom: "Difícil",    segons: 120, fons: "img/fondo2.jpg" },
  { nom: "Expert",     segons: 75,  fons: "img/fondo1.jpg" }
];

// Assoliments. "tipus" indica què es mesura:
//   intents  -> menys intents que "limit" en una partida guanyada
//   temps    -> menys segons que "limit" en una partida guanyada
//   partides -> nombre de partides acabades (guanyades o perdudes)
//   nivell   -> haver guanyat una partida al nivell NIVELLS[indexNivell]
const LOGROS = [
  { categoria: "🎯 Precisió", items: [
    { id: "bon-estrateg",     nom: "Bon estrateg",       desc: "Acaba amb menys de 50 intents.", tipus: "intents",  limit: 50 },
    { id: "estrategia-perf",  nom: "Estratègia perfecta", desc: "Acaba amb menys de 40 intents.", tipus: "intents",  limit: 40 },
    { id: "mestre-tactic",    nom: "Mestre tàctic",      desc: "Acaba amb menys de 35 intents.", tipus: "intents",  limit: 35 }
  ]},
  { categoria: "🏎️ Experiència", items: [
    { id: "rookie",           nom: "Rookie",             desc: "Juga 5 partides.",   tipus: "partides", limit: 5 },
    { id: "pilot-titular",    nom: "Pilot titular",      desc: "Juga 25 partides.",  tipus: "partides", limit: 25 },
    { id: "veteran",            nom: "Veterà",             desc: "Juga 100 partides.", tipus: "partides", limit: 100 }
  ]},
  { categoria: "⚡ Velocitat", items: [
    { id: "volta-rapida",     nom: "Volta ràpida",       desc: "Acaba en menys de 2 minuts.",  tipus: "temps", limit: 120 },
    { id: "qualy-perfecta",   nom: "Qualy perfecta",     desc: "Acaba en menys d'1 minut.",    tipus: "temps", limit: 60 },
    { id: "record-absolut",   nom: "Rècord absolut",     desc: "Acaba en menys de 45 segons.", tipus: "temps", limit: 45 }
  ]},
  { categoria: "🏎️ Nivells", items: [
    { id: "karting-champion", nom: "Karting Champion",     desc: "Completa el nivell Molt fàcil.", tipus: "nivell", indexNivell: 0 },
    { id: "talent-emergent",  nom: "Talent emergent",      desc: "Completa el nivell Fàcil.",      tipus: "nivell", indexNivell: 1 },
    { id: "promesa-graella",  nom: "Promesa de la graella", desc: "Completa el nivell Normal.",    tipus: "nivell", indexNivell: 2 },
    { id: "pilot-consolidat", nom: "Pilot consolidat",     desc: "Completa el nivell Difícil.",    tipus: "nivell", indexNivell: 3 },
    { id: "campio-mon",       nom: "Campió del món",       desc: "Completa el nivell Expert.",     tipus: "nivell", indexNivell: 4 }
  ]}
];
const TOTS_ELS_LOGROS = LOGROS.flatMap(c => c.items);
const CLAU_STATS = "memory-stats";
const FONS_INICI = "img/fondo.avif";
const MEDALLES = ["🥇", "🥈", "🥉"];

/* ---------- 2. ESTAT DEL JOC (variables globals) ---------- */
let joc = {
  idPartida: 0,        // augmenta a cada partida nova
  actiu: false,        // true mentre es juga una partida
  bloquejat: false,    // true mentre es comproven 2 caselles (no deixa clicar)
  nivell: null,        // nivell triat
  seleccionades: [],   // caselles destapades pendents de comprovar (màx. 2)
  encerts: 0,
  intents: 0,
  tempsRestant: 0,
  intervalTemps: null  // identificador del setInterval del cronòmetre
};

// Silenci: es recorda a localStorage perquè no cal tornar-lo a posar cada cop
let silenciat = false;
try { silenciat = localStorage.getItem("memory-silenci") === "1"; } catch (e) { /* ignorem */ }

/* ---------- 3. REFERÈNCIES AL DOM ---------- */
const elTauler   = document.getElementById("tauler");
const elTemps    = document.getElementById("temps");
const elIntents  = document.getElementById("intents");
const elParelles = document.getElementById("parelles");
const elRecord   = document.getElementById("record");
const elMissatge = document.getElementById("missatge");
const elBarra    = document.getElementById("barra-progres");
const elModal    = document.getElementById("modal-nivells");
const elLlistaNivells = document.getElementById("llista-nivells");
const elBotoSo   = document.getElementById("btn-so");
const elFlaix    = document.getElementById("flaix");
const elModalClassificacio = document.getElementById("modal-classificacio");
const elResumPartida = document.getElementById("resum-partida");
const elLlistaClassificacio = document.getElementById("llista-classificacio");

const elBotoSoMenu = document.getElementById("btn-so-menu");
const PANTALLES = ["inici", "joc", "logros", "classificacions"];
const elLogrosNous = document.getElementById("logros-nous");

/* ---------- 4. PROGRAMA PRINCIPAL ---------- */
// Punt d'entrada: prepara la pantalla i activa els botons
function main() {
  precarregarImatges();            // evita que les fotos triguin a sortir en girar la carta
  crearTauler(generarBarreja());   // tauler tapat i inactiu
  crearBotonsNivell();
  mostrarRecord(null);
  document.getElementById("btn-inici").addEventListener("click", clicInici);

  // Menú principal i navegació entre pantalles
  document.getElementById("menu-jugar").addEventListener("click", () => { mostrarPantalla("joc"); obrirNivells(); });
  document.getElementById("menu-logros").addEventListener("click", () => mostrarPantalla("logros"));
  document.getElementById("menu-classificacions").addEventListener("click", () => mostrarPantalla("classificacions"));
  document.getElementById("btn-menu-joc").addEventListener("click", sortirAlMenu);
  document.getElementById("btn-menu-final").addEventListener("click", () => { elModalClassificacio.hidden = true; sortirAlMenu(); });
  document.querySelectorAll(".btn-tornar-menu").forEach(b => b.addEventListener("click", () => mostrarPantalla("inici")));
  document.getElementById("btn-esborrar").addEventListener("click", esborrarProgres);
  elBotoSoMenu.addEventListener("click", alternarSo);
  crearPestanyesClassificacio();
  migrarStats();
  mostrarPantalla("inici");
  document.getElementById("btn-cancelar").addEventListener("click", () => {
    tancarNivells();
    if (!joc.actiu && !joc.nivell) mostrarPantalla("inici");   // venia del menú i no ha triat res: tornem
  });
  elBotoSo.addEventListener("click", alternarSo);
  document.getElementById("btn-tancar-classificacio").addEventListener("click", () => {
    elModalClassificacio.hidden = true;
  });
  pintarBotoSo();
}

/* ---------- 4B. NAVEGACIÓ ENTRE PANTALLES ---------- */
// Mostra una sola pantalla i amaga les altres
function mostrarPantalla(nom) {
  PANTALLES.forEach(p => { document.getElementById("pantalla-" + p).hidden = (p !== nom); });
  if (nom === "inici") {
    canviarFons(FONS_INICI);
    pintarComptadorLogros();
  }
  if (nom === "logros") pintarLogros();
  if (nom === "classificacions") pintarClassificacioPestanya();
  window.scrollTo(0, 0);
}

// Torna al menú. Si hi ha una partida en marxa, la cancel·la (amb confirmació)
function sortirAlMenu() {
  if (joc.actiu) {
    if (!confirm("Hi ha una partida en curs. Si surts, la perdràs. Vols sortir?")) return;
  }
  joc.actiu = false;
  joc.bloquejat = false;
  joc.idPartida++;                        // cancel·la el semàfor si encara anava
  aturarTemporitzador();
  aturarSons();
  tancarNivells();
  mostrarPantalla("inici");
}

/* ---------- 5. BOTÓ INICI I NIVELLS ---------- */
// Si hi ha partida en marxa, demana confirmació abans de reiniciar
function clicInici() {
  if (joc.actiu) {
    const reiniciar = confirm("Hi ha una partida en curs. Vols tornar a començar?");
    if (!reiniciar) return;          // si diu que no, la partida continua
  }
  obrirNivells();
}

function obrirNivells() { elModal.hidden = false; }
function tancarNivells() { elModal.hidden = true; }

// Crea un botó per cada nivell de dificultat
function crearBotonsNivell() {
  NIVELLS.forEach((nivell, i) => {
    const boto = document.createElement("button");
    boto.className = "btn-nivell";
    boto.innerHTML = `<span>${i + 1}. ${nivell.nom}</span><span>${formatarTemps(nivell.segons)}</span>`;
    boto.addEventListener("click", () => iniciarPartida(nivell));
    elLlistaNivells.appendChild(boto);
  });
}

/* ---------- 6. INICI DE PARTIDA ---------- */
function iniciarPartida(nivell) {
  tancarNivells();
  aturarTemporitzador();                 // per si venim d'una partida anterior
  aturarSons();                          // talla victòria/derrota de la partida anterior
  canviarFons(nivell.fons);              // fons propi del nivell triat

  // Reinicia l'estat
  joc.actiu = true;
  joc.bloquejat = false;
  joc.nivell = nivell;
  joc.seleccionades = [];
  joc.encerts = 0;
  joc.intents = 0;
  joc.tempsRestant = nivell.segons;

  crearTauler(generarBarreja());         // nova distribució aleatòria
  actualitzarMarcador();
  mostrarRecord(nivell);
  pintarTemps();

  // Bloquegem el tauler fins que s'apaguin els llums (com a la sortida d'una cursa)
  const id = ++joc.idPartida;
  joc.bloquejat = true;
  ferMissatge(`Nivell «${nivell.nom}». Atent al semàfor...`);
  llumsSortida(id, () => {
    joc.bloquejat = false;
    ferMissatge("GO GO GO! Troba les 12 parelles!");
    iniciarTemporitzador();
  });
}

// Encén els 5 llums d'un en un i, quan s'apaguen, executa alAcabar()
function llumsSortida(id, alAcabar) {
  const llums = document.querySelectorAll("#pantalla-joc .llum");
  llums.forEach(l => l.classList.remove("encesa"));
  let n = 0;
  const pas = setInterval(() => {
    if (id !== joc.idPartida) { clearInterval(pas); return; }   // s'ha reiniciat: cancel·lem
    if (n < llums.length) {
      llums[n].classList.add("encesa");
      n++;
    } else {
      clearInterval(pas);
      llums.forEach(l => l.classList.remove("encesa"));        // llums fora = sortida!
      alAcabar();
    }
  }, PAS_SEMAFOR);
}

// Crea la llista de 24 ítems (cada un 2 vegades) i la barreja
function generarBarreja() {
  const parelles = [...ITEMS, ...ITEMS];  // duplica els ítems
  return barrejar(parelles);
}

// Algorisme de Fisher-Yates: barreja un array de forma aleatòria
function barrejar(llista) {
  for (let i = llista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [llista[i], llista[j]] = [llista[j], llista[i]];   // intercanvi
  }
  return llista;
}

/* ---------- 7. TAULER I CASELLES ---------- */
// Dibuixa totes les caselles al tauler
function crearTauler(items) {
  elTauler.innerHTML = "";
  items.forEach(item => elTauler.appendChild(crearCasella(item)));
}

// Carrega les imatges al navegador abans de començar (així ja són a la memòria cau)
function precarregarImatges() {
  ITEMS.forEach(ruta => { new Image().src = ruta; });
  NIVELLS.forEach(n => { new Image().src = n.fons; });   // fons dels nivells
  Object.values(SONS).forEach(so => so.load());           // també els sons
}

// Canvia el fons de la pàgina (la pantalla d'inici usa img/fondo.avif per defecte, definit al CSS)
function canviarFons(ruta) {
  document.body.style.setProperty("--fons", `url("${ruta}")`);
}

// Reprodueix un so des del principi (permet repetir-lo ràpid)
function ferSo(nom) {
  if (silenciat) return;                 // silenciat: no sona res
  const so = SONS[nom];
  so.currentTime = 0;
  so.play().catch(() => { /* el navegador pot bloquejar l'àudio: ignorem l'error */ });
}

// Botó 🔊/🔇: activa o desactiva tots els sons
function alternarSo() {
  silenciat = !silenciat;
  if (silenciat) aturarSons();           // talla el que estigui sonant ara mateix
  try { localStorage.setItem("memory-silenci", silenciat ? "1" : "0"); } catch (e) { /* ignorem */ }
  pintarBotoSo();
}

// Actualitza la icona i el text d'accessibilitat del botó
function pintarBotoSo() {
  const text = silenciat ? "Activa els sons" : "Silencia els sons";
  [elBotoSo, elBotoSoMenu].forEach(boto => {
    boto.textContent = silenciat ? "🔇" : "🔊";
    boto.setAttribute("aria-pressed", String(silenciat));
    boto.setAttribute("aria-label", text);
    boto.title = text;
  });
}

// Atura tots els sons (en reiniciar partida)
function aturarSons() {
  Object.values(SONS).forEach(so => { so.pause(); so.currentTime = 0; });
}

// Crea una casella: botó amb cara de darrere (tapada) i de davant (la foto)
function crearCasella(item) {
  const casella = document.createElement("button");
  casella.className = "casella tapada";
  casella.dataset.item = item;           // guardem quina foto amaga (la ruta)
  const numero = item.match(/\d+/)[0];   // número del pilot, per al text alternatiu
  casella.setAttribute("aria-label", "Casella tapada");
  casella.innerHTML = `<span class="cara darrera"></span><span class="cara davant"><img src="${item}" alt="Pilot ${numero}"></span>`;
  casella.addEventListener("click", () => clicCasella(casella));
  return casella;
}

/* ---------- 8. LÒGICA DEL JOC ---------- */
// S'executa cada cop que el jugador prem una casella
function clicCasella(casella) {
  // Ignorem el clic si: no hi ha partida, estem comprovant, o la casella ja està destapada
  if (!joc.actiu || joc.bloquejat) return;
  if (!casella.classList.contains("tapada")) return;

  destapar(casella);
  joc.seleccionades.push(casella);

  // Quan hi ha 2 caselles destapades, les comprovem
  if (joc.seleccionades.length === 2) {
    joc.intents++;
    actualitzarMarcador();
    comprovarParella();
  }
}

// Canvia la classe CSS: tapada -> destapada
function destapar(casella) {
  casella.classList.replace("tapada", "destapada");
  casella.setAttribute("aria-label", casella.querySelector("img").alt);
}

// Canvia la classe CSS: destapada -> tapada
function tapar(casella) {
  casella.classList.remove("error");
  casella.classList.replace("destapada", "tapada");
  casella.setAttribute("aria-label", "Casella tapada");
}

// Compara les dues caselles seleccionades
function comprovarParella() {
  const [a, b] = joc.seleccionades;
  joc.bloquejat = true;                    // evita clics mentre es comprova

  if (a.dataset.item === b.dataset.item) {
    ferMatch(a, b);
  } else {
    ferError(a, b);
  }
}

// Les dues coincideixen: queden destapades per sempre
function ferMatch(a, b) {
  a.classList.replace("destapada", "encertada");
  b.classList.replace("destapada", "encertada");
  joc.encerts++;
  joc.seleccionades = [];
  joc.bloquejat = false;
  actualitzarMarcador();

  if (joc.encerts === TOTAL_PARELLES) {
    acabarPartida(true);                   // totes trobades (sona la victòria)
  } else {
    ferSo("encert");
  }
}

// No coincideixen: després d'1 segon es tapen
function ferError(a, b) {
  ferSo("error");
  a.classList.add("error");
  b.classList.add("error");
  setTimeout(() => {
    // Si la partida ha acabat mentrestant, no fem res
    if (!joc.actiu) return;
    tapar(a);
    tapar(b);
    joc.seleccionades = [];
    joc.bloquejat = false;
  }, TEMPS_ESPERA);
}

/* ---------- 9. TEMPORITZADOR ---------- */
function iniciarTemporitzador() {
  pintarTemps();
  joc.intervalTemps = setInterval(() => {
    joc.tempsRestant--;
    pintarTemps();
    if (joc.tempsRestant <= 0) acabarPartida(false);   // s'ha acabat el temps
  }, 1000);
}

function aturarTemporitzador() {
  clearInterval(joc.intervalTemps);
}

// Mostra el temps i actualitza la barra de progrés
function pintarTemps() {
  elTemps.textContent = formatarTemps(joc.tempsRestant);
  const percentatge = (joc.tempsRestant / joc.nivell.segons) * 100;
  elBarra.style.width = percentatge + "%";
  elBarra.classList.toggle("poc-temps", percentatge < 25);   // vermell si queda poc
}

// Converteix segons a format m:ss (ex: 125 -> "2:05")
function formatarTemps(segons) {
  const m = Math.floor(segons / 60);
  const s = String(segons % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/* ---------- 10. FINAL DE PARTIDA ---------- */
function acabarPartida(haGuanyat) {
  joc.actiu = false;
  aturarTemporitzador();

  let tempsUsat = null;
  if (haGuanyat) {
    tempsUsat = joc.nivell.segons - joc.tempsRestant;
    const esRecord = guardarRecord(tempsUsat);
    if (esRecord) {
      ferMissatge(`🏁 POLE POSITION! Nou rècord: ${formatarTemps(tempsUsat)} i ${joc.intents} intents!`, "victoria pole");
      flaixLila();
    } else {
      ferMissatge(`🎉 Has guanyat en ${formatarTemps(tempsUsat)} i ${joc.intents} intents!`, "victoria");
    }
    mostrarRecord(joc.nivell);
    ferSo("victoria");
  } else {
    ferSo("derrota");
    destaparTot();
    ferMissatge("⏰ S'ha acabat el temps. Torna-ho a provar!", "derrota");
  }

  const nous = registrarPartida(haGuanyat, tempsUsat);   // actualitza estadístiques i detecta assoliments nous
  mostrarClassificacio(haGuanyat, tempsUsat);
  mostrarLogrosNous(nous);
}

// Fa parpellejar la pantalla en lila (3 cops) per celebrar el rècord
function flaixLila() {
  elFlaix.classList.remove("actiu");
  void elFlaix.offsetWidth;              // força el navegador a reiniciar l'animació
  elFlaix.classList.add("actiu");
  setTimeout(() => elFlaix.classList.remove("actiu"), 1600);
}

// Mostra totes les caselles que no s'havien trobat
function destaparTot() {
  document.querySelectorAll(".casella.tapada").forEach(destapar);
}

/* ---------- 11. RÈCORD (localStorage) ---------- */
// Cada nivell té el seu propi rècord (el temps més baix)
function guardarRecord(temps) {
  const clau = "memory-record-" + joc.nivell.nom;
  try {
    const anterior = Number(localStorage.getItem(clau));
    if (!anterior || temps < anterior) {
      localStorage.setItem(clau, temps);
      return true;
    }
  } catch (e) { /* si localStorage no funciona, ignorem el rècord */ }
  return false;
}

function mostrarRecord(nivell) {
  if (!nivell) { elRecord.textContent = "--"; return; }
  try {
    const r = localStorage.getItem("memory-record-" + nivell.nom);
    elRecord.textContent = r ? formatarTemps(Number(r)) : "--";
  } catch (e) { elRecord.textContent = "--"; }
}

/* ---------- 11B. CLASSIFICACIÓ TOP 10 ---------- */
// La classificació es guarda per nivell al navegador. Només hi entren partides guanyades.
function clauClassificacio(nivell) {
  return "memory-classificacio-" + nivell.nom;
}

function llegirClassificacio(nivell) {
  try {
    const dades = JSON.parse(localStorage.getItem(clauClassificacio(nivell)) || "[]");
    return Array.isArray(dades) ? dades : [];
  } catch (e) {
    return [];
  }
}

function mostrarClassificacio(haGuanyat, tempsUsat) {
  let posicioActual = -1;
  if (haGuanyat) {
    const resultats = llegirClassificacio(joc.nivell);
    const nouResultat = { temps: tempsUsat, intents: joc.intents, data: Date.now() };
    resultats.push(nouResultat);
    resultats.sort((a, b) => a.temps - b.temps || a.intents - b.intents || a.data - b.data);
    const top10 = resultats.slice(0, 10);
    posicioActual = top10.findIndex(r => r.data === nouResultat.data);
    try { localStorage.setItem(clauClassificacio(joc.nivell), JSON.stringify(top10)); } catch (e) { /* ignorem */ }
    if (posicioActual >= 0) {
      elResumPartida.textContent = `Has acabat en ${formatarTemps(tempsUsat)} amb ${joc.intents} intents. Posició: ${posicioActual + 1} de 10.`;
    } else {
      elResumPartida.textContent = `Has acabat en ${formatarTemps(tempsUsat)} amb ${joc.intents} intents, però no has entrat al Top 10.`;
    }
  } else {
    elResumPartida.textContent = "No has completat totes les parelles. Aquesta partida no compta com a temps classificat.";
  }

  pintarTaulaClassificacio(elLlistaClassificacio, llegirClassificacio(joc.nivell), haGuanyat ? posicioActual : -1);
  elModalClassificacio.hidden = false;
}

// Omple un <tbody> amb 10 files (buides si encara no hi ha resultat)
function pintarTaulaClassificacio(tbody, resultats, posicioDestacada) {
  tbody.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const resultat = resultats[i];
    const fila = document.createElement("tr");
    if (resultat && i === posicioDestacada) fila.classList.add("resultat-actual");
    // Top 3 sempre amb medalla i color (també buit), igual a tots els nivells
    if (i < 3) fila.classList.add("podi", "podi-" + (i + 1));
    const posicio = i < 3 ? MEDALLES[i] : i + 1;
    fila.innerHTML = resultat
      ? `<td>${posicio}</td><td>${formatarTemps(resultat.temps)}</td><td>${resultat.intents}</td>`
      : `<td>${posicio}</td><td class="temps-buit">--------</td><td>—</td>`;
    tbody.appendChild(fila);
  }
}

/* ---------- 11C. PANTALLA DE CLASSIFICACIONS ---------- */
let nivellVist = 0;   // pestanya triada (índex a NIVELLS)

function crearPestanyesClassificacio() {
  const contenidor = document.getElementById("pestanyes-nivells");
  NIVELLS.forEach((nivell, i) => {
    const boto = document.createElement("button");
    boto.className = "pestanya";
    boto.setAttribute("role", "tab");
    boto.textContent = nivell.nom;
    boto.addEventListener("click", () => { nivellVist = i; pintarClassificacioPestanya(); });
    contenidor.appendChild(boto);
  });
}

function pintarClassificacioPestanya() {
  document.querySelectorAll(".pestanya").forEach((b, i) => {
    b.classList.toggle("activa", i === nivellVist);
    b.setAttribute("aria-selected", String(i === nivellVist));
  });
  pintarTaulaClassificacio(document.getElementById("llista-classificacions"), llegirClassificacio(NIVELLS[nivellVist]), -1);
}

/* ---------- 11D. ESTADÍSTIQUES I ASSOLIMENTS ---------- */
// Estadístiques globals (totes les partides, de qualsevol nivell):
//   partides: partides acabades · millorIntents / millorTemps: millor marca en una victòria (null si cap)
//   nivells: noms dels nivells en què s'ha guanyat almenys una vegada
function llegirStats() {
  const base = { partides: 0, millorIntents: null, millorTemps: null, nivells: [] };
  try {
    return Object.assign(base, JSON.parse(localStorage.getItem(CLAU_STATS) || "{}"));
  } catch (e) { return base; }
}

// Només s'executa una vegada: si les estadístiques són d'abans dels assoliments de nivell,
// dedueix els nivells ja guanyats a partir de les classificacions guardades.
function migrarStats() {
  try {
    const crues = JSON.parse(localStorage.getItem(CLAU_STATS) || "null");
    if (crues && Array.isArray(crues.nivells)) return;      // ja té el camp: res a fer
    const stats = llegirStats();
    stats.nivells = NIVELLS.filter(n => llegirClassificacio(n).length > 0).map(n => n.nom);
    if (crues || stats.nivells.length > 0) guardarStats(stats);
  } catch (e) { /* ignorem */ }
}

function guardarStats(stats) {
  try { localStorage.setItem(CLAU_STATS, JSON.stringify(stats)); } catch (e) { /* ignorem */ }
}

// Un assoliment està desbloquejat si les estadístiques compleixen la condició
function logroDesbloquejat(logro, stats) {
  if (logro.tipus === "partides") return stats.partides >= logro.limit;
  if (logro.tipus === "intents")  return stats.millorIntents !== null && stats.millorIntents < logro.limit;
  if (logro.tipus === "temps")    return stats.millorTemps !== null && stats.millorTemps < logro.limit;
  if (logro.tipus === "nivell")   return stats.nivells.includes(NIVELLS[logro.indexNivell].nom);
  return false;
}

// Es crida en acabar cada partida. Retorna la llista d'assoliments desbloquejats ARA.
function registrarPartida(haGuanyat, tempsUsat) {
  const abans = llegirStats();
  const despres = { ...abans, partides: abans.partides + 1 };
  if (haGuanyat) {
    if (!despres.nivells.includes(joc.nivell.nom)) despres.nivells = [...despres.nivells, joc.nivell.nom];
    if (despres.millorIntents === null || joc.intents < despres.millorIntents) despres.millorIntents = joc.intents;
    if (despres.millorTemps === null || tempsUsat < despres.millorTemps) despres.millorTemps = tempsUsat;
  }
  guardarStats(despres);
  return TOTS_ELS_LOGROS.filter(l => !logroDesbloquejat(l, abans) && logroDesbloquejat(l, despres));
}

// Avís dins la finestra de final de partida
function mostrarLogrosNous(nous) {
  if (nous.length === 0) { elLogrosNous.hidden = true; return; }
  elLogrosNous.innerHTML = "<h3>🏆 Assoliment desbloquejat!</h3>" +
    nous.map(l => `<p><strong>${l.nom}</strong><br><span>${l.desc}</span></p>`).join("");
  elLogrosNous.hidden = false;
}

// Text de progrés de cada assoliment (ex: "3 / 5 partides" o "Millor: 42 intents")
function textProgres(logro, stats) {
  if (logro.tipus === "partides") return `${Math.min(stats.partides, logro.limit)} / ${logro.limit} partides`;
  if (logro.tipus === "nivell")   return "Encara no completat";
  if (logro.tipus === "intents")  return stats.millorIntents === null ? "Cap victòria encara" : `Millor: ${stats.millorIntents} intents`;
  return stats.millorTemps === null ? "Cap victòria encara" : `Millor: ${formatarTemps(stats.millorTemps)}`;
}

function percentatgeProgres(logro, stats) {
  if (logro.tipus === "partides") return Math.min(100, (stats.partides / logro.limit) * 100);
  return 0;   // en precisió/velocitat només mostrem la teva millor marca
}

function pintarLogros() {
  const stats = llegirStats();
  const cont = document.getElementById("llista-logros");
  cont.innerHTML = "";
  LOGROS.forEach(cat => {
    const seccio = document.createElement("section");
    seccio.className = "logro-categoria";
    seccio.innerHTML = `<h2>${cat.categoria}</h2>`;
    cat.items.forEach(logro => {
      const ok = logroDesbloquejat(logro, stats);
      const targeta = document.createElement("article");
      targeta.className = "logro " + (ok ? "desbloquejat" : "bloquejat");
      const barra = logro.tipus === "partides"
        ? `<div class="logro-barra"><div style="width:${percentatgeProgres(logro, stats)}%"></div></div>` : "";
      targeta.innerHTML =
        `<span class="logro-icona" aria-hidden="true">${ok ? "✅" : "🔒"}</span>` +
        `<div class="logro-text"><h3>${logro.nom}</h3><p>${logro.desc}</p>${barra}` +
        `<small>${ok ? "Desbloquejat" : textProgres(logro, stats)}</small></div>`;
      seccio.appendChild(targeta);
    });
    cont.appendChild(seccio);
  });
  const total = TOTS_ELS_LOGROS.length;
  const fets = TOTS_ELS_LOGROS.filter(l => logroDesbloquejat(l, stats)).length;
  document.getElementById("resum-logros").textContent = `${fets} de ${total} assoliments desbloquejats`;

  // Barra de progrés global
  const pct = Math.round((fets / total) * 100);
  document.getElementById("progres-global-omplert").style.width = pct + "%";
  document.getElementById("progres-global-text").textContent = pct + "%";
  document.querySelector(".progres-global").setAttribute("aria-valuenow", String(pct));
}

// Comptador al botó del menú principal
function pintarComptadorLogros() {
  const stats = llegirStats();
  const fets = TOTS_ELS_LOGROS.filter(l => logroDesbloquejat(l, stats)).length;
  document.getElementById("menu-logros-comptador").textContent = `${fets}/${TOTS_ELS_LOGROS.length}`;
}

// Esborra rècords, classificacions i estadístiques (no toca el silenci)
function esborrarProgres() {
  if (!confirm("Segur que vols esborrar rècords, classificacions i assoliments? No es pot desfer.")) return;
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith("memory-") && k !== "memory-silenci")
      .forEach(k => localStorage.removeItem(k));
  } catch (e) { /* ignorem */ }
  pintarLogros();
}

/* ---------- 12. UTILITATS D'INTERFÍCIE ---------- */
function actualitzarMarcador() {
  elIntents.textContent = joc.intents;
  elParelles.textContent = `${joc.encerts} / ${TOTAL_PARELLES}`;
}

// Escriu un missatge; "tipus" afegeix una classe CSS (victoria / derrota)
function ferMissatge(text, tipus = "") {
  elMissatge.textContent = text;
  elMissatge.className = "missatge " + tipus;
}

/* ---------- ARRENQUEM ---------- */
main();
