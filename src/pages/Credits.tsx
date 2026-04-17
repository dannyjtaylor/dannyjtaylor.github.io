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
  { name: 'Cave Story - Wind Fortress', file: '/cave_story_windfortress.mp3' },
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
  photo?: string | string[];   /* centered logo(s) shown above section title */
  leftPhotos?: string[];       /* personal photos in left side column */
  rightPhotos?: string[];      /* personal photos in right side column */
}

const CREDITS_DATA: CreditSection[] = [
  /* ── Top sections ── */
  {
    title: 'My Family',
    leftPhotos: ['family_1.jpg', 'me_with_grandmapat_and_grandpahoward.jpg', 'family_2.jpg'],
    rightPhotos: ['me_and_patricia_taylor.png', '3DS_everyone_and_family.jpg'],
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
    leftPhotos: ['dr_ngo.jpg', 'friend_group_rawa.jpg'],
    rightPhotos: ['me_with_rawa_adla_card.jpg'],
    entries: [
      { name: 'Devin Stephenson', role: "Florida Polytechnic President" },
      { name: 'Jon Pawlecki', role: "Assistant VP of Student Affairs" },
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
    leftPhotos: ['gabo_me_kro.jpg'],
    rightPhotos: ['shiraj_and_i_IBM.jpg'],
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
    leftPhotos: ['rotaract_1.jpg', 'aidan_morris_and_me.jpg', 'me_domenic_aidan.jpg', 'rotaract_3.jpg', 'rotaract_5.jpg', 'rotaract_7.jpg'],
    rightPhotos: ['rotaract_2.jpg', 'alex_cam_1.jpg', 'brittany_me_andriana_alex.jpg', 'rotaract_4.jpg', 'rotaract_6.jpg', 'rotaract_8.jpg'],
    entries: [
      { name: 'Aidan Morris' },
      { name: 'Alyson Smyth' },
      { name: 'Alex Cam' },
      { name: 'Brittany Cam' },
      { name: 'Marisa de Comier' },
      { name: 'Ian Lopez' },
      { name: 'Bobby Green' },
      { name: 'Brian Tran' },
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
      { name: 'Pressley Hendrix' },
      { name: 'Joshua Chase' },
      { name: 'Leonardo Arriaga ' },
      { name: 'Tyler Reuter' },
      { name: 'Michael Biggar' }
    ],
  },
  {
    title: 'SHPE',
    photo: 'SHPE_1.png',
    leftPhotos: ['gabo_louis_me.jpg', 'me_philadelphia.jpg', 'me_andrew_louis.png'],
    rightPhotos: ['anaheim_1.jpg', 'anaheim_2.jpg', 'maria_roman_1.jpg'],
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
    leftPhotos: [
      'friend_group_boys.jpg',
      'friend_group_2.jpg',
      'friend_group_large.jpg',
      'me_bryon_adriana.jpg',
      'me_bryon_adriana_cruise.jpg',
      'friend_group_8.jpg',
    ],
    rightPhotos: [
      'friend_group_1.jpg',
      'friend_group_3.jpg',
      'friend_group_4.jpg',
      'me_bryon_adriana_chiara_kyle.jpg',
      'me_bryon_adrianas_family.jpg',
      'adrianas_birthday_friend_group.jpg',
    ],
    entries: [
      { name: 'Bryon Catlin' },
      { name: 'George Mancini' },
      { name: 'Noah Campise' },
    ],
  },
  {
    title: 'Good Mythical Morning Enjoyers',
    rightPhotos: ['me_jaylee_emma.jpg'],
    entries: [
      { name: 'Emma Rossi' },
      { name: 'Jaylee Ciaschini' },
      { name: 'Gabby Martin'},
      { name: 'Manny Yousif'},
    ],
  },
  {
    title: 'IEEE',
    photo: ['IEEE.png', 'IEEEhkn.png'],
    entries: [
      { name: 'Anthony Dreier'},
      { name: 'Colby Bradford'},
      { name: 'Raymond Walker'},
      { name: 'Sahil Tahwalker'},
      { name: 'Sterling Peters'},
      { name: 'Thomas Cook'},
      { name: 'Will Carroll'},
      { name: 'Fabian Bosneanu' },
      { name: 'Jacob Brescia' },
      { name: 'Aidan Flynn'}
    ],
  },
  {
    title: "Polk County Sheriff's Office LiDAR Team (Capstone)",
    photo: 'sheriffsoffice.png',
    leftPhotos: ['lidarteam_1.jpg', 'friend_group_research.png'],
    rightPhotos: ['lidar_2.jpg', 'research_1.jpg'],
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
    leftPhotos: ['me_alaska.jpg'],
    rightPhotos: ['me_random_with_cars.jpg'],
    entries: [
      { name: 'Brianna Pratts' },
      { name: 'Casen Simmons' },
      { name: 'Conor Wilson' },
      { name: 'Danyela Marcelo-Lopez' },
      { name: "Duce D'Anthony Dossey" },
      { name: 'Sean Turnock' },
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
    leftPhotos: ['random_1.jpg', 'friends_target.jpg'],
    rightPhotos: ['random_2.jpg'],
    entries: [
      { name: 'Bryon Catlin II' },
      { name: 'Carson Elliott', role: "NerdLabz" },
      { name: 'Dylan Catlin' },
      { name: 'Jackson Bopp' },
      { name: 'Karmichael Realina', role: 'Karl, always good hanging out with you' },
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
      { name: "Jessica Steffen" },
      { name: 'Andrew Graham' },
      { name: 'Andrew Piasecki' },
      { name: 'Andrew Ptazek' },
      { name: 'Anthony Parinello' },
      { name: 'Brady Lenox' },
      { name: 'Brandon Camacho' },
      { name: 'Nico Rapp'},
      { name: 'Cameron Willaims' },
      { name: 'Chris Mather' },
      { name: 'Christian Cruz' },
      { name: 'Clara Satterfield' },
      { name: 'Dylan Sturdivant' },
      { name: 'Connor Anderson' },
      { name: 'Dante Marin-Villanueva' },
      { name: 'David Para' },
      { name: 'David Tarbox' },
      { name: 'David Vidana' },
      { name: 'David Zambrano' },
      { name: 'Eddrick Tirado Lozada' },
      { name: 'Eli Wolfe' },
      { name: 'Elijah Kenney' },
      { name: 'Emily Hanson' },
      { name: 'Erich Esqueda' },
      { name: 'Eugene Sotelo' },
      { name: 'Francisco Vega', role: 'glad you switched to CE' },
      { name: 'Gabby Villalba' },
      { name: 'Giana Reyes' },
      { name: 'Jacob Paccione' },
      { name: 'Jake Diaz-Iglesias' },
      { name: 'Jannice Rivera' },
      { name: 'Jasmine Heymann' },
      { name: 'Javon Ortiz' },
      { name: 'J "Jbo" Bonilla' },
      { name: 'Grace Hyatt' },
      { name: 'Jillian Craig' },
      { name: 'Jorgeandres Alvarez' },
      { name: 'Josh Alletto' },
      { name: 'Justis Nazirbage' },
      { name: 'Kailey Gibbons' },
      { name: 'Kaitlyn Surovy' },
      { name: 'Kody Byrd' },
      { name: 'Koral Ruiz' },
      { name: 'Kyla Harpe' },
      { name: 'Chiara Bottega' },
      { name: 'Kyle Trotter' },
      { name: 'Kyle Blanchard' },
      { name: 'Lauren Schneider' },
      { name: 'Leia Hok' },
      { name: 'Liam' },
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
      { name: 'Eduardo Jirau'},
      { name: 'Jes Pate'},
       { name: 'Joseph Wright'},
       { name: 'Noah SDC'},
    ],
    leftPhotos: [
      'me_and_mo_haddid.jpg',
      'clara_1.jpg',
      'escape_room_1.jpg',
      'rappel_me_random.jpg',
      'friend_group_image_4.jpg',
      'me_on_dragon.jpg',
    ],
    rightPhotos: [
      'luis_mata_moreno.jpg',
      'NOVA_with_lukas_kelk.jpg',
      'escape_room_2.jpg',
      'howl_o_scream.jpg',
      'friend_group_normal_camera.jpg',
    ],
  },
  {
    title: 'Student Government Association',
    entries: [
      { name: 'Colby Mandrodt', role: 'President' },
      { name: 'Nolan Nguyen', role: 'Vice President' },
      { name: 'Hailey Bauer', role: 'SGA Director of General Operations' },
      { name: 'Trevor Davidson', role: 'SGA Senator' },
      { name: 'Ms. Ashley Townsend', role: 'SGA Program Manager, very prominent in Rotaract!'}

    ],
  },
  {
    title: 'VALORANT Varsity',
    photo: ['flpolyesports.png', 'valorant.png'],
    leftPhotos: ['me_random.jpg'],
    entries: [
      { name: 'Vanessa Korthas' },
      { name: 'Jaden Akers-Atkins' },
      { name: 'Johnathan Nguyen', role: "Duelist" },
      { name: 'Julian Amato', role: "cool guy to play with and gym with, sorry for 1-tapping you so much" },
      { name: 'Ryan Trinh', role: "aeri, Duelist" },
      { name: 'Wack', role: "ThatsWack, Team Captain & Omen Player" },
    ],
  },
  {
    title: 'Winter Haven Technology Services',
    leftPhotos: ['winter_haven_1.jpg'],
    rightPhotos: ['winter_haven_nick.png'],
    entries: [
      { name: 'Adriana Bottega' },
      { name: 'Aizan "Bobby" Khan' },
      { name: 'Angel Trinidad' },
      { name: 'Blake Cervone' },
      { name: 'Connor Cervone' },
      { name: 'Christopher Duclos' },
      { name: 'Christopher Taylor' },
      { name: 'Esteban Suarez' },
      { name: 'Hiep Nguyen' },
      { name: 'Jeremiah Joseph' },
      { name: 'Jose Vega' },
      { name: 'Joshua Stone' },
      { name: 'Katiya Taylor' },
      { name: 'Kristina Smith' },
      { name: 'Michael Adams' },
      { name: 'Mikey LaFollette' },
      { name: 'Nickolas Phan' },
      { name: 'Pickleball John' },
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
    leftPhotos: ['cruise_1.jpg', 'cruise_2.jpg'],
    rightPhotos: ['cruise_3.jpg', 'friend_group_5.png'],
    entries: [
      { name: 'Alibaba' },
      { name: 'Andy Miller', role: 'Lets me carry him in VALORANT' },
      { name: 'Nicole Curatolo', role: 'athena, Best Sage main' },
      { name: 'Bruno', needsLastName: true },
      { name: 'Daichi' },
      { name: 'Daniela Mazurevich', role: 'LatvianOccupier' },
      { name: 'Elysha' },
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
      { name: 'Xitlally Serrano', role: 'Z'},
    ],
  },
  {
    title: 'Special Thanks',
    leftPhotos: ['me_invincible.jpg', 'me_presenting.jpg'],
    rightPhotos: ['me_coca_cola.jpg', 'alex_and_i.png'],
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
       { name: 'Grandma & Grandpa Taylor'},
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
  hitAge: number;       // seconds since hit — used to remove after brief flash
  action: number;       // 0=normal, 1=homing-lock, 2=fired-bullet, 3=wrap, 5=wheel-spoke
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

function loadHpInfiniteImage(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = '/credits-photos/hpinfinite.png';
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
    vx: 0, vy: 0, hit: false, hitAge: 0, action: 0, frame: 0,
    gravity: 0, angle: 0,
    orbitCx: 0, orbitCy: 0, orbitR: 0, orbitAngle: 0, orbitSpeed: 0, logoImg: null,
    ...base,
  };
}

/* ── End-screen result ── */
interface AttackResult {
  hitCount: number;
  hitNames: string[];
  audio?: HTMLAudioElement;
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
    audio.loop = true;
    audio.volume = 0.7;
    audio.play().catch(() => {});

    const hitSounds: HTMLAudioElement[] = [];
    for (let i = 0; i < 6; i++) {
      const s = new Audio('/deltarune_hit.mp3');
      s.volume = 0.5;
      hitSounds.push(s);
    }
    let hitSoundIdx = 0;
    let lastHitSoundTime = 0;
    const playHitSound = () => {
      const now = performance.now();
      if (now - lastHitSoundTime < 50) return;
      lastHitSoundTime = now;
      const s = hitSounds[hitSoundIdx % hitSounds.length];
      if (s) { s.currentTime = 0; s.play().catch(() => {}); }
      hitSoundIdx++;
    };

    let heartImg: HTMLImageElement | null = null;
    loadHeartImage().then((img) => { heartImg = img; });
    let hpBarImg: HTMLImageElement | null = null;
    loadHpInfiniteImage().then((img) => { hpBarImg = img; });
    preloadFonts();

    /* ── Preload logo images & create yellow silhouette versions ── */
    const logoImages: HTMLImageElement[] = ATTACK_LOGOS.map((logo) => {
      const img = new Image();
      img.src = logo.src;
      return img;
    });
    /* Pre-render yellow hit versions of each logo */
    const yellowLogoCanvases: (HTMLCanvasElement | null)[] = new Array(ATTACK_LOGOS.length).fill(null);
    const createYellowLogo = (img: HTMLImageElement, idx: number) => {
      if (!img.complete || img.naturalWidth === 0) return;
      const logoInfo = ATTACK_LOGOS[idx];
      if (!logoInfo) return;
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const cctx = c.getContext('2d');
      if (!cctx) return;
      cctx.drawImage(img, 0, 0);
      /* JPGs have no alpha so source-in turns them into a solid block.
         Use multiply instead, which preserves detail and tints yellow. */
      const isJpg = /\.jpe?g$/i.test(logoInfo.src);
      cctx.globalCompositeOperation = isJpg ? 'multiply' : 'source-in';
      cctx.fillStyle = '#FFFF00';
      cctx.fillRect(0, 0, c.width, c.height);
      yellowLogoCanvases[idx] = c;
    };
    logoImages.forEach((img, i) => {
      if (img.complete) createYellowLogo(img, i);
      else img.onload = () => createYellowLogo(img, i);
    });
    const logoSpawned = new Array(ATTACK_LOGOS.length).fill(false) as boolean[];

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
    let normalFinish = false;
    /* Cutscene state */
    let endPhase = 0; /* 0=fade-to-black, 1=touched-credits, 2=scroll-down, 3=thank-you */
    let touchedScrollOffset = 0;
    let thankYouY = 0;
    let skipCutscene = false;
    const HEART_SPEED = 350;
    const isMobileDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const MAX_PROJECTILES = isMobileDevice ? 80 : 160;

    /* Safe-area insets from CSS `env(safe-area-inset-*)` — exposed through CSS
       custom props on the canvas so the canvas-drawn HP bar and HUD can respect
       iOS notch + home indicator. Falls back to 0 on browsers without support. */
    const readSafeInset = (side: 'top' | 'bottom'): number => {
      const v = getComputedStyle(canvas).getPropertyValue(`--sai-${side}`).trim();
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };
    const getSlotH = () => getFontSize() * 1.15;
    /* Heart sprite half-dimension. Mobile needs a larger floor so the heart is
       both visible under the player's thumb and has a fair hitbox vs phase-4 walls. */
    const getHeartSize = () => {
      const floor = isMobileDevice ? 14 : 9;
      return Math.max(floor, Math.floor(getSlotH() * 0.32));
    };

    /* ════════════════════════════════════════════════════
       TUNING CONSTANTS — edit here to adjust each phase.
       ════════════════════════════════════════════════════ */
    // Ph2 — Crossing Streams: gap between each row = heartDiameter + P2_GAP_EXTRA px
    const P2_GAP_EXTRA           = 5;    // px of clearance beyond heart diameter
    // Ph3 — Corridor
    const P3_FALL_SPEED_FRAC     = 0.62; // fall speed = H × this
    const P3_SPAWN_RATE          = 0.09; // seconds between each corridor name-pair
    const P3_MAX_SWING_PX        = 140;  // max corridor gap deviation from center (keeps pace with heart on PC)
    // Ph4 — Falling Walls (Undertale-accurate: rotated vertical columns)
    const P4_COL_WIDTH_RATIO     = 1.15; // column width = fontSize × ratio (controls density)
    const P4_COL_WIDTH_MIN_PX    = 22;   // absolute min column width in px
    const P4_FALL_SPEED_FRAC     = 0.30; // fall speed = H × this (per-column avg)
    const P4_SPEED_JITTER        = 0.28; // ± this fraction of avg speed per column
    const P4_NAME_V_GAP          = 6;    // px gap between stacked names within a column
    const P4_COLS_DESKTOP_CAP    = 14;   // max columns on desktop
    const P4_COLS_MOBILE_CAP     = 8;    // max columns on mobile
    // Ph7 — Spinning Wheels
    const P7_DRIFT_SPEED_FRAC    = 0.065; // drift speed = W × this
    const P7_ROT_SPEED           = 1.5;   // radians/sec rotation

    /* ── Phase system — matches Undertale's exact 6-phase sequence ── */
    let currentPhase = 0;
    let phaseTimer = 0;
    let phaseRound = 0;
    let phaseTransitionDelay = 0;
    const PHASE_TRANSITION_DURATION = 2.5; /* seconds between phases */
    const totalNames = ALL_NAMES.length * 2;
    const logoSpawnPoints = ATTACK_LOGOS.map((_, i) =>
      Math.floor(totalNames * (i + 1) / (ATTACK_LOGOS.length + 1))
    );

    /* Phase thresholds (proportional to Undertale's ~881-name distribution) */
    const phase0End = Math.floor(totalNames * 0.07);
    const phase2End = Math.floor(totalNames * 0.29);
    const phase3End = Math.floor(totalNames * 0.53);
    const phase4End = Math.floor(totalNames * 0.68);
    const phase7End = Math.floor(totalNames * 0.82);

    const getPhase = (idx: number): number => {
      if (idx < phase0End) return 0;  // Aimed spreads
      if (idx < phase2End) return 2;  // Crossing streams
      if (idx < phase3End) return 3;  // Corridor
      if (idx < phase4End) return 4;  // Vertical rain
      if (idx < phase7End) return 7;  // Spinning wheels
      return 6;                       // Fast aimed spreads
    };

    /* ── Corridor state ── */
    let corridorActive = false;
    let corridorSpawnTimer = 0;

    const getFontSize = () => Math.max(20, Math.min(32, W() / 22));

    const measureName = (name: string): { tw: number; th: number } => {
      const fontSize = getFontSize();
      ctx.font = `${fontSize}px ${DETERMINATION_SANS}`;
      /* th = glyph ink height (cap + descender), NOT CSS line-height.
         Fixes phantom top/bottom hits and aligns hitbox with visible text.
         Glyphs are drawn with textBaseline='top' at y=-th/2 so ink fills AABB. */
      return { tw: ctx.measureText(name).width, th: fontSize * 0.85 };
    };

    const nextName = (): string => {
      if (nameIdx >= totalNames) return '';
      const name = ALL_NAMES[nameIdx % ALL_NAMES.length] ?? 'Danny';
      nameIdx++;
      return name;
    };

    /* ── Phase 0 & 6: Aimed Spreads — groups of 5, stop, aim at heart, fire ── */
    const spawnAimedSpread = (fromRight: boolean, yCenter: number) => {
      const w = W();
      const spacing = Math.max(30, W() / 18);
      /* Scale slide speed with screen width so names travel ~40% of screen width
         in the slide-in window — ensures they're fully visible on wide PC displays. */
      const slideVx = Math.max(350, W() * 0.55);
      for (let i = 0; i < 5; i++) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        const startX = fromRight ? w + 50 + i * spacing : -tw - 50 - i * spacing;
        const startY = yCenter + (i - 2) * spacing;
        projectiles.push(mkProj({
          id: nextProjId++, text: name, x: startX, y: startY,
          vx: fromRight ? -slideVx : slideVx, w: tw, h: th,
          action: 1,
        }));
      }
    };

    /* ── Phase 2: Crossing Streams — full-screen interleaved waves, like Undertale ── */
    const spawnCrossingStreams = () => {
      const h = H();
      const w = W();
      const streamSpeed = Math.min(350, w * 0.55);
      /* slotH derived so that gap between every adjacent row = heartDiameter + P2_GAP_EXTRA.
         Layout: W1 at y=0, slotH, 2*slotH… W2 at slotH/2, 3*slotH/2… → gap = slotH/2 - textH */
      const textH2 = getFontSize() * 1.2;
      const heartDiam = 2 * getHeartSize();
      const slotH = 2 * textH2 + 2 * (heartDiam + P2_GAP_EXTRA);
      const count = Math.ceil(h / slotH) + 2;

      /* Wave 1 (L→R): rows at y = 0, slotH, 2*slotH, … */
      for (let i = 0; i < count; i++) {
        const name = nextName();
        if (!name) continue;
        const { tw, th } = measureName(name);
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: -tw - 40, y: i * slotH,
          vx: streamSpeed, w: tw, h: th,
        }));
      }
      /* Wave 2 (R→L): rows at y = slotH/2, 3*slotH/2, … — fits exactly between Wave 1 */
      for (let i = 0; i < count; i++) {
        const name = nextName();
        if (!name) continue;
        const { tw, th } = measureName(name);
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: w + 40, y: slotH / 2 + i * slotH,
          vx: -streamSpeed, w: tw, h: th,
        }));
      }
    };

    /* ── Phase 3: Corridor — predetermined winding path (Undertale-style) ── */
    /* Gap is 4× heart radius — consistent feel regardless of screen width */
    const getCorridorGapHalf = () => getHeartSize() * 4;
    const getCorridorFallSpeed = () => H() * P3_FALL_SPEED_FRAC;
    /* Corridor pair count is derived from the phase-3 name budget so that:
       (a) the path traverses all waypoints exactly once (progress = 0→1), and
       (b) the corridor never consumes names from phases 4, 7, or 6. */
    const CORRIDOR_TOTAL_PAIRS = Math.max(20, Math.floor((phase3End - phase2End) / 2));

    /* Predetermined gap path — waypoints as fraction of screen width.
       The gap smoothly interpolates between these positions using smoothstep.
       Each row of walls is placed at a fixed x and falls straight down. */
    const CORRIDOR_WAYPOINTS = [
      { t: 0.00, x: 0.50 },
      { t: 0.08, x: 0.50 },
      { t: 0.18, x: 0.65 },
      { t: 0.26, x: 0.65 },
      { t: 0.36, x: 0.35 },
      { t: 0.44, x: 0.28 },
      { t: 0.52, x: 0.50 },
      { t: 0.60, x: 0.68 },
      { t: 0.70, x: 0.68 },
      /* Final dramatic swings */
      { t: 0.78, x: 0.38 },
      { t: 0.86, x: 0.58 },
      { t: 0.94, x: 0.35 },
      { t: 1.00, x: 0.50 },
    ];

    const getCorridorGapX = (progress: number): number => {
      const w = W();
      const gh = getCorridorGapHalf();
      const center = w * 0.5;
      for (let i = 0; i < CORRIDOR_WAYPOINTS.length - 1; i++) {
        const a = CORRIDOR_WAYPOINTS[i]!;
        const b = CORRIDOR_WAYPOINTS[i + 1]!;
        if (progress <= b.t) {
          const local = (progress - a.t) / (b.t - a.t);
          const smooth = local * local * (3 - 2 * local); /* smoothstep */
          const rawX = w * (a.x + (b.x - a.x) * smooth);
          /* Clamp how far the gap can swing from center so it never outpaces the heart.
             On mobile P3_MAX_SWING_PX > natural swing (no clamping).
             On PC the gap is constrained so the heart can always catch up. */
          const clampedX = center + Math.max(-P3_MAX_SWING_PX, Math.min(P3_MAX_SWING_PX, rawX - center));
          return Math.max(gh + 30, Math.min(w - gh - 30, clampedX));
        }
      }
      return center;
    };

    let corridorSpawnCount = 0;

    const updateCorridor = (dt: number) => {
      /* Spawn two names (one each side) at ~4 pairs/sec.
         Each pair gets its gap position from the predetermined path. */
      corridorSpawnTimer += dt;
      const spawnRate = P3_SPAWN_RATE;
      while (corridorSpawnTimer >= spawnRate && nameIdx < phase3End && corridorSpawnCount < CORRIDOR_TOTAL_PAIRS) {
        corridorSpawnTimer -= spawnRate;
        const fallSpeed = getCorridorFallSpeed();
        const gh = getCorridorGapHalf();
        const gapX = getCorridorGapX(corridorSpawnCount / CORRIDOR_TOTAL_PAIRS);
        corridorSpawnCount++;

        const nameL = nextName();
        if (nameL) {
          const { tw, th } = measureName(nameL);
          projectiles.push(mkProj({
            id: nextProjId++, text: nameL,
            x: gapX - gh - tw, y: -th - 10,
            vy: fallSpeed, w: tw, h: th,
            action: 6,
          }));
        }
        const nameR = nextName();
        if (nameR) {
          const { tw, th } = measureName(nameR);
          projectiles.push(mkProj({
            id: nextProjId++, text: nameR,
            x: gapX + gh, y: -th - 10,
            vy: fallSpeed, w: tw, h: th,
            action: 6,
          }));
        }
      }

      /* End corridor when all pairs are spawned OR the phase-3 name budget is exhausted */
      if (corridorSpawnCount >= CORRIDOR_TOTAL_PAIRS || nameIdx >= phase3End) {
        corridorActive = false;
      }
    };

    /* ── Phase 4: Falling Walls — Undertale-accurate vertical rotated columns ──
       The screen is divided into N fixed-x columns that tile the viewport.
       Each column continuously drops names rotated 90° clockwise (text reads top-
       to-bottom). Adjacent columns use slightly different fall speeds and starting
       y-offsets so the seams between stacked names form micro-gaps the heart can
       weave through. Unlike Phase 3 (scripted corridor) there is no single "safe
       gap" — safety is in the spacing between adjacent columns and between glyphs.
       Matches reference screenshot at /credits-photos/undertalecredits_howitshouldb3.png */
    interface WallColumn { x: number; speed: number; topY: number; }
    let wallColumns: WallColumn[] | null = null;

    const initWallColumns = () => {
      const w = W();
      const h = H();
      const fs = getFontSize();
      const colW = Math.max(P4_COL_WIDTH_MIN_PX, fs * P4_COL_WIDTH_RATIO);
      const capCols = isMobileDevice ? P4_COLS_MOBILE_CAP : P4_COLS_DESKTOP_CAP;
      const numCols = Math.max(3, Math.min(capCols, Math.floor(w / colW)));
      const stepX = w / numCols;
      const baseSpeed = h * P4_FALL_SPEED_FRAC;
      wallColumns = [];
      for (let i = 0; i < numCols; i++) {
        const jitter = 1 + (Math.random() * 2 - 1) * P4_SPEED_JITTER;
        /* Stagger initial topY so columns don't all spawn in lockstep.
           Range (0.85*H .. 1.15*H) — bottom name starts a bit below screen bottom. */
        const startTopY = h * (0.85 + Math.random() * 0.3);
        wallColumns.push({
          x: stepX * (i + 0.5),
          speed: baseSpeed * jitter,
          topY: startTopY,
        });
      }
      /* Pre-fill each column upward from its startTopY until names extend above -H.
         This paints the whole screen with walls on phase entry. */
      for (const col of wallColumns) {
        fillColumnUpward(col, -h - 50);
      }
    };

    const fillColumnUpward = (col: WallColumn, untilTopY: number) => {
      while (col.topY > untilTopY && nameIdx < phase4End) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        const nameRotH = tw + P4_NAME_V_GAP;       // vertical extent after 90° rotation
        const newTopY = col.topY - nameRotH;       // top edge of the new (above) name
        const cy = newTopY + tw / 2;                // rotated-AABB vertical center
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: col.x - tw / 2,
          y: cy - th / 2,
          vy: col.speed,
          w: tw, h: th,
          angle: Math.PI / 2,                       // 90° CW — text reads top→bottom
          action: 6,                                // reuse corridor "fall" movement + cull
        }));
        col.topY = newTopY;
      }
    };

    const updateWalls = (dt: number) => {
      if (!wallColumns) return;
      /* col.topY falls in lockstep with its names' y-positions.
         When topY crosses 0, there's visible room above — spawn a new name. */
      for (const col of wallColumns) {
        col.topY += col.speed * dt;
        fillColumnUpward(col, 0);
      }
    };

    /* ── Phase 7: Spinning Wheels — two rotating spoke-wheels from opposite sides ── */
    const spawnSpinningWheels = () => {
      const w = W();
      const h = H();
      const spokeRadius = Math.max(100, Math.min(200, W() / 4));
      const spokes = 8;
      const baseRotSpeed = P7_ROT_SPEED;
      const driftSpeed = W() * P7_DRIFT_SPEED_FRAC;
      /* Fixed inner radius — first letter of every name starts here */
      const innerR = Math.max(28, spokeRadius * 0.2);

      /* Explicit for-loops guarantee exactly `spokes` names per wheel — wraps ALL_NAMES. */
      const wheel1Names: string[] = [];
      for (let i = 0; i < spokes; i++) {
        wheel1Names.push(ALL_NAMES[(nameIdx + i) % ALL_NAMES.length] ?? ALL_NAMES[0] ?? 'Danny');
      }
      nameIdx += spokes;

      const wheel2Names: string[] = [];
      for (let i = 0; i < spokes; i++) {
        wheel2Names.push(ALL_NAMES[(nameIdx + i) % ALL_NAMES.length] ?? ALL_NAMES[0] ?? 'Danny');
      }
      nameIdx += spokes;

      /* Wheel 1: enters from left, near bottom */
      const cx1 = -spokeRadius * 2;
      const cy1 = h * 0.75;
      const baseAngle1 = phaseRound * 0.7;

      for (let i = 0; i < spokes; i++) {
        const name = wheel1Names[i]!;
        const { tw, th } = measureName(name);
        const spokeAngle = baseAngle1 + (i * 2 * Math.PI / spokes);
        const nameOrbitR = innerR + tw / 2;
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: cx1 + Math.cos(spokeAngle) * nameOrbitR - tw / 2,
          y: cy1 + Math.sin(spokeAngle) * nameOrbitR - th / 2,
          vx: driftSpeed,
          w: tw, h: th,
          action: 5,
          orbitCx: cx1, orbitCy: cy1,
          orbitR: nameOrbitR,
          orbitAngle: spokeAngle,
          orbitSpeed: baseRotSpeed,
        }));
      }

      /* Wheel 2: enters from right, near top */
      const cx2 = w + spokeRadius * 2;
      const cy2 = h * 0.25;
      const baseAngle2 = phaseRound * 0.7 + Math.PI / spokes;

      for (let i = 0; i < spokes; i++) {
        const name = wheel2Names[i]!;
        const { tw, th } = measureName(name);
        const spokeAngle = baseAngle2 + (i * 2 * Math.PI / spokes);
        const nameOrbitR = innerR + tw / 2;
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: cx2 + Math.cos(spokeAngle) * nameOrbitR - tw / 2,
          y: cy2 + Math.sin(spokeAngle) * nameOrbitR - th / 2,
          vx: -driftSpeed,
          w: tw, h: th,
          action: 5,
          orbitCx: cx2, orbitCy: cy2,
          orbitR: nameOrbitR,
          orbitAngle: spokeAngle,
          orbitSpeed: -baseRotSpeed,
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

    /* Prevent iOS scroll / pinch / double-tap-zoom from fighting the drag. */
    canvas.style.touchAction = 'none';

    let touchX = 0;
    let touchY = 0;
    /* Slight boost so players can traverse the canvas without dragging the full
       screen width on small phones. 1.0 on desktop, 1.35 on coarse pointers. */
    const TOUCH_SENSITIVITY = isMobileDevice ? 1.35 : 1.0;
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
      heart.x += (touch.clientX - touchX) * TOUCH_SENSITIVITY;
      heart.y += (touch.clientY - touchY) * TOUCH_SENSITIVITY;
      /* Clamp immediately so finger movement past a wall doesn't build up an
         un-tracked delta (prevents "dead zone" where heart lags the finger). */
      const hsTouch = getHeartSize();
      heart.x = Math.max(hsTouch, Math.min(W() - hsTouch, heart.x));
      heart.y = Math.max(hsTouch, Math.min(H() - hsTouch, heart.y));
      touchX = touch.clientX;
      touchY = touch.clientY;
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    /* Skip cutscene on click / tap */
    const onCanvasClick = () => { if (gameOver) skipCutscene = true; };
    const onCanvasTouchEnd = () => { if (gameOver) skipCutscene = true; };
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('touchend', onCanvasTouchEnd, { passive: true });

    const getSpawnInterval = (phase: number): number => {
      switch (phase) {
        case 0: return 1.2;   // Aimed spreads
        case 2: return 3.5;   // Crossing streams (full screen per call, both waves)
        case 7: return 4.5;   // Spinning wheels (fewer, fuller spokes)
        case 6: return 0.8;   // Fast aimed spreads
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

      /* Check game over — hit names count as "done" for allGone purposes */
      if (nameIdx >= totalNames && !gameOver) {
        const allGone = projectiles.length === 0 || projectiles.every(p =>
          p.hit || p.x < -300 || p.x > w + 300 || p.y < -300 || p.y > h + 300
        );
        if (allGone) {
          gameOver = true;
          endTimer = 0;
          endPhase = 0;
        }
      }

      if (gameOver) {
        /* Any click/tap during cutscene skips to end screen */
        if (skipCutscene) {
          normalFinish = true;
          onFinishRef.current({ hitCount, hitNames, audio });
          return;
        }

        endTimer += dt;

        /* Phase transitions */
        if (endPhase === 0 && endTimer >= 1.5) {
          endPhase = 1;
          endTimer = 0;
        } else if (endPhase === 1 && endTimer >= 4.5) {
          endPhase = 2;
          endTimer = 0;
          touchedScrollOffset = 0;
        } else if (endPhase === 2 && endTimer >= 2.5) {
          endPhase = 3;
          endTimer = 0;
          thankYouY = h + 80;
        }

        ctx.clearRect(0, 0, w, h);
        const hs = getHeartSize();

        /* ── Phase 0: fade game state to black ── */
        if (endPhase === 0) {
          const bgAlpha = Math.min(1, endTimer / 1.5);
          /* Render frozen projectiles under the overlay */
          const dfs0 = getFontSize();
          ctx.font = `${dfs0}px ${DETERMINATION_SANS}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          for (const p of projectiles) {
            const pcx = p.x + p.w / 2;
            const pcy = p.y + p.h / 2;
            if (p.logoImg && p.logoImg.complete && p.logoImg.naturalWidth > 0) {
              ctx.save();
              ctx.translate(pcx, pcy);
              ctx.drawImage(p.logoImg, -p.w / 2, -p.h / 2, p.w, p.h);
              ctx.restore();
            } else if (p.angle) {
              ctx.save();
              ctx.translate(pcx, pcy);
              ctx.rotate(p.angle);
              ctx.fillStyle = p.hit ? '#FFFF00' : '#ffffff';
              ctx.fillText(p.text, -p.w / 2, -p.h / 2);
              ctx.restore();
            } else {
              ctx.fillStyle = p.hit ? '#FFFF00' : '#ffffff';
              ctx.fillText(p.text, p.x, p.y);
            }
          }
          ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
          ctx.fillRect(0, 0, w, h);
          const heartAlpha0 = Math.max(0, 1 - bgAlpha);
          if (heartAlpha0 > 0) {
            ctx.save();
            ctx.globalAlpha = heartAlpha0;
            drawHeart(ctx, heart.x, heart.y, hs, false, heartImg);
            ctx.restore();
          }

        /* ── Phases 1 & 2: TOUCHED CREDITS display (static then scrolling down) ── */
        } else if (endPhase === 1 || endPhase === 2) {
          /* Heart movement */
          if (keys.has('arrowleft') || keys.has('a')) heart.x -= HEART_SPEED * dt;
          if (keys.has('arrowright') || keys.has('d')) heart.x += HEART_SPEED * dt;
          if (keys.has('arrowup') || keys.has('w')) heart.y -= HEART_SPEED * dt;
          if (keys.has('arrowdown') || keys.has('s')) heart.y += HEART_SPEED * dt;
          heart.x = Math.max(hs, Math.min(w - hs, heart.x));
          heart.y = Math.max(hs, Math.min(h - hs, heart.y));

          if (endPhase === 2) touchedScrollOffset += (h / 2.0) * dt;
          const yOff = endPhase === 2 ? -touchedScrollOffset : 0;

          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);

          /* Title */
          const titleFS = Math.max(24, Math.min(40, w / 16));
          ctx.font = `${titleFS}px ${DETERMINATION_SANS}`;
          ctx.fillStyle = '#FFFF00';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('* TOUCHED CREDITS *', w / 2, 30 + yOff);

          /* Names grid */
          const uniqueNames = [...new Set(hitNames)];
          const logoNameSet = new Set(ATTACK_LOGOS.map(l => l.name));
          const regularNames = uniqueNames.filter(n => !logoNameSet.has(n));
          const logoHits = uniqueNames.filter(n => logoNameSet.has(n));

          const nameFS = Math.max(11, Math.min(18, w / 30));
          const nameLineH = nameFS * 1.5;
          const startY = 30 + titleFS + 20;
          const availH = h - startY - 80;
          const maxRows = Math.max(1, Math.floor(availH / nameLineH));
          const numCols = regularNames.length > 0 ? Math.max(1, Math.ceil(regularNames.length / maxRows)) : 1;
          const colW = w / numCols;

          ctx.font = `${nameFS}px ${DETERMINATION_SANS}`;
          ctx.fillStyle = '#FFFF00';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          for (let i = 0; i < regularNames.length; i++) {
            const col = Math.floor(i / maxRows);
            const row = i % maxRows;
            const nx = colW * col + colW / 2;
            const ny = startY + row * nameLineH + yOff;
            if (ny > -20 && ny < h + 20) ctx.fillText(regularNames[i] ?? '', nx, ny);
          }

          /* Logos at normal appearance */
          if (logoHits.length > 0) {
            const logoAreaY = startY + Math.ceil(regularNames.length / numCols) * nameLineH + 16 + yOff;
            let lx = 40;
            for (const logoName of logoHits) {
              const logoIdx = ATTACK_LOGOS.findIndex(l => l.name === logoName);
              const limg = logoImages[logoIdx];
              if (limg && limg.complete && limg.naturalWidth > 0) {
                const lh = Math.max(30, Math.min(50, h / 18));
                const lw = lh * (limg.naturalWidth / limg.naturalHeight);
                if (logoAreaY > -lh && logoAreaY < h + lh) ctx.drawImage(limg, lx, logoAreaY, lw, lh);
                lx += lw + 16;
              }
            }
          }

          /* Skip hint */
          ctx.font = `13px ${DETERMINATION_MONO}`;
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('Click / tap to skip', w / 2, h - 10 - readSafeInset('bottom'));

          drawHeart(ctx, heart.x, heart.y, hs, false, heartImg);

        /* ── Phase 3: thank-you message scrolls up ── */
        } else if (endPhase === 3) {
          if (keys.has('arrowleft') || keys.has('a')) heart.x -= HEART_SPEED * dt;
          if (keys.has('arrowright') || keys.has('d')) heart.x += HEART_SPEED * dt;
          if (keys.has('arrowup') || keys.has('w')) heart.y -= HEART_SPEED * dt;
          if (keys.has('arrowdown') || keys.has('s')) heart.y += HEART_SPEED * dt;
          heart.x = Math.max(hs, Math.min(w - hs, heart.x));
          heart.y = Math.max(hs, Math.min(h - hs, heart.y));

          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);

          thankYouY -= 100 * dt;

          const tyFS = Math.max(16, Math.min(28, w / 24));
          const tySpacing = tyFS * 1.6;
          ctx.font = `${tyFS}px ${DETERMINATION_SANS}`;
          /* Word-wrap each logical line so narrow phones don't clip the copy. */
          const maxWidth = w - 32;
          const rawLines = [
            'Thanks to friends and family supporting me!',
            'Without you, all of this would be impossible.',
            '',
            'Thank you, everyone.',
            '',
            "\u2018Til next time!",
          ];
          const tyLines: string[] = [];
          for (const raw of rawLines) {
            if (!raw) { tyLines.push(''); continue; }
            const words = raw.split(' ');
            let current = '';
            for (const word of words) {
              const test = current ? `${current} ${word}` : word;
              if (ctx.measureText(test).width <= maxWidth) current = test;
              else { if (current) tyLines.push(current); current = word; }
            }
            if (current) tyLines.push(current);
          }

          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          for (let i = 0; i < tyLines.length; i++) {
            const line = tyLines[i];
            if (!line) continue;
            const ly = thankYouY + i * tySpacing;
            if (ly > -40 && ly < h + 40) {
              ctx.fillStyle = '#FFFF00';
              ctx.fillText(line, w / 2, ly);
            }
          }

          ctx.font = `13px ${DETERMINATION_MONO}`;
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('Click / tap to skip', w / 2, h - 10 - readSafeInset('bottom'));

          drawHeart(ctx, heart.x, heart.y, hs, false, heartImg);

          /* All lines scrolled off top → advance to end screen */
          if (thankYouY + (tyLines.length - 1) * tySpacing < -60) {
            normalFinish = true;
            onFinishRef.current({ hitCount, hitNames, audio });
            return;
          }
        }

        frameId = requestAnimationFrame(gameLoop);
        return;
      }

      /* ── Movement ── */
      if (keys.has('arrowleft') || keys.has('a')) heart.x -= HEART_SPEED * dt;
      if (keys.has('arrowright') || keys.has('d')) heart.x += HEART_SPEED * dt;
      if (keys.has('arrowup') || keys.has('w')) heart.y -= HEART_SPEED * dt;
      if (keys.has('arrowdown') || keys.has('s')) heart.y += HEART_SPEED * dt;
      const hs = getHeartSize();
      heart.x = Math.max(hs, Math.min(w - hs, heart.x));
      heart.y = Math.max(hs, Math.min(h - hs, heart.y));

      /* ── Phase-based spawning ── */
      if (corridorActive && nameIdx >= totalNames) {
        corridorActive = false; // clean up if names exhausted during corridor
      }
      if (nameIdx < totalNames) {
        if (corridorActive) {
          /* Corridor runs autonomously until time expires */
          updateCorridor(dt);
          if (!corridorActive && nameIdx < phase3End) {
            nameIdx = phase3End; // advance past corridor allocation
          }
          if (!corridorActive) {
            currentPhase = getPhase(nameIdx);
            phaseTimer = 0;
            phaseRound = 0;
          }
        } else {
          const newPhase = getPhase(nameIdx);
          if (newPhase !== currentPhase) {
            /* Tear down phase-specific state when leaving a phase. */
            if (currentPhase === 4 && newPhase !== 4) wallColumns = null;
            currentPhase = newPhase;
            phaseTimer = 0;
            phaseRound = 0;
            phaseTransitionDelay = PHASE_TRANSITION_DURATION;
          }

          /* Wait for transition delay before spawning new phase.
             Phase 6 also waits for all spinning wheel spokes to exit. */
          const spokesStillAlive = currentPhase === 6 && projectiles.some(p => p.action === 5);
          if (phaseTransitionDelay > 0) {
            phaseTransitionDelay -= dt;
          } else if (spokesStillAlive) {
            /* Hold phase 6 spawning until spokes are gone */
          } else if (currentPhase === 3 && !corridorActive) {
            /* Start corridor */
            corridorActive = true;
            corridorSpawnTimer = 0;
            corridorSpawnCount = 0;
          } else if (currentPhase === 4) {
            /* Falling walls: init on entry, continuously top up each frame. */
            if (!wallColumns) initWallColumns();
            updateWalls(dt);
          } else if (currentPhase !== 3) {
            phaseTimer += dt;
            const interval = getSpawnInterval(currentPhase);
            if (phaseTimer >= interval) {
              phaseTimer = 0;
              switch (currentPhase) {
                case 0:
                case 6: {
                  const fromRight = phaseRound % 2 === 0;
                  const yCenter = phaseRound % 4 < 2 ? h * 0.25 : h * 0.65;
                  spawnAimedSpread(fromRight, yCenter);
                  phaseRound++;
                  break;
                }
                case 2:
                  spawnCrossingStreams();
                  phaseRound++;
                  break;
                case 7:
                  spawnSpinningWheels();
                  phaseRound++;
                  break;
              }
            }
          }
        }
      }

      /* ── Spawn logos (each appears exactly once — yellow silhouette) ── */
      for (let li = 0; li < ATTACK_LOGOS.length; li++) {
        if (!logoSpawned[li] && nameIdx >= (logoSpawnPoints[li] ?? Infinity)) {
          const logoInfo = ATTACK_LOGOS[li];
          const limg = logoImages[li];
          if (logoInfo && limg && limg.complete && limg.naturalWidth > 0) {
            logoSpawned[li] = true;
            const fromR = li % 2 === 0;
            const ar = limg.naturalWidth / limg.naturalHeight;
            const lh = 70;
            const lw = lh * ar;
            const yp = Math.random() * (h - lh * 2) + lh;
            projectiles.push(mkProj({
              id: nextProjId++, text: logoInfo.name,
              x: fromR ? w + lw : -lw, y: yp,
              vx: fromR ? -120 : 120,
              w: lw, h: lh, logoImg: limg,
            }));
          }
        }
      }

      /* ── Update projectiles ── */
      for (const p of projectiles) {
        p.frame++;
        if (p.hit) p.hitAge += dt; /* accumulate age but keep updating position — Undertale style */

        if (p.action === 1) {
          if (p.frame < 60) {
            /* Phase 1: Slide in — 60 frames gives enough travel at the scaled vx */
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          } else if (p.frame === 60) {
            p.vx = 0;
            p.vy = 0;
          } else if (p.frame > 60 && p.frame < 105) {
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
          } else if (p.frame === 105) {
            /* Phase 3: Fire in aimed direction — action:2 for tight off-screen culling */
            const speed = 280;
            p.vx = Math.cos(p.angle) * speed;
            p.vy = Math.sin(p.angle) * speed;
            p.action = 2;
          }
        } else if (p.action === 5) {
          /* Spinning wheel spoke — orbit around moving center */
          p.orbitCx += p.vx * dt;
          p.orbitAngle += p.orbitSpeed * dt;
          p.x = p.orbitCx + Math.cos(p.orbitAngle) * p.orbitR - p.w / 2;
          p.y = p.orbitCy + Math.sin(p.orbitAngle) * p.orbitR - p.h / 2;
          p.angle = p.orbitAngle;
        } else if (p.action === 6) {
          /* Corridor wall — just fall straight down (x is fixed at spawn) */
          p.y += p.vy * dt;
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        if (p.gravity && !p.logoImg) p.vy += p.gravity * dt;

        if (p.action === 3) {
          if (p.x < -80) p.x = w + 60;
          if (p.x > w + 80) p.x = -60;
        }

      }

      projectiles = projectiles.filter((p) => {
        /* Fired aimed bullets (action:2): tight cull — remove as soon as off-screen */
        if (p.action === 2) return p.x > -p.w - 60 && p.x < w + 60 && p.y > -p.h - 60 && p.y < h + 60;
        if (p.action === 5) {
          return p.orbitCx > -p.orbitR - 300 && p.orbitCx < w + p.orbitR + 300;
        }
        if (p.action === 6) {
          /* Corridor + Phase-4 walls fall straight down. Rotated walls have
             visual extent = p.w (original text width), so add the max extent so
             rotated glyphs fully clear the screen before cull. */
          return p.y < h + 100 + Math.max(p.w, p.h);
        }
        return p.x > -400 && p.x < w + 400 && p.y > -300 && p.y < h + 300;
      });
      /* Hard cap for mobile perf — drop oldest projectiles first */
      if (projectiles.length > MAX_PROJECTILES) {
        projectiles = projectiles.slice(projectiles.length - MAX_PROJECTILES);
      }

      /* ── Hit detection — batched per frame for mobile perf ── */
      if (hitFlash > 0) hitFlash -= dt;
      /* Heart sprite is size*2 × size*2 but the heart shape fills only ~70% of that
         square (top notches + bottom tip are transparent). A circle radius = size*0.70
         matches the visible heart pixels — Undertale-accurate grazing. */
      const HR = getHeartSize() * 0.70;
      let hitsThisFrame = 0;

      /* Circle vs OBB (oriented bounding box) — pixel-perfect for rotated text.
         Projects the heart center into the rotated rectangle's local space,
         then checks circle-vs-AABB in that local frame. */
      for (const p of projectiles) {
        if (p.hit) continue;
        const pcx = p.x + p.w / 2;
        const pcy = p.y + p.h / 2;

        if (p.angle !== 0) {
          /* OBB test for any rotated projectile — pixel-perfect */
          const cosA = Math.cos(-p.angle);
          const sinA = Math.sin(-p.angle);
          /* Transform heart into the rectangle's local coordinate system */
          const dx = heart.x - pcx;
          const dy = heart.y - pcy;
          const localX = dx * cosA - dy * sinA;
          const localY = dx * sinA + dy * cosA;
          /* Closest point on the unrotated rectangle to the local heart position */
          const halfW = p.w / 2;
          const halfH = p.h / 2;
          const clampX = Math.max(-halfW, Math.min(halfW, localX));
          const clampY = Math.max(-halfH, Math.min(halfH, localY));
          const distSq = (localX - clampX) * (localX - clampX) + (localY - clampY) * (localY - clampY);
          if (distSq < HR * HR) {
            p.hit = true;
            hitsThisFrame++;
            hitCount++;
            hitNames.push(p.text);
          }
        } else {
          /* AABB test for non-rotated projectiles (fast path) */
          if (
            heart.x + HR > pcx - p.w / 2 &&
            heart.x - HR < pcx + p.w / 2 &&
            heart.y + HR > pcy - p.h / 2 &&
            heart.y - HR < pcy + p.h / 2
          ) {
            p.hit = true;
            hitsThisFrame++;
            hitCount++;
            hitNames.push(p.text);
          }
        }
      }
      if (hitsThisFrame > 0) {
        hitFlash = 0.12;
        playHitSound();
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
      /* Render margin — skip projectiles clearly off screen */
      const renderMargin = 100;
      for (const p of projectiles) {
        /* Fast off-screen cull (saves draw calls on mobile) */
        const pcx = p.x + p.w / 2;
        const pcy = p.y + p.h / 2;
        const extent = Math.max(p.w, p.h);
        if (pcx + extent < -renderMargin || pcx - extent > w + renderMargin ||
            pcy + extent < -renderMargin || pcy - extent > h + renderMargin) continue;

        if (p.logoImg && p.logoImg.complete && p.logoImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(pcx, pcy);
          if (p.angle) ctx.rotate(p.angle);
          if (p.hit) {
            ctx.globalAlpha = 0.8;
            const logoIdx = ATTACK_LOGOS.findIndex(l => l.name === p.text);
            const yellowCanvas = logoIdx >= 0 ? yellowLogoCanvases[logoIdx] : null;
            if (yellowCanvas) {
              ctx.drawImage(yellowCanvas, -p.w / 2, -p.h / 2, p.w, p.h);
            } else {
              ctx.drawImage(p.logoImg, -p.w / 2, -p.h / 2, p.w, p.h);
            }
            ctx.globalAlpha = 1;
          } else {
            ctx.drawImage(p.logoImg, -p.w / 2, -p.h / 2, p.w, p.h);
          }
          ctx.restore();
        } else if (p.angle) {
          /* Rotated text — needs save/restore */
          ctx.save();
          ctx.translate(pcx, pcy);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.hit ? '#FFFF00' : '#ffffff';
          ctx.fillText(p.text, -p.w / 2, -p.h / 2);
          ctx.restore();
        } else {
          /* Non-rotated text — no save/restore needed */
          ctx.fillStyle = p.hit ? '#FFFF00' : '#ffffff';
          ctx.fillText(p.text, p.x, p.y);
        }
      }

      /* HP image — drawn BEFORE heart so heart renders on top.
         Offset above safe-area-inset-bottom so the home indicator / iOS bottom
         bar doesn't clip it. */
      const saiBottom = readSafeInset('bottom');
      if (hpBarImg && hpBarImg.complete && hpBarImg.naturalWidth > 0) {
        const hpImgH = 28;
        const hpImgW = hpBarImg.naturalWidth * (hpImgH / hpBarImg.naturalHeight);
        ctx.drawImage(hpBarImg, (w - hpImgW) / 2, h - 46 - saiBottom, hpImgW, hpImgH);
      }

      drawHeart(ctx, heart.x, heart.y, getHeartSize(), hitFlash > 0, heartImg);

      if (elapsed < 8) {
        const alpha = elapsed < 6 ? 1 : Math.max(0, 1 - (elapsed - 6) / 2);
        ctx.globalAlpha = alpha;
        ctx.font = `32px ${DETERMINATION_SANS}`;
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('SPECIAL THANKS', w / 2, 24);
        ctx.globalAlpha = 1;
      }

      /* ── Bottom HUD — instruction text fades out after 10 s ── */
      const instrAlpha = Math.max(0, Math.min(1, (10 - elapsed) / 2));
      if (instrAlpha > 0) {
        ctx.globalAlpha = instrAlpha;
        ctx.font = `13px ${DETERMINATION_MONO}`;
        ctx.fillStyle = '#444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(
          isMobileDevice ? 'Drag to move \u00B7 Tap \u2715 to exit' : 'Arrow keys / WASD to move \u00B7 ESC to exit',
          w / 2, h - 12 - saiBottom,
        );
        ctx.globalAlpha = 1;
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(frameId);
      /* Only stop music on early exit — keep it playing for the end screen */
      if (!normalFinish) {
        audio.pause();
        audio.src = '';
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('click', onCanvasClick);
      canvas.removeEventListener('touchend', onCanvasTouchEnd);
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
  onSubmit: (name: string) => Promise<boolean>;
  onExit: () => void;
}) {
  const [name, setName] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    const trimmed = name.trim().split(/\s+/)[0]?.slice(0, 10) ?? '';
    if (!trimmed) return;
    setSubmitState('submitting');
    const ok = await onSubmit(trimmed);
    setSubmitState(ok ? 'success' : 'error');
  };

  return (
    <div className={`${styles.attackOverlay} ${styles.endScreenFadeIn}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', fontFamily: DETERMINATION_SANS, color: '#fff', maxWidth: 480, padding: 24 }}>
        <div style={{ fontSize: 36, color: '#FFFF00', letterSpacing: 3, marginBottom: 24 }}>
          GAME COMPLETE!
        </div>
        <div style={{ fontSize: 22, marginBottom: 8 }}>
          HITS
        </div>
        <div style={{ fontSize: 64, color: result.hitCount === 0 ? '#00ff00' : '#FFFF00', fontWeight: 700, marginBottom: 16 }}>
          {result.hitCount}
        </div>
        <div style={{ fontSize: 18, color: '#aaa', marginBottom: 40 }}>
          {result.hitCount === 0 ? 'Incredible! You dodged every single name!' : ''}
        </div>

        {submitState === 'idle' || submitState === 'submitting' ? (
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
                disabled={submitState === 'submitting'}
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
                disabled={submitState === 'submitting'}
                style={{
                  background: '#FFFF00', color: '#000', border: 'none',
                  fontFamily: DETERMINATION_SANS, fontSize: 18, fontWeight: 700,
                  padding: '10px 24px', borderRadius: 4, cursor: 'pointer',
                  opacity: submitState === 'submitting' ? 0.5 : 1,
                }}
              >
                {submitState === 'submitting' ? '...' : 'Submit'}
              </button>
            </div>
          </>
        ) : submitState === 'success' ? (
          <div style={{ fontSize: 20, color: '#00ff00', marginBottom: 24 }}>
            Score submitted!
          </div>
        ) : (
          <div style={{ fontSize: 18, color: '#ff4444', marginBottom: 24 }}>
            Could not save score (offline or not configured).
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

  /* Preload fonts as early as possible to avoid FOUT hitch */
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => { preloadFonts().then(() => setFontsReady(true)); }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const attackAudioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const animFrameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const contentHeightRef = useRef(0);
  const blackPauseRef = useRef(false);
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
    /* Re-measure whenever track height changes (images loading in) */
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && trackRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(trackRef.current);
    }

    scrollPosRef.current = 0;
    lastFrameRef.current = 0;
    blackPauseRef.current = false;

    /* Fade-in the credits track to mask any loading hitch */
    if (trackRef.current) {
      trackRef.current.style.opacity = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (trackRef.current) trackRef.current.style.opacity = '1';
        });
      });
    }

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

          /* Fade out the track */
          if (trackRef.current) trackRef.current.style.opacity = '0';

          pauseTimerRef.current = setTimeout(() => {
            /* Reset position while invisible */
            scrollPosRef.current = window.innerHeight;
            if (trackRef.current) {
              trackRef.current.style.transform = `translateY(${scrollPosRef.current}px)`;
            }
            /* Wait a frame for position to apply, then fade back in */
            requestAnimationFrame(() => {
              if (trackRef.current) trackRef.current.style.opacity = '1';
              blackPauseRef.current = false;
            });
          }, 2000);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', measure);
      ro?.disconnect();
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
    if (result.audio) attackAudioRef.current = result.audio;
    setAttackResult(result);
    setMode('endscreen');
  }, []);

  const handleScoreSubmit = useCallback(async (playerName: string): Promise<boolean> => {
    if (attackResult) {
      return await submitScore(playerName, attackResult.hitCount);
    }
    return false;
  }, [attackResult, submitScore]);

  const handleExitAttack = useCallback(() => {
    /* Stop attack music before switching back */
    if (attackAudioRef.current) {
      attackAudioRef.current.pause();
      attackAudioRef.current.src = '';
      attackAudioRef.current = null;
    }
    startAudio(selectedTrack);
    setMode('credits');
  }, [selectedTrack, startAudio]);

  const handleReset = useCallback(() => {
    scrollPosRef.current = 0;
    blackPauseRef.current = false;
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
            <button
              className={styles.playButton}
              onClick={() => handleSongSelect(selectedTrack)}
              disabled={!fontsReady}
              style={{ opacity: fontsReady ? 1 : 0.4 }}
            >
              {fontsReady ? '\u25B6\uFE0E Play' : 'Loading...'}
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
          {/* ── Opening (centered) ── */}
          <div className={styles.creditsCenter}>
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
            <div className={styles.sectionPhoto}>
              <img src="/credits-photos/professional_photo_of_me.png" alt="Daniel Taylor" />
            </div>
            <div className={styles.divider} />
          </div>

          {/* ── Sections (3-column grid: side-photos | text | side-photos) ── */}
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
              <div key={section.title} className={styles.sectionGrid}>
                {/* Left side photos */}
                <div className={styles.sideColLeft}>
                  {(section.leftPhotos ?? []).map((p) => (
                    <img key={p} src={`/credits-photos/${p}`} alt="" className={styles.sidePhoto} />
                  ))}
                </div>

                {/* Center text */}
                <div className={styles.creditsCenter}>
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

                {/* Right side photos */}
                <div className={styles.sideColRight}>
                  {(section.rightPhotos ?? []).map((p) => (
                    <img key={p} src={`/credits-photos/${p}`} alt="" className={styles.sidePhoto} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* ── Closing (centered) ── */}
          <div className={styles.creditsCenter}>
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

            <div className={styles.sectionPhoto} style={{ marginBottom: 24 }}>
              <img src="/credits-photos/ibm_1.jpg" alt="IBM internship" />
            </div>

            <div className={styles.year}>2026</div>
            <div className={styles.endSpace} />
          </div>
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
