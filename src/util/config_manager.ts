import { ScoreboardObjective, system, world } from "@minecraft/server";
import { AcmApi, AddonConfiguration, AddonSetting } from "../acm_api";
import { RawText } from "../_lib/spec/_module/util/raw_text";
export class ConfigManager {
    private static initialized: boolean = false;
    public static registeredAddonProfiles: Map<string, AddonConfiguration> = new Map();
    constructor() {
        if (!ConfigManager.initialized) {
            this.processSubscriptions();
            ConfigManager.initialized = true;
        }
        else
            throw Error('ConfigManager already initialized.');
    }
    private processSubscriptions(): void {
        world.afterEvents.worldInitialize.subscribe((() => {
            this.deleteLogs();
            this.loadWorldData();
        }));
    }
    private loadWorldData(): void {
        const configObjectives: ScoreboardObjective[] = [];
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
            AcmApi.pushLog(data, `§2Loaded Successfully§r`)
        });
    }
    private deleteLogs(){
        const db: ScoreboardObjective | undefined = world.scoreboard.getObjective('acm:logs');
        if (db) world.scoreboard.removeObjective('acm:logs');
    }
    public static deleteAddonFromIndex(profile: AddonConfiguration): void {
        const profileKey = `${profile.authorId}_${profile.packId}`;
        ConfigManager.registeredAddonProfiles.delete(profileKey);
        const savedData = world.scoreboard.getObjective(`ACM:${profileKey}`);
        if (savedData) {
            world.scoreboard.removeObjective(`ACM:${profileKey}`);
            world.sendMessage(RawText.TRANSLATE('acm.lang.addon_uninstalled'));
        }
    }
    public static getSettingType(setting: AddonSetting): string {
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
