import { Block, ItemUseAfterEvent, Player, world } from "@minecraft/server";
import { CommandRanEvent, CommandHandler } from "./_lib/command_handler";
import { AcmApi, AddonConfiguration } from "./acm_api";
import { ConfigManager } from "./util/config_manager";
import { AcmHud } from "./util/hud";
import { WelcomeHud } from "./util/welcome_hud";

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

const test = {
    id: 'test',
    description: 'test',
    callback: ((event: CommandRanEvent) => {
        const block: Block | undefined = event.player.dimension.getBlock(event.player.location);
        const tags = block?.getTags();
        console.warn(tags)
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
    ]
};
new WelcomeHud();
new ConfigManager();
AcmApi.generateAddonProfile(ACM);
CommandHandler.initialize('acm', [openHudCommand, test]);