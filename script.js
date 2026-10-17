
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

// 1차 수거 기록
let firstCollection = null;

// 최종 수거 및 재분배 완료 여부
let hasFinalized = false;

// 기본 대상 2개 생성

createCharacter("이름");
createCharacter("이름");

// 대상 추가

addCharacterBtn.addEventListener(
  "click",
  () => {
    createCharacter("이름");
  }
);

// 1차 수거 버튼

firstCollectBtn.addEventListener(
  "click",
  firstCollect
);

// 최종 수거 및 재분배 버튼

finalRollBtn.addEventListener(
  "click",
  finalCollectAndDistribute
);

// 캐릭터 생성

function createCharacter(name) {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "character-box";

  const table =
    document.createElement("table");

  table.className =
    "character-table";

  // 헤더

  const header =
    document.createElement("tr");

  header.innerHTML = `
    <td class="diagonal"></td>
    <th>무기</th>
    <th>숙련도</th>
  `;

  table.appendChild(header);

  // 기본 행 1개

  const row =
    document.createElement("tr");

  row.innerHTML = `
    <td class="name-cell" rowspan="1">
      <input
        type="text"
        value="${name}"
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
        value="0"
        class="mastery-input">
    </td>
  `;

  table.appendChild(row);

  // 무기 추가 버튼

  const addWeaponBtn =
    document.createElement("button");

  addWeaponBtn.textContent = "무기 추가";
  addWeaponBtn.className = "add-weapon-btn";

  addWeaponBtn.addEventListener(
    "click",
    () => {

      const newRow =
        document.createElement("tr");

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
            value="0"
            class="mastery-input">
        </td>
      `;

      table.appendChild(newRow);

      // 이름 셀의 rowspan 증가

      const firstNameCell =
        table.rows[1].cells[0];

      firstNameCell.rowSpan += 1;
    }
  );

  wrapper.appendChild(table);
  wrapper.appendChild(addWeaponBtn);

  charactersContainer.appendChild(wrapper);
}

// 캐릭터 및 무기 데이터 가져오기

function getCharacterData(table) {

  const rows =
    [...table.rows].slice(1);

  const name =
    rows[0]
      .cells[0]
      .querySelector("input")
      .value;

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
      weaponCell.querySelector("input");

    const masteryInput =
      masteryCell.querySelector("input");

    weapons.push({

      weaponInput,
      masteryInput,

      weapon: weaponInput.value,

      mastery: Math.max(
        0,
        parseInt(masteryInput.value, 10) || 0
      )

    });
  });

  return {
    name,
    weapons
  };
}

// 전체 캐릭터 데이터 가져오기

function getAllCharacters() {

  const tables =
    document.querySelectorAll(
      ".character-table"
    );

  return [...tables].map(table =>
    getCharacterData(table)
  );
}

// 수거 시스템
// 캐릭터마다 숙련도가 1 이상인 무기 중
// 무작위로 하나를 골라 1포인트 수거

function collectPoints() {

  const allCharacters =
    getAllCharacters();

  let confiscatedTotal = 0;
  let resultsHTML = "";

  allCharacters.forEach(character => {

    const availableWeapons =
      character.weapons.filter(
        weapon =>
          weapon.weapon.trim() !== "" &&
          weapon.mastery > 0
      );

    // 수거할 무기가 없는 경우

    if (availableWeapons.length === 0) {

      resultsHTML += `
        <div class="result-line">
          ${escapeHTML(character.name)}: 수거 불가
        </div>
      `;

      return;
    }

    // 랜덤 무기 선택

    const selectedWeapon =
      availableWeapons[
        Math.floor(
          Math.random() *
          availableWeapons.length
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

// 1차 수거

function firstCollect() {

  // 새로운 1차 수거 시작

  hasFinalized = false;

  // 1차 수거 기록 저장

  firstCollection = collectPoints();

  // 결과 출력

  resultBox.innerHTML = `

    <div class="result-section">

      <div class="result-title">
        1차 수거 결과
      </div>

      ${firstCollection.html}

      <div class="result-line">
        1차 수거 포인트:
        ${firstCollection.total}
      </div>

    </div>

  `;
}

// 최종 수거 및 재분배

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

  hasFinalized = true;

  // 2차 수거

  const secondCollection =
    collectPoints();

  // 1차 + 2차 포인트 합산

  const confiscatedTotal =
    firstCollection.total +
    secondCollection.total;

  // 전체 무기 풀 생성

  const allWeapons = [];

  const allCharacters =
    getAllCharacters();

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

  // 재분배

  const distributionMap = {};

  // 수거한 포인트 총량만큼 분배 시도

  for (
    let i = 0;
    i < confiscatedTotal;
    i++
  ) {

    // 현재 숙련도가 10 미만인 무기만 후보
    // 분배할 때마다 다시 확인

    const eligibleWeapons =
      allWeapons.filter(weapon => {

        const mastery =
          Math.max(
            0,
            parseInt(
              weapon.masteryInput.value,
              10
            ) || 0
          );

        return mastery < 10;

      });

    // 모든 무기가 10 이상이면 종료

    if (eligibleWeapons.length === 0) {
      break;
    }

    // 기존 확률 방식 유지

    const possibleReceivers =
      eligibleWeapons.filter(
        () => Math.random() < 0.5
      );

    // 이번 추첨에서 아무도 선정되지 않았다면
    // 해당 포인트를 포기하지 않고 다음 반복으로 이동

    if (possibleReceivers.length === 0) {
      continue;
    }

    // 무작위 수령자 선정

    const selected =
      possibleReceivers[
        Math.floor(
          Math.random() *
          possibleReceivers.length
        )
      ];

    const currentMastery =
      Math.max(
        0,
        parseInt(
          selected.masteryInput.value,
          10
        ) || 0
      );

    // 안전장치

    if (currentMastery >= 10) {
      continue;
    }

    // 숙련도 1 증가

    selected.masteryInput.value =
      currentMastery + 1;

    // 분배 결과 기록

    const key =
      `${selected.owner}:${selected.weapon}`;

    if (!distributionMap[key]) {

      distributionMap[key] = {

        owner: selected.owner,
        weapon: selected.weapon,
        amount: 0

      };

    }

    distributionMap[key].amount += 1;

  }

  // 분배 결과 출력

  let distributeHTML = "";

  const distributionValues =
    Object.values(distributionMap);

  if (distributionValues.length === 0) {

    distributeHTML = `
      <div class="result-line">
        분배된 포인트 없음
      </div>
    `;

  } else {

    distributionValues.forEach(item => {

      distributeHTML += `
        <div class="result-line">
          ${escapeHTML(item.owner)}:
          ${escapeHTML(item.weapon)}
          +${item.amount}
        </div>
      `;

    });

  }

  // 최종 결과 출력

  resultBox.innerHTML = `

    <div class="result-section">

      <div class="result-title">
        1차 수거 결과
      </div>

      ${firstCollection.html}

      <div class="result-line">
        1차 수거 포인트:
        ${firstCollection.total}
      </div>

    </div>

    <div class="result-section">

      <div class="result-title">
        2차 수거 결과
      </div>

      ${secondCollection.html}

      <div class="result-line">
        2차 수거 포인트:
        ${secondCollection.total}
      </div>

    </div>

    <div class="result-section">

      <div class="result-title">
        최종 분배 결과
      </div>

      <div class="result-line">
        수거 포인트 합계:
        ${firstCollection.total}
        + ${secondCollection.total}
        = ${confiscatedTotal}
      </div>

      <br>

      ${distributeHTML}

    </div>

  `;
}

// HTML 출력 시 문자열 이스케이프

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
