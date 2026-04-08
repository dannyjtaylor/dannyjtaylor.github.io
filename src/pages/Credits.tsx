import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Credits.module.css';
import { useLeaderboard } from '../hooks/useLeaderboard';

/* ═══════════════════════════════════════════
   Track & Credits Data
   ═══════════════════════════════════════════ */

const TRACKS = [
  { name: 'Anri - I Can\'t Stop the Loneliness', file: '/anri_icantstopthelonliness.mp3' },
  { name: 'Billy Joel - Movin\' Out', file: '/billy_joel_movinout.mp3' },
  { name: 'Boy Pablo - Dance Baby', file: '/boy_pablo_dancebaby.mp3' },
  { name: 'Carter Vail - Napoleon', file: '/carter_vail_napoleon.mp3' },
  { name: 'Clairo - 4EVER', file: '/clairo_4ever.mp3' },
  { name: 'Clairo - Add Up My Love', file: '/clairo_addupmylove.mp3' },
  { name: 'Clairo - Thank You', file: '/thankyou_clairo.mp3' },
  { name: 'Cowboy Bebop - The Real Folk Blues', file: '/cowboybebop_therealfolkblues.mp3' },
  { name: 'Cyberpunk - I Really Want to Stay at Your House', file: '/cyberpunk_ireallywanttostayatyourhouse.mp3' },
  { name: 'Daft Punk - Give Life Back to Music', file: '/daft_punk_givelifebacktomusic.mp3' },
  { name: 'Daft Punk - One More Time', file: '/daft_punk_onemoretime.mp3' },
  { name: 'Deltarune - Paradise, Paradise', file: '/deltarune_1.mp3' },
  { name: 'FMAB - Ending Theme', file: '/full_metal_alchemist_brotherhood_ending.mp3' },
  { name: 'Ginger Root - Loretta', file: '/ginger_root_loretta.mp3' },
  { name: 'glaive - Icarus', file: '/glaive_icarus.mp3' },
  { name: 'Gorillaz - On Melancholy Hill', file: '/gorillaz_onmeloncholyhill.mp3' },
  { name: 'Hai Yorokonde', file: '/hai_yorokonde.mp3' },
  { name: 'Invincible', file: '/invincible.mp3' },
  { name: 'Jamie Paige - Human', file: '/jamie_paige_human.mp3' },
  { name: 'Jamie Paige - I Wish That I Could Fall', file: '/jamie_paige_iwishthaticouldfall.mp3' },
  { name: 'JJK - AIZO', file: '/jjk_AIZO.mp3' },
  { name: 'JJK - Lost in Paradise', file: '/jjk_lostinparadise.mp3' },
  { name: 'Kaiju No. 8 - Nobody', file: '/kaijuno8_nobody.mp3' },
  { name: 'Masayoshi Takanaka - Brazilian Skies', file: '/masayoshi_takanaka_brasilianskies.mp3' },
  { name: 'MOSQ - Way of Life', file: '/mosq_way_of_life.mp3' },
  { name: 'NGE - Fly Me to the Moon', file: '/nge_flymetothemoon.mp3' },
  { name: 'ODDEEO - Chinatown Blues', file: '/ODDEEO_chinatownblues.mp3' },
  { name: 'Persona 4 - Nevermore', file: '/persona_4_nevermore.mp3' },
  { name: 'Sakanaction - Kaiju', file: '/sakanaction - Kaiju (SPOTISAVER).mp3' },
  { name: 'Superman - Punk Rocker', file: '/superman_punkrocker.mp3' },
  { name: 'Tame Impala - The Less I Know the Better', file: '/tame_impala_thelessiknowthebetter.mp3' },
  { name: 'Toby Fox - Castle Funk', file: '/tobyfox_castlefunk.mp3' },
  { name: 'Toby Fox - The Third Sanctuary', file: '/tobyfox_thethirdsanctuary.mp3' },
  { name: 'Wallows - OK', file: '/wallows_ok.mp3' },
];

interface CreditEntry {
  name: string;
  role?: string;
  photo?: string;
  needsLastName?: boolean;
}

interface CreditSection {
  title: string;
  entries: CreditEntry[];
  photo?: string | string[];
}

