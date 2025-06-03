function applyStyles(styles) {
  const status = document.getElementById('status');
  status.textContent = 'Applying styles...';
  status.className = '';

  // Log styles being applied
  console.log('Applying styles:', styles);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'applyStyles', styles: styles }, (response) => {
      if (chrome.runtime.lastError) {
        status.textContent = 'Error: Could not connect to content script.';
        status.className = 'error';
        console.error('Runtime error:', chrome.runtime.lastError);
      } else if (response && response.success) {
        status.textContent = `Styles applied to ${response.buttonCount} button(s)!`;
        status.className = 'success';
      } else {
        status.textContent = 'Error: No buttons found on page.';
        status.className = 'error';
      }
    });
  });

  // Save styles to chrome.storage
  chrome.storage.local.set({ buttonStyles: styles }, () => {
    console.log('Styles saved to storage:', styles);
  });
}

function loadSavedStyles() {
  const inputs = {
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    borderRadius: document.getElementById('borderRadius'),
    opacity: document.getElementById('opacity'),
    bgColor: document.getElementById('bgColor'),
    textColor: document.getElementById('textColor'),
    iconColor: document.getElementById('iconColor')
  };

  chrome.storage.local.get('buttonStyles', (data) => {
    console.log('Retrieved styles from storage:', data.buttonStyles);

    const defaults = {
      width: '200px',
      height: '60px',
      borderRadius: '50px',
      opacity: '1',
      backgroundColor: '#4B5EAA',
      color: '#FFFFFF',
      iconColor: '#6B7280'
    };

    const savedStyles = data.buttonStyles || {};

    // Ensure values are within valid ranges and use saved values if available
    inputs.width.value = savedStyles.width ? parseInt(savedStyles.width) : 200;
    inputs.height.value = savedStyles.height ? parseInt(savedStyles.height) : 60;
    inputs.borderRadius.value = savedStyles.borderRadius ? parseInt(savedStyles.borderRadius) : 50;
    inputs.opacity.value = savedStyles.opacity ? parseFloat(savedStyles.opacity) : 1;
    inputs.bgColor.value = savedStyles.backgroundColor || '#4B5EAA';
    inputs.textColor.value = savedStyles.color || '#FFFFFF';
    inputs.iconColor.value = savedStyles.iconColor || '#6B7280';

    // Validate ranges
    inputs.width.value = Math.max(100, Math.min(500, inputs.width.value));
    inputs.height.value = Math.max(40, Math.min(200, inputs.height.value));
    inputs.borderRadius.value = Math.max(0, Math.min(100, inputs.borderRadius.value));
    inputs.opacity.value = Math.max(0, Math.min(1, inputs.opacity.value));

    // Update value displays
    document.getElementById('width-value').textContent = `${inputs.width.value}px`;
    document.getElementById('height-value').textContent = `${inputs.height.value}px`;
    document.getElementById('borderRadius-value').textContent = `${inputs.borderRadius.value}px`;
    document.getElementById('opacity-value').textContent = inputs.opacity.value;

    // Apply loaded styles
    const styles = {
      width: `${inputs.width.value}px`,
      height: `${inputs.height.value}px`,
      borderRadius: `${inputs.borderRadius.value}px`,
      opacity: inputs.opacity.value,
      backgroundColor: inputs.bgColor.value,
      color: inputs.textColor.value,
      iconColor: inputs.iconColor.value
    };
    console.log('Loaded styles for application:', styles);
    applyStyles(styles);
  });
}

// Update value displays and apply styles on input change
['width', 'height', 'borderRadius', 'opacity', 'bgColor', 'textColor', 'iconColor'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => {
    if (['width', 'height', 'borderRadius', 'opacity'].includes(id)) {
      const valueDisplay = document.getElementById(`${id}-value`);
      valueDisplay.textContent = id === 'opacity' ? input.value : `${input.value}px`;
    }
    const styles = {
      width: `${document.getElementById('width').value}px`,
      height: `${document.getElementById('height').value}px`,
      borderRadius: `${document.getElementById('borderRadius').value}px`,
      opacity: document.getElementById('opacity').value,
      backgroundColor: document.getElementById('bgColor').value,
      color: document.getElementById('textColor').value,
      iconColor: document.getElementById('iconColor').value
    };
    applyStyles(styles);
  });
});

// Load and apply saved styles on popup open
loadSavedStyles();