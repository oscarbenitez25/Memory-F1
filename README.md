# 🏎️ Memory F1 · Pit Stop

> Joc de memòria de parelles amb temàtica de Fórmula 1. Troba totes les parelles de pilots abans que s'acabi el temps, escala a les classificacions i desbloqueja assoliments.

---

## 📖 Descripció

**Memory F1** és un joc de memòria clàssic ambientat al món de la Fórmula 1. El tauler té **24 caselles (6 × 4)** que amaguen **12 parelles de pilots**. L'objectiu és destapar-les de dues en dues i trobar totes les parelles abans que el cronòmetre arribi a zero.

El joc comença amb un **semàfor de sortida** de 5 llums, com en una cursa real: quan s'apaguen, el temps comença a córrer. Inclou 5 nivells de dificultat, classificacions Top 10, un sistema de 14 assoliments, efectes de so i molt més.

Projecte desenvolupat amb **HTML, CSS i JavaScript pur**, sense frameworks ni llibreries externes. Fet per a l'assignatura de JavaScript de **2n de DAW**.

---

## ✨ Característiques

- 🚦 **Semàfor de sortida:** 5 llums que s'encenen una a una i s'apaguen per donar la sortida.
- 🎚️ **5 nivells de dificultat**, cadascun amb el seu temps límit i el seu fons propi.
- ⏱️ **Cronòmetre i barra de progrés** que passa a vermell quan queda poc temps.
- 🏁 **Rècord personal per nivell**, amb el missatge i l'efecte de flaix lila de *Pole Position* quan el superes.
- 📊 **Classificació Top 10** per nivell, amb podi 🥇🥈🥉 i pestanyes per consultar cada nivell.
- 🏆 **14 assoliments** repartits en 4 categories, amb barra de progrés global.
- 🔊 **Efectes de so** (encert, error, victòria i derrota) amb botó per silenciar, que es recorda entre sessions.
- 💾 **Progrés persistent** gràcies a `localStorage`: rècords, classificacions i estadístiques es mantenen en tancar el navegador.
- ♿ **Accessibilitat:** `aria-label`, `aria-live`, `aria-pressed`, rols `tab` i `progressbar`.
- 📱 **Disseny responsive** i estètica F1 (pianes vermell/blanc, bandera de quadres, paleta asfalt/vermell).

---

## 🎮 Com es juga

1. Prem **🏁 Jugar** al menú principal i **tria un nivell**.
2. Atent al **semàfor**: quan s'apaguin els 5 llums, comença la cursa.
3. Fes clic a dues caselles per destapar-les.
   - ✅ Si coincideixen, queden destapades (en lila) per sempre.
   - ❌ Si no coincideixen, es tapen després d'1 segon.
4. Troba les **12 parelles** abans que s'acabi el temps.
5. Al final es mostra la **classificació Top 10** del nivell i els possibles assoliments nous.

> ⚠️ Si surts al menú o reinicies amb una partida en curs, el joc et demanarà confirmació, ja que la partida es perd.

---

## 🎚️ Nivells de dificultat

| # | Nivell | Temps límit |
|:-:|--------|:-----------:|
| 1 | Molt fàcil | 5:00 |
| 2 | Fàcil | 4:00 |
| 3 | Normal | 3:00 |
| 4 | Difícil | 2:00 |
| 5 | Expert | 1:15 |

---

## 🏆 Assoliments

Hi ha **14 assoliments** distribuïts en 4 categories:

| Categoria | Assoliment | Condició |
|-----------|------------|----------|
| 🎯 **Precisió** | Bon estrateg | Acaba amb menys de 50 intents |
| | Estratègia perfecta | Acaba amb menys de 40 intents |
| | Mestre tàctic | Acaba amb menys de 35 intents |
| 🏎️ **Experiència** | Rookie | Juga 5 partides |
| | Pilot titular | Juga 25 partides |
| | Veterà | Juga 100 partides |
| ⚡ **Velocitat** | Volta ràpida | Acaba en menys de 2 minuts |
| | Qualy perfecta | Acaba en menys d'1 minut |
| | Rècord absolut | Acaba en menys de 45 segons |
| 🏎️ **Nivells** | Karting Champion | Completa el nivell Molt fàcil |
| | Talent emergent | Completa el nivell Fàcil |
| | Promesa de la graella | Completa el nivell Normal |
| | Pilot consolidat | Completa el nivell Difícil |
| | Campió del món | Completa el nivell Expert |

---

## 🗂️ Estructura del projecte

