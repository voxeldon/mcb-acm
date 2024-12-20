import { Player, RawMessage, world } from "@minecraft/server";
import { AcmApi, AddonConfiguration, AddonExtension, DropdownSetting, SliderSetting, TextFieldSetting, ToggleSetting } from "../acm_api";
import { ConfigManager } from "./config_manager";
import { ActionForm, ModalForm, ModalFormFormReturnData } from "../_lib/spec/_module/util/form";
import { RawText } from "../_lib/spec/_module/util/raw_text";
export class AcmHud {
    private addonProfiles: Map<string, AddonConfiguration>;
    private player: Player;
    constructor(player: Player) {
        this.addonProfiles = ConfigManager.registeredAddonProfiles;
        this.player = player;
        this.showHome();
    }
    generateAddonButtons(form: ActionForm): void {
        this.addonProfiles.forEach((profile) => {
            let iconPath = 'textures/voxel/vxl_acm/icons/missing';
            if (profile.iconPath) iconPath = `textures/${profile.iconPath}`;
            form.addButton(`${profile.authorId}_${profile.packId}`, RawText.TRANSLATE(`acm.${profile.authorId}_${profile.packId}.pack_name`), iconPath);
        });
    }
    actionFormError(form: ActionForm): void {
        form.setBody(RawText.TRANSLATE('acm.lang.load_error'));
        form.addButton('return', RawText.TRANSLATE(`acm.lang.return`), 'textures/voxel/vxl_acm/icons/return');
    }
    showHome(): void {
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
    showAddonProfile(profile: AddonConfiguration): void {
        const form = new ActionForm();
        const profileId = `${profile.authorId}_${profile.packId}`;
        form.setTitle(RawText.TRANSLATE(`acm.${profileId}.pack_name`));
        form.setBody(RawText.TRANSLATE(`acm.${profileId}.description`));
        const extensionIndex: Map<string, AddonExtension> = new Map<string, AddonExtension>();
        if (profile.extension) {
            let iconPath = 'textures/voxel/vxl_acm/icons/missing';
            let buttonText = RawText.TRANSLATE(`acm.lang.extension`);
            const extensions = Array.isArray(profile.extension) ? profile.extension : [profile.extension];
            for (const ext of extensions) {
                if (ext.iconPath)
                    iconPath = `textures/${ext.iconPath}`;
                if (ext.langKey)
                    buttonText = RawText.TRANSLATE(`acm.${profileId}.${ext.langKey}`);
                form.addButton(`${profile.authorId}_${profile.packId}_${ext.eventId}`, buttonText, iconPath);
                extensionIndex.set(`${profile.authorId}_${profile.packId}_${ext.eventId}`, ext);
            }
            
        }
        if (profile.guideKeys) {
            form.addButton('guide', RawText.TRANSLATE(`acm.lang.guide`), 'textures/voxel/vxl_acm/icons/question');
        }
        if (profile.addonSettings) {
            form.addButton('settings', RawText.TRANSLATE(`acm.lang.settings`), 'textures/voxel/vxl_acm/icons/exclaim');
        }
        if (profileId !== 'vxl_acm') {
            form.addButton('uninstall', RawText.TRANSLATE(`acm.lang.uninstall`), 'textures/voxel/vxl_acm/icons/uninstall');
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
                const extension: AddonExtension | undefined = extensionIndex.get(data.indexId);
                if (extension && extension.eventId) {
                    this.player.runCommand(`scriptevent acm:${profileId}.${extension.eventId}`);
                }
            }
        });
    }
    showAddonGuide(profile: AddonConfiguration): void {
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
    parseGuideKeys(profileId: string, guideKeys: string[]): RawMessage[] {
        const messages: RawMessage[] = [];
        guideKeys.forEach((key) => messages.push(RawText.MESSAGE(RawText.TRANSLATE(`acm.${profileId}.${key}`), RawText.TEXT('\n\n'))));
        return messages;
    }
    uninstallAddonProfile(profile: AddonConfiguration): void {
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
    showAddonSettings(profile: AddonConfiguration): void {
        const form = new ModalForm();
        const profileId = `${profile.authorId}_${profile.packId}`;
        const saveState = AcmApi.loadAddonData(profile);
        form.setTitle(RawText.MESSAGE(RawText.TRANSLATE(`acm.${profileId}.pack_name`), RawText.TEXT(' '), RawText.TRANSLATE(`acm.lang.settings`)));
        profile.addonSettings?.forEach((setting) => {
            const settingType = ConfigManager.getSettingType(setting);
            if (settingType === 'dropdown') {
                const dropdown = setting as DropdownSetting;
                const defaultValue = saveState?.get(dropdown.label);
                form.addDropdown(dropdown.label, RawText.TRANSLATE(`acm.${profileId}.${dropdown.label}`), dropdown.options, defaultValue ?? dropdown.defaultValueIndex);
            }
            else if (settingType === 'slider') {
                const slider = setting as SliderSetting;
                const defaultValue = saveState?.get(slider.label);
                form.addSlider(slider.label, RawText.TRANSLATE(`acm.${profileId}.${slider.label}`), slider.min, slider.max, slider.step, defaultValue ?? slider.defaultValue);
            }
            else if (settingType === 'text_field') {
                const textField = setting as TextFieldSetting;
                const defaultValue = saveState?.get(textField.label);
                form.addTextField(textField.label, RawText.TRANSLATE(`acm.${profileId}.${textField.label}`), RawText.TRANSLATE(`acm.${profileId}.${textField.placeholder}`), defaultValue ?? textField.defaultValue);
            }
            else if (settingType === 'toggle') {
                const toggle = setting as ToggleSetting;
                const defaultValue = saveState?.get(toggle.label);
                form.addToggle(toggle.label, RawText.TRANSLATE(`acm.${profileId}.${toggle.label}`), defaultValue ?? toggle.defaultValue);
            }
        });
        form.showForm(this.player).then((data: ModalFormFormReturnData) => {
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
                this.player.runCommand(`scriptevent acm:${profileId} ${JSON.stringify(obj)}`);
            }
            this.showAddonProfile(profile);
        });
    }
}
