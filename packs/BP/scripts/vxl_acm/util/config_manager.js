import { world } from "@minecraft/server";
import { RawText } from "../_lib/spec/_module/util/raw_text";
export class ConfigManager {
    constructor() {
        if (!ConfigManager.initialized) {
            this.processSubscriptions();
            ConfigManager.initialized = true;
        }
        else
            throw Error('ConfigManager already initialized.');
    }
    processSubscriptions() {
        world.afterEvents.worldInitialize.subscribe((() => {
            this.loadWorldData();
        }));
    }
    loadWorldData() {
        const configObjectives = [];
        const scoreboardObjectives = world.scoreboard.getObjectives();
        //Get all config property ids
        scoreboardObjectives.forEach((objective) => {
            if (objective.displayName.startsWith('ACM:') && !objective.displayName.startsWith('ACM_SET:'))
                configObjectives.push(objective);
        });
        //Convert string data to config object and push to indexMap.
        configObjectives.forEach((objective) => {
            let rawData = undefined;
            objective.getParticipants().forEach((i) => {
                if (objective.getScore(i) === 0) {
                    rawData = i.displayName;
                }
            });
            if (!rawData)
                throw Error('Error parsing addon data.');
            const data = JSON.parse(rawData);
            ConfigManager.registeredAddonProfiles.set(objective.displayName.replace('ACM:', ''), data);
        });
    }
    static deleteAddonFromIndex(profile) {
        const profileKey = `${profile.authorId}_${profile.packId}`;
        ConfigManager.registeredAddonProfiles.delete(profileKey);
        const savedData = world.scoreboard.getObjective(`ACM:${profileKey}`);
        if (savedData) {
            world.scoreboard.removeObjective(`ACM:${profileKey}`);
            world.sendMessage(RawText.TRANSLATE('acm.lang.addon_uninstalled'));
        }
    }
    static getSettingType(setting) {
        if ('placeholder' in setting) {
            return 'text_field';
        }
        else if ('options' in setting) {
            return 'dropdown';
        }
        else if ('min' in setting && 'max' in setting && 'step' in setting) {
            return 'slider';
        }
        else if ('defaultValue' in setting && typeof setting.defaultValue === 'boolean') {
            return 'toggle';
        }
        throw new Error('Unknown setting type');
    }
}
ConfigManager.initialized = false;
ConfigManager.registeredAddonProfiles = new Map();
