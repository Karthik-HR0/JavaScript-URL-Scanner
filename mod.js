// Module registry with example mods for each type
const mods = [
  {
    id: 'show-notifications',
    type: 'toggle',
    label: 'Show Notifications',
    defaultValue: false,
    description: 'Notify when new JavaScript URLs are detected.',
    onChange: (value) => {
      chrome.storage.local.set({ showNotifications: value });
      chrome.runtime.sendMessage({ action: value ? 'enableNotifications' : 'disableNotifications' });
    }
  },
  {
    id: 'clear-cache',
    type: 'button',
    label: 'Clear URL Cache',
    description: 'Remove all stored JavaScript URLs.',
    onChange: () => {
      chrome.storage.local.get(null, (data) => {
        const keysToRemove = Object.keys(data).filter(key => key.startsWith('urls_'));
        chrome.storage.local.remove(keysToRemove, () => {
          chrome.runtime.sendMessage({ action: 'clearBadge' });
        });
      });
    }
  },
  {
    id: 'scan-interval',
    type: 'slider',
    label: 'Auto-Refresh Interval (seconds)',
    defaultValue: 10,
    min: 1,
    max: 60,
    step: 1,
    description: 'Set the interval for auto-refresh scans.',
    onChange: (value) => {
      chrome.storage.local.set({ scanInterval: value });
      chrome.runtime.sendMessage({ action: 'updateScanInterval', value });
    }
  },
  {
    id: 'url-filter',
    type: 'text',
    label: 'Custom URL Filter (Regex)',
    defaultValue: '',
    description: 'Enter a regex to filter JavaScript URLs (e.g., ^https://cdn\\.).',
    onChange: (value) => {
      try {
        new RegExp(value);
        chrome.storage.local.set({ urlFilter: value });
        chrome.runtime.sendMessage({ action: 'updateUrlFilter', value });
      } catch (e) {
        const message = document.getElementById('message');
        message.textContent = 'Invalid regex pattern!';
        message.classList.add('error');
        message.style.display = 'block';
        setTimeout(() => message.style.display = 'none', 2000);
      }
    }
  },
  {
    id: 'badge-color',
    type: 'dropdown',
    label: 'Badge Color',
    defaultValue: '#2563eb',
    options: [
      { value: '#2563eb', label: 'Blue' },
      { value: '#10b981', label: 'Green' },
      { value: '#dc2626', label: 'Red' }
    ],
    description: 'Select the badge background color.',
    onChange: (value) => {
      chrome.storage.local.set({ badgeColor: value });
      chrome.runtime.sendMessage({ action: 'updateBadgeColor', value });
    }
  }
];

// Initialize mods
document.addEventListener('DOMContentLoaded', () => {
  const modsGroup = document.getElementById('mods-group');
  const message = document.getElementById('message');

  // Load saved mod states and initialize scan-interval
  chrome.storage.local.get(mods.map(mod => `mod_${mod.id}`), (data) => {
    mods.forEach(mod => {
      const value = data[`mod_${mod.id}`] ?? mod.defaultValue;
      renderMod(mod, value);
      // Initialize scan-interval in background.js
      if (mod.id === 'scan-interval') {
        chrome.runtime.sendMessage({ action: 'updateScanInterval', value });
      }
    });
  });

  // Render a mod
  function renderMod(mod, savedValue) {
    const modContainer = document.createElement('div');
    modContainer.className = 'mod';

    if (mod.type === 'toggle') {
      const label = document.createElement('label');
      label.className = 'mod-toggle';
      label.title = mod.description;

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `mod-${mod.id}`;
      input.checked = savedValue;

      const slider = document.createElement('span');
      slider.className = 'slider';

      label.appendChild(input);
      label.appendChild(slider);

      const span = document.createElement('span');
      span.textContent = mod.label;

      modContainer.appendChild(label);
      modContainer.appendChild(span);

      input.addEventListener('change', () => {
        chrome.storage.local.set({ [`mod_${mod.id}`]: input.checked }, () => {
          mod.onChange(input.checked);
          message.textContent = 'Settings saved!';
          message.classList.remove('error');
          message.style.display = 'block';
          setTimeout(() => message.style.display = 'none', 2000);
        });
      });
    } else if (mod.type === 'button') {
      const button = document.createElement('button');
      button.className = 'mod-button';
      button.textContent = mod.label;
      button.title = mod.description;
      button.addEventListener('click', () => {
        mod.onChange();
        message.textContent = 'Action completed!';
        message.classList.remove('error');
        message.style.display = 'block';
        setTimeout(() => message.style.display = 'none', 2000);
      });

      modContainer.appendChild(button);
    } else if (mod.type === 'slider') {
      const label = document.createElement('label');
      label.textContent = mod.label;
      label.title = mod.description;

      const input = document.createElement('input');
      input.type = 'range';
      input.className = 'mod-slider';
      input.min = mod.min;
      input.max = mod.max;
      input.step = mod.step;
      input.value = savedValue;

      const valueDisplay = document.createElement('span');
      valueDisplay.textContent = savedValue;

      input.addEventListener('input', () => {
        valueDisplay.textContent = input.value;
      });

      input.addEventListener('change', () => {
        chrome.storage.local.set({ [`mod_${mod.id}`]: parseInt(input.value) }, () => {
          mod.onChange(parseInt(input.value));
          message.textContent = 'Settings saved!';
          message.classList.remove('error');
          message.style.display = 'block';
          setTimeout(() => message.style.display = 'none', 2000);
        });
      });

      modContainer.appendChild(label);
      modContainer.appendChild(input);
      modContainer.appendChild(valueDisplay);
    } else if (mod.type === 'text') {
      const label = document.createElement('label');
      label.textContent = mod.label;
      label.title = mod.description;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'mod-text';
      input.value = savedValue;
      input.placeholder = 'Enter value...';

      input.addEventListener('change', () => {
        chrome.storage.local.set({ [`mod_${mod.id}`]: input.value }, () => {
          mod.onChange(input.value);
          message.textContent = 'Settings saved!';
          message.classList.remove('error');
          message.style.display = 'block';
          setTimeout(() => message.style.display = 'none', 2000);
        });
      });

      modContainer.appendChild(label);
      modContainer.appendChild(input);
    } else if (mod.type === 'dropdown') {
      const label = document.createElement('label');
      label.textContent = mod.label;
      label.title = mod.description;

      const select = document.createElement('select');
      select.className = 'mod-dropdown';
      mod.options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.label;
        if (option.value === savedValue) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', () => {
        chrome.storage.local.set({ [`mod_${mod.id}`]: select.value }, () => {
          mod.onChange(select.value);
          message.textContent = 'Settings saved!';
          message.classList.remove('error');
          message.style.display = 'block';
          setTimeout(() => message.style.display = 'none', 2000);
        });
      });

      modContainer.appendChild(label);
      modContainer.appendChild(select);
    }

    modsGroup.appendChild(modContainer);
  }
});
