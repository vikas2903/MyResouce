(function () {
    const QUALIFYING_PRODUCT_ID = "7746405564673";
    const GIFT_VARIANT_ID = 45501326721281;
    const GIFT_PROPERTY_KEY = "vs_test_charmacy";
    const GIFT_PROPERTY_VALUE = "vs_test_charmacy";
    const MIN_CART_QTY = 2;

    let isProcessingGiftAdd = false;

    function hasQualifyingProduct(items) {
        return items.some((item) => String(item.product_id) === QUALIFYING_PRODUCT_ID);
    }

    function hasGiftProduct(items) {
        return items.some(
            (item) =>
                Number(item.variant_id) === GIFT_VARIANT_ID &&
                item.properties?.[GIFT_PROPERTY_KEY] === GIFT_PROPERTY_VALUE
        );
    }

    async function fetchCart() {
        const response = await fetch("/cart.js", {
            headers: { Accept: "application/json" }
        });

        return response.json();
    }

    async function addGiftProduct() {
        const response = await fetch("/cart/add.js", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                items: [
                    {
                        id: GIFT_VARIANT_ID,
                        quantity: 1,
                        properties: {
                            [GIFT_PROPERTY_KEY]: GIFT_PROPERTY_VALUE
                        }
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error("Failed to add gift product.");
        }

        document.dispatchEvent(new CustomEvent("cart:build"));
    }

    async function removeGiftProduct() {
        const response = await fetch("/cart/update.js", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                updates: {
                    [GIFT_VARIANT_ID]: 0
                }
            })
        });

        if (!response.ok) {
            throw new Error("Failed to remove gift product.");
        }

        document.dispatchEvent(new CustomEvent("cart:build"));
    }

    async function evaluateCart(cart) {
        if (isProcessingGiftAdd) {
            return;
        }

        try {
            const resolvedCart = cart || await fetchCart();
            const items = Array.isArray(resolvedCart?.items) ? resolvedCart.items : [];
            const cartTotalQty = resolvedCart?.item_count || 0;

            if (
                hasQualifyingProduct(items) &&
                cartTotalQty >= MIN_CART_QTY &&
                !hasGiftProduct(items)
            ) {
                isProcessingGiftAdd = true;
                await addGiftProduct();
                return;
            }

            if (
                (!hasQualifyingProduct(items) || cartTotalQty < MIN_CART_QTY) &&
                hasGiftProduct(items)
            ) {
                isProcessingGiftAdd = true;
                await removeGiftProduct();
            }
        } catch (err) {
            console.error("Cart update failed:", err);
        } finally {
            isProcessingGiftAdd = false;
        }
    }

    document.addEventListener("page:loaded", function () {
        evaluateCart();
    });

    document.addEventListener("cart:updated", function (evt) {
        evaluateCart(evt.detail?.cart);
    });

    document.addEventListener("ajaxProduct:added", function () {
        evaluateCart();
    });

    document.addEventListener("ajaxProduct:error", function (evt) {
        console.error("Ajax product error:", evt.detail?.errorMessage);
    });
})();
