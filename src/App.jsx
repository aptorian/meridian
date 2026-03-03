import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "./supabase";

const DEFAULT_HOURS_START = 6;
const DEFAULT_HOURS_END = 22;
const SLOT_MINUTES = 15;
const STORAGE_KEY = "timeblock-blocks";
const NOTES_KEY = "timeblock-notes";
const MUTE_KEY = "timeblock-muted";
const TAGS_KEY = "timeblock-tags";

const COLORS = [
  { bg: "#D4878F", lightBg: "#E8B5BA", name: "rose" },
  { bg: "#C9A87C", lightBg: "#DCC4A3", name: "sand" },
  { bg: "#E8B54D", lightBg: "#F0D08A", name: "amber" },
  { bg: "#7BAE7F", lightBg: "#A8CDA9", name: "sage" },
  { bg: "#6BA8A0", lightBg: "#9EC5BF", name: "teal" },
  { bg: "#7A9BBF", lightBg: "#A8BDD6", name: "steel" },
  { bg: "#9B8EC0", lightBg: "#BCB2D6", name: "plum" },
  { bg: "#C4849B", lightBg: "#D9AAB9", name: "mauve" },
];

const THEME_KEY = "timeblock-theme";

const THEMES = {
  light: {
    isInk: false,
    bgLocked: "#f0e8df",
    bgEdit: "#ebe3d9",
    timelineBg: "rgba(0,0,0,0.03)",
    timelineBorder: "1px solid rgba(0,0,0,0.08)",
    dateText: "rgba(75,55,40,0.65)",
    dateTextEdit: "rgba(75,55,40,0.7)",
    hourLabel: "rgba(75,55,40,0.45)",
    hourLabelEdit: "rgba(75,55,40,0.45)",
    hoverPlus: "rgba(75,55,40,0.4)",
    deleteX: "rgba(75,55,40,0.7)",
    inputText: "rgba(60,40,25,0.95)",
    caretColor: "#3b3228",
    blockLabelText: "rgba(60,40,25,0.95)",
    timeRangeText: "rgba(75,55,40,0.65)",
    hintText: "rgba(75,55,40,0.35)",
    blockInsetHighlight: "rgba(255,255,255,0.3)",
    blockEditShadow: "0 1px 4px rgba(0,0,0,0.12)",
    handleColor: "rgba(0,0,0,0.15)",
    deleteBtnBg: "rgba(0,0,0,0.1)",
    gridLineBg: "rgba(0,0,0,0.05)",
    gridLineBorder: "1px dashed rgba(0,0,0,0.08)",
    hoverIndicatorBg: "rgba(0,0,0,0.05)",
    hoverIndicatorBorder: "1px dashed rgba(0,0,0,0.15)",
    progressRingLocked: "#7BAE7F",
    progressRingUnlocked: "#D4878F",
    lockStrokeLocked: "rgba(75,55,40,0.4)",
    lockStrokeUnlocked: "#7BAE7F",
    timeMarkerLocked: "rgba(200,80,80,0.7)",
    timeMarkerEdit: "rgba(200,80,80,0.4)",
    timeMarkerDotLocked: "#c85050",
    timeMarkerDotEdit: "rgba(200,80,80,0.5)",
    timeMarkerGlow: "0 0 8px rgba(200,80,80,0.3)",
    toggleIcon: "rgba(75,55,40,0.4)",
    toggleHoverBg: "rgba(0,0,0,0.06)",
    noteBg: "rgba(0,0,0,0.02)",
    noteText: "#3b3228",
    notePlaceholder: "rgba(75,55,40,0.45)",
    noteBorder: "rgba(75,55,40,0.1)",
    quoteMuted: "rgba(75,55,40,0.72)",
  },
  dark: {
    isInk: false,
    bgLocked: "#1a1a1e",
    bgEdit: "#1e1e24",
    timelineBg: "rgba(255,255,255,0.02)",
    timelineBorder: "1px solid rgba(255,255,255,0.06)",
    dateText: "rgba(255,255,255,0.4)",
    dateTextEdit: "rgba(255,255,255,0.6)",
    hourLabel: "rgba(255,255,255,0.2)",
    hourLabelEdit: "rgba(255,255,255,0.35)",
    hoverPlus: "rgba(255,255,255,0.4)",
    deleteX: "rgba(255,255,255,0.7)",
    inputText: "rgba(255,255,255,0.95)",
    caretColor: "white",
    blockLabelText: "rgba(255,255,255,0.95)",
    timeRangeText: "rgba(255,255,255,0.5)",
    hintText: "rgba(255,255,255,0.15)",
    blockInsetHighlight: "rgba(255,255,255,0.15)",
    blockEditShadow: "0 1px 4px rgba(0,0,0,0.2)",
    handleColor: "rgba(0,0,0,0.2)",
    deleteBtnBg: "rgba(0,0,0,0.15)",
    gridLineBg: "rgba(255,255,255,0.04)",
    gridLineBorder: "1px dashed rgba(255,255,255,0.06)",
    hoverIndicatorBg: "rgba(255,255,255,0.08)",
    hoverIndicatorBorder: "1px dashed rgba(255,255,255,0.2)",
    progressRingLocked: "#7BAE7F",
    progressRingUnlocked: "#D4878F",
    lockStrokeLocked: "rgba(255,255,255,0.4)",
    lockStrokeUnlocked: "#7BAE7F",
    timeMarkerLocked: "rgba(255,100,100,0.8)",
    timeMarkerEdit: "rgba(255,100,100,0.5)",
    timeMarkerDotLocked: "#ff6464",
    timeMarkerDotEdit: "rgba(255,100,100,0.7)",
    timeMarkerGlow: "0 0 8px rgba(255,100,100,0.4)",
    toggleIcon: "rgba(255,255,255,0.4)",
    toggleHoverBg: "rgba(255,255,255,0.08)",
    noteBg: "rgba(255,255,255,0.03)",
    noteText: "#e0d4c8",
    notePlaceholder: "rgba(255,255,255,0.2)",
    noteBorder: "rgba(255,255,255,0.06)",
    quoteMuted: "rgba(255,255,255,0.3)",
  },
  ink: {
    isInk: true,
    inkBlockA: "#e0e0e0",
    inkBlockB: "#d0d0d0",
    bgLocked: "#ffffff",
    bgEdit: "#fafafa",
    timelineBg: "rgba(0,0,0,0.02)",
    timelineBorder: "1px solid rgba(0,0,0,0.12)",
    dateText: "rgba(0,0,0,0.6)",
    dateTextEdit: "rgba(0,0,0,0.6)",
    hourLabel: "rgba(0,0,0,0.45)",
    hourLabelEdit: "rgba(0,0,0,0.45)",
    hoverPlus: "rgba(0,0,0,0.4)",
    deleteX: "rgba(0,0,0,0.7)",
    inputText: "rgba(0,0,0,0.9)",
    caretColor: "#1a1a1a",
    blockLabelText: "rgba(0,0,0,0.85)",
    timeRangeText: "rgba(0,0,0,0.6)",
    hintText: "rgba(0,0,0,0.35)",
    blockInsetHighlight: "rgba(255,255,255,0.4)",
    blockEditShadow: "0 1px 4px rgba(0,0,0,0.08)",
    handleColor: "rgba(0,0,0,0.2)",
    deleteBtnBg: "rgba(0,0,0,0.08)",
    gridLineBg: "rgba(0,0,0,0.06)",
    gridLineBorder: "1px dashed rgba(0,0,0,0.12)",
    hoverIndicatorBg: "rgba(0,0,0,0.05)",
    hoverIndicatorBorder: "1px dashed rgba(0,0,0,0.2)",
    progressRingLocked: "#555",
    progressRingUnlocked: "#999",
    lockStrokeLocked: "rgba(0,0,0,0.4)",
    lockStrokeUnlocked: "#555",
    timeMarkerLocked: "rgba(0,0,0,0.8)",
    timeMarkerEdit: "rgba(0,0,0,0.4)",
    timeMarkerDotLocked: "#1a1a1a",
    timeMarkerDotEdit: "rgba(0,0,0,0.5)",
    timeMarkerGlow: "none",
    toggleIcon: "rgba(0,0,0,0.4)",
    toggleHoverBg: "rgba(0,0,0,0.06)",
    noteBg: "rgba(0,0,0,0.02)",
    noteText: "#1a1a1a",
    notePlaceholder: "rgba(0,0,0,0.4)",
    noteBorder: "rgba(0,0,0,0.1)",
    quoteMuted: "rgba(0,0,0,0.55)",
  },
};

const COLORS_COOL_MINERAL = [
  { bg: "#7A8FA6", lightBg: "#A3B4C7", name: "slate" },
  { bg: "#6B8A97", lightBg: "#96B3BF", name: "fjord" },
  { bg: "#8E9BAA", lightBg: "#B2BCCA", name: "pewter" },
  { bg: "#6A8C9E", lightBg: "#95B2C0", name: "steel-blue" },
  { bg: "#7C8E8E", lightBg: "#A4B3B3", name: "verdigris" },
  { bg: "#8B8FA5", lightBg: "#AEB2C4", name: "lavender-grey" },
  { bg: "#7B96A0", lightBg: "#A5B8C0", name: "ice" },
  { bg: "#8A8A9E", lightBg: "#B0B0C0", name: "zinc" },
];

const COLORS_WARM_DESERT = [
  { bg: "#C4856C", lightBg: "#D9A894", name: "terracotta" },
  { bg: "#C9A87C", lightBg: "#DCC4A3", name: "sand" },
  { bg: "#D49B6A", lightBg: "#E2B890", name: "amber-clay" },
  { bg: "#B8906E", lightBg: "#D0AC92", name: "sienna" },
  { bg: "#C98B6E", lightBg: "#DBA993", name: "ember" },
  { bg: "#BF9F78", lightBg: "#D4BB9E", name: "dune" },
  { bg: "#A8876F", lightBg: "#C4A593", name: "mesa" },
  { bg: "#CB9070", lightBg: "#DEB098", name: "copper" },
];

const COLORS_MUTED_BOTANICAL = [
  { bg: "#7E9B82", lightBg: "#A5BBA8", name: "sage" },
  { bg: "#8A9A8A", lightBg: "#AEB8AE", name: "moss" },
  { bg: "#9B9B88", lightBg: "#B8B8A8", name: "stone" },
  { bg: "#8FA08C", lightBg: "#B2BFB0", name: "fern" },
  { bg: "#96907E", lightBg: "#B5B0A2", name: "driftwood" },
  { bg: "#848E84", lightBg: "#A8B0A8", name: "lichen" },
  { bg: "#8E968A", lightBg: "#B0B6AC", name: "eucalyptus" },
  { bg: "#90958C", lightBg: "#B2B6AE", name: "clay-sage" },
];

