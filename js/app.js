// =========================================
// APP.JS
// SISTEMA PRINCIPAL
// =========================================

// =========================================
// STORAGE
// =========================================

const STORAGE_KEY = "atelier_finance_records";

// =========================================
// ELEMENTOS
// =========================================

const financeForm =
document.getElementById("financeForm");

const clientName =
document.getElementById("clientName");

const garments =
document.getElementById("garments");

const garmentType =
document.getElementById("garmentType");

const totalPrice =
document.getElementById("totalPrice");

const hasAdvance =
document.getElementById("hasAdvance");

const advanceInput =
document.getElementById("advance");

const pending =
document.getElementById("pending");

const dateInput =
document.getElementById("date");

const tableBody =
document.getElementById("tableBody");

// STATS

const todayIncome =
document.getElementById("todayIncome");

const todayClients =
document.getElementById("todayClients");

const todayGarments =
document.getElementById("todayGarments");

const todayPending =
document.getElementById("todayPending");

// =========================================
// FECHA
// =========================================

function getElSalvadorDate() {

  const now = new Date();

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/El_Salvador",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(now);

}

function updateVisualDate() {

  const now = new Date();

  const formatted =
  now.toLocaleDateString(
    "es-SV",
    {
      timeZone: "America/El_Salvador",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

  const currentDate =
  document.getElementById("currentDate");

  if(currentDate){

    currentDate.textContent =
    formatted;

  }

}

updateVisualDate();

// =========================================
// INPUT FECHA
// =========================================

if(dateInput){

  dateInput.value =
  getElSalvadorDate();

}

// =========================================
// STORAGE
// =========================================

function getRecords() {

  return JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  ) || [];

}

function saveRecords(records) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records)
  );

}

// =========================================
// ANTICIPO
// =========================================

if(hasAdvance){

  hasAdvance.addEventListener(
    "change",
    () => {

      if(hasAdvance.checked){

        advanceInput.disabled = false;

        advanceInput.classList.remove(
          "opacity-50"
        );

      }

      else {

        advanceInput.disabled = true;

        advanceInput.value = "";

        advanceInput.classList.add(
          "opacity-50"
        );

        pending.value = "0.00";

      }

    }
  );

}

// =========================================
// CALCULAR PENDIENTE
// =========================================

function calculatePending() {

  if(!hasAdvance.checked){

    pending.value = "0.00";

    return;

  }

  const total =
  parseFloat(totalPrice.value) || 0;

  const advance =
  parseFloat(advanceInput.value) || 0;

  let result = total - advance;

  if(result < 0){

    result = 0;

  }

  pending.value =
  result.toFixed(2);

}

if(totalPrice){

  totalPrice.addEventListener(
    "input",
    calculatePending
  );

}

if(advanceInput){

  advanceInput.addEventListener(
    "input",
    calculatePending
  );

}

// =========================================
// GUARDAR REGISTRO
// =========================================

if(financeForm){

  financeForm.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();

      // VALIDACION

      if(
        !clientName.value.trim() ||
        !garments.value ||
        !garmentType.value.trim() ||
        !totalPrice.value
      ){

        alert(
          "Completa todos los campos."
        );

        return;

      }

      const records =
      getRecords();

      const total =
      Number(totalPrice.value);

      const advance =
      hasAdvance.checked
      ? Number(advanceInput.value) || 0
      : 0;

      const pendingAmount =
      hasAdvance.checked
      ? Math.max(total - advance, 0)
      : 0;

      const record = {

        id: Date.now(),

        clientName:
        clientName.value.trim(),

        garments:
        Number(garments.value),

        garmentType:
        garmentType.value.trim(),

        totalPrice: total,

        hasAdvance:
        hasAdvance.checked,

        advance: advance,

        pending:
        pendingAmount,

        date:
        dateInput.value,

        createdAt:
        new Date().toISOString()

      };

      records.push(record);

      saveRecords(records);

      // RESET

      financeForm.reset();

      pending.value = "";

      advanceInput.disabled = true;

      advanceInput.classList.add(
        "opacity-50"
      );

      dateInput.value =
      getElSalvadorDate();

      renderRecords();

      updateStats();

      alert(
        "Registro guardado correctamente."
      );

    }
  );

}

// =========================================
// TABLA PRINCIPAL
// =========================================

function renderRecords() {

  if(!tableBody) return;

  const records =
  getRecords();

  tableBody.innerHTML = "";

  if(records.length === 0){

    tableBody.innerHTML = `

      <tr>

        <td
          colspan="5"
          class="py-8 text-center text-gray-400"
        >
          No hay registros todavía.
        </td>

      </tr>

    `;

    return;

  }

  // COPIA PARA NO ROMPER ARRAY

  const latest =
  [...records]
  .sort((a,b) => {

    return new Date(b.createdAt)
    - new Date(a.createdAt);

  })
  .slice(0,10);

  latest.forEach(record => {

    const row =
    document.createElement("tr");

    row.className =
    "border-b border-white/5";

    row.innerHTML = `

      <td class="py-4">
        ${record.clientName}
      </td>

      <td>
        ${record.garments}
      </td>

      <td class="text-green-400">
        $${record.totalPrice.toFixed(2)}
      </td>

      <td>

        ${
          record.pending > 0

          ?

          `<span class="text-red-400">
            $${record.pending.toFixed(2)}
          </span>`

          :

          `<span class="text-green-400">
            COMPLETO
          </span>`
        }

      </td>

      <td>
        ${record.date}
      </td>

    `;

    tableBody.appendChild(row);

  });

}

// =========================================
// ESTADISTICAS
// =========================================

function updateStats() {

  const records =
  getRecords();

  const today =
  getElSalvadorDate();

  let income = 0;

  let garmentsCount = 0;

  let pendingTotal = 0;

  const clients =
  new Set();

  records.forEach(record => {

    // SOLO HOY

    if(record.date === today){

      income +=
      Number(record.totalPrice);

      garmentsCount +=
      Number(record.garments);

      clients.add(
        record.clientName
      );

    }

    // SOLO PENDIENTES REALES

    if(record.pending > 0){

      pendingTotal +=
      Number(record.pending);

    }

  });

  if(todayIncome){

    todayIncome.textContent =
    `$${income.toFixed(2)}`;

  }

  if(todayClients){

    todayClients.textContent =
    clients.size;

  }

  if(todayGarments){

    todayGarments.textContent =
    garmentsCount;

  }

  if(todayPending){

    todayPending.textContent =
    `$${pendingTotal.toFixed(2)}`;

  }

}

// =========================================
// INICIAR
// =========================================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    renderRecords();

    updateStats();

  }
);
