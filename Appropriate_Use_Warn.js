/**
 * Island RPA: Page Blur with Appropriate Use Warning Gate
 *
 * @version 1.8.0
 * @author Island RPA Automation
 */

(function () {
    var BLUR = '2px';

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
        console.log('[Appropriate Use Warn] island:', typeof island, 'notifications:', typeof island !== 'undefined' && island.notifications);
        island.notifications.alert({
            notificationId: 'warned-access-page',
            title: 'Appropriate Use Warning',
            message: 'Accessing this site is discouraged during business hours. If you believe this is in error, please submit a Help Desk Ticket.',
            sentiment: 'warning',
            primaryButton: 'Accept',
            secondaryButton: 'Go Back',
        });
    }

    // Execute directly — Island RPAs run after DOM is ready;
    // no jQuery dependency needed.
    applyBlur();
    showWarning();
})();
