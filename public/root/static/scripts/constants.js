function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(decimals < 0 ? 0 : decimals))} ${['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][i]}`;
}

function isVideo(extension) {
    extension = extension.toLowerCase();
    if (extension === 'webm' || extension === 'mp4') return true;
    else return false;
}

function sendPosts(posts, targetElement, tags) {
    for (const post of posts) {
        if (post.file.ext === 'zip') continue;
        const link = Object.assign(document.createElement('a'), { id: post.id, href: `${location.origin}/posts/${post.id}?tags=${tags}` });
        const image = Object.assign(document.createElement('img'), { src: `/media/preview/${post.id}`, loading: 'lazy' });
        image.addEventListener('error', () => (link.style.display = 'none'));
        link.classList.add('post');
        link.appendChild(image);
        if (isVideo(post.file.ext)) link.style.border = '2px solid #f0758a';
        document.getElementById(targetElement)?.appendChild(link);
        if ('ontouchstart' in document.documentElement) continue;
        if (!isVideo(post.file.ext)) {
            link.addEventListener('mouseenter', () => (image.src = `/media/full/${post.id}`));
            link.addEventListener('mouseleave', () => (image.src = `/media/preview/${post.id}`));
        } else {
            let video = Object.assign(document.createElement('video'), { src: `/media/full/${post.id}`, controls: false, autoplay: true, muted: true, loop: true });
            link.addEventListener('mouseenter', () => (link.removeChild(image), link.appendChild(video)));
            link.addEventListener('mouseleave', () => {
                link.removeChild(video), link.appendChild(image);
                video = Object.assign(document.createElement('video'), { src: `/media/full/${post.id}`, controls: false, autoplay: true, muted: true, loop: true });
            });
        }
    }
    return true;
}

function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = seconds / 31536000;
    if (interval > 1)
        if (Math.floor(interval) === 1) return Math.floor(interval) + ' year ago';
        else return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1)
        if (Math.floor(interval) === 1) return Math.floor(interval) + ' month ago';
        else return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1)
        if (Math.floor(interval) === 1) return Math.floor(interval) + ' day ago';
        else return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1)
        if (Math.floor(interval) === 1) return Math.floor(interval) + ' hour ago';
        else return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1)
        if (Math.floor(interval) === 1) return Math.floor(interval) + ' minute ago';
        else return Math.floor(interval) + ' minutes ago';
    if (Math.floor(interval) === 1) return Math.floor(interval) + ' second ago';
    return Math.floor(seconds) + ' seconds ago';
}
