const SlackBot = require('slackbots');
const axios = require('axios');
const fs = require('fs');



const bot = new SlackBot({
    token: 'xoxb-###########################################',
    name: 'SnackBot'
});

let saveObj = {
    previousMasters: ['UDNQC2MRC'],
    currentMaster: ''
}


function saveObject() {
    fs.writeFile('savedObjs.txt',JSON.stringify(saveObj),(err) => {
        console.log(err);
    });
}

function checkObject() {
    let rawData = fs.readFileSync('savedObjs.txt');
    saveObj = JSON.parse(rawData);
    console.log(saveObj);
}

//On start
bot.on('start', async function(){
    checkObject();

    if(saveObj.currentMaster === ''){
        await newSnackMaster();
    }
});

const params = {
    icon_emoji:':pizza:'
}

async function newSnackMaster() {
    const res =  await axios.get('https://slack.com/api/channels.list?token=' + bot.token);
    const users = getUsers(res.data);

    chooseRandom(users)
}
async function chooseRandom(users) {
    const maxNumber = users.length

    const userIndex = Math.floor(Math.random() * Math.floor(maxNumber));

    const sMstr = users[userIndex];

    console.log(sMstr);

    if(saveObj.previousMasters.includes(sMstr)){
        chooseRandom(users)
    }else{
        saveObj.currentMaster = sMstr;
        bot.postMessageToChannel('snacksss',`User: <@${saveObj.currentMaster}> has been selected!`,params);
        saveObj.previousMasters.push(sMstr);
        saveObject();
    }

}

function getUsers(data){
    if(!data.ok) throw Error();
    const channel = data.channels.find(channel=>channel.name  === "snacksss");
    return channel.members;
}


//On error
bot.on('error', (err) => {
    console.log(err);
});

//On @snackbot
bot.on('message', (data) => {
    if(data.type !== 'message'){
    }else if(data.type === 'message'){
        handleMessage(data);
    }else{
    }
});

async function handleMessage(data) {
    if(data.bot_id === 'BF34HUDA9' || data.username === 'SnackBot'){
        console.log("Bot message");
    }
    // Message to Snacksss channel for snack master
    else if(data.text.toLowerCase().includes('snack master') && data.channel === 'CER3HBBLN' && data.text.toLowerCase().includes('who')){
        sendMessage(`snacksss`,`Current Snack Master is: <@${saveObj.currentMaster}>`);
        console.log(data);
    // Direct Message to slackbot for snack master
    }else if(data.text.toLowerCase().includes('snack master') && data.text.toLowerCase().includes('who')){
        try{
            const username = await bot.getUserById(data.user);
            bot.postMessageToUser(`${username.name}`,`Current Snack Master is: <@${saveObj.currentMaster}>`,params)
        }catch (e) {
            console.log(e);
        }}
    // Message from Marcus signifying new master
    else if(data.user === 'UDNQC2MRC' && data.text.toLowerCase().includes('new master')){
        await newSnackMaster()
    }
    else if(data.text.toLowerCase().includes('help') && data.text.includes('@UF2U0CMR8')){
        try{
            const username = await bot.getUserById(data.user);
            bot.postMessageToUser(`${username.name}`,`HELP \nYou can ask who the current Snack Master is by saying - 'Who is the Snack Master?'`,params)
        }catch (e) {
            console.log(e);
        }}
}

function sendMessage(channel,message){
    bot.postMessageToChannel(channel,message,params)
}




