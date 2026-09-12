(function () {
    // Keeps the Shirt and Bottom variants of a co-ord product together in the cart.
    // A pair is identified by its Shopify product_id and its first variant option.
    let previousCart = null;
    let updateQueue = Promise.resolve();

    function openCartDrawer() {
        setTimeout(() => {
            if (window.CartDrawerPremium?.open) {
                window.CartDrawerPremium.open();
            }
        }, 800);
    }

    function getPieceType(item) {
        const option = item.variant_options?.[0]
            || item.options_with_values?.[0]?.value
            || "";

        return /^(shirt|bottom)$/i.test(String(option).trim())
            ? String(option).trim().toLowerCase()
            : null;
    }

    function getPairs(cart) {
        return cart.items.reduce((pairs, item) => {
            const pieceType = getPieceType(item);
            if (!pieceType) return pairs;

            const pair = pairs.get(item.product_id) || {};
            pair[pieceType] = item;
            pairs.set(item.product_id, pair);
            return pairs;
        }, new Map());
    }

    async function getCart() {
        const response = await fetch("/cart.js", {
            headers: { Accept: "application/json" }
        });

        

        if (!response.ok) throw new Error(`Unable to read cart (${response.status})`);
        return response.json();
    }

    function changesForPairs(cart, priorCart) {
        // Do not alter an existing cart on the first page load. From then on, use the
        // changed piece as the source of truth and apply its quantity to its partner.
        if (!priorCart) return {};

        const updates = {};
        const currentPairs = getPairs(cart);
        const previousPairs = getPairs(priorCart);

        currentPairs.forEach((current, productId) => {
            const previous = previousPairs.get(productId);

            if (current.shirt && current.bottom) {
                if (current.shirt.quantity === current.bottom.quantity) return;

                const shirtChanged = previous?.shirt
                    && current.shirt.quantity !== previous.shirt.quantity;
                const bottomChanged = previous?.bottom
                    && current.bottom.quantity !== previous.bottom.quantity;

                // Normally only one line was changed. If both changed in one request,
                // favour the shirt quantity so the cart always reaches a stable state.
                if (shirtChanged || !bottomChanged) {
                    updates[current.bottom.key] = current.shirt.quantity;
                } else {
                    updates[current.shirt.key] = current.bottom.quantity;
                }
                return;
            }

            // Removing either half of an existing pair removes the remaining half too.
            if (previous?.shirt && previous?.bottom) {
                const remainingItem = current.shirt || current.bottom;
                if (remainingItem) updates[remainingItem.key] = 0;
            }
        });

        return updates;
    }

    async function syncCartPairs() {
        try {
            const cart = await getCart();
            const updates = changesForPairs(cart, previousCart);

            // Record this state before the request. The follow-up cart event caused by
            // this request will read the final cart and become the new baseline.
            previousCart = cart;

            if (!Object.keys(updates).length) return;

            const response = await fetch("/cart/update.js", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({ updates })
            });

            if (!response.ok) throw new Error(`Unable to sync co-ord pair (${response.status})`);

            previousCart = await response.json();
            document.dispatchEvent(new CustomEvent("cart:updated"));
            openCartDrawer();
        } catch (error) {
            console.error("Co-ord cart synchronisation failed:", error);
        }
    }

    function queueCartSync() {
        updateQueue = updateQueue.then(syncCartPairs, syncCartPairs);
        return updateQueue;
    }

    queueCartSync();
    document.addEventListener("cart:updated", queueCartSync);

    if (!window.__hamptonsCoordCartPatched) {
        window.__hamptonsCoordCartPatched = true;

        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";

            if (/\/cart\/(add|change|update)(?:\.js)?(?:\?|$)/.test(url)) {
                queueCartSync();
            }
            return response;
        };

        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", () => {
                const url = typeof args[1] === "string" ? args[1] : "";
                if (/\/cart\/(add|change|update)(?:\.js)?(?:\?|$)/.test(url)) {
                    queueCartSync();
                }
            });
            return originalOpen.apply(this, args);
        };
    }
})();
