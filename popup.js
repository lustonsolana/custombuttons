function applyStyles(platform, styles) {
  const status = document.getElementById('status');
  status.textContent = `Applying ${platform} styles...`;
  status.className = '';

  console.log(`Applying ${platform} styles:`, styles);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'applyStyles', platform, styles }, (response) => {
      if (chrome.runtime.lastError) {
        status.textContent = 'Error: Could not connect to content script.';
        status.className = 'error';
        console.error('Runtime error:', chrome.runtime.lastError);
      } else if (response && response.success) {
        status.textContent = `Styles applied to ${response.buttonCount} ${platform} button(s)!`;
        status.className = 'success';
      } else {
        status.textContent = `Error: No ${platform} buttons found on page.`;
        status.className = 'error';
      }
    });
  });

  // Save styles to chrome.storage
  chrome.storage.local.set({ [`${platform}Styles`]: styles }, () => {
    console.log(`${platform} styles saved to storage:`, styles);
  });
}

function loadSavedStyles(platform) {
  const inputs = {
    width: document.getElementById(`${platform}-width`),
    height: document.getElementById(`${platform}-height`),
    borderRadius: document.getElementById(`${platform}-borderRadius`),
    opacity: document.getElementById(`${platform}-opacity`),
    bgColor: document.getElementById(`${platform}-bgColor`),
    textColor: document.getElementById(`${platform}-textColor`),
    iconColor: document.getElementById(`${platform}-iconColor`)
  };

  chrome.storage.local.get(`${platform}Styles`, (data) => {
    console.log(`Retrieved ${platform} styles from storage:`, data[`${platform}Styles`]);

    const savedStyles = data[`${platform}Styles`] || {};
    const defaults = {
      width: '200px',
      height: '60px',
      borderRadius: '50px',
      opacity: '1',
      backgroundColor: platform === 'axiom' ? '#4B5EAA' : '#2B2B3B',
      color: '#FFFFFF',
      iconColor: '#6B7280'
    };

    // Use saved values or defaults
    inputs.width.value = savedStyles.width ? parseInt(savedStyles.width.replace('px', '')) : 200;
    inputs.height.value = savedStyles.height ? parseInt(savedStyles.height.replace('px', '')) : 60;
    inputs.borderRadius.value = savedStyles.borderRadius ? parseInt(savedStyles.borderRadius.replace('px', '')) : 50;
    inputs.opacity.value = savedStyles.opacity ? parseFloat(savedStyles.opacity) : 1;
    inputs.bgColor.value = savedStyles.backgroundColor || defaults.backgroundColor;
    inputs.textColor.value = savedStyles.color || '#FFFFFF';
    inputs.iconColor.value = savedStyles.iconColor || '#6B7280';

    // Validate ranges
    inputs.width.value = Math.max(100, Math.min(500, inputs.width.value));
    inputs.height.value = Math.max(40, Math.min(200, inputs.height.value));
    inputs.borderRadius.value = Math.max(0, Math.min(100, inputs.borderRadius.value));
    inputs.opacity.value = Math.max(0, Math.min(1, inputs.opacity.value));

    // Update value displays
    document.getElementById(`${platform}-width-value`).textContent = `${inputs.width.value}px`;
    document.getElementById(`${platform}-height-value`).textContent = `${inputs.height.value}px`;
    document.getElementById(`${platform}-borderRadius-value`).textContent = `${inputs.borderRadius.value}px`;
    document.getElementById(`${platform}-opacity-value`).textContent = inputs.opacity.value;

    // Apply loaded styles
    const styles = {
      width: `${inputs.width.value}px`,
      height: `${inputs.height.value}px`,
      borderRadius: `${inputs.borderRadius.value}px`,
      opacity: inputs.opacity.value.toString(),
      backgroundColor: inputs.bgColor.value,
      color: inputs.textColor.value,
      iconColor: inputs.iconColor.value
    };
    console.log(`Loaded ${platform} styles for application:`, styles);
    applyStyles(platform, styles);
  });
}

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(button.dataset.tab).classList.remove('hidden');
  });
});

// Update value displays and apply styles on input change
['axiom', 'nova'].forEach(platform => {
  ['width', 'height', 'borderRadius', 'opacity', 'bgColor', 'textColor', 'iconColor'].forEach(id => {
    const input = document.getElementById(`${platform}-${id}`);
    input.addEventListener('input', () => {
      if (['width', 'height', 'borderRadius', 'opacity'].includes(id)) {
        const valueDisplay = document.getElementById(`${platform}-${id}-value`);
        valueDisplay.textContent = id === 'opacity' ? input.value : `${input.value}px`;
      }
      const styles = {
        width: `${document.getElementById(`${platform}-width`).value}px`,
        height: `${document.getElementById(`${platform}-height`).value}px`,
        borderRadius: `${document.getElementById(`${platform}-borderRadius`).value}px`,
        opacity: document.getElementById(`${platform}-opacity`).value,
        backgroundColor: document.getElementById(`${platform}-bgColor`).value,
        color: document.getElementById(`${platform}-textColor`).value,
        iconColor: document.getElementById(`${platform}-iconColor`).value
      };
      applyStyles(platform, styles);
    });
  });
});

// Load and apply saved styles for both platforms on popup open
loadSavedStyles('axiom');
loadSavedStyles('nova');
