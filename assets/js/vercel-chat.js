(function () {
    "use strict";

    const ROOT_ID = "vercel-chat-widget";
    const DEFAULT_CHAT_URL = "https://chat-bot-flame-six.vercel.app/";
    const DEFAULT_TITLE = "Βοηθός Π.Κ.Σ.Α.Α.";

    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
            return;
        }

        callback();
    }

    function getCurrentScript() {
        return document.currentScript || document.querySelector('script[src*="vercel-chat.js"]');
    }

    function getConfig() {
        const script = getCurrentScript();

        return {
            chatUrl: script?.dataset?.chatUrl || DEFAULT_CHAT_URL,
            title: script?.dataset?.title || DEFAULT_TITLE,
            openOnLoad: script?.dataset?.openOnLoad === "true"
        };
    }

    function safeUrl(value) {
        try {
            return new URL(value, window.location.href).href;
        } catch (error) {
            return DEFAULT_CHAT_URL;
        }
    }

    function createToggle(title) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "vercel-chat-toggle";
        button.setAttribute("aria-controls", "vercel-chat-panel");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", `Άνοιγμα συνομιλίας με τον ${title}`);
        button.innerHTML = '<i class="fa-solid fa-comments" aria-hidden="true"></i>';

        return button;
    }

    function createPanel(config) {
        const panel = document.createElement("section");
        panel.id = "vercel-chat-panel";
        panel.className = "vercel-chat-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-label", config.title);
        panel.setAttribute("aria-modal", "false");

        const iframe = document.createElement("iframe");
        iframe.className = "vercel-chat-frame";
        iframe.title = config.title;
        iframe.src = safeUrl(config.chatUrl);
        iframe.loading = "lazy";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allow = "clipboard-write; microphone";

        panel.appendChild(iframe);

        return { panel, iframe };
    }

    function getMessageAction(data) {
        if (typeof data === "string") return data;
        if (data && typeof data.action === "string") return data.action;
        return "";
    }

    function mountChat() {
        if (document.getElementById(ROOT_ID)) return;

        const config = getConfig();
        const chatUrl = safeUrl(config.chatUrl);
        const chatOrigin = new URL(chatUrl).origin;
        const root = document.createElement("div");
        root.id = ROOT_ID;
        root.className = "vercel-chat-widget";

        const toggle = createToggle(config.title);
        const { panel, iframe } = createPanel(config);

        function openChat() {
            panel.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
            document.body.classList.add("vercel-chat-open");

            window.setTimeout(() => {
                try {
                    iframe.focus();
                } catch (error) {}
            }, 50);
        }

        function closeChat(options = {}) {
            panel.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("vercel-chat-open");

            if (options.restoreFocus !== false) {
                toggle.focus();
            }
        }

        function toggleChat() {
            if (panel.classList.contains("is-open")) {
                closeChat();
                return;
            }

            openChat();
        }

        toggle.addEventListener("click", toggleChat);

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && panel.classList.contains("is-open")) {
                closeChat();
            }
        });

        window.addEventListener("message", (event) => {
            if (event.origin !== chatOrigin) return;

            if (getMessageAction(event.data) === "closeChat") {
                closeChat({ restoreFocus: false });
            }
        });

        root.appendChild(panel);
        root.appendChild(toggle);
        document.body.appendChild(root);

        if (config.openOnLoad) {
            openChat();
        }
    }

    onReady(mountChat);
})();