const DARK_VARIANTS = {
  default: null,
  coolMineral: {
    isInk: false,
    bgLocked: "#161B22",
    bgEdit: "#1A2028",
    timelineBg: "rgba(140,170,200,0.03)",
    timelineBorder: "1px solid rgba(140,170,200,0.08)",
    dateText: "rgba(160,185,210,0.45)",
    dateTextEdit: "rgba(160,185,210,0.65)",
    hourLabel: "rgba(160,185,210,0.22)",
    hourLabelEdit: "rgba(160,185,210,0.38)",
    hoverPlus: "rgba(160,185,210,0.4)",
    deleteX: "rgba(190,210,230,0.7)",
    inputText: "rgba(200,215,230,0.95)",
    caretColor: "#c8d7e6",
    blockLabelText: "rgba(210,225,240,0.95)",
    timeRangeText: "rgba(160,185,210,0.5)",
    hintText: "rgba(160,185,210,0.15)",
    blockInsetHighlight: "rgba(255,255,255,0.10)",
    blockEditShadow: "0 1px 4px rgba(0,0,0,0.25)",
    handleColor: "rgba(0,0,0,0.2)",
    deleteBtnBg: "rgba(0,0,0,0.15)",
    gridLineBg: "rgba(140,170,200,0.04)",
    gridLineBorder: "1px dashed rgba(140,170,200,0.07)",
    hoverIndicatorBg: "rgba(140,170,200,0.08)",
    hoverIndicatorBorder: "1px dashed rgba(140,170,200,0.18)",
    progressRingLocked: "#7A8FA6",
    progressRingUnlocked: "#A07A7A",
    lockStrokeLocked: "rgba(160,185,210,0.4)",
    lockStrokeUnlocked: "#7A8FA6",
    timeMarkerLocked: "rgba(140,170,220,0.8)",
    timeMarkerEdit: "rgba(140,170,220,0.5)",
    timeMarkerDotLocked: "#8BAAC8",
    timeMarkerDotEdit: "rgba(140,170,220,0.7)",
    timeMarkerGlow: "0 0 8px rgba(140,170,220,0.3)",
    toggleIcon: "rgba(160,185,210,0.4)",
    toggleHoverBg: "rgba(140,170,200,0.08)",
    noteBg: "rgba(140,170,200,0.03)",
    noteText: "#b8cce0",
    notePlaceholder: "rgba(160,185,210,0.2)",
    noteBorder: "rgba(140,170,200,0.08)",
    quoteMuted: "rgba(160,185,210,0.35)",
  },
  warmDesert: {
    isInk: false,
    bgLocked: "#1C1714",
    bgEdit: "#211C18",
    timelineBg: "rgba(200,160,120,0.03)",
    timelineBorder: "1px solid rgba(200,160,120,0.08)",
    dateText: "rgba(210,175,140,0.45)",
    dateTextEdit: "rgba(210,175,140,0.65)",
    hourLabel: "rgba(210,175,140,0.22)",
    hourLabelEdit: "rgba(210,175,140,0.38)",
    hoverPlus: "rgba(210,175,140,0.4)",
    deleteX: "rgba(220,190,160,0.7)",
    inputText: "rgba(230,205,180,0.95)",
    caretColor: "#e6cdb4",
    blockLabelText: "rgba(235,210,185,0.95)",
    timeRangeText: "rgba(210,175,140,0.5)",
    hintText: "rgba(210,175,140,0.15)",
    blockInsetHighlight: "rgba(255,255,255,0.10)",
    blockEditShadow: "0 1px 4px rgba(0,0,0,0.25)",
    handleColor: "rgba(0,0,0,0.2)",
    deleteBtnBg: "rgba(0,0,0,0.15)",
    gridLineBg: "rgba(200,160,120,0.04)",
    gridLineBorder: "1px dashed rgba(200,160,120,0.07)",
    hoverIndicatorBg: "rgba(200,160,120,0.08)",
    hoverIndicatorBorder: "1px dashed rgba(200,160,120,0.18)",
    progressRingLocked: "#C4856C",
    progressRingUnlocked: "#C9A87C",
    lockStrokeLocked: "rgba(210,175,140,0.4)",
    lockStrokeUnlocked: "#C4856C",
    timeMarkerLocked: "rgba(210,140,100,0.8)",
    timeMarkerEdit: "rgba(210,140,100,0.5)",
    timeMarkerDotLocked: "#D28C64",
    timeMarkerDotEdit: "rgba(210,140,100,0.7)",
    timeMarkerGlow: "0 0 8px rgba(210,140,100,0.3)",
    toggleIcon: "rgba(210,175,140,0.4)",
    toggleHoverBg: "rgba(200,160,120,0.08)",
    noteBg: "rgba(200,160,120,0.03)",
    noteText: "#d4b896",
    notePlaceholder: "rgba(210,175,140,0.2)",
    noteBorder: "rgba(200,160,120,0.08)",
    quoteMuted: "rgba(210,175,140,0.35)",
  },
  mutedBotanical: {
    isInk: false,
    bgLocked: "#181C19",
    bgEdit: "#1C211D",
    timelineBg: "rgba(150,175,150,0.03)",
    timelineBorder: "1px solid rgba(150,175,150,0.08)",
    dateText: "rgba(170,195,170,0.45)",
    dateTextEdit: "rgba(170,195,170,0.65)",
    hourLabel: "rgba(170,195,170,0.22)",
    hourLabelEdit: "rgba(170,195,170,0.38)",
    hoverPlus: "rgba(170,195,170,0.4)",
    deleteX: "rgba(190,210,190,0.7)",
    inputText: "rgba(205,225,205,0.95)",
    caretColor: "#cde1cd",
    blockLabelText: "rgba(210,230,210,0.95)",
    timeRangeText: "rgba(170,195,170,0.5)",
    hintText: "rgba(170,195,170,0.15)",
    blockInsetHighlight: "rgba(255,255,255,0.10)",
    blockEditShadow: "0 1px 4px rgba(0,0,0,0.25)",
    handleColor: "rgba(0,0,0,0.2)",
    deleteBtnBg: "rgba(0,0,0,0.15)",
    gridLineBg: "rgba(150,175,150,0.04)",
    gridLineBorder: "1px dashed rgba(150,175,150,0.07)",
    hoverIndicatorBg: "rgba(150,175,150,0.08)",
    hoverIndicatorBorder: "1px dashed rgba(150,175,150,0.18)",
    progressRingLocked: "#7E9B82",
    progressRingUnlocked: "#9B8A7E",
    lockStrokeLocked: "rgba(170,195,170,0.4)",
    lockStrokeUnlocked: "#7E9B82",
    timeMarkerLocked: "rgba(130,180,130,0.8)",
    timeMarkerEdit: "rgba(130,180,130,0.5)",
    timeMarkerDotLocked: "#82B482",
    timeMarkerDotEdit: "rgba(130,180,130,0.7)",
    timeMarkerGlow: "0 0 8px rgba(130,180,130,0.3)",
    toggleIcon: "rgba(170,195,170,0.4)",
    toggleHoverBg: "rgba(150,175,150,0.08)",
    noteBg: "rgba(150,175,150,0.03)",
    noteText: "#b8d0b8",
    notePlaceholder: "rgba(170,195,170,0.2)",
    noteBorder: "rgba(150,175,150,0.08)",
    quoteMuted: "rgba(170,195,170,0.35)",
  },
};

const DARK_VARIANT_KEY = "timeblock-dark-variant";

