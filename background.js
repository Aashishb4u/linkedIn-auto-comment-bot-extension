let tabIds = [];

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url.includes('linkedin.com')) {
        console.log('I am Triggered - in background', tabId);
        if (tab.url.includes('linkedin.com')) {
            tabIds = Array.from(new Set(tabIds).add(tabId));
            chrome.storage.local.set({ linkedInTabIds: tabIds });
            chrome.storage.local.set({ currentTabId: tabId });
            // const linkedInTabId = tabId;
        }
        // Perform actions related to LinkedIn page
        // You can inject content scripts programmatically here if needed
    }
});

chrome.runtime.onInstalled.addListener((tabId, removeremoveInfo, tab) => {
    // console.log('OnInstall');
    console.log('Installed');
    chrome.storage.local.set({ loopEnabled: true, typingStarted: false, reloadEnabled: true, 
        commentMessage: "" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === 'typingStarted') {
        // Relay the message to the popup script
        chrome.runtime.sendMessage({ message: 'typingStarted', commentMessage: message.commentMessage });
    }
});



// // Listen for tab removal event
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.local.get(['currentTabId', 'linkedInTabIds'], (data) => {
        console.log('data.linkedInTabIds',data.linkedInTabIds);
        if(data.currentTabId === tabId) {
            chrome.storage.local.set({typingStarted: false});
            chrome.storage.local.set({currentTabId: null});
            // chrome.runtime.sendMessage({ message: 'typingStarted', commentMessage: message.commentMessage });
        }
    });
});