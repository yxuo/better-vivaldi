// global

const state = {
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
 * @param {Element} element 
 */
function copyAndInsertElement(element) {
  const copy = element.cloneNode(true);
  console.log('COPY EL', copy)
  element.parentNode.insertBefore(copy, element.nextSibling);
  element.remove();
  return copy;
}

function applyMica() {
  setTimeout(insertMicaElements, 5);
  setInterval(updateMicaParallax, 10);
  const documentHead = document.getElementsByTagName('head')[0];
  const customCSSForMica = document.createElement('style');
  customCSSForMica.innerHTML =
    '#mica-opacity-layer { transition-duration: 0.4s; }'
    + ' html:has(#browser.isblurred) #mica-opacity-layer { opacity: 0; }'
    + ' html:has(#browser.theme-light) body {background-color: rgba(210,210,210, 1); }'
    + ' html:has(#browser.theme-dark) body {background-color: rgba(45,45,45, 1); }'
    + ' html:has(#browser.theme-light) #mica-filter {background-color: rgba(245,245,245, 0.7) }'
    + ' html:has(#browser.theme-light) #mica-background {filter: blur(400px) saturate(1.6); }'
    + ' html:has(#browser.theme-dark) #mica-filter { background-color: rgba(0, 0, 0, 0.6); }'
    + ' html:has(#browser.theme-dark) #mica-background {filter: blur(400px) saturate(1.5); }';
  documentHead.appendChild(customCSSForMica);
}

function insertMicaElements(imgIndex = 0) {
  const micaContainer = document.createElement('div');
  micaContainer.setAttribute('id', 'mica-container');
  micaContainer.style = 'position: fixed; width: 100vw; height: 100vh;';

  const micaOpacityLayer = document.createElement('div');
  micaOpacityLayer.setAttribute('id', 'mica-opacity-layer');
  micaOpacityLayer.style = 'position: fixed; width: 100vw; height: 100vh;';

  const micaBackgroundImage = `url("chrome://vivaldi-data/desktop-image/${imgIndex}")`;

  const micaBackgroundBuffer = document.createElement('div');
  micaBackgroundBuffer.setAttribute('id', 'mica-background-buffer');
  micaBackgroundBuffer.style = 'opacity: 0;';

  const micaBackground = document.createElement('div');
  // const moveY = (2560 - 1920 * (1920 / 2560)) / 10 * 1,5
  micaBackground.setAttribute('style',
    `position: fixed; ` +
    `background-image: ${micaBackgroundImage}; background-size: cover; ` +
    `translate: 0px 0px; width: ${window.screen.width + 'px'}; height: ${window.screen.height + 'px'}; ` +
    `z-index: -11;`);
  micaBackground.setAttribute('id', 'mica-background');

  const micaFilter = document.createElement('div');
  micaFilter.setAttribute('style', 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -10;');
  micaFilter.setAttribute('id', 'mica-filter');

  micaOpacityLayer.appendChild(micaBackgroundBuffer);
  micaOpacityLayer.appendChild(micaBackground);
  micaOpacityLayer.appendChild(micaFilter);

  micaContainer.appendChild(micaOpacityLayer);
  waitForElm('#browser').then((elm) => {
    elm.insertBefore(micaContainer, elm.firstChild);
  });
};

function updateMicaParallax() {
  const micaBackground = document.getElementById('mica-background');
  if (!micaBackground) {
    return;
  }
  const micaX = window.screenX * -1;
  const micaY = window.screenY * -1;
  micaBackground.style.top = micaY + 'px';
  micaBackground.style.left = micaX + 'px';
};

/** If user changed desktop wallpaper, Mica will update as well */
function updateMicaWallpeper() {
  const micaBackground = document.getElementById('mica-background');
  /** Count index from 1 to 10 then reset */
  const index = Number(micaBackground.style.backgroundImage.slice(-3, -2));
  const micaBackgroundBuffer = document.getElementById('mica-background-buffer');
  const newImageUrl = `chrome://vivaldi-data/desktop-image/${index + 2}`;
  micaBackgroundBuffer.style.backgroundImage = `url("${newImageUrl}")`;
  setTimeout(() => {
    micaBackground.style.backgroundImage = `url("${newImageUrl}")`;
  }, 50);
}

async function addMicaObserver() {
  const attrObserver = new MutationObserver((mutations) => {
    mutations.forEach(mu => {
      if (mu.type !== "attributes" && mu.attributeName !== "class") return;
      updateMicaWallpeper();
    });
  });
  const browser = await waitForElm('#browser');
  attrObserver.observe(browser, { attributes: true });
}

/**
 * 
 * @param args {{
  tabLeft?: boolean,
  urlLeft?: Boolean,
  urlRight?: Boolean,
}} 
 */
function setTabbarButtons(args) {
  const addressBar = document.querySelector('.UrlBar-AddressField');
  // Create containers
  const tabsLeftButtonsEl = document.createElement("div");
  tabsLeftButtonsEl.classList.add('toolbar', 'toolbar-tabbar');
  tabsLeftButtonsEl.style.marginRight = '5px';
  const firstTabEl = document.querySelector('#tabs-container>.resize');
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
      state.isHoverTabActive = event.target.classList.contains('active');
      state.isMouseInTab = true;
    });
    tab.addEventListener('mouseleave', () => {
      state.isMouseInTab = false;
    });
    tab.addEventListener('click', () => {
      const urlInput = document.querySelector('#urlFieldInput');
      if (state.isHoverTabActive && urlInput) {
        urlInput.focus();
        urlInput.select();
      }
      state.isHoverTabActive = true;
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
  applyMica();
  await addMicaObserver();
  setTabbarButtons({
    tabLeft: true,
    urlLeft: true,
    urlRight: true
  });
  addTabsListeners();
  addTabbarListeners();
  addTabsObserver();
})();