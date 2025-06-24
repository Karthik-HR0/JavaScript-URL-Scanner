(() => {
  const scripts = [...document.querySelectorAll('script[src]')];
  const urls = scripts.map(s => s.src);

  // Send the URLs to the background script
  chrome.runtime.sendMessage({ type: 'SAVE_URLS', urls });
})();
