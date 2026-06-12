/**
 * Island RPA: Page Blur with Appropriate Use Warning Gate
 *
 * @version 1.6.0
 * @author Island RPA Automation
 */

(function () {
    var BLUR = '10px';
    var MAX_RETRIES = 20;
    var RETRY_DELAY = 500;
    var retries = 0;

    function applyBlur() {
        document.body.style.filter        = 'blur(' + BLUR + ')';
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect    = 'none';
    }

    function removeBlur() {
        document.body.style.filter        = '';
        document.body.style.pointerEvents = '';
        document.body.style.userSelect    = '';
    }

    function showWarning() {
        island.notifications.alert({
            notificationId: 'warned-access-page',
            title: 'Appropriate Use Warning',
            message: 'Accessing this site is discouraged during business hours. If you believe this is in error, please submit a Help Desk Ticket.',
            sentiment: 'warning',
            primaryButton: 'Accept',
            secondaryButton: 'Go Back',
        });
    }

    function tryInit() {
        if (typeof island !== 'undefined' && island.notifications) {
            applyBlur();
            showWarning();
        } else if (retries < MAX_RETRIES) {
            retries++;
            setTimeout(tryInit, RETRY_DELAY);
        } else {
            console.error('[Appropriate Use Warn RPA] island.notifications not available after retries.');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }
})();
