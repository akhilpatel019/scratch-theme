document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector('[id^="simple-buy-box-"]');

  if (!section) return;

  const variantData = section.querySelector('[id^="SimpleProductVariants-"]');

  if (!variantData) return;

  const variants = JSON.parse(variantData.textContent);


    const colorButtons = section.querySelectorAll(".simple-color-option");
      const sizeButtons = section.querySelectorAll(".simple-size-option");

  const initialVariant = variants.find(
    (variant) =>
      variant.id ===
      Number(section.querySelector('[id^="SimpleSelectedVariant-"]').value),
  );

  let selectedColor = initialVariant?.option1 || null;
  let selectedSize = initialVariant?.option2 || null;

colorButtons.forEach((button) => {
  button.classList.toggle(
    "active",
    button.dataset.color === selectedColor
  );
});

sizeButtons.forEach((button) => {
  button.classList.toggle(
    "active",
    button.dataset.size === selectedSize
  );
});

updateSizeAvailability();


function updatePurchaseButtons(isAvailable) {
  const addButton = section.querySelector('[id^="SimpleAddButton-"]');
  const buyNowButton = section.querySelector('[id^="SimpleBuyNowButton-"]');

  [addButton, buyNowButton].forEach((button) => {
    if (button) {
      button.disabled = !isAvailable;
    }
  });
}

function updateSizeAvailability() {
  sizeButtons.forEach((button) => {
    const size = button.dataset.size;

    const available = variants.some((variant) => {
      return (
        variant.option1 === selectedColor &&
        variant.option2 === size &&
        variant.available
      );
    });

    button.disabled = !available;
  });
}

  function updateSelectedVariant() {
  if (!selectedColor || !selectedSize) {
  updatePurchaseButtons(false);
  return;
}

    const matchedVariant = variants.find((variant) => {
      return (
        variant.option1 === selectedColor && variant.option2 === selectedSize
      );
    });

  if (!matchedVariant) {
  console.log("No matching variant for this combination.");
  updatePurchaseButtons(false);
    return;
}

updatePurchaseButtons(matchedVariant.available);

    const priceElement = section.querySelector('[id^="SimpleProductPrice-"]');

    if (priceElement) {
      priceElement.textContent = (matchedVariant.price / 100).toLocaleString(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
        },
      );
    }

    const variantInput = section.querySelector(
      '[id^="SimpleSelectedVariant-"]',
    );

    if (variantInput) {
      variantInput.value = matchedVariant.id;
    }

    const url = new URL(window.location.href);
url.searchParams.set("variant", matchedVariant.id);

window.history.replaceState({}, "", url);

    console.log("Updated variant ID:", matchedVariant.id);
    console.log("Available:", matchedVariant.available);
  }



  colorButtons.forEach((button) => {
    button.addEventListener("click", function () {
      colorButtons.forEach((btn) => btn.classList.remove("active"));

      this.classList.add("active");
     selectedColor = this.dataset.color;
updateSizeAvailability();

const selectedSizeButton = section.querySelector(
  ".simple-size-option.active"
);

if (selectedSizeButton?.disabled) {
  selectedSizeButton.classList.remove("active");
  selectedSize = null;
}

const variantInput = section.querySelector(
  '[id^="SimpleSelectedVariant-"]'
);

if (!selectedSize && variantInput) {
  variantInput.value = "";
}

      console.log("Selected color:", this.dataset.color);
      updateSelectedVariant();
    });
  });



  sizeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      sizeButtons.forEach((btn) => btn.classList.remove("active"));

      this.classList.add("active");
      selectedSize = this.dataset.size;

      console.log("Selected size:", this.dataset.size);
      updateSelectedVariant();
    });
  });
});
