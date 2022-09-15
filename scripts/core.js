/// <reference path="../src/typings/ScriptTypings.d.ts" />


function setup() {
  console.log('Core loaded');
  return [
    { title: 'AyayaCore' },
    {
      group: [
        { id: 'show.player.range', type: 'toggle', text: 'Show Player Range', style: 1, value: true },
        { id: 'show.discord', type: 'toggle', text: 'Show Discord', style: 1, value: false },
        { id: 'test.slider', type: 'slider', text: 'Test slider', style: 1, value: 10, max: 100, min: 0, size: 1 },
        { id: 'test.text', type: 'text', text: 'Test text', value: 'Something' },
        { id: 'test.radio', type: 'radio', text: 'Test radio', value: 'Option A', options: ['Option A', 'Option B', 'Option C'] },
        { id: 'test.key', type: 'key', text: 'Test key', value: getVKEY("SPACEBAR") },
      ],
    },
    { desc: 'Ayaya core is a builtin script and it is NOT required for AyayaLeague to work' }
  ];
}

function onTick(getSettings) {

}

function onDraw(getSettings) {
  const showDiscord = getSettings('show.discord');
  const showPlayerRange = getSettings('show.player.range');

  if (showPlayerRange) manager.prepareForLoop();

  if (showDiscord) ctx.textAt('Join the AyayaLeague discord: https://discord.gg/qYy8Qz4Cr5', 20, 35, 26, 255);

  if (showPlayerRange) {
    const me = manager.me;
    ctx.circleAtPoint3D(me.gamePos, 50, me.range, 2);
  }
}


async function onTick(settings) {
}

function onDraw(getSetting) {
  const showDiscord = getSetting('show.discord');
  if (showDiscord) ctx.textAt('Join the AyayaLeague discord: https://discord.gg/qYy8Qz4Cr5', 20, 35, 26, 255);
}


module.exports = { setup, onTick, onDraw };


