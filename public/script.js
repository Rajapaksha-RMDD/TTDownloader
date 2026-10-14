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

// 3. Find the best video link anywhere in the API response
function findVideoUrl(obj) {
    const found = [];
    (function walk(value, key) {
        if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
            found.push({ key: key || '', value });
        } else if (value && typeof value === 'object') {
            for (const k of Object.keys(value)) walk(value[k], k);
        }
    })(obj, '');

    const score = (item) => {
        const k = item.key.toLowerCase();
        const v = item.value.toLowerCase();
        let s = 0;
        if (/nowm|no_?water|nowatermark|without/.test(k)) s += 5;
        if (/play|download|video|url|link/.test(k)) s += 2;
        if (/wm|watermark/.test(k) && !/no|without/.test(k)) s -= 5;
        if (/\.mp4|video/.test(v)) s += 2;
        if (/cover|thumb|avatar|image|music|\.jpg|\.jpeg|\.png|\.webp/.test(k + v)) s -= 6;
        return s;
    };

    found.sort((a, b) => score(b) - score(a));
    return found.length ? found[0].value : null;
}

// 4. Download Logic (calls your own server, no API key in the browser)
document.getElementById('download-btn').addEventListener('click', async () => {
    const urlInput = document.getElementById('video-url').value.trim();
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
        const response = await fetch(`/api/download?url=${encodeURIComponent(urlInput)}`);
        const data = await response.json();

        if (!response.ok) {
            statusMessage.textContent = data.error || data.message || 'The API returned an error.';
            console.log('Full API Response:', data);
            return;
        }

        const videoUrl = findVideoUrl(data);

        if (videoUrl) {
            statusMessage.textContent = 'Video processed successfully!';
            downloadLink.href = videoUrl;
            resultContainer.style.display = 'block';
        } else {
            statusMessage.textContent = 'Could not find a video link in the API response.';
            console.log('Full API Response:', data);
        }
    } catch (error) {
        console.error('Error fetching the video:', error);
        statusMessage.textContent = 'An error occurred. Check the developer console for details.';
    }
});