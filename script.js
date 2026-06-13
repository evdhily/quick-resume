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

if (checkoutButton) {
  checkoutButton.addEventListener("click", async () => {
    checkoutButton.disabled = true;
    checkoutButton.textContent = "Redirecting...";

    try {
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "quick resume - 24h resume access",
          amount: 199,
          currency: "eur",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create the checkout session.");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      checkoutButton.disabled = false;
      checkoutButton.textContent = "Unlock 24h - 1,99 €";
      alert(
        "Payments will be activated as soon as the Stripe keys are configured on the server."
      );
    }
  });
}

updatePreview();