```
Memory_F1/
├── index.html          # Estructura: menú, joc, assoliments, classificacions i modals
├── style.css           # Estils, paleta F1, animacions i disseny responsive
├── script.js           # Tota la lògica del joc
├── img/
│   ├── pilot1.jpg … pilot12.jpg   # Les 12 imatges de les parelles
│   ├── fondo.avif                 # Fons de la pantalla d'inici
│   └── fondo1.jpg … fondo5.jpg    # Fons de cada nivell
└── audio/
    ├── correct.mp3     # Parella encertada
    ├── error.mp3       # Parella errònia
    ├── victoria.mp3    # Partida guanyada
    └── derrota.mp3     # S'ha acabat el temps
```

---

## 🚀 Instal·lació i ús

No cal instal·lar res: és una aplicació web estàtica.

**Opció 1 · Obrir directament**

```bash
git clone https://github.com/oscarbenitez25/Memory_F1.git
cd Memory_F1
```

Obre el fitxer `index.html` amb el teu navegador.

**Opció 2 · Servidor local** (recomanat)

```bash
# Amb Python
python -m http.server 8000

# O amb Node.js
npx serve
```

Després visita `http://localhost:8000`.

**Opció 3 · GitHub Pages**

Activa *Settings → Pages* al repositori i selecciona la branca `main` com a font.

---

## 🧠 Detalls tècnics

- **Barreja aleatòria:** s'utilitza l'algorisme **Fisher-Yates** per distribuir les 24 caselles de manera imparcial a cada partida.
- **Control d'estat:** un objecte global `joc` gestiona la partida (actiu, bloquejat, intents, encerts, temps restant, etc.).
- **Bloqueig de clics:** mentre es comproven dues caselles o es mostra el semàfor, el tauler queda bloquejat per evitar errors.
- **Identificador de partida (`idPartida`):** permet cancel·lar el semàfor i els temporitzadors si l'usuari reinicia o surt al menú.
- **Navegació entre pantalles:** una sola pàgina amb 4 pantalles (`inici`, `joc`, `logros`, `classificacions`) que es mostren o s'amaguen amb l'atribut `hidden`.
- **Persistència amb `localStorage`:**

  | Clau | Contingut |
  |------|-----------|
  | `memory-record-<nivell>` | Millor temps per nivell |
  | `memory-classificacio-<nivell>` | Top 10 per nivell (temps, intents, data) |
  | `memory-stats` | Partides jugades, millors marques i nivells superats |
  | `memory-silenci` | Preferència de so |

- **Tolerància a errors:** totes les operacions amb `localStorage` i `Audio` estan protegides amb `try/catch`.
- **Precàrrega** d'imatges i sons per evitar retards en girar les cartes.
- **Migració d'estadístiques:** `migrarStats()` actualitza dades antigues perquè els assoliments de nivell es detectin correctament.
- **Criteri de classificació:** s'ordena per menys temps, després per menys intents i, en cas d'empat, per data.

---

## 🔧 Personalització

Pots adaptar el joc fàcilment editant les constants del principi de `script.js`:

```js
const FILES = 4;            // Files del tauler
const COLUMNES = 6;         // Columnes del tauler
const TEMPS_ESPERA = 1000;  // ms abans de tapar una parella errònia
const PAS_SEMAFOR = 600;    // ms entre cada llum de sortida

const NIVELLS = [           // Afegeix o modifica nivells
  { nom: "Molt fàcil", segons: 300, fons: "img/fondo5.jpg" },
  // ...
];
```

> Si canvies les dimensions del tauler, recorda que el nombre de caselles ha de ser **parell** i que cal tenir prou imatges a `ITEMS`.

---

## 🛠️ Tecnologies

- **HTML5** semàntic
- **CSS3** (variables, Grid/Flexbox, animacions)
- **JavaScript (ES6+)** sense llibreries
- **Web Storage API** (`localStorage`)
- **HTMLAudioElement** per als efectes de so

---

## 📄 Llicència

Aquest projecte **no té cap llicència**. És un projecte educatiu i, per defecte, tots els drets queden reservats a l'autor.

> Les imatges i els sons són propietat dels seus respectius autors i s'utilitzen només amb finalitat educativa.

---

## 👤 Autor

Fet amb 🏁 per **Óscar Benítez** · 2n DAW

[![GitHub](https://img.shields.io/badge/GitHub-oscarbenitez25-181717?logo=github&logoColor=white)](https://github.com/oscarbenitez25)
