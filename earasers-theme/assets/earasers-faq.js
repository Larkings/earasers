/* ============================================================
   EARASERS THEME — earasers-faq.js
   FAQ accordion — open/close behaviour
   ============================================================ */

function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-item__a');
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  // Close all others in the same container
  const parent = item.closest('.faq-section') || document.body;
  parent.querySelectorAll('.faq-item').forEach(other => {
    if (other !== item) {
      other.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
      other.querySelector('.faq-item__a').hidden = true;
    }
  });

  btn.setAttribute('aria-expanded', String(!isOpen));
  answer.hidden = isOpen;
}

/* Auto-bind all faq buttons on load */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-item__q').forEach(btn => {
    btn.addEventListener('click', () => toggleFaq(btn));
  });
});
