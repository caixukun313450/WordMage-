(() => {
  const MAX_WORDS = 5;
  let wordBank = [];
  let selectedWords = [];
  let lastStoryEn = '';
  let lastStoryZh = '';

  const $ = id => document.getElementById(id);

  async function init() {
    await loadWordBank();
    setupTabs();
    setupDailyWords();
    setupWordInput();
    setupGenerate();
    setupTTS();
    setupGame();
    setupTreasure();
    refreshUI();
  }

  async function loadWordBank() {
    const res = await fetch('/data/words.json');
    wordBank = await res.json();
    renderWordBank();
  }

  function setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        $(`tab-${tab.dataset.tab}`).classList.add('active');
        if (tab.dataset.tab === 'review') renderReview();
        if (tab.dataset.tab === 'report') renderReport();
      });
    });
  }

  function seededRandom(seed) {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  function setupDailyWords() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const rand = seededRandom(seed);
    const indices = new Set();
    while (indices.size < 3 && indices.size < wordBank.length) {
      indices.add(Math.floor(rand() * wordBank.length));
    }
    const daily = Array.from(indices).map(i => wordBank[i]);
    const container = $('dailyWords');
    container.innerHTML = daily.map(w =>
      `<span class="daily-word" data-word="${w.word}">${w.word} · ${w.zh}</span>`
    ).join('');
    container.querySelectorAll('.daily-word').forEach(el => {
      el.addEventListener('click', () => addWord(el.dataset.word));
    });
  }

  function setupWordInput() {
    $('addWordBtn').addEventListener('click', () => {
      addWord($('wordInput').value);
      $('wordInput').value = '';
    });
    $('wordInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        addWord($('wordInput').value);
        $('wordInput').value = '';
      }
    });
    $('toggleBankBtn').addEventListener('click', () => {
      $('wordBank').classList.toggle('hidden');
    });
  }

  function addWord(raw) {
    const word = raw.trim().toLowerCase().replace(/[^a-z\-']/g, '');
    if (!word) return;
    if (selectedWords.length >= MAX_WORDS) {
      toast('最多添加 5 个单词');
      return;
    }
    if (selectedWords.includes(word)) {
      toast('单词已添加');
      return;
    }
    selectedWords.push(word);
    renderSelectedWords();
  }

  function removeWord(word) {
    selectedWords = selectedWords.filter(w => w !== word);
    renderSelectedWords();
  }

  function renderSelectedWords() {
    $('selectedWords').innerHTML = selectedWords.map(w =>
      `<span class="word-tag">${w}<button data-word="${w}">×</button></span>`
    ).join('');
    $('selectedWords').querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => removeWord(btn.dataset.word));
    });
  }

  function renderWordBank() {
    $('wordBank').innerHTML = wordBank.map(w =>
      `<span class="word-bank-item" data-word="${w.word}">${w.word}</span>`
    ).join('');
    $('wordBank').querySelectorAll('.word-bank-item').forEach(el => {
      el.addEventListener('click', () => addWord(el.dataset.word));
    });
  }

  function setupGenerate() {
    $('generateBtn').addEventListener('click', generateStory);
  }

  async function generateStory() {
    if (selectedWords.length === 0) {
      toast('请至少输入 1 个单词');
      return;
    }
    const btn = $('generateBtn');
    btn.disabled = true;
    btn.textContent = '🪄 魔法施展中...';

    try {
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: selectedWords })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '生成失败');

      lastStoryEn = data.storyEn;
      lastStoryZh = data.storyZh;

      $('storyTitle').textContent = data.title;
      $('storyEn').innerHTML = highlightWords(data.storyEn, data.words);
      $('storyZh').textContent = data.storyZh;
      $('storyCard').classList.remove('hidden');
      $('demoBadge').classList.toggle('hidden', !data.demoMode);

      const count = Storage.saveStory(data.words, data.title);
      const gotStar = Storage.addDailyStar();
      if (gotStar) toast('⭐ 获得 1 颗星星！');

      refreshUI();

      if (count % 3 === 0) {
        setTimeout(() => openGame(), 800);
      }
    } catch (e) {
      toast(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = '🪄 生成魔法故事';
    }
  }

  function highlightWords(text, words) {
    let result = escapeHtml(text);
    words.forEach(w => {
      const re = new RegExp(`\\b(${escapeRegex(w)})\\b`, 'gi');
      result = result.replace(re, '<span class="highlight">$1</span>');
    });
    return result;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function setupTTS() {
    $('speakEnBtn').addEventListener('click', () => {
      TTS.speakEnglish(lastStoryEn).catch(() => toast('朗读失败'));
    });
    $('speakZhBtn').addEventListener('click', () => {
      TTS.speakChinese(lastStoryZh).catch(() => toast('朗读失败'));
    });
  }

  function setupGame() {
    $('closeGameBtn').addEventListener('click', () => WordGame.close());
  }

  function openGame() {
    const recent = Storage.getRecentWords(30);
    const withZh = recent.map(r => {
      const found = wordBank.find(w => w.word.toLowerCase() === r.word.toLowerCase());
      return { word: r.word, zh: found?.zh || r.word };
    });
    WordGame.start(withZh);
  }

  function setupTreasure() {
    $('treasureBtn').addEventListener('click', showTreasure);
    $('closeTreasureBtn').addEventListener('click', () => {
      $('treasureModal').classList.add('hidden');
    });
  }

  function showTreasure() {
    const words = Storage.getAllLearnedWords();
    const bonus = ['serendipity', 'wonder', 'brave', 'dream', 'magic'];
    $('treasureContent').innerHTML =
      `<p>你已学习 <strong>${words.length}</strong> 个单词！</p>` +
      `<p>隐藏词汇：${bonus.map(w => `<span class="highlight">${w}</span>`).join(' · ')}</p>` +
      `<p>继续收集星星，探索更多魔法吧！</p>`;
    $('treasureModal').classList.remove('hidden');
  }

  function refreshUI() {
    const stars = Storage.getStars();
    $('starCount').textContent = stars;

    if (stars >= 10) {
      $('treasureBtn').classList.remove('hidden');
      if (!Storage.isTreasureUnlocked()) {
        Storage.unlockTreasure();
        setTimeout(showTreasure, 500);
      }
    }
  }

  function renderReview() {
    const recent = Storage.getRecentWords(7);
    const list = $('reviewList');
    if (recent.length === 0) {
      list.innerHTML = '<li>暂无复习单词，快去创作故事吧！</li>';
      return;
    }
    list.innerHTML = recent.map(r =>
      `<li data-word="${r.word}"><span>${r.word}</span><span>${r.count} 次</span></li>`
    ).join('');
    list.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        TTS.speakEnglish(li.dataset.word).catch(() => {});
      });
    });
  }

  function renderReport() {
    $('statStories').textContent = Storage.getStoryCount();
    $('statWords').textContent = Storage.getAllLearnedWords().length;
    $('statStars').textContent = Storage.getStars();

    const freq = Storage.getWordFrequency();
    $('freqList').innerHTML = freq.length
      ? freq.map(([w, c]) => `<li><span>${w}</span><span>${c} 次</span></li>`).join('')
      : '<li>暂无数据</li>';
  }

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 2500);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
