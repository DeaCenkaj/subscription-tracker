/* ==========================================================
   app.js - page code. Uses SubscriptionLib from js-library.js
   Works on both pages: it only runs the parts whose HTML exists.
   ========================================================== */
(function () {
  "use strict";
  var Lib = window.SubscriptionLib;

  var form = document.getElementById("subscription-form");   // index.html
  var tbody = document.getElementById("subscription-rows");  // subscriptions.html
  var emptyEl = document.getElementById("empty-state");
  var errorEl = document.getElementById("form-error");
  var subscriptions = Lib.load();

  function refresh() {
    if (tbody) Lib.renderTable(tbody, emptyEl, subscriptions);
    Lib.renderSummary(subscriptions);
  }

  /* ----- Home page: add form ----- */
  if (form) {
    var clearErrors = function () {
      errorEl.hidden = true;
      form.querySelectorAll(".st-input").forEach(function (el) {
        el.classList.remove("st-input-invalid");
      });
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors();

      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });

      var missing = Lib.validate(data);
      if (missing.length) {
        missing.forEach(function (name) {
          form.elements[name].classList.add("st-input-invalid");
        });
        errorEl.textContent = "Fill in every field: " + missing.join(", ") + ".";
        errorEl.hidden = false;
        form.elements[missing[0]].focus();
        return;
      }

      subscriptions = Lib.add(subscriptions, data);
      Lib.save(subscriptions);
      form.reset();
      refresh();
    });
  }

  /* ----- Table page: delete button ----- */
  if (tbody) {
    tbody.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-id]");
      if (!btn) return;
      subscriptions = Lib.remove(subscriptions, btn.getAttribute("data-id"));
      Lib.save(subscriptions);
      refresh();
    });
  }

  refresh();
})();