function minutesToSlot(minutes, hoursStart) {
  return Math.round((minutes - hoursStart * 60) / SLOT_MINUTES);
}
function slotToMinutes(slot, hoursStart) {
  return hoursStart * 60 + slot * SLOT_MINUTES;
}
function formatTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const suffix = h >= 12 ? "pm" : "am";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${display}${suffix}` : `${display}:${m.toString().padStart(2, "0")}${suffix}`;
}

function getNextColor(blocks) {
  const usedColors = blocks.map((b) => b.colorIndex);
  for (let i = 0; i < COLORS.length; i++) {
    if (!usedColors.includes(i)) return i;
  }
  return (blocks.length) % COLORS.length;
}

function findEmptySlot(blocks, clickSlot, slots) {
  const occupied = new Set();
  blocks.forEach((b) => {
    for (let s = b.startSlot; s < b.endSlot; s++) occupied.add(s);
  });
  if (occupied.has(clickSlot)) return null;
  let start = clickSlot;
  let end = clickSlot + 1;
  while (end < slots && !occupied.has(end) && end - start < 4) end++;
  return { start, end };
}

function blocksOverlap(blocks, startSlot, endSlot, excludeId = null) {
  return blocks.some(
    (b) => b.id !== excludeId && startSlot < b.endSlot && endSlot > b.startSlot
  );
}

const DEFAULT_BLOCKS = [];

const STOIC_QUOTES = [
  { text: "It is not that we have a short time to live, but that we waste a great deal of it.", author: "Seneca" },
  { text: "You could leave life right now. Let that determine what you do and say and think.", author: "Marcus Aurelius" },
  { text: "The whole future lies in uncertainty: live immediately.", author: "Seneca" },
  { text: "How long are you going to wait before you demand the best for yourself?", author: "Epictetus" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { text: "Think of yourself as dead. You have lived your life. Now, take what's left and live it properly.", author: "Marcus Aurelius" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "No person has the power to have everything they want, but it is in their power not to want what they don't have.", author: "Seneca" },
  { text: "Loss is nothing else but change, and change is nature's delight.", author: "Marcus Aurelius" },
  { text: "If it is not right do not do it; if it is not true do not say it.", author: "Marcus Aurelius" },
  { text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "He who fears death will never do anything worth of a man who is alive.", author: "Seneca" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
  { text: "Attach yourself to what is spiritually superior, regardless of what other people think or do.", author: "Epictetus" },
];

const BUDDHIST_QUOTES = [
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
  { text: "Every morning we are born again. What we do today is what matters most.", author: "Buddha" },
  { text: "You only lose what you cling to.", author: "Buddha" },
  { text: "Silence the angry man with love. Silence the ill-natured man with kindness.", author: "Buddha" },
  { text: "Nothing is permanent.", author: "Buddha" },
  { text: "The root of suffering is attachment.", author: "Buddha" },
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "Walk as if you are kissing the Earth with your feet.", author: "Thich Nhat Hanh" },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { text: "Nothing ever goes away until it has taught us what we need to know.", author: "Pema Chödrön" },
  { text: "You are the sky. Everything else is just the weather.", author: "Pema Chödrön" },
  { text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.", author: "Alan Watts" },
  { text: "Muddy water is best cleared by leaving it alone.", author: "Alan Watts" },
  { text: "When you realize nothing is lacking, the whole world belongs to you.", author: "Lao Tzu" },
];

const PHILOSOPHICAL_QUOTES = [
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "To be is to be perceived.", author: "George Berkeley" },
  { text: "One must imagine Sisyphus happy.", author: "Albert Camus" },
  { text: "Life must be understood backwards. But it must be lived forwards.", author: "Søren Kierkegaard" },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
  { text: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.", author: "Jean-Paul Sartre" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "He who is unable to live in society, or who has no need because he is sufficient for himself, must be either a beast or a god.", author: "Aristotle" },
  { text: "Entities should not be multiplied unnecessarily.", author: "William of Ockham" },
  { text: "Act only according to that maxim whereby you can at the same time will that it should become a universal law.", author: "Immanuel Kant" },
  { text: "Liberty consists in doing what one desires.", author: "John Stuart Mill" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "The life of man is of no greater importance to the universe than that of an oyster.", author: "David Hume" },
  { text: "There is but one truly serious philosophical problem, and that is suicide.", author: "Albert Camus" },
];

const PRODUCTIVITY_QUOTES = [
  { text: "Focus is a matter of deciding what things you are not going to do.", author: "John Carmack" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Efficiency is doing things right; effectiveness is doing the right things.", author: "Peter Drucker" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "Until we can manage time, we can manage nothing else.", author: "Peter Drucker" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "What gets measured gets managed.", author: "Peter Drucker" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "If you spend too much time thinking about a thing, you'll never get it done.", author: "Bruce Lee" },
  { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
];

const QUOTE_CATEGORIES = {
  stoic: STOIC_QUOTES,
  buddhist: BUDDHIST_QUOTES,
  philosophical: PHILOSOPHICAL_QUOTES,
  productivity: PRODUCTIVITY_QUOTES,
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateStr(dateStr) {
  // "YYYY-MM-DD" → "Monday, March 2, 2026"
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function NotepadColumn({ theme: t, columnKey, onSave, notesVersion, showToolbar = true, isMuted, setIsMuted }) {
  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const soundsRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [fmtState, setFmtState] = useState({ bold: false, italic: false, ol: false, ul: false, checkbox: false });
  const checkboxModeRef = useRef(false);
  const [slashMenu, setSlashMenu] = useState(null);
  const slashRangeRef = useRef(null);

  const SLASH_COMMANDS = useMemo(() => [
    { key: "1", label: "Heading 1", action: () => document.execCommand("formatBlock", false, "h1") },
    { key: "2", label: "Heading 2", action: () => document.execCommand("formatBlock", false, "h2") },
    { key: "3", label: "Heading 3", action: () => document.execCommand("formatBlock", false, "h3") },
    { key: "todo", label: "Checkbox list", action: () => toggleCheckboxList() },
    { key: "bullet", label: "Bullet list", action: () => document.execCommand("insertUnorderedList") },
    { key: "number", label: "Numbered list", action: () => document.execCommand("insertOrderedList") },
    { key: "quote", label: "Blockquote", action: () => document.execCommand("formatBlock", false, "blockquote") },
    { key: "divider", label: "Horizontal rule", action: () => document.execCommand("insertHorizontalRule") },
  ], []);

  // Query current formatting at caret
  const updateFmtState = useCallback(() => {
    const inCbList = (() => {
      const sel = window.getSelection();
      if (!sel?.anchorNode) return false;
      const li = sel.anchorNode.nodeType === 3
        ? sel.anchorNode.parentElement?.closest("li")
        : sel.anchorNode.closest?.("li");
      return li ? !!li.querySelector('input[type="checkbox"]') : false;
    })();
    setFmtState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      ol: document.queryCommandState("insertOrderedList"),
      ul: document.queryCommandState("insertUnorderedList") && !inCbList,
      checkbox: inCbList,
    });
    checkboxModeRef.current = inCbList;
  }, []);

  // Track selection changes to update button states
  useEffect(() => {
    document.addEventListener("selectionchange", updateFmtState);
    return () => document.removeEventListener("selectionchange", updateFmtState);
  }, [updateFmtState]);

  // Load saved content (re-runs when cloud data arrives via notesVersion bump)
  useEffect(() => {
    if (editorRef.current) {
      try {
        const raw = localStorage.getItem(NOTES_KEY);
        if (raw) {
          // Try parsing as object (new format)
          try {
            const parsed = JSON.parse(raw);
            if (typeof parsed === "object" && parsed !== null) {
              editorRef.current.innerHTML = parsed[columnKey] || "";
              return;
            }
          } catch {
            // Not JSON — legacy string format
          }
          // Legacy: plain string, only load for "_general"
          if (columnKey === "_general") {
            editorRef.current.innerHTML = raw;
          }
        }
      } catch {}
    }
  }, [notesVersion, columnKey]);

  // Preload sounds
  useEffect(() => {
    const sounds = {
      enter: new Audio("./sounds/enter.wav"),
      delete: new Audio("./sounds/delete.wav"),
      space: new Audio("./sounds/space.wav"),
      key: new Audio("./sounds/key.wav"),
      key2: new Audio("./sounds/key2.wav"),
    };
    Object.values(sounds).forEach((s) => { s.volume = 0.26; s.preload = "auto"; });
    soundsRef.current = sounds;
  }, []);

  function saveContent() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        if (editorRef.current) {
          const html = editorRef.current.innerHTML;
          // Save to date-keyed notes object
          let all = {};
          try {
            const raw = localStorage.getItem(NOTES_KEY);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (typeof parsed === "object" && parsed !== null) all = parsed;
              } catch {
                // Legacy string — migrate
                all = { "_general": raw };
              }
            }
          } catch {}
          all[columnKey] = html;
          localStorage.setItem(NOTES_KEY, JSON.stringify(all));
          if (onSave) onSave();
        }
      } catch {}
    }, 500);
  }

  function playSound(key) {
    if (isMuted || !soundsRef.current) return;
    const s = soundsRef.current[key];
    if (s) {
      const clone = s.cloneNode();
      clone.volume = s.volume;
      clone.play().catch(() => {});
    }
  }

  function addCheckboxToLi(li) {
    if (li.querySelector('input[type="checkbox"]')) return;
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.style.cssText = "margin-right:6px;cursor:pointer;vertical-align:middle;";
    cb.addEventListener("change", handleCheckboxChange);
    li.insertBefore(cb, li.firstChild);
  }

  function toggleCheckboxList() {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return;
    const li = sel.anchorNode.nodeType === 3
      ? sel.anchorNode.parentElement?.closest("li")
      : sel.anchorNode.closest?.("li");

    if (li && li.querySelector('input[type="checkbox"]')) {
      // Already in checkbox list — convert to normal bullet list
      const ul = li.closest("ul");
      if (ul) {
        ul.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.remove());
        ul.style.listStyle = "disc";
        ul.style.paddingLeft = "24px";
        ul.querySelectorAll("li").forEach((item) => {
          item.style.textDecoration = "none";
          item.style.opacity = "1";
        });
      }
      checkboxModeRef.current = false;
    } else if (li && li.closest("ul")) {
      // In a plain UL — add checkboxes to all items
      const ul = li.closest("ul");
      ul.querySelectorAll("li").forEach(addCheckboxToLi);
      ul.style.listStyle = "none";
      ul.style.paddingLeft = "20px";
      checkboxModeRef.current = true;
    } else {
      // Not in any list — create one, then add checkboxes
      document.execCommand("insertUnorderedList");
      requestAnimationFrame(() => {
        const sel2 = window.getSelection();
        if (!sel2?.anchorNode) return;
        const newLi = sel2.anchorNode.nodeType === 3
          ? sel2.anchorNode.parentElement?.closest("li")
          : sel2.anchorNode.closest?.("li");
        if (newLi) {
          const ul = newLi.closest("ul");
          if (ul) {
            ul.querySelectorAll("li").forEach(addCheckboxToLi);
            ul.style.listStyle = "none";
            ul.style.paddingLeft = "20px";
          }
          // Place caret after the checkbox
          const cb = newLi.querySelector('input[type="checkbox"]');
          if (cb) {
            const range = document.createRange();
            range.setStartAfter(cb);
            range.collapse(true);
            sel2.removeAllRanges();
            sel2.addRange(range);
          }
        }
        checkboxModeRef.current = true;
        updateFmtState();
      });
    }
  }

  function getCaretPosition() {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return null;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    const rect = range.getClientRects()[0];
    if (!rect && editorRef.current) {
      // Fallback for empty lines
      const editorRect = editorRef.current.getBoundingClientRect();
      return { top: editorRect.top + 20, left: editorRect.left + 16 };
    }
    return rect ? { top: rect.bottom, left: rect.left } : null;
  }

  function executeSlashCommand(cmd) {
    // Remove the slash text from the editor
    const sel = window.getSelection();
    if (sel?.rangeCount && slashRangeRef.current) {
      const range = document.createRange();
      range.setStart(slashRangeRef.current.startContainer, slashRangeRef.current.startOffset);
      // Find the end of the slash text
      const currentRange = sel.getRangeAt(0);
      range.setEnd(currentRange.endContainer, currentRange.endOffset);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand("delete");
    }
    // Execute the command action
    cmd.action();
    setSlashMenu(null);
    slashRangeRef.current = null;
    saveContent();
    requestAnimationFrame(updateFmtState);
    editorRef.current?.focus();
  }

  function handleKeyDown(e) {
    const k = e.key;
    if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"].includes(k)) return;

    // Slash menu navigation
    if (slashMenu) {
      const filtered = SLASH_COMMANDS.filter((cmd) =>
        !slashMenu.filter || cmd.key.startsWith(slashMenu.filter) || cmd.label.toLowerCase().includes(slashMenu.filter)
      );
      if (k === "ArrowDown") {
        e.preventDefault();
        setSlashMenu((prev) => ({ ...prev, selectedIndex: Math.min((prev?.selectedIndex ?? -1) + 1, filtered.length - 1) }));
        return;
      }
      if (k === "ArrowUp") {
        e.preventDefault();
        setSlashMenu((prev) => ({ ...prev, selectedIndex: Math.max((prev?.selectedIndex ?? 0) - 1, 0) }));
        return;
      }
      if (k === "Enter" || k === "Tab") {
        e.preventDefault();
        const idx = slashMenu.selectedIndex ?? 0;
        if (filtered[idx]) executeSlashCommand(filtered[idx]);
        return;
      }
      if (k === "Escape") {
        e.preventDefault();
        setSlashMenu(null);
        slashRangeRef.current = null;
        return;
      }
      if (k === "Backspace") {
        // If we'd delete back to before the slash, close the menu
        if (!slashMenu.filter || slashMenu.filter.length === 0) {
          setSlashMenu(null);
          slashRangeRef.current = null;
        } else {
          // Let the default happen, then update filter in onInput
        }
        // Don't return — let the key go through to the editor
      }
      // Space closes the menu without executing
      if (k === " ") {
        setSlashMenu(null);
        slashRangeRef.current = null;
      }
    }

    if (e.metaKey || e.ctrlKey) {
      if (k === "b" || k === "i") {
        e.preventDefault();
        document.execCommand(k === "b" ? "bold" : "italic");
        saveContent();
        requestAnimationFrame(updateFmtState);
        return;
      }
      if (e.shiftKey && k === "7") {
        e.preventDefault();
        document.execCommand("insertOrderedList");
        saveContent();
        requestAnimationFrame(updateFmtState);
        return;
      }
      if (e.shiftKey && k === "8") {
        e.preventDefault();
        document.execCommand("insertUnorderedList");
        saveContent();
        requestAnimationFrame(updateFmtState);
        return;
      }
      if (e.shiftKey && k === "9") {
        e.preventDefault();
        toggleCheckboxList();
        saveContent();
        requestAnimationFrame(updateFmtState);
        return;
      }
      return;
    }
    // Auto-add checkbox on Enter in checkbox list
    if (k === "Enter" && checkboxModeRef.current) {
      requestAnimationFrame(() => {
        const sel = window.getSelection();
        if (!sel?.anchorNode) return;
        const newLi = sel.anchorNode.nodeType === 3
          ? sel.anchorNode.parentElement?.closest("li")
          : sel.anchorNode.closest?.("li");
        if (newLi && !newLi.querySelector('input[type="checkbox"]')) {
          addCheckboxToLi(newLi);
          const ul = newLi.closest("ul");
          if (ul) { ul.style.listStyle = "none"; ul.style.paddingLeft = "20px"; }
          // Move caret after checkbox
          const range = document.createRange();
          range.setStartAfter(newLi.querySelector('input[type="checkbox"]'));
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        saveContent();
        updateFmtState();
      });
    }
    // Markdown auto-list shortcuts: "- ", "1. ", "[] " trigger lists
    if (k === " ") {
      const sel = window.getSelection();
      if (sel?.anchorNode?.nodeType === 3) {
        const textNode = sel.anchorNode;
        const beforeSpace = textNode.textContent.substring(0, sel.anchorOffset);
        const parentEl = textNode.parentElement;
        const isInList = parentEl?.closest("li") || parentEl?.closest("ul") || parentEl?.closest("ol");
        if (!isInList) {
          if (beforeSpace === "-") {
            e.preventDefault();
            textNode.textContent = "";
            document.execCommand("insertUnorderedList");
            saveContent();
            requestAnimationFrame(updateFmtState);
            playSound("space");
            return;
          }
          if (beforeSpace === "1.") {
            e.preventDefault();
            textNode.textContent = "";
            document.execCommand("insertOrderedList");
            saveContent();
            requestAnimationFrame(updateFmtState);
            playSound("space");
            return;
          }
          if (beforeSpace === "[]") {
            e.preventDefault();
            textNode.textContent = "";
            toggleCheckboxList();
            saveContent();
            requestAnimationFrame(updateFmtState);
            playSound("space");
            return;
          }
        }
      }
    }
    if (k === "Enter") playSound("enter");
    else if (k === "Backspace" || k === "Delete") playSound("delete");
    else if (k === " ") playSound("space");
    else playSound("key2");
  }

  function handleCheckboxChange(e) {
    const cb = e.target;
    const line = cb.parentElement;
    if (line) {
      if (cb.checked) {
        line.style.textDecoration = "line-through";
        line.style.opacity = "0.5";
      } else {
        line.style.textDecoration = "none";
        line.style.opacity = "1";
      }
    }
    saveContent();
  }

  // Re-attach checkbox listeners after load
  useEffect(() => {
    if (!editorRef.current) return;
    const checkboxes = editorRef.current.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      cb.style.cursor = "pointer";
      cb.addEventListener("change", handleCheckboxChange);
    });
  }, []);

  const fmtBtn = (label, title, action, isActive) => (
    <div
      key={title}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); action(); editorRef.current?.focus(); saveContent(); requestAnimationFrame(updateFmtState); }}
      title={title}
      style={{
        width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600, color: t.noteText,
        opacity: isActive ? 1 : 0.5,
        background: isActive ? t.noteBorder : "transparent",
        transition: "opacity 0.15s, background 0.15s", userSelect: "none",
      }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = t.noteBorder; } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.background = "transparent"; } }}
    >
      {label}
    </div>
  );

  return (
    <div
      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, position: "relative" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          saveContent(); updateFmtState();
          // Slash command detection
          const sel = window.getSelection();
          if (sel?.anchorNode?.nodeType === 3) {
            const text = sel.anchorNode.textContent;
            const offset = sel.anchorOffset;
            // Find the last slash before cursor
            const before = text.substring(0, offset);
            const slashIdx = before.lastIndexOf("/");
            if (slashIdx !== -1 && (slashIdx === 0 || before[slashIdx - 1] === " " || before[slashIdx - 1] === "\n")) {
              const filter = before.substring(slashIdx + 1).toLowerCase();
              const pos = getCaretPosition();
              if (pos) {
                // Store the range starting at the slash
                const range = document.createRange();
                range.setStart(sel.anchorNode, slashIdx);
                range.collapse(true);
                slashRangeRef.current = { startContainer: sel.anchorNode, startOffset: slashIdx };
                // Check if any commands match
                const matches = SLASH_COMMANDS.filter((cmd) =>
                  !filter || cmd.key.startsWith(filter) || cmd.label.toLowerCase().includes(filter)
                );
                if (matches.length > 0) {
                  const editorRect = editorRef.current?.getBoundingClientRect();
                  setSlashMenu({
                    top: pos.top - (editorRect?.top || 0) + 4,
                    left: pos.left - (editorRect?.left || 0),
                    filter,
                    selectedIndex: 0,
                  });
                } else {
                  setSlashMenu(null);
                  slashRangeRef.current = null;
                }
              }
            } else if (slashMenu) {
              setSlashMenu(null);
              slashRangeRef.current = null;
            }
          }
        }}
        onKeyDown={handleKeyDown}
        onMouseUp={updateFmtState}
        data-placeholder="Notes..."
        style={{
          flex: 1,
          outline: "none",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          lineHeight: 1.6,
          color: t.noteText,
          background: t.noteBg,
          borderRadius: "8px",
          padding: "12px 16px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          transition: "color 0.5s ease, background 0.5s ease",
          minHeight: "60px",
        }}
      />
      {/* Slash command menu */}
      {slashMenu && (() => {
        const filtered = SLASH_COMMANDS.filter((cmd) =>
          !slashMenu.filter || cmd.key.startsWith(slashMenu.filter) || cmd.label.toLowerCase().includes(slashMenu.filter)
        );
        if (filtered.length === 0) return null;
        return (
          <div style={{
            position: "absolute",
            top: slashMenu.top + 4,
            left: Math.min(slashMenu.left, 200),
            background: t.bgLocked,
            border: t.timelineBorder,
            borderRadius: "8px",
            padding: "4px 0",
            zIndex: 50,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            minWidth: "160px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {filtered.map((cmd, i) => (
              <div
                key={cmd.key}
                onMouseDown={(e) => { e.preventDefault(); executeSlashCommand(cmd); }}
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  color: t.noteText,
                  cursor: "pointer",
                  background: i === (slashMenu.selectedIndex ?? 0) ? t.toggleHoverBg : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={() => setSlashMenu((prev) => prev ? { ...prev, selectedIndex: i } : prev)}
              >
                <span style={{ color: t.quoteMuted, fontSize: "11px", minWidth: "28px" }}>/{cmd.key}</span>
                <span>{cmd.label}</span>
              </div>
            ))}
          </div>
        );
      })()}
      <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: ${t.notePlaceholder};
          pointer-events: none;
          font-style: italic;
        }
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 24px;
        }
        [contenteditable] h1 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 8px 0 4px;
          line-height: 1.3;
        }
        [contenteditable] h2 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 6px 0 4px;
          line-height: 1.3;
        }
        [contenteditable] h3 {
          font-size: 1.1em;
          font-weight: 600;
          margin: 4px 0 2px;
          line-height: 1.3;
        }
        [contenteditable] blockquote {
          border-left: 3px solid currentColor;
          padding-left: 12px;
          opacity: 0.8;
          margin: 4px 0;
        }
        [contenteditable] hr {
          border: none;
          border-top: 1px solid ${t.noteBorder};
          margin: 8px 0;
        }
        [contenteditable] input[type="checkbox"] {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border: 1.5px solid ${t.notePlaceholder};
          border-radius: 3px;
          background: transparent;
          cursor: pointer;
          vertical-align: middle;
          margin-right: 6px;
          position: relative;
          top: -1px;
        }
        [contenteditable] input[type="checkbox"]:checked {
          background: ${t.noteText};
          border-color: ${t.noteText};
        }
        [contenteditable] input[type="checkbox"]:checked::after {
          content: "";
          position: absolute;
          left: 3px;
          top: 0px;
          width: 4px;
          height: 8px;
          border: solid ${t.bgLocked};
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      `}</style>
    </div>
  );
}

function NotepadArea({ theme: t, tags, activeColors, onCloudSave, notesVersion, isMuted, setIsMuted }) {
  const [containerWidth, setContainerWidth] = useState(700);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Columns: if tags exist, only tag columns (no General). If no tags, single General notepad.
  const columns = useMemo(() => {
    if (tags.length === 0) return [{ key: "_general", name: "General", colorIndex: null }];
    return tags.map((tg) => ({ key: tg.id, name: tg.name, colorIndex: tg.colorIndex }));
  }, [tags]);

  if (columns.length === 1 && columns[0].key === "_general") {
    // No tags — just render a single notepad
    return (
      <div ref={containerRef} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <NotepadColumn
          theme={t}
          columnKey="_general"
          onSave={onCloudSave}
          notesVersion={notesVersion}
          showToolbar={true}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      </div>
    );
  }

  // Always side-by-side columns, each takes equal space. Parent container expands for 3+ columns.
  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{
        display: "flex",
        gap: "8px",
        flex: 1,
        minHeight: 0,
      }}>
        {columns.map((col) => {
          const colColor = col.colorIndex != null ? activeColors[col.colorIndex % activeColors.length] : null;
          return (
            <div
              key={col.key}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "4px 4px 6px", fontSize: "11px",
                fontFamily: "'DM Sans', sans-serif", color: t.quoteMuted,
              }}>
                {colColor && (
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: colColor.bg, flexShrink: 0,
                  }} />
                )}
                {col.name}
              </div>
              <NotepadColumn
                theme={t}
                columnKey={col.key}
                onSave={onCloudSave}
                notesVersion={notesVersion}
                showToolbar={columns.length === 1}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const isElectron = typeof window !== "undefined" && !!window.electronAPI;
