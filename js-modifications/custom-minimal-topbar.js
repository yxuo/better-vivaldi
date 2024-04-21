// global

const minimalTopbarState = {
  isHoverTabActive: false,
  isMouseInTab: false,
}

// methods

function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

/**
 * 
 * @param args {{
  tabLeft?: boolean,
  urlLeft?: Boolean,
  urlRight?: Boolean,
}} 
 */
async function setTabbarButtons(args) {
  const addressBar = await waitForElm('.UrlBar-AddressField');
  // Create containers
  const tabsLeftButtonsEl = document.createElement("div");
  tabsLeftButtonsEl.classList.add('toolbar', 'toolbar-tabbar');
  tabsLeftButtonsEl.style.marginRight = '5px';
  const firstTabEl = await waitForElm('#tabs-container>.resize');
  firstTabEl.before(tabsLeftButtonsEl);

  const urlBarLeftButtonsEl = document.createElement('div');
  urlBarLeftButtonsEl.setAttribute('id', 'Urlbar-left-buttons');
  addressBar.insertBefore(urlBarLeftButtonsEl, addressBar.firstChild);

  const urlBarRightButtonsEl = document.createElement('div');
  urlBarRightButtonsEl.setAttribute('id', 'Urlbar-right-buttons');
  addressBar.appendChild(urlBarRightButtonsEl);

  // Append buttons from navbar
  /** @type {Element[]} */
  const navbarButtons = [...document.querySelectorAll("#main > div.mainbar > div > div")];
  const addressBarIndex = navbarButtons.indexOf(navbarButtons.find(i => i.classList.contains('UrlBar-AddressField')));
  const navbarLeftButtons = navbarButtons.slice(0, addressBarIndex);
  const navbarRightButtons = navbarButtons.slice(addressBarIndex + 1);

  const tabLeftEnd = 3;
  if (args.tabLeft) {
    const tabbarLeftButtons = navbarLeftButtons.slice(0, tabLeftEnd);
    tabbarLeftButtons.forEach(i => tabsLeftButtonsEl.appendChild(i));
  }
  if (args.urlLeft) {
    const addressBarLeftButtons = navbarLeftButtons.slice(tabLeftEnd);
    addressBarLeftButtons.forEach(i => urlBarLeftButtonsEl.appendChild(i));
  }

  if (args.urlRight) {
    // Wait UI proces changes (prevent crashing)
    setTimeout(() => {
      const addressBarRightButtons = navbarRightButtons;
      addressBarRightButtons.forEach(i => urlBarRightButtonsEl.appendChild(i));
    }, 5);
  }
}

/**
 * 
 * @param {NodeListOf<Element> | undefined} tabsTarget 
 */
function addTabsListeners() {
  const tabs = document.querySelectorAll('.tab-strip>span>.tab-position>.tab:not(.listener)');
  for (const tab of tabs) {
    tab.classList.add('listener');
    tab.addEventListener('mouseenter', (event) => {
      minimalTopbarState.isHoverTabActive = event.target.classList.contains('active');
      minimalTopbarState.isMouseInTab = true;
    });
    tab.addEventListener('mouseleave', () => {
      minimalTopbarState.isMouseInTab = false;
    });
    tab.addEventListener('click', () => {
      const urlInput = document.querySelector('#urlFieldInput');
      if (minimalTopbarState.isHoverTabActive && urlInput) {
        urlInput.focus();
        urlInput.select();
      }
      minimalTopbarState.isHoverTabActive = true;
    });
  }
}

function addTabbarListeners() {
  const inner = document.querySelector('.inner');
  inner.addEventListener('click', () => {
    const urlInput = document.querySelector('#urlFieldInput');
    urlInput.blur();
  });
}

async function addTabsObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mu => {
      if (mu.addedNodes.length > 0) {
        addTabsListeners();
      }
    });
  });
  const tabStrip = await waitForElm('.tab-strip');
  observer.observe(tabStrip, { childList: true });
}

(async function main() {
  await setTabbarButtons({
    tabLeft: true,
    urlLeft: true,
    urlRight: true
  });
  addTabsListeners();
  addTabbarListeners();
  addTabsObserver();
})();