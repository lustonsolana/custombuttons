let currentStyles = null;

// Function to apply styles to all matching buttons
function applyStylesToButtons(styles) {
  const buttons = document.querySelectorAll('div[class*="absolute"][class*="sm:block"] button[class*="hover:bg-secondaryStroke"][class*="bg-primaryStroke"]');
  let buttonCount = 0;
  buttons.forEach(button => {
    button.style.width = styles.width;
    button.style.height = styles.height;
    button.style.borderRadius = styles.borderRadius;
    button.style.opacity = styles.opacity;
    button.style.backgroundColor = styles.backgroundColor;
    button.style.color = styles.color;
    const icon = button.querySelector('i[class*="ri-flashlight-fill"]');
    if (icon) {
      icon.style.color = styles.iconColor;
    }
    buttonCount++;
  });
  return buttonCount;
}

// Apply saved styles on page load
chrome.storage.local.get('buttonStyles', (data) => {
  if (data.buttonStyles) {
    currentStyles = data.buttonStyles;
    applyStylesToButtons(currentStyles);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyStyles') {
    currentStyles = message.styles;
    const buttonCount = applyStylesToButtons(message.styles);
    sendResponse({ success: buttonCount > 0, buttonCount: buttonCount });
  }
});

// Observe DOM changes to style dynamically added buttons
const observer = new MutationObserver((mutations) => {
  if (currentStyles) {
    applyStylesToButtons(currentStyles);
  }
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});