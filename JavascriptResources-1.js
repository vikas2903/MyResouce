
(function () {

  class StickyAddToCart extends HTMLElement {

    constructor() {
      super();

      this.productData = {{ product | json }};
      this.selectedOptions = {};
      this.currentVariant = null;
    }

    connectedCallback() {

      this.overlay = document.querySelector('[data-overlay]');
      this.sheet = document.querySelector('[data-sheet]');
      this.errorElement = this.sheet.querySelector('[data-error]');
      this.variantInput = document.querySelector('#variant-id');

      this.setupEventListeners();
      this.setDefaultVariant();
      this.handleScroll();

      window.addEventListener('scroll', () => this.handleScroll());

      document.addEventListener('variant:change', (event) => {

        if (!event.detail.variant) return;

        const variant = event.detail.variant;

        this.currentVariant = variant;

        this.productData.options.forEach((optionName, index) => {

          this.selectedOptions[optionName] = variant.options[index];

        });

        this.updateSelectedUI();
        this.updateAvailability();
        this.updateVariantId(variant.id);

      });

    }

    setupEventListeners() {

      this.querySelectorAll('[data-action]').forEach(button => {

        button.addEventListener('click', (e) => {

          this.currentAction = e.currentTarget.dataset.action;

          this.openSheet();

        });

      });

      this.overlay.addEventListener('click', () => {

        this.closeSheet();

      });

      this.sheet.querySelector('[data-close]').addEventListener('click', () => {

        this.closeSheet();

      });

      this.sheet.querySelectorAll('.ai-sticky-atc-variant-option').forEach(button => {

        button.addEventListener('click', (e) => {

          this.handleVariantClick(e);

        });

      });

      this.sheet.querySelectorAll('[data-sheet-action]').forEach(button => {

        button.addEventListener('click', (e) => {

          const action = e.currentTarget.dataset.sheetAction;

          this.handleAction(action);

        });

      });

    }

    setDefaultVariant() {

      const variant = this.productData.selected_or_first_available_variant;

      if (!variant) return;

      this.currentVariant = variant;

      this.productData.options.forEach((optionName, index) => {

        this.selectedOptions[optionName] = variant.options[index];

      });

      this.updateSelectedUI();
      this.updateAvailability();
      this.updateVariantId(variant.id);

    }

    handleVariantClick(e) {

      const button = e.currentTarget;

      if (button.classList.contains('disabled')) return;

      const position = Number(button.dataset.optionPosition);

      const optionName = this.productData.options[position - 1];

      const value = button.dataset.optionValue;

      this.selectedOptions[optionName] = value;

      const group = button.closest('.ai-sticky-atc-variant-options');

      group.querySelectorAll('.ai-sticky-atc-variant-option').forEach(btn => {

        btn.classList.remove('selected');

      });

      button.classList.add('selected');

      const selectedVariant = this.getSelectedVariant();

      if (selectedVariant) {

        this.currentVariant = selectedVariant;

        this.updateVariantId(selectedVariant.id);

      }

      this.updateAvailability();

      this.clearError();

    }

    updateSelectedUI() {

      this.sheet.querySelectorAll('.ai-sticky-atc-variant-option').forEach(option => {

        const position = Number(option.dataset.optionPosition);

        const optionName = this.productData.options[position - 1];

        const optionValue = option.dataset.optionValue;

        if (this.selectedOptions[optionName] === optionValue) {

          option.classList.add('selected');

        } else {

          option.classList.remove('selected');

        }

      });

    }

    updateAvailability() {

      this.sheet.querySelectorAll('.ai-sticky-atc-variant-option').forEach(option => {

        const position = Number(option.dataset.optionPosition);

        const optionName = this.productData.options[position - 1];

        const optionValue = option.dataset.optionValue;

        const testOptions = {
          ...this.selectedOptions,
          [optionName]: optionValue
        };

        const variant = this.findVariant(testOptions);

        if (!variant || !variant.available) {

          option.classList.add('disabled');

        } else {

          option.classList.remove('disabled');

        }

      });

    }

    findVariant(options) {

      return this.productData.variants.find(variant => {

        return this.productData.options.every((option, index) => {

          return !options[option] || variant.options[index] === options[option];

        });

      });

    }

    getSelectedVariant() {

      return this.productData.variants.find(variant => {

        return this.productData.options.every((option, index) => {

          return variant.options[index] === this.selectedOptions[option];

        });

      });

    }

    updateVariantId(variantId) {

      if (this.variantInput) {

        this.variantInput.value = variantId;

      }

      document.querySelectorAll('input[name="id"]').forEach(input => {

        input.value = variantId;

      });

    }

    async handleAction(action) {

      const variant = this.getSelectedVariant();

      if (!variant) {

        this.showError('Please select all variant options');

        return;

      }

      if (!variant.available) {

        this.showError('Selected variant is out of stock');

        return;

      }

      this.updateVariantId(variant.id);

      if (action === 'add-to-cart') {

        await this.addToCart(variant.id);

      }

      if (action === 'buy-now') {

        this.buyNow(variant.id);

      }

    }

    async addToCart(variantId) {

      try {

        const response = await fetch('/cart/add.js', {

          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            id: variantId,
            quantity: 1
          })

        });

        if (!response.ok) {

          throw new Error('Cart Error');

        }

        this.closeSheet();

        document.dispatchEvent(new CustomEvent('cart:refresh', {
          bubbles: true
        }));

        setTimeout(() => {

          if (window.CartDrawerPremium?.open) {

            window.CartDrawerPremium.open();

          }

        }, 500);

      } catch (error) {

        this.showError('Failed to add product');

      }

    }

    buyNow(variantId) {

      window?.Shopify?.country == 'IN'
  ? window.location.href = `/cart/${variantId}:1`
  : window.location.href = '/checkout';

    }


    openSheet() {

      this.overlay.classList.add('active');

      this.sheet.classList.add('active');

      document.body.style.overflow = 'hidden';

    }

    closeSheet() {

      this.overlay.classList.remove('active');

      this.sheet.classList.remove('active');

      document.body.style.overflow = '';

      this.clearError();

    }

    showError(message) {

      this.errorElement.textContent = message;

      this.errorElement.style.display = 'block';

    }

    clearError() {

      this.errorElement.textContent = '';

      this.errorElement.style.display = 'none';

    }

    handleScroll() {

      if (window.scrollY > 300) {

        this.classList.remove('hidden');

      } else {

        this.classList.add('hidden');

      }

    }

  }

  if (!customElements.get('sticky-add-to-cart')) {

    customElements.define('sticky-add-to-cart', StickyAddToCart);

  }

})();
