import type { NextPage } from 'next';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../../components/layout';
import {
  StarIcon, StarEmptyIcon, ArrowRightIcon,
  MusicIcon, TrophyIcon, RefreshIcon,
  HeadphonesIcon, ZapIcon, ClockIcon,
  ToothIcon, MessageCircleIcon, EarIcon,
  MoonIcon, WaveIcon, LayersIcon,
  HelmetIcon, RadioIcon, ShieldIcon, CogIcon,
  AwardIcon, HeartIcon, EyeOffIcon,
} from '../../components/icons';
import styles from '../../styles/collection.module.css';

/* ─── CDN shortcuts ─── */
const CDN = 'https://www.earasers.shop/cdn/shop/files';
const BASE = `${CDN}/Earasersuitgezoomd.png`;
const MINK = `${CDN}/EarasersmodelsMinkvierkant.png`;
const KIT  = `${CDN}/Earasers_starter_combo_kit.png`;
const DJ_MAIN   = `${CDN}/MainProductPicDJ.png`;
const WADE_IMG  = `${CDN}/WADE_earasers.webp`;
const MASON_IMG = `${CDN}/Masoncollective.png`;
const FRANKY    = `${CDN}/Earasersmodelsinear.png`;
const BODZIN    = `${CDN}/Img_Earasers_Invictim_799be337-dc9f-4fb1-af41-87ad6b0ad933.jpg`;
const JOEY      = `${CDN}/EARASERS_2024_1.webp`;
const DENT1     = `${CDN}/Matis_Mink_Dentist_2.png`;
const DENT2     = `${CDN}/Close_Up_Pic_Dentist_74afcccd-2f3c-4178-a73f-b2bf59418973.png`;
const DENT3     = `${CDN}/IMG_4654.jpg`;
const DENT4     = `${CDN}/3_05f550b8-2ff8-4b8a-8a28-1ebbbe40fdf4.png`;
const DENT5     = `${CDN}/1_9fb6a91f-53c3-40d4-a55d-0a36242d8c78.png`;
const ATTEN     = `${CDN}/EARASERS_attenuation_tables.png`;

/* ─── Types ─── */
type Stat       = { value: string; label: string };
type Feature    = { icon: React.ReactNode; title: string; body: string };
type Filter     = { name: string; snr: string; db: string; desc: string; recommended?: boolean };
type Product    = { name: string; slug: string; size: string; price: string; original: string; rating: number; reviews: number; img: string; tag: string | null };
type Influencer = { name: string; role?: string; quote: string; img: string; handle?: string; };
type ReviewCard = { img: string; quote: string; name: string; year: number; };
type FaqItem    = { q: string; a: string; };

type CategoryConfig = {
  title: string;
  badge: string;
  heading: string;
  sub: string;
  theme: 'dark' | 'teal' | 'warm' | 'purple' | 'light';
  heroImg: string;
  stats: Stat[];
  features: Feature[];
  techHeading: string;
  techBody: string;
  techPoints: string[];
  filters: Filter[];
  quote: { text: string; author: string; role: string };
  products: Product[];
  /* optional rich sections */
  influencers?:     Influencer[];
  reviewCards?:     ReviewCard[];
  clinicNames?:     string[];
  chartImg?:        string;
  youtubeId?:       string;
  showCompareTable?: boolean;
  faq?:             FaqItem[];
};

