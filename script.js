
const charactersContainer =
  document.getElementById("characters");

const resultBox =
  document.getElementById("result");

const addCharacterBtn =
  document.getElementById("addCharacterBtn");

const firstCollectBtn =
  document.getElementById("firstCollectBtn");

const finalRollBtn =
  document.getElementById("finalRollBtn");

let firstCollection = null;
let secondCollection = null;
let hasFinalized = false;
let virtualMastery = new Map();

let lastDistributionHTML = `
  <div class="result-line">
    아직 분배 결과가 없습니다.
  </div>
`;

createCharacter("이름");
createCharacter("이름");
renderResults();

addCharacterBtn.addEventListener("click", () => {
  createCharacter("이름");
});

firstCollectBtn.addEventListener("click", firstCollect);

finalRollBtn.addEventListener(
  "click",
  finalCollectAndDistribute
);

function createCharacter(name) {
  const wrapper = document.createElement("div");
  wrapper.className = "character-box";

  const table = document.createElement("table");
  table.className = "character-table";

  const header = document.createElement("tr");

  header.innerHTML = `
    <td class="diagonal"></td>
    <th>무기</th>
    <th>숙련도</th>
  `;

  table.appendChild(header);

  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="name-cell" rowspan="1">
      <input
        type="text"
        value="${escapeHTML(name)}"
        class="character-name">
    </td>

    <td>
      <input
        type="text"
        class="weapon-input">
    </td>

    <td>
      <input
        type="number"
        min="0"
        step="1"
        value="0"
        class="mastery-input">
    </td>
  `;

  table.appendChild(row);

  const addWeaponBtn = document.createElement("button");

  addWeaponBtn.textContent = "무기 추가";
  addWeaponBtn.className = "add-weapon-btn";
  addWeaponBtn.type = "button";

  addWeaponBtn.addEventListener("click", () => {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td>
        <input
          type="text"
          class="weapon-input">
      </td>

      <td>
        <input
          type="number"
          min="0"
          step="1"
          value="0"
          class="mastery-input">
      </td>
    `;

    table.appendChild(newRow);

    const firstNameCell = table.rows[1].cells[0];
    firstNameCell.rowSpan += 1;
  });

  wrapper.appendChild(table);
  wrapper.appendChild(addWeaponBtn);

  charactersContainer.appendChild(wrapper);
}

function getCharacterData(table) {
  const rows = [...table.rows].slice(1);

  const nameInput =
    rows[0].querySelector(".character-name");

  const name = nameInput
    ? nameInput.value
    : "이름";

  const weapons = [];

  rows.forEach((row, index) => {
    let weaponCell;
    let masteryCell;

    if (index === 0) {
      weaponCell = row.cells[1];
      masteryCell = row.cells[2];
    } else {
      weaponCell = row.cells[0];
      masteryCell = row.cells[1];
    }

    const weaponInput =
      weaponCell.querySelector(".weapon-input");

    const masteryInput =
      masteryCell.querySelector(".mastery-input");

    const rawMastery = masteryInput.value.trim();

    weapons.push({
      weaponInput,
      masteryInput,
      weapon: weaponInput.value,
      mastery: Math.max(
        0,
        parseInt(rawMastery, 10) || 0
      )
    });
  });

  return {
    name,
    weapons
  };
}

function getAllCharacters() {
  const tables = document.querySelectorAll(
    ".character-table"
  );

  return [...tables].map(table =>
    getCharacterData(table)
  );
}

function initializeVirtualMastery() {
  virtualMastery = new Map();

  getAllCharacters().forEach(character => {
    character.weapons.forEach(weapon => {
      virtualMastery.set(
        weapon.masteryInput,
        weapon.mastery
      );
    });
  });
}

function getVirtualMastery(weapon) {
  if (!virtualMastery.has(weapon.masteryInput)) {
    virtualMastery.set(
      weapon.masteryInput,
      weapon.mastery
    );
  }

  return virtualMastery.get(weapon.masteryInput);
}

function collectPoints() {
  const allCharacters = getAllCharacters();

  let confiscatedTotal = 0;
  let resultsHTML = "";

  allCharacters.forEach(character => {
    const availableWeapons = character.weapons.filter(
      weapon =>
        weapon.weapon.trim() !== "" &&
        getVirtualMastery(weapon) > 0
    );

    if (availableWeapons.length === 0) {
      resultsHTML += `
        <div class="result-line">
          ${escapeHTML(character.name)}: 수거 불가
        </div>
      `;

      return;
    }

    const selectedWeapon =
      availableWeapons[
        Math.floor(
          Math.random() * availableWeapons.length
        )
      ];

    const currentMastery =
      getVirtualMastery(selectedWeapon);

    virtualMastery.set(
      selectedWeapon.masteryInput,
      currentMastery - 1
    );

    confiscatedTotal += 1;

    resultsHTML += `
      <div class="result-line">
        ${escapeHTML(character.name)}:
        ${escapeHTML(selectedWeapon.weapon)} -1
      </div>
    `;
  });

  return {
    total: confiscatedTotal,
    html: resultsHTML
  };
}