const CREDITS_DATA: CreditSection[] = [
  /* ── Top sections ── */
  {
    title: 'My Family',
    entries: [
      { name: 'Katherine Taylor', role: 'Mother' },
      { name: 'John Taylor', role: 'Father' },
      { name: 'Patricia Taylor', role: 'Sister' },
      { name: 'Johnny Taylor', role: 'Brother' },
      { name: 'Forrest Taylor', role: 'Brother' },
      { name: 'Caroline Livingston', role: 'Aunt' },
      { name: 'Silvia Livingston', role: 'Aunt' },
      { name: 'Clagget Taylor', role: 'Uncle' },
      { name: 'Sue Taylor', role: 'Aunt' },
      { name: 'Jacob Livingston', role: 'Cousin' },
      { name: 'Andrew Livingston', role: 'Cousin' },
      { name: 'George Livingston', role: 'Cousin' },
      { name: 'Hannah Livingston', role: 'Cousin' },
      { name: 'Hunter Livingston', role: 'Cousin' },
      { name: 'Katheryn Livingston', role: 'Cousin' },
      { name: 'Robert Livingston', role: 'Uncle' },
      { name: 'Randy Livingston', role: 'Uncle' },
    ],
  },
  {
    title: 'Professors/Faculty & Staff',
    entries: [
      { name: 'Dr. Austin Anderson', role: "Research Supervisor, Professor I TA'd Differential Equations For"},
      { name: 'Dr. Joshua Drouin', role: "Taught me Computational Linear Algebra" },
      { name: 'Dr. Elisabeth Kames', role: "Taught me SOLIDWORKS" },
      { name: 'Dr. Emadelden Fouad', role: "Taught me Physics 1 and 2" },
      { name: 'Dr. Mohammad Farmani', role: "Taught me Verilog & Cybersecurity" },
      { name: 'Dr. Hoan Ngo', role: "Taught me Embedded Operating Systems" },
      { name: 'Dr. Jared Bunn', role: "Taught me Topology & Discrete Math" },
      { name: 'Dr. Manoj Lamichhane', role: "Taught me Differential Equations and Calculus 3" },
      { name: 'Dr. Muhammad Ullah', role: "Taught me Circuits 1, Circuits 2, breadboards, oscilloscopes, Digital Electronics, and VLSI Design, 'We know these things'" },
      { name: 'Dr. Tracy Olin', role: "Chemistry Lab"},
      { name: 'Dr. Onur Toker', role: "Best Capstone professor ever" },
      { name: 'Dr. Rawa Adla', role: "Taught me about Autonomous Vehicles, Electric and Hybrid Vehicles, Microprocessors, and Computer Architecture. Bowled with her, went to SunTrax with her, went to IMSA with her, went to Chick-fil-A with her"},
      { name: 'Dr. Ashiq Sakib', role: "Taught me Digital Logic Design, 'Gone are the days of Plugging and Chugging'"},
      { name: 'Dr. Venkata Sista', role: "Taught me Chemistry"},
      { name: 'Dr. Sundari Ramabhotla', role: "Taught me Systems and Signals, and Smart Grid and Physical Cyber Security" },
      { name: 'Mr. Silvano Falcao', role: "Taught me Calculus 1 and Calculus 2. Thanks for making college not scary when I first came in" },
      { name: 'Dr. Mary Vollaro', role: "F.L.A.M.E" },
      { name: 'Mr. Igor Mirsalikhov', role: "Taught me everything I know about coding, C and C++" },
      { name: 'Dr. Susan LeFrancois', role: "Legal, Ethical, Management Issues in Technology, I won her Kahoot" },
      { name: 'Ms. Ramamourty Manimegalai', role: "Physics 1 and 2 Lab"},
      { name: 'Dr. Ranses Alfonso Roriguez', role: "Taught me Probability and Statistics, our SHPE advisor"},
      { name: 'Dr. Bradford Barker', role: "Taught me Quantum Information and Computing"},
      { name: 'Dr. Asai Asaithambi', role: "Taught me Advanced Engineering Math, though that first quiz got all of us"},
      { name: "Ms. Martha Seney", role: "Career Services Director, Rotaract & SHPE member, taught me a lot about professional development"},
      { name: "Ms. Noelia Sanchez", role: "Nicest person alive & Rotaract's advisor!"}
    ],  
  },
  {
    title: 'SHPE Eboard 2025\u20132026',
    photo: 'SHPE.png',
    entries: [
      { name: 'Ines Alonso' },
      { name: 'Naibys "Kro" Alzugaray' },
      { name: 'Gabriel Basalo' },
      { name: 'Nicolas Izquierdo' },
      { name: 'Shriraj Mandulapalli' },
      { name: 'Alex Meert' },
      { name: 'Ethan Puig' },
    ],
  },
  {
    title: 'Rotaract',
    photo: 'rotaract.png',
    entries: [
      { name: 'Aidan Morris' },
      { name: 'Alex Cam' },
      { name: 'Alyson Smyth' },
      { name: 'Marisa de Comier' },
      { name: 'Ian Lopez' },
      { name: 'Bobby Green' },
      { name: 'Brian Tran' },
      { name: 'Brittany Cam' },
      { name: 'Bryden Silva' },
      { name: 'Danielle Rivers' },
      { name: 'Domenic Iorfida' },
      { name: 'Izzy Greer' },
      { name: 'Jack Everheart' },
      { name: 'Jeff Tillman' },
      { name: 'Jeremy Casanova' },
      { name: 'Henry Casanova'},
      { name: 'Jesus Sanchez' },
      { name: 'Larry Walker' },
      { name: 'Lawrence Drake' },
      { name: 'Melanie Najera' },
      { name: 'Patrick Mayer' },
      { name: 'Ryan Thomas' },
      { name: 'Tommy Jackson' },
      { name: 'Trenton McCutcheon' },
    ],
  },
  {
    title: 'SHPE',
    entries: [
      { name: 'Benji Guzman' },
      { name: 'Carlos Marillo' },
      { name: 'Gabriel Sanchez' },
      { name: 'Louis Irias' },
      { name: 'Maria Roman' },
      { name: 'Raul Lopez III' },
      { name: 'Samuel Marillo' },
      { name: 'Sebastian Anzola' },
      { name: 'The City of Philadelphia', role: 'for stealing my wallet' },
    ],
  },


  /* ── Alphabetical middle ── */
  {
    title: '2404-1313',
    entries: [
      { name: 'Bryon Catlin' },
      { name: 'George Mancini' },
      { name: 'Noah Campise' },
    ],
  },
  {
    title: 'Good Mythical Morning Enjoyers',
    entries: [
      { name: 'Emma', needsLastName: true },
      { name: 'Jaylee', needsLastName: true },
    ],
  },
  {
    title: 'IEEE',
    photo: ['IEEE.png', 'IEEEhkn.png'],
    entries: [
      { name: 'Anthony Dreier' },
      { name: 'Colby Bradford' },
      { name: 'Raymond Walker', needsLastName: true },
      { name: 'Sahil Tahwalker', needsLastName: true },
      { name: 'Sterling Peters', needsLastName: true },
      { name: 'Thomas Cook' },
      { name: 'Will Carroll', needsLastName: true },
    ],
  },
  {
    title: "Polk County Sheriff's Office LiDAR Team (Capstone)",
    photo: 'sheriffsoffice.png',
    entries: [
      { name: 'James Allegra' },
      { name: 'Gaspar Chayer' },
      { name: 'Gerardo Claudio' },
      { name: 'Jackson Giles' },
      { name: 'Leon Harry' },
      { name: 'Lillian Wright' },
      { name: 'Michael Stevenson' },
      { name: 'Michael Kennon', role: 'Sponsor' },
      { name: 'Jeremy Webb', role: 'Sponsor' },
    ],
  },
  {
    title: 'RAs/CDs',
    entries: [
      { name: 'Emily Rivera' },
      { name: 'Jordan Hall' },
      { name: 'Maddox Bown' },
    ],
  },
  {
    title: 'Really Smart People',
    entries: [
      { name: 'Zane Wolfe' },
    ],
  },
  {
    title: 'Lake Placid/Sebring',
    entries: [
      { name: 'Brianna Pratts' },
      { name: 'Casen Simmons' },
      { name: 'Connor', needsLastName: true },
      { name: 'Danyela Marcelo-Lopez' },
      { name: "Duce D'Anthony Dossey" },
      { name: 'ESKETIT', needsLastName: true },
      { name: 'Esperansa', needsLastName: true },
      { name: 'Gavin Higgs' },
      { name: 'Jacob Sueppel' },
      { name: 'James Swaford' },
      { name: 'Jennifer Angeles' },
      { name: 'Joshua Spurlock' },
      { name: 'Keith Sigrist' },
      { name: 'Kevin Su' },
      { name: 'Lyra Ganaban' },
      { name: 'Ms. Burnett' },
      { name: 'Ms. Curry' },
      { name: 'Ms. Sohn' },
    ],
  },
  {
    title: 'Paul Patullo',
    entries: [
      { name: 'Joe Patullo' },
      { name: 'Natasha Patullo' },
      { name: 'Paul Patullo' },
    ],
  },
  {
    title: 'People I Know Because of Bryon',
    entries: [
      { name: 'Bryon Catlin II' },
      { name: 'Carson Elliott', role: "NerdLabz" },
      { name: 'Dylan Catlin' },
      { name: 'Jackson Bopp' },
      { name: 'Karl', needsLastName: true },
      { name: 'Leona Catlin' },
      { name: 'Michael Testa' },
      { name: 'Sam Critchlow' },
      { name: 'Stephanie Catlin' },
      { name: 'Tyler Critchlow' },
    ],
  },
  {
    title: "Sorry I Couldn't Think of a Category For You Guys",
    entries: [
      { name: 'Albert Ubieta' },
      { name: 'Alfonso Contreras' },
      { name: 'Aliyah Schouten' },
      { name: 'Alis Craig' },
      { name: 'Andrew Blackwelder' },
      { name: "" },
      { name: 'Andrew Graham' },
      { name: 'Andrew Piasecki' },
      { name: 'Andrew Ptazek' },
      { name: 'Anthony Parinello' },
      { name: 'Brady Lenox' },
      { name: 'Brandon Camacho' },
      { name: 'Cameron Willaims' },
      { name: 'Chiara Bottega' },
      { name: 'Chris Mather' },
      { name: 'Christian Cruz' },
      { name: 'Clara Satterfield' },
      { name: 'Dylan Sturdivant' },
      { name: 'Connor Anderson' },
      { name: 'Dante', needsLastName: true },
      { name: 'David Para' },
      { name: 'David Tarbox' },
      { name: 'David Vidana' },
      { name: 'David Zambrano' },
      { name: 'Eddrick', needsLastName: true },
      { name: 'Eli Wolfe' },
      { name: 'Elijah Kenney' },
      { name: 'Emily', needsLastName: true, role: 'Not the RA' },
      { name: 'Erich Esqueda' },
      { name: 'Eugene', needsLastName: true },
      { name: 'Fabian', needsLastName: true },
      { name: 'Francisco', needsLastName: true },
      { name: 'Gabby Villalba', needsLastName: true },
      { name: 'Giana Reyes' },
      { name: 'Jacob Brescia' },
      { name: 'Jacob Paccione' },
      { name: 'Jake Diaz-Iglesias' },
      { name: 'Jannice', needsLastName: true },
      { name: 'Jasmine Heymann' },
      { name: 'Javon', needsLastName: true },
      { name: 'Jbo', needsLastName: true },
      { name: 'Jillian', needsLastName: true },
      { name: 'Jorgeandres Alvarez' },
      { name: 'Josh Alletto' },
      { name: 'Justis', needsLastName: true },
      { name: 'Kailey Gibbons' },
      { name: 'Kaitlyn Surovy' },
      { name: 'Kody Byrd' },
      { name: 'Koral', needsLastName: true },
      { name: 'Kyla Harpe' },
      { name: 'Kyle', needsLastName: true },
      { name: 'Kyle Blanchard' },
      { name: 'Lauren', needsLastName: true },
      { name: 'Leia Hok' },
      { name: 'Liam', needsLastName: true },
      { name: 'Logan Morrison' },
      { name: 'Lucas Batista' },
      { name: 'Luis Mata-Moreno' },
      { name: 'Luis Silva' },
      { name: 'Lukas Kelk' },
      { name: 'Maya Stuhlman' },
      { name: 'Meleena Scott' },
      { name: 'Melanie Morenson' },
      { name: 'Michael Carlson' },
      { name: 'Miguel Mondragon' },
      { name: 'Mikala Yin-Furiato' },
      { name: 'Mo Hadid' },
      { name: 'Mois\u00e9s Mu\u00f1oz Salazar'},
      { name: 'Noelia Sanchez' },
      { name: 'Pressley Hendrix' },
      { name: 'Quentin Lockwood' },
      { name: 'JCPennys Rita', role: 'for cutting my hair so many times' },
      { name: 'Robert Grant' },
      { name: 'Roland Diaz' },
      { name: 'Ryan Mullins' },
      { name: 'Stella Asanova' },
      { name: 'Thomas Risalvato' },
      { name: 'Tu\u011fba G\u00fcneysu' },
      { name: 'Zander Butler' },
    ],
  },
  {
    title: 'Student Government Association',
    entries: [
      { name: 'Colby Mandrodt', role: 'President' },
      { name: 'Nolan Nguyen', role: 'Vice President' },
    ],
  },
  {
    title: 'VALORANT Varsity',
    photo: ['flpolyesports.png', 'valorant.png'],
    entries: [
      { name: 'Vanessa Korthas' },
      { name: 'Jaden Akers-Atkins' },
      { name: 'Johnathan Nguyen', role: "Duelist" },
      { name: 'Julian', needsLastName: true },
      { name: 'Ryan Trinh', role: "aeri, Duelist" },
      { name: 'Wack', role: "ThatsWack, Team Captain & Omen Player" },
    ],
  },
  {
    title: 'Winter Haven Technology Services',
    entries: [
      { name: 'Adriana Bottega' },
      { name: 'Aizan "Bobby" Khan' },
      { name: 'Angel Trinidad' },
      { name: 'Blake', needsLastName: true },
      { name: 'Christopher Duclos' },
      { name: 'Christopher Taylor' },
      { name: 'Connor', needsLastName: true },
      { name: 'Esteban', needsLastName: true },
      { name: 'Hiep Nguyen' },
      { name: 'Jeremiah', needsLastName: true },
      { name: 'Jose Vega' },
      { name: 'Joshua Stone' },
      { name: 'Katiya Taylor' },
      { name: 'Kristina Smith' },
      { name: 'Michael Adams' },
      { name: 'Mikey LaFollette' },
      { name: 'Nickolas Phan' },
      { name: 'Pickleball John', needsLastName: true },
      { name: 'Praythusa Bhuma' },
      { name: 'Raul Gonzales' },
      { name: 'Robert van Druten' },
      { name: 'The Winter Haven Librarians' },
      { name: 'Wen Zhang' },
    ],
  },

  /* ── End sections ── */
  {
    title: 'Online Friends',
    entries: [
      { name: 'Alibaba', needsLastName: true },
      { name: 'Andy', needsLastName: true },
      { name: 'Athena', needsLastName: true },
      { name: 'Bruno', needsLastName: true },
      { name: 'Daichi', needsLastName: true },
      { name: 'Daniela', needsLastName: true },
      { name: 'Elysha', needsLastName: true },
      { name: 'Emily Lu' },
      { name: 'Genia Korovaychuk' },
      { name: 'Joseph Gregory Salazar Rosillo' },
      { name: 'Lele' },
      { name: 'Livzie' },
      { name: 'Nanox' },
      { name: 'Ouroborix' },
      { name: 'Ridge' },
      { name: 'Ryan Landy' },
      { name: 'Savanna' },
      { name: 'Shin' },
      { name: 'Tim Lee' },
      { name: 'Z', needsLastName: true },
    ],
  },
  {
    title: 'Special Thanks',
    entries: [
      { name: 'Akira Kurusu' },
      { name: 'Apollo Justice' },
      { name: 'Arataka Reigen' },
      { name: 'Clairo' },
      { name: 'Edward Elric' },
      { name: 'Hideo Kojima' },
      { name: 'Hornet' },
      { name: 'Itadori Yuji' },
      { name: 'Jotaro Kujo' },
      { name: 'Kasane Teto' },
      { name: 'Lucy MacLean' },
      { name: 'Makoto Yuki' },
      { name: 'MAPPA' },
      { name: 'Maya Fey' },
      { name: 'ONE' },
      { name: 'Phoenix Wright' },
      { name: 'Roy Mustang' },
      { name: 'Shigeo Kageyama' },
      { name: 'Team Cherry' },
      { name: 'The Knight' },
      { name: 'Thorfinn, son of Thors' },
      { name: 'Toby Fox' },
      { name: 'Yu Narukami' },
    ],
  },
  {
    title: 'In Memory Of',
    entries: [
      { name: 'Logan Hewitt' },
    ],
  },
];

