import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const DEFAULT_HOURS_START = 6;
const DEFAULT_HOURS_END = 22;
const SLOT_MINUTES = 15;
const STORAGE_KEY = "timeblock-blocks";
const NOTES_KEY = "timeblock-notes";
const MUTE_KEY = "timeblock-muted";

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
    dateText: "rgba(75,55,40,0.5)",
    dateTextEdit: "rgba(75,55,40,0.7)",
    hourLabel: "rgba(75,55,40,0.3)",
    hourLabelEdit: "rgba(75,55,40,0.45)",
    hoverPlus: "rgba(75,55,40,0.4)",
    deleteX: "rgba(75,55,40,0.7)",
    inputText: "rgba(60,40,25,0.95)",
    caretColor: "#3b3228",
    blockLabelText: "rgba(60,40,25,0.95)",
    timeRangeText: "rgba(75,55,40,0.5)",
    hintText: "rgba(75,55,40,0.2)",
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
    notePlaceholder: "rgba(75,55,40,0.3)",
    noteBorder: "rgba(75,55,40,0.1)",
    quoteMuted: "rgba(75,55,40,0.55)",
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
    dateText: "rgba(0,0,0,0.4)",
    dateTextEdit: "rgba(0,0,0,0.6)",
    hourLabel: "rgba(0,0,0,0.3)",
    hourLabelEdit: "rgba(0,0,0,0.45)",
    hoverPlus: "rgba(0,0,0,0.4)",
    deleteX: "rgba(0,0,0,0.7)",
    inputText: "rgba(0,0,0,0.9)",
    caretColor: "#1a1a1a",
    blockLabelText: "rgba(0,0,0,0.85)",
    timeRangeText: "rgba(0,0,0,0.4)",
    hintText: "rgba(0,0,0,0.2)",
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
    notePlaceholder: "rgba(0,0,0,0.25)",
    noteBorder: "rgba(0,0,0,0.1)",
    quoteMuted: "rgba(0,0,0,0.35)",
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

const DEFAULT_BLOCKS = [
  { id: "1", title: "Workout", startSlot: 4, endSlot: 8, colorIndex: 0 },
  { id: "2", title: "Read", startSlot: 8, endSlot: 10, colorIndex: 3 },
  { id: "3", title: "Sit", startSlot: 10, endSlot: 12, colorIndex: 3 },
  { id: "4", title: "Breakfast", startSlot: 12, endSlot: 16, colorIndex: 3 },
  { id: "5", title: "Work Meeting", startSlot: 18, endSlot: 26, colorIndex: 4 },
  { id: "6", title: "Deep Work Block", startSlot: 26, endSlot: 34, colorIndex: 4 },
  { id: "7", title: "Coffee w/ John", startSlot: 34, endSlot: 38, colorIndex: 1 },
  { id: "8", title: "Dinner", startSlot: 44, endSlot: 48, colorIndex: 5 },
];

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

const TODAY = new Date();
const DATE_STR = TODAY.toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

