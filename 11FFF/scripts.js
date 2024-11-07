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

    // Handle Suggestions
    const suggestionForm = document.getElementById('suggestionForm');
    const suggestionsList = document.getElementById('suggestionsList');

    suggestionForm.addEventListener('submit', e => {
        e.preventDefault();
        const suggestionInput = document.getElementById('suggestionInput');

        const suggestionItem = document.createElement('li');
        suggestionItem.textContent = suggestionInput.value;
        suggestionItem.style.animation = "fadeIn 0.5s ease";
        suggestionsList.appendChild(suggestionItem);

        suggestionInput.value = '';
    });

    // Handle Discussion with Name Input
    const discussionForm = document.getElementById('discussionForm');
    const discussionList = document.getElementById('discussionList');

    discussionForm.addEventListener('submit', e => {
        e.preventDefault();
        const nameInput = document.getElementById('nameInput');
        const discussionInput = document.getElementById('discussionInput');

        // Default to "Guest" if name is empty
        const commenterName = nameInput.value.trim() || "Guest";

        // Create Comment with Name
        const comment = document.createElement('p');
        comment.innerHTML = `<strong>${commenterName}:</strong> ${discussionInput.value}`;
        comment.style.animation = "fadeIn 0.5s ease";
        discussionList.appendChild(comment);

        // Clear Inputs
        nameInput.value = '';
        discussionInput.value = '';
    });
});
