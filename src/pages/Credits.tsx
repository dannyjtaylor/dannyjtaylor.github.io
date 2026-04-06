import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Credits.module.css';

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
}

const CREDITS_DATA: CreditSection[] = [
  {
    title: 'My Family',
    entries: [
      { name: 'Andrew Livingston', role: 'Cousin' },
      { name: 'Aunt Caroline', role: 'Aunt' },
      { name: 'Aunt Silvia', role: 'Aunt' },
      { name: 'Aunt Sue', role: 'Aunt' },
      { name: 'Forrest Taylor', role: 'Brother' },
      { name: 'George Livingston', role: 'Cousin' },
      { name: 'Hannah Livingston', role: 'Cousin' },
      { name: 'Hunter Livingston', role: 'Cousin' },
      { name: 'Jacob Livingston', role: 'Cousin' },
      { name: 'John Taylor', role: 'Father' },
      { name: 'Johnny Taylor', role: 'Brother' },
      { name: 'Katherine Taylor', role: 'Mother' },
      { name: 'Katheryn', needsLastName: true },
      { name: 'Patricia Taylor', role: 'Sister' },
      { name: 'Uncle Boo', role: 'Uncle' },
      { name: 'Uncle Clagget', role: 'Uncle' },
      { name: 'Uncle Randy', role: 'Uncle' },
    ],
  },
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
    entries: [
      { name: 'Anthony Dreier' },
      { name: 'Colby Bradford' },
      { name: 'Raymond', needsLastName: true },
      { name: 'Sahil', needsLastName: true },
      { name: 'Sterling', needsLastName: true },
      { name: 'Thomas Cook' },
      { name: 'Will', needsLastName: true },
    ],
  },
  {
    title: 'In Memory Of',
    entries: [
      { name: 'Logan Hewitt' },
    ],
  },
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
      { name: 'Genia', needsLastName: true },
      { name: 'Joseph Gregory Salazar Rosillo' },
      { name: 'Lele', needsLastName: true },
      { name: 'Liv', needsLastName: true },
      { name: 'Nanox', needsLastName: true },
      { name: 'Ouroborix', needsLastName: true },
      { name: 'Ridge', needsLastName: true },
      { name: 'Ryan', needsLastName: true },
      { name: 'Savanna', needsLastName: true },
      { name: 'Shin', needsLastName: true },
      { name: 'Tim', needsLastName: true },
      { name: 'Z', needsLastName: true },
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
      { name: 'Carson', needsLastName: true },
      { name: 'Dylan Catlin' },
      { name: 'Jackson Bopp' },
      { name: 'Karl', needsLastName: true },
      { name: 'Leona Catlin' },
      { name: 'Michael', needsLastName: true },
      { name: 'Sam Critchlow' },
      { name: 'Stephanie Catlin' },
      { name: 'Tyler Critchlow' },
    ],
  },
  {
    title: "Polk County Sheriff's Office LiDAR Team (Capstone)",
    entries: [
      { name: 'James Allegra' },
      { name: 'Gaspar Chayer' },
      { name: 'Gerardo Claudio' },
      { name: 'Jackson Giles' },
      { name: 'Leon Harry' },
      { name: 'Lillian Wright' },
      { name: 'Michael Kennon', role: 'Sponsor' },
      { name: 'Michael Stevenson' },
      { name: 'Jeremy Webb', role: 'Sponsor' },
    ],
  },
  {
    title: 'Professors',
    entries: [
      { name: 'Austin Anderson' },
      { name: 'Dr. Drourin' },
      { name: 'Dr. Elizabeth Kames' },
      { name: 'Dr. Emad Foaud' },
      { name: 'Dr. Farmani' },
      { name: 'Dr. Hoan Ngo' },
      { name: 'Dr. Jared Bunn' },
      { name: 'Dr. Manoj' },
      { name: 'Dr. Muhammad Ullah' },
      { name: 'Dr. Olin' },
      { name: 'Dr. Onur Toker' },
      { name: 'Dr. Rawa Adla' },
      { name: 'Dr. Sakib' },
      { name: 'Dr. Sista' },
      { name: 'Dr. Sundari Ramabhotla' },
      { name: 'Mr. Falcao' },
    ],
  },
  {
    title: 'RAs/CDs',
    entries: [
      { name: 'Emily', needsLastName: true },
      { name: 'Jordan Hall' },
      { name: 'Maddox', needsLastName: true },
    ],
  },
  {
    title: 'Really Smart People',
    entries: [
      { name: 'Zane Wolfe' },
    ],
  },
  {
    title: 'Rotaract',
    entries: [
      { name: 'Aidan Morris' },
      { name: 'Alex Cam' },
      { name: 'Alyson Smyth' },
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
      { name: 'Jesus Sanchez' },
      { name: 'Larry Walker' },
      { name: 'Lawrence Drake' },
      { name: 'Melanie Najera' },
      { name: 'Patrick', needsLastName: true },
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
  {
    title: 'SHPE Eboard 2025\u20132026',
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
    title: "Sorry I Couldn't Think of a Category For You Guys",
    entries: [
      { name: 'Albert Ubieta' },
      { name: 'Alfonso', needsLastName: true },
      { name: 'Aliyah', needsLastName: true },
      { name: 'Alis Craig' },
      { name: 'Andrew Blackwelder' },
      { name: "Andrew Blackwelder's Cousin Thats Dating Andrew My Cousin" },
      { name: 'Andrew Graham' },
      { name: 'Andrew Piasecki' },
      { name: 'Andrew Ptazek' },
      { name: 'Anthony Parinello' },
      { name: 'Brady Lenox' },
      { name: 'Brandon Camacho' },
      { name: 'Cameron', needsLastName: true },
      { name: 'Chiara Bottega' },
      { name: 'Chris Mather' },
      { name: 'Christian Cruz' },
      { name: 'Clara Satterfield' },
      { name: 'Connor', needsLastName: true },
      { name: 'Dante', needsLastName: true },
      { name: 'David Para' },
      { name: 'David Tarbox' },
      { name: 'David Vidana' },
      { name: 'David Zambrano' },
      { name: "Duce D'Anthony Dossey" },
      { name: 'Eddrick', needsLastName: true },
      { name: 'Eli Wolfe' },
      { name: 'Elijah Kenney' },
      { name: 'Emily', needsLastName: true, role: 'Not the RA' },
      { name: 'Erich Esqueda' },
      { name: 'Eugene', needsLastName: true },
      { name: 'Fabian', needsLastName: true },
      { name: 'Francisco', needsLastName: true },
      { name: 'Gabby', needsLastName: true },
      { name: 'Gavin Higgs' },
      { name: 'Giana', needsLastName: true },
      { name: 'Henry Casanova' },
      { name: 'Ian Lopez' },
      { name: 'Jacob Brescia' },
      { name: 'Jacob Paccione' },
      { name: 'Jacob Suppuel' },
      { name: 'Jake Diaz-Iglesias' },
      { name: 'Jannice', needsLastName: true },
      { name: 'Jasmine', needsLastName: true },
      { name: 'Javon', needsLastName: true },
      { name: 'Jbo', needsLastName: true },
      { name: 'Jillian', needsLastName: true },
      { name: 'Jorgeandres Alvarez' },
      { name: 'Josh Alletto' },
      { name: 'Justis', needsLastName: true },
      { name: 'Kailey Gibbons' },
      { name: 'Kaitlyn Surovy' },
      { name: 'Kevin Su' },
      { name: 'Kody Byrd' },
      { name: 'Koral', needsLastName: true },
      { name: 'Kyla Harpe' },
      { name: 'Kyle', needsLastName: true },
      { name: 'Kyle Blanchard' },
      { name: 'Lauren', needsLastName: true },
      { name: 'Leia', needsLastName: true },
      { name: 'Liam', needsLastName: true },
      { name: 'Logan', needsLastName: true },
      { name: 'Lucas Batista' },
      { name: 'Luis Mata-Moreno' },
      { name: 'Luis Silva' },
      { name: 'Lukas Kelk' },
      { name: 'Lyra', needsLastName: true },
      { name: 'Marisa de Comier' },
      { name: 'Maya Stuhlman' },
      { name: 'Meleena Scott' },
      { name: 'Melanie Morenson' },
      { name: 'Michael Carlson' },
      { name: 'Miguel', needsLastName: true },
      { name: 'Mikala Yin-Furiato' },
      { name: 'Mo Hadid' },
      { name: 'Moises', needsLastName: true },
      { name: 'Noelia Sanchez' },
      { name: 'Pressley Hendrix' },
      { name: 'Quentin', needsLastName: true },
      { name: 'Rita', role: 'for cutting my hair so many times' },
      { name: 'Robert', needsLastName: true },
      { name: 'Roland', needsLastName: true },
      { name: 'Ryan Mullins' },
      { name: 'Stella Asanova' },
      { name: 'Thomas Risalvato' },
      { name: 'Tugba', needsLastName: true },
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
    entries: [
      { name: 'Bethany', needsLastName: true },
      { name: 'Jay', needsLastName: true },
      { name: 'Jonathan', needsLastName: true },
      { name: 'Julian', needsLastName: true },
      { name: 'Ryan', needsLastName: true },
      { name: 'Wack', needsLastName: true },
    ],
  },
  {
    title: 'Winter Haven Technology Services',
    entries: [
      { name: 'Adriana Bottega' },
      { name: 'Aizan "Bobby" Khan' },
      { name: 'Angel', needsLastName: true },
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
      { name: 'Thorfinn Son of Thors' },
      { name: 'Toby Fox' },
      { name: 'Yu Narukami' },
    ],
  },
];

const ALL_NAMES = CREDITS_DATA.flatMap((s) => s.entries.map((e) => e.name));
const BASE_DURATION = 180;

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
}

let nextProjId = 0;

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  flash: boolean,
) {
  ctx.save();
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
  ctx.restore();
}

