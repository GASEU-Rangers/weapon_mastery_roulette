
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

// 수거 기록
let firstCollection = null;
let secondCollection = null;

// 최종 수거 및 재분배 완료 여부
let hasFinalized = false;

// 분배 결과 기록
let lastDistributionHTML = `
  <div class="result-line">
    아직 분배 결과가 없습니다.
  </div>
`;

// 기본 대상 2개 생성
createCharacter("이름");
createCharacter("이름");

// 최초 화면에도 결과 제목 표시
renderResults();

// 대상 추가
addCharacterBtn.addEventListener("click", () => {
  createCharacter("이름");
});

// 1차 수거
firstCollectBtn.addEventListener("click", firstCollect);

// 최종 수거 및 재분배
finalRollBtn.addEventListener(
  "click",
  finalCollectAndDistribute
);


// ========================================
// 캐릭터 생성
// 기존 표 구조 유지
// ========================================

function createCharacter(name) {
  const wrapper = document.createElement("div");
  wrapper.className = "character-box";

  const table = document.createElement("table");
  table.className = "character-table";

  // 표 헤더
  const header = document.createElement("tr");

  header.innerHTML = `
    <td class="diagonal"></td>
    <th>무기</th>
    <th>숙련도</th>
  `;

  table.appendChild(header);

  // 기본 무기 행
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

  // 무기 추가 버튼
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

    // 캐릭터 이름 셀의 rowspan 증가
    const firstNameCell = table.rows[1].cells[0];
    firstNameCell.rowSpan += 1;
  });

  wrapper.appendChild(table);
  wrapper.appendChild(addWeaponBtn);

  charactersContainer.appendChild(wrapper);
}


// ========================================
// 캐릭터 및 무기 데이터 가져오기
// ========================================

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


// ========================================
// 전체 캐릭터 데이터 가져오기
// ========================================

function getAllCharacters() {
  const tables = document.querySelectorAll(
    ".character-table"
  );

  return [...tables].map(table =>
    getCharacterData(table)
  );
}


// ========================================
// 수거 시스템
// 캐릭터마다 숙련도 1 이상인 무기 중
// 무작위로 하나를 선택하여 1점 수거
// ========================================

function collectPoints() {
  const allCharacters = getAllCharacters();

  let confiscatedTotal = 0;
  let resultsHTML = "";

  allCharacters.forEach(character => {
    const availableWeapons = character.weapons.filter(
      weapon =>
        weapon.weapon.trim() !== "" &&
        weapon.mastery > 0
    );

    // 수거 가능한 무기가 없는 경우
    if (availableWeapons.length === 0) {
      resultsHTML += `
        <div class="result-line">
          ${escapeHTML(character.name)}: 수거 불가
        </div>
      `;

      return;
    }

    // 무작위 무기 선택
    const selectedWeapon =
      availableWeapons[
        Math.floor(
          Math.random() * availableWeapons.length
        )
      ];

    // 숙련도 1 감소
    selectedWeapon.mastery -= 1;

    selectedWeapon.masteryInput.value =
      selectedWeapon.mastery;

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


// ========================================
// 결과 화면 렌더링
// 기존 CSS 클래스 및 표 디자인 유지
// ========================================

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

  // 상위 제목과 하위 제목은 항상 표시
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


// ========================================
// 1차 수거
// ========================================

function firstCollect() {
  // 새로운 수거 절차 시작
  hasFinalized = false;

  // 기존 2차 수거 기록 초기화
  secondCollection = null;

  // 이전 분배 결과 초기화
  lastDistributionHTML = `
    <div class="result-line">
      최종 수거 후 재분배 결과가 표시됩니다.
    </div>
  `;

  // 1차 수거 실행 및 기록 저장
  firstCollection = collectPoints();

  renderResults();
}


// ========================================
// 최종 수거 및 재분배
// ========================================

function finalCollectAndDistribute() {
  // 1차 수거 여부 확인
  if (firstCollection === null) {
    alert("먼저 1차 수거를 진행해 주세요.");
    return;
  }

  // 중복 실행 방지
  if (hasFinalized) {
    alert(
      "이미 최종 수거 및 재분배가 완료되었습니다. " +
      "다시 진행하려면 1차 수거를 눌러 주세요."
    );

    return;
  }

  // 2차 수거
  secondCollection = collectPoints();

  // 1차 + 2차 수거 포인트 합산
  const confiscatedTotal =
    firstCollection.total + secondCollection.total;

  // 모든 무기 수집
  const allWeapons = [];
  const allCharacters = getAllCharacters();

  allCharacters.forEach(character => {
    character.weapons.forEach(weapon => {
      if (weapon.weapon.trim() !== "") {
        allWeapons.push({
          owner: character.name,
          weapon: weapon.weapon,
          masteryInput: weapon.masteryInput
        });
      }
    });
  });

  // 무기별 분배량 기록
  const distributionMap = new Map();

  let distributedTotal = 0;

  // ========================================
  // 포인트 재분배
  // ========================================

  for (let i = 0; i < confiscatedTotal; i++) {
    // 매 포인트마다 후보를 새로 확인
    // 숙련도 10 이상인 무기는 후보에서 제외
    const eligibleWeapons = allWeapons.filter(item => {
      const rawMastery = item.masteryInput.value.trim();

      if (rawMastery === "") {
        return false;
      }

      const mastery = parseInt(rawMastery, 10);

      return Number.isFinite(mastery) && mastery < 10;
    });

    // 모든 무기가 숙련도 10 이상이면 남은 포인트 중단
    if (eligibleWeapons.length === 0) {
      break;
    }

    // 후보 중 무작위 무기 하나 선택
    // 50% 후보 필터를 사용하지 않아 포인트가 누락되지 않음
    const selected =
      eligibleWeapons[
        Math.floor(Math.random() * eligibleWeapons.length)
      ];

    const currentMastery =
      parseInt(selected.masteryInput.value, 10);

    // 안전 확인
    if (!Number.isFinite(currentMastery) || currentMastery >= 10) {
      continue;
    }

    // 선택된 무기에 1점 지급
    selected.masteryInput.value = currentMastery + 1;

    distributedTotal += 1;

    // 무기별 분배 결과 기록
    const key = `${selected.owner}|||${selected.weapon}`;

    if (!distributionMap.has(key)) {
      distributionMap.set(key, {
        owner: selected.owner,
        weapon: selected.weapon,
        amount: 0
      });
    }

    distributionMap.get(key).amount += 1;
  }

  // 실제 미배분 포인트 계산
  const undistributedTotal =
    confiscatedTotal - distributedTotal;

  // ========================================
  // 분배 결과 출력
  // ========================================

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

  // 총 수거 및 분배량 표시
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

  // 모든 무기가 상한에 도달한 경우에만 미배분 발생
  if (undistributedTotal > 0) {
    lastDistributionHTML += `
      <div class="result-line">
        미배분 포인트: ${undistributedTotal}
        (모든 무기의 숙련도가 10 이상입니다.)
      </div>
    `;
  }

  hasFinalized = true;

  // 기존 결과 영역의 구조를 유지하며 갱신
  renderResults();
}


// ========================================
// HTML 출력 시 문자열 이스케이프
// ========================================

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
