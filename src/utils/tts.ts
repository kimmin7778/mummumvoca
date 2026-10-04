/**
 * Text-to-Speech Pronunciation utility using Web Speech API
 */
export function speakWord(text: string, lang: string = 'en-US', rate: number = 0.9): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this browser.');
    return;
  }

  // Cancel ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate; // slightly slower rate for crisp learning pronunciation
  utterance.pitch = 1.0;

  // Try to find natural sounding English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    v => (v.lang.startsWith('en') && v.name.includes('Google')) || v.name.includes('Natural') || v.name.includes('Samantha')
  ) || voices.find(v => v.lang.startsWith('en'));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Pre-warms Web Speech API voices
 */
export function initTTS(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }
}
