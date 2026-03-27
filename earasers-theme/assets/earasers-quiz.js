/* ============================================================
   EARASERS THEME — earasers-quiz.js
   Size finder / category quiz
   ============================================================ */

const QUIZ_RESULTS = {
  musician:    { male: { size: 'M', label: 'Music Earplugs — Medium', url: '/products/earasers-musicians-performers-m' }, female: { size: 'S', label: 'Music Earplugs — Small', url: '/products/earasers-musicians-performers-s' } },
  dj:          { male: { size: 'M', label: 'DJ Earplugs — Medium', url: '/products/earasers-dj-earplugs-new' }, female: { size: 'S', label: 'DJ Earplugs — Small', url: '/products/earasers-dj-earplugs-new' } },
  dentist:     { male: { size: 'M', label: 'Dentist Earplugs — Medium', url: '/products/earasers-dentists-hygienists' }, female: { size: 'S', label: 'Dentist Earplugs — Small', url: '/products/earasers-dentists-hygienists' } },
  sleeping:    { male: { size: 'M', label: 'Sleep Earplugs — Medium', url: '/collections/all' }, female: { size: 'S', label: 'Sleep Earplugs — Small', url: '/collections/all' } },
  motorsport:  { male: { size: 'M', label: 'Motorsport Earplugs — Medium', url: '/collections/all' }, female: { size: 'S', label: 'Motorsport Earplugs — Small', url: '/collections/all' } },
  sensitivity: { male: { size: 'M', label: 'Sensitivity Earplugs — Medium', url: '/collections/all' }, female: { size: 'S', label: 'Sensitivity Earplugs — Small', url: '/collections/all' } },
};

let quizGender   = null;
let quizCategory = null;

function quizNext(step) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('is-active'));
  const target = step === 'result' ? document.querySelector('[data-step="result"]') : document.querySelector(`[data-step="${step}"]`);
  if (target) {
    target.classList.add('is-active');
    if (step === 'result') showQuizResult();
  }
}

function showQuizResult() {
  const result    = QUIZ_RESULTS[quizCategory]?.[quizGender] || QUIZ_RESULTS.musician.male;
  const sizeEl    = document.getElementById('quiz-result-size');
  const linkEl    = document.getElementById('quiz-result-link');
  if (sizeEl)  sizeEl.textContent = `Size ${result.size} — ${result.label}`;
  if (linkEl)  linkEl.href = result.url;
}

function quizRestart() {
  quizGender   = null;
  quizCategory = null;
  quizNext(1);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const value    = btn.dataset.value;
      const category = btn.dataset.category;
      const next     = btn.dataset.next;

      if (value)    quizGender   = value;
      if (category) quizCategory = category;
      quizNext(next);
    });
  });
});
