'use strict';

let state = {
    urls: [],
    enabled: true
};

chrome.runtime.onMessage.addListener(
    function(request, sender, callback){
        if(request.directive == 'togglePigeon') {
            state.enabled = !state.enabled;
            chrome.storage.sync.set({'state': state});
            callback(state.enabled);
        }
        else if(request.directive == 'addSite') {
            state.urls.push(request.site);
            chrome.storage.sync.set({'state': state});
            callback();
        }
        else if(request.directive == 'removeSite') {
            state.urls.splice(state.urls.indexOf(request.site), 1);
            chrome.storage.sync.set({'state': state});
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
    if(data.state) state = data.state;
    else chrome.storage.sync.set({'state': state});
});
