document.addEventListener('DOMContentLoaded', () => {
    // Ensure the DOM content is fully loaded
    console.log('"LOADED"');
    initiatePopup();

    // Add event listener to the save button
    document.getElementById('saveButton').addEventListener('click', () => {
        const commentMessage = document.getElementById('commentMessageDiv').value;
        console.log(commentMessage);

        // Save the comment message to Chrome storage
        chrome.storage.sync.set({ commentMessage: commentMessage }, () => {
            console.log('Comment message saved.');

            // Send the message to the LinkedIn tab if it is active
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                tabs.forEach((tab) => {
                    if (tab.url.includes('www.linkedin.com')) {
                        chrome.tabs.sendMessage(tab.id, { message: 'updateCommentMessage', commentMessage: commentMessage });
                    }
                });
            });
        });
    });

    // Add event listener to the reload toggle switch
    document.getElementById('reloadToggle').addEventListener('change', () => {
        const reloadEnabled = document.getElementById('reloadToggle').checked;
        // console.log('reloadEnabled', reloadEnabled);
        console.log('Reload Enabled:', reloadEnabled);

        // Save the reload state to Chrome storage
        chrome.storage.sync.set({ reloadEnabled: reloadEnabled }, () => {
            console.log('Reload state saved.');
        });

        // Send the message to the LinkedIn tab if it is active
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url.includes('www.linkedin.com')) {
                    chrome.tabs.sendMessage(tab.id, { message: 'reloadToggle', commentMessage: reloadEnabled });
                }
            });
        });
    });

    // Add event listener to the reload toggle switch
    document.getElementById('loopToggle').addEventListener('change', () => {
        const loopToggle = document.getElementById('loopToggle').checked;
        // console.log('reloadEnabled', reloadEnabled);
        console.log('Reload Enabled:', loopToggle);

        // Save the reload state to Chrome storage
        chrome.storage.sync.set({ loopEnabled: loopToggle }, () => {
            console.log('loopToggle state saved.');
        });

        // Send the message to the LinkedIn tab if it is active
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url.includes('www.linkedin.com')) {
                    chrome.tabs.sendMessage(tab.id, { message: 'loopEnabled', commentMessage: loopToggle });
                }
            });
        });
    });


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // console.log('message Check', typingStarted);
        if (message.message === 'typingStarted') {
            // chrome.storage.sync.get('typingStarted', (data) => {
            const botStatusBtn = document.getElementById('bot-status');
            if (botStatusBtn && message.commentMessage) {
                botStatusBtn.innerText = 'Typing...';
            } else {
                botStatusBtn.innerText = 'Generate';
            }
            // });
        }
    });
});

function initiatePopup() {
    const comment = document.getElementById('commentMessageDiv');
    console.log('"in popup"');
    if (comment) {
        chrome.storage.sync.get('commentMessage', (data) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else if (data.commentMessage) {
                comment.value = data.commentMessage;
            }
        });
    } else {
        console.error('Element with ID "commentMessageDiv" not found.');
    }


    chrome.storage.sync.get('typingStarted', (data) => {
        console.log('data.typingStarted', data.typingStarted);
        const botStatusBtn = document.getElementById('bot-status');
        if (botStatusBtn && data.typingStarted) {
            botStatusBtn.innerText = 'Typing...';
        } else {
            botStatusBtn.innerText = 'Generate';
        }
    });

    // Initialize reload toggle switch state
    chrome.storage.sync.get('reloadEnabled', (data) => {
        const reloadToggle = document.getElementById('reloadToggle');
        if (reloadToggle) {
            if (data.reloadEnabled !== undefined) {
                reloadToggle.checked = data.reloadEnabled;
            }
        } else {
            console.error('Element with ID "reloadToggle" not found.');
        }
    }); 
    
    // Initialize reload toggle switch state
    chrome.storage.sync.get('loopEnabled', (data) => {
        const loopEnabled = document.getElementById('loopToggle');
        if (loopEnabled) {
            if (data.loopEnabled !== undefined) {
                loopEnabled.checked = data.loopEnabled;
            }
        } else {
            console.error('Element with ID "loopEnabled" not found.');
        }
    });
}
