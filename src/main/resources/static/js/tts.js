const TTS = (() => {
  function speak(text, lang = 'en-US') {
    if (!window.speechSynthesis) {
      return Promise.reject(new Error('浏览器不支持语音合成'));
    }
    window.speechSynthesis.cancel();
    return new Promise((resolve, reject) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = lang.startsWith('zh') ? 0.9 : 0.85;
      utter.onend = resolve;
      utter.onerror = reject;
      window.speechSynthesis.speak(utter);
    });
  }

  function speakEnglish(text) {
    return speak(text, 'en-US');
  }

  function speakChinese(text) {
    return speak(text, 'zh-CN');
  }

  function stop() {
    window.speechSynthesis?.cancel();
  }

  return { speakEnglish, speakChinese, stop };
})();