function AttackGame({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI setup
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

    // Logical dimensions (CSS pixels)
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // Audio
    const audio = new Audio('/toby_fox_lastgoodbye.mp3');
    audio.loop = true;
    audio.volume = 0.7;
    audio.play().catch(() => {});

    // State (all refs for 60fps performance)
    const heart = { x: W() / 2, y: H() * 0.7 };
    let projectiles: Projectile[] = [];
    let hitFlash = 0;
    let spawnTimer = 0;
    let nameIdx = 0;
    let lastTime = 0;
    let frameId = 0;
    let elapsed = 0;
    const HEART_SPEED = 300;
    const HEART_SIZE = 18;
    const HITBOX = 5;

    // Keyboard
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitRef.current();
        return;
      }
      keys.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Touch
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

    // Spawn a projectile — ~70% target the heart directly (Undertale-style)
    const spawn = () => {
      const name = ALL_NAMES[nameIdx % ALL_NAMES.length] ?? 'Danny';
      nameIdx++;
      const fontSize = Math.max(16, Math.min(26, W() / 28));
      ctx.font = `${fontSize}px Georgia, serif`;
      const tw = ctx.measureText(name).width;
      const th = fontSize * 1.2;
      const id = nextProjId++;
      const w = W();
      const h = H();

      // Wide speed variation — some crawl, some fly
      const baseSpeed = 80 + elapsed * 0.3;
      const speed = baseSpeed + Math.random() * 220;

      const roll = Math.random();

      if (roll < 0.7) {
        // ── Targeted: spawn from a random edge, aim directly at the heart ──
        const edge = Math.floor(Math.random() * 4);
        let sx: number, sy: number;
        switch (edge) {
          case 0: sx = -tw - 10; sy = Math.random() * h; break;
          case 1: sx = w + 10; sy = Math.random() * h; break;
          case 2: sx = Math.random() * (w - tw); sy = -th; break;
          default: sx = Math.random() * (w - tw); sy = h + th; break;
        }
        const dx = heart.x - sx;
        const dy = heart.y - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        projectiles.push({
          id, text: name, x: sx, y: sy,
          vx: (dx / dist) * speed, vy: (dy / dist) * speed,
          w: tw, h: th,
        });
      } else {
        // ── Random straight-line directions ──
        const pattern = Math.floor(Math.random() * 4);
        switch (pattern) {
          case 0:
            projectiles.push({ id, text: name, x: -tw - 10, y: Math.random() * h, vx: speed, vy: 0, w: tw, h: th });
            break;
          case 1:
            projectiles.push({ id, text: name, x: w + 10, y: Math.random() * h, vx: -speed, vy: 0, w: tw, h: th });
            break;
          case 2:
            projectiles.push({ id, text: name, x: Math.random() * (w - tw), y: -th, vx: 0, vy: speed, w: tw, h: th });
            break;
          default:
            projectiles.push({ id, text: name, x: Math.random() * (w - tw), y: h + th, vx: 0, vy: -speed, w: tw, h: th });
            break;
        }
      }
    };

    // Game loop
    const gameLoop = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      elapsed += dt;

      const w = W();
      const h = H();

      // Move heart
      if (keys.has('arrowleft') || keys.has('a')) heart.x -= HEART_SPEED * dt;
      if (keys.has('arrowright') || keys.has('d')) heart.x += HEART_SPEED * dt;
      if (keys.has('arrowup') || keys.has('w')) heart.y -= HEART_SPEED * dt;
      if (keys.has('arrowdown') || keys.has('s')) heart.y += HEART_SPEED * dt;
      heart.x = Math.max(HEART_SIZE, Math.min(w - HEART_SIZE, heart.x));
      heart.y = Math.max(HEART_SIZE, Math.min(h - HEART_SIZE, heart.y));

      // Spawn
      const spawnInterval = Math.max(0.4, 1.0 - elapsed * 0.005);
      spawnTimer += dt;
      if (spawnTimer > spawnInterval) {
        spawnTimer = 0;
        spawn();
        if (Math.random() < 0.2) { spawn(); spawn(); }
      }

      // Update projectiles
      for (const p of projectiles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      projectiles = projectiles.filter(
        (p) => p.x > -500 && p.x < w + 500 && p.y > -200 && p.y < h + 200,
      );

      // Collision (tiny hitbox like Undertale)
      if (hitFlash <= 0) {
        for (const p of projectiles) {
          if (
            heart.x + HITBOX > p.x &&
            heart.x - HITBOX < p.x + p.w &&
            heart.y + HITBOX > p.y - p.h * 0.2 &&
            heart.y - HITBOX < p.y + p.h
          ) {
            hitFlash = 0.5;
            break;
          }
        }
      } else {
        hitFlash -= dt;
      }

      // ── Draw ──
      ctx.clearRect(0, 0, w, h);

      if (hitFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${hitFlash * 0.15})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Projectiles
      const drawFontSize = Math.max(16, Math.min(26, w / 28));
      ctx.font = `${drawFontSize}px Georgia, serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      for (const p of projectiles) {
        ctx.fillText(p.text, p.x, p.y);
      }

      // Heart
      drawHeart(ctx, heart.x, heart.y, HEART_SIZE, hitFlash > 0);

      // Hints
      ctx.font = '13px Georgia, serif';
      ctx.fillStyle = '#444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const isMobile = 'ontouchstart' in window;
      ctx.fillText(
        isMobile ? 'Drag to move \u00B7 Tap \u2715 to exit' : 'Arrow keys / WASD to move \u00B7 ESC to exit',
        w / 2,
        h - 16,
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
   Main Credits Component
   ═══════════════════════════════════════════ */

type Mode = 'select' | 'credits' | 'attack';

function formatSpeed(s: number): string {
  if (Number.isInteger(s)) return `${s}`;
  const str = s.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return str;
}

export function Credits() {
  const [mode, setMode] = useState<Mode>('select');
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [volume, setVolume] = useState(60);
  const [speed, setSpeed] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const animFrameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const contentHeightRef = useRef(0);
  const blackPauseRef = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef(1);
  const volumeRef = useRef(60);

  // Keep refs in sync
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // JS-driven scroll animation (replaces CSS animation for looping + dynamic speed)
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
          blackPauseRef.current = true;
          if (trackRef.current) trackRef.current.style.opacity = '0';

          pauseTimerRef.current = setTimeout(() => {
            scrollPosRef.current = 0;
            if (trackRef.current) {
              trackRef.current.style.transform = 'translateY(0)';
              trackRef.current.style.opacity = '1';
            }
            resumeTimerRef.current = setTimeout(() => {
              blackPauseRef.current = false;
            }, 1500);
          }, 3000);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', measure);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [mode]);

  // Cleanup audio on unmount
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
    setMode('attack');
  }, []);

  const handleExitAttack = useCallback(() => {
    startAudio(selectedTrack);
    setMode('credits');
  }, [selectedTrack, startAudio]);

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
              &#9654; Play
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
        <AttackGame onExit={handleExitAttack} />
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

        <div className={styles.sliderGroup}>
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
            min={0.25}
            max={3}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className={styles.sliderValue}>{formatSpeed(speed)}x</span>
        </div>

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

          <div className={styles.mainTitle}>Danny Taylor</div>
          <div className={styles.subtitle}>Class of 2026</div>

          <div className={styles.divider} />

          {CREDITS_DATA.map((section) => (
            <div key={section.title}>
              <div className={styles.sectionTitle}>{section.title}</div>
              {section.entries.map((entry) => (
                <div key={`${section.title}-${entry.name}`}>
                  {entry.photo && (
                    <div className={styles.photoSlot}>
                      <img src={`/credits-photos/${entry.photo}`} alt={entry.name} />
                    </div>
                  )}
                  <div className={styles.name}>{entry.name}</div>
                  {entry.role && <div className={styles.role}>{entry.role}</div>}
                  {entry.needsLastName && <div className={styles.placeholder}>[INSERT LAST NAME]</div>}
                </div>
              ))}
              <div className={styles.divider} />
            </div>
          ))}

          <div className={styles.closingMessage}>Thank You</div>
          <div className={styles.closingSubtext}>To everyone who helped me get here.</div>
          <div className={styles.closingSubtext}>I couldn&apos;t have done it without you.</div>
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
