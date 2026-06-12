/**
 * Island RPA: Page Blur with Toast Message Gate
 *
 * Purpose: Blur page content and require user acknowledgment via Island Toast
 * before allowing access to the page content.
 *
 * Toast Message: "Warned Access Page"
 *
 * @version 1.2.0
 * @author Island RPA Automation
 */

(function() {
    'use strict';

    // ============================================================================
    // CONFIGURATION
    // ============================================================================

    const CONFIG = {
        toastMessageName: 'Warned Access Page',
        blurIntensity: '10px',
        overlayZIndex: 999999,
        logPrefix: '[Island Page Blur RPA]',
        sessionStorageKey: 'island_page_blur_acknowledged',
        triggerOncePerSession: false,
        maxRetries: 10,
        retryDelay: 500 // ms
    };

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    let isBlurred = false;
    let toastDisplayed = false;
    let retryCount = 0;

    // ============================================================================
    // LOGGING UTILITY
    // ============================================================================

    function log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `${CONFIG.logPrefix} [${timestamp}] ${message}`;

        switch(level) {
            case 'error':
                console.error(logMessage);
                break;
            case 'warn':
                console.warn(logMessage);
                break;
            case 'debug':
                console.debug(logMessage);
                break;
            default:
                console.log(logMessage);
        }
    }

    // ============================================================================
    // SESSION CHECK
    // ============================================================================

    function checkSessionAcknowledgment() {
        if (CONFIG.triggerOncePerSession) {
            const acknowledged = sessionStorage.getItem(CONFIG.sessionStorageKey);
            if (acknowledged === 'true') {
                log('User has already acknowledged this session. Skipping blur.');
                return true;
            }
        }
        return false;
    }

    function markSessionAcknowledged() {
        if (CONFIG.triggerOncePerSession) {
            sessionStorage.setItem(CONFIG.sessionStorageKey, 'true');
            log('Session marked as acknowledged.');
        }
    }

    // ============================================================================
    // PAGE BLUR FUNCTIONALITY
    //
    // Island renders its toast messages at the browser chrome level, above the
    // page DOM. Applying filter:blur to document.body blurs all page content
    // without affecting Island's toast UI layer.
    // ============================================================================

    function applyPageBlur() {
        if (isBlurred) {
            log('Page already blurred.', 'debug');
            return;
        }

        try {
            document.body.style.filter = `blur(${CONFIG.blurIntensity})`;
            document.body.style.pointerEvents = 'none';
            document.body.style.userSelect = 'none';

            isBlurred = true;
            log('Page blur applied successfully.');

        } catch (error) {
            log(`Error applying page blur: ${error.message}`, 'error');
            throw error;
        }
    }

    function removePageBlur() {
        if (!isBlurred) {
            log('Page is not blurred.', 'debug');
            return;
        }

        try {
            document.body.style.filter = '';
            document.body.style.pointerEvents = '';
            document.body.style.userSelect = '';

            isBlurred = false;
            log('Page blur removed successfully.');

        } catch (error) {
            log(`Error removing page blur: ${error.message}`, 'error');
        }
    }

    // ============================================================================
    // ISLAND TOAST MESSAGE INTEGRATION
    // ============================================================================

    function displayIslandToast() {
        if (toastDisplayed) {
            log('Toast already displayed.', 'debug');
            return;
        }

        try {
            if (typeof island === 'undefined') {
                log('Island API object not available. Retrying...', 'warn');

                if (retryCount < CONFIG.maxRetries) {
                    retryCount++;
                    setTimeout(displayIslandToast, CONFIG.retryDelay);
                    return;
                } else {
                    throw new Error('Island API not available after maximum retries');
                }
            }

            // Log available Island API properties to aid debugging
            log(`Island API keys: ${Object.keys(island).join(', ')}`);

            // Invoke the pre-configured toast message template from Island console.
            // Island renders this at the browser chrome level (not in the page DOM).
            island.showToastMessage(CONFIG.toastMessageName, function(action) {
                if (action) {
                    handleToastAction(action);
                } else {
                    handleToastDismiss();
                }
            });

            toastDisplayed = true;
            log(`Island Toast "${CONFIG.toastMessageName}" displayed successfully.`);

        } catch (error) {
            log(`Error displaying Island Toast: ${error.message}`, 'error');
            handleFallback();
        }
    }

    // ============================================================================
    // TOAST EVENT HANDLERS
    // ============================================================================

    function handleToastAction(action) {
        log(`User selected action: ${action.type || action.button || 'unknown'}`);

        const auditLog = {
            timestamp: new Date().toISOString(),
            action: action.type || action.button || 'unknown',
            actionData: action,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        log(`Audit Log: ${JSON.stringify(auditLog)}`);

        markSessionAcknowledged();
        removePageBlur();

        // sendAuditLog(auditLog);
    }

    function handleToastDismiss() {
        // User dismissed without clicking an action button.
        // Page must remain blurred — re-display the toast.
        log('Toast dismissed without action. Re-displaying toast.', 'warn');
        toastDisplayed = false;
        displayIslandToast();
    }

    // ============================================================================
    // FALLBACK HANDLER
    //
    // Appended to document.documentElement (not document.body) so it is not
    // subject to the blur filter applied to document.body.
    // ============================================================================

    function handleFallback() {
        log('Initiating fallback mode due to Island Toast unavailability.', 'warn');

        const existing = document.getElementById('island-fallback-modal');
        if (existing) return;

        const fallbackModal = document.createElement('div');
        fallbackModal.id = 'island-fallback-modal';
        fallbackModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: ${CONFIG.overlayZIndex + 1};
            max-width: 400px;
            text-align: center;
            font-family: system-ui, -apple-system, sans-serif;
        `;

        fallbackModal.innerHTML = `
            <h2 style="margin-top: 0; color: #d32f2f;">Access Warning</h2>
            <p style="margin: 20px 0; line-height: 1.6; color: #333;">
                You must acknowledge this warning before accessing the page.
            </p>
            <button id="island-fallback-btn" style="
                background: #1976d2;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            ">Acknowledge</button>
        `;

        // Attach to <html>, not <body>, so body's blur filter doesn't apply here
        document.documentElement.appendChild(fallbackModal);

        document.getElementById('island-fallback-btn').addEventListener('click', function() {
            log('User acknowledged fallback modal.');
            fallbackModal.remove();
            markSessionAcknowledged();
            removePageBlur();
        });
    }

    // ============================================================================
    // OPTIONAL: AUDIT LOG SENDER
    // ============================================================================

    function sendAuditLog(auditData) {
        /*
        fetch('https://your-audit-endpoint.com/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(auditData)
        })
        .then(() => log('Audit log sent successfully.'))
        .catch(error => log(`Failed to send audit log: ${error.message}`, 'error'));
        */
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    function initialize() {
        log('Initializing Island Page Blur RPA...');

        try {
            if (checkSessionAcknowledgment()) {
                log('RPA execution skipped - already acknowledged this session.');
                return;
            }

            applyPageBlur();
            displayIslandToast();

            log('Island Page Blur RPA initialized successfully.');

        } catch (error) {
            log(`Critical error during initialization: ${error.message}`, 'error');
            handleFallback();
        }
    }

    // ============================================================================
    // EXECUTION
    // ============================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    window.islandPageBlurRPA = {
        version: '1.2.0',
        removeBlur: removePageBlur,
        getState: () => ({ isBlurred, toastDisplayed, retryCount })
    };

})();
