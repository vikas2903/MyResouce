
(async function () {


    async function onCartUpdate() {
        try {
            const res = await fetch("/cart.js", {
                headers: { Accept: "application/json" }
            });

            const cart = await res.json();
            console.log("vs_cart", cart);

            for (const item of cart.items) {
                fetch(`/products/${item.handle}.js`)
                    .then(response => response.json())
                    .then(productData => {
                        console.log("Product Data:", productData);

                        let cross_sellingproduct_handle_collectoion = '';

                                        let check_tag_exist = productData.tags.includes("Lucky1299")
                                            || productData.tags.includes("Lucky1999");

                                        if (productData.tags.includes("Lucky1299")) {

                                            window.collectionsData = {
                                                "buy-2-at-1299": [
                                                    {% for product in collections['buy-2-at-1299'].products limit: 8 %}
                                            {
                                                id: { { product.id } },
                                                handle: "{{ product.handle }}",
                                                    title: "{{ product.title }}"
                                            } {% unless forloop.last %}, {% endunless %}
                                            {% endfor %}
                        					]
                                        };


                                    } else if (productData.tags.includes("Lucky1999")) {

                                        window.collectionsData = {
                                            "buy-2-at-1999": [
                                                {% for product in collections['buy-2-at-1299'].products limit: 8 %}
                                        {
                                            id: { { product.id } },
                                            handle: "{{ product.handle }}",
                                                title: "{{ product.title }}"
                                        } {% unless forloop.last %}, {% endunless %}
                                        {% endfor %}
                        					]
                                    };

                            }
                                         else {

                                window.collectionsData = {
                                    "new-launch": [
                                        {% for product in collections['new-launch'].products limit: 8 %}
                                {
                                    id: { { product.id } },
                                    handle: "{{ product.handle }}",
                                        title: "{{ product.title }}"
                                } {% unless forloop.last %}, {% endunless %}
                                {% endfor %}
                        					]
                            };

                        }


                        // console.log("10 Cross-selling-products", Object.entries(window.collectionsData).slice(0, 10));


                        let collectionWireFram = document.querySelector(".upsell-products-container");
                        let products = Object.entries(window.collectionWireFram);

                        collectionWireFram.innerHTML = products.map(([collectionHandle, collectionData]) => `
                            
                            <div class="upsell-card">
                                <div class="cart-usell-left">
                                        <a href="/products/${collectionHandle}">
                                            <img src="${collectionData.image}" alt="${collectionData.title}" loading="lazy">
                                        </a>
                                </div>

                            <div class="cart-usell-right">
                                <a href="/products/${collectionHandle}" class="upsell-product">
                                    <div class="upsell-title">${collectionData.title}</div>

                                    <div class="upsell-price">${collectionData.price}</div>

                                    <button
                                    class="upsell-add-button"
                                    data-handle="${collectionHandle}"
                                    type="button">
                                    View
                                    </button>
                                </a>
                                </div>

                            </div>
                            
                    `).join('');

            

                    })
                    .catch(error => {
                        console.error("Error fetching product data:", error);
                    });
            }



        } catch (err) {
            console.error("Cart update failed:", err);
        }
    }

    const triggerCartUpdate = () => onCartUpdate();

    onCartUpdate();

    document.addEventListener("cart:updated", triggerCartUpdate);

    if (!window.__shippingBarPatched) {
        window.__shippingBarPatched = true;

        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            try {
                const url = typeof args[0] === "string"
                    ? args[0]
                    : args[0]?.url || "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    triggerCartUpdate();
                }
            } catch (e) { }

            return response;
        };

        const originalOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", () => {
                const url = typeof args[1] === "string" ? args[1] : "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    triggerCartUpdate();
                }
            });

            return originalOpen.apply(this, args);
        };
    }
})();
