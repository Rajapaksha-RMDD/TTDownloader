// 1. Paste Button Logic
document.getElementById('paste-btn').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText(); 
        document.getElementById('video-url').value = text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        alert('Unable to paste automatically. Please press Ctrl+V inside the box.');
    }
});

// 2. Format Button Toggle Logic
const formatBtns = document.querySelectorAll('.format-btn');
formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// 3. API Download Logic
document.getElementById('download-btn').addEventListener('click', async () => {
    const urlInput = document.getElementById('video-url').value;
    const statusMessage = document.getElementById('status-message');
    const resultContainer = document.getElementById('result-container');
    const downloadLink = document.getElementById('final-download-link');

    if (!urlInput) {
        statusMessage.textContent = 'Please paste a TikTok link first.';
        return;
    }

    statusMessage.textContent = 'Processing your video... Please wait.';
    resultContainer.style.display = 'none';

    try {
        const encodedUrl = encodeURIComponent(urlInput);
        
        const apiUrl = `https://tiktok-video-downloader-api.p.rapidapi.com/media?videoUrl=${encodedUrl}`;
        
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '4bd7c943aemsh61b30da1ebb7e59p1430d6jsn52b9f4926424', 
                'X-RapidAPI-Host': 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com' 
            }
        };

        const response = await fetch(apiUrl, options);
        const data = await response.json();
        
        const noWatermarkVideoUrl = data.downloadUrl; 

        if (noWatermarkVideoUrl) {
            statusMessage.textContent = 'Video processed successfully!';
            
            downloadLink.href = noWatermarkVideoUrl;
            downloadLink.setAttribute('download', 'tiktok_video.mp4'); 
            resultContainer.style.display = 'block';
        } else {
            statusMessage.textContent = 'Error: Could not find the video in the API response.';
            console.log("Full API Response:", data); 
        }

    } catch (error) {
        console.error('Error fetching the video:', error);
        statusMessage.textContent = 'An error occurred. Check the developer console for details.';
    }
});