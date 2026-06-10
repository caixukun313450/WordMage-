const Storage = (() => {
  const KEYS = {
    stars: 'wm_stars',
    lastStarDate: 'wm_last_star_date',
    stories: 'wm_stories',
    storyCount: 'wm_story_count',
    treasureUnlocked: 'wm_treasure_unlocked'
  };

  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function getStars() {
    return get(KEYS.stars, 0);
  }

  function addDailyStar() {
    const last = localStorage.getItem(KEYS.lastStarDate);
    if (last === today()) return false;
    const stars = getStars() + 1;
    set(KEYS.stars, stars);
    localStorage.setItem(KEYS.lastStarDate, today());
    return true;
  }

  function isTreasureUnlocked() {
    return get(KEYS.treasureUnlocked, false);
  }

  function unlockTreasure() {
    set(KEYS.treasureUnlocked, true);
  }

  function saveStory(words, title) {
    const stories = get(KEYS.stories, []);
    stories.unshift({
      id: Date.now(),
      words,
      title,
      date: new Date().toISOString()
    });
    set(KEYS.stories, stories.slice(0, 100));

    const count = get(KEYS.storyCount, 0) + 1;
    set(KEYS.storyCount, count);
    return count;
  }

  function getStories() {
    return get(KEYS.stories, []);
  }

  function getStoryCount() {
    return get(KEYS.storyCount, 0);
  }

  function getRecentWords(days = 7) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const stories = getStories();
    const wordMap = new Map();

    stories
      .filter(s => new Date(s.date).getTime() >= cutoff)
      .forEach(s => {
        (s.words || []).forEach(w => {
          const key = w.toLowerCase();
          if (!wordMap.has(key)) {
            wordMap.set(key, { word: w, count: 0, lastSeen: s.date });
          }
          const entry = wordMap.get(key);
          entry.count++;
          if (s.date > entry.lastSeen) entry.lastSeen = s.date;
        });
      });

    return Array.from(wordMap.values()).sort((a, b) => b.count - a.count);
  }

  function getWordFrequency() {
    const stories = getStories();
    const freq = {};
    stories.forEach(s => {
      (s.words || []).forEach(w => {
        const key = w.toLowerCase();
        freq[key] = (freq[key] || 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }

  function getAllLearnedWords() {
    const stories = getStories();
    const set = new Set();
    stories.forEach(s => (s.words || []).forEach(w => set.add(w.toLowerCase())));
    return Array.from(set);
  }

  return {
    getStars,
    addDailyStar,
    isTreasureUnlocked,
    unlockTreasure,
    saveStory,
    getStories,
    getStoryCount,
    getRecentWords,
    getWordFrequency,
    getAllLearnedWords
  };
})();