const ALL_NAMES = CREDITS_DATA.flatMap((s) => s.entries.map((e) => e.name)).filter(Boolean);
const BASE_DURATION = 180;
const TWO_COL_THRESHOLD = 10;

/* ═══════════════════════════════════════════
   Attack Mode — Undertale "Last Goodbye"
   ═══════════════════════════════════════════ */

interface Projectile {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hit: boolean;
  action: number;       // 0=normal, 1=homing-lock, 3=wrap
  frame: number;
  gravity: number;
  angle: number;
  orbitCx: number;
  orbitCy: number;
  orbitR: number;
  orbitAngle: number;
  orbitSpeed: number;
  logoImg: HTMLImageElement | null;
}

let nextProjId = 0;

const DETERMINATION_MONO = "'DeterminationMono', monospace";
const DETERMINATION_SANS = "'DeterminationSans', sans-serif";

const ATTACK_LOGOS = [
  { src: '/credits-photos/rotaract.png', name: 'Rotaract' },
  { src: '/credits-photos/SHPE.png', name: 'SHPE' },
  { src: '/credits-photos/IEEE.png', name: 'IEEE' },
  { src: '/credits-photos/wellsfargo.jpg', name: 'Wells Fargo' },
  { src: '/credits-photos/IBM.png', name: 'IBM' },
];