/* ─── Category data ─── */
const CATEGORIES: Record<string, CategoryConfig> = {
  musician: {
    title: 'Music Earplugs',
    badge: 'For Musicians & Concert-goers',
    heading: 'Play louder.\nHear longer.',
    sub: 'Award-winning HiFi earplugs that protect your hearing without changing how music sounds. Used by professionals on stages worldwide.',
    theme: 'warm',
    heroImg: WADE_IMG,
    stats: [
      { value: '5×', label: 'MusicRadar Award Winner' },
      { value: 'Flat', label: 'Frequency response' },
      { value: '−19 dB', label: 'Peak attenuation' },
      { value: '3–6 mo', label: 'Filter lifespan' },
    ],
    features: [
      { icon: <MusicIcon size={28} />, title: 'Flat frequency response', body: 'Every frequency is reduced equally — bass, mids and highs all stay in balance. Music sounds like music, not like you\'re listening through a wall.' },
      { icon: <AwardIcon size={28} />, title: '5× MusicRadar Award Winner', body: 'Independently tested and awarded by MusicRadar.com every year since 2020. The most trusted earplug in the music industry.' },
      { icon: <RefreshIcon size={28} />, title: 'Replaceable filters', body: 'Filters last 3–6 months and can be swapped at home. No need to buy a whole new pair — just replace what wears out.' },
    ],
    techHeading: 'The science behind the sound',
    techBody: 'Standard foam earplugs block high frequencies more than low ones, making music sound muddy and muffled. The Earasers V-shaped filter reduces all frequencies equally — so you hear exactly the same mix, just at a safer volume.',
    techPoints: [
      'V-shaped filter targets 2–8 kHz danger zone equally across the spectrum',
      'Preserves the full dynamic range — details, nuance and the "feel" of the room stay intact',
      'Medical-grade silicone tip forms a passive seal without blocking ambient awareness completely',
      'No custom mould required — available in XS, S, M and L to fit any ear canal',
    ],
    chartImg: ATTEN,
    youtubeId: 'Zmj-jJi93q0',
    showCompareTable: true,
    influencers: [
      { name: 'WADE', role: 'DJ / Producer', quote: 'For comfortable earplugs to play with, I would choose Earasers for sure! Their perfect fit and superior noise reduction make them my top pick for any performance.', img: WADE_IMG, handle: 'wadedj' },
      { name: 'MASON COLLECTIVE', role: 'DJ Duo', quote: 'Earasers are the only earplugs we trust on stage and in the studio. Crystal clear sound, all night long.', img: MASON_IMG },
    ],
    filters: [
      { name: 'Light Filter', snr: 'SNR 14', db: '−19 dB peak', desc: 'Ideal for rehearsals, smaller venues and acoustic music where you still want full immersion.', recommended: false },
      { name: 'Standard Filter', snr: 'SNR 20', db: '−26 dB peak', desc: 'The sweet spot for most live music situations — concerts, band practice and festival stages.', recommended: true },
    ],
    quote: {
      text: '"I\'ve tried every earplug on the market. Earasers are the only ones where I can still hear what I\'m playing and have a proper conversation on stage between songs."',
      author: 'Daan V.',
      role: 'Professional guitarist — touring musician',
    },
    faq: [
      { q: 'Will I still hear the full mix on stage?', a: 'Yes. The V-filter preserves the natural frequency balance while reducing harmful peaks. Most musicians say Earasers sound more natural than wearing nothing at all.' },
      { q: 'Which filter level should I use for live concerts?', a: 'The −19 dB Comfort filter works well for most concerts and rehearsals. For loud festivals or front-of-stage positions, choose the −26 dB Standard filter.' },
      { q: 'How do I choose my size?', a: 'Use your earbud experience as a reference. If earbuds fall out easily, try XS or S. If they feel too tight, try M. When unsure, order the Small & Medium combo — you get both sizes and can keep the best fit.' },
      { q: 'Can I talk to bandmates without removing them?', a: 'Yes — the open canal design lets speech through naturally. No need to remove them between songs or during soundcheck conversations.' },
      { q: 'How do I clean them?', a: 'Rinse with warm water and mild soap. Dry completely before storing. Avoid alcohol or harsh solvents.' },
    ],
    products: [
      { name: 'Music Earplugs — Small',  slug: 'musician', size: 'S',    price: '€49,95', original: '€58,00', rating: 4.7, reviews: 1024, img: BASE, tag: 'Best Seller' },
      { name: 'Music Earplugs — Medium', slug: 'musician', size: 'M',    price: '€49,95', original: '€58,00', rating: 4.7, reviews: 876,  img: MINK, tag: null },
      { name: 'Music Earplugs — Large',  slug: 'musician', size: 'L',    price: '€49,95', original: '€58,00', rating: 4.6, reviews: 213,  img: BASE, tag: null },
      { name: 'S & M Starter Kit',       slug: 'musician', size: 'S+M',  price: '€54,95', original: '€69,00', rating: 4.8, reviews: 542,  img: KIT,  tag: 'Recommended' },
      { name: 'Perfect Size Kit',        slug: 'musician', size: 'XS–L', price: '€64,95', original: '€79,00', rating: 4.6, reviews: 198,  img: KIT,  tag: null },
      { name: 'Pro-Kit',                 slug: 'musician', size: 'Multi', price: '€79,00', original: '€99,00', rating: 4.9, reviews: 87,   img: MINK, tag: 'Premium' },
    ],
  },

  dj: {
    title: 'DJ Earplugs',
    badge: 'For DJs & Club Professionals',
    heading: 'Protect your edge.\nKeep your sound.',
    sub: 'Built for booth volumes, monitor wedges and festival stages. Maximum protection without losing the mix detail you need to perform.',
    theme: 'dark',
    heroImg: DJ_MAIN,
    stats: [
      { value: '110 dB+', label: 'Typical booth volume' },
      { value: '−31 dB', label: 'Max peak attenuation' },
      { value: 'Flat', label: 'Response — hear your mix' },
      { value: '3 filters', label: 'SNR 14 / 20 / 22' },
    ],
    features: [
      { icon: <HeadphonesIcon size={28} />, title: 'Hear your mix, not a wall of sound', body: 'Foam earplugs kill high-end detail and destroy cue-ability. Earasers keep the full frequency range flat so you can mix accurately all night.' },
      { icon: <ZapIcon size={28} />, title: 'Built for high SPL', body: 'Club monitors and festival rigs regularly hit 110+ dB. Choose SNR 20 for booth work or SNR 22 if you have existing tinnitus — flat attenuation either way.' },
      { icon: <ClockIcon size={28} />, title: 'All-night comfort', body: 'Medical-grade silicone adapts to your ear canal via body heat. No aching ears after a 6-hour set — just protection that you\'ll actually keep in.' },
    ],
    techHeading: 'Why flat attenuation matters in a booth',
    techBody: 'In a DJ booth, you need to hear every element of the track — the sub kick, the hi-hat pattern, the vocal frequency to cue correctly. Standard foam earplugs over-attenuate highs and leave bass untouched, destroying your mix reference. Earasers reduce everything equally.',
    techPoints: [
      'V-shaped filter reduces 2–8 kHz (the danger zone) while keeping lows and highs in proportion',
      '300 Hz vocal register preserved — you can still communicate with the crowd and fellow DJs',
      'Fits under headphones without pressure — compatible with standard DJ cans',
      'Low-profile silicone sleeve sits flush in the canal — no protruding stem to interfere with headphone cups',
    ],
    influencers: [
      { name: 'FRANKY RIZARDO', role: 'International DJ', quote: "I've found Earasers to be the most comfortable and clear-sounding ear protection I've used, and throughout my tours, I keep coming back to them.", img: FRANKY, handle: 'frankyr' },
      { name: 'WADE', role: 'DJ / Producer', quote: 'For comfortable earplugs to play with, I would choose Earasers for sure! Their perfect fit and superior noise reduction make them my top pick for any performance.', img: WADE_IMG, handle: 'wadedj' },
      { name: 'STEPHAN BODZIN', role: 'Electronic Music Producer', quote: 'This is definitely a game-changer.', img: BODZIN, handle: 'stephanbodzin' },
      { name: 'JOEY DANIEL', role: 'DJ / Producer', quote: "As a DJ, clarity is everything. Earasers deliver crystal clear sound while keeping my ears safe — I wouldn't use anything else.", img: JOEY, handle: 'joeydaniel_ofc' },
    ],
    filters: [
      { name: 'Light Filter', snr: 'SNR 14', db: '−19 dB peak', desc: 'For monitoring in smaller club booths or when you\'re used to higher SPL and want minimal reduction.' },
      { name: 'Standard DJ', snr: 'SNR 20', db: '−26 dB peak', desc: 'The recommended choice for most DJs. Covers the full range of club, festival and warehouse volumes.', recommended: true },
      { name: 'Tinnitus Guard', snr: 'SNR 22', db: '−31 dB peak', desc: 'Maximum protection for DJs with existing tinnitus or those playing extremely loud open-air stages.' },
    ],
    quote: {
      text: '"I spent years wearing foam earplugs and hating every second because I couldn\'t hear my mix properly. Earasers changed everything — I can actually feel the music and hear what I\'m doing."',
      author: 'Thijs R.',
      role: 'Resident DJ — Amsterdam club circuit',
    },
    faq: [
      { q: 'How do I insert my Earasers Earplugs?', a: 'Insert the earplug with the stem pointing down. Pull your ear up and back to open the canal, then gently twist and push until it seats properly.' },
      { q: 'Will they fit?', a: 'Earasers come in 4 sizes (XS, S, M, L) and 3 combo packs. Most DJs use Small or Medium. When unsure, order the Small & Medium combo so you can find your perfect fit.' },
      { q: 'Can I wear them during a full DJ set?', a: 'Yes — the open canal design means you won\'t feel "plugged up". Many DJs wear them for 6+ hour sets comfortably.' },
      { q: 'Which filter level is right for a DJ booth?', a: 'The −31 dB Max filter is designed for DJ booths and club volumes. The −26 dB Standard filter works well for smaller venues.' },
      { q: 'How long do Earasers last?', a: 'With normal use and proper care, filters last 3–6 months. Replacement filters are available separately — no need to buy a whole new pair.' },
    ],
    products: [
      { name: 'DJ Earplugs — Small',  slug: 'dj', size: 'S',   price: '€49,95', original: '€58,00', rating: 4.8, reviews: 312, img: DJ_MAIN, tag: null },
      { name: 'DJ Earplugs — Medium', slug: 'dj', size: 'M',   price: '€49,95', original: '€58,00', rating: 4.8, reviews: 289, img: DJ_MAIN, tag: 'Best Seller' },
      { name: 'DJ Earplugs — Large',  slug: 'dj', size: 'L',   price: '€49,95', original: '€58,00', rating: 4.7, reviews: 104, img: DJ_MAIN, tag: null },
      { name: 'DJ S & M Starter Kit', slug: 'dj', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.9, reviews: 156, img: KIT,    tag: 'Recommended' },
    ],
  },

  dentist: {
    title: 'Dentist & Hygienist Earplugs',
    badge: 'For Dental Professionals',
    heading: 'Block the drill.\nHear your patient.',
    sub: 'Precision hearing protection designed for the dental practice. Block harmful scaler and drill noise while keeping patient communication crystal clear.',
    theme: 'teal',
    heroImg: DENT1,
    stats: [
      { value: '2–8 kHz', label: 'Scaler / drill danger zone' },
      { value: '250–300 Hz', label: 'Patient voice — preserved' },
      { value: 'All day', label: 'Smart Seal comfort' },
      { value: 'No mould', label: 'Instant fit, 4 sizes' },
    ],
    features: [
      { icon: <ToothIcon size={28} />, title: 'Block scaler & drill noise', body: 'Ultrasonic scalers produce consistent high-frequency noise at 2–8 kHz — the exact frequency range that causes the most cochlear damage with daily exposure.' },
      { icon: <MessageCircleIcon size={28} />, title: 'Keep patient communication', body: 'The V-shaped filter preserves the 250–300 Hz range where human speech sits. You stay fully protected from tools while hearing every word your patient says.' },
      { icon: <EarIcon size={28} />, title: 'No custom ear mould needed', body: 'Earasers use medical-grade silicone tips based on hearing aid technology. They conform to your ear canal via body heat — available in XS, S, M and L.' },
    ],
    techHeading: 'The hearing risk nobody talks about',
    techBody: 'Studies show dental professionals lose measurable hearing after just 5 years in practice. Ultrasonic scalers, high-speed handpieces and suction units all emit continuous noise in the 2–8 kHz range — the most sensitive part of the human cochlea. Standard foam earplugs block patient communication. Earasers solve both problems.',
    techPoints: [
      'Scaler and drill frequencies (2–8 kHz) are attenuated by −19 dB or −26 dB depending on filter choice',
      'Voice frequencies (250–300 Hz) are preserved — patient instructions remain audible',
      'Smart Seal silicone tip can be worn for a full 8-hour shift without discomfort',
      'Contamination risk reduced — earplugs stay in throughout treatment, no repeated removal',
    ],
    reviewCards: [
      { img: DENT1, quote: 'I depend on clear speech understanding. These earplugs reduce only the damaging frequencies, so I can still hear my assistant and patients perfectly. Our full team uses them now.', name: 'Dr. M. Richards', year: 2025 },
      { img: DENT2, quote: 'Very happy with the earplugs. Very comfortable and it made my workday so much more relaxed.', name: 'Brummans & Fa Dentists', year: 2025 },
      { img: DENT3, quote: 'Clear sound, less fatigue. These earplugs take the edge off the high-pitched noise without isolating me from patients.', name: 'Dr. A. Vermeer', year: 2025 },
      { img: DENT4, quote: 'Lightweight, effective, and easy to wear all day. These earplugs have become part of my daily routine.', name: 'Dr. K. Maktur', year: 2025 },
      { img: DENT5, quote: 'I never expected earplugs to make such a big difference. I still hear everything clear, but by the end of the day, I feel noticeably more energy.', name: 'Dr. Shad Faraj', year: 2026 },
    ],
    influencers: [
      { name: 'Brummans & Fa Dentists', role: 'Dental Practice', quote: "I'm very happy to be able to work with these earplugs. They make my workday much more comfortable and relaxing.", img: DENT2 },
      { name: 'Resmile Dentistry', role: 'Dr. Shad Faraj', quote: "I never expected earplugs to make such a big difference. I still hear everything clear, but by the end of the day, I feel noticeably more energy.", img: DENT3 },
    ],
    clinicNames: ['Vidveer', 'Lassus Tandartsen', 'DC Clinics', 'Mondarts Alkmaar', 'Resmile Dentistry', 'Mondzorg', 'TOED'],
    filters: [
      { name: 'Gentle Standard', snr: 'SNR 14', db: '−19 dB peak', desc: 'For professionals who work in quieter practices or want to ease into wearing protection. Everyday dental environments.' },
      { name: 'Clinical Balance', snr: 'SNR 20', db: '−26 dB peak', desc: 'Recommended for hygienists and dentists using ultrasonic scalers or high-speed handpieces daily.', recommended: true },
    ],
    quote: {
      text: '"After 10 years of scaling without protection I had measurable high-frequency hearing loss. I\'ve been wearing Earasers every shift for the past two years and my audiologist says my hearing has stabilised."',
      author: 'Annelies B.',
      role: 'Dental hygienist — 12 years in practice',
    },
    faq: [
      { q: 'Will I still be able to hear my patients clearly?', a: 'Yes. The V-filter reduces harmful high-frequency noise (like the handpiece drill) while preserving speech frequencies (250–300 Hz). You can hold a normal conversation without removing them.' },
      { q: 'Are these suitable for hygienists using ultrasonic scalers?', a: 'Absolutely. The −19 dB Comfort filter is ideal for hygienists — it reduces scaler noise without muffling patient communication. The −26 dB Standard is available for the noisiest procedures.' },
      { q: 'Which filter level do you recommend for dentists?', a: 'Most dentists use the −19 dB Comfort filter for a full workday. The −26 dB Standard suits the loudest procedures (high-speed handpieces, turbines).' },
      { q: 'Can I wear them all day without discomfort?', a: 'Yes — medical-grade silicone conforms to your canal shape via body heat. Many dental professionals wear them for full 8-hour workdays without removing them between patients.' },
      { q: 'Is there scientific evidence for hearing damage in dentistry?', a: 'Yes — multiple independent studies show dental professionals face consistent exposure to noise at damaging levels, primarily from scalers and high-speed handpieces.' },
    ],
    products: [
      { name: 'Dentist Earplugs — Small',  slug: 'dentist', size: 'S',   price: '€49,95', original: '€58,00', rating: 4.6, reviews: 198, img: BASE, tag: null },
      { name: 'Dentist Earplugs — Medium', slug: 'dentist', size: 'M',   price: '€49,95', original: '€58,00', rating: 4.6, reviews: 174, img: MINK, tag: 'Best Seller' },
      { name: 'Dentist Earplugs — Large',  slug: 'dentist', size: 'L',   price: '€49,95', original: '€58,00', rating: 4.5, reviews: 62,  img: BASE, tag: null },
      { name: 'Dentist S & M Kit',         slug: 'dentist', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.7, reviews: 89,  img: KIT,  tag: 'Recommended' },
    ],
  },

  sleeping: {
    title: 'Sleep Earplugs',
    badge: 'For Better Sleep',
    heading: 'Quiet nights.\nRested mornings.',
    sub: 'Soft, barely-there earplugs designed for sleeping. Block snoring, traffic and city noise without the discomfort of foam that falls out at 3am.',
    theme: 'purple',
    heroImg: KIT,
    stats: [
      { value: '−19 dB', label: 'Ambient noise reduction' },
      { value: 'Flush fit', label: 'Comfortable on your side' },
      { value: 'Washable', label: 'Reusable, hygienic' },
      { value: '3–6 mo', label: 'Filter lifespan' },
    ],
    features: [
      { icon: <MoonIcon size={28} />, title: 'Stay in all night', body: 'The low-profile silicone tip sits flush in your ear canal so you can sleep on your side without pressure or discomfort. No more waking up with sore ears.' },
      { icon: <WaveIcon size={28} />, title: 'Block snoring & traffic', body: 'Earasers reduce ambient noise by up to −19 dB — enough to take the edge off a snoring partner or a noisy street without blocking everything out completely.' },
      { icon: <RefreshIcon size={28} />, title: 'Reusable & hygienic', body: 'Unlike disposable foam, Earasers are washable and long-lasting. The replaceable filter keeps them hygienic for months of nightly use.' },
    ],
    techHeading: 'Why foam keeps failing you',
    techBody: 'Foam earplugs expand unevenly, create pressure in your ear canal and fall out when you move. Earasers use medical-grade silicone that moulds gently to your ear via body heat — no pressure, no movement, no 3am fumbling for a plug that\'s fallen onto your pillow.',
    techPoints: [
      'Low-profile design sits below the outer ear — comfortable on either side all night',
      '−19 dB reduction takes the edge off snoring and traffic without fully blocking alarm sounds',
      'Medical-grade hypoallergenic silicone — safe for nightly use without skin irritation',
      'Washable and reusable — far less waste than disposable foam, much lower long-term cost',
    ],
    filters: [
      { name: 'Sleep Filter', snr: 'SNR 14', db: '−19 dB peak', desc: 'The standard sleep filter. Reduces snoring, traffic and ambient room noise to a manageable level.', recommended: true },
    ],
    quote: {
      text: '"My partner snores like a freight train. I\'ve tried every foam earplug and always end up with sore ears or losing them in the night. Earasers are the first ones I\'ve actually kept wearing."',
      author: 'Marieke D.',
      role: 'Verified buyer — Amsterdam',
    },
    faq: [
      { q: 'Will I still hear my alarm?', a: 'Yes — −19 dB reduces volume but does not block sound completely. Phone alarms at normal volume remain audible.' },
      { q: 'Can I sleep on my side with them in?', a: 'Yes. The low-profile flush design was specifically chosen for side sleepers. There is no protruding stem to cause pressure against a pillow.' },
      { q: 'How do I keep them hygienic for nightly use?', a: 'Rinse with warm water and mild soap after use. Dry completely before placing back in the case. Replace the filter every 3–6 months.' },
    ],
    products: [
      { name: 'Sleep Earplugs — Small',  slug: 'sleeping', size: 'S',   price: '€49,95', original: '€58,00', rating: 4.5, reviews: 432, img: BASE, tag: 'Best Seller' },
      { name: 'Sleep Earplugs — Medium', slug: 'sleeping', size: 'M',   price: '€49,95', original: '€58,00', rating: 4.5, reviews: 381, img: MINK, tag: null },
      { name: 'Sleep Earplugs — Large',  slug: 'sleeping', size: 'L',   price: '€49,95', original: '€58,00', rating: 4.4, reviews: 117, img: BASE, tag: null },
      { name: 'Sleep S & M Kit',         slug: 'sleeping', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.6, reviews: 203, img: KIT,  tag: 'Recommended' },
    ],
  },

  motorsport: {
    title: 'Motorsport Earplugs',
    badge: 'For Riders & Drivers',
    heading: 'Wind off.\nFocus on.',
    sub: 'Block wind roar, engine noise and track chaos while keeping your intercom, GPS and co-driver communication clear. Built for the ride.',
    theme: 'dark',
    heroImg: BASE,
    stats: [
      { value: '85 dB+', label: 'Wind noise at motorway speed' },
      { value: '−26 dB', label: 'Peak attenuation' },
      { value: 'Slim fit', label: 'Under any helmet' },
      { value: '300 Hz', label: 'Intercom voice preserved' },
    ],
    features: [
      { icon: <HelmetIcon size={28} />, title: 'Kill wind roar', body: 'Wind noise at motorway speeds hits 85–95 dB inside a helmet — a serious long-term hearing hazard. Earasers dramatically reduce this constant broadband roar.' },
      { icon: <RadioIcon size={28} />, title: 'Intercom compatible', body: 'The slim, low-profile design fits comfortably under a helmet and doesn\'t interfere with Bluetooth intercom earpieces or in-ear headsets.' },
      { icon: <CogIcon size={28} />, title: 'All-day comfort', body: 'Long-distance rides and race days demand hours of wear. Medical-grade silicone adapts to your ear canal — no pressure buildup, no discomfort after 500 km.' },
    ],
    techHeading: 'The hidden hearing hazard in your helmet',
    techBody: 'Wind turbulence inside a motorcycle helmet generates broadband noise from 85–105 dB depending on speed. Over years of riding this causes progressive high-frequency hearing loss — the same pattern seen in factory workers. Unlike foam plugs, Earasers keep hazard sounds and intercom audio audible while cutting the harmful roar.',
    techPoints: [
      '85–95 dB wind noise at 100 km/h — Earasers reduce this to safe exposure levels',
      '300 Hz vocal preservation means intercom audio, GPS directions and co-driver calls stay clear',
      'Slim profile fits inside most full-face and open-face helmets without discomfort',
      'Compatible with in-ear Bluetooth intercom systems and standard earbud-style setups',
    ],
    filters: [
      { name: 'Light Ride', snr: 'SNR 14', db: '−19 dB peak', desc: 'For city riding and shorter trips where you want awareness of traffic sounds and hazards.' },
      { name: 'Long Haul', snr: 'SNR 20', db: '−26 dB peak', desc: 'The recommended choice for motorway and touring rides. Covers sustained highway wind noise exposure.', recommended: true },
    ],
    quote: {
      text: '"After a 1,200 km tour through France I used to have ringing ears for days. With Earasers I arrived home feeling completely fine — and I could still hear my intercom perfectly the whole way."',
      author: 'Stefan K.',
      role: 'Touring rider — 20+ years on the road',
    },
    products: [
      { name: 'Motorsport Earplugs — Small',  slug: 'motorsport', size: 'S',   price: '€49,95', original: '€58,00', rating: 4.7, reviews: 156, img: BASE, tag: null },
      { name: 'Motorsport Earplugs — Medium', slug: 'motorsport', size: 'M',   price: '€49,95', original: '€58,00', rating: 4.7, reviews: 134, img: MINK, tag: 'Best Seller' },
      { name: 'Motorsport Earplugs — Large',  slug: 'motorsport', size: 'L',   price: '€49,95', original: '€58,00', rating: 4.6, reviews: 48,  img: BASE, tag: null },
      { name: 'Motorsport S & M Kit',         slug: 'motorsport', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.8, reviews: 72,  img: KIT,  tag: 'Recommended' },
    ],
  },

  sensitivity: {
    title: 'Noise Sensitivity Earplugs',
    badge: 'For Autism, ADHD & Hyperacusis',
    heading: 'Calm your senses.\nStay present.',
    sub: 'Designed for people with noise sensitivity, hyperacusis, autism or ADHD. Take the edge off overwhelming environments without cutting yourself off from the world.',
    theme: 'light',
    heroImg: BASE,
    stats: [
      { value: '−19 dB', label: 'Gentle ambient reduction' },
      { value: 'Flat', label: 'Natural sound character' },
      { value: 'Discreet', label: 'Nearly invisible' },
      { value: 'Daily use', label: 'Hypoallergenic silicone' },
    ],
    features: [
      { icon: <EarIcon size={28} />, title: 'Gentle, not total', body: 'Total sound blocking can feel disorienting. Earasers gently lower the volume of the world while keeping you aware of your surroundings and able to have conversations.' },
      { icon: <HeartIcon size={28} />, title: 'Trusted by the neurodivergent community', body: 'Many people with autism, ADHD and sensory processing differences use Earasers daily — at work, on transport, in busy shops and social settings.' },
      { icon: <EyeOffIcon size={28} />, title: 'Discreet & comfortable', body: 'Nearly invisible when worn. Soft silicone is hypoallergenic and gentle enough for extended daily wear without irritation or pressure.' },
    ],
    techHeading: 'Gentle reduction, not total isolation',
    techBody: 'For people with hyperacusis or sensory sensitivity, total sound blocking can increase anxiety rather than reduce it. The Earasers SNR 14 filter reduces overall volume by −19 dB while keeping the natural character of sound intact — voices still sound like voices, music still sounds like music.',
    techPoints: [
      'Flat −19 dB reduction: the world sounds the same, just quieter and less overwhelming',
      'Voices remain clear — you can still hold conversations in busy environments',
      'Hypoallergenic medical-grade silicone — no latex, no irritants, safe for all-day wear',
      'Nearly invisible when worn — no social stigma of visible ear defenders',
    ],
    filters: [
      { name: 'Sensitivity Filter', snr: 'SNR 14', db: '−19 dB peak', desc: 'The only filter we recommend for daily sensitivity use. Gentle, flat reduction that keeps the world accessible.', recommended: true },
    ],
    quote: {
      text: '"I have hyperacusis and couldn\'t go to a supermarket without a headache. Earasers let me live a normal life again. I wear them every single day."',
      author: 'Lena M.',
      role: 'Hyperacusis — daily Earasers user',
    },
    products: [
      { name: 'Sensitivity Earplugs — Small',  slug: 'sensitivity', size: 'S',   price: '€49,95', original: '€58,00', rating: 4.8, reviews: 287, img: BASE, tag: 'Best Seller' },
      { name: 'Sensitivity Earplugs — Medium', slug: 'sensitivity', size: 'M',   price: '€49,95', original: '€58,00', rating: 4.8, reviews: 241, img: MINK, tag: null },
      { name: 'Sensitivity Earplugs — Large',  slug: 'sensitivity', size: 'L',   price: '€49,95', original: '€58,00', rating: 4.7, reviews: 89,  img: BASE, tag: null },
      { name: 'Sensitivity S & M Kit',         slug: 'sensitivity', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.9, reviews: 118, img: KIT,  tag: 'Recommended' },
    ],
  },
};

