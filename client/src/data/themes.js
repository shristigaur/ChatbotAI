export const themes = {
  day: {
    id: 'day', label: 'Daytime', emoji: '☀️',
    outfit: 'day',
    colors: {
      bg: 'from-sky-200 to-sky-50',
      sidebar: 'bg-white/80',
      userBubble: 'bg-sky-500 text-white',
      botBubble: 'bg-white text-gray-800',
      button: 'bg-sky-500 hover:bg-sky-600'
    },
    Background: 'DayBackground'
  },
  night: {
    id: 'night', label: 'Nighttime', emoji: '🌙',
    outfit: 'night',
    colors: {
      bg: 'from-slate-900 to-indigo-900',
      sidebar: 'bg-slate-950/80 text-white',
      userBubble: 'bg-indigo-500 text-white',
      botBubble: 'bg-slate-800 text-indigo-100',
      button: 'bg-indigo-500 hover:bg-indigo-600'
    },
    Background: 'NightBackground'
  },
  sunset: {
    id: 'sunset', label: 'Sunset', emoji: '🌅',
    outfit: 'day',
    colors: {
      bg: 'from-orange-400 to-rose-300',
      sidebar: 'bg-orange-50/80',
      userBubble: 'bg-orange-500 text-white',
      botBubble: 'bg-white text-orange-900',
      button: 'bg-orange-500 hover:bg-orange-600'
    },
    Background: 'SunsetBackground'
  },
  ocean: {
    id: 'ocean', label: 'Ocean', emoji: '🌊',
    outfit: 'beach',
    colors: {
      bg: 'from-cyan-500 to-blue-400',
      sidebar: 'bg-cyan-900/60 text-white',
      userBubble: 'bg-teal-500 text-white',
      botBubble: 'bg-cyan-100 text-cyan-900',
      button: 'bg-teal-500 hover:bg-teal-600'
    },
    Background: 'OceanBackground'
  },
  forest: {
    id: 'forest', label: 'Forest', emoji: '🌲',
    outfit: 'winter',
    colors: {
      bg: 'from-emerald-700 to-green-400',
      sidebar: 'bg-green-950/60 text-white',
      userBubble: 'bg-lime-600 text-white',
      botBubble: 'bg-emerald-100 text-emerald-900',
      button: 'bg-lime-600 hover:bg-lime-700'
    },
    Background: 'ForestBackground'
  },
  candy: {
    id: 'candy', label: 'Candy', emoji: '🍬',
    outfit: 'party',
    colors: {
      bg: 'from-pink-300 to-fuchsia-200',
      sidebar: 'bg-pink-50/90',
      userBubble: 'bg-fuchsia-500 text-white',
      botBubble: 'bg-white text-fuchsia-900',
      button: 'bg-fuchsia-500 hover:bg-fuchsia-600'
    },
    Background: 'CandyBackground'
  }
};
