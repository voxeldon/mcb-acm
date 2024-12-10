import { Block, ItemUseAfterEvent, Player, world } from "@minecraft/server";
import { CommandRanEvent, CommandHandler } from "./_lib/command_handler";
import { AcmApi, AcmEventData, AcmEventType, AddonConfiguration } from "./acm_api";
import { ConfigManager } from "./util/config_manager";
import { AcmHud } from "./util/hud";
import { WelcomeHud } from "./util/welcome_hud";
import { AcmLogHud } from "./util/log_hud";

world.afterEvents.itemUse.subscribe((event: ItemUseAfterEvent)=>{
    if (event.itemStack.typeId === 'vxl_acm:tool') new AcmHud(event.source);
})

const openHudCommand = {
    id: 'menu',
    description: 'A.C.M Hud Menu',
    callback: ((event: CommandRanEvent) => {
        new AcmHud(event.player);
    })
};

export const ACM: AddonConfiguration = {
    authorId: 'vxl',
    packId: 'acm',
    iconPath:'voxel/vxl_acm/pack_icon',
    addonSettings: [
        {
            label: 'use_tag',
            defaultValue: false
        },
        {
            label: 'tag_key',
            placeholder: 'tag_key_placeholder'
        }
    ],
    extension: {
        eventId: 'acm_logs',
        iconPath:'voxel/vxl_acm/icons/logs',
        langKey: 'logs'
    }
};
new WelcomeHud();
new ConfigManager();
AcmApi.generateAddonProfile(ACM);
CommandHandler.initialize('acm', [openHudCommand]);

AcmApi.subscribe((event: AcmEventData)=>{
    if (event.type === AcmEventType.ExtensionTriggered) {
        if (event.player) new AcmLogHud(event.player);
    }
});