function loadHeartImage(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = '/credits-photos/undertaleHEART.png';
  });
}

async function preloadFonts() {
  try {
    await Promise.all([
      document.fonts.load(`20px ${DETERMINATION_MONO}`),
      document.fonts.load(`20px ${DETERMINATION_SANS}`),
    ]);
  } catch { /* fonts will still work, just might flash */ }
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  flash: boolean,
  heartImg: HTMLImageElement | null,
) {
  ctx.save();
  if (heartImg && heartImg.complete && heartImg.naturalWidth > 0) {
    if (flash) ctx.filter = 'brightness(10)';
    ctx.drawImage(heartImg, cx - size, cy - size, size * 2, size * 2);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = flash ? '#ffffff' : '#ff0000';
    const s = size;
    const top = cy - s * 0.5;
    const curveH = s * 0.3;
    ctx.beginPath();
    ctx.moveTo(cx, top + curveH);
    ctx.bezierCurveTo(cx, top, cx - s * 0.5, top, cx - s * 0.5, top + curveH);
    ctx.bezierCurveTo(cx - s * 0.5, top + s * 0.65, cx, top + s * 0.85, cx, top + s * 1.1);
    ctx.bezierCurveTo(cx, top + s * 0.85, cx + s * 0.5, top + s * 0.65, cx + s * 0.5, top + curveH);
    ctx.bezierCurveTo(cx + s * 0.5, top, cx, top, cx, top + curveH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function mkProj(base: Partial<Projectile> & { id: number; text: string; x: number; y: number; w: number; h: number }): Projectile {
  return {
    vx: 0, vy: 0, hit: false, action: 0, frame: 0,
    gravity: 0, angle: 0,
    orbitCx: 0, orbitCy: 0, orbitR: 0, orbitAngle: 0, orbitSpeed: 0, logoImg: null,
    ...base,
  };
}

/* ── End-screen result ── */
interface AttackResult {
  hitCount: number;
  hitNames: string[];
}

function AttackGame({ onExit, onFinish }: { onExit: () => void; onFinish: (result: AttackResult) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onExitRef = useRef(onExit);
  const onFinishRef = useRef(onFinish);
  onExitRef.current = onExit;
  onFinishRef.current = onFinish;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    /* ── Audio ── */
    const audio = new Audio('/toby_fox_lastgoodbye.mp3');
    audio.loop = false;
    audio.volume = 0.7;
    audio.play().catch(() => {});

    const hitSounds: HTMLAudioElement[] = [];
    for (let i = 0; i < 6; i++) {
      const s = new Audio('/deltarune_hit.mp3');
      s.volume = 0.5;
      hitSounds.push(s);
    }
    let hitSoundIdx = 0;
    const playHitSound = () => {
      const s = hitSounds[hitSoundIdx % hitSounds.length];
      if (s) { s.currentTime = 0; s.play().catch(() => {}); }
      hitSoundIdx++;
    };

    let heartImg: HTMLImageElement | null = null;
    loadHeartImage().then((img) => { heartImg = img; });
    preloadFonts();

    /* ── Preload logo images for random logo projectiles ── */
    const logoImages: HTMLImageElement[] = ATTACK_LOGOS.map((logo) => {
      const img = new Image();
      img.src = logo.src;
      return img;
    });
    let logoTimer = 0;

    /* ── Game state ── */
    const heart = { x: W() / 2, y: H() * 0.7 };
    let projectiles: Projectile[] = [];
    let hitFlash = 0;
    let nameIdx = 0;
    let lastTime = 0;
    let frameId = 0;
    let elapsed = 0;
    let hitCount = 0;
    const hitNames: string[] = [];
    let gameOver = false;
    let endTimer = 0;
    const HEART_SPEED = 300;
    const HEART_SIZE = 14;

    /* ── Phase system ── */
    const PHASE_THRESHOLDS = [
      { phase: 0, start: 0 },
      { phase: 2, start: 60 },
      { phase: 4, start: 140 },
      { phase: 7, start: 220 },
      { phase: 6, start: 290 },
      { phase: 1, start: 360 },
    ];
    let currentPhase = 0;
    let phaseTimer = 0;
    let phaseRound = 0;
    const totalNames = ALL_NAMES.length;

    const getPhase = (idx: number): number => {
      let p = 0;
      for (const t of PHASE_THRESHOLDS) {
        if (idx >= t.start) p = t.phase;
      }
      return p;
    };

    const getFontSize = () => Math.max(20, Math.min(32, W() / 22));

    const measureName = (name: string): { tw: number; th: number } => {
      const fontSize = getFontSize();
      ctx.font = `${fontSize}px ${DETERMINATION_SANS}`;
      return { tw: ctx.measureText(name).width, th: fontSize * 1.2 };
    };

    const nextName = (): string => {
      if (nameIdx >= totalNames) return '';
      const name = ALL_NAMES[nameIdx] ?? 'Danny';
      nameIdx++;
      return name;
    };

    /* ── Phase 0 & 6: Homing clusters ── */
    const spawnHomingCluster = (fromRight: boolean, yCenter: number) => {
      const w = W();
      for (let i = 0; i < 5; i++) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        const startX = fromRight ? w + 50 + i * 45 : -tw - 50 - i * 45;
        const startY = yCenter + (i - 2) * 35;
        projectiles.push(mkProj({
          id: nextProjId++, text: name, x: startX, y: startY,
          vx: fromRight ? -350 : 350, w: tw, h: th,
          action: 1,
        }));
      }
    };

    /* ── Phase 2: Walls from both sides with gaps ── */
    const spawnWalls = () => {
      const h = H();
      const w = W();
      const slotCount = Math.floor(h / 42);
      const gapCountL = 2 + Math.floor(Math.random() * 2);
      const gapCountR = 2 + Math.floor(Math.random() * 2);
      const gapsL = new Set<number>();
      const gapsR = new Set<number>();
      while (gapsL.size < gapCountL) gapsL.add(Math.floor(Math.random() * slotCount));
      while (gapsR.size < gapCountR) gapsR.add(Math.floor(Math.random() * slotCount));

      for (let i = 0; i < slotCount; i++) {
        if (!gapsL.has(i)) {
          const name = nextName();
          if (!name) return;
          const { tw, th } = measureName(name);
          projectiles.push(mkProj({ id: nextProjId++, text: name, x: -tw - 20, y: i * 42, vx: 320, w: tw, h: th }));
        }
        if (!gapsR.has(i)) {
          const name = nextName();
          if (!name) return;
          const { tw, th } = measureName(name);
          projectiles.push(mkProj({ id: nextProjId++, text: name, x: w + 20, y: i * 42 + 21, vx: -320, w: tw, h: th }));
        }
      }
    };

    /* ── Phase 4: Vertical rain with drift and wrap ── */
    const spawnVerticalRain = (driftRight: boolean) => {
      const w = W();
      const cols = Math.floor(w / 70);
      for (let i = 0; i < cols; i++) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: i * 70 + 20, y: -th - Math.random() * 200,
          vx: driftRight ? 80 : -80, vy: 220,
          w: tw, h: th, action: 3,
          angle: driftRight ? Math.PI / 2 : -Math.PI / 2,
        }));
      }
    };

    /* ── Phase 7: Spinning spirals ── */
    const spawnSpiral = (cx: number, cy: number, driftVx: number) => {
      const count = 8;
      const startAngle = Math.random() * 360;
      for (let i = 0; i < count; i++) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        const angleDeg = startAngle + (360 / count) * i;
        const angleRad = (angleDeg * Math.PI) / 180;
        const radius = Math.max(70, Math.min(W() * 0.12, 220));
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: cx + Math.cos(angleRad) * radius,
          y: cy + Math.sin(angleRad) * radius,
          vx: driftVx,
          w: tw, h: th,
          orbitCx: cx, orbitCy: cy,
          orbitR: radius, orbitAngle: angleDeg,
          orbitSpeed: driftVx > 0 ? 3 : -3,
        }));
      }
    };

    /* ── Phase 1: Gravity rain ── */
    const spawnGravityRain = () => {
      const w = W();
      const startX = Math.random() * (w - 300);
      for (let i = 0; i < 4; i++) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: startX + i * 90, y: -th - 40,
          vy: 20, w: tw, h: th,
          gravity: 400,
        }));
      }
    };

    /* ── Input ── */
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExitRef.current(); return; }
      keys.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let touchX = 0;
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      touchX = touch.clientX;
      touchY = touch.clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      heart.x += touch.clientX - touchX;
      heart.y += touch.clientY - touchY;
      touchX = touch.clientX;
      touchY = touch.clientY;
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    const getSpawnInterval = (phase: number): number => {
      switch (phase) {
        case 0: return 1.2;
        case 2: return 2.5;
        case 4: return 2.8;
        case 7: return 2.8;
        case 6: return 0.8;
        case 1: return 0.5;
        default: return 1.0;
      }
    };

    /* ── Main game loop ── */
    const gameLoop = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      elapsed += dt;

      const w = W();
      const h = H();

      /* Check game over */
      if (nameIdx >= totalNames && !gameOver) {
        const allGone = projectiles.every(p =>
          p.x < -300 || p.x > w + 300 || p.y < -300 || p.y > h + 300
        );
        if (projectiles.length === 0 || allGone) {
          gameOver = true;
          endTimer = 0;
        }
      }

      if (gameOver) {
        endTimer += dt;
        if (endTimer > 3) {
          onFinishRef.current({ hitCount, hitNames });
          return;
        }
        ctx.clearRect(0, 0, w, h);
        const fadeAlpha = Math.min(1, endTimer / 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, w, h);
        drawHeart(ctx, heart.x, heart.y, HEART_SIZE, false, heartImg);
        frameId = requestAnimationFrame(gameLoop);
        return;
      }

      /* ── Movement ── */
      if (keys.has('arrowleft') || keys.has('a')) heart.x -= HEART_SPEED * dt;
      if (keys.has('arrowright') || keys.has('d')) heart.x += HEART_SPEED * dt;
      if (keys.has('arrowup') || keys.has('w')) heart.y -= HEART_SPEED * dt;
      if (keys.has('arrowdown') || keys.has('s')) heart.y += HEART_SPEED * dt;
      heart.x = Math.max(HEART_SIZE, Math.min(w - HEART_SIZE, heart.x));
      heart.y = Math.max(HEART_SIZE, Math.min(h - HEART_SIZE, heart.y));

      /* ── Phase-based spawning ── */
      if (nameIdx < totalNames) {
        const newPhase = getPhase(nameIdx);
        if (newPhase !== currentPhase) {
          currentPhase = newPhase;
          phaseTimer = 0;
          phaseRound = 0;
        }
        phaseTimer += dt;
        const interval = getSpawnInterval(currentPhase);
        if (phaseTimer >= interval) {
          phaseTimer = 0;
          switch (currentPhase) {
            case 0:
            case 6: {
              const fromRight = phaseRound % 2 === 0;
              const yCenter = phaseRound % 4 < 2 ? h * 0.25 : h * 0.65;
              spawnHomingCluster(fromRight, yCenter);
              phaseRound++;
              break;
            }
            case 2:
              spawnWalls();
              phaseRound++;
              break;
            case 4:
              spawnVerticalRain(phaseRound % 2 === 0);
              phaseRound++;
              break;
            case 7:
              spawnSpiral(-100, h * 0.4, 150);
              spawnSpiral(w + 100, h * 0.6, -150);
              phaseRound++;
              break;
            case 1:
              spawnGravityRain();
              phaseRound++;
              break;
          }
        }
      }

      /* ── Spawn random logos ── */
      logoTimer += dt;
      if (logoTimer >= 8 && logoImages.length > 0) {
        logoTimer = 0;
        const li = Math.floor(Math.random() * ATTACK_LOGOS.length);
        const logoInfo = ATTACK_LOGOS[li];
        const limg = logoImages[li];
        if (logoInfo && limg && limg.complete && limg.naturalWidth > 0) {
          const fromR = Math.random() > 0.5;
          const sz = 60;
          const yp = Math.random() * (h - sz * 2) + sz;
          projectiles.push(mkProj({
            id: nextProjId++, text: logoInfo.name,
            x: fromR ? w + sz : -sz, y: yp,
            vx: fromR ? -140 : 140,
            w: sz, h: sz, logoImg: limg,
          }));
        }
      }

      /* ── Update projectiles ── */
      for (const p of projectiles) {
        p.frame++;

        if (p.action === 1) {
          if (p.frame < 40) {
            /* Phase 1: Slide in */
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          } else if (p.frame === 40) {
            p.vx = 0;
            p.vy = 0;
          } else if (p.frame > 40 && p.frame < 85) {
            /* Phase 2: Aim — rotate text to point toward heart (Undertale-style) */
            const pcx = p.x + p.w / 2;
            const pcy = p.y + p.h / 2;
            const idealAngle = Math.atan2(heart.y - pcy, heart.x - pcx);

            let angleDiff = idealAngle - p.angle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            const absDiff = Math.abs(angleDiff);
            let turnSpeed = 0.04;
            if (absDiff > 0.17) turnSpeed = 0.07;
            if (absDiff > 0.35) turnSpeed = 0.13;
            if (absDiff > 0.52) turnSpeed = 0.22;
            if (absDiff > 0.7) turnSpeed = 0.35;

            const deadZone = 0.05;
            if (absDiff > deadZone) {
              p.angle += Math.sign(angleDiff) * Math.min(turnSpeed, absDiff);
            }
          } else if (p.frame === 85) {
            /* Phase 3: Fire in aimed direction */
            const speed = 280;
            p.vx = Math.cos(p.angle) * speed;
            p.vy = Math.sin(p.angle) * speed;
            p.action = 0;
          }
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        if (p.gravity) p.vy += p.gravity * dt;

        if (p.action === 3) {
          if (p.x < -80) p.x = w + 60;
          if (p.x > w + 80) p.x = -60;
        }

        if (p.orbitR > 0) {
          p.orbitCx += p.vx * dt;
          p.orbitCy += p.vy * dt;
          p.orbitAngle += p.orbitSpeed;
          if (Math.abs(p.orbitSpeed) < 8) p.orbitSpeed *= 1.003;
          const rad = (p.orbitAngle * Math.PI) / 180;
          p.x = p.orbitCx + Math.cos(rad) * p.orbitR;
          p.y = p.orbitCy + Math.sin(rad) * p.orbitR;
        }
      }

      projectiles = projectiles.filter(
        (p) => p.x > -600 && p.x < w + 600 && p.y > -400 && p.y < h + 400,
      );

      /* ── Hit detection — instant, no delay between hits ── */
      if (hitFlash > 0) hitFlash -= dt;
      const HR = HEART_SIZE * 0.55;
      for (const p of projectiles) {
        if (p.hit) continue;
        if (
          heart.x + HR > p.x &&
          heart.x - HR < p.x + p.w &&
          heart.y + HR > p.y &&
          heart.y - HR < p.y + p.h
        ) {
          p.hit = true;
          hitFlash = 0.12;
          hitCount++;
          hitNames.push(p.text);
          playHitSound();
        }
      }

      /* ── Render ── */
      ctx.clearRect(0, 0, w, h);

      if (hitFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${hitFlash * 0.18})`;
        ctx.fillRect(0, 0, w, h);
      }

      const drawFontSize = getFontSize();
      ctx.font = `${drawFontSize}px ${DETERMINATION_SANS}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (const p of projectiles) {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        if (p.angle) ctx.rotate(p.angle);
        if (p.logoImg && p.logoImg.complete && p.logoImg.naturalWidth > 0) {
          if (p.hit) ctx.globalAlpha = 0.6;
          ctx.drawImage(p.logoImg, -p.w / 2, -p.h / 2, p.w, p.h);
          if (p.hit) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.globalAlpha = 1;
          }
        } else {
          ctx.fillStyle = p.hit ? '#FFFF00' : '#ffffff';
          ctx.fillText(p.text, -p.w / 2, -p.h / 2);
        }
        ctx.restore();
      }

      drawHeart(ctx, heart.x, heart.y, HEART_SIZE, hitFlash > 0, heartImg);

      /* HUD */
      ctx.font = `16px ${DETERMINATION_MONO}`;
      ctx.fillStyle = '#FFFF00';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`HITS: ${hitCount}`, 16, 16);

      if (elapsed < 8) {
        const alpha = elapsed < 6 ? 1 : Math.max(0, 1 - (elapsed - 6) / 2);
        ctx.globalAlpha = alpha;
        ctx.font = `20px ${DETERMINATION_SANS}`;
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('SPECIAL THANKS', w / 2, 20);
        ctx.globalAlpha = 1;
      }

      const barY = h - 40;
      ctx.font = `14px ${DETERMINATION_MONO}`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('HP', 16, barY);
      ctx.fillStyle = '#FFFF00';
      ctx.font = `18px ${DETERMINATION_SANS}`;
      ctx.fillText('\u221E', 40, barY);
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(60, barY - 6, 80, 12);

      ctx.font = `13px ${DETERMINATION_MONO}`;
      ctx.fillStyle = '#444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const isMobile = 'ontouchstart' in window;
      ctx.fillText(
        isMobile ? 'Drag to move \u00B7 Tap \u2715 to exit' : 'Arrow keys / WASD to move \u00B7 ESC to exit',
        w / 2, h - 16,
      );

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(frameId);
      audio.pause();
      audio.src = '';
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.attackOverlay}>
      <canvas ref={canvasRef} className={styles.attackCanvas} />
      <button className={styles.attackExitBtn} onClick={onExit} aria-label="Exit game">
        &times;
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   End Screen — score + name input + leaderboard submit
   ═══════════════════════════════════════════ */

