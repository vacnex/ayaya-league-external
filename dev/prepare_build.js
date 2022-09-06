const fs = require('fs');
const path = require('path');
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
const packageJson = path.join(__dirname, '../package.json');
const CreateRandomAppName = length => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// let nameLen = 10;
// rl.setPrompt('Length of random app name (enter to use 10): ');
// rl.prompt();
// rl.on('line', ip => {
//   if (isNaN(ip)) {
//     rl.prompt();
//   } else {
//     nameLen = parseInt(ip)
//     rl.close();
//   }
// });
// process.stdin.on("keypress", (letter, key) => {
//   if (key.name === 'return') {
//     console.log('Creating random app name');
//     let settingData = JSON.parse(fs.readFileSync(packageJson));
//     settingData.name = CreateRandomAppName(nameLen ? nameLen : 10);
//     fs.writeFileSync(packageJson, JSON.stringify(settingData, null, '\t'));
//     console.log(`New app name is ${settingData.name}`);
//     rl.close();
//   }
// });
console.log('Creating random app name');
let settingData = JSON.parse(fs.readFileSync(packageJson));
settingData.name = CreateRandomAppName(10);
fs.writeFileSync(packageJson, JSON.stringify(settingData, null, '\t'));
console.log(`New app name is ${settingData.name}`);
rl.close();