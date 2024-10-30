document.addEventListener('DOMContentLoaded', () => {
    // Gallery Videos (Replace URLs with your YouTube video links)
    const videoUrls = [
        "https://www.youtube.com/embed/VIDEO_ID_1",
        "https://www.youtube.com/embed/VIDEO_ID_2"
    ];
    
    const videoGrid = document.getElementById('video-grid');
    videoUrls.forEach(url => {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.allowFullscreen = true;
        videoGrid.appendChild(iframe);
    });

    // Handle Suggestions
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

    // Handle Discussion
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
