const charactersContainer =
    document.getElementById("characters");

const resultBox =
    document.getElementById("result");

const addCharacterBtn =
    document.getElementById("addCharacterBtn");

const rollBtn =
    document.getElementById("rollBtn");

// --------------------
// 기본 캐릭터 2개 생성
// --------------------

createCharacter(
    "이름",
    [
        { weapon:"", mastery:0 }
    ]
);

createCharacter(
    "이름",
    [
        { weapon:"", mastery:0 }
    ]
);

// --------------------
// 대상 추가
// --------------------

addCharacterBtn.addEventListener(
    "click",
    ()=>{

        createCharacter(
            "이름",
            [
                { weapon:"", mastery:0 }
            ]
        );
    }
);

// --------------------
// 룰렛 실행
// --------------------

rollBtn.addEventListener(
    "click",
    rollRoulette
);

// --------------------
// 캐릭터 생성
// --------------------

function createCharacter(name,weapons){

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

    // 기본 행 생성

    weapons.forEach((weapon,index)=>{

        const row =
            document.createElement("tr");

        if(index===0){

            row.innerHTML = `
                <td
                class="name-cell"
                rowspan="${weapons.length}">

                    <input
                    type="text"
                    value="${name}"
                    class="character-name">

                </td>

                <td>

                    <input
                    type="text"
                    class="weapon-input"
                    value="${weapon.weapon}">

                </td>

                <td>

                    <input
                    type="number"
                    min="0"
                    value="${weapon.mastery}"
                    class="mastery-input">

                </td>
            `;
        }
        else{

            row.innerHTML = `
                <td>

                    <input
                    type="text"
                    class="weapon-input"
                    value="${weapon.weapon}">

                </td>

                <td>

                    <input
                    type="number"
                    min="0"
                    value="${weapon.mastery}"
                    class="mastery-input">

                </td>
            `;
        }

        table.appendChild(row);
    });

    // 무기 추가 버튼

    const addWeaponBtn =
        document.createElement("button");

    addWeaponBtn.textContent =
        "무기 추가";

    addWeaponBtn.className =
        "add-weapon-btn";

    addWeaponBtn.addEventListener(
        "click",
        ()=>{

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>

                    <input
                    type="text"
                    class="weapon-input"
                    placeholder="무기">

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

            // rowspan 증가

            const firstNameCell =
                table.rows[1].cells[0];

            firstNameCell.rowSpan += 1;
        }
    );

    wrapper.appendChild(table);
    wrapper.appendChild(addWeaponBtn);

    charactersContainer.appendChild(wrapper);
}

// --------------------
// 데이터 가져오기
// --------------------

function getCharacterData(table){

    const rows =
        [...table.rows].slice(1);

    const name =
        rows[0]
        .cells[0]
        .querySelector("input")
        .value;

    const weapons = [];

    rows.forEach((row,index)=>{

        let weaponCell;
        let masteryCell;

        if(index===0){

            weaponCell =
                row.cells[1];

            masteryCell =
                row.cells[2];
        }
        else{

            weaponCell =
                row.cells[0];

            masteryCell =
                row.cells[1];
        }

        const weapon =
            weaponCell
            .querySelector("input")
            .value;

        const mastery =
            parseInt(
                masteryCell
                .querySelector("input")
                .value
            ) || 0;

        weapons.push({
            weapon,
            mastery
        });
    });

    return {
        name,
        weapons
    };
}

// --------------------
// 룰렛 시스템
// --------------------

function rollRoulette(){

    resultBox.innerHTML = "";

    const tables =
        document.querySelectorAll(
            ".character-table"
        );

    const allCharacters = [];

    let confiscatedTotal = 0;

    let stealResultsHTML = "";

    // --------------------
    // 숙련도 몰수
    // --------------------

    tables.forEach(table=>{

        const character =
            getCharacterData(table);

        allCharacters.push(character);

        const availableWeapons =
            character.weapons.filter(
                w =>
                    w.weapon.trim() !== ""
                    &&
                    w.mastery > 0
            );

        // 몰수 불가능

        if(availableWeapons.length === 0){

            stealResultsHTML += `
                <div class="result-line">

                    ${character.name}
                    :
                    몰수 불가

                </div>
            `;

            return;
        }

        // 랜덤 무기 선택

        const selectedWeapon =
            availableWeapons[
                Math.floor(
                    Math.random()
                    * availableWeapons.length
                )
            ];

        selectedWeapon.mastery -= 1;

        confiscatedTotal += 1;

        stealResultsHTML += `
            <div class="result-line">

                ${character.name}
                :
                <span class="highlight">

                    ${selectedWeapon.weapon}
                    -1

                </span>

            </div>
        `;
    });

    // --------------------
    // 전체 무기 풀 생성
    // --------------------

    const allWeapons = [];

    allCharacters.forEach(character=>{

        character.weapons.forEach(weapon=>{

            if(
                weapon.weapon.trim() !== ""
            ){

                allWeapons.push({
                    owner:character.name,
                    weapon:weapon
                });
            }
        });
    });

    // --------------------
    // 재분배
    // --------------------

    let distributeHTML = "";

    const distributionResults = [];

    for(
        let i = 0;
        i < confiscatedTotal;
        i++
    ){

        // 받을 후보 랜덤

        const possibleReceivers =
            allWeapons.filter(
                ()=>Math.random() < 0.5
            );

        // 아무도 못 받음

        if(possibleReceivers.length === 0){

            distributionResults.push({
                owner:"해당 없음",
                weapon:""
            });

            continue;
        }

        // 랜덤 선택

        const selected =
            possibleReceivers[
                Math.floor(
                    Math.random()
                    * possibleReceivers.length
                )
            ];

        selected.weapon.mastery += 1;

        distributionResults.push({
            owner:selected.owner,
            weapon:selected.weapon.weapon
        });
    }

    // --------------------
    // 분배 결과 HTML
    // --------------------

    distributionResults.forEach(result=>{

        if(result.owner === "해당 없음"){

            distributeHTML += `
                <div class="result-line">

                    해당 없음

                </div>
            `;
        }
        else{

            distributeHTML += `
                <div class="result-line">

                    ${result.owner}
                    :
                    <span class="highlight">

                        ${result.weapon}
                        +1

                    </span>

                </div>
            `;
        }
    });

    // --------------------
    // 최종 숙련도
    // --------------------

    let finalStatsHTML = "";

    allCharacters.forEach(character=>{

        finalStatsHTML += `
            <div class="result-line">

                <strong>

                    ${character.name}

                </strong>

            </div>
        `;

        character.weapons.forEach(weapon=>{

            if(
                weapon.weapon.trim() !== ""
            ){

                finalStatsHTML += `
                    <div class="result-line">

                        └
                        ${weapon.weapon}
                        :
                        <span class="highlight">

                            ${weapon.mastery}

                        </span>

                    </div>
                `;
            }
        });

        finalStatsHTML += `<br>`;
    });

    // --------------------
    // 출력
    // --------------------

    resultBox.innerHTML = `

        <div class="result-section">

            <div class="result-title">

                결과

            </div>

            ${stealResultsHTML}

        </div>

        <div class="result-section">

            <div class="result-title">

                분배 결과

            </div>

            ${distributeHTML}

        </div>

        <div class="result-section">

            <div class="result-title">

                최종 숙련도

            </div>

            ${finalStatsHTML}

        </div>
    `;
}
