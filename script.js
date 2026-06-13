const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const nameInput = document.querySelector("#nameInput");
const roleInput = document.querySelector("#roleInput");
const summaryInput = document.querySelector("#summaryInput");
const accentInput = document.querySelector("#accentInput");
const layoutInput = document.querySelector("#layoutInput");
const previewName = document.querySelector("#previewName");
const previewRole = document.querySelector("#previewRole");
const previewSummary = document.querySelector("#previewSummary");
const resumePreview = document.querySelector(".resume-preview");
const templateCards = document.querySelectorAll(".template-card");
const checkoutButton = document.querySelector("#checkoutButton");
const checkoutModal = document.querySelector("#checkoutModal");
const closeCheckoutButtons = document.querySelectorAll("[data-close-checkout]");
const planCards = document.querySelectorAll(".plan-card");

function updatePreview() {
  previewName.textContent = nameInput.value.trim() || "Your name";
  previewRole.textContent = roleInput.value.trim() || "Target role";
  previewSummary.textContent =
    summaryInput.value.trim() ||
    "Add a short, results-focused summary tailored to the role you want.";

  document.documentElement.style.setProperty("--accent", accentInput.value);
  resumePreview.classList.remove("classic", "compact", "editorial");
  resumePreview.classList.add(layoutInput.value);

  templateCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.template === layoutInput.value);
  });
}

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.addEventListener("click", () => {
  mainNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
});

[nameInput, roleInput, summaryInput, accentInput, layoutInput].forEach((control) => {
  control.addEventListener("input", updatePreview);
});

templateCards.forEach((card) => {
  card.addEventListener("click", () => {
    layoutInput.value = card.dataset.template;
    updatePreview();
    document.querySelector("#builder").scrollIntoView({ behavior: "smooth" });
  });
});

function openCheckoutModal() {
  checkoutModal.hidden = false;
  document.body.classList.add("modal-open");
  checkoutModal.querySelector(".plan-card")?.focus();
}

function closeCheckoutModal() {
  checkoutModal.hidden = true;
  document.body.classList.remove("modal-open");
  checkoutButton?.focus();
}

async function startCheckout(plan) {
  const selectedCard = document.querySelector(`[data-plan="${plan}"]`);

  planCards.forEach((card) => {
    card.disabled = true;
  });

  if (selectedCard) {
    selectedCard.dataset.loading = "true";
  }

  try {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
      throw new Error("Unable to create the checkout session.");
    }

    const data = await response.json();
    window.location.href = data.url;
  } catch (error) {
    planCards.forEach((card) => {
      card.disabled = false;
      delete card.dataset.loading;
    });

    alert("Payments will be activated as soon as the Stripe keys are configured on the server.");
  }
}

if (checkoutButton && checkoutModal) {
  checkoutButton.addEventListener("click", openCheckoutModal);

  closeCheckoutButtons.forEach((button) => {
    button.addEventListener("click", closeCheckoutModal);
  });

  planCards.forEach((card) => {
    card.addEventListener("click", () => {
      startCheckout(card.dataset.plan);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !checkoutModal.hidden) {
      closeCheckoutModal();
    }
  });
}

updatePreview();
