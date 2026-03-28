(function () {
  const API_URL = "http://localhost:3000/api/registro";

  const openBtn = document.getElementById("openSignupBtn");
  const modal = document.getElementById("signupModal");
  const closeBtn = document.getElementById("closeSignupBtn");
  const clearBtn = document.getElementById("clearFormBtn");
  const form = document.getElementById("signupForm");
  const statusMsg = document.getElementById("statusMsg");
  const helperBox = document.getElementById("helperBox");

  function openModal() {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("show")) {
      closeModal();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      form.reset();
      statusMsg.textContent = "";
      if (helperBox) helperBox.classList.remove("show");
    });
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const apellidos = document.getElementById("apellidos").value.trim();
      const pesoMeta = document.getElementById("pesoMeta").value.trim();
      const celular = document.getElementById("celular").value.trim();

      statusMsg.textContent = "Guardando inscripción...";

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre,
            apellidos,
            pesoMeta,
            celular
          })
        });

        const result = await response.json();

        if (!response.ok) {
          statusMsg.textContent = result.message || "No se pudo guardar la inscripción.";
          return;
        }

        statusMsg.textContent = "✅ Registro exitoso. Ya quedaste inscrito/a al reto.";
        if (helperBox) helperBox.classList.remove("show");
        form.reset();
      } catch (error) {
        console.error(error);
        statusMsg.textContent = "Error de conexión con el servidor.";
      }
    });
  }
})();