function AttackEndScreen({
  result,
  onSubmit,
  onExit,
}: {
  result: AttackResult;
  onSubmit: (name: string) => void;
  onExit: () => void;
}) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const trimmed = name.trim().split(/\s+/)[0]?.slice(0, 10) ?? '';
    if (!trimmed) return;
    setSubmitted(true);
    onSubmit(trimmed);
  };

  return (
    <div className={styles.attackOverlay} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', fontFamily: DETERMINATION_SANS, color: '#fff', maxWidth: 480, padding: 24 }}>
        <div style={{ fontSize: 36, color: '#FFFF00', letterSpacing: 3, marginBottom: 24 }}>
          CREDITS COMPLETE
        </div>
        <div style={{ fontSize: 22, marginBottom: 8 }}>
          You were touched by
        </div>
        <div style={{ fontSize: 64, color: result.hitCount === 0 ? '#00ff00' : '#FFFF00', fontWeight: 700, marginBottom: 16 }}>
          {result.hitCount}
        </div>
        <div style={{ fontSize: 18, color: '#aaa', marginBottom: 40 }}>
          {result.hitCount === 0 ? 'Incredible! You dodged every single name!' : `name${result.hitCount === 1 ? '' : 's'}`}
        </div>

        {!submitted ? (
          <>
            <div style={{ fontSize: 16, color: '#888', marginBottom: 12 }}>
              Enter your name for the leaderboard (1 word, 10 chars max):
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              <input
                type="text"
                maxLength={10}
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s/g, '').slice(0, 10))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="YourName"
                style={{
                  background: '#111', border: '2px solid #FFFF00', color: '#fff',
                  fontFamily: DETERMINATION_SANS, fontSize: 20,
                  padding: '8px 16px', borderRadius: 4, outline: 'none',
                  width: 180, textAlign: 'center',
                }}
                autoFocus
              />
              <button
                onClick={handleSubmit}
                style={{
                  background: '#FFFF00', color: '#000', border: 'none',
                  fontFamily: DETERMINATION_SANS, fontSize: 18, fontWeight: 700,
                  padding: '10px 24px', borderRadius: 4, cursor: 'pointer',
                }}
              >
                Submit
              </button>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 20, color: '#00ff00', marginBottom: 24 }}>
            Score submitted!
          </div>
        )}

        <button
          onClick={onExit}
          style={{
            marginTop: 32, background: 'none', border: '1px solid #555',
            color: '#888', fontFamily: DETERMINATION_SANS, fontSize: 16,
            padding: '10px 32px', borderRadius: 4, cursor: 'pointer',
          }}
        >
          Back to Credits
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Credits Component
   ═══════════════════════════════════════════ */

