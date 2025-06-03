let currentStyles = { axiom: null, nova: null };

// Function to apply styles to all matching buttons for a platform
function applyStylesToButtons(platform, styles) {
  let selector;
  if (platform === 'axiom') {
    selector = 'div[class*="absolute"][class*="sm:block"] button[class*="hover:bg-secondaryStroke"][class*="bg-primaryStroke"]';
  } else if (platform === 'nova') {
    selector = 'button[class*="h-[26px]"][class*="min-w-[82px]"][class*="rounded-[40px]"][class*="bg-[#2B2B3B]"]';
  }
  const buttons = document.querySelectorAll(selector);
  let buttonCount = 0;
  buttons.forEach(button => {
    button.style.width = styles.width;
    button.style.height = styles.height;
    button.style.borderRadius = styles.borderRadius;
    button.style.opacity = styles.opacity;
    button.style.backgroundColor = styles.backgroundColor;
    button.style.color = styles.color;
    const icons = button.querySelectorAll('img');
    if (icons) {
      icons.forEach(icon => {
        icon.style.filter = `invert(1) sepia(1) saturate(5) hue-rotate(${hexToHue(styles.iconColor)}deg)`;
      });
    }
    buttonCount++;
  });
  return buttonCount;
}

// Apply saved styles on page load for both platforms
chrome.storage.local.get(['axiomStyles', 'novaStyles'], (data) => {
  if (data.axiomStyles && window.location.href.includes('axiom.trade')) {
    currentStyles.axiom = data.axiomStyles;
    applyStylesToButtons('axiom', currentStyles.axiom);
  }
  if (data.novaStyles && window.location.href.includes('nova.trade')) {
    currentStyles.nova = data.novaStyles;
    applyStylesToButtons('nova', currentStyles.nova);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyStyles') {
    currentStyles[message.platform] = message.styles;
    const buttonCount = applyStylesToButtons(message.platform, message.styles);
    sendResponse({ success: buttonCount > 0, buttonCount: buttonCount });
  }
});

// Observe DOM changes to style dynamically added buttons
const observer = new MutationObserver((mutations) => {
  if (currentStyles.axiom && window.location.href.includes('axiom.trade')) {
    applyStylesToButtons('axiom', currentStyles.axiom);
  }
  if (currentStyles.nova && window.location.href.includes('nova.trade')) {
    applyStylesToButtons('nova', currentStyles.nova);
  }
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Helper function to convert hex color to hue for icon filter
function hexToHue(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    if (max === r) h = (g - b) / (max - min) * 60;
    else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
    else h = (4 + (r - g) / (max - min)) * 60;
    if (h < 0) h += 360;
  }
  return h;
}
