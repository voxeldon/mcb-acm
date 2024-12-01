import { world } from "@minecraft/server";
import { AcmApi } from "../acm_api";
import { ConfigManager } from "./config_manager";
import { ActionForm, ModalForm } from "../_lib/spec/_module/util/form";
import { RawText } from "../_lib/spec/_module/util/raw_text";
export class AcmHud {
    constructor(player) {
        this.addonProfiles = ConfigManager.registeredAddonProfiles;
        this.player = player;
        this.showHome();
    }
    generateAddonButtons(form) {
        this.addonProfiles.forEach((profile) => {
            let iconPath = 'textures/voxel/vxl_acm/icons/missing';
            if (profile.iconPath)
                iconPath = `textures/${profile.iconPath}`;
            form.addButton(`${profile.authorId}_${profile.packId}`, RawText.TRANSLATE(`acm.${profile.authorId}_${profile.packId}.pack_name`), iconPath);
        });
    }
    actionFormError(form) {
        form.setBody(RawText.TRANSLATE('acm.lang.load_error'));
        form.addButton('return', RawText.TRANSLATE(`acm.lang.return`), 'textures/voxel/vxl_acm/icons/return');
    }
    showHome() {
        const form = new ActionForm();
        form.setTitle(RawText.TRANSLATE('acm.lang.header'));
        form.setBody(RawText.MESSAGE(RawText.TRANSLATE(`acm.lang.registered_addons`), RawText.TEXT(` : ${this.addonProfiles.size}`)));
        if (this.addonProfiles.size > 0)
            this.generateAddonButtons(form);
        else
            this.actionFormError(form);
        form.showForm(this.player).then((data) => {
            if (data.indexId) {
                const addonProfile = this.addonProfiles.get(data.indexId);
                if (addonProfile)
                    this.showAddonProfile(addonProfile);
            }
        });
    }
    showAddonProfile(profile) {
        const form = new ActionForm();
        const profileId = `${profile.authorId}_${profile.packId}`;
        form.setTitle(RawText.TRANSLATE(`acm.${profileId}.pack_name`));
        form.setBody(RawText.TRANSLATE(`acm.${profileId}.description`));
        if (profile.extension) {
            let iconPath = 'textures/voxel/vxl_acm/icons/missing';
            let buttonText = RawText.TRANSLATE(`acm.lang.extension`);
            if (profile.extension.iconPath)
                iconPath = `textures/${profile.extension.iconPath}`;
            if (profile.extension.langKey)
                buttonText = RawText.TRANSLATE(`acm.${profileId}.${profile.extension.langKey}`);
            form.addButton('extension', buttonText, iconPath);
        }
        if (profile.guideKeys) {
            form.addButton('guide', RawText.TRANSLATE(`acm.lang.guide`), 'textures/voxel/vxl_acm/icons/question');
        }
        if (profile.addonSettings) {
            form.addButton('settings', RawText.TRANSLATE(`acm.lang.settings`), 'textures/voxel/vxl_acm/icons/exclaim');
        }
        if (profileId !== 'vxl_acm') {
            form.addButton('uninstall', RawText.TRANSLATE(`acm.lang.uninstall`), 'textures/voxel/vxl_acm/icons/missing');
        }
        form.addButton('return', RawText.TRANSLATE(`acm.lang.return`), 'textures/voxel/vxl_acm/icons/return');
        form.showForm(this.player).then((data) => {
            if (data.indexId) {
                const saveState = AcmApi.loadAddonData({ authorId: 'vxl', packId: 'acm' });
                const useTag = saveState?.get('use_tag') || undefined;
                const tagId = saveState?.get('tag_key') || undefined;
                if (data.indexId === 'return')
                    this.showHome();
                if (data.indexId === 'uninstall')
                    this.uninstallAddonProfile(profile);
                if (data.indexId === 'guide')
                    this.showAddonGuide(profile);
                if (data.indexId === 'settings') {
                    const hasTag = this.player.hasTag(tagId || '');
                    if (!useTag) {
                        this.showAddonSettings(profile);
                    }
                    else if (useTag && tagId && hasTag) {
                        this.showAddonSettings(profile);
                    }
                    else if (useTag && tagId && !hasTag) {
                        this.player.sendMessage(RawText.TRANSLATE('acm.lang.privilege'));
                    }
                }
                if (data.indexId === 'extension' && profile?.extension?.eventId) {
                    this.player.runCommand(`scriptevent acm:${profileId}.${profile.extension.eventId}`);
                }
            }
        });
    }
    showAddonGuide(profile) {
        const form = new ActionForm();
        const profileId = `${profile.authorId}_${profile.packId}`;
        form.setTitle(RawText.TRANSLATE(`acm.${profileId}.pack_name`));
        if (profile.guideKeys) {
            const parsedMessages = this.parseGuideKeys(profileId, profile.guideKeys);
            form.setBody(RawText.MESSAGE(...parsedMessages));
        }
        else {
            form.setBody(RawText.TRANSLATE('acm.lang.load_error'));
        }
        form.addButton('return', RawText.TRANSLATE(`acm.lang.return`), 'textures/voxel/vxl_acm/icons/return');
        form.showForm(this.player).then((data) => {
            if (data.indexId)
                this.showAddonProfile(profile);
        });
    }
    parseGuideKeys(profileId, guideKeys) {
        const messages = [];
        guideKeys.forEach((key) => messages.push(RawText.MESSAGE(RawText.TRANSLATE(`acm.${profileId}.${key}`), RawText.TEXT('\n\n'))));
        return messages;
    }
    uninstallAddonProfile(profile) {
        const form = new ActionForm();
        form.setTitle(RawText.TRANSLATE(`acm.lang.uninstall`));
        form.setBody(RawText.MESSAGE(RawText.TRANSLATE(`acm.lang.uninstall_warn`), RawText.TRANSLATE(`acm.${profile.authorId}_${profile.packId}.pack_name`), RawText.TEXT(`?\n\n`), RawText.TRANSLATE('acm.lang.uninstall_warn2')));
        form.addButton('yes', RawText.TRANSLATE(`acm.lang.yes`), 'textures/voxel/vxl_acm/icons/exclaim');
        form.addButton('return', RawText.TRANSLATE(`acm.lang.no`), 'textures/voxel/vxl_acm/icons/return');
        form.showForm(this.player).then((data) => {
            if (data.indexId) {
                if (data.indexId === 'return')
                    this.showHome();
                if (data.indexId === 'yes') {
                    ConfigManager.deleteAddonFromIndex(profile);
                }
            }
        });
    }
    showAddonSettings(profile) {
        const form = new ModalForm();
        const profileId = `${profile.authorId}_${profile.packId}`;
        const saveState = AcmApi.loadAddonData(profile);
        form.setTitle(RawText.MESSAGE(RawText.TRANSLATE(`acm.${profileId}.pack_name`), RawText.TEXT(' '), RawText.TRANSLATE(`acm.lang.settings`)));
        profile.addonSettings?.forEach((setting) => {
            const settingType = ConfigManager.getSettingType(setting);
            if (settingType === 'dropdown') {
                const dropdown = setting;
                const defaultValue = saveState?.get(dropdown.label);
                form.addDropdown(dropdown.label, RawText.TRANSLATE(`acm.${profileId}.${dropdown.label}`), dropdown.options, defaultValue ?? dropdown.defaultValueIndex);
            }
            else if (settingType === 'slider') {
                const slider = setting;
                const defaultValue = saveState?.get(slider.label);
                form.addSlider(slider.label, RawText.TRANSLATE(`acm.${profileId}.${slider.label}`), slider.min, slider.max, slider.step, defaultValue ?? slider.defaultValue);
            }
            else if (settingType === 'text_field') {
                const textField = setting;
                const defaultValue = saveState?.get(textField.label);
                form.addTextField(textField.label, RawText.TRANSLATE(`acm.${profileId}.${textField.label}`), RawText.TRANSLATE(`acm.${profileId}.${textField.placeholder}`), defaultValue ?? textField.defaultValue);
            }
            else if (settingType === 'toggle') {
                const toggle = setting;
                const defaultValue = saveState?.get(toggle.label);
                form.addToggle(toggle.label, RawText.TRANSLATE(`acm.${profileId}.${toggle.label}`), defaultValue ?? toggle.defaultValue);
            }
        });
        form.showForm(this.player).then((data) => {
            if (data.indexMap) {
                const obj = Object.fromEntries(data.indexMap.entries());
                const dataProfileId = `ACM:${profile.authorId}_${profile.packId}`;
                const db = world.scoreboard.getObjective(dataProfileId);
                if (db) {
                    db.getParticipants().forEach((i) => {
                        if (db.getScore(i) === 1) {
                            db.removeParticipant(i);
                        }
                        db.setScore(JSON.stringify(obj), 1);
                    });
                }
                this.showAddonProfile(profile);
                this.player.runCommand(`scriptevent acm:${profileId} ${JSON.stringify(obj)}`);
            }
        });
    }
}