function renderResults() {
  const firstHTML = firstCollection
    ? `
        ${firstCollection.html}

        <div class="result-line">
          1차 수거 포인트:
          ${firstCollection.total}
        </div>
      `
    : `
        <div class="result-line">
          아직 1차 수거를 진행하지 않았습니다.
        </div>
      `;

  const secondHTML = secondCollection
    ? `
        ${secondCollection.html}

        <div class="result-line">
          2차 수거 포인트:
          ${secondCollection.total}
        </div>

        <div class="result-line">
          1·2차 수거 합계:
          ${firstCollection.total + secondCollection.total}
        </div>
      `
    : `
        <div class="result-line">
          아직 2차 수거를 진행하지 않았습니다.
        </div>
      `;

  resultBox.innerHTML = `
    <div class="result-section">

      <div class="result-title">
        결과:
      </div>

      <div class="result-section">
        <div class="result-title">
          1차 수거 결과
        </div>

        ${firstHTML}
      </div>

      <div class="result-section">
        <div class="result-title">
          2차 수거 결과
        </div>

        ${secondHTML}
      </div>

    </div>

    <div class="result-section">

      <div class="result-title">
        분배 결과:
      </div>

      ${lastDistributionHTML}

    </div>
  `;
}

function firstCollect() {
  hasFinalized = false;

  firstCollection = null;
  secondCollection = null;

  lastDistributionHTML = `
    <div class="result-line">
      최종 수거 후 재분배 결과가 표시됩니다.
    </div>
  `;

  initializeVirtualMastery();

  firstCollection = collectPoints();

  renderResults();
}

function finalCollectAndDistribute() {
  if (firstCollection === null) {
    alert("먼저 1차 수거를 진행해 주세요.");
    return;
  }

  if (hasFinalized) {
    alert(
      "이미 최종 수거 및 재분배가 완료되었습니다. " +
      "다시 진행하려면 1차 수거를 눌러 주세요."
    );

    return;
  }

  secondCollection = collectPoints();

  const confiscatedTotal =
    firstCollection.total + secondCollection.total;

  const allWeapons = [];
  const allCharacters = getAllCharacters();

  allCharacters.forEach(character => {
    character.weapons.forEach(weapon => {
      if (weapon.weapon.trim() !== "") {
        allWeapons.push({
          owner: character.name,
          weapon: weapon.weapon,
          masteryInput: weapon.masteryInput,
          mastery: weapon.mastery
        });
      }
    });
  });

  const distributionMap = new Map();

  let distributedTotal = 0;

  for (let i = 0; i < confiscatedTotal; i++) {
    const eligibleWeapons = allWeapons.filter(item => {
      return getVirtualMastery(item) < 10;
    });

    if (eligibleWeapons.length === 0) {
      break;
    }

    const selected =
      eligibleWeapons[
        Math.floor(Math.random() * eligibleWeapons.length)
      ];

    const currentMastery = getVirtualMastery(selected);

    if (currentMastery >= 10) {
      continue;
    }

    virtualMastery.set(
      selected.masteryInput,
      currentMastery + 1
    );

    distributedTotal += 1;

    const key =
      `${selected.owner}|||${selected.weapon}`;

    if (!distributionMap.has(key)) {
      distributionMap.set(key, {
        owner: selected.owner,
        weapon: selected.weapon,
        amount: 0
      });
    }

    distributionMap.get(key).amount += 1;
  }

  const undistributedTotal =
    confiscatedTotal - distributedTotal;

  const distributionValues =
    [...distributionMap.values()];

  if (distributionValues.length === 0) {
    lastDistributionHTML = `
      <div class="result-line">
        분배된 포인트 없음
      </div>
    `;
  } else {
    lastDistributionHTML = distributionValues
      .map(item => `
        <div class="result-line">
          ${escapeHTML(item.owner)}:
          ${escapeHTML(item.weapon)}
          +${item.amount}
        </div>
      `)
      .join("");
  }

  lastDistributionHTML += `
    <div class="result-line">
      수거 포인트 합계:
      ${firstCollection.total}
      + ${secondCollection.total}
      = ${confiscatedTotal}
    </div>

    <div class="result-line">
      실제 분배 포인트:
      ${distributedTotal}
    </div>
  `;

  if (undistributedTotal > 0) {
    lastDistributionHTML += `
      <div class="result-line">
        미배분 포인트: ${undistributedTotal}
        (모든 무기의 숙련도가 10 이상입니다.)
      </div>
    `;
  }

  hasFinalized = true;

  renderResults();
}

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );
}
