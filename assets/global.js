 // Ajax Add to Cart
  document.querySelectorAll('.simple-product-form').forEach(function(form) {
    if (form.dataset.ajaxInitialized === 'true') return;

    form.dataset.ajaxInitialized = 'true';

    form.addEventListener('submit', async function(event) {
      // Let Buy Now submit normally and continue to checkout
      if (event.submitter?.classList.contains('simple-buy-now-button')) {
        return;
      }

      event.preventDefault();

      const addButton = form.querySelector('.simple-add-button');

      if (addButton) addButton.disabled = true;

      try {
        const formData = new FormData(form);

        const response = await fetch(
          `${window.Shopify.routes.root}cart/add.js`,
          {
            method: 'POST',
            body: formData,
            headers: {
              Accept: 'application/json'
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.description || data.message || 'Could not add product.'
          );
        }

          const cartResponse = await fetch(
        `${window.Shopify.routes.root}cart.js`
      );

   

      const cart = await cartResponse.json();

      document.querySelectorAll(".ccd-count").forEach(function (element) {
        element.textContent = cart.item_count;
      });

        // Request updated cart drawer HTML from Shopify
        const sectionResponse = await fetch(
          `${window.Shopify.routes.root}?sections=custom-cart-drawer-section`
        );

        if (!sectionResponse.ok) {
          throw new Error('Could not refresh the cart drawer.');
        }

        const sections = await sectionResponse.json();
        const updatedHTML = sections['custom-cart-drawer-section'];

        if (!updatedHTML) {
          throw new Error('The cart drawer section returned no HTML.');
        }

        const parser = new DOMParser();
        const newDocument = parser.parseFromString(updatedHTML, 'text/html');

        const currentDrawer = document.querySelector('[data-ccd-drawer]');
        const newDrawer = newDocument.querySelector('[data-ccd-drawer]');

        if (!currentDrawer || !newDrawer) {
          throw new Error('Could not find the cart drawer.');
        }

        // Replace the old drawer content with fresh Liquid-rendered HTML
        currentDrawer.innerHTML = newDrawer.innerHTML;

        // Open the updated drawer
        currentDrawer.classList.add('active');

        const overlay = document.querySelector('[data-ccd-overlay]');

        if (overlay) {
          overlay.classList.add('active');
        }

      } catch (error) {
        console.error('Cart error:', error);
      } finally {
        if (addButton) addButton.disabled = false;
      }
    });
  });

  
  // Ajax Remove from Cart
  document.addEventListener('click', async function(event) {
    const removeButton = event.target.closest('[data-cart-remove]');

    if (!removeButton) return;
    if (removeButton.classList.contains('loading')) return;

    event.preventDefault();

    const line = Number(removeButton.dataset.line);

    if (!line) return;

    removeButton.classList.add('loading');

    try {
      const response = await fetch(
        `${window.Shopify.routes.root}cart/change.js`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            line: line,
            quantity: 0
          })
        }
      );

      const cart = await response.json();

      if (!response.ok) {
        throw new Error(
          cart.description || 'Could not remove the item.'
        );
      }

      // Update cart count immediately
      document.querySelectorAll('.ccd-count').forEach(function(element) {
        element.textContent = cart.item_count;
      });

      // Refresh cart drawer HTML
      const sectionResponse = await fetch(
        `${window.Shopify.routes.root}?sections=custom-cart-drawer-section`
      );

      const sections = await sectionResponse.json();
      const updatedHTML = sections['custom-cart-drawer-section'];

      if (!updatedHTML) {
        throw new Error('Could not refresh the cart drawer.');
      }

      const parser = new DOMParser();
      const newDocument = parser.parseFromString(updatedHTML, 'text/html');

      const currentDrawer = document.querySelector('[data-ccd-drawer]');
      const newDrawer = newDocument.querySelector('[data-ccd-drawer]');

      if (!currentDrawer || !newDrawer) {
        throw new Error('Could not find the updated cart drawer.');
      }

      currentDrawer.innerHTML = newDrawer.innerHTML;

      // Keep the drawer open
      currentDrawer.classList.add('active');

      const overlay = document.querySelector('[data-ccd-overlay]');

      if (overlay) {
        overlay.classList.add('active');
      }

    } catch (error) {
      console.error('Remove cart item error:', error);
      removeButton.classList.remove('loading');
    }
  });


  // Event delegation: works even after drawer content is replaced
  document.addEventListener('click', function(event) {
    // Close button
    const closeButton = event.target.closest('[data-cart-drawer-close]');

    if (closeButton) {
      event.preventDefault();
      closeCartDrawer();
      return;
    }

    // Overlay click
    const overlay = event.target.closest('[data-ccd-overlay]');

    if (overlay) {
      closeCartDrawer();
    }
  });

  function closeCartDrawer() {
    const drawer = document.querySelector('[data-ccd-drawer]');
    const overlay = document.querySelector('[data-ccd-overlay]');

    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  }