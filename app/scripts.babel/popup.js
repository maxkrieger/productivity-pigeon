'use strict';

let toggleButton = document.querySelector('#toggle');
let blockListButton = document.querySelector('#blocklist');
let mainView = document.querySelector('#main');
let blockView = document.querySelector('#blockView');
let blockInput = document.querySelector('#blockInput');
let sitesEl = document.querySelector('#sites');

toggleButton.onclick = () => {
    chrome.runtime.sendMessage({directive: 'togglePigeon'}, (response) => {
        renderToggle(response);
    });
};

let renderToggle = (toggled) => {
    toggleButton.innerHTML = (toggled ? 'Turn Off' : 'Turn On');
    toggleButton.style.backgroundColor = (toggled ? '#000000' : '#FFFFFF');
    toggleButton.style.color = (toggled ? '#FFFFFF' : '#000000');
};

blockListButton.onclick = () => {
    mainView.style.display = 'none';
    blockView.style.display = '';
    chrome.storage.sync.get('state', (data) => {
        sitesEl.innerHTML = '';
        let sites = data.state.urls;
        sites.forEach(createEl);
    });
};

blockInput.addEventListener('keydown', (e) => {
    if(e.which == 13) {
        chrome.runtime.sendMessage({directive: 'addSite', site: blockInput.value}, () => {
            createEl(blockInput.value);
            blockInput.value = '';
        });
    }
});

let createEl = (site) => {
    let siteEl = document.createElement('li');
    let text = document.createTextNode('× ' + site);
    siteEl.appendChild(text);
    sitesEl.appendChild(siteEl);
    siteEl.onclick = () => {
        chrome.runtime.sendMessage({directive: 'removeSite', site});
        siteEl.parentNode.removeChild(siteEl);
    };
};

window.onload = function() {
    chrome.storage.sync.get('state', (data) => {
        renderToggle(data.state.enabled);
    });
};

chrome.runtime.onMessage.addListener(
  (request, sender, callback) => {
    if(request.directive == 'updatePigeonState') {
      renderToggle(request.state.enabled)
      callback()
    }
  }
);
