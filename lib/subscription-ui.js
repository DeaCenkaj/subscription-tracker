/* ==========================================================
   subscription-ui.js  -  Subscription Tracker JS Library  v1.0.0
   A reusable library exposed as one global: SubscriptionLib

   API
   - SubscriptionLib.load()                    -> array of subscriptions
   - SubscriptionLib.save(list)                -> stores the list
   - SubscriptionLib.validate(data)            -> array of missing field names
   - SubscriptionLib.add(list, data)           -> new list with the item added
   - SubscriptionLib.remove(list, id)          -> new list without that id
   - SubscriptionLib.getStatus(isoDate)        -> "Active" or "Expired"
   - SubscriptionLib.summarize(list)           -> { total, expired, active }
   - SubscriptionLib.renderTable(tbody, emptyEl, list)
   - SubscriptionLib.renderSummary(list)

   The library has no page logic. Pages call it from app.js.
   ========================================================== */
(function (global) {
  "use strict";

  var STORAGE_KEY = "subscription-tracker:v1";
  var REQUIRED = ["service", "provider", "subscriber", "renewal", "category"];

  /* ---------- Data helpers ---------- */

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) { /* storage unavailable: keep working in memory */ }
  }

  function startOfToday() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // "Expired" when the renewal date is before today, otherwise "Active".
  function getStatus(renewalDate) {
    var parts = String(renewalDate).split("-");
    var date = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return date < startOfToday() ? "Expired" : "Active";
  }

  // Returns a list of missing field names (empty list = valid).
  function validate(data) {
    return REQUIRED.filter(function (key) {
      return !data[key] || !String(data[key]).trim();
    });
  }

  function add(list, data) {
    var item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      service: data.service.trim(),
      provider: data.provider.trim(),
      subscriber: data.subscriber.trim(),
      renewal: data.renewal,
      category: data.category
    };
    return list.concat(item);
  }

  function remove(list, id) {
    return list.filter(function (item) { return item.id !== id; });
  }

  function summarize(list) {
    var expired = list.filter(function (i) { return getStatus(i.renewal) === "Expired"; }).length;
    return { total: list.length, expired: expired, active: list.length - expired };
  }

  /* ---------- DOM helpers ---------- */

  function formatDate(iso) {
    var p = iso.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  function cell(text) {
    var td = document.createElement("td");
    td.textContent = text; // textContent avoids HTML injection
    return td;
  }

  function buildRow(item) {
    var tr = document.createElement("tr");
    tr.appendChild(cell(item.service));
    tr.appendChild(cell(item.provider));
    tr.appendChild(cell(item.subscriber));
    tr.appendChild(cell(formatDate(item.renewal)));
    tr.appendChild(cell(item.category));

    var status = getStatus(item.renewal);
    var statusTd = document.createElement("td");
    var badge = document.createElement("span");
    badge.className = "st-badge " + (status === "Expired" ? "st-badge-expired" : "st-badge-active");
    badge.textContent = status;
    statusTd.appendChild(badge);
    tr.appendChild(statusTd);

    var actionTd = document.createElement("td");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "st-btn st-btn-danger";
    btn.textContent = "Delete";
    btn.setAttribute("data-id", item.id);
    btn.setAttribute("aria-label", "Delete " + item.service);
    actionTd.appendChild(btn);
    tr.appendChild(actionTd);

    return tr;
  }

  function renderTable(tbody, emptyEl, list) {
    tbody.innerHTML = "";
    list.forEach(function (item) { tbody.appendChild(buildRow(item)); });
    emptyEl.hidden = list.length > 0;
  }

  function renderSummary(list) {
    var s = summarize(list);
    var total = document.getElementById("total-count");
    var expired = document.getElementById("expired-count");
    if (total) total.textContent = s.total;
    if (expired) expired.textContent = s.expired;
  }

  /* ---------- Public API ---------- */

  global.SubscriptionLib = {
    load: load,
    save: save,
    getStatus: getStatus,
    validate: validate,
    add: add,
    remove: remove,
    summarize: summarize,
    renderTable: renderTable,
    renderSummary: renderSummary,
    version: "1.0.0"
  };
})(window);
