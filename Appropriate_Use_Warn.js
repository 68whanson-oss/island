/**
 * Island RPA: Page Blur with Toast Message Gate
 * 
 * Purpose: Blur page content and require user acknowledgment via Island Toast
 * before allowing access to the page content.
 * 
 * Toast Message: "Warned Access Page"
 * 
 * @version 1.0.0
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
        triggerOncePerSession: false, // Set to true if you want one-time per session behavior
        maxRetries: 3,
        retryDelay: 1000 // ms
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
    // ============================================================================

    function applyPageBlur() {
        if (isBlurred) {
            log('Page already blurred.', 'debug');
            return;
        }

        try {
            // Overlay uses backdrop-filter to blur content behind it.
            // pointer-events: all blocks interaction with the page underneath.
            // Do NOT apply filter to document.body — that would blur the overlay
            // and any Island toast rendered inside the body as well.
            const overlay = document.createElement('div');
            overlay.id = 'island-blur-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                backdrop-filter: blur(${CONFIG.blurIntensity});
                -webkit-backdrop-filter: blur(${CONFIG.blurIntensity});
                background-color: rgba(255, 255, 255, 0.1);
                z-index: ${CONFIG.overlayZIndex};
                pointer-events: all;
                transition: opacity 0.3s ease-out;
            `;

            document.documentElement.appendChild(overlay);

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
            const overlay = document.getElementById('island-blur-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }

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
            // Check if Island API is available
            if (typeof island === 'undefined' || !island.toaster) {
                log('Island Toaster API not available. Retrying...', 'warn');
                
                if (retryCount < CONFIG.maxRetries) {
                    retryCount++;
                    setTimeout(displayIslandToast, CONFIG.retryDelay);
                    return;
                } else {
                    throw new Error('Island Toaster API not available after maximum retries');
                }
            }

            // Display the Island Toast Message
            island.toaster.show({
                messageTemplate: CONFIG.toastMessageName,
                onAction: handleToastAction,
                onDismiss: handleToastDismiss,
                persistent: true // Prevent auto-dismiss
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
        
        // Log the user's choice for audit purposes
        const auditLog = {
            timestamp: new Date().toISOString(),
            action: action.type || action.button || 'unknown',
            actionData: action,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        log(`Audit Log: ${JSON.stringify(auditLog)}`);

        // Mark session as acknowledged
        markSessionAcknowledged();

        // Unblur the page
        removePageBlur();

        // Optional: Send audit log to backend
        // sendAuditLog(auditLog);
    }

    function handleToastDismiss() {
        log('Toast dismissed without action.', 'warn');
        
        // Optionally keep page blurred if dismissed without action
        // For this implementation, we'll still unblur on dismiss
        markSessionAcknowledged();
        removePageBlur();
    }

    // ============================================================================
    // FALLBACK HANDLER
    // ============================================================================

    function handleFallback() {
        log('Initiating fallback mode due to Island Toast unavailability.', 'warn');
        
        // Create a simple modal fallback
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
                Island Toast Message system is unavailable. 
                Please contact your IT administrator.
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
        
        document.body.appendChild(fallbackModal);
        
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
        // Implement your audit log endpoint here
        // Example:
        /*
        fetch('https://your-audit-endpoint.com/api/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(auditData)
        })
        .then(response => log('Audit log sent successfully.'))
        .catch(error => log(`Failed to send audit log: ${error.message}`, 'error'));
        */
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    function initialize() {
        log('Initializing Island Page Blur RPA...');

        try {
            // Check if already acknowledged this session
            if (checkSessionAcknowledgment()) {
                log('RPA execution skipped - already acknowledged this session.');
                return;
            }

            // Apply blur immediately
            applyPageBlur();

            // Display Island Toast
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

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM already loaded
        initialize();
    }

    // Expose functions for debugging (optional, remove in production if needed)
    window.islandPageBlurRPA = {
        version: '1.0.0',
        removeBlur: removePageBlur,
        getState: () => ({
            isBlurred,
            toastDisplayed,
            retryCount
        })
    };

})();