function Notepad({ theme: t }) {
  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const soundsRef = useRef(null);
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem(MUTE_KEY) === "true"; } catch { return false; }
  });
  const [isHovered, setIsHovered] = useState(false);
  const [fmtState, setFmtState] = useState({ bold: false, italic: false, ol: false, ul: false, checkbox: false });
  const checkboxModeRef = useRef(false);

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

  // Load saved content
  useEffect(() => {
    if (editorRef.current) {
      try {
        const saved = localStorage.getItem(NOTES_KEY);
        if (saved) editorRef.current.innerHTML = saved;
      } catch {}
    }
  }, []);

  // Preload sounds
  useEffect(() => {
    const sounds = {
      enter: new Audio("/sounds/enter.wav"),
      delete: new Audio("/sounds/delete.wav"),
      space: new Audio("/sounds/space.wav"),
      key: new Audio("/sounds/key.wav"),
      key2: new Audio("/sounds/key2.wav"),
    };
    Object.values(sounds).forEach((s) => { s.volume = 0.26; s.preload = "auto"; });
    soundsRef.current = sounds;
  }, []);

  // Persist mute
  useEffect(() => {
    try { localStorage.setItem(MUTE_KEY, String(isMuted)); } catch {}
  }, [isMuted]);

  function saveContent() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        if (editorRef.current) localStorage.setItem(NOTES_KEY, editorRef.current.innerHTML);
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

  function handleKeyDown(e) {
    const k = e.key;
    if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"].includes(k)) return;
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
      {/* Toolbar — visible on hover */}
      <div style={{
        display: "flex", alignItems: "center", gap: "2px", padding: "0 4px 4px",
        opacity: isHovered ? 1 : 0, transition: "opacity 0.2s ease",
        pointerEvents: isHovered ? "auto" : "none",
      }}>
        {fmtBtn(<strong>B</strong>, "Bold (⌘B)", () => document.execCommand("bold"), fmtState.bold)}
        {fmtBtn(<em>I</em>, "Italic (⌘I)", () => document.execCommand("italic"), fmtState.italic)}
        {fmtBtn("1.", "Ordered list (⌘⇧7)", () => document.execCommand("insertOrderedList"), fmtState.ol)}
        {fmtBtn("•", "Bullet list (⌘⇧8)", () => document.execCommand("insertUnorderedList"), fmtState.ul)}
        {fmtBtn("☐", "Checkbox (⌘⇧9)", () => toggleCheckboxList(), fmtState.checkbox)}
        <div style={{ flex: 1 }} />
        {/* Mute toggle */}
        <div
          onClick={(e) => { e.stopPropagation(); setIsMuted((p) => !p); }}
          title={isMuted ? "Unmute sounds" : "Mute sounds"}
          style={{
            width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: "4px",
            opacity: isMuted ? 1 : 0.5,
            background: isMuted ? t.noteBorder : "transparent",
            transition: "opacity 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => { if (!isMuted) { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = t.noteBorder; } }}
          onMouseLeave={(e) => { if (!isMuted) { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.background = "transparent"; } }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.noteText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { saveContent(); updateFmtState(); }}
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

export default function Meridian() {
  const [blocks, setBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Corrupted data — fall through to defaults
    }
    return DEFAULT_BLOCKS;
  });
  const [isLocked, setIsLocked] = useState(true);
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
  const [isVertical, setIsVertical] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches
  );
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
  const [quoteData, setQuoteData] = useState(() => {
    const today = new Date().toDateString();
    try {
      const saved = JSON.parse(localStorage.getItem("timeblock-quote"));
      if (saved?.date === today && typeof saved.index === "number") return saved;
    } catch {}
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash |= 0;
    }
    const cats = (() => { try { const s = JSON.parse(localStorage.getItem("timeblock-quote-categories")); return Array.isArray(s) && s.length > 0 ? s : ["stoic"]; } catch { return ["stoic"]; } })();
    const pool = cats.flatMap((c) => QUOTE_CATEGORIES[c] || []);
    return { date: today, index: Math.abs(hash) % Math.max(1, pool.length) };
  });
  // Persist quote data
  useEffect(() => {
    try { localStorage.setItem("timeblock-quote", JSON.stringify(quoteData)); } catch {}
  }, [quoteData]);
  // Reset quote index if categories change and index is out of range
  useEffect(() => {
    if (mergedQuotes.length > 0 && quoteData.index >= mergedQuotes.length) {
      setQuoteData((prev) => ({ ...prev, index: 0 }));
    }
    try { localStorage.setItem("timeblock-quote-categories", JSON.stringify(quoteCategories)); } catch {}
  }, [quoteCategories, mergedQuotes.length]);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const handler = (e) => setIsVertical(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
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

  // Persist blocks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    } catch {
      // Storage full or unavailable
    }
  }, [blocks]);

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

  // Long press for padlock toggle
  const startLongPress = useCallback(() => {
    let start = performance.now();
    const duration = isLocked ? 510 : 120;
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
    return Math.max(0, Math.min(slots - 1, Math.round(pct * slots)));
  }

  function getSlotFromY(clientY) {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const pct = y / rect.height;
    return Math.max(0, Math.min(slots - 1, Math.round(pct * slots)));
  }

  function getSlotFromPointer(e) {
    return isVertical ? getSlotFromY(e.clientY) : getSlotFromX(e.clientX);
  }

  // Click empty space to create block
  function handleTimelineClick(e) {
    if (isLocked || dragState || resizeState || reorderState) return;
    if (e.target.closest("[data-block]")) return;
    const slot = getSlotFromPointer(e);
    const empty = findEmptySlot(blocks, slot, slots);
    if (!empty) return;
    const id = String(nextIdRef.current++);
    const newBlock = {
      id,
      title: "New Block",
      startSlot: empty.start,
      endSlot: empty.end,
      colorIndex: getNextColor(blocks),
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
    const slot = getSlotFromPointer(e);
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

  const isCurrentTimeVisible = currentTimePercent > 0 && currentTimePercent < 100;

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
      {/* Top bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        flexShrink: 0,
      }}>
        <div style={{
          color: isLocked ? t.dateText : t.dateTextEdit,
          fontSize: "13px",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          letterSpacing: "0.5px",
          transition: "color 0.5s ease",
        }}>
          {DATE_STR}
        </div>

        {/* Right-side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Theme toggle — cycles light → dark → ink */}
          <div
            onClick={() => setTheme((prev) => prev === "light" ? "dark" : prev === "dark" ? "ink" : "light")}
            style={{
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = t.toggleHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.toggleIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.5s ease" }}>
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
                <path d="M12 2C12 2 8 9 8 13a4 4 0 0 0 8 0c0-4-4-11-4-11z" />
              )}
            </svg>
          </div>

          {/* Settings gear */}
          <div
            onClick={() => setShowSettings((prev) => !prev)}
            style={{
              width: 32, height: 32, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", borderRadius: "50%",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = t.toggleHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.toggleIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.5s ease" }}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>

          {/* Padlock toggle - long press */}
          <div
            onMouseDown={startLongPress}
            onMouseUp={endLongPress}
            onMouseLeave={endLongPress}
            style={{
              position: "relative",
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Progress ring */}
            <svg
              width="36"
              height="36"
              style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
            >
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke={longPressProgress > 0 ? (isLocked ? t.progressRingLocked : t.progressRingUnlocked) : "transparent"}
                strokeWidth="2"
                strokeDasharray={`${longPressProgress * 94.25} 94.25`}
                style={{ transition: longPressProgress === 0 ? "stroke 0.2s" : "none" }}
              />
            </svg>
            {/* Lock icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isLocked ? t.lockStrokeLocked : t.lockStrokeUnlocked} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s", position: "relative", zIndex: 1 }}>
              {isLocked ? (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              ) : (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </>
              )}
            </svg>
          </div>
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

          {/* Time blocks */}
          {blocks.map((block) => {
            const posPct = (block.startSlot / slots) * 100;
            const sizePct = ((block.endSlot - block.startSlot) / slots) * 100;
            const color = activeColors[block.colorIndex % activeColors.length];
            const blockBg = t.isInk
              ? (blocks.indexOf(block) % 2 === 0 ? t.inkBlockA : t.inkBlockB)
              : theme === "light" ? color.lightBg : color.bg;
            const isEditing = editingBlockId === block.id;
            const blockSpan = block.endSlot - block.startSlot;
            const isNarrow = blockSpan <= 2;
            const shouldRotateText = isNarrow && block.title.length > 5;

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
                  zIndex: reorderState?.blockId === block.id ? 20 : 2,
                  overflow: "hidden",
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

                {/* Block label */}
                {isEditing ? (
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
                    onBlur={() => {
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
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
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
                      pointerEvents: "none",
                      writingMode: (!isVertical && shouldRotateText) ? "vertical-rl" : "horizontal-tb",
                    }}
                  >
                    {block.title}
                  </span>
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
            &ldquo;{mergedQuotes[quoteData.index % mergedQuotes.length].text}&rdquo;
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
            — {mergedQuotes[quoteData.index % mergedQuotes.length].author}
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
          maxWidth: "700px",
          width: "100%",
          margin: "0 auto",
        }}>
          <div style={{
            borderTop: `1px solid ${t.noteBorder}`,
            marginBottom: "8px",
            transition: "border-color 0.5s ease",
          }} />
          <Notepad theme={t} />
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
          </div>
    </div>
  );
}
