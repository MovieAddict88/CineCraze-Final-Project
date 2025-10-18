// Debug PWA functionality
console.log('🔍 PWA Debug Script Loaded');

// Check if we're in a secure context
console.log('🔒 Secure context:', window.isSecureContext);

// Check service worker support
console.log('⚙️ Service Worker support:', 'serviceWorker' in navigator);

// Check beforeinstallprompt support
console.log('📱 beforeinstallprompt support:', 'beforeinstallprompt' in window);

// Check if we're already in standalone mode
console.log('📱 Standalone mode:', window.matchMedia('(display-mode: standalone)').matches);

// Check manifest
fetch('/manifest.json')
    .then(response => {
        console.log('📄 Manifest response:', response.status);
        return response.json();
    })
    .then(manifest => {
        console.log('📄 Manifest data:', manifest);
    })
    .catch(error => {
        console.error('❌ Manifest error:', error);
    });

// Check service worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration()
        .then(registration => {
            if (registration) {
                console.log('✅ Service Worker registered:', registration);
            } else {
                console.log('❌ No Service Worker registration found');
            }
        })
        .catch(error => {
            console.error('❌ Service Worker error:', error);
        });
}

// Check icons
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
iconSizes.forEach(size => {
    fetch(`/icons/icon-${size}x${size}.png`)
        .then(response => {
            console.log(`🖼️ Icon ${size}x${size}:`, response.status);
        })
        .catch(error => {
            console.error(`❌ Icon ${size}x${size} error:`, error);
        });
});

// Listen for beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🎉 beforeinstallprompt event fired!', e);
});

// Listen for appinstalled
window.addEventListener('appinstalled', (e) => {
    console.log('🎉 App installed!', e);
});