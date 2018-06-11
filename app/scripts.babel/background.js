'use strict';

let state = {
    urls: [],
    enabled: true
};

const saveState = () => {
  chrome.storage.sync.set({'state': state});
  chrome.runtime.sendMessage({directive: 'updatePigeonState', state});
}

const setEnabled = (calculateEnabled) => {
  state.enabled = calculateEnabled(state.enabled);
  saveState();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, callback){
        if(request.directive == 'togglePigeon') {
          setEnabled(oldEnabled => !oldEnabled)
          callback(state.enabled);
        }
        else if(request.directive == 'addSite') {
            state.urls.push(request.site);
            saveState();
            callback();
        }
        else if(request.directive == 'removeSite') {
            state.urls.splice(state.urls.indexOf(request.site), 1);
            saveState();
            callback();
        }
        else if(request.directive == 'test') {
            console.log('yes');
            callback();
        }
    }
);

let matchURL = (url) => {
    url = url.toLowerCase();
    let stripped = url.match(/\:\/\/(www\.)?((.[^/]*)\.(.[^/]*))\//);
    return (stripped && state.urls.indexOf(stripped[2]) > -1);
};

chrome.webRequest.onBeforeRequest.addListener((tab) => {
    if(matchURL(tab.url) && state.enabled) {
        return {
            redirectUrl: chrome.extension.getURL('blocked.html')
        };
    }
}, {
    urls: ['<all_urls>']
}, ['blocking']);

chrome.storage.sync.get('state', (data) => {
    if(data.state) {
      state = data.state;
      chrome.runtime.sendMessage({directive: 'updatePigeonState', state});
    }
    else chrome.storage.sync.set({'state': state});
});

chrome.commands.onCommand.addListener(function(command) {
  switch(command) {
    case 'blocking_on':
      setEnabled(_ => true);
      break;
    case 'blocking_off':
      setEnabled(_ => false);
      break;
    case 'blocking_toggle':
      setEnabled(oldEnabled => !oldEnabled);
      break;
  }
});
