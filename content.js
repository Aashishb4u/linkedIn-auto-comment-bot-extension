const keywords = ['developer', 'Urgently seeking', "we're looking for", 'hiring', 'Join Our Team', 'Seeking to hire', 'Job Role', 'looking to hire', 'have a new opening for', 'web developer', 'looking for', 'react', 'node js', 'angular'];
const excludedKeywords = ['I’m happy to share that I’m starting a new position'];
const textToType = "Hi, I'm Aashish Bhagwat, a full-stack developer with 7 years of experience in Angular, Node.js, ReactJS, Laravel, IONIC, and Tailwind. I've delivered over 40 projects and co-founded CreativeHand. Contact me at +91-8208690072 or WhatsApp +91-9403733265. Give me a chance to prove my work. Check my portfolio: [Aashish Bhagwat](https://aashish-bhagwat.creativehand.co.in)";
const typingSpeed = 100;
let typingStarted = false;


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    typingStarted = false;
    chrome.storage.sync.set({ typingStarted: false });
    // Send the message to the background script
    chrome.runtime.sendMessage({ message: 'typingStarted', commentMessage: typingStarted });
});

function getRandomDelay() {
    return Math.floor(Math.random() * (2000 - 700 + 1)) + 700;
}

function typingSpeedDelay() {
    return Math.floor(Math.random() * 100) + 100;
}

function getLongDelay() {
    return Math.floor(Math.random() * (20000 - 700 + 1)) + 700;
}

function scrollToBottom() {
    let scrollDistance = document.body.scrollHeight * 3; // Scroll twice the height of the page
    let scrolledDistance = 0;

    let scrollInterval = setInterval(() => {
        window.scrollBy(0, 10); // Adjust the scrolling speed (10 pixels per interval)
        scrolledDistance += 40; // Keep track of the scrolled distance
        if (scrolledDistance >= scrollDistance || window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            clearInterval(scrollInterval); // Stop scrolling when reached the target distance or the bottom of the page
        }
    }, 50); // Adjust the interval (50 milliseconds)
}

function getPostIdentifier(post) {
    const postContainer = post.closest('.feed-shared-update-v2');
    console.log(postContainer.getAttribute('data-urn'));
    return postContainer.getAttribute('data-urn');  // Use an appropriate attribute for a unique identifier
}

function postNextAction() {
    typingStarted = false;
    chrome.storage.sync.set({ typingStarted: false });
    chrome.runtime.sendMessage({ message: 'typingStarted', commentMessage: typingStarted });
    chrome.storage.sync.get(['reloadEnabled', 'loopEnabled', 'commentMessage'], (data) => {
        if (data.reloadEnabled) {
            reloadPage();
        } else if (data.loopEnabled && data.commentMessage) {
            commentOnPosts(data.commentMessage);
        }
    });
}

function scrollToThreeTimes() {
    return new Promise((resolve) => {
        let count = 0;
        const scrollInterval$ = setInterval(() => {
            let scrollDistance = document.body.scrollHeight;
            window.scrollTo(0, scrollDistance);
            count++;
            if (count === 2) {
                clearInterval(scrollInterval$);
                resolve();  // Resolve the promise after scrolling three times
            }
        }, 1500);
    });
}

function handleMatchingPosts(posts) {
    return new Promise((resolve) => {
        const postArray = Array.from(posts);
        const anyPostHasKeyword = postArray.some((post) => {
            const postTextElement = post.querySelector('.tvm-parent-container');
            if (postTextElement) {
                const postText = postTextElement.innerText.toLowerCase();
                return keywords.some(keyword => postText.includes(keyword.toLowerCase()));
            }
        });
        resolve({ posthaskey: anyPostHasKeyword });
    });
}

