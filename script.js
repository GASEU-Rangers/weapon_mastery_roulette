
document.addEventListener("DOMContentLoaded", () => {
    // ========================================
    // 1. HTML 요소
    // ========================================

    const charactersContainer = document.getElementById("characters");
    const resultBox = document.getElementById("result");
    const addCharacterBtn = document.getElementById("addCharacterBtn");
    const firstCollectBtn = document.getElementById("firstCollectBtn");
    const finalRollBtn = document.getElementById("finalRollBtn");

    if (
        !charactersContainer ||
        !resultBox ||
        !addCharacterBtn ||
        !firstCollectBtn ||
        !finalRollBtn
    ) {
        console.error(
            "필요한 HTML 요소를 찾을 수 없습니다. " +
            "characters, result, addCharacterBtn, " +
            "firstCollectBtn, finalRollBtn의 ID를 확인해 주세요."
        );
        return;
    }

    // ========================================
    // 2. 상태 변수
    // ========================================

    let firstCollection = null;
    let secondCollection = null;
    let hasFinalized = false;

    let lastDistributionHTML = `
        <div class="result-line">아직 분배 결과가 없습니다.</div>
    `;

    // ========================================
    // 3. HTML 출력용 문자열 처리
    // ========================================

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ========================================
    // 4. 캐릭터 및 무기 입력란 생성
    // ========================================

    function createWeaponRow(weaponName = "", mastery = 0) {
        const row = document.createElement("div");
        row.className = "weapon-row";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.className = "weapon-name";
        nameInput.placeholder = "무기 이름";
        nameInput.value = weaponName;
        nameInput.setAttribute("aria-label", "무기 이름");

        const masteryInput = document.createElement("input");
        masteryInput.type = "number";
        masteryInput.className = "mastery";
        masteryInput.placeholder = "숙련도";
        masteryInput.min = "0";
        masteryInput.step = "1";
        masteryInput.value = mastery;
        masteryInput.setAttribute("aria-label", "무기 숙련도");

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-weapon-btn";
        removeBtn.textContent = "무기 삭제";

        removeBtn.addEventListener("click", () => {
            row.remove();
        });

        row.append(nameInput, masteryInput, removeBtn);

        return row;
    }

    function createCharacter(name = "") {
        const character = document.createElement("div");
        character.className = "character";

        const characterHeader = document.createElement("div");
        characterHeader.className = "character-header";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.className = "character-name";
        nameInput.placeholder = "캐릭터 이름";
        nameInput.value = name;
        nameInput.setAttribute("aria-label", "캐릭터 이름");

        const removeCharacterBtn = document.createElement("button");
        removeCharacterBtn.type = "button";
        removeCharacterBtn.className = "remove-character-btn";
        removeCharacterBtn.textContent = "캐릭터 삭제";

        removeCharacterBtn.addEventListener("click", () => {
            character.remove();
        });

        characterHeader.append(nameInput, removeCharacterBtn);

        const weaponsContainer = document.createElement("div");
        weaponsContainer.className = "weapons";

        // 기본 무기 입력란 하나 생성
        weaponsContainer.appendChild(createWeaponRow());

        const addWeaponBtn = document.createElement("button");
        addWeaponBtn.type = "button";
        addWeaponBtn.className = "add-weapon-btn";
        addWeaponBtn.textContent = "무기 추가";

        addWeaponBtn.addEventListener("click", () => {
            weaponsContainer.appendChild(createWeaponRow());
        });

        character.append(
            characterHeader,
            weaponsContainer,
            addWeaponBtn
        );

        return character;
    }

    // ========================================
    // 5. 캐릭터 추가
    // ========================================

    addCharacterBtn.addEventListener("click", () => {
        charactersContainer.appendChild(createCharacter());
    });

    // ========================================
    // 6. 결과 기록 생성
    // ========================================

    function createCollectionLogHTML(collection) {
        if (!collection || collection.log.length === 0) {
            return `<div class="result-line">수거된 포인트가 없습니다.</div>`;
        }

        return collection.log.map(item => `
            <div class="result-line">
                <strong>${escapeHTML(item.owner)}</strong>
                /
                ${escapeHTML(item.weapon)}
                : -1점
            </div>
        `).join("");
    }

    // ========================================
    // 7. 결과 화면 렌더링
    // ========================================

    function renderResults() {
        const firstHTML = firstCollection
            ? `
                <h3>1차 수거 결과</h3>
                ${createCollectionLogHTML(firstCollection)}
                <div class="result-line">
                    <strong>1차 수거 합계: ${firstCollection.total}점</strong>
                </div>
            `
            : `
                <h3>1차 수거 결과</h3>
                <div class="result-line">아직 수거하지 않았습니다.</div>
            `;

        const secondHTML = secondCollection
            ? `
                <h3>2차 수거 결과</h3>
                ${createCollectionLogHTML(secondCollection)}
                <div class="result-line">
                    <strong>2차 수거 합계: ${secondCollection.total}점</strong>
                </div>
                <div class="result-line">
                    <strong>
                        총 수거 포인트:
                        ${firstCollection.total + secondCollection.total}점
                    </strong>
                </div>
            `
            : `
                <h3>2차 수거 결과</h3>
                <div class="result-line">아직 수거하지 않았습니다.</div>
            `;

        // 상위 제목인 결과와 분배 결과는 항상 표시
        resultBox.innerHTML = `
            <section class="result-section">
                <h2>결과</h2>
                ${firstHTML}
                ${secondHTML}
            </section>

            <section class="distribution-section">
                <h2>분배 결과</h2>
                ${lastDistributionHTML}
            </section>
        `;
    }

    // ========================================
    // 8. 수거 진행
    // 캐릭터마다 숙련도가 1 이상인 무기 하나를
    // 무작위로 선택하여 숙련도를 1 감소시킴
    // ========================================

    function collectPoints() {
        const log = [];

        const characters = Array.from(
            charactersContainer.querySelectorAll(".character")
        );

        characters.forEach(character => {
            const ownerInput = character.querySelector(".character-name");

            const owner = ownerInput?.value.trim() || "이름 없음";

            const weaponRows = Array.from(
                character.querySelectorAll(".weapon-row")
            );

            const availableWeapons = weaponRows
                .map(row => {
                    const nameInput = row.querySelector(".weapon-name");
                    const masteryInput = row.querySelector(".mastery");

                    if (!nameInput || !masteryInput) {
                        return null;
                    }

                    const weaponName = nameInput.value.trim();
                    const mastery = Number(masteryInput.value);

                    if (
                        !weaponName ||
                        masteryInput.value.trim() === "" ||
                        !Number.isFinite(mastery) ||
                        mastery <= 0
                    ) {
                        return null;
                    }

                    return {
                        weapon: weaponName,
                        masteryInput,
                        mastery
                    };
                })
                .filter(Boolean);

            // 수거 가능한 무기가 없으면 다음 캐릭터로
            if (availableWeapons.length === 0) {
                return;
            }

            // 무작위 무기 하나 선택
            const selected =
                availableWeapons[
                    Math.floor(Math.random() * availableWeapons.length)
                ];

            // 숙련도 1 감소
            selected.masteryInput.value = selected.mastery - 1;

            log.push({
                owner,
                weapon: selected.weapon
            });
        });

        return {
            log,
            total: log.length
        };
    }

    // ========================================
    // 9. 1차 수거 버튼
    // ========================================

    firstCollectBtn.addEventListener("click", () => {
        // 이전 최종 결과를 초기화하고 새 1차 수거 진행
        firstCollection = collectPoints();
        secondCollection = null;
        hasFinalized = false;

        lastDistributionHTML = `
            <div class="result-line">
                1차 수거 완료. 최종 수거 후 재분배할 수 있습니다.
            </div>
        `;

        renderResults();
    });

    // ========================================
    // 10. 최종 수거 및 재분배
    // ========================================

    function finalCollectAndDistribute() {
        if (!firstCollection) {
            alert("먼저 1차 수거를 진행해 주세요.");
            return;
        }

        if (hasFinalized) {
            alert("이미 최종 수거 및 재분배를 진행했습니다.");
            return;
        }

        // 2차 수거
        secondCollection = collectPoints();

        // 1차 + 2차 수거 포인트 합산
        const confiscatedTotal =
            firstCollection.total + secondCollection.total;

        // 모든 캐릭터의 무기 수집
        const allWeapons = [];

        charactersContainer
            .querySelectorAll(".character")
            .forEach(character => {
                const owner =
                    character.querySelector(".character-name")
                        ?.value.trim() || "이름 없음";

                character.querySelectorAll(".weapon-row").forEach(row => {
                    const weaponInput = row.querySelector(".weapon-name");
                    const masteryInput = row.querySelector(".mastery");

                    if (!weaponInput || !masteryInput) {
                        return;
                    }

                    const weaponName = weaponInput.value.trim();

                    if (!weaponName) {
                        return;
                    }

                    allWeapons.push({
                        owner,
                        weapon: weaponName,
                        masteryInput
                    });
                });
            });

        const distributionMap = new Map();

        let distributedTotal = 0;
        let undistributedTotal = 0;

        // 수거한 포인트를 하나씩 재분배
        for (let i = 0; i < confiscatedTotal; i++) {
            // 매번 현재 숙련도를 다시 확인
            // 숙련도 10 이상인 무기는 후보에서 제외
            const eligibleWeapons = allWeapons.filter(item => {
                const mastery = Number(item.masteryInput.value);

                return (
                    item.masteryInput.value.trim() !== "" &&
                    Number.isFinite(mastery) &&
                    mastery < 10
                );
            });

            // 모든 무기가 숙련도 10 이상이면
            // 남은 포인트를 지급하지 않음
            if (eligibleWeapons.length === 0) {
                undistributedTotal = confiscatedTotal - distributedTotal;
                break;
            }

            // 후보 중 하나를 무작위로 선택
            const selected =
                eligibleWeapons[
                    Math.floor(Math.random() * eligibleWeapons.length)
                ];

            const currentMastery = Number(selected.masteryInput.value);

            // 선택된 무기에 포인트 1점 지급
            selected.masteryInput.value = currentMastery + 1;
            distributedTotal++;

            // 무기별 분배량 기록
            const key = `${selected.owner}|||${selected.weapon}`;

            if (!distributionMap.has(key)) {
                distributionMap.set(key, {
                    owner: selected.owner,
                    weapon: selected.weapon,
                    points: 0
                });
            }

            distributionMap.get(key).points++;
        }

        // ========================================
        // 11. 분배 결과 출력
        // ========================================

        if (distributionMap.size > 0) {
            lastDistributionHTML = [...distributionMap.values()]
                .map(item => `
                    <div class="result-line">
                        <strong>${escapeHTML(item.owner)}</strong>
                        /
                        ${escapeHTML(item.weapon)}
                        : +${item.points}점
                    </div>
                `)
                .join("");
        } else {
            lastDistributionHTML = `
                <div class="result-line">
                    분배된 포인트가 없습니다.
                </div>
            `;
        }

        if (undistributedTotal > 0) {
            lastDistributionHTML += `
                <div class="result-line">
                    미배분 포인트: ${undistributedTotal}점
                    (모든 무기의 숙련도가 10 이상입니다.)
                </div>
            `;
        }

        lastDistributionHTML += `
            <div class="result-line">
                <strong>수거 포인트 합계: ${confiscatedTotal}점</strong>
            </div>
            <div class="result-line">
                실제 분배: ${distributedTotal}점
            </div>
            <div class="result-line">
                미배분: ${undistributedTotal}점
            </div>
        `;

        hasFinalized = true;

        renderResults();
    }

    // ========================================
    // 12. 최종 수거 버튼 연결
    // ========================================

    finalRollBtn.addEventListener(
        "click",
        finalCollectAndDistribute
    );

    // ========================================
    // 13. 초기 화면
    // ========================================

    // 최초 캐릭터 2명 생성
    charactersContainer.appendChild(createCharacter("캐릭터 1"));
    charactersContainer.appendChild(createCharacter("캐릭터 2"));

    // 처음부터 결과 / 분배 결과 제목 표시
    renderResults();
});
