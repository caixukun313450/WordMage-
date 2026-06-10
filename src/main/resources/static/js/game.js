const WordGame = (() => {
  let selectedEn = null;
  let selectedZh = null;
  let matched = 0;
  let pairs = [];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function start(wordsWithZh, onComplete) {
    const board = document.getElementById('gameBoard');
    const scoreEl = document.getElementById('gameScore');
    selectedEn = null;
    selectedZh = null;
    matched = 0;

    pairs = wordsWithZh.slice(0, Math.min(5, wordsWithZh.length));
    if (pairs.length < 2) {
      pairs = [
        { word: 'apple', zh: '苹果' },
        { word: 'book', zh: '书' },
        { word: 'cat', zh: '猫' },
        { word: 'dog', zh: '狗' }
      ].slice(0, 4);
    }

    const enItems = shuffle(pairs.map(p => ({ type: 'en', text: p.word, pair: p.word })));
    const zhItems = shuffle(pairs.map(p => ({ type: 'zh', text: p.zh, pair: p.word })));
    const all = shuffle([...enItems, ...zhItems]);

    board.innerHTML = '';
    scoreEl.textContent = `进度：0 / ${pairs.length}`;

    all.forEach(item => {
      const el = document.createElement('div');
      el.className = 'game-item';
      el.dataset.type = item.type;
      el.dataset.pair = item.pair;
      el.textContent = item.text;
      el.addEventListener('click', () => handleClick(el, onComplete));
      board.appendChild(el);
    });

    document.getElementById('gameModal').classList.remove('hidden');
  }

  function handleClick(el, onComplete) {
    if (el.classList.contains('matched')) return;

    const type = el.dataset.type;
    if (type === 'en') {
      document.querySelectorAll('.game-item[data-type="en"].selected').forEach(e => e.classList.remove('selected'));
      selectedEn = el;
      el.classList.add('selected');
    } else {
      document.querySelectorAll('.game-item[data-type="zh"].selected').forEach(e => e.classList.remove('selected'));
      selectedZh = el;
      el.classList.add('selected');
    }

    if (selectedEn && selectedZh) {
      if (selectedEn.dataset.pair === selectedZh.dataset.pair) {
        selectedEn.classList.add('matched');
        selectedZh.classList.add('matched');
        selectedEn.classList.remove('selected');
        selectedZh.classList.remove('selected');
        matched++;
        document.getElementById('gameScore').textContent = `进度：${matched} / ${pairs.length}`;
        if (matched === pairs.length) {
          document.getElementById('gameScore').textContent = '🎉 全部配对成功！';
          onComplete?.();
        }
      } else {
        selectedEn.classList.add('wrong');
        selectedZh.classList.add('wrong');
        setTimeout(() => {
          selectedEn?.classList.remove('selected', 'wrong');
          selectedZh?.classList.remove('selected', 'wrong');
          selectedEn = null;
          selectedZh = null;
        }, 600);
        return;
      }
      selectedEn = null;
      selectedZh = null;
    }
  }

  function close() {
    document.getElementById('gameModal').classList.add('hidden');
  }

  return { start, close };
})();
