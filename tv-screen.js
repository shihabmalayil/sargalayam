// tv-screen.js

let globalTvScreenData = {
    stage1: {},
    stage2: {}
};

function updateGlobalTvScreenData(data) {
    console.log(data);
    const { programId, stageTitle } = data;

    // Determine which stage to update
    const stage = stageTitle.toLowerCase().replace(/\s+/g, '') === 'stage1' ? 'stage1' : 'stage2';

    // Update the program in the global data
    globalTvScreenData[stage][programId] = {
        name: data.programName,
        channelIcon: data.channelIcon
    };

    console.log(`Updated global TV screen data for ${stageTitle}:`, globalTvScreenData);
}

function getUpdatedTvScreenData() {
    const tvScreenData = {
        stage1: {},
        stage2: {}
    };

    // Populate the TV screen data based on the global data
    Object.keys(globalTvScreenData.stage1).forEach(programId => {
        tvScreenData.stage1[programId] = {
            name: globalTvScreenData.stage1[programId].name,
            channelIcon: globalTvScreenData.stage1[programId].channelIcon
        };
    });

    Object.keys(globalTvScreenData.stage2).forEach(programId => {
        tvScreenData.stage2[programId] = {
            name: globalTvScreenData.stage2[programId].name,
            channelIcon: globalTvScreenData.stage2[programId].channelIcon
        };
    });

    return tvScreenData;
}

module.exports = { updateGlobalTvScreenData, getUpdatedTvScreenData };
