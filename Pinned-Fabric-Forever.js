/*
 * SHOPIFY + USF PINNED PRODUCTS
 *
 * Runs after full page load AND after USF products render.
 *
 * Example:
 * /collections/all?pinned=product-one,product-two
 */

(function () {

  "use strict";

  // ==========================================
  // PREVENT DUPLICATE INITIALIZATION
  // ==========================================

  if (window.__usfPinnedAfterRender) return;

  const currentUrl = new URL(window.location.href);

  const pinnedParam = currentUrl.searchParams.get("pinned");

  if (!pinnedParam) return;


  // ==========================================
  // SETTINGS
  // ==========================================

  const GRID_SELECTOR = ".usf-results";

  const CARD_SELECTOR = ":scope > .grid__item.grid-product";

  const SHOP_ROOT = (
    window.Shopify?.routes?.root || "/"
  ).replace(/\/?$/, "/");

  const CURRENCY =
    window.Shopify?.currency?.active || "INR";

  // Wait briefly after USF last updates the grid
  const SETTLE_MS = 350;


  // ==========================================
  // PRODUCT HANDLE
  // ==========================================

  function getProductHandle(value) {

    let handle = String(value || "").trim();

    if (handle.includes("/products/")) {

      handle = handle
        .split("/products/")
        .pop();

    }

    handle = handle
      .split(/[?#]/)[0]
      .replace(/^\/+|\/+$/g, "")
      .toLowerCase();

    return /^[a-z0-9][a-z0-9-]*$/.test(handle)
      ? handle
      : "";

  }


  // ==========================================
  // GET PINNED PRODUCTS
  // ==========================================

  const pinnedHandles = [

    ...new Set(

      pinnedParam
        .split(",")
        .map(getProductHandle)
        .filter(Boolean)

    )

  ];

  if (!pinnedHandles.length) return;

  window.__usfPinnedAfterRender = true;

  const pinnedSet = new Set(pinnedHandles);

  const fallbackCards = new Map();

  const requestedHandles = new Set();

  let syncTimer = null;


  // ==========================================
  // GET HANDLE FROM PRODUCT CARD
  // ==========================================

  function getHandleFromCard(card) {

    const dataHandle =
      card.getAttribute("data-product-handle");

    if (dataHandle) {

      return getProductHandle(dataHandle);

    }

    const link = card.querySelector(
      'a[href*="/products/"]'
    );

    return link
      ? getProductHandle(link.getAttribute("href"))
      : "";

  }


  // ==========================================
  // SHOPIFY MONEY FORMAT
  // ==========================================

  function money(cents) {

    return new Intl.NumberFormat("en-IN", {

      style: "currency",

      currency: CURRENCY

    }).format(Number(cents || 0) / 100);

  }


  // ==========================================
  // CREATE FALLBACK PRODUCT CARD
  // ==========================================

  function createFallbackCard(product, handle) {

    const variant =

      product.variants?.find(v => v.available)

      ||

      product.variants?.[0];


    const price = Number(
      variant?.price ?? product.price ?? 0
    );

    const comparePrice = Number(
      variant?.compare_at_price ?? 0
    );

    const onSale = comparePrice > price;

    const image =

      product.featured_image

      ||

      product.images?.[0]

      ||

      "";


    const card = document.createElement("div");

    card.className =
      "grid__item grid-product small--one-half medium-up--one-quarter";

    card.dataset.productHandle = handle;

    if (product.id) {

      card.dataset.productId = String(product.id);

    }

    card.dataset.pinnedFallback = "true";


    card.innerHTML = `

      <div class="grid-product__content usf-sr-product__image-container">

        ${
          onSale
            ? '<div class="grid-product__tag grid-product__tag--sale">Sale</div>'
            : ""
        }

        <a class="grid-product__link">

          <div class="grid-product__image-mask">

            <div class="grid__image-ratio grid__image-ratio--portrait">

              <img
                loading="lazy"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  display:block;
                "
              >

            </div>

          </div>

          <div class="grid-product__meta">

            <div class="grid-product__title grid-product__title--body"></div>

            <div class="tempprice">

              ${
                onSale
                  ? `
                    <span class="grid-product__price product__price--compare">
                      <span class="money" data-pin-compare></span>
                    </span>
                  `
                  : ""
              }

              <span class="grid-product__price${onSale ? " on-sale" : ""}">
                <span class="money" data-pin-price></span>
              </span>

            </div>

          </div>

        </a>

      </div>

    `;


    // Product URL

    card.querySelector("a").href =

      `${SHOP_ROOT}products/${encodeURIComponent(handle)}`;


    // Product image

    const img = card.querySelector("img");

    if (image) {

      img.src = image;

    }

    img.alt = product.title || "";


    // Product title

    card.querySelector(
      ".grid-product__title"
    ).textContent = product.title || "";


    // Product price

    card.querySelector(
      "[data-pin-price]"
    ).textContent = money(price);


    // Compare price

    if (onSale) {

      card.querySelector(
        "[data-pin-compare]"
      ).textContent = money(comparePrice);

    }


    return card;

  }


  // ==========================================
  // FETCH MISSING PINNED PRODUCTS
  // ==========================================

  async function fetchMissingProduct(handle) {

    if (requestedHandles.has(handle)) return;

    requestedHandles.add(handle);


    try {

      const response = await fetch(

        `${SHOP_ROOT}products/${encodeURIComponent(handle)}.js`,

        {

          credentials: "same-origin"

        }

      );


      if (!response.ok) {

        throw new Error(`HTTP ${response.status}`);

      }


      const product = await response.json();


      fallbackCards.set(

        handle,

        createFallbackCard(product, handle)

      );


      scheduleSync();


    } catch (error) {

      console.warn(

        "Pinned Products: Unable to fetch",

        handle,

        error

      );

    }

  }


  // ==========================================
  // MAIN PINNED PRODUCTS FUNCTION
  // ==========================================

  function syncPinnedProducts() {

    const productGrid = document.querySelector(
      GRID_SELECTOR
    );


    // Wait until collection grid exists

    if (!productGrid) return;


    // Get products actually rendered by USF

    const allCards = [

      ...productGrid.querySelectorAll(
        CARD_SELECTOR
      )

    ];


    const realCards = allCards.filter(card => {

      return (

        !card.hasAttribute("data-pinned-fallback")

        &&

        Boolean(getHandleFromCard(card))

      );

    });


    // ========================================
    // IMPORTANT:
    // WAIT UNTIL USF PRODUCTS ARE RENDERED
    // ========================================

    if (!realCards.length) {

      return;

    }


    // ========================================
    // FIND PINNED PRODUCTS IN CURRENT GRID
    // ========================================

    const existingCards = new Map();


    realCards.forEach(card => {

      const handle = getHandleFromCard(card);

      if (!pinnedSet.has(handle)) return;

      if (!existingCards.has(handle)) {

        existingCards.set(handle, card);

      }

    });


    // ========================================
    // FETCH MISSING PRODUCTS
    // ========================================

    pinnedHandles.forEach(handle => {

      if (

        !existingCards.has(handle)

        &&

        !fallbackCards.has(handle)

      ) {

        fetchMissingProduct(handle);

      }

    });


    // ========================================
    // ARRANGE PINNED PRODUCTS
    // ========================================

    const orderedCards = [];


    pinnedHandles.forEach(handle => {

      const existingCard = existingCards.get(handle);

      const fallbackCard = fallbackCards.get(handle);


      // Prefer original USF product card

      if (

        existingCard

        &&

        fallbackCard?.isConnected

      ) {

        fallbackCard.remove();

      }


      const card = existingCard || fallbackCard;


      if (!card) return;


      card.dataset.pinnedProduct = "true";


      orderedCards.push(card);

    });


    if (!orderedCards.length) return;


    // ========================================
    // CHECK IF ALREADY PINNED
    // ========================================

    const alreadySorted = orderedCards.every(

      (card, index) =>

        productGrid.children[index] === card

    );


    if (alreadySorted) return;


    // ========================================
    // MOVE PINNED PRODUCTS TO TOP
    // ========================================

    const fragment =
      document.createDocumentFragment();


    orderedCards.forEach(card => {

      fragment.appendChild(card);

    });


    productGrid.prepend(fragment);


    console.log(

      "Pinned Products: Products moved to top"

    );

  }


  // ==========================================
  // SCHEDULE PINNING AFTER USF UPDATES
  // ==========================================

  function scheduleSync() {

    clearTimeout(syncTimer);


    syncTimer = setTimeout(() => {

      syncPinnedProducts();

    }, SETTLE_MS);

  }


  // ==========================================
  // DETECT CHANGES TO PRODUCT GRID
  // ==========================================

  function affectsGrid(mutation) {

    const target = mutation.target;


    if (

      target.nodeType === 1

      &&

      (

        target.matches?.(GRID_SELECTOR)

        ||

        target.closest?.(GRID_SELECTOR)

      )

    ) {

      return true;

    }


    return [

      ...mutation.addedNodes,

      ...mutation.removedNodes

    ].some(node => {

      return (

        node.nodeType === 1

        &&

        (

          node.matches?.(GRID_SELECTOR)

          ||

          node.querySelector?.(GRID_SELECTOR)

        )

      );

    });

  }


  // ==========================================
  // START AFTER FULL PAGE LOAD
  // ==========================================

  function initializePinnedProducts() {

    console.log(

      "Pinned Products: Page loaded. Waiting for USF products..."

    );


    // Watch for products inserted by USF

    const observer = new MutationObserver(

      mutations => {

        if (

          mutations.some(affectsGrid)

        ) {

          scheduleSync();

        }

      }

    );


    observer.observe(

      document.body,

      {

        childList: true,

        subtree: true

      }

    );


    // Check if products have already rendered

    scheduleSync();

  }


  // ==========================================
  // EXECUTION
  // ==========================================

  if (document.readyState === "complete") {

    initializePinnedProducts();

  } else {

    window.addEventListener(

      "load",

      initializePinnedProducts,

      {

        once: true

      }

    );

  }

})();