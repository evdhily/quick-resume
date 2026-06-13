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
  previewName.textContent = nameInput.value.trim() || "Votre nom";
  previewRole.textContent = roleInput.value.trim() || "Poste recherché";
  previewSummary.textContent =
    summaryInput.value.trim() ||
    "Ajoutez ici un résumé court, orienté résultats, adapté à l'offre visée.";

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
    checkoutButton.textContent = "Redirection...";

    try {
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "quick resume - Acces CV 24h",
          amount: 199,
          currency: "eur",
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible de creer la session de paiement.");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      checkoutButton.disabled = false;
      checkoutButton.textContent = "Débloquer 24h - 1,99 €";
      alert(
        "Le paiement sera activé dès que les clés Stripe seront configurées sur le serveur."
      );
    }
  });
}

updatePreview();
