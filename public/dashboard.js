document.addEventListener('DOMContentLoaded', () => {
    const stage = window.location.href.split('/').pop();
    const socket = new WebSocket("wss://sargalayam.onrender.com:3000");
    const programList = document.getElementById('program-list');
    const selectedProgramDisplay = document.getElementById('selected-program');
    const tvBrowserContent = document.getElementById('tv-browser-content');

    console.log(stage);
    let stageId = 1;
    (stage === 'stage2') ? stageId = 2 : stageId;
    (stage === 'stage3') ? stageId = 3 : stageId;
    (stage === 'stage4') ? stageId = 4 : stageId;

    fetch('/programs-by-stage/'+stageId)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayPrograms(data);
            addEventListeners();
        })
        .catch(error => console.error('Error loading programs:', error));

    function displayPrograms(programs) {
        const stageDiv = createStageDiv('Stage', programs);
        // const stage2Div = createStageDiv('Stage 2', programs);
        // const stage3Div = createStageDiv('Stage 3', programs);
        // const stage4Div = createStageDiv('Stage 4', programs);

        programList.appendChild(stageDiv);
        // programList.appendChild(stage2Div);
        // programList.appendChild(stage3Div);
        // programList.appendChild(stage4Div);
    }

    function createStageDiv(title, programs) {
        const div = document.createElement('div');
        div.className = 'stage-div';

        const heading = document.createElement('h3');
        heading.textContent = title +' '+stageId;
        div.appendChild(heading);

        const ul = document.createElement('ul');
        console.log(programs);
        programs.forEach(program => {
            if (program.stage === stageId) {
                const li = document.createElement('li');
                li.innerHTML = ` 
                    <label id="label-${program._id}" class="${(program.status === 2)? 'strike' : ''}">
                        <span class="time">${program.time}</span>
                        <span class="category">${program.category}</span>
                        <span class="title"><input type="radio" class="p-input" name="${title.toLowerCase()}-programs" value="${program._id}" id="program-${program._id}">
                        ${program.name}</span>
                        <span class="status"><input type="checkbox" class="p-checkbox" name="${title.toLowerCase()}-programs" value="${program.status}" id="program-status-${program._id}">
                        <em class="state">${(program.status === 2)? 'Completed' : 'Not Started'}</em></span>
                    </label>`;
                //li.addEventListener('click', () => selectProgram(program, title, programs));
                const radioButton = li.querySelector(`#program-${program._id}`);
                radioButton.addEventListener('click', () => selectProgram(program, title, programs));
                const checkBox = li.querySelector(`#program-status-${program._id}`);
                checkBox.addEventListener('click', () => updateStatus(program, programs))
                ul.appendChild(li);
            }
        });
        div.appendChild(ul);

        return div;
    }

    function updateStatus(program, programs) {
        console.log(program);
        fetch('/update-status/'+program._id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(`updated status ${program.name}:`, data);
                document.getElementById(`label-${program._id}`).classList.add('strike');
                const label = document.getElementById(`label-${program._id}`);
                label.getElementsByClassName('state')[0].innerText = 'Completed';
            })
            .catch(error => {
                console.error(`Error updating TV Browser for ${program.name}:`, error);
                alert(`Failed to update TV Browser: ${error.message}`);
            });
    }

    function selectProgram(program, stageTitle, programs) {
        selectedProgramDisplay.textContent = `${stageTitle} Selected Program: ${program.name}`;
        //console.log(program);
        const label = document.getElementById(`label-${program._id}`);
        label.getElementsByClassName('state')[0].innerText = 'Started';
        updateTVBrowser(program, stageTitle, programs);
    }

    function updateTVBrowser(program, stageTitle, programs) {
        console.log(program._id);
        fetch('/tv-browser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                programId: program._id,
                programName: program.name,
                category: program.category,
                stageTitle: stageTitle+' '+stageId,
                programs: programs
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(`TV Browser updated for ${stageTitle}:`, data);
                renderTVBrowser(data);
                const label = document.getElementById(`label-${program._id}`);
                label.getElementsByClassName('state')[0].innerText = 'Started';
            })
            .catch(error => {
                console.error(`Error updating TV Browser for ${stageTitle}:`, error);
                alert(`Failed to update TV Browser: ${error.message}`);
            });
    }

    function renderTVBrowser(program) {
        // tvBrowserContent.innerHTML = `
        //     <div class="program-item">
        //         <img src="${program.channelIcon}" alt="${program.name}" class="channel-icon">
        //         <span class="program-name">${program.name}</span>
        //     </div>
        // `;
    }

    function addEventListeners() {
        const stageRadios = Array.from(document.querySelectorAll('[name="program-stage"]'));
        stageRadios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                const selectedStage = event.target.value;
                localStorage.setItem('selectedStage', selectedStage);
                updateProgramList(selectedStage);
            });
        });
    }

    function updateProgramList(selectedStage) {
        const programs = JSON.parse(localStorage.getItem('programs')) || {};
        const stagePrograms = programs[selectedStage] || [];
        programList.innerHTML = '';
        displayPrograms({ [selectedStage]: stagePrograms });
    }

    socket.onopen = () => console.log('WebSocket connection established');

    socket.onmessage = (event) => {
        const messageData = JSON.parse(event.data);

        if (messageData.type === 'tv-screen-update') {
            console.log(`TV Screen Updated with data:`, messageData.data);
        } else {
            console.log(`Unknown message type received from server:`, messageData.type);
        }
    };

    socket.onclose = () => console.log('WebSocket connection closed');
});
