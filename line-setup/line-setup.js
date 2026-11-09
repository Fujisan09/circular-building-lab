'use strict';

(() => {
  const status = document.getElementById('copy-status');
  let noticeTimer;

  function announce(message) {
    if (!status) return;
    clearTimeout(noticeTimer);
    status.textContent = message;
    status.classList.add('is-visible');
    noticeTimer = setTimeout(() => status.classList.remove('is-visible'), 5000);
  }

  function fitTextareas(container = document) {
    container.querySelectorAll('textarea[readonly]').forEach(field => {
      if (!field.getClientRects().length) return;
      field.style.height = 'auto';
      field.style.height = `${Math.max(62, field.scrollHeight + 3)}px`;
    });
  }

  document.addEventListener('click', async event => {
    const button = event.target.closest('button[data-copy]');
    if (!button) return;
    const field = document.getElementById(button.dataset.copy);
    if (!field) return;
    const originalLabel = 'コピー';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(field.value);
      button.textContent = 'コピー済み';
      button.classList.add('is-copied');
      announce('コピーしました。LINE管理画面に貼り付けてください。');
      setTimeout(() => {
        button.textContent = originalLabel;
        button.classList.remove('is-copied');
      }, 2500);
    } catch {
      field.focus();
      field.select();
      field.setSelectionRange(0, field.value.length);
      announce('文章を選択しました。端末の「コピー」を使ってください。');
    }
  });

  document.addEventListener('toggle', event => {
    if (event.target instanceof HTMLDetailsElement && event.target.open) {
      fitTextareas(event.target);
    }
  }, true);

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => fitTextareas());
  });
  window.addEventListener('load', () => fitTextareas());
  fitTextareas();
})();
