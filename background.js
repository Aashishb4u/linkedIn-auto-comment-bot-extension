chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.url.includes('linkedin.com')) {
        
        const tabIds = [];
        if (tab.url.includes('linkedin.com')) {
            tabIds = Array.from(new Set(tabIds).add(tabId));
            chrome.storage.sync.set({ linkedInTabIds: tabIds });
            // const linkedInTabId = tabId;
        }
        // Perform actions related to LinkedIn page
        // You can inject content scripts programmatically here if needed
    }
});

chrome.runtime.onInstalled.addListener((tabId, removeInfo, tab) => {
    // console.log('OnInstall');
    console.log('Installed');
    chrome.storage.sync.set({ loopEnabled: true, typingStarted: false, reloadEnabled: true, commentMessage: "Hi, I'm Aashish Bhagwat, a full-stack developer with 7 years of experience in Angular, Node.js, ReactJS, Laravel, IONIC, and Tailwind. I've delivered over 40 projects and co-founded CreativeHand. Contact me at +91-8208690072 or WhatsApp +91-9403733265. Give me a chance to prove my work. Check my portfolio: [Aashish Bhagwat](https://aashish-bhagwat.creativehand.co.in)" });
    chrome.alarms.create('checkLinkedIn', { periodInMinutes: 5 }); // 6 seconds
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === 'typingStarted') {
        // Relay the message to the popup script
        chrome.runtime.sendMessage({ message: 'typingStarted', commentMessage: message.commentMessage });
    }
});

// // Listen for tab removal event
chrome.tabs.onRemoved.addListener((tabId, removeInfo, tab) => {
    chrome.storage.sync.set({typingStarted: false});
//     console.log('removeInfo', removeInfo);
//     console.log('tabId', tabId);
//     if (tab.url.includes('linkedin.com')) {
//         chrome.runtime.sendMessage({ message: 'typingStarted', commentMessage: false });
//     }
//     // Reset variables in Chrome storage when a tab is closed

});


chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.storage.sync.get('commentMessage', (data) => {
        chrome.storage.sync.get('typingStarted', (data) => {
            if (alarm.name === 'checkLinkedIn' && data.commentMessage && !typingStarted) {
                console.log("Alarmed");
                chrome.tabs.query({ active: true }, (tabs) => {
                    tabs.forEach((tab) => {
                        if (tab.url.includes('www.linkedin.com')) {
                            chrome.tabs.sendMessage(tab.id, { message: 'updateCommentMessage', commentMessage: data.commentMessage });
                        }
                    });
                });
            }
        });
    });
});