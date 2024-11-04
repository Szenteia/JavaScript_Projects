document.addEventListener('DOMContentLoaded', () => {
    const videoUrls = [
        "https://www.youtube.com/embed/jIP1lR0NFkI?si=a5wlBtO51X7ccklp",
        "https://www.youtube.com/embed/VIDEO_ID_2"
    ];
    
    const videoGrid = document.getElementById('video-grid');
    videoUrls.forEach(url => {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.allowFullscreen = true;
        videoGrid.appendChild(iframe);
    });

    const suggestionForm = document.getElementById('suggestionForm');
    const suggestionsList = document.getElementById('suggestionsList');

    suggestionForm.addEventListener('submit', e => {
        e.preventDefault();
        const suggestionInput = document.getElementById('suggestionInput');
        const suggestionItem = document.createElement('li');
        suggestionItem.textContent = suggestionInput.value;
        suggestionsList.appendChild(suggestionItem);
        suggestionInput.value = '';
    });

    const discussionForm = document.getElementById('discussionForm');
    const discussionList = document.getElementById('discussionList');

    discussionForm.addEventListener('submit', e => {
        e.preventDefault();
        const discussionInput = document.getElementById('discussionInput');
        const comment = document.createElement('p');
        comment.textContent = discussionInput.value;
        discussionList.appendChild(comment);
        discussionInput.value = '';
    });
});
