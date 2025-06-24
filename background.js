// Cache and settings
let urlCache = {};
let observerEnabledTabs = new Set();
let lastScanTimes = new Map();
let scanInterval = 10000; // Default 10 seconds (in milliseconds)
let urlFilter = null;
let badgeColor = '#2563eb';
let notificationListener = null;
let autoRefreshIntervalId = null;

// Initialize badge and load settings
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id && tab.url?.startsWith('http')) {
        chrome.storage.local.get([`urls_${tab.id}`], (result) => {
          const urls = result[`urls_${tab.id}`] || [];
          urlCache[tab.id] = urls;
          updateBadge(tab.id, urls.length);
        });
      }
    });
  });
  // Load initial settings
  chrome.storage.local.get(['autoRefreshEnabled', 'mod_scan-interval'], (data) => {
    scanInterval = (data['mod_scan-interval'] || 10) * 1000;
    if (data.autoRefreshEnabled) {
      startAutoRefresh();
    }
  });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    scanTab(tabId);
  }
});

// Listen for tab activation to update badge
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.storage.local.get([`urls_${tabId}`], (result) => {
    const urls = result[`urls_${tabId}`] || urlCache[tabId] || [];
    updateBadge(tabId, urls.length);
  });
});

// Clean up cache
chrome.tabs.onRemoved.addListener((tabId) => {
  delete urlCache[tabId];
  chrome.storage.local.remove(`urls_${tabId}`);
  chrome.action.setBadgeText({ text: '', tabId });
});

// Scan function
function scanTab(tabId) {
  const now = Date.now();
  if (lastScanTimes.get(tabId) && now - lastScanTimes.get(tabId) < 1000) return; // Minimum 1s throttle
  lastScanTimes.set(tabId, now);
  chrome.scripting.executeScript({
    target: { tabId },
    function: collectJsUrls,
  }, (results) => {
    if (chrome.runtime.lastError || !results || !results[0]) {
      console.error('Script injection failed:', chrome.runtime.lastError?.message || 'No results');
      updateBadge(tabId, 0, true);
      chrome.storage.local.set({ [`urls_${tabId}`]: [] });
      return;
    }

    const urls = results[0]?.result?.filter(isValidUrl) || [];
    urlCache[tabId] = urls;
    chrome.storage.local.set({ [`urls_${tabId}`]: urls }, () => {
      updateBadge(tabId, urls.length);
    });
  });
}

// Update badge
function updateBadge(tabId, count, isError = false) {
  chrome.action.setBadgeText({ text: count > 0 ? count.toString() : (isError ? '!' : ''), tabId });
  chrome.action.setBadgeBackgroundColor({
    color: isError ? '#dc2626' : badgeColor,
    tabId
  });
}

// Validate URLs
function isValidUrl(url) {
  try {
    new URL(url);
    if (!url.endsWith('.js')) return false;
    if (urlFilter && !urlFilter.test(url)) return false;
    return true;
  } catch {
    return false;
  }
}

// Injected function
function collectJsUrls() {
  const urls = Array.from(document.querySelectorAll('script[src]'))
    .map(script => script.src)
    .filter(src => src.endsWith('.js'));
  return [...new Set(urls)];
}

// Start auto-refresh scanning
function startAutoRefresh() {
  if (autoRefreshIntervalId) clearInterval(autoRefreshIntervalId);
  autoRefreshIntervalId = setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id && tabs[0].url?.startsWith('http')) {
        scanTab(tabs[0].id);
      }
    });
  }, scanInterval);
}

// Stop auto-refresh scanning
function stopAutoRefresh() {
  if (autoRefreshIntervalId) {
    clearInterval(autoRefreshIntervalId);
    autoRefreshIntervalId = null;
  }
}

// Message listeners
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === 'enableAuto' && sender.tab?.id) {
    enableMutationObserver(sender.tab.id);
    chrome.storage.local.get(['mod_scan-interval'], (data) => {
      scanInterval = (data['mod_scan-interval'] || 10) * 1000;
      startAutoRefresh();
    });
  } else if (msg.action === 'disableAuto') {
    disableMutationObserver();
    stopAutoRefresh();
  } else if (msg.action === 'scriptChanged' && sender.tab?.id) {
    scanTab(sender.tab.id);
  } else if (msg.action === 'enableNotifications') {
    if (!notificationListener) {
      notificationListener = (changes) => {
        for (let key in changes) {
          if (key.startsWith('urls_')) {
            const urls = changes[key].newValue || [];
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'images/icon128.png',
              title: 'JavaScript URLs Detected',
              message: `Found ${urls.length} JavaScript URLs.`,
            });
          }
        }
      };
      chrome.storage.onChanged.addListener(notificationListener);
    }
  } else if (msg.action === 'disableNotifications') {
    if (notificationListener) {
      chrome.storage.onChanged.removeListener(notificationListener);
      notificationListener = null;
    }
  } else if (msg.action === 'clearBadge') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
      });
    });
  } else if (msg.action === 'updateScanInterval') {
    scanInterval = msg.value * 1000;
    chrome.storage.local.get(['autoRefreshEnabled'], (data) => {
      if (data.autoRefreshEnabled) {
        startAutoRefresh();
      }
    });
  } else if (msg.action === 'updateUrlFilter') {
    urlFilter = msg.value ? new RegExp(msg.value) : null;
  } else if (msg.action === 'updateBadgeColor') {
    badgeColor = msg.value;
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.storage.local.get([`urls_${tab.id}`], (data) => {
          const count = (data[`urls_${tab.id}`] || []).length;
          updateBadge(tab.id, count);
        });
      });
    });
  }
});

// Enable observer
function enableMutationObserver(tabId) {
  observerEnabledTabs.add(tabId);
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if (window.__observer) return;
      const observer = new MutationObserver(() => {
        const scripts = [...document.querySelectorAll('script[src$=".js"]')];
        if (scripts.length > 0) {
          chrome.runtime.sendMessage({ action: 'scriptChanged' });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window.__observer = observer;
    },
  });
}

// Disable observer
function disableMutationObserver() {
  observerEnabledTabs.forEach(tabId => {
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        if (window.__observer) {
          window.__observer.disconnect();
          delete window.__observer;
        }
      },
    });
  });
  observerEnabledTabs.clear();
}