function commentOnPosts(commentMessage) {
    // Scroll the page to load more content
    scrollToThreeTimes().then(() => {
        console.log('Called Me');

        // Wait for a short delay for the content to load
        setTimeout(() => {
            const posts = document.querySelectorAll('.feed-shared-update-v2__description-wrapper');
            handleMatchingPosts(posts).then((res) => {
                if (res.posthaskey) {
                    let postsProcessed = 0;

                    posts.forEach((post) => {
                        const postTextElement = post.querySelector('.tvm-parent-container');
                        if (postTextElement) {
                            const postText = postTextElement.innerText.toLowerCase();
                            if (keywords.some((keyword) => postText.includes(keyword)) && !excludedKeywords.some((keyword) => postText.includes(keyword))) {
                                const commentButton = post.closest('#fie-impression-container').querySelector('.comment-button');
                                if (commentButton) {
                                    commentButton.click();
                                    setTimeout(() => {
                                        chrome.storage.sync.get('commentedPosts', (data) => {
                                            const commentBox = post.closest('#fie-impression-container').querySelector('.ql-editor');
                                            let commentedPosts = data.commentedPosts || [];
                                            const postId = getPostIdentifier(post);
                                            if (commentedPosts.includes(postId)) {
                                                commentBox.setAttribute('data-placeholder', 'Already Commented Here!');
                                                commentBox.setAttribute('aria-placeholder', 'Already Commented Here!');
                                                postsProcessed++;
                                                if (postsProcessed === posts.length) {
                                                    postNextAction();
                                                }
                                            } else if (!commentedPosts.includes(postId) && commentBox) {
                                                // Should be pushed here only.
                                               
                                                commentedPosts = Array.from(new Set(commentedPosts).add(postId));
                                                chrome.storage.sync.set({ commentedPosts: commentedPosts });

                                                commentBox.setAttribute('data-placeholder', 'comments started');
                                                commentBox.setAttribute('aria-placeholder', 'comments started');
                                                commentBox.innerHTML = ''; // Clear any existing content
                                                simulateTyping(commentBox, commentMessage, typingSpeed).then(() => {
                                                    setTimeout(() => {
                                                        const submitButton = post.closest('#fie-impression-container').querySelector('.comments-comment-box__submit-button');
                                                        if (submitButton) {
                                                            setTimeout(() => {
                                                                submitButton.click();
                                                                postsProcessed++;
                                                                if (postsProcessed === posts.length) {
                                                                    postNextAction();
                                                                }

                                                            }, getRandomDelay());
                                                        }
                                                    }, getRandomDelay());
                                                });
                                            } else {
                                                postsProcessed++;
                                                if (postsProcessed === posts.length) {
                                                    postNextAction();
                                                }
                                            }
                                        });
                                    }, getRandomDelay());
                                } else {
                                    postsProcessed++;
                                    if (postsProcessed === posts.length) {
                                        postNextAction();
                                    }
                                }
                            } else {
                                postsProcessed++;
                                if (postsProcessed === posts.length) {
                                    postNextAction();
                                }
                            }
                        } else {
                            postsProcessed++;
                            if (postsProcessed === posts.length) {
                                postNextAction();
                            }
                        }
                    });
                } else {
                    postNextAction();
                }
            });
        }, 3000);
    });
}


function reloadPage() {
    setTimeout(() => {
        location.reload();
    }, getLongDelay());
}

function simulateTyping(element, text, speed) {
    return new Promise((resolve) => {
        let index = 0;

        function typeCharacter() {
            if (index < text.length) {
                const char = text[index];
                const currentHTML = element.innerHTML;

                if (currentHTML.endsWith('<br>')) {
                    element.innerHTML = currentHTML.slice(0, -4);
                }

                element.textContent += char;

                index++;
                setTimeout(typeCharacter, typingSpeedDelay());
            } else {
                resolve(); // Resolve the promise once typing completes
            }
        }

        typeCharacter();
    });

}

chrome.storage.sync.get(['commentMessage', 'loopEnabled', 'typingStarted'], (data) => {
    if (data.commentMessage && data.loopEnabled && !data.typingStarted) {
        commentMessage = data.commentMessage;
        typingStarted = true;
        chrome.storage.sync.set({ typingStarted: true });
        commentOnPosts(data.commentMessage);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message Check', typingStarted);
    if (message.message === 'updateCommentMessage' && typingStarted === false) {
        commentMessage = message.commentMessage;
        typingStarted = true;
        chrome.storage.sync.set({ typingStarted: true });

        // Send the message to the background script
        chrome.runtime.sendMessage({ message: 'typingStarted', commentMessage: typingStarted });

        commentOnPosts(commentMessage);
    }

    if (message.message === 'reloadToggle') {

    }


    if (message.message === 'loopEnabled') {

    }
});