type Mode = 'select' | 'credits' | 'attack' | 'endscreen';

function formatSpeed(s: number): string {
  if (Number.isInteger(s)) return `${s}`;
  return s.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function Credits() {
  const [mode, setMode] = useState<Mode>('select');
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [volume, setVolume] = useState(60);
  const [speed, setSpeed] = useState(0.4);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attackResult, setAttackResult] = useState<AttackResult | null>(null);

  const { submitScore } = useLeaderboard();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const animFrameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const contentHeightRef = useRef(0);
  const blackPauseRef = useRef(false);
  const loopCountRef = useRef(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef(0.4);
  const volumeRef = useRef(60);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (mode !== 'credits') return;

    const measure = () => {
      if (trackRef.current) contentHeightRef.current = trackRef.current.scrollHeight;
    };
    measure();
    window.addEventListener('resize', measure);

    scrollPosRef.current = 0;
    lastFrameRef.current = 0;
    blackPauseRef.current = false;

    const animate = (time: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = time;
      const dt = Math.min((time - lastFrameRef.current) / 1000, 0.1);
      lastFrameRef.current = time;

      if (!blackPauseRef.current && contentHeightRef.current > 0) {
        const pxPerSec = contentHeightRef.current / BASE_DURATION;
        scrollPosRef.current -= pxPerSec * speedRef.current * dt;

        if (trackRef.current) {
          trackRef.current.style.transform = `translateY(${scrollPosRef.current}px)`;
        }

        if (scrollPosRef.current <= -contentHeightRef.current) {
          loopCountRef.current++;
          blackPauseRef.current = true;

          if (loopCountRef.current < 2) {
            pauseTimerRef.current = setTimeout(() => {
              scrollPosRef.current = window.innerHeight;
              if (trackRef.current) {
                trackRef.current.style.transform = `translateY(${scrollPosRef.current}px)`;
              }
              blackPauseRef.current = false;
            }, 3000);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', measure);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [mode]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  /* ── Audio helpers ── */

  const startAudio = useCallback((trackIdx: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    const track = TRACKS[trackIdx];
    if (!track) return;
    const audio = new Audio(track.file);
    audio.volume = volumeRef.current / 100;
    audio.loop = true;
    audio.play().catch(() => {});
    audioRef.current = audio;
  }, []);

  /* ── Event handlers ── */

  const handleSongSelect = useCallback(
    (trackIdx: number) => {
      setSelectedTrack(trackIdx);
      startAudio(trackIdx);
      setMode('credits');
    },
    [startAudio],
  );

  const handleTrackChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idx = Number(e.target.value);
      setSelectedTrack(idx);
      startAudio(idx);
    },
    [startAudio],
  );

  const handleStartAttack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setShowConfirm(false);
    setAttackResult(null);
    setMode('attack');
  }, []);

  const handleAttackFinish = useCallback((result: AttackResult) => {
    setAttackResult(result);
    setMode('endscreen');
  }, []);

  const handleScoreSubmit = useCallback((playerName: string) => {
    if (attackResult) {
      submitScore(playerName, attackResult.hitCount);
    }
  }, [attackResult, submitScore]);

  const handleExitAttack = useCallback(() => {
    loopCountRef.current = 0;
    startAudio(selectedTrack);
    setMode('credits');
  }, [selectedTrack, startAudio]);

  const handleReset = useCallback(() => {
    scrollPosRef.current = 0;
    blackPauseRef.current = false;
    loopCountRef.current = 0;
    if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }
    if (trackRef.current) {
      trackRef.current.style.transform = 'translateY(0)';
    }
  }, []);

  /* ═══════════════════════════════════════════
     Render helpers
     ═══════════════════════════════════════════ */

  const renderSectionPhoto = (photo: string | string[]) => {
    const photos = Array.isArray(photo) ? photo : [photo];
    return (
      <div className={photos.length > 1 ? styles.sectionPhotoRow : styles.sectionPhoto}>
        {photos.map((p) => (
          <img key={p} src={`/credits-photos/${p}`} alt="" />
        ))}
      </div>
    );
  };

  /* ═══════════════════════════════════════════
     Render: Song Selection
     ═══════════════════════════════════════════ */

  if (mode === 'select') {
    return (
      <div className={styles.creditsPage}>
        <div className={styles.songSelectOverlay}>
          <div className={styles.songSelectCard}>
            <div className={styles.songSelectTitle}>Choose Your Song</div>
            <div className={styles.songSelectSubtitle}>Select the music for the credits</div>
            <div className={styles.songList}>
              {TRACKS.map((t, i) => (
                <button
                  key={t.file}
                  className={`${styles.songItem} ${selectedTrack === i ? styles.songItemActive : ''}`}
                  onClick={() => setSelectedTrack(i)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <button className={styles.playButton} onClick={() => handleSongSelect(selectedTrack)}>
              {'\u25B6\uFE0E'} Play
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     Render: Attack Mode
     ═══════════════════════════════════════════ */

  if (mode === 'attack') {
    return (
      <div className={styles.creditsPage}>
        <AttackGame onExit={handleExitAttack} onFinish={handleAttackFinish} />
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     Render: End Screen
     ═══════════════════════════════════════════ */

  if (mode === 'endscreen' && attackResult) {
    return (
      <div className={styles.creditsPage}>
        <AttackEndScreen
          result={attackResult}
          onSubmit={handleScoreSubmit}
          onExit={handleExitAttack}
        />
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     Render: Credits Roll
     ═══════════════════════════════════════════ */

  return (
    <div className={styles.creditsPage}>
      <div className={styles.vignette} />

      {/* Controls bar */}
      <div className={styles.controlsBar}>
        <select className={styles.trackSelect} value={selectedTrack} onChange={handleTrackChange}>
          {TRACKS.map((t, i) => (
            <option key={t.file} value={i}>
              {t.name}
            </option>
          ))}
        </select>

        <div className={`${styles.sliderGroup} ${styles.volumeSliderGroup}`}>
          <span className={styles.sliderLabel}>Vol</span>
          <input
            type="range"
            className={styles.volumeSlider}
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
          <span className={styles.sliderValue}>{volume}%</span>
        </div>

        <div className={styles.sliderGroup}>
          <span className={styles.sliderLabel}>Speed</span>
          <input
            type="range"
            className={styles.speedSlider}
            min={0.1}
            max={3}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className={styles.sliderValue}>{formatSpeed(speed)}x</span>
        </div>

        <button className={styles.resetBtn} onClick={handleReset} title="Reset to beginning">
          &#x21BA;
        </button>

        <div className={styles.controlsRight}>
          <a href="/" className={styles.backLink}>
            Back to Desktop
          </a>
          <button className={styles.lastGoodbyeBtn} onClick={() => setShowConfirm(true)}>
            Last Goodbye
          </button>
        </div>
      </div>

      {/* Scrolling credits */}
      <div className={styles.scrollContainer}>
        <div ref={trackRef} className={styles.creditsTrack}>
          <div className={styles.openingSpace} />

          <div className={styles.universityLogo}>
            <img src="/credits-photos/flpoly.png" alt="Florida Polytechnic University" />
          </div>

          <div className={styles.mainTitle}>Daniel J. Taylor</div>

          <div className={styles.subtitleBlock}>
            <div className={styles.subtitleUniversity}>Florida Polytechnic University</div>
            <div className={styles.subtitleDegree}>Computer Engineering</div>
            <div className={styles.subtitleClass}>Class of 2026 Graduate</div>
          </div>

          <div className={styles.divider} />

          {CREDITS_DATA.map((section) => {
            const useTwoCol = section.entries.length >= TWO_COL_THRESHOLD;
            const nameEntries = section.entries.map((entry) => (
              <div key={`${section.title}-${entry.name}`} className={useTwoCol ? styles.twoColumnEntry : undefined}>
                {entry.photo && (
                  <div className={styles.photoSlot}>
                    <img src={`/credits-photos/${entry.photo}`} alt={entry.name} />
                  </div>
                )}
                <div className={section.title === 'In Memory Of' ? styles.memorialName : styles.name}>
                  {entry.name}
                </div>
                {entry.role && <div className={styles.role}>{entry.role}</div>}
                {entry.needsLastName && <div className={styles.placeholder}>[INSERT LAST NAME]</div>}
              </div>
            ));
            return (
              <div key={section.title}>
                {section.photo && renderSectionPhoto(section.photo)}
                <div className={section.title === 'In Memory Of' ? styles.memorialTitle : styles.sectionTitle}>
                  {section.title}
                </div>
                {useTwoCol ? (
                  <div className={styles.twoColumnNames}>{nameEntries}</div>
                ) : (
                  nameEntries
                )}
                <div className={styles.divider} />
              </div>
            );
          })}

          <div className={styles.closingMessage}>Thank You</div>
          <div className={styles.closingSubtext}>To everyone who helped me get here.</div>
          <div className={styles.closingSubtext}>We made it!</div>

          <div className={styles.divider} />

          <div className={styles.adventureTitle}>Onto The Next Adventure</div>

          <div className={styles.adventureEntry}>
            <div className={styles.adventurePhoto}>
              <img src="/credits-photos/wellsfargo.jpg" alt="Wells Fargo" />
            </div>
            <div className={styles.adventureCompany}>Wells Fargo</div>
            <div className={styles.adventureRole}>Cybersecurity Intern</div>
            <div className={styles.adventureLocation}>Charlotte, NC</div>
          </div>

          <div className={styles.adventureEntry}>
            <div className={styles.adventurePhoto}>
              <img src="/credits-photos/IBM.png" alt="IBM" />
            </div>
            <div className={styles.adventureCompany}>IBM</div>
            <div className={styles.adventureRole}>IBM Power Systems QA/Test Developer</div>
            <div className={styles.adventureLocation}>Austin, TX</div>
          </div>

          <div className={styles.year}>2026</div>
          <div className={styles.endSpace} />
        </div>
      </div>

      {/* Confirm dialog for Last Goodbye */}
      {showConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmCard}>
            <div className={styles.confirmText}>Are you sure? This will start a game!</div>
            <div className={styles.confirmButtons}>
              <button className={styles.confirmYes} onClick={handleStartAttack}>
                Yes
              </button>
              <button className={styles.confirmNo} onClick={() => setShowConfirm(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