/* ─── Sort options ─── */
const sortOptions = ['Featured', 'Price: low to high', 'Price: high to low', 'Best rated'];

/* ─── Sub-components ─── */
const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  return (
    <div className={styles.stars}>
      {Array.from({ length: full },     (_, i) => <StarIcon      key={`f${i}`} size={13} className={styles.starFull} />)}
      {Array.from({ length: 5 - full }, (_, i) => <StarEmptyIcon key={`e${i}`} size={13} className={styles.starEmpty} />)}
    </div>
  );
};

const FaqAccordion = ({ items }: { items: FaqItem[] }) => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className={styles.faqWrap}>
      {items.map((item, i) => (
        <div key={i} className={styles.faqItem}>
          <button
            className={styles.faqBtn}
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.q}
            <span className={`${styles.faqChevron} ${open === i ? styles.faqChevronOpen : ''}`}>▾</span>
          </button>
          {open === i && (
            <div className={styles.faqBody}>
              <p>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ReviewScroll = ({ cards }: { cards: ReviewCard[] }) => (
  <div className={styles.reviewScrollOuter}>
    <div className={styles.reviewScrollTrack}>
      {cards.map((c, i) => (
        <div key={i} className={styles.reviewCard}>
          <div className={styles.reviewCardImg}>
            <img src={c.img} alt={c.name} loading="lazy" />
          </div>
          <div className={styles.reviewCardBody}>
            <div className={styles.reviewCardStars}>★★★★★</div>
            <p className={styles.reviewCardQuote}>"{c.quote}"</p>
            <p className={styles.reviewCardAttrib}>— {c.name}, {c.year}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const InfluencerSplit = ({ influencer, reversed }: { influencer: Influencer; reversed: boolean }) => (
  <div className={`${styles.influencerSplit} ${reversed ? styles.influencerSplitReversed : ''}`}>
    <div className={styles.influencerImg}>
      <img src={influencer.img} alt={influencer.name} loading="lazy" />
    </div>
    <div className={styles.influencerContent}>
      {influencer.role && <p className={styles.influencerLabel}>{influencer.role}</p>}
      <h2 className={styles.influencerName}>{influencer.name}</h2>
      <p className={styles.influencerQuote}>"{influencer.quote}"</p>
      {influencer.handle && (
        <a
          href={`https://instagram.com/${influencer.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.influencerBtn}
        >
          Instagram: @{influencer.handle} →
        </a>
      )}
    </div>
  </div>
);

const ClinicMarquee = ({ names }: { names: string[] }) => (
  <div className={styles.clinicMarquee}>
    <p className={styles.clinicMarqueeLabel}>Trusted by professionals across Europe</p>
    <div className={styles.clinicMarqueeTrack}>
      {[...names, ...names].map((n, i) => (
        <span key={i} className={styles.clinicMarqueeItem} aria-hidden={i >= names.length}>
          {n}
        </span>
      ))}
    </div>
  </div>
);

/* ─── Main page ─── */
const CollectionPage: NextPage = () => {
  const router = useRouter();
  const [sort, setSort] = useState(0);

  const slug = typeof router.query.slug === 'string' ? router.query.slug : 'musician';
  const cat  = CATEGORIES[slug] ?? CATEGORIES.musician;

  const sorted = [...cat.products].sort((a, b) => {
    const pa = parseFloat(a.price.replace('€', '').replace(',', '.'));
    const pb = parseFloat(b.price.replace('€', '').replace(',', '.'));
    if (sort === 1) return pa - pb;
    if (sort === 2) return pb - pa;
    if (sort === 3) return b.rating - a.rating;
    return 0;
  });

  const heroClass = {
    dark:   styles.heroDark,
    teal:   styles.heroTeal,
    warm:   styles.heroWarm,
    purple: styles.heroPurple,
    light:  styles.hero,
  }[cat.theme];

  const isDark = cat.theme !== 'light';

  return (
    <Layout>
      <div className={styles.page}>

        {/* ── Hero ── */}
        <div className={heroClass}>
          <div className="container">
            <nav className={styles.breadcrumb}>
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/collection">Shop</Link>
              <span>/</span>
              <span>{cat.title}</span>
            </nav>
            <div className={styles.heroInner}>
              <div className={styles.heroText}>
                <p className={styles.badge}>{cat.badge}</p>
                <h1 className={`${styles.heading} ${isDark ? styles.headingLight : ''}`}>
                  {cat.heading.split('\n').map((line, i) => (
                    <React.Fragment key={i}>{line}{i < cat.heading.split('\n').length - 1 && <br />}</React.Fragment>
                  ))}
                </h1>
                <p className={`${styles.sub} ${isDark ? styles.subLight : ''}`}>{cat.sub}</p>
                <a href="#products" className={styles.heroBtn}>Shop now →</a>
              </div>
              <div className={styles.heroImgWrap}>
                <Image src={cat.heroImg} alt={cat.title} width={400} height={400} className={styles.heroImg} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrolling review cards (dentist) ── */}
        {cat.reviewCards && (
          <ReviewScroll cards={cat.reviewCards} />
        )}

        {/* ── Stats strip ── */}
        <div className={styles.statsStrip}>
          <div className="container">
            <div className={styles.statsGrid}>
              {cat.stats.map((s, i) => (
                <div key={i} className={styles.statItem}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Features ── */}
        <div className={styles.features}>
          <div className="container">
            <div className={styles.featuresGrid}>
              {cat.features.map((f, i) => (
                <div key={i} className={styles.featureCard}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureBody}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Attenuation chart (musician) ── */}
        {cat.chartImg && (
          <div className={styles.attenSection}>
            <div className="container">
              <div className={styles.attenGrid}>
                <div className={styles.attenText}>
                  <p className={styles.attenEyebrow}>Patented Filter Technology</p>
                  <h2 className={styles.attenHeading}>How the filter works</h2>
                  <p className={styles.attenBody}>The V-filter reduces the most damaging frequencies (around 3,150 Hz) while leaving the natural musical range intact. Unlike flat-attenuating earplugs, Earasers sound clear — not "underwater". You'll hear every note, just safer.</p>
                  <ul className={styles.attenPoints}>
                    <li>Open canal design → no plugged-up feeling</li>
                    <li>Medical-grade silicone → custom fit to your ear</li>
                    <li>Virtually invisible → no one knows they're in</li>
                    <li>Replaceable filter → extend life by swapping just the filter</li>
                  </ul>
                </div>
                <div className={styles.attenImgWrap}>
                  <img src={cat.chartImg} alt="Earasers attenuation chart" loading="lazy" className={styles.attenImg} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Compare table (musician) ── */}
        {cat.showCompareTable && (
          <div className={styles.compareSection}>
            <div className="container">
              <div className={styles.compareSectionHead}>
                <h2 className={styles.compareHeading}>Earasers vs the alternatives</h2>
                <p className={styles.compareSub}>Custom moulded earplugs cost €200–400 and take weeks. Earasers give you the same flat-response HiFi protection for €49,95.</p>
              </div>
              <div className={styles.compareTableWrap}>
                <table className={styles.compareTable}>
                  <thead>
                    <tr>
                      <th></th>
                      <th className={styles.compareColUs}>Earasers</th>
                      <th>Custom Molds</th>
                      <th>Budget Plugs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Price</td><td className={styles.compareColUs}>€49,95</td><td>€199+</td><td>€5–15</td></tr>
                    <tr><td>Audiologist required</td><td className={styles.compareColUs}><span className={styles.crossMark}>✗</span></td><td><span className={styles.checkMark}>✓</span></td><td><span className={styles.crossMark}>✗</span></td></tr>
                    <tr><td>Delivery</td><td className={styles.compareColUs}>2–3 days</td><td>3–6 weeks</td><td>Next day</td></tr>
                    <tr><td>Virtually invisible</td><td className={styles.compareColUs}><span className={styles.checkMark}>✓</span></td><td><span className={styles.checkMark}>✓</span></td><td><span className={styles.crossMark}>✗</span></td></tr>
                    <tr><td>Clear, natural sound</td><td className={styles.compareColUs}><span className={styles.checkMark}>✓</span></td><td><span className={styles.crossMark}>✗</span></td><td><span className={styles.crossMark}>✗</span></td></tr>
                    <tr><td>Replaceable filter</td><td className={styles.compareColUs}><span className={styles.checkMark}>✓</span></td><td><span className={styles.crossMark}>✗</span></td><td><span className={styles.crossMark}>✗</span></td></tr>
                    <tr><td>Award-winning</td><td className={styles.compareColUs}><span className={styles.checkMark}>✓</span></td><td><span className={styles.crossMark}>✗</span></td><td><span className={styles.crossMark}>✗</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Technology section ── */}
        <div className={styles.techSection}>
          <div className="container">
            <div className={styles.techInner}>
              <div className={styles.techText}>
                <h2 className={styles.techHeading}>{cat.techHeading}</h2>
                <p className={styles.techBody}>{cat.techBody}</p>
              </div>
              <ul className={styles.techPoints}>
                {cat.techPoints.map((p, i) => (
                  <li key={i} className={styles.techPoint}>
                    <span className={styles.techCheck}>✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Filter guide ── */}
        <div className={styles.filtersSection}>
          <div className="container">
            <h2 className={styles.filtersSectionHeading}>Choose your filter</h2>
            <p className={styles.filtersSectionSub}>Not sure which strength to pick? Start with the recommended option — you can always swap filters later.</p>
            <div className={styles.filtersGrid}>
              {cat.filters.map((f, i) => (
                <div key={i} className={`${styles.filterCard} ${f.recommended ? styles.filterCardRecommended : ''}`}>
                  {f.recommended && <span className={styles.filterBadge}>Recommended</span>}
                  <div className={styles.filterDb}>{f.db}</div>
                  <div className={styles.filterSnr}>{f.snr}</div>
                  <div className={styles.filterName}>{f.name}</div>
                  <p className={styles.filterDesc}>{f.desc}</p>
                  <a href="#products" className={styles.filterCta}>Shop this filter →</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── YouTube size guide (musician) ── */}
        {cat.youtubeId && (
          <div className={styles.videoSection}>
            <div className="container">
              <div className={styles.videoSectionInner}>
                <p className={styles.videoEyebrow}>Find Your Fit</p>
                <h2 className={styles.videoHeading}>Not sure which size?</h2>
                <p className={styles.videoSub}>Ear canal size doesn't correlate with height, weight or gender. Watch this short video to find your perfect fit:</p>
                <div className={styles.videoWrap}>
                  <iframe
                    src={`https://www.youtube.com/embed/${cat.youtubeId}`}
                    title="How to find your Earasers size"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <p className={styles.videoNote}>Still unsure? Order the <strong>Small & Medium combo</strong> — the most popular choice for first-time buyers. 30-day size exchange guaranteed.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Influencer / doctor splits ── */}
        {cat.influencers && cat.influencers.length > 0 && (
          <div className={styles.influencerSection}>
            <div className={styles.influencerSectionLabel}>
              <span>Testimonials</span>
            </div>
            {cat.influencers.map((inf, i) => (
              <InfluencerSplit key={i} influencer={inf} reversed={i % 2 !== 0} />
            ))}
          </div>
        )}

        {/* ── Clinic name marquee (dentist) ── */}
        {cat.clinicNames && (
          <ClinicMarquee names={cat.clinicNames} />
        )}

        {/* ── Pull quote ── */}
        <div className={styles.quoteSection}>
          <div className="container">
            <div className={styles.quoteInner}>
              <div className={styles.quoteStars}>★★★★★</div>
              <blockquote className={styles.quoteText}>{cat.quote.text}</blockquote>
              <p className={styles.quoteAuthor}><strong>{cat.quote.author}</strong> · {cat.quote.role}</p>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        {cat.faq && cat.faq.length > 0 && (
          <div className={styles.faqSection}>
            <div className="container">
              <h2 className={styles.faqSectionHeading}>Frequently Asked Questions</h2>
              <FaqAccordion items={cat.faq} />
            </div>
          </div>
        )}

        {/* ── Products ── */}
        <div className="container" id="products" style={{ paddingTop: '56px' }}>
          <div className={styles.toolbar}>
            <p className={styles.count}>{cat.products.length} products</p>
            <div className={styles.sortWrap}>
              <label htmlFor="sort" className={styles.sortLabel}>Sort by</label>
              <select
                id="sort"
                className={styles.sortSelect}
                value={sort}
                onChange={e => setSort(Number(e.target.value))}
              >
                {sortOptions.map((o, i) => <option key={i} value={i}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.grid}>
            {sorted.map(p => (
              <Link key={p.name} href={`/product?slug=${p.slug}`} className={styles.card}>
                <div className={styles.imgWrap}>
                  <Image src={p.img} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  {p.tag && <span className={styles.tag}>{p.tag}</span>}
                </div>
                <div className={styles.info}>
                  <p className={styles.name}>{p.name}</p>
                  <div className={styles.ratingRow}>
                    <Stars rating={p.rating} />
                    <span className={styles.ratingCount}>({p.reviews})</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{p.price}</span>
                    <span className={styles.priceCrossed}>{p.original}</span>
                  </div>
                  <span className={styles.cta}>
                    Choose options <ArrowRightIcon size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default CollectionPage;
