import { CommandHandler } from "./_lib/command_handler";
import { AcmApi } from "./acm_api";
import { ConfigManager } from "./util/config_manager";
import { AcmHud } from "./util/hud";
const openHudCommand = {
    id: 'acm:menu',
    description: 'A.C.M Hud Menu',
    callback: ((event) => {
        new AcmHud(event.player);
    })
};
CommandHandler.initialize([openHudCommand]);
export const ACM = {
    authorId: 'vxl',
    packId: 'acm',
    iconPath: 'voxel/vxl_acm/pack_icon',
    addonSettings: [
        {
            label: 'use_tag',
            defaultValue: false
        },
        {
            label: 'tag_key',
            placeholder: 'tag_key_placeholder'
        }
    ]
};
AcmApi.generateAddonProfile(ACM);
new ConfigManager();