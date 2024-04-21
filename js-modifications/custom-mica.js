// global

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
    + ' html:has(#browser.theme-light) #mica-filter {background-color: rgba(245,245,245, 0.8) }'
    + ' html:has(#browser.theme-light) #mica-background {filter: blur(400px) saturate(1.6) contrast(1); }'
    + ' html:has(#browser.theme-light) #mica-background-back { filter: blur(100px) saturate(1) contrast(2.5); }'
    + ' html:has(#browser.theme-dark) #mica-filter { background-color: rgba(0, 0, 0, 0.6); }'
    + ' html:has(#browser.theme-dark) #mica-background {filter: blur(800px) saturate(1.5); }'
    + ' html:has(#browser.theme-dark) #mica-background-back { filter: blur(100px) saturate(1) contrast(1.5); opacity: 0.5; }'
    ;
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

  const micaBackgroundBack = document.createElement('div');
  micaBackgroundBack.setAttribute('style',
    `position: fixed; ` +
    `background-image: ${micaBackgroundImage}; background-size: cover; ` +
    `translate: 0px 0px; width: ${window.screen.width + 'px'}; height: ${window.screen.height + 'px'}; ` +
    `z-index: -12;`);
  micaBackgroundBack.setAttribute('id', 'mica-background-back');

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
  micaOpacityLayer.appendChild(micaBackgroundBack);
  micaOpacityLayer.appendChild(micaBackground);
  micaOpacityLayer.appendChild(micaFilter);

  micaContainer.appendChild(micaOpacityLayer);
  waitForElm('#browser').then((elm) => {
    elm.insertBefore(micaContainer, elm.firstChild);
  });
};

function updateMicaParallax() {
  const micaBackgroundBack = document.getElementById('mica-background-back');
  const micaBackground = document.getElementById('mica-background');
  if (!micaBackground) {
    return;
  }
  const micaX = window.screenX * -1;
  const micaY = window.screenY * -1;
  micaBackground.style.top = micaY + 'px';
  micaBackground.style.left = micaX + 'px';
  micaBackgroundBack.style.top = micaY + 'px';
  micaBackgroundBack.style.left = micaX + 'px';
};

/** If user changed desktop wallpaper, Mica will update as well */
function updateMicaWallpeper() {
  const micaBackgroundBack = document.getElementById('mica-background-back');
  const micaBackground = document.getElementById('mica-background');
  /** Count index from 1 to 10 then reset */
  const index = Number(micaBackground.style.backgroundImage.slice(-3, -2));
  const micaBackgroundBuffer = document.getElementById('mica-background-buffer');
  const newImageUrl = `chrome://vivaldi-data/desktop-image/${index + 2}`;
  micaBackgroundBuffer.style.backgroundImage = `url("${newImageUrl}")`;
  setTimeout(() => {
    micaBackground.style.backgroundImage = `url("${newImageUrl}")`;
    micaBackgroundBack.style.backgroundImage = `url("${newImageUrl}")`;
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

(async function main() {
  applyMica();
  await addMicaObserver();
})();