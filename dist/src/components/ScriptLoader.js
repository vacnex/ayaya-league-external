"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Settings_1 = require("../overlay/Settings");
const path = require("path");
const fs = require("fs");
class ScriptLoader {
    constructor() {
        this.userScripts = [];
    }
    getUserScripts() {
        return this.userScripts;
    }
    publishToScript(fName, settings, ...args) {
        for (const userScript of this.userScripts) {
            try {
                if (userScript[fName]) {
                    const setting = settings.find(e => e.name == userScript._scriptname);
                    userScript[fName](...args, (setting || { data: [] }).data);
                }
            }
            catch (ex) {
                console.error(`Error on script ${userScript._modulename} function ${fName}\n`, ex, '\n');
            }
        }
    }
    loadUserScripts() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, Settings_1.loadSettingsFromFile)();
            const basePath = path.join(__dirname, '../../../scripts/userscripts');
            const userScriptsPaths = fs.readdirSync(basePath);
            for (const scriptPath of userScriptsPaths) {
                try {
                    if (scriptPath.endsWith('.ts')) {
                        console.log('Skipped', scriptPath, ' - You need to compile it to js');
                        continue;
                    }
                    const p = path.join(basePath, scriptPath);
                    const imp = yield require(p);
                    this.userScripts.push(Object.assign(Object.assign({}, imp), { _modulename: p, _scriptname: scriptPath }));
                }
                catch (ex) {
                    console.error('Error loading', scriptPath, ex);
                }
            }
            const scriptSettings = [];
            const loadedSettings = (0, Settings_1.getSettings)();
            for (const script of this.userScripts) {
                try {
                    if (script.setup) {
                        const setupResult = yield script.setup(script._modulename, script._scriptname);
                        if (!setupResult)
                            continue;
                        const setting = loadedSettings.find(s => s.name == script._scriptname);
                        const data = setupResult.map(e => {
                            if (setting) {
                                const s = setting.data.find(k => k.text == e.text);
                                if (s && s.value) {
                                    e.value = s.value;
                                    e.default = undefined;
                                    return e;
                                }
                            }
                            e.value = e.default;
                            e.default = undefined;
                            return e;
                        });
                        scriptSettings.push({ name: script._scriptname, data });
                    }
                }
                catch (ex) {
                    console.error('Error on script', script._modulename, 'function setup\n', ex);
                }
            }
            (0, Settings_1.setSettings)(scriptSettings);
            console.log('Loaded', this.userScripts.length, 'user scripts.');
        });
    }
    unloadUserScripts() {
        for (const script of this.userScripts) {
            delete require.cache[script._modulename];
        }
        this.userScripts.length = 0;
    }
}
const instance = new ScriptLoader();
exports.default = instance;