import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Credits.module.css';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { ref as dbRef, increment, update } from 'firebase/database';
import { db } from '../lib/firebase';

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

interface CreditPhoto {
  src: string;
  caption?: string;
}

interface CreditSection {
  title: string;
  entries: CreditEntry[];
  photo?: string | string[];   /* centered logo(s) shown above section title */
  leftPhotos?: CreditPhoto[];
  rightPhotos?: CreditPhoto[];
}

const CREDITS_DATA: CreditSection[] = [
  /* ── Top sections ── */
  {
    title: 'My Family',
    leftPhotos: [
      { src: 'my_family_1.jpg', caption: 'Family Portrait' },
      { src: 'my_family_grandmapat_grandpahoward.jpg', caption: 'Me with my Grandma Pat and Grandpa Howard' },
      { src: 'my_family_2.jpg', caption: 'Family Portrait' },
    ],
    rightPhotos: [
      { src: 'myfamily_me_and_patricia_taylor.png', caption: 'Me and my sister Trish' },
    ],
    entries: [
      { name: 'Katherine Taylor', role: 'Mother' },
      { name: 'John Taylor', role: 'Father' },
      { name: 'Patricia Taylor', role: 'Sister' },
      { name: 'Johnny Taylor', role: 'Brother' },
      { name: 'Forrest Taylor', role: 'Brother' },
      { name: 'Howard Gordon', role: 'Grandpa'},
      { name: 'Patricia Livingston', role: 'Grandma'},
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
      { name: 'Bobby Livingston', role: 'Cousin' },
      { name: 'Jim Livingston', role: 'Uncle' },
      { name: 'Tom Caldwel', role: 'Uncle' },
      { name: 'Grandpa Livingston', role: 'Papa' },
    ],
  },
  {
    title: 'Professors/Faculty & Staff',
    leftPhotos: [
      { src: 'FPUfaculty_dr_hoan_ngo.jpg', caption: 'Dr. Ngo playing RGB Rush, my Embedded OS final project' },
      { src: 'faculty_dr_rawa.jpg', caption: 'Us bowling with Dr. Adla' },
    ],
    rightPhotos: [
      { src: 'faculty_dr_adla.jpg', caption: 'Me with Dr. Adlas ID so I could get into the lab' },
    ],
    entries: [
      { name: 'Devin Stephenson', role: "Florida Polytechnic President, great guy to speak with. Refers to me as 'The Linkedin Guy'." },
      { name: 'Jon Pawlecki', role: "Assistant VP of Student Affairs, awesome guy. Believed in me when I had interviews and offers great advice" },
      { name: 'Dr. Austin Anderson', role: "Research Supervisor, Professor I TA'd Differential Equations For"},
      { name: 'Dr. Joshua Drouin', role: "Taught me Computational Linear Algebra" },
      { name: 'Dr. Elisabeth Kames', role: "Taught me SOLIDWORKS, super great to speak with. Had a nice time with her as my professor" },
      { name: 'Dr. Emadelden Fouad', role: "Taught me Physics 1 and 2, made what people considered the hardest classes here super easy" },
      { name: 'Dr. Mohammad Farmani', role: "Taught me Verilog & Cybersecurity" },
      { name: 'Dr. Hoan Ngo', role: "Taught me Embedded Operating Systems" },
      { name: 'Dr. Jared Bunn', role: "Taught me Topology & Discrete Math. Loves Overwatch and Fortnite" },
      { name: 'Dr. Manoj Lamichhane', role: "Taught me Differential Equations and Calculus 3" },
      { name: 'Dr. Muhammad Ullah', role: "Taught me Circuits 1, Circuits 2, breadboards, oscilloscopes, Digital Electronics, and VLSI Design, 'We know these things!'" },
      { name: 'Dr. Tracy Olin', role: "Chemistry Lab"},
      { name: 'Dr. Rawa Adla', role: "Taught me about Autonomous Vehicles, Electric and Hybrid Vehicles, Microprocessors, and Computer Architecture. Bowled with her, went to SunTrax with her, went to IMSA with her, went to Chick-fil-A with her"},
      { name: 'Dr. Ashiq Sakib', role: "Taught me Digital Logic Design, 'Gone are the days of Plugging and Chugging!'"},
      { name: 'Dr. Venkata Sista', role: "Taught me Chemistry"},
      { name: 'Dr. Sundari Ramabhotla', role: "Taught me Systems and Signals, and Smart Grid and Physical Cyber Security. Very kind soul, such a nice professor" },
      { name: 'Mr. Silvano Falcao', role: "Taught me Calculus 1 and Calculus 2. Thanks for making college not scary when I first came in" },
      { name: 'Dr. Mary Vollaro', role: "F.L.A.M.E" },
      { name: 'Mr. Igor Mirsalikhov', role: "Taught me everything I know about coding, C and C++" },
      { name: 'Dr. Susan LeFrancois', role: "Legal, Ethical, Management Issues in Technology, I won her Kahoot" },
      { name: 'Ms. Ramamourty Manimegalai', role: "Physics 1 and 2 Lab"},
      { name: 'Dr. Ranses Alfonso Roriguez', role: "Taught me Probability and Statistics, our SHPE advisor"},
      { name: 'Dr. Bradford Barker', role: "Taught me Quantum Information and Computing in an easy to understand way"},
      { name: 'Dr. Asai Asaithambi', role: "Taught me Advanced Engineering Math, though that first quiz got all of us"},
      { name: "Ms. Martha Seney", role: "Career Services Director, Rotaract & SHPE member, taught me a lot about professional development"},
      { name: "Ms. Noelia Sanchez", role: "Nicest person alive & Rotaract's advisor!"},
      { name: 'Robert Martell', role: 'Cool cybersecurity engineer, great guy to talk to & spoke at Rotaract!' },
      { name: 'Hat', role: 'Police Officer & Supra enjoyer' },
      { name: 'Jean', role: 'Police Officer & vibe coder' },
      { name: 'Arron Murray', role: 'Police Chief' },
    ],
  },
  {
    title: 'SHPE Eboard 2025\u20132026',
    photo: 'SHPE.png',
    leftPhotos: [
      { src: 'SHPE_eboard_0.png', caption: 'Nova Awards, SHPE Eboard 24-25/25-26' },
    ],
    rightPhotos: [
      { src: 'SHPE_eboard_1.jpg', caption: 'Gabo, Me, & Kro' },
    ],
    entries: [
      { name: 'Alex Meert', role: 'VP of Marketing & one of the best guys I know. Good at game dev, super funny, works at the SDC, GOAT at CS' },
      { name: 'Ethan Puig', role: 'Chief of Staff & MY GOAT. RGB Rush collaborator, tutored him for Smart Grid & embedded OS, genuinely the most reliable guy I know. Amazing friend'},
      { name: 'Gabriel Basalo', role: "VP of External & MY GOAT. One of my best friends I've made at Poly. Amazing guy, one of the funniest people I know, my W Gekko main on the VALORANT team"},
      { name: 'Ines Alonso', role: "VP of Internal & the sweetest person I have had the pleasure of getting to know. One of my great friends, IBM Dev Day & quantum GOAT, puts up with our 67 handshake" },
      { name: 'Naibys "Kro" Alzugaray', role: "SHPE President & GOAT at Canva and graphic design. Believed in me since the start, loves JJBA like me, but don't let make a drink for you" },
      { name: 'Nicolas Izquierdo', role: "SHPE Treasurer & the most involved person I know. SGA, Senate, SHPE, RA for the dorms, research. He always puts in 110% in everything he does, and he's only a sophomore. Next year's SHPE president, so I already know they'll do amazing with him."},
      { name: 'Shriraj Mandulapalli', role: "VP of Technology, GOAT at CS/Overwatch/VALORANT/Marathon. Hands down the smartest person I know. Good at technical, good at behavioral, definitely played a huge role in making me who I am today. My IBM Student Dev Day GOAT, Oracle is lucky to have him. Will be a CEO one day, I just know it"},
    ],
  },
  {
    title: 'Rotaract',
    photo: 'rotaract.png',
    leftPhotos: [
      { src: 'aidan_morris.jpg', caption: 'Aidan Morris & I playing at Dave n Busters (Adriana on the left)' },
      { src: 'rotaract_aidan_domenic.jpg', caption: 'Domenic, Aidan and I at the Lasagna Dinner' },
      { src: 'rotaract_near_izzy.jpg', caption: 'Domenic, Aidan, Izzy, and I at the Habitat for Humanitty event. Past and future VP and President!' },
      { src: 'rotaract_3.jpg', caption: 'The group at the Habitat for Humanity event' },
      { src: 'rotaract_5.jpg', caption: 'The Rotaract club with the District Governors & speaker Nick Hall' },
      { src: 'rotaract_7.jpg', caption: 'The club after one of our Adopt a Road events' },
    ],
    rightPhotos: [
      { src: 'rotaract_2.jpg', caption: 'Getting off the bus after the Habitat event' },
      { src: 'alex_cam.png', caption: 'Me and my mentor, Mayor of Auburndale Alex Cam' },
      { src: 'brittany_cam_alex_cam_adriana.jpg', caption: 'Me, Adriana, my mentor Alex and his wife Brittany!' },
      { src: 'rotaract_4.jpg', caption: 'The group after an Adopt a Road. Pretty sure I found part of a car during this one!' },
      { src: 'rotaract_6.jpg', caption: 'Showcasing our Adopt a Road sign!' },
      { src: 'rotaract_8.jpg', caption: 'Mellow Mushroom, Spring 2025' },
    ],
    entries: [
      { name: 'Aidan Morris', role: 'Amazing guy. Rotaract Secretary & Adopt-a-Road Chair. Now hes the President. Rotaract is left in great hands with him. Works in IT like me! Super smart, super well-spoken, goodness personified.'},
      { name: 'Alyson Smyth', role: 'Super nice, and from Sebring too! Duke Energy is lucky to have her' },
      { name: 'Alex Cam', role: "Auburndale Mayor & Vice President of Cam's Catering! Amazing mentor to have. So glad to have met you." },
      { name: 'Brittany Cam', role: "Alex's wife! Super sweet English teacher, very down to earth, and hates AI text almost as much as I do"},
      { name: 'Marisa de Comier', role: "Very sweet, one of the nicest people I've met. Congrats to you and Ian!" },
      { name: 'Ian Lopez', role: "Cool guy, better at IT than me for sure. Congrats to you and Marisa!! Florida Poly's IT will be lost without you" },
      { name: 'Bobby Green', role: 'Rotaract Rotary Advisor, contributed so much to the club. Youngest Mayor in Florida history, very kind, very wise!'},
      { name: 'Brian Tran', role: 'Very nice guy, jealous of how much he travels'},
      { name: 'Bryden Silva', role: 'Fellow Persona 3 Reload fan, always brings good energy to Rotaract!'},
      { name: 'Danielle Rivers', role: 'Cool mentor, she has awesome earrings for any occasion'},
      { name: 'Izzy Greer', role: "Next year's Rotaract VP, she'll do great things for the club! Super nice, involved with SGA."},
      { name: 'Jack Everheart', role: "Next year's Rotaract treasurer. He's super involved too with SGA! Great guy."},
      { name: 'Jeff Tillman', role: "Mentor for Gaspar and previous Auburndale City Manager, super cool and driven" },
      { name: 'Jeremy Casanova', role: "Very cool Rotaract member" },
      { name: 'Henry Casanova', role: "Very cool twin Rotaract member"},
      { name: 'Jesus Sanchez', role: "Very involved with SGA and SHPE. Cool guy, thanks for coming to the events and meetings!"},
      { name: 'Larry Walker', role: "Domenic's mentor and incredible Rotarian. Good stories, works with State Farm"},
      { name: 'Lawrence Drake', role: "Unfortunately dropped out of school & Rotaract, still a great guy though. Was once our treasurer!"},
      { name: 'Melanie Najera', role: "Very nice, likes the same animes and games as me. Involved with the media club too"},
      { name: 'Patrick Mayer', role: "One of the roomies at Animosh!! Cool guy, came to every road cleanup and almost every meeting."},
      { name: 'Ryan Thomas', role: "One of the earliest friends I made, super cool guy. Very smart, very down to earth" },
      { name: 'Trenton McCutcheon', role: "Rotaract's next Secretary! Super cool guy, can't wait to see what he does" },
      { name: 'Pressley Hendrix', role: "Previous Rotaract VP, now our Rotary advisor from the Auburndale Club! Amazing guy, good handyman, always brings good energy. Also lives near me!"},
      { name: 'Joshua Chase', role: "Financial advisor from Edward Jones that spoke to us, and Noah's mentor! Super great guy to listen to, lowkey I might use him to help me with my finances"},
      { name: 'Leonardo Arriaga', role: "Great guy, came to Rotaract this year. Very helpful at the Habitat event. Great guy." },
      { name: 'Tyler Reuter', role: "Cool dude, can't eat Gluten but he's still the GOAT. Very prominent in Rotaract!"},
      { name: 'Michael Biggar', role: "Also a cool dude, super involved with Rotaract, helpful at Habitat and the Baynard event."},
      { name: 'Keith Cowie', role: "Pressley's Mentor and Auburndale Rotarian! District director for Winn Dixie, cool guy to listen to."},
    ],
  },
  {
    title: 'SHPE',
    photo: 'SHPE_1.png',
    leftPhotos: [
      { src: 'SHPE_1.jpg', caption: '[Insert Caption Here]' },
      { src: 'SHPE_2.jpg', caption: '[Insert Caption Here]' },
      { src: 'SHPE_the_city_of_philly.jpg', caption: '[Insert Caption Here]' },
    ],
    rightPhotos: [
      { src: 'SHPE_3.jpg', caption: '[Insert Caption Here]' },
      { src: 'SHPE_4.jpg', caption: '[Insert Caption Here]' },
      { src: 'maria_roman_1.jpg', caption: '[Insert Caption Here]' },
    ],
    entries: [
      { name: 'Benji Guzman' },
      { name: 'Gabriel Sanchez' },
      { name: 'Maria Roman' },
      { name: 'Samuel Marillo' },
      { name: 'Sebastian Anzola' },
      { name: 'The City of Philadelphia', role: 'for stealing my wallet' },
    ],
  },


  /* ── Alphabetical middle ── */
  {
    title: '#1 Gubbies',
    leftPhotos: [
      { src: 'number_one_gubbies_0.jpg', caption: '[Insert Caption Here]' },
      { src: 'number_1_gubbies_1.jpg', caption: '[Insert Caption Here]' },
      { src: 'number_1_gubbies_2.jpg', caption: '[Insert Caption Here]' },
      { src: 'number_1_gubbies_3.jpg', caption: '[Insert Caption Here]' },
    ],
    rightPhotos: [
      { src: 'number_1_gubbies.jpg', caption: '[Insert Caption Here]' },
      { src: 'number_1_gubbies_5.jpg', caption: '[Insert Caption Here]' },
      { src: 'number_1_gubbies_7.jpg', caption: '[Insert Caption Here]' },
    ],
    entries: [
      { name: 'Adriana Bottega' },
      { name: 'Brandon Camacho', role: '#1 Spinjitzu Master'},
      { name: 'Kristina Smith' },
      { name: 'Paul Patullo' },
    ],
  },
  {
    title: '2404-1313',
    entries: [
      { name: 'Bryon Catlin' },
      { name: 'Domenic Iorfida' },
      { name: 'George Mancini' },
      { name: 'Noah Campise' },
    ],
  },
  {
    title: "Christian's Peak",
    leftPhotos: [
      { src: 'christians_peak_1.png', caption: '[Insert Caption Here]' },
      { src: 'christians_peak_luis_mata_moreno.jpg', caption: '[Insert Caption Here]' },
    ],
    rightPhotos: [
      { src: 'christians_peak_2.png', caption: '[Insert Caption Here]' },
    ],
    entries: [
      { name: 'Albert Ubieta' },
      { name: 'Andrew Piasecki' },
      { name: 'Louis Irias' },
      { name: 'Luis Mata-Moreno' },
      { name: 'Christian Cruz', role: 'Triton Kiko' },
    ],
  },
  {
    title: 'Did He Watch 2',
    leftPhotos: [
      { src: 'did_he_watch_shiraj_and_i_IBM.jpg', caption: '[Insert Caption Here]' },
    ],
    rightPhotos: [
      { src: 'ibm_1.jpg', caption: '[Insert Caption Here]' },
    ],
    entries: [
      { name: 'Andrew Graham' },
      { name: 'Cameron Williams' },
      { name: 'Carlos Marillo' },
      { name: 'David Tarbox' },
      { name: 'Jordan Hall' },
      { name: 'Matthew Segarra' },
      { name: 'Raul Lopez III' },
      { name: 'Robert Grant' },
    ],
  },
  {
    title: 'Good Mythical Morning Enjoyers',
    leftPhotos: [
      { src: 'good_mythical_morning_enjoyers.jpg', caption: '[Insert Caption Here]' },
      { src: 'good_mythical_morning_enjoyers1.jpg', caption: '[Insert Caption Here]' },
    ],
    rightPhotos: [
      { src: 'good_mythical_morning_enjoyers2.jpg', caption: '[Insert Caption Here]' },
    ],
    entries: [
      { name: 'Emma Rossi' },
      { name: 'Jaylee Ciaschini' },
      { name: 'Gabby Martin'},
      { name: 'Manny Yousif'},
      { name: 'Julianna Ross'},
      { name: 'Chloe Reilly' },
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
    leftPhotos: [
      { src: 'capstone_1.jpg', caption: '[Insert Caption Here]' },
    ],
    rightPhotos: [
      { src: 'capstone_2.jpg', caption: '[Insert Caption Here]' },
    ],
    entries: [
      { name: 'James Allegra' },
      { name: 'Gerardo Claudio' },
      { name: 'Gaspar Chayer' },
      { name: 'Jackson Giles' },
      { name: 'Leon Harry' },
      { name: 'Lillian Wright' },
      { name: 'Michael Stevenson' },
      { name: 'Dr. Onur Toker', role: "Capstone Advisor & the GOAT" },
      { name: 'Michael Kennon', role: 'Sponsor' },
      { name: 'Jeremy Webb', role: 'Sponsor' },
    ],
  },
  {
    title: 'RAs/CDs',
    entries: [
      { name: 'Emily Rivera' },
      { name: 'Maddox Bown' },
    ],
  },
  {
    title: 'Lake Placid/Sebring',
    leftPhotos: [{ src: 'me_alaska.jpg', caption: '[Insert Caption Here]' }],
    rightPhotos: [{ src: 'me_random_with_cars.jpg', caption: '[Insert Caption Here]' }],
    entries: [
      { name: 'Brianna Pratts' },
      { name: 'Casen Simmons' },
      { name: 'Conor Wilson' },
      { name: 'Danyela Marcelo-Lopez' },
      { name: "Duce D'Anthony Dossey" },
      { name: 'Sean Turnock' },
      { name: 'Esperansa Cerebello' },
      { name: 'Gavin Higgs' },
      { name: 'Jacob Sueppel' },
      { name: 'James Swaford' },
      { name: 'Jennifer Angeles' },
      { name: 'Joshua Spurlock' },
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
    ],
  },
  {
    title: 'People I Know Because of Bryon',
    leftPhotos: [{ src: 'random_1.jpg', caption: '[Insert Caption Here]' }],
    rightPhotos: [{ src: 'random_2.jpg', caption: '[Insert Caption Here]' }],
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
      { name: 'Kora'},
    ],
  },
  {
    title: 'Party Animals',
    leftPhotos: [{ src: 'party_animals_1.jpg', caption: '[Insert Caption Here]' }],
    rightPhotos: [{ src: 'party_animals_2.jpg', caption: '[Insert Caption Here]' }],
    entries: [
      { name: 'Aliyah Schouten' },
      { name: 'Chris Mather' },
      { name: 'Jorgeandres Alvarez' },
      { name: 'Maya Stuhlman' },
      { name: 'Mikala Yin-Furiato' },
      { name: 'Quentin Lockwood' },
      { name: 'Tommy Jackson' },
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
    title: 'The Internationals',
    leftPhotos: [{ src: 'mohammad_hadid.jpg', caption: '[Insert Caption Here]' }],
    entries: [
      { name: 'Mohammad Hadid' },
      { name: 'Tugba Guneysu' },
    ],
  },
  {
    title: 'VALORANT Varsity',
    photo: ['flpolyesports.png', 'valorant.png'],
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
    leftPhotos: [{ src: 'winter_haven_1.jpg', caption: '[Insert Caption Here]' }],
    rightPhotos: [{ src: 'winter_haven_nick.png', caption: '[Insert Caption Here]' }],
    entries: [
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
      { name: 'Michael Adams' },
      { name: 'Mikey LaFollette' },
      { name: 'Nickolas Phan' },
      { name: 'Pickleball John' },
      { name: 'Prathyusha Bhuma' },
      { name: 'Raul Gonzales' },
      { name: 'Robert van Druten' },
      { name: 'The Winter Haven Librarians' },
      { name: 'Wen Zhang' },
    ],
  },
  {
    title: "Honorable Mentions",
    entries: [
      { name: 'Alfonso Contreras' },
      { name: 'Alis Craig' },
      { name: 'Andrew Blackwelder' },
      { name: "Jessica Steffen" },
      { name: 'Andrew Ptazek' },
      { name: 'Anthony Parinello' },
      { name: 'Brady Lenox' },
      { name: 'Nico Rapp'},
      { name: 'Clara Satterfield' },
      { name: 'Dylan Sturdivant' },
      { name: 'Connor Anderson' },
      { name: 'Dante Marin-Villanueva' },
      { name: 'David Para' },
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
      { name: 'Josh Alletto' },
      { name: 'Justis Nazirbage' },
      { name: 'Kailey Gibbons' },
      { name: 'Kaitlyn Surovy' },
      { name: 'Kody Byrd' },
      { name: 'Koral Ruiz' },
      { name: 'Christopher Colon'},
      { name: 'Kyla Harpe' },
      { name: 'Chiara Bottega' },
      { name: 'Kyle Trotter' },
      { name: 'Kyle Blanchard' },
      { name: 'Lauren Schneider' },
      { name: 'Leia Hok' },
      { name: 'Liam' },
      { name: 'Logan Morrison' },
      { name: 'Lucas Batista' },
      { name: 'Luis Silva' },
      { name: 'Lukas Kelk' },
      { name: 'Meleena Scott' },
      { name: 'Melanie Morenson' },
      { name: 'Michael Carlson' },
      { name: 'Miguel Mondragon' },
      { name: 'Mois\u00e9s Mu\u00f1oz Salazar'},
      { name: 'Joel Mendez'},
      { name: 'Noelia Sanchez' },
      { name: 'Pressley Hendrix' },
      { name: 'JCPennys Rita', role: 'for cutting my hair so many times' },
      { name: 'Roland Diaz' },
      { name: 'Ryan Mullins' },
      { name: 'Stella Asanova' },
      { name: 'Thomas Risalvato' },
      { name: 'Zander Butler' },
      { name: 'Zane Wolfe' },
      { name: 'Eduardo Jirau'},
      { name: 'Jes Pate'},
      { name: 'Joseph Wright'},
      { name: 'Noah Vanscoyoc'},
      { name: 'Sean Fisher'},
      { name: 'Cyler Gabel' },
      { name: 'John Sengchanh'},
      { name: 'Daniel Freer'},
      { name: 'Adrian Sanchez' },
      { name: 'Matthew Omongus' },
      { name: 'Esmeralda Collazo' },
    ],
    leftPhotos: [
      { src: 'honorable_mentions.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_2.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_3.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_4.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_5.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_6.jpg', caption: '[Insert Caption Here]' },
    ],
    rightPhotos: [
      { src: 'honorable_mentions_lukas_kelk.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_clara.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_chiara_bottega_kyle_trotter.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_near_chiara_bottega.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_7.png', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_8.jpg', caption: '[Insert Caption Here]' },
      { src: 'honorable_mentions_9.jpg', caption: '[Insert Caption Here]' },
    ],
  },
  {
    title: 'The Big Back Spots',
    entries: [
      { name: 'The Pantry: Modern Diner', role: 'Auburndale' },
      { name: 'The Joinery', role: 'Lakeland' },
      { name: 'Palace Pizza', role: 'Lakeland' },
      { name: 'Bowen Yard', role: 'Winter Haven' },
      { name: 'Polk City Ice Cream/BBQ', role: 'Polk City' },
      { name: "Huey Magoo's", role: 'Auburndale' },
      { name: 'Chick-fil-A', role: 'Lakeland' },
      { name: 'Hibachi Express', role: 'Lakeland, Always good right before a Publix cookie' },
    ],
  },

  /* ── End sections ── */
  {
    title: 'Online Friends',
    entries: [
      { name: 'Alibaba' },
      { name: 'Andy Miller', role: 'Lets me carry him in VALORANT' },
      { name: 'Nicole Curatolo', role: 'athena, Best Sage main' },
      { name: 'Bruno Cirilo' },
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
    leftPhotos: [
      { src: 'me_presenting.jpg', caption: '[Insert Caption Here]' },
      { src: 'special_thanks_mark_grayson.jpg', caption: '[Insert Caption Here]' },
    ],
    rightPhotos: [
      { src: 'me_coca_cola.jpg', caption: '[Insert Caption Here]' },
      { src: 'special_thanks_hornet.jpg', caption: '[Insert Caption Here]' },
    ],
    entries: [
      { name: 'A-Train' },
      { name: 'Akira Kurusu' },
      { name: 'Apollo Justice' },
      { name: 'Arataka Reigen' },
      { name: 'Atom Eve' },
      { name: 'Clairo' },
      { name: 'Edward Elric' },
      { name: 'Hideo Kojima' },
      { name: 'Hornet' },
      { name: 'Itadori Yuji' },
      { name: 'Johnny Joestar' },
      { name: 'Jolyne Kujo' },
      { name: 'Jonathan Joestar' },
      { name: 'Joseph Joestar' },
      { name: 'Josuke Higashikata' },
      { name: 'Jotaro Kujo' },
      { name: 'Kasane Teto' },
      { name: 'Lucy MacLean' },
      { name: 'Makoto Yuki' },
      { name: 'MAPPA' },
      { name: 'Mark Grayson' },
      { name: 'Maya Fey' },
      { name: 'ONE' },
      { name: 'Phoenix Wright' },
      { name: 'Roy Mustang' },
      { name: 'Saitama' },
      { name: 'Shigeo Kageyama' },
      { name: 'Stark' },
      { name: 'Team Cherry' },
      { name: 'The Knight' },
      { name: 'Thorfinn, son of Thors' },
      { name: 'Toby Fox' },
      { name: 'Yu Narukami' },
      { name: 'Yuta Okkotsu' },
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
const MOBILE_GROUP_SIZE = 3;  // names per inline photo group on mobile

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
  action: number;       // 0=normal, 1=homing-lock, 2=fired-bullet, 3=wrap
  frame: number;
  gravity: number;
  angle: number;
  /* Accumulated seconds for action:1 slide/aim/fire — replaces frame-count
     gates so slide distance is FPS-independent (fixes mobile off-screen bug). */
  slideT: number;
}

let nextProjId = 0;

const DETERMINATION_MONO = "'DeterminationMono', monospace";
const DETERMINATION_SANS = "'DeterminationSans', sans-serif";

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
    gravity: 0, angle: 0, slideT: 0,
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

    /* Safe-area insets cached per-resize — reading `getComputedStyle(canvas)` on
       every frame of the render loop forces a style recalc which is a known
       mobile jank trigger. These only change on resize / orientation. */
    let cachedSaiTop = 0;
    let cachedSaiBottom = 0;
    const refreshSafeInsets = () => {
      const cs = getComputedStyle(canvas);
      const tTop = parseFloat(cs.getPropertyValue('--sai-top').trim());
      const tBot = parseFloat(cs.getPropertyValue('--sai-bottom').trim());
      cachedSaiTop = Number.isFinite(tTop) ? tTop : 0;
      cachedSaiBottom = Number.isFinite(tBot) ? tBot : 0;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      refreshSafeInsets();
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

    /* ── Hit sound: WebAudio (preferred) with HTMLAudio fallback ──
       iOS HTMLAudioElement cannot layer/overlap sounds (single-channel limit —
       every rapid hit must wait for the previous to settle), causing perceptible
       lag when multiple names are hit at once. WebAudio's AudioBufferSourceNode
       plays instantly, non-blocking, and supports unlimited layering — which
       eliminates the multi-hit stutter reported on phones. */
    let hitAudioBuffer: AudioBuffer | null = null;
    let hitAudioCtx: AudioContext | null = null;
    try {
      const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
              ?? (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        hitAudioCtx = new AC();
        fetch('/deltarune_hit.mp3')
          .then(r => r.arrayBuffer())
          .then(buf => hitAudioCtx!.decodeAudioData(buf))
          .then(decoded => { hitAudioBuffer = decoded; })
          .catch(() => { /* silent — HTMLAudio fallback will take over */ });
      }
    } catch { /* no WebAudio support — HTMLAudio fallback is used */ }

    /* Fallback pool: 6 pre-loaded Audio elements for browsers without WebAudio. */
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
      /* Cooldown — prevents audio overlap stacking into a distorted roar when
         the heart is dragged continuously through a wall. */
      if (now - lastHitSoundTime < 50) return;
      lastHitSoundTime = now;
      /* Fast path — WebAudio is zero-latency on iOS and doesn't block the main
         thread. Resume suspended context (iOS auto-suspends in background). */
      if (hitAudioCtx && hitAudioBuffer) {
        if (hitAudioCtx.state === 'suspended') hitAudioCtx.resume().catch(() => {});
        const src = hitAudioCtx.createBufferSource();
        src.buffer = hitAudioBuffer;
        const gain = hitAudioCtx.createGain();
        gain.gain.value = 0.5;
        src.connect(gain);
        gain.connect(hitAudioCtx.destination);
        src.start(0);
        return;
      }
      /* Slow path — HTMLAudio fallback. */
      const s = hitSounds[hitSoundIdx % hitSounds.length];
      if (s) { s.currentTime = 0; s.play().catch(() => {}); }
      hitSoundIdx++;
    };

    let heartImg: HTMLImageElement | null = null;
    loadHeartImage().then((img) => { heartImg = img; });
    let hpBarImg: HTMLImageElement | null = null;
    loadHpInfiniteImage().then((img) => { hpBarImg = img; });
    preloadFonts();

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
    let endPhase = 0; /* 0=fade-to-black, 1=touched-credits-scroll, 2=thank-you */
    let touchedScrollY = 0; /* y anchor of the touched-credits block; starts below screen */
    let thankYouY = 0;
    let thankYouHoldTimer = 0; /* seconds since thank-you appeared — hold 4.5 s then scroll */
    let skipCutscene = false;
    const HEART_SPEED = 350;
    const isMobileDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const MAX_PROJECTILES = isMobileDevice ? 80 : 160;

    /* Safe-area insets from CSS `env(safe-area-inset-*)` — cached via
       `refreshSafeInsets()` on mount / resize (above). Re-reading them every
       frame forces a style recalc which is a known mobile jank trigger. */
    const readSafeInset = (side: 'top' | 'bottom'): number =>
      side === 'bottom' ? cachedSaiBottom : cachedSaiTop;
    const getSlotH = () => getFontSize() * 1.15;
    /* Heart sprite half-dimension. Mobile floor is slightly above desktop so the
       heart remains visible under a fingertip, but not so large that it dominates
       narrow screens. */
    const getHeartSize = () => {
      const floor = isMobileDevice ? 11 : 9;
      return Math.max(floor, Math.floor(getSlotH() * 0.32));
    };

    /* ════════════════════════════════════════════════════
       TUNING CONSTANTS — edit here to adjust each phase.
       ════════════════════════════════════════════════════ */
    // Ph2 — Crossing Streams: gap between each row = heartDiameter + P2_GAP_EXTRA px
    const P2_GAP_EXTRA           = 5;    // px of clearance beyond heart diameter
    // Ph3 — Corridor
    const P3_FALL_SPEED_FRAC     = 0.62; // fall speed = H × this
    const P3_SPAWN_RATE          = 0.22; // seconds between each corridor name-pair (tighter)
    const P3_MAX_SWING_PX        = 140;  // max corridor gap deviation from center (keeps pace with heart on PC)
    // Ph4 — Column Rain (3 columns, one always has a gap to dodge into)
    const P4_WAVE_RATE           = isMobileDevice ? 0.65 : 0.50; // s between column waves
    const P4_FALL_SPEED_FRAC     = 0.30;                          // vy = H × this
    // Ph5 — Fan Burst (3 names in a fan from alternating sides)
    const P5_BURST_RATE          = isMobileDevice ? 1.20 : 0.95; // s between fan bursts
    const P5_FAN_SPEED_FRAC      = 0.62;                          // speed = min(W,H) × this
    const P5_FAN_ANGLE_DEG       = 28;                            // spread angle from horizontal
    // Ph7 — Rapid Streams (crossing streams at ~2× speed)
    const P7_RAPID_RATE          = isMobileDevice ? 2.20 : 1.70; // s between rapid stream waves
    // Ph8 — Chaos Rain (random-x vertical names, dense)
    const P8_RAIN_RATE           = isMobileDevice ? 0.50 : 0.36; // s between chaos rain waves
    const P8_RAIN_COUNT          = isMobileDevice ? 3 : 5;        // names per chaos wave

    /* ── Phase system ── */
    let currentPhase = 0;
    let phaseTimer = 0;
    let phaseRound = 0;
    let phaseTransitionDelay = 0;
    const PHASE_TRANSITION_DURATION = 1.2; /* seconds between phases */
    const totalNames = 400;

    /* Phase thresholds — ~90-second runtime with 8 distinct phases */
    const phase0End = 35;   // Aimed spreads (7 × 5 names)
    const phase2End = 105;  // Crossing streams (~3 waves)
    const phase3End = 195;  // Corridor (45 tight pairs)
    const phase4End = 230;  // Column Rain
    const phase5End = 275;  // Fan Burst
    const phase7End = 325;  // Rapid Streams (NEW)
    const phase8End = 365;  // Chaos Rain (NEW)

    const getPhase = (idx: number): number => {
      if (idx < phase0End) return 0;  // Aimed spreads
      if (idx < phase2End) return 2;  // Crossing streams
      if (idx < phase3End) return 3;  // Corridor
      if (idx < phase4End) return 4;  // Column Rain
      if (idx < phase5End) return 5;  // Fan Burst
      if (idx < phase7End) return 7;  // Rapid Streams
      if (idx < phase8End) return 8;  // Chaos Rain
      return 6;                       // Fast aimed spreads (finale)
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
      const spacing = Math.max(42, W() / 14);
      const slideVx = isMobileDevice
        ? Math.max(180, W() * 0.55)
        : Math.max(350, W() * 0.55);
      for (let i = 0; i < 5; i++) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        const startX = fromRight ? w + 50 + i * spacing : -tw - 50 - i * spacing;
        const startY = yCenter + (i - 2) * spacing; // center 5-name spread around yCenter
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

    /* ── Phase 4: Column Rain — columns fall, one always has a gap ── */
    /* Mobile uses 2 columns (wider = fits longer names); desktop uses 3. */
    let p4GapCol = 0;
    const spawnColumnWave = () => {
      if (nameIdx >= phase4End) return;
      const w = W(), h = H();
      const vy = h * P4_FALL_SPEED_FRAC;
      const numCols = isMobileDevice ? 2 : 3;
      const colW = w / numCols;
      const gapCol = p4GapCol % numCols;
      for (let col = 0; col < numCols; col++) {
        if (col === gapCol) continue; /* gap column — always safe to stand in */
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        /* Clamp x so text stays within its column; clamp hitbox too so the
           gap column is always safe even for very long names on narrow screens. */
        const rawX = colW * col + (colW - tw) / 2;
        const x = Math.max(colW * col, Math.min(colW * (col + 1) - tw, rawX));
        const hitW = Math.min(tw, colW * (col + 1) - x);
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x, y: -th - 20,
          vy, w: hitW, h: th,
        }));
      }
      p4GapCol++;
    };

    /* ── Phase 5: Fan Burst — 3 names spread in a fan from alternating sides ── */
    let p5FanFromRight = false;
    const spawnFanBurst = () => {
      if (nameIdx >= phase5End) return;
      const w = W(), h = H();
      const speed = Math.min(w, h) * P5_FAN_SPEED_FRAC;
      const angleRad = (P5_FAN_ANGLE_DEG * Math.PI) / 180;
      const vxDir = p5FanFromRight ? -1 : 1;
      const startX = p5FanFromRight ? w + 60 : -60;
      /* Three fan angles: upper, center, lower */
      const angles = [-angleRad, 0, angleRad];
      for (const a of angles) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        const vx = vxDir * speed * Math.cos(a);
        const vy = speed * Math.sin(a);
        projectiles.push(mkProj({
          id: nextProjId++, text: name,
          x: p5FanFromRight ? startX - tw : startX,
          y: h / 2 - th / 2,
          vx, vy, w: tw, h: th,
        }));
      }
      p5FanFromRight = !p5FanFromRight;
    };

    /* ── Phase 7: Rapid Streams — crossing streams at ~2× speed ── */
    const spawnRapidStreams = () => {
      if (nameIdx >= phase7End) return;
      const h = H(), w = W();
      const streamSpeed = Math.min(640, w * 0.95);
      const textH = getFontSize() * 1.2;
      const heartDiam = 2 * getHeartSize();
      const slotH = 2 * textH + 2 * (heartDiam + P2_GAP_EXTRA);
      const count = Math.ceil(h / slotH) + 2;
      for (let i = 0; i < count; i++) {
        const name = nextName();
        if (!name) continue;
        const { tw, th } = measureName(name);
        projectiles.push(mkProj({ id: nextProjId++, text: name, x: -tw - 40, y: i * slotH, vx: streamSpeed, w: tw, h: th }));
      }
      for (let i = 0; i < count; i++) {
        const name = nextName();
        if (!name) continue;
        const { tw, th } = measureName(name);
        projectiles.push(mkProj({ id: nextProjId++, text: name, x: w + 40, y: slotH / 2 + i * slotH, vx: -streamSpeed, w: tw, h: th }));
      }
    };

    /* ── Phase 8: Chaos Rain — names fall from random x positions ── */
    const spawnChaosRain = () => {
      if (nameIdx >= phase8End) return;
      const w = W(), h = H();
      const vy = h * 0.38;
      for (let i = 0; i < P8_RAIN_COUNT; i++) {
        const name = nextName();
        if (!name) return;
        const { tw, th } = measureName(name);
        const x = Math.random() * Math.max(1, w - tw);
        projectiles.push(mkProj({ id: nextProjId++, text: name, x, y: -th - 20, vy, w: tw, h: th }));
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
      /* Mobile devices get a 25 % slower pacing so the credits don't feel
         rushed on small screens where each wave has less room to breathe. */
      const mobilePace = isMobileDevice ? 1.25 : 1.0;
      let base: number;
      switch (phase) {
        case 0: base = 1.2; break;   // Aimed spreads
        case 2: base = 3.5; break;   // Crossing streams (full screen per call, both waves)
        case 6: base = 0.8; break;   // Fast aimed spreads
        default: base = 1.0;
      }
      return base * mobilePace;
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
          touchedScrollY = h + 50; /* start below screen, scroll up */
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
            if (p.angle) {
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
        } else if (endPhase === 1) {
          if (keys.has('arrowleft') || keys.has('a')) heart.x -= HEART_SPEED * dt;
          if (keys.has('arrowright') || keys.has('d')) heart.x += HEART_SPEED * dt;
          if (keys.has('arrowup') || keys.has('w')) heart.y -= HEART_SPEED * dt;
          if (keys.has('arrowdown') || keys.has('s')) heart.y += HEART_SPEED * dt;
          heart.x = Math.max(hs, Math.min(w - hs, heart.x));
          heart.y = Math.max(hs, Math.min(h - hs, heart.y));

          touchedScrollY -= h * 0.38 * dt;

          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);

          /* Title */
          const titleFS = Math.max(24, Math.min(40, w / 16));
          ctx.font = `${titleFS}px ${DETERMINATION_SANS}`;
          ctx.fillStyle = '#FFFF00';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const titleY = touchedScrollY;
          ctx.fillText('* TOUCHED CREDITS *', w / 2, titleY);

          /* Names grid — all hit names */
          const uniqueNames = [...new Set(hitNames)];
          const nameFS = Math.max(11, Math.min(18, w / 30));
          const nameLineH = nameFS * 1.5;
          const gridStartY = titleY + titleFS + 20;
          const availH = h - 80;
          const maxRows = Math.max(1, Math.floor(availH / nameLineH));
          const numCols = uniqueNames.length > 0 ? Math.max(1, Math.ceil(uniqueNames.length / maxRows)) : 1;
          const colW = w / numCols;

          ctx.font = `${nameFS}px ${DETERMINATION_SANS}`;
          ctx.fillStyle = '#FFFF00';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          for (let i = 0; i < uniqueNames.length; i++) {
            const col = Math.floor(i / maxRows);
            const row = i % maxRows;
            const nx = colW * col + colW / 2;
            const ny = gridStartY + row * nameLineH;
            if (ny > -20 && ny < h + 20) ctx.fillText(uniqueNames[i] ?? '', nx, ny);
          }

          /* Skip hint */
          ctx.font = `13px ${DETERMINATION_MONO}`;
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('Click / tap to skip', w / 2, h - 10 - readSafeInset('bottom'));

          drawHeart(ctx, heart.x, heart.y, hs, false, heartImg);

          /* Block scrolled entirely off top → advance to thank-you */
          const gridRows = Math.ceil(uniqueNames.length / numCols);
          const blockBottom = gridStartY + gridRows * nameLineH;
          if (blockBottom < -40) {
            endPhase = 2;
            endTimer = 0;
            thankYouY = h * 0.22; /* start on-screen; fade in, hold, then scroll up */
            thankYouHoldTimer = 0;
          }

        /* ── Phase 3: thank-you message scrolls up ── */
        } else if (endPhase === 2) {
          if (keys.has('arrowleft') || keys.has('a')) heart.x -= HEART_SPEED * dt;
          if (keys.has('arrowright') || keys.has('d')) heart.x += HEART_SPEED * dt;
          if (keys.has('arrowup') || keys.has('w')) heart.y -= HEART_SPEED * dt;
          if (keys.has('arrowdown') || keys.has('s')) heart.y += HEART_SPEED * dt;
          heart.x = Math.max(hs, Math.min(w - hs, heart.x));
          heart.y = Math.max(hs, Math.min(h - hs, heart.y));

          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);

          if (thankYouHoldTimer < 4.5) {
            thankYouHoldTimer += dt;
          } else {
            thankYouY -= 75 * dt;
          }

          const tyAlpha = Math.min(1, thankYouHoldTimer / 0.6);
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
            "'Til next time!",
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
              ctx.fillStyle = `rgba(255,255,0,${tyAlpha})`;
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
          if (thankYouHoldTimer >= 4.5 && thankYouY + (tyLines.length - 1) * tySpacing < -60) {
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
            /* Let old projectiles coast off-screen naturally — no instant clear,
               no flash, no velocity change. Prevents jarring black screen. */
            currentPhase = newPhase;
            phaseTimer = 0;
            phaseRound = 0;
            phaseTransitionDelay = PHASE_TRANSITION_DURATION;
          }

          if (phaseTransitionDelay > 0) {
            phaseTransitionDelay -= dt;
          } else if (currentPhase === 3 && !corridorActive) {
            /* Start corridor */
            corridorActive = true;
            corridorSpawnTimer = 0;
            corridorSpawnCount = 0;
          } else if (currentPhase === 4) {
            /* Column Rain — 2 of 3 columns fall, gap rotates each wave */
            phaseTimer += dt;
            if (phaseTimer >= P4_WAVE_RATE && nameIdx < phase4End) {
              phaseTimer = 0;
              spawnColumnWave();
            }
          } else if (currentPhase === 5) {
            /* Fan Burst — 3 names in a fan from alternating sides */
            phaseTimer += dt;
            if (phaseTimer >= P5_BURST_RATE && nameIdx < phase5End) {
              phaseTimer = 0;
              spawnFanBurst();
            }
          } else if (currentPhase === 7) {
            /* Rapid Streams — crossing streams at ~2× speed */
            phaseTimer += dt;
            if (phaseTimer >= P7_RAPID_RATE && nameIdx < phase7End) {
              phaseTimer = 0;
              spawnRapidStreams();
            }
          } else if (currentPhase === 8) {
            /* Chaos Rain — random-x vertical names */
            phaseTimer += dt;
            if (phaseTimer >= P8_RAIN_RATE && nameIdx < phase8End) {
              phaseTimer = 0;
              spawnChaosRain();
            }
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
              }
            }
          }
        }
      }

      /* ── Update projectiles ── */
      for (const p of projectiles) {
        p.frame++;
        if (p.hit) p.hitAge += dt; /* accumulate age but keep updating position — Undertale style */

        if (p.action === 1) {
          /* Time-based phases (FPS-independent) — matches 60 fps Undertale
             feel on any device. Replaces the old frame-count gates which
             overshot by 2× on 30 fps mobile and pushed names off-screen. */
          const SLIDE_DUR = 1.0;   // slide in for 1 s
          const AIM_DUR   = 0.75;  // aim at heart for 0.75 s
          const prevT = p.slideT;
          p.slideT += dt;

          if (prevT < SLIDE_DUR) {
            if (p.slideT < SLIDE_DUR) {
              /* Phase 1: Slide in */
              p.x += p.vx * dt;
              p.y += p.vy * dt;
            } else {
              /* Crossed the slide→aim boundary this frame — travel the
                 remaining slice then stop cleanly on the boundary. */
              const partial = SLIDE_DUR - prevT;
              p.x += p.vx * partial;
              p.y += p.vy * partial;
              p.vx = 0;
              p.vy = 0;
            }
          } else if (p.slideT < SLIDE_DUR + AIM_DUR) {
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
          } else if (prevT < SLIDE_DUR + AIM_DUR) {
            /* Phase 3 (one-shot boundary crossing): Fire in aimed direction —
               action:2 for tight off-screen culling. */
            const speed = 280;
            p.vx = Math.cos(p.angle) * speed;
            p.vy = Math.sin(p.angle) * speed;
            p.action = 2;
          }
        } else if (p.action === 6) {
          /* Corridor wall — just fall straight down (x is fixed at spawn) */
          p.y += p.vy * dt;
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        if (p.gravity) p.vy += p.gravity * dt;

        if (p.action === 3) {
          if (p.x < -80) p.x = w + 60;
          if (p.x > w + 80) p.x = -60;
        }

      }

      projectiles = projectiles.filter((p) => {
        /* Fired aimed bullets (action:2): tight cull — remove as soon as off-screen */
        if (p.action === 2) return p.x > -p.w - 60 && p.x < w + 60 && p.y > -p.h - 60 && p.y < h + 60;
        if (p.action === 6) {
          /* Corridor + Phase-4 vertical walls fall straight down. Rotated walls
             have visual extent = p.w (original text width), so add the max extent
             so rotated glyphs fully clear the screen before cull. */
          return p.y < h + 100 + Math.max(p.w, p.h);
        }
        return p.x > -400 && p.x < w + 400 && p.y > -300 && p.y < h + 300;
      });
      /* Hard cap for mobile perf — drop oldest projectiles first. */
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

        if (p.angle) {
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
      /* Release the WebAudio context so it doesn't linger between game sessions. */
      if (hitAudioCtx && hitAudioCtx.state !== 'closed') {
        hitAudioCtx.close().catch(() => {});
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
        <div style={{ fontSize: 64, color: '#FFFF00', fontWeight: 700, marginBottom: 40 }}>
          {result.hitCount}
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
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attackResult, setAttackResult] = useState<AttackResult | null>(null);

  const { submitScore } = useLeaderboard();

  /* ── Grad-cap visit counter (Firebase) ──
     Increment once per page load. Reset to 0 the day before graduation.
     View count at: Firebase console → Realtime Database → stats/creditsViews */
  useEffect(() => {
    if (!db) return;
    update(dbRef(db, 'stats'), { creditsViews: increment(1) }).catch(() => {});
  }, []);

  /* Preload fonts as early as possible to avoid FOUT hitch */
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => { preloadFonts().then(() => setFontsReady(true)); }, []);

  /* Song preview state */
  const [previewTrack, setPreviewTrack] = useState<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

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
  const isPausedRef = useRef(false);
  const volumeRef = useRef(60);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  /* Preload all credits photos during song selection, top-to-bottom, so images
     are ready before the user reaches them. Uses a small concurrency limit so
     the browser loads in order rather than racing all images at once on mobile. */
  useEffect(() => {
    const urls: string[] = [
      '/credits-photos/flpoly.png',
      '/credits-photos/professional_photo_of_me.png',
      '/credits-photos/wellsfargo.jpg',
      '/credits-photos/IBM.png',
      '/credits-photos/ibm_1.jpg',
    ];
    for (const section of CREDITS_DATA) {
      if (section.photo) {
        const photos = Array.isArray(section.photo) ? section.photo : [section.photo];
        photos.forEach(p => urls.push(`/credits-photos/${p}`));
      }
      (section.leftPhotos ?? []).forEach(p => urls.push(`/credits-photos/${p.src}`));
      (section.rightPhotos ?? []).forEach(p => urls.push(`/credits-photos/${p.src}`));
      section.entries.forEach(e => { if (e.photo) urls.push(`/credits-photos/${e.photo}`); });
    }
    const queue = [...new Set(urls)];
    let idx = 0;
    const CONCURRENCY = 6;
    const loadNext = () => {
      if (idx >= queue.length) return;
      const src = queue[idx++]!;
      const img = new Image();
      img.onload = loadNext;
      img.onerror = loadNext;
      img.src = src;
    };
    for (let c = 0; c < CONCURRENCY; c++) loadNext();
  }, []);

  /* Preload the selected track into the browser's HTTP cache so playback starts
     instantly when the user clicks Play. Relies on browser cache — we don't
     reuse the element, just trigger the network fetch early. */
  useEffect(() => {
    const track = TRACKS[selectedTrack];
    if (!track) return;
    const a = new Audio();
    a.preload = 'auto';
    a.src = track.file;
    return () => { a.src = ''; };
  }, [selectedTrack]);

  /* Stop preview audio when switching away from song-select screen */
  useEffect(() => {
    if (mode !== 'select' && previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = '';
      previewAudioRef.current = null;
      setPreviewTrack(null);
    }
  }, [mode]);

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

      if (!blackPauseRef.current && !isPausedRef.current && contentHeightRef.current > 0) {
        const pxPerSec = contentHeightRef.current / BASE_DURATION;
        scrollPosRef.current -= pxPerSec * speedRef.current * dt;

        /* Clamp at top when rewinding past the start */
        if (scrollPosRef.current > 0) scrollPosRef.current = 0;

        if (trackRef.current) {
          trackRef.current.style.transform = `translateY(${scrollPosRef.current}px)`;
        }

        if (scrollPosRef.current <= -contentHeightRef.current) {
          blackPauseRef.current = true;

          /* Fade out the track */
          if (trackRef.current) trackRef.current.style.opacity = '0';

          pauseTimerRef.current = setTimeout(() => {
            /* Reset position while invisible */
            const pxPerSec = contentHeightRef.current > 0 ? contentHeightRef.current / BASE_DURATION : 100;
            scrollPosRef.current = pxPerSec * 0.4 * 10; /* ≈10 s to scroll into view at 0.4× speed */
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

  const togglePreview = useCallback((trackIdx: number) => {
    /* If already previewing this track, stop it */
    if (previewTrack === trackIdx) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
        previewAudioRef.current = null;
      }
      setPreviewTrack(null);
      return;
    }
    /* Stop any running preview */
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = '';
    }
    const track = TRACKS[trackIdx];
    if (!track) return;
    const a = new Audio(track.file);
    a.volume = 0.6;
    a.play().catch(() => {});
    previewAudioRef.current = a;
    setPreviewTrack(trackIdx);
    setSelectedTrack(trackIdx);
    /* Auto-stop after 30 seconds */
    const timer = setTimeout(() => {
      if (previewAudioRef.current === a) {
        a.pause();
        a.src = '';
        previewAudioRef.current = null;
        setPreviewTrack(null);
      }
    }, 30000);
    a.addEventListener('ended', () => clearTimeout(timer));
  }, [previewTrack]);

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
    setIsPaused(false);
    if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }
    if (trackRef.current) {
      trackRef.current.style.transform = 'translateY(0)';
    }
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  /* ── Mobile layout: photos interleaved with name groups ── */
  const buildMobileLayout = (section: CreditSection) => {
    const photoPool: CreditPhoto[] = [
      ...(section.leftPhotos ?? []),
      ...(section.rightPhotos ?? []),
    ];
    const result: React.ReactNode[] = [];
    let photoIdx = 0;
    const isMemorial = section.title === 'In Memory Of';

    for (let i = 0; i < section.entries.length; i += MOBILE_GROUP_SIZE) {
      const group = section.entries.slice(i, i + MOBILE_GROUP_SIZE);
      const photo = photoPool[photoIdx];
      const isLeft = photoIdx % 2 === 0;

      const nameNodes = group.map((entry) => (
        <div key={`${section.title}-${entry.name}-mob`}>
          <div className={isMemorial ? styles.memorialName : styles.name}>
            {entry.name}
          </div>
          {entry.role && <div className={styles.role}>{entry.role}</div>}
          {entry.needsLastName && (
            <div className={styles.placeholder}>[INSERT LAST NAME]</div>
          )}
        </div>
      ));

      if (photo) {
        result.push(
          <div
            key={`mob-group-${i}`}
            className={`${styles.mobilePhotoGroup}${!isLeft ? ` ${styles.mobilePhotoGroupReverse}` : ''}`}
          >
            <div className={styles.mobileGroupPhotoBlock}>
              <img
                className={styles.mobileGroupPhoto}
                src={`/credits-photos/${photo.src}`}
                alt=""
              />
              {photo.caption && <div className={styles.photoCaption}>{photo.caption}</div>}
            </div>
            <div className={styles.mobileGroupNames}>{nameNodes}</div>
          </div>
        );
        photoIdx++;
      } else {
        result.push(
          <div key={`mob-group-${i}`}>{nameNodes}</div>
        );
      }
    }

    return result;
  };

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
                <div key={t.file} className={styles.songItemRow}>
                  <button
                    className={`${styles.songItem} ${selectedTrack === i ? styles.songItemActive : ''}`}
                    onClick={() => setSelectedTrack(i)}
                  >
                    {t.name}
                  </button>
                  <button
                    className={`${styles.previewBtn} ${previewTrack === i ? styles.previewBtnActive : ''}`}
                    onClick={() => togglePreview(i)}
                    title={previewTrack === i ? 'Stop preview' : 'Preview'}
                  >
                    {previewTrack === i ? '\u23F8\uFE0E' : '\u25B6\uFE0E'}
                  </button>
                </div>
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
            min={-2}
            max={3}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className={styles.sliderValue}>{formatSpeed(speed)}x</span>
        </div>

        <button className={styles.pauseBtn} onClick={handlePause} title={isPaused ? 'Resume' : 'Pause'}>
          {isPaused ? '▶' : '⏸'}
        </button>
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
                    <div key={p.src} className={styles.photoWithCaption}>
                      <img src={`/credits-photos/${p.src}`} alt="" className={styles.sidePhoto} />
                      {p.caption && <div className={styles.photoCaption}>{p.caption}</div>}
                    </div>
                  ))}
                </div>

                {/* Center text */}
                <div className={styles.creditsCenter}>
                  {section.photo && renderSectionPhoto(section.photo)}
                  <div className={section.title === 'In Memory Of' ? styles.memorialTitle : styles.sectionTitle}>
                    {section.title}
                  </div>
                  {/* Desktop layout */}
                  <div className={styles.desktopNames}>
                    {useTwoCol ? (
                      <div className={styles.twoColumnNames}>{nameEntries}</div>
                    ) : (
                      nameEntries
                    )}
                  </div>

                  {/* Mobile layout — photos interleaved with name groups */}
                  <div className={styles.mobileNames}>
                    {buildMobileLayout(section)}
                  </div>
                  <div className={styles.divider} />
                </div>

                {/* Right side photos */}
                <div className={styles.sideColRight}>
                  {(section.rightPhotos ?? []).map((p) => (
                    <div key={p.src} className={styles.photoWithCaption}>
                      <img src={`/credits-photos/${p.src}`} alt="" className={styles.sidePhoto} />
                      {p.caption && <div className={styles.photoCaption}>{p.caption}</div>}
                    </div>
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