const isMacElectron = isElectron && window.electronAPI.platform === "darwin";
const isWinElectron = isElectron && window.electronAPI.platform === "win32";
const userPlatform = /Win/.test(navigator.platform) ? "windows" : /Mac/.test(navigator.platform) ? "mac" : "other";

export default function Meridian() {
  const [selectedDate, setSelectedDate] = useState(() => todayStr());
  const isToday = selectedDate === todayStr();

  const [blocks, setBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: if stored as flat array (old format), convert to date-keyed
        if (Array.isArray(parsed)) {
          const migrated = { [todayStr()]: parsed };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return parsed;
        }
        // Date-keyed format
        if (typeof parsed === "object" && parsed !== null) {
          return parsed[todayStr()] || DEFAULT_BLOCKS;
        }
      }
    } catch {
      // Corrupted data — fall through to defaults
    }
    return DEFAULT_BLOCKS;
  });
  const [isLocked, setIsLocked] = useState(true);
  const [mouseMoving, setMouseMoving] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem(MUTE_KEY) === "true"; } catch { return false; }
  });
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [currentTimePercent, setCurrentTimePercent] = useState(0);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [reorderState, setReorderState] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved && THEMES[saved]) return saved;
    } catch {}
    return "light";
  });
  const [darkVariant, setDarkVariant] = useState(() => {
    try {
      const saved = localStorage.getItem(DARK_VARIANT_KEY);
      if (saved && ["default", "coolMineral", "warmDesert", "mutedBotanical"].includes(saved)) return saved;
    } catch {}
    return "default";
  });
  const t = theme === "dark" && darkVariant !== "default" && DARK_VARIANTS[darkVariant]
    ? DARK_VARIANTS[darkVariant]
    : THEMES[theme];
  const activeColors = theme === "dark"
    ? (darkVariant === "coolMineral" ? COLORS_COOL_MINERAL
      : darkVariant === "warmDesert" ? COLORS_WARM_DESERT
      : darkVariant === "mutedBotanical" ? COLORS_MUTED_BOTANICAL
      : COLORS)
    : COLORS;
  const [hoursStart, setHoursStart] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem("timeblock-hours")); if (s?.start != null) return s.start; } catch {} return DEFAULT_HOURS_START;
  });
  const [hoursEnd, setHoursEnd] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem("timeblock-hours")); if (s?.end != null) return s.end; } catch {} return DEFAULT_HOURS_END;
  });
  const totalHours = hoursEnd - hoursStart;
  const slots = totalHours * (60 / SLOT_MINUTES);
  const [showSettings, setShowSettings] = useState(false);
  const [showMacHelp, setShowMacHelp] = useState(false);
  const [isVertical, setIsVertical] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches
  );
  const [tags, setTags] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TAGS_KEY));
      if (Array.isArray(saved)) return saved;
    } catch {}
    return [];
  });
  // Calendar integration state (persisted to localStorage)
  const [calendarEnabled, setCalendarEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem("timeblock-cal-enabled")) === true; } catch {} return false;
  });
  const [calendarIds, setCalendarIds] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem("timeblock-cal-ids")); if (Array.isArray(s)) return s; } catch {} return [];
  });
  const [availableCalendars, setAvailableCalendars] = useState([]); // fetched from Google
  const [calendarEvents, setCalendarEvents] = useState([]); // events for the current date
  const calendarCacheRef = useRef({}); // { "YYYY-MM-DD": { events: [], fetchedAt: timestamp } }
  const calendarPollRef = useRef(null);

  const [quoteCategories, setQuoteCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("timeblock-quote-categories"));
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}
    return ["stoic"];
  });
  const mergedQuotes = useMemo(() =>
    quoteCategories.flatMap((cat) => QUOTE_CATEGORIES[cat] || []),
    [quoteCategories]
  );
  const quoteIndex = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < selectedDate.length; i++) {
      hash = ((hash << 5) - hash) + selectedDate.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % Math.max(1, mergedQuotes.length);
  }, [selectedDate, mergedQuotes.length]);
  // Persist quote categories
  useEffect(() => {
    try { localStorage.setItem("timeblock-quote-categories", JSON.stringify(quoteCategories)); } catch {}
  }, [quoteCategories]);
  // Persist tags to localStorage
  const lastUsedTagRef = useRef(null);
  useEffect(() => {
    try { localStorage.setItem(TAGS_KEY, JSON.stringify(tags)); } catch {}
  }, [tags]);
  // Persist calendar settings to localStorage
  useEffect(() => {
    try { localStorage.setItem("timeblock-cal-enabled", JSON.stringify(calendarEnabled)); } catch {}
  }, [calendarEnabled]);
  useEffect(() => {
    try { localStorage.setItem("timeblock-cal-ids", JSON.stringify(calendarIds)); } catch {}
  }, [calendarIds]);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const handler = (e) => setIsVertical(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  useEffect(() => {
    if (!timelineRef.current) return;
    const ro = new ResizeObserver(([entry]) => setTimelineWidth(entry.contentRect.width));
    ro.observe(timelineRef.current);
    return () => ro.disconnect();
  }, []);
  const [timelineWidth, setTimelineWidth] = useState(1200);
  const [notesVersion, setNotesVersion] = useState(0);
  const timelineRef = useRef(null);
  const longPressRef = useRef(null);
  const longPressAnimRef = useRef(null);
  const inputRef = useRef(null);
  const nextIdRef = useRef(
    blocks.reduce((max, b) => {
      const num = parseInt(b.id, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0) + 1
  );
  // Recompute nextIdRef when date changes and blocks are loaded
  useEffect(() => {
    const max = blocks.reduce((m, b) => {
      const num = parseInt(b.id, 10);
      return isNaN(num) ? m : Math.max(m, num);
    }, 0);
    nextIdRef.current = max + 1;
  }, [selectedDate]);

  // --- Auth & Cloud Sync ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const cloudSaveTimer = useRef(null);
  const lastCloudSave = useRef(0); // timestamp of our last save, to ignore our own realtime events

  // Listen for auth state changes
  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Capture Google provider tokens from OAuth callback (only available here, not in getSession)
      if (session?.provider_token) {
        console.log("[Calendar] Captured provider_token from auth state change, event:", event);
        localStorage.setItem("timeblock-cal-provider-token", session.provider_token);
      }
      if (session?.provider_refresh_token) {
        console.log("[Calendar] Captured provider_refresh_token from auth state change, event:", event);
        localStorage.setItem("timeblock-cal-provider-refresh-token", session.provider_refresh_token);
      }
    });

    // In Electron, listen for OAuth deep link callback
    if (isElectron && window.electronAPI.onOAuthCallback) {
      window.electronAPI.onOAuthCallback(async (url) => {
        // The URL looks like meridian://auth/callback#access_token=...&refresh_token=...
        const hashIndex = url.indexOf("#");
        if (hashIndex === -1) return;
        const params = new URLSearchParams(url.substring(hashIndex + 1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  // Load cloud data on login
  useEffect(() => {
    if (!user || !supabase) return;
    (async () => {
      const { data, error } = await supabase
        .from("user_data")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error && error.code === "PGRST116") {
        // No row yet — create one with current localStorage data
        const dateKeyed = { [todayStr()]: blocks };
        await supabase.from("user_data").insert({
          user_id: user.id,
          blocks: dateKeyed,
          notes: localStorage.getItem(NOTES_KEY) || "",
          theme,
          dark_variant: darkVariant,
          hours_start: hoursStart,
          hours_end: hoursEnd,
          muted: localStorage.getItem(MUTE_KEY) === "true",
          quote_categories: quoteCategories,
          tags,
          calendar_enabled: calendarEnabled,
          calendar_ids: calendarIds,
        });
      } else if (data) {
        // Hydrate state from cloud
        let cloudBlocks = data.blocks;
        // Migration: if cloud has flat array (old format), convert to date-keyed
        if (Array.isArray(cloudBlocks)) {
          cloudBlocks = { [todayStr()]: cloudBlocks };
          // Save migrated format back to cloud
          await supabase.from("user_data").update({ blocks: cloudBlocks }).eq("user_id", user.id);
        }
        // Also store the full cloud blocks object in localStorage for offline access
        if (cloudBlocks && typeof cloudBlocks === "object") {
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudBlocks)); } catch {}
          const todayBlocks = cloudBlocks[todayStr()];
          if (Array.isArray(todayBlocks)) setBlocks(todayBlocks);
        }
        if (data.notes != null) {
          // Migrate: if notes is a plain HTML string (old format), wrap it
          let notesStr = data.notes;
          try {
            JSON.parse(notesStr); // test if already JSON
          } catch {
            // Plain HTML string — migrate to object format
            notesStr = JSON.stringify({ "_general": notesStr });
          }
          localStorage.setItem(NOTES_KEY, notesStr);
          setNotesVersion((v) => v + 1);
        }
        if (data.theme && THEMES[data.theme]) setTheme(data.theme);
        if (data.dark_variant) setDarkVariant(data.dark_variant);
        if (data.hours_start != null) setHoursStart(data.hours_start);
        if (data.hours_end != null) setHoursEnd(data.hours_end);
        if (data.muted != null) localStorage.setItem(MUTE_KEY, String(data.muted));
        if (Array.isArray(data.quote_categories)) setQuoteCategories(data.quote_categories);
        if (Array.isArray(data.tags)) setTags(data.tags);
        // Calendar settings
        if (data.calendar_enabled != null) setCalendarEnabled(data.calendar_enabled);
        if (Array.isArray(data.calendar_ids)) setCalendarIds(data.calendar_ids);
      }
    })();
  }, [user]);

  // Debounced cloud save
  const saveToCloud = useCallback(() => {
    if (!user || !supabase) return;
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(async () => {
      lastCloudSave.current = Date.now();
      // Build date-keyed blocks object from localStorage (has all dates)
      let allBlocks = {};
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        if (typeof stored === "object" && !Array.isArray(stored)) allBlocks = stored;
      } catch {}
      // Ensure current date's blocks are up-to-date
      allBlocks[selectedDate] = blocks;
      await supabase.from("user_data").update({
        blocks: allBlocks,
        notes: localStorage.getItem(NOTES_KEY) || "",
        theme,
        dark_variant: darkVariant,
        hours_start: hoursStart,
        hours_end: hoursEnd,
        muted: localStorage.getItem(MUTE_KEY) === "true",
        quote_categories: quoteCategories,
        tags,
        calendar_enabled: calendarEnabled,
        calendar_ids: calendarIds,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    }, 1000);
  }, [user, blocks, selectedDate, theme, darkVariant, hoursStart, hoursEnd, quoteCategories, tags, calendarEnabled, calendarIds]);

  // Trigger cloud save when state changes
  useEffect(() => {
    saveToCloud();
  }, [saveToCloud]);

  // Realtime sync — listen for changes from other sessions
  useEffect(() => {
    if (!user || !supabase) return;
    const channel = supabase
      .channel("user_data_sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_data", filter: `user_id=eq.${user.id}` },
        (payload) => {
          // Ignore events from our own saves (within 3s window)
          if (Date.now() - lastCloudSave.current < 3000) return;
          const data = payload.new;
          // Handle date-keyed blocks
          if (data.blocks && typeof data.blocks === "object" && !Array.isArray(data.blocks)) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.blocks)); } catch {}
            const dateBlocks = data.blocks[selectedDate];
            if (Array.isArray(dateBlocks)) setBlocks(dateBlocks);
          } else if (Array.isArray(data.blocks)) {
            // Legacy flat array fallback
            setBlocks(data.blocks);
          }
          if (data.notes != null) {
          // Migrate: if notes is a plain HTML string (old format), wrap it
          let notesStr = data.notes;
          try {
            JSON.parse(notesStr); // test if already JSON
          } catch {
            // Plain HTML string — migrate to object format
            notesStr = JSON.stringify({ "_general": notesStr });
          }
          localStorage.setItem(NOTES_KEY, notesStr);
          setNotesVersion((v) => v + 1);
        }
          if (data.theme && THEMES[data.theme]) setTheme(data.theme);
          if (data.dark_variant) setDarkVariant(data.dark_variant);
          if (data.hours_start != null) setHoursStart(data.hours_start);
          if (data.hours_end != null) setHoursEnd(data.hours_end);
          if (data.muted != null) localStorage.setItem(MUTE_KEY, String(data.muted));
          if (Array.isArray(data.quote_categories)) setQuoteCategories(data.quote_categories);
          if (Array.isArray(data.tags)) setTags(data.tags);
          if (data.calendar_enabled != null) setCalendarEnabled(data.calendar_enabled);
          if (Array.isArray(data.calendar_ids)) setCalendarIds(data.calendar_ids);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedDate]);

  async function signInWithGoogle() {
    if (!supabase) return;
    if (isElectron) {
      // In Electron, open OAuth in system browser and redirect back via deep link
      const { data } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://meridian.aptorian.com/auth/callback",
          skipBrowserRedirect: true,
        },
      });
      if (data?.url) window.open(data.url, "_blank");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  // --- Google Calendar Integration ---
  async function callCalendarFunction(action, params = {}) {
    if (!supabase || !user) { console.warn("[Calendar] No supabase or user"); return null; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { console.warn("[Calendar] No session"); return null; }
    // Pass provider_token if available (for immediate use after OAuth)
    const providerToken = session.provider_token || localStorage.getItem("timeblock-cal-provider-token") || undefined;
    console.log(`[Calendar] Calling ${action}, hasProviderToken: ${!!providerToken}, jwt: ${session.access_token?.substring(0, 20)}...`);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ action, provider_token: providerToken, ...params }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Calendar] Edge Function error (${res.status}):`, errText);
        return null;
      }
      const result = await res.json();
      console.log(`[Calendar] ${action} result:`, result);
      return result;
    } catch (err) {
      console.error("[Calendar] Fetch error:", err);
      return null;
    }
  }

  async function connectCalendar() {
    if (!supabase) return;
    // Set flag so we know to enable calendar after OAuth redirect
    try { localStorage.setItem("timeblock-cal-connecting", "true"); } catch {}
    // Re-auth with calendar scope
    const opts = {
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar.events",
        redirectTo: isElectron ? "https://meridian.aptorian.com/auth/callback" : window.location.origin,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    };
    if (isElectron) {
      opts.options.skipBrowserRedirect = true;
      const { data } = await supabase.auth.signInWithOAuth(opts);
      if (data?.url) window.open(data.url, "_blank");
    } else {
      await supabase.auth.signInWithOAuth(opts);
    }
  }

  // After OAuth redirect: detect pending calendar connection, capture tokens, auto-enable
  useEffect(() => {
    if (!user || !supabase) return;
    const connecting = localStorage.getItem("timeblock-cal-connecting");
    if (connecting === "true") {
      console.log("[Calendar] Detected cal-connecting flag, enabling calendar...");
      localStorage.removeItem("timeblock-cal-connecting");
      setCalendarEnabled(true);
      // Small delay to ensure onAuthStateChange has fired and stored tokens in localStorage
      setTimeout(async () => {
        // Check for refresh token captured by onAuthStateChange
        const storedRefreshToken = localStorage.getItem("timeblock-cal-provider-refresh-token");
        console.log("[Calendar] Stored provider_refresh_token:", !!storedRefreshToken);
        if (storedRefreshToken) {
          // Persist refresh token to Supabase for Edge Function to use
          const { error } = await supabase.from("user_data").update({
            google_refresh_token: storedRefreshToken,
          }).eq("user_id", user.id);
          if (error) console.error("[Calendar] Failed to save refresh token:", error);
          else console.log("[Calendar] Saved refresh token to user_data");
          localStorage.removeItem("timeblock-cal-provider-refresh-token");
        } else {
          // Fallback: try getSession (may not have provider tokens)
          const { data: { session } } = await supabase.auth.getSession();
          console.log("[Calendar] Session provider_token:", !!session?.provider_token, "provider_refresh_token:", !!session?.provider_refresh_token);
          if (session?.provider_refresh_token) {
            await supabase.from("user_data").update({
              google_refresh_token: session.provider_refresh_token,
            }).eq("user_id", user.id);
          }
        }
        // Fetch available calendars
        const cals = await callCalendarFunction("list-calendars");
        if (cals?.calendars) {
          setAvailableCalendars(cals.calendars);
          const primary = cals.calendars.find((c) => c.primary);
          if (primary) {
            setCalendarIds([primary.id]);
          }
          console.log("[Calendar] Fetched calendars:", cals.calendars.length);
        } else {
          console.error("[Calendar] Failed to fetch calendars after connect");
        }
      }, 500);
    }
  }, [user]);

  async function fetchCalendars() {
    const data = await callCalendarFunction("list-calendars");
    if (data?.calendars) setAvailableCalendars(data.calendars);
  }

  async function fetchCalendarEvents(dateStr) {
    if (!calendarEnabled || calendarIds.length === 0) return;
    // Check cache
    const cached = calendarCacheRef.current[dateStr];
    const isViewingToday = dateStr === todayStr();
    const ttl = isViewingToday ? 5 * 60 * 1000 : 60 * 60 * 1000; // 5min today, 1hr past
    if (cached && Date.now() - cached.fetchedAt < ttl) {
      setCalendarEvents(cached.events);
      return;
    }
    const data = await callCalendarFunction("get-events", {
      date: dateStr,
      calendarIds,
    });
    if (data?.events) {
      // Convert to slot-based model
      const mapped = data.events.map((ev) => {
        const start = new Date(ev.start);
        const end = new Date(ev.end);
        const startMins = start.getHours() * 60 + start.getMinutes();
        const endMins = end.getHours() * 60 + end.getMinutes();
        return {
          googleEventId: ev.id,
          title: ev.summary || "(No title)",
          startSlot: Math.max(0, Math.floor((startMins - hoursStart * 60) / SLOT_MINUTES)),
          endSlot: Math.min(slots, Math.ceil((endMins - hoursStart * 60) / SLOT_MINUTES)),
          calendarId: ev.calendarId,
          calendarColor: ev.calendarColor || "#7A9BBF",
          meetingLink: ev.hangoutLink || ev.conferenceData?.entryPoints?.[0]?.uri || null,
          source: "google",
        };
      }).filter((ev) => ev.endSlot > ev.startSlot && ev.startSlot < slots);
      calendarCacheRef.current[dateStr] = { events: mapped, fetchedAt: Date.now() };
      setCalendarEvents(mapped);
    }
  }

  // Auto-fetch calendar list when calendar is enabled and user is logged in
  useEffect(() => {
    if (calendarEnabled && user && availableCalendars.length === 0) {
      fetchCalendars();
    }
  }, [calendarEnabled, user]);

  // Fetch calendar events when date changes or calendar settings change
  useEffect(() => {
    if (calendarEnabled && calendarIds.length > 0 && user) {
      fetchCalendarEvents(selectedDate);
    } else {
      setCalendarEvents([]);
    }
  }, [selectedDate, calendarEnabled, calendarIds, user]);

  // Poll calendar events every 5 minutes for today
  useEffect(() => {
    if (!calendarEnabled || calendarIds.length === 0 || !user) return;
    calendarPollRef.current = setInterval(() => {
      if (selectedDate === todayStr()) {
        calendarCacheRef.current[selectedDate] = null; // invalidate
        fetchCalendarEvents(selectedDate);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(calendarPollRef.current);
  }, [calendarEnabled, calendarIds, user, selectedDate]);

  // --- 2-way sync: Push Meridian blocks → Google Calendar ---
  const prevBlocksRef = useRef(null); // tracks previous blocks for change detection
  const pushSyncTimerRef = useRef(null);

  // Detect block changes and push to Google Calendar (debounced 2s)
  useEffect(() => {
    if (!calendarEnabled || !user || calendarIds.length === 0) {
      prevBlocksRef.current = blocks;
      return;
    }
    const prevBlocks = prevBlocksRef.current;
    prevBlocksRef.current = blocks;
    if (!prevBlocks) return; // first render, skip

    // Only sync on today (don't push historical changes)
    if (selectedDate !== todayStr()) return;

    if (pushSyncTimerRef.current) clearTimeout(pushSyncTimerRef.current);
    pushSyncTimerRef.current = setTimeout(async () => {
      // Find newly created blocks (in current but not previous, no googleEventId yet)
      const prevIds = new Set(prevBlocks.map((b) => b.id));
      const created = blocks.filter((b) => !prevIds.has(b.id) && !b.googleEventId && b.title !== "New Block");

      // Find deleted blocks that had a googleEventId
      const currIds = new Set(blocks.map((b) => b.id));
      const deleted = prevBlocks.filter((b) => !currIds.has(b.id) && b.googleEventId);

      // Find updated blocks (title, startSlot, or endSlot changed, have googleEventId)
      const updated = blocks.filter((b) => {
        if (!b.googleEventId) return false;
        const prev = prevBlocks.find((p) => p.id === b.id);
        if (!prev) return false;
        return prev.title !== b.title || prev.startSlot !== b.startSlot || prev.endSlot !== b.endSlot;
      });

      // Helper: convert slot to ISO datetime for today
      function slotToDateTime(slot) {
        const mins = hoursStart * 60 + slot * SLOT_MINUTES;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d.toISOString();
      }

      // Push creates
      for (const block of created) {
        const targetCalendarId = calendarIds[0]; // default to first selected calendar
        try {
          const result = await callCalendarFunction("create-event", {
            calendarId: targetCalendarId,
            event: {
              summary: block.title,
              start: slotToDateTime(block.startSlot),
              end: slotToDateTime(block.endSlot),
            },
          });
          if (result?.id) {
            // Store the Google event ID back on the block
            setBlocks((prev) =>
              prev.map((b) => b.id === block.id ? { ...b, googleEventId: result.id } : b)
            );
          }
        } catch (err) {
          console.warn("Failed to push block to Google Calendar:", err);
        }
      }

      // Push updates
      for (const block of updated) {
        const targetCalendarId = calendarIds[0];
        try {
          await callCalendarFunction("update-event", {
            calendarId: targetCalendarId,
            eventId: block.googleEventId,
            event: {
              summary: block.title,
              start: slotToDateTime(block.startSlot),
              end: slotToDateTime(block.endSlot),
            },
          });
        } catch (err) {
          console.warn("Failed to update Google Calendar event:", err);
        }
      }

      // Push deletes
      for (const block of deleted) {
        const targetCalendarId = calendarIds[0];
        try {
          await callCalendarFunction("delete-event", {
            calendarId: targetCalendarId,
            eventId: block.googleEventId,
          });
        } catch (err) {
          console.warn("Failed to delete Google Calendar event:", err);
        }
      }

      // Refresh calendar events after pushing
      if (created.length > 0 || updated.length > 0 || deleted.length > 0) {
        calendarCacheRef.current[selectedDate] = null; // invalidate cache
        fetchCalendarEvents(selectedDate);
      }
    }, 2000); // 2s debounce

    return () => {
      if (pushSyncTimerRef.current) clearTimeout(pushSyncTimerRef.current);
    };
  }, [blocks, calendarEnabled, calendarIds, user, selectedDate, hoursStart]);

  // Lane computation for overlapping blocks + calendar events
  function computeLanes(allItems) {
    const sorted = [...allItems].sort((a, b) => a.startSlot - b.startSlot);
    const lanes = [];
    for (const item of sorted) {
      const lane = lanes.find((l) => l[l.length - 1].endSlot <= item.startSlot);
      if (lane) lane.push(item);
      else lanes.push([item]);
    }
    // Assign lane info
    const result = new Map();
    lanes.forEach((lane, laneIdx) => {
      lane.forEach((item) => {
        result.set(item, { laneIndex: laneIdx, totalLanes: lanes.length });
      });
    });
    return result;
  }

  // Compute lane layout for all timeline items (blocks + calendar events)
  // Returns a Map keyed by unique id string → { laneIndex, totalLanes }
  const laneInfo = useMemo(() => {
    const allItems = [
      ...blocks.map((b) => ({ id: `block_${b.id}`, startSlot: b.startSlot, endSlot: b.endSlot })),
      ...calendarEvents.map((ev) => ({ id: `cal_${ev.googleEventId}`, startSlot: ev.startSlot, endSlot: ev.endSlot })),
    ];
    if (allItems.length === 0) return {};
    const sorted = [...allItems].sort((a, b) => a.startSlot - b.startSlot);
    const lanes = [];
    for (const item of sorted) {
      const lane = lanes.find((l) => l[l.length - 1].endSlot <= item.startSlot);
      if (lane) lane.push(item);
      else lanes.push([item]);
    }
    const result = {};
    lanes.forEach((lane, laneIdx) => {
      lane.forEach((item) => {
        result[item.id] = { laneIndex: laneIdx, totalLanes: lanes.length };
      });
    });
    return result;
  }, [blocks, calendarEvents]);

  // Helper to get lane-based style adjustments
  function getLaneStyle(laneKey, isVerticalLayout) {
    const info = laneInfo[laneKey];
    if (!info || info.totalLanes <= 1) return {}; // no overlap, full space
    const pct = 100 / info.totalLanes;
    const offset = pct * info.laneIndex;
    if (isVerticalLayout) {
      return { left: `${offset}%`, width: `${pct}%`, right: "auto" };
    }
    return { top: `${offset}%`, height: `${pct}%`, bottom: "auto" };
  }

  // Persist blocks to localStorage (date-keyed)
  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      // Ensure it's an object (not a leftover array)
      const store = (typeof all === "object" && !Array.isArray(all)) ? all : {};
      store[selectedDate] = blocks;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Storage full or unavailable
    }
  }, [blocks, selectedDate]);

  // Navigate to a different date
  const navigateDate = useCallback((dateStr) => {
    setSelectedDate(dateStr);
    // Load blocks for the new date from localStorage
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (typeof all === "object" && !Array.isArray(all) && Array.isArray(all[dateStr])) {
        setBlocks(all[dateStr]);
      } else {
        setBlocks(DEFAULT_BLOCKS);
      }
    } catch {
      setBlocks(DEFAULT_BLOCKS);
    }
    // Reset editing state
    setEditingBlockId(null);
    setHoveredSlot(null);
    setDragState(null);
    setResizeState(null);
    setReorderState(null);
  }, []);

  // Clamp blocks when day range changes
  useEffect(() => {
    setBlocks((prev) => {
      const clamped = prev.map((b) => {
        const newStart = Math.max(0, Math.min(b.startSlot, slots - 1));
        const newEnd = Math.max(newStart + 1, Math.min(b.endSlot, slots));
        return { ...b, startSlot: newStart, endSlot: newEnd };
      }).filter((b) => b.startSlot < slots);
      return JSON.stringify(clamped) !== JSON.stringify(prev) ? clamped : prev;
    });
  }, [slots]);

  // Persist theme preference
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
    // Update body bg for flash-prevention consistency
    document.body.style.backgroundColor = t.bgLocked;
    document.body.style.color = t.noteText;
    // Update favicon for theme
    const fav = document.getElementById('favicon');
    if (fav) fav.href = theme === 'dark' ? '/favicon-dark.svg' : '/favicon-light.svg';
  }, [theme, t]);

  // Persist dark variant
  useEffect(() => {
    try { localStorage.setItem(DARK_VARIANT_KEY, darkVariant); } catch {}
  }, [darkVariant]);

  // Current time marker
  useEffect(() => {
    function update() {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const pct = ((mins - hoursStart * 60) / (totalHours * 60)) * 100;
      setCurrentTimePercent(Math.max(0, Math.min(100, pct)));
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [hoursStart, totalHours]);

  // Focus input when editing
  useEffect(() => {
    if (editingBlockId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingBlockId]);

  // Persist mute preference
  useEffect(() => {
    try { localStorage.setItem(MUTE_KEY, String(isMuted)); } catch {}
  }, [isMuted]);

  // Track mouse movement for lock icon visibility
  const mouseMovingTimerRef = useRef(null);
  useEffect(() => {
    function handleMouseMove() {
      setMouseMoving(true);
      if (mouseMovingTimerRef.current) clearTimeout(mouseMovingTimerRef.current);
      mouseMovingTimerRef.current = setTimeout(() => setMouseMoving(false), 2000);
    }
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (mouseMovingTimerRef.current) clearTimeout(mouseMovingTimerRef.current);
    };
  }, []);

  // Long press for padlock toggle
  const startLongPress = useCallback(() => {
    let start = performance.now();
    const duration = isLocked ? 1020 : 194;
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setLongPressProgress(progress);
      if (progress >= 1) {
        setIsLocked((prev) => !prev);
        setLongPressProgress(0);
        setEditingBlockId(null);
        return;
      }
      longPressAnimRef.current = requestAnimationFrame(tick);
    }
    longPressAnimRef.current = requestAnimationFrame(tick);
  }, [isLocked]);

  const endLongPress = useCallback(() => {
    if (longPressAnimRef.current) {
      cancelAnimationFrame(longPressAnimRef.current);
      longPressAnimRef.current = null;
    }
    setLongPressProgress(0);
  }, []);

  function getSlotFromX(clientX) {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = x / rect.width;
    return Math.max(0, Math.min(slots, Math.round(pct * slots)));
  }

  function getSlotFromY(clientY) {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const pct = y / rect.height;
    return Math.max(0, Math.min(slots, Math.round(pct * slots)));
  }

  function getSlotFromPointer(e) {
    return isVertical ? getSlotFromY(e.clientY) : getSlotFromX(e.clientX);
  }

  // Click empty space to create block
  function handleTimelineClick(e) {
    if (isLocked || dragState || resizeState || reorderState) return;
    if (e.target.closest("[data-block]")) return;
    const slot = Math.min(getSlotFromPointer(e), slots - 1);
    const empty = findEmptySlot(blocks, slot, slots);
    if (!empty) return;
    const id = String(nextIdRef.current++);
    // Default to last used tag, or null if no tags exist
    const defaultTagId = lastUsedTagRef.current && tags.find((tg) => tg.id === lastUsedTagRef.current)
      ? lastUsedTagRef.current : (tags.length > 0 ? tags[0].id : null);
    const tagColor = defaultTagId ? tags.find((tg) => tg.id === defaultTagId)?.colorIndex : undefined;
    const newBlock = {
      id,
      title: "New Block",
      startSlot: empty.start,
      endSlot: empty.end,
      colorIndex: tagColor != null ? tagColor : getNextColor(blocks),
      tagId: defaultTagId,
      googleEventId: null,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setEditingBlockId(id);
  }

  // Hover for "+" indicator
  function handleTimelineMouseMove(e) {
    if (isLocked || dragState || resizeState || reorderState) return;
    if (e.target.closest("[data-block]")) {
      setHoveredSlot(null);
      return;
    }
    const slot = Math.min(getSlotFromPointer(e), slots - 1);
    const occupied = new Set();
    blocks.forEach((b) => {
      for (let s = b.startSlot; s < b.endSlot; s++) occupied.add(s);
    });
    setHoveredSlot(occupied.has(slot) ? null : slot);
  }

  // Resize handlers
  function startResize(e, blockId, edge) {
    e.stopPropagation();
    e.preventDefault();
    const slot = isVertical ? getSlotFromY(e.clientY) : getSlotFromX(e.clientX);
    const block = blocks.find((b) => b.id === blockId);
    const offset = edge === "right" ? slot - (block.endSlot - 1) : slot - block.startSlot;
    setResizeState({ blockId, edge, offset });
  }

  useEffect(() => {
    if (!resizeState) return;
    function onMove(e) {
      const slot = isVertical ? getSlotFromY(e.clientY) : getSlotFromX(e.clientX);
      const adjusted = slot - (resizeState.offset || 0);
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== resizeState.blockId) return b;
          if (resizeState.edge === "left") {
            const newStart = Math.min(adjusted, b.endSlot - 1);
            if (newStart >= 0 && !blocksOverlap(prev, newStart, b.endSlot, b.id)) {
              return { ...b, startSlot: newStart };
            }
          } else {
            const newEnd = Math.max(adjusted + 1, b.startSlot + 1);
            if (newEnd <= slots && !blocksOverlap(prev, b.startSlot, newEnd, b.id)) {
              return { ...b, endSlot: newEnd };
            }
          }
          return b;
        })
      );
    }
    function onUp() {
      setResizeState(null);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizeState, blocks]);

  // Reorder / drag block
  function startReorder(e, blockId) {
    if (isLocked) return;
    e.preventDefault();
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const slot = isVertical ? getSlotFromY(e.clientY) : getSlotFromX(e.clientX);
    setReorderState({
      blockId,
      offsetSlots: slot - block.startSlot,
      currentStart: block.startSlot,
    });
  }

  useEffect(() => {
    if (!reorderState) return;
    function onMove(e) {
      const slot = isVertical ? getSlotFromY(e.clientY) : getSlotFromX(e.clientX);
      const block = blocks.find((b) => b.id === reorderState.blockId);
      if (!block) return;
      const width = block.endSlot - block.startSlot;
      let newStart = slot - reorderState.offsetSlots;
      newStart = Math.max(0, Math.min(slots - width, newStart));
      if (!blocksOverlap(blocks, newStart, newStart + width, block.id)) {
        setReorderState((prev) => ({ ...prev, currentStart: newStart }));
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === reorderState.blockId
              ? { ...b, startSlot: newStart, endSlot: newStart + width }
              : b
          )
        );
      }
    }
    function onUp() {
      setReorderState(null);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [reorderState, blocks]);

  // Delete block
  function deleteBlock(id) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (editingBlockId === id) setEditingBlockId(null);
  }

  // Hour labels
  const hourLabels = [];
  for (let h = hoursStart; h <= hoursEnd; h++) {
    const pct = ((h - hoursStart) / totalHours) * 100;
    const label = h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
    hourLabels.push({ pct, label, hour: h });
  }

  const isCurrentTimeVisible = isToday && currentTimePercent > 0 && currentTimePercent < 100;

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: isLocked ? t.bgLocked : t.bgEdit,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Satoshi', 'DM Sans', -apple-system, sans-serif",
      overflow: isVertical ? "hidden" : "hidden",
      transition: "background 0.5s ease",
      userSelect: "none",
    }}>
      {/* Top bar — also serves as Electron drag region */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: isMacElectron ? 14 : (isElectron ? 6 : 12),
        paddingBottom: isElectron ? 6 : 12,
        paddingLeft: isMacElectron ? 96 : 24,
        paddingRight: isWinElectron ? 0 : 24,
        flexShrink: 0,
        WebkitAppRegion: isElectron ? "drag" : undefined,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          WebkitAppRegion: "no-drag",
        }}>
          <div
            onClick={() => navigateDate(addDays(selectedDate, -1))}
            style={{
              width: 24, height: 24, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", borderRadius: "50%",
              fontSize: "14px", color: isLocked ? t.dateText : t.dateTextEdit,
              transition: "background 0.2s, color 0.5s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = t.toggleHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            ‹
          </div>
          <div style={{
            color: isLocked ? t.dateText : t.dateTextEdit,
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            letterSpacing: "0.5px",
            transition: "color 0.5s ease",
          }}>
            {formatDateStr(selectedDate)}
          </div>
          <div
            onClick={() => { if (!isToday) navigateDate(addDays(selectedDate, 1)); }}
            style={{
              width: 24, height: 24, cursor: isToday ? "default" : "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", borderRadius: "50%",
              fontSize: "14px", color: isLocked ? t.dateText : t.dateTextEdit,
              opacity: isToday ? 0.3 : 1,
              transition: "background 0.2s, color 0.5s ease, opacity 0.3s ease",
            }}
            onMouseEnter={(e) => { if (!isToday) e.currentTarget.style.background = t.toggleHoverBg; }}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            ›
          </div>
          {!isToday && (
            <div
              onClick={() => navigateDate(todayStr())}
              style={{
                padding: "2px 10px", borderRadius: "12px",
                fontSize: "11px", fontFamily: "'DM Sans', sans-serif",
                color: t.noteText, background: t.toggleHoverBg,
                cursor: "pointer", fontWeight: 400,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Today
            </div>
          )}
        </div>

        {/* Right-side controls */}
        <div style={{ display: "flex", alignItems: "center", WebkitAppRegion: "no-drag" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: isWinElectron ? 8 : 0 }}>
            {/* Theme toggle — collapses when locked */}
            <div
              onClick={() => setTheme((prev) => prev === "light" ? "dark" : prev === "dark" ? "ink" : "light")}
              style={{
                width: isLocked ? 0 : 32, height: 32, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", borderRadius: "50%",
                transition: "width 0.3s ease, opacity 0.3s ease, background 0.3s ease",
                opacity: isLocked ? 0 : 1,
                overflow: "hidden",
                pointerEvents: isLocked ? "none" : "auto",
              }}
              onMouseEnter={(e) => { if (!isLocked) e.currentTarget.style.background = t.toggleHoverBg; }}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.toggleIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.5s ease", flexShrink: 0 }}>
                {theme === "light" ? (
                  <>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </>
                ) : theme === "dark" ? (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                ) : (
                  <path d="M12 2C12 2 8 9 8 13a4 4 0 0 0 8 0c0-4-4-11-4-11z" style={{ transform: "translateY(2px)" }} />
                )}
              </svg>
            </div>

            {/* Settings gear — collapses when locked */}
            <div
              onClick={() => setShowSettings((prev) => !prev)}
              style={{
                width: isLocked ? 0 : 32, height: 32, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", borderRadius: "50%",
                transition: "width 0.3s ease, opacity 0.3s ease, background 0.3s ease",
                opacity: isLocked ? 0 : 1,
                overflow: "hidden",
                pointerEvents: isLocked ? "none" : "auto",
              }}
              onMouseEnter={(e) => { if (!isLocked) e.currentTarget.style.background = t.toggleHoverBg; }}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.toggleIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.5s ease", flexShrink: 0 }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>

            {/* Mute toggle — collapses when locked */}
            <div
              onClick={(e) => { e.stopPropagation(); setIsMuted((p) => !p); }}
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
              style={{
                width: isLocked ? 0 : 32, height: 32, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", borderRadius: "50%",
                transition: "width 0.3s ease, opacity 0.3s ease, background 0.3s ease",
                opacity: isLocked ? 0 : 1,
                overflow: "hidden",
                pointerEvents: isLocked ? "none" : "auto",
              }}
              onMouseEnter={(e) => { if (!isLocked) e.currentTarget.style.background = t.toggleHoverBg; }}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.toggleIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.5s ease", flexShrink: 0 }}>
                {isMuted ? (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </>
                ) : (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </>
                )}
              </svg>
            </div>

            {/* Padlock toggle - long press, fades when locked and mouse is idle */}
            <div
              onMouseDown={startLongPress}
              onMouseUp={endLongPress}
              onMouseLeave={endLongPress}
              style={{
                position: "relative", width: 36, height: 36, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: isLocked ? (mouseMoving ? 0.6 : 0.15) : 1,
                transition: "opacity 0.6s ease",
              }}
            >
              <svg width="36" height="36" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke={longPressProgress > 0 ? (isLocked ? t.progressRingLocked : t.progressRingUnlocked) : "transparent"}
                  strokeWidth="2" strokeDasharray={`${longPressProgress * 94.25} 94.25`}
                  style={{ transition: longPressProgress === 0 ? "stroke 0.2s" : "none" }}
                />
              </svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isLocked ? t.lockStrokeLocked : t.lockStrokeUnlocked} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s", position: "relative", zIndex: 1 }}>
                {isLocked ? (
                  <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
                ) : (
                  <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>
                )}
              </svg>
            </div>
          </div>

          {/* Windows Electron: custom window controls */}
          {isWinElectron && (
            <div style={{ display: "flex", alignItems: "stretch" }}>
              {/* Minimize */}
              <div
                onClick={() => window.electronAPI.minimize()}
                style={{
                  width: 46, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.toggleHoverBg}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="10" height="1" viewBox="0 0 10 1">
                  <line x1="0" y1="0.5" x2="10" y2="0.5" stroke={t.toggleIcon} strokeWidth="1" />
                </svg>
              </div>
              {/* Maximize / Restore */}
              <div
                onClick={() => window.electronAPI.maximize()}
                style={{
                  width: 46, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.toggleHoverBg}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={t.toggleIcon} strokeWidth="1">
                  <rect x="0.5" y="0.5" width="9" height="9" />
                </svg>
              </div>
              {/* Close */}
              <div
                onClick={() => window.electronAPI.close()}
                style={{
                  width: 46, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#e81123"; e.currentTarget.querySelector("svg").style.stroke = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.querySelector("svg").style.stroke = t.toggleIcon; }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" stroke={t.toggleIcon} strokeWidth="1.2" style={{ transition: "stroke 0.15s" }}>
                  <line x1="0" y1="0" x2="10" y2="10" />
                  <line x1="10" y1="0" x2="0" y2="10" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline area */}
      <div style={{
        display: "flex",
        flexDirection: isVertical ? "row" : "column",
        padding: isVertical ? "0 16px 0" : "0 24px 0",
        flexShrink: isVertical ? 1 : 0,
        ...(isVertical ? { flex: 1, minHeight: 0, overflow: "hidden" } : {}),
      }}>
        {/* Hour labels */}
        {!isVertical && (
          <div style={{
            position: "relative",
            height: "20px",
            flexShrink: 0,
            marginBottom: "4px",
          }}>
            {hourLabels.map(({ pct, label, hour }) => (
              <div
                key={hour}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  transform: "translateX(-50%)",
                  fontSize: "10px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  color: isLocked ? t.hourLabel : t.hourLabelEdit,
                  transition: "color 0.5s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Vertical hour labels (left side) */}
        {isVertical && (
          <div style={{
            position: "relative",
            width: "36px",
            flexShrink: 0,
            marginRight: "4px",
          }}>
            {hourLabels.map(({ pct, label, hour }) => (
              <div
                key={hour}
                style={{
                  position: "absolute",
                  top: `${pct}%`,
                  transform: "translateY(-50%)",
                  fontSize: "10px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  color: isLocked ? t.hourLabel : t.hourLabelEdit,
                  transition: "color 0.5s ease",
                  whiteSpace: "nowrap",
                  right: 0,
                  textAlign: "right",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Main timeline */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={() => setHoveredSlot(null)}
          style={{
            position: "relative",
            ...(isVertical
              ? { flex: 1, width: "100%", minHeight: 0 }
              : { height: "80px" }),
            borderRadius: isLocked ? "12px" : "8px",
            background: isLocked ? "transparent" : t.timelineBg,
            border: isLocked ? "none" : t.timelineBorder,
            transition: "all 0.5s ease",
            overflow: "hidden",
          }}
        >
          {/* Grid lines (edit mode only) */}
          {!isLocked &&
            hourLabels.map(({ pct, hour }) => (
              <div
                key={`grid-${hour}`}
                style={{
                  position: "absolute",
                  ...(isVertical
                    ? { top: `${pct}%`, left: 0, right: 0, height: "1px", borderTop: t.gridLineBorder, background: t.gridLineBg }
                    : { left: `${pct}%`, top: 0, bottom: 0, width: "1px", borderLeft: t.gridLineBorder, background: t.gridLineBg }),
                  pointerEvents: "none",
                }}
              />
            ))}

          {/* Hover "+" indicator */}
          {!isLocked && hoveredSlot !== null && !editingBlockId && (
            <div
              style={{
                position: "absolute",
                ...(isVertical
                  ? { top: `${(hoveredSlot / slots) * 100}%`, left: "50%", transform: "translate(-50%, -50%)" }
                  : { left: `${(hoveredSlot / slots) * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }),
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: t.hoverIndicatorBg,
                border: t.hoverIndicatorBorder,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t.hoverPlus,
                fontSize: "16px",
                fontWeight: 300,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              +
            </div>
          )}

          {/* Calendar events (read-only, semi-transparent) */}
          {calendarEvents.map((ev) => {
            const posPct = (ev.startSlot / slots) * 100;
            const sizePct = ((ev.endSlot - ev.startSlot) / slots) * 100;
            const calLane = getLaneStyle(`cal_${ev.googleEventId}`, isVertical);
            return (
              <div
                key={ev.googleEventId}
                title={`${ev.title}${ev.meetingLink ? " · Click to join" : ""}`}
                onClick={() => ev.meetingLink && window.open(ev.meetingLink, "_blank")}
                style={{
                  position: "absolute",
                  ...(isVertical
                    ? { top: `${posPct}%`, height: `${sizePct}%`, left: "4px", right: "4px" }
                    : { left: `${posPct}%`, width: `${sizePct}%`, top: "4px", bottom: "4px" }),
                  ...calLane,
                  background: `${ev.calendarColor}30`,
                  border: `1px dashed ${ev.calendarColor}80`,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  cursor: ev.meetingLink ? "pointer" : "default",
                  pointerEvents: "auto",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "0 6px", overflow: "hidden",
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ev.calendarColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span style={{
                    fontSize: "10px",
                    fontFamily: "'DM Sans', sans-serif",
                    color: ev.calendarColor,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {ev.title}
                  </span>
                  {ev.meetingLink && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ev.calendarColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}

          {/* Time blocks */}
          {blocks.map((block) => {
            const posPct = (block.startSlot / slots) * 100;
            const sizePct = ((block.endSlot - block.startSlot) / slots) * 100;
            const blockTag = block.tagId ? tags.find((tg) => tg.id === block.tagId) : null;
            const effectiveColorIndex = blockTag ? blockTag.colorIndex : block.colorIndex;
            const color = activeColors[effectiveColorIndex % activeColors.length];
            const blockBg = t.isInk
              ? (blocks.indexOf(block) % 2 === 0 ? t.inkBlockA : t.inkBlockB)
              : theme === "light" ? color.lightBg : color.bg;
            const isEditing = editingBlockId === block.id;
            const blockSpan = block.endSlot - block.startSlot;
            const pixelWidth = (blockSpan / slots) * timelineWidth;
            const isNarrow = pixelWidth < 80;
            const shouldRotateText = isNarrow && block.title.length > 5;
            const blockLane = getLaneStyle(`block_${block.id}`, isVertical);

            return (
              <div
                key={block.id}
                data-block="true"
                onMouseDown={(e) => {
                  if (!isLocked && !isEditing && !e.target.closest("[data-resize]")) {
                    startReorder(e, block.id);
                  }
                }}
                onDoubleClick={() => {
                  if (!isLocked) setEditingBlockId(block.id);
                }}
                style={{
                  position: "absolute",
                  ...(isVertical
                    ? {
                        top: `${posPct}%`,
                        height: `${sizePct}%`,
                        left: isLocked ? "4px" : "6px",
                        right: isLocked ? "4px" : "6px",
                      }
                    : {
                        left: `${posPct}%`,
                        width: `${sizePct}%`,
                        top: isLocked ? "4px" : "6px",
                        bottom: isLocked ? "4px" : "6px",
                      }),
                  ...blockLane,
                  background: isLocked
                    ? (t.isInk || theme === "dark" ? blockBg : `linear-gradient(135deg, ${blockBg}dd, ${blockBg}aa)`)
                    : `${blockBg}cc`,
                  borderRadius: isLocked ? "10px" : "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isLocked ? "default" : "grab",
                  transition: resizeState || reorderState ? "none" : "all 0.3s ease",
                  boxShadow: isLocked
                    ? (t.isInk || theme === "dark" ? "none" : `0 2px 12px ${blockBg}33, inset 0 1px 0 ${t.blockInsetHighlight}`)
                    : t.blockEditShadow,
                  zIndex: reorderState?.blockId === block.id ? 20 : (isEditing ? 15 : 2),
                  overflow: isEditing ? "visible" : "hidden",
                }}
              >
                {/* Resize handles (edit mode) */}
                {!isLocked && (
                  <>
                    <div
                      data-resize="left"
                      onMouseDown={(e) => startResize(e, block.id, "left")}
                      style={{
                        position: "absolute",
                        ...(isVertical
                          ? { top: 0, left: 0, right: 0, height: "8px", cursor: "ns-resize" }
                          : { left: 0, top: 0, bottom: 0, width: "8px", cursor: "ew-resize" }),
                        background: "transparent",
                        zIndex: 3,
                      }}
                    >
                      <div style={{
                        position: "absolute",
                        ...(isVertical
                          ? { top: "2px", left: "50%", transform: "translateX(-50%)", height: "3px", width: "20px" }
                          : { left: "2px", top: "50%", transform: "translateY(-50%)", width: "3px", height: "20px" }),
                        borderRadius: "2px",
                        background: t.handleColor,
                      }} />
                    </div>
                    <div
                      data-resize="right"
                      onMouseDown={(e) => startResize(e, block.id, "right")}
                      style={{
                        position: "absolute",
                        ...(isVertical
                          ? { bottom: 0, left: 0, right: 0, height: "8px", cursor: "ns-resize" }
                          : { right: 0, top: 0, bottom: 0, width: "8px", cursor: "ew-resize" }),
                        background: "transparent",
                        zIndex: 3,
                      }}
                    >
                      <div style={{
                        position: "absolute",
                        ...(isVertical
                          ? { bottom: "2px", left: "50%", transform: "translateX(-50%)", height: "3px", width: "20px" }
                          : { right: "2px", top: "50%", transform: "translateY(-50%)", width: "3px", height: "20px" }),
                        borderRadius: "2px",
                        background: t.handleColor,
                      }} />
                    </div>
                  </>
                )}

                {/* Delete button (edit mode) */}
                {!isLocked && (
                  <div
                    onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "6px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: t.deleteBtnBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "10px",
                      color: t.deleteX,
                      opacity: 0.5,
                      zIndex: 4,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "0.5"}
                  >
                    ×
                  </div>
                )}

                {/* Block label / editing overlay */}
                {isEditing ? (
                  <div
                    style={{
                      position: "absolute", top: 0, bottom: 0,
                      left: "50%", transform: "translateX(-50%)",
                      minWidth: isNarrow ? "160px" : "100%",
                      width: "100%",
                      backdropFilter: "blur(8px)",
                      background: theme === "light" ? "rgba(240,232,223,0.95)" : theme === "ink" ? "rgba(245,243,240,0.95)" : "rgba(26,26,30,0.95)",
                      borderRadius: "6px",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      zIndex: 5,
                      boxShadow: isNarrow ? t.blockEditShadow : "none",
                    }}
                    onMouseDown={(e) => { if (e.target !== e.currentTarget) return; e.preventDefault(); }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={inputRef}
                      value={block.title}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((b) => (b.id === block.id ? { ...b, title: e.target.value } : b))
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingBlockId(null);
                        if (e.key === "Escape") {
                          if (block.title === "New Block" || block.title === "") {
                            deleteBlock(block.id);
                          } else {
                            setEditingBlockId(null);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // Don't close if clicking inside the same block (e.g. tag selector)
                        if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("[data-block]")) return;
                        if (block.title === "") deleteBlock(block.id);
                        else setEditingBlockId(null);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: t.inputText,
                        fontSize: isNarrow ? "10px" : "13px",
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 500,
                        textAlign: "center",
                        width: "90%",
                        caretColor: t.caretColor,
                        flexShrink: 0,
                        padding: "6px 0 4px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {tags.length > 0 && (
                      <div
                        style={{
                          flex: 1, display: "flex", flexWrap: "wrap",
                          justifyContent: "center", alignItems: "center",
                          gap: "6px", padding: "4px 8px",
                          overflowY: "auto",
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tags.map((tg) => {
                          const tagColor = activeColors[tg.colorIndex % activeColors.length];
                          const isSelected = block.tagId === tg.id;
                          return (
                            <div
                              key={tg.id}
                              title={tg.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                lastUsedTagRef.current = tg.id;
                                setBlocks((prev) =>
                                  prev.map((b) => b.id === block.id
                                    ? { ...b, tagId: tg.id, colorIndex: tg.colorIndex }
                                    : b
                                  )
                                );
                              }}
                              style={{
                                padding: "2px 8px",
                                borderRadius: "10px",
                                background: isSelected
                                  ? (theme === "light" ? tagColor.lightBg : tagColor.bg)
                                  : `${theme === "light" ? tagColor.lightBg : tagColor.bg}60`,
                                border: isSelected ? `1.5px solid ${t.blockLabelText}` : `1px solid ${t.handleColor}`,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                fontSize: "9px",
                                fontFamily: "'DM Sans', sans-serif",
                                color: t.blockLabelText,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {tg.name}
                            </div>
                          );
                        })}
                        {block.tagId && (
                          <div
                            title="Remove tag"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBlocks((prev) =>
                                prev.map((b) => b.id === block.id
                                  ? { ...b, tagId: null }
                                  : b
                                )
                              );
                            }}
                            style={{
                              padding: "2px 6px",
                              borderRadius: "10px",
                              background: "transparent",
                              border: `1px dashed ${t.handleColor}`,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "9px",
                              color: t.quoteMuted,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ×
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "1px", pointerEvents: "none", overflow: "hidden",
                  }}>
                    <span
                      style={{
                        color: t.blockLabelText,
                        fontSize: isNarrow ? "9px" : isLocked ? "14px" : "12px",
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: isLocked ? 400 : 500,
                        letterSpacing: isLocked ? "0.3px" : "0",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        lineHeight: "1.2",
                        overflow: "hidden",
                        padding: "0 8px",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                        writingMode: (!isVertical && shouldRotateText) ? "vertical-rl" : "horizontal-tb",
                      }}
                    >
                      {block.title}
                    </span>
                    {blockTag && !isNarrow && (
                      <span style={{
                        fontSize: "9px",
                        fontFamily: "'DM Sans', sans-serif",
                        color: t.timeRangeText,
                        whiteSpace: "nowrap",
                        writingMode: (!isVertical && shouldRotateText) ? "vertical-rl" : "horizontal-tb",
                      }}>
                        {blockTag.name}
                      </span>
                    )}
                  </div>
                )}

                {/* Time range tooltip (edit mode) */}
                {!isLocked && !isNarrow && (
                  <div style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "9px",
                    fontFamily: "'DM Sans', sans-serif",
                    color: t.timeRangeText,
                    whiteSpace: "nowrap",
                  }}>
                    {formatTime(slotToMinutes(block.startSlot, hoursStart))} – {formatTime(slotToMinutes(block.endSlot, hoursStart))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Current time marker */}
          {isCurrentTimeVisible && (
            <div
              style={{
                position: "absolute",
                ...(isVertical
                  ? { top: `${currentTimePercent}%`, left: 0, right: 0, height: "2px" }
                  : { left: `${currentTimePercent}%`, top: 0, bottom: 0, width: "2px" }),
                background: isLocked
                  ? t.timeMarkerLocked
                  : t.timeMarkerEdit,
                zIndex: 15,
                pointerEvents: "none",
                transition: "background 0.5s ease",
              }}
            >
              <div style={{
                position: "absolute",
                ...(isVertical
                  ? { left: "-3px", top: "-4px" }
                  : { top: "-3px", left: "-4px" }),
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: isLocked ? t.timeMarkerDotLocked : t.timeMarkerDotEdit,
                boxShadow: isLocked ? t.timeMarkerGlow : "none",
                transition: "all 0.5s ease",
              }} />
            </div>
          )}
        </div>

        {/* Bottom hint (horizontal only) */}
        {!isVertical && (
          <div style={{
            textAlign: "center",
            marginTop: "6px",
            fontSize: "11px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            color: t.hintText,
            height: "16px",
            transition: "opacity 0.5s ease",
            opacity: isLocked ? 0 : 1,
          }}>
            click empty space to add · double-click to rename · drag edges to resize · long-press lock to toggle
          </div>
        )}
      </div>

      {/* Quote (hidden in vertical/mobile mode) */}
      {!isVertical && mergedQuotes.length > 0 && (
        <div
          onClick={() => setQuoteData((prev) => {
            if (mergedQuotes.length <= 1) return prev;
            let next;
            do { next = Math.floor(Math.random() * mergedQuotes.length); } while (next === prev.index);
            return { ...prev, index: next };
          })}
          title="Click for another quote"
          style={{
            textAlign: "center",
            padding: "20px 40px 12px",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontStyle: "normal",
            fontSize: "13px",
            fontWeight: 300,
            color: t.quoteMuted,
            lineHeight: 1.5,
            margin: "0 auto",
            transition: "color 0.5s ease",
          }}>
            &ldquo;{mergedQuotes[quoteIndex].text}&rdquo;
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            color: t.quoteMuted,
            marginTop: "6px",
            fontWeight: 300,
            opacity: 0.7,
            transition: "color 0.5s ease",
          }}>
            — {mergedQuotes[quoteIndex].author}
          </div>
        </div>
      )}

      {/* Notepad area (hidden in vertical/mobile mode) */}
      {!isVertical && (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 24px 16px",
          minHeight: 0,
          maxWidth: tags.length <= 2 ? "700px" : `${tags.length * 340}px`,
          width: "100%",
          margin: "0 auto",
          transition: "max-width 0.3s ease",
        }}>
          <div style={{
            borderTop: `1px solid ${t.noteBorder}`,
            marginBottom: "8px",
            transition: "border-color 0.5s ease",
          }} />
          <NotepadArea theme={t} tags={tags} activeColors={activeColors} onCloudSave={saveToCloud} notesVersion={notesVersion} isMuted={isMuted} setIsMuted={setIsMuted} />
        </div>
      )}

      {/* Settings panel */}
      <div
        onClick={() => setShowSettings(false)}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", zIndex: 100,
          opacity: showSettings ? 1 : 0,
          pointerEvents: showSettings ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "320px", maxWidth: "90vw",
        background: t.bgLocked, borderLeft: t.timelineBorder, zIndex: 101,
        padding: "24px", overflowY: "auto", fontFamily: "'DM Sans', sans-serif",
        display: "flex", flexDirection: "column", gap: "24px",
        transition: "background 0.5s ease, transform 0.3s ease",
        transform: showSettings ? "translateX(0)" : "translateX(100%)",
      }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: t.noteText, fontSize: "16px", fontWeight: 500 }}>Settings</div>
              <div
                onClick={() => setShowSettings(false)}
                style={{
                  width: 28, height: 28, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", borderRadius: "50%",
                  fontSize: "18px", color: t.toggleIcon, transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.toggleHoverBg}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                ×
              </div>
            </div>

            {/* Day Range */}
            <div>
              <div style={{ color: t.noteText, fontSize: "13px", fontWeight: 500, marginBottom: "12px" }}>
                Day Range
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: t.quoteMuted, fontSize: "11px", marginBottom: "4px" }}>Start</div>
                  <select
                    value={hoursStart}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setHoursStart(val);
                      try { localStorage.setItem("timeblock-hours", JSON.stringify({ start: val, end: hoursEnd })); } catch {}
                    }}
                    style={{
                      width: "100%", padding: "6px 8px", borderRadius: "6px",
                      border: t.timelineBorder, background: t.noteBg,
                      color: t.noteText, fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                      outline: "none", cursor: "pointer",
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} disabled={i >= hoursEnd}>
                        {i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ color: t.quoteMuted, fontSize: "13px", marginTop: "16px" }}>to</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: t.quoteMuted, fontSize: "11px", marginBottom: "4px" }}>End</div>
                  <select
                    value={hoursEnd}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setHoursEnd(val);
                      try { localStorage.setItem("timeblock-hours", JSON.stringify({ start: hoursStart, end: val })); } catch {}
                    }}
                    style={{
                      width: "100%", padding: "6px 8px", borderRadius: "6px",
                      border: t.timelineBorder, background: t.noteBg,
                      color: t.noteText, fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                      outline: "none", cursor: "pointer",
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h} disabled={h <= hoursStart}>
                        {h === 24 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div style={{ color: t.noteText, fontSize: "13px", fontWeight: 500, marginBottom: "12px" }}>
                Tags
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {tags.map((tg) => {
                  const tagColor = activeColors[tg.colorIndex % activeColors.length];
                  const blocksWithTag = blocks.filter((b) => b.tagId === tg.id).length;
                  return (
                    <div key={tg.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Color swatches — click to change tag color */}
                      <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                        {activeColors.map((c, ci) => (
                          <div
                            key={ci}
                            onClick={() => {
                              setTags((prev) => prev.map((pt) =>
                                pt.id === tg.id ? { ...pt, colorIndex: ci } : pt
                              ));
                            }}
                            style={{
                              width: tg.colorIndex === ci ? "14px" : "10px",
                              height: tg.colorIndex === ci ? "14px" : "10px",
                              borderRadius: "50%",
                              background: theme === "light" ? c.lightBg : c.bg,
                              border: tg.colorIndex === ci ? `2px solid ${t.noteText}` : "1px solid transparent",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          />
                        ))}
                      </div>
                      <div style={{
                        flex: 1, color: t.noteText, fontSize: "13px",
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {tg.name}
                      </div>
                      <div
                        onClick={() => {
                          const count = blocks.filter((b) => b.tagId === tg.id).length;
                          if (count > 0 && !window.confirm(`Remove tag from ${count} block${count > 1 ? "s" : ""}?`)) return;
                          // Snapshot colorIndex on blocks that had this tag, then remove tag
                          setBlocks((prev) => prev.map((b) =>
                            b.tagId === tg.id ? { ...b, tagId: null, colorIndex: tg.colorIndex } : b
                          ));
                          setTags((prev) => prev.filter((pt) => pt.id !== tg.id));
                        }}
                        style={{
                          width: "20px", height: "20px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", fontSize: "12px", color: t.quoteMuted,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.6"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                      >
                        ×
                      </div>
                    </div>
                  );
                })}
                {/* Add tag row */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.elements.tagName;
                    const name = input.value.trim();
                    if (!name) return;
                    // Cycle through colors — pick next unused color
                    const usedColors = tags.map((tg) => tg.colorIndex);
                    let colorIndex = 0;
                    for (let i = 0; i < activeColors.length; i++) {
                      if (!usedColors.includes(i)) { colorIndex = i; break; }
                      if (i === activeColors.length - 1) colorIndex = (tags.length) % activeColors.length;
                    }
                    const newTagId = `tag_${Date.now()}`;
                    // If this is the first tag, migrate _general notes to it
                    if (tags.length === 0) {
                      try {
                        const raw = localStorage.getItem("timeblock-notes");
                        if (raw) {
                          const parsed = JSON.parse(raw);
                          if (parsed && parsed["_general"]) {
                            parsed[newTagId] = parsed["_general"];
                            localStorage.setItem("timeblock-notes", JSON.stringify(parsed));
                          }
                        }
                      } catch {}
                    }
                    setTags((prev) => [...prev, {
                      id: newTagId,
                      name,
                      colorIndex,
                    }]);
                    input.value = "";
                  }}
                  style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}
                >
                  <input
                    name="tagName"
                    placeholder="New tag..."
                    maxLength={24}
                    style={{
                      flex: 1, padding: "6px 10px", borderRadius: "6px",
                      border: t.timelineBorder, background: t.noteBg,
                      color: t.noteText, fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif", outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "6px 12px", borderRadius: "6px",
                      border: t.timelineBorder, background: t.noteBg,
                      color: t.noteText, fontSize: "12px",
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* Dark Theme Variant */}
            {theme === "dark" && (
              <div>
                <div style={{ color: t.noteText, fontSize: "13px", fontWeight: 500, marginBottom: "12px" }}>
                  Dark Theme
                </div>
                {[
                  { key: "default", label: "Default" },
                  { key: "coolMineral", label: "Cool Mineral" },
                  { key: "warmDesert", label: "Warm Desert" },
                  { key: "mutedBotanical", label: "Muted Botanical" },
                ].map((variant) => (
                  <label
                    key={variant.key}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "6px 0", cursor: "pointer", fontSize: "13px",
                      color: t.noteText,
                    }}
                  >
                    <input
                      type="radio"
                      name="darkVariant"
                      checked={darkVariant === variant.key}
                      onChange={() => setDarkVariant(variant.key)}
                      style={{ accentColor: t.noteText, cursor: "pointer" }}
                    />
                    {variant.label}
                  </label>
                ))}
              </div>
            )}

            {/* Quote Categories */}
            <div>
              <div style={{ color: t.noteText, fontSize: "13px", fontWeight: 500, marginBottom: "12px" }}>
                Quote Categories
              </div>
              {["stoic", "buddhist", "philosophical", "productivity"].map((cat) => (
                <label
                  key={cat}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "6px 0", cursor: "pointer", fontSize: "13px",
                    color: t.noteText, textTransform: "capitalize",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={quoteCategories.includes(cat)}
                    onChange={() => {
                      setQuoteCategories((prev) => {
                        const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
                        if (next.length === 0) return prev;
                        return next;
                      });
                    }}
                    style={{ accentColor: t.noteText, cursor: "pointer" }}
                  />
                  {cat}
                </label>
              ))}
            </div>

            {/* Desktop App — hidden inside Electron */}
            {!isElectron && (
              <div style={{ borderTop: `1px solid ${t.timelineBorder}`, paddingTop: "20px" }}>
                <div style={{ color: t.noteText, fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>
                  Desktop App
                </div>
                <div style={{ color: t.quoteMuted, fontSize: "11px", marginBottom: "12px" }}>
                  Download Meridian for your desktop
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {/* Windows download */}
                  <a
                    href="https://github.com/aptorian/meridian/releases/latest"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      padding: "10px 12px", borderRadius: "8px", textDecoration: "none",
                      border: `1px solid ${t.timelineBorder}`,
                      background: userPlatform === "windows" ? t.noteBg : "transparent",
                      color: t.noteText, fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                      fontWeight: userPlatform === "windows" ? 500 : 400,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={t.noteText}>
                      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                    </svg>
                    Windows
                  </a>
                  {/* macOS download */}
                  <a
                    href="https://github.com/aptorian/meridian/releases/latest"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMacHelp(true)}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      padding: "10px 12px", borderRadius: "8px", textDecoration: "none",
                      border: `1px solid ${t.timelineBorder}`,
                      background: userPlatform === "mac" ? t.noteBg : "transparent",
                      color: t.noteText, fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                      fontWeight: userPlatform === "mac" ? 500 : 400,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={t.noteText}>
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    macOS
                  </a>
                </div>
                {showMacHelp && (
                  <div style={{
                    marginTop: "10px", padding: "12px", borderRadius: "8px",
                    background: t.noteBg, border: `1px solid ${t.timelineBorder}`,
                  }}>
                    <div style={{ color: t.noteText, fontSize: "11px", fontWeight: 500, marginBottom: "8px" }}>
                      First launch on macOS
                    </div>
                    <div style={{ color: t.quoteMuted, fontSize: "11px", lineHeight: "1.6" }}>
                      1. Open the .dmg and drag Meridian to Applications<br />
                      2. Right-click the app and select <b style={{ color: t.noteText }}>Open</b><br />
                      3. Click <b style={{ color: t.noteText }}>Open</b> in the dialog that appears
                    </div>
                    <div style={{ color: t.quoteMuted, fontSize: "10px", marginTop: "8px", opacity: 0.7 }}>
                      This is only needed once. macOS requires this for apps downloaded outside the App Store.
                    </div>
                    <div
                      onClick={() => setShowMacHelp(false)}
                      style={{
                        color: t.quoteMuted, fontSize: "10px", marginTop: "8px",
                        cursor: "pointer", textDecoration: "underline", opacity: 0.7,
                      }}
                    >
                      Dismiss
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account */}
            <div style={{ borderTop: `1px solid ${t.timelineBorder}`, paddingTop: "20px" }}>
              <div style={{ color: t.noteText, fontSize: "13px", fontWeight: 500, marginBottom: "12px" }}>
                Account
              </div>
              {user ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ color: t.quoteMuted, fontSize: "12px" }}>
                    Signed in as {user.email}
                  </div>
                  <div style={{ color: t.quoteMuted, fontSize: "11px", opacity: 0.7 }}>
                    Your data syncs automatically
                  </div>
                  <button
                    onClick={signOut}
                    style={{
                      padding: "8px 16px", borderRadius: "8px", border: t.timelineBorder,
                      background: "transparent", color: t.noteText, fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ color: t.quoteMuted, fontSize: "11px", marginBottom: "4px" }}>
                    Sign in to sync your schedule across devices
                  </div>
                  <button
                    onClick={signInWithGoogle}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      padding: "10px 16px", borderRadius: "8px",
                      border: t.timelineBorder, background: t.noteBg,
                      color: t.noteText, fontSize: "13px",
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              )}
            </div>

            {/* Google Calendar */}
            {user && (
              <div style={{ borderTop: `1px solid ${t.timelineBorder}`, paddingTop: "20px" }}>
                <div style={{ color: t.noteText, fontSize: "13px", fontWeight: 500, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  Google Calendar
                  <span style={{ fontSize: "9px", color: t.quoteMuted, border: `1px solid ${t.timelineBorder}`, borderRadius: "4px", padding: "1px 5px", fontWeight: 400 }}>beta</span>
                </div>
                {!calendarEnabled ? (
                  <div>
                    <div style={{ color: t.quoteMuted, fontSize: "11px", marginBottom: "12px" }}>
                      Sync your Google Calendar events to your timeline
                    </div>
                    <button
                      onClick={() => { connectCalendar(); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        width: "100%", padding: "10px 16px", borderRadius: "8px",
                        border: t.timelineBorder, background: t.noteBg,
                        color: t.noteText, fontSize: "13px",
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.noteText} strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Connect Calendar
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Calendar list */}
                    {availableCalendars.length > 0 ? (
                      <div>
                        <div style={{ color: t.quoteMuted, fontSize: "11px", marginBottom: "6px" }}>Your calendars</div>
                        {availableCalendars.map((cal) => (
                          <label
                            key={cal.id}
                            style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              padding: "4px 0", cursor: "pointer", fontSize: "12px", color: t.noteText,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={calendarIds.includes(cal.id)}
                              onChange={() => {
                                setCalendarIds((prev) =>
                                  prev.includes(cal.id) ? prev.filter((id) => id !== cal.id) : [...prev, cal.id]
                                );
                              }}
                              style={{ accentColor: cal.backgroundColor || t.noteText, cursor: "pointer" }}
                            />
                            <div style={{
                              width: "8px", height: "8px", borderRadius: "50%",
                              background: cal.backgroundColor || "#4285F4", flexShrink: 0,
                            }} />
                            {cal.summary}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: t.quoteMuted, fontSize: "11px" }}>
                        Loading calendars...
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => fetchCalendars()}
                        style={{
                          padding: "6px 12px", borderRadius: "6px",
                          border: t.timelineBorder, background: "transparent",
                          color: t.quoteMuted, fontSize: "11px",
                          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => {
                          setCalendarEnabled(false);
                          setCalendarIds([]);
                          setAvailableCalendars([]);
                          setCalendarEvents([]);
                          localStorage.removeItem("timeblock-cal-provider-token");
                        }}
                        style={{
                          padding: "6px 12px", borderRadius: "6px",
                          border: t.timelineBorder, background: "transparent",
                          color: t.quoteMuted, fontSize: "11px",
                          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
    </div>
  );
}
