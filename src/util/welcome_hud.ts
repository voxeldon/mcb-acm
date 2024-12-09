import { ItemStack, Player, PlayerSpawnAfterEvent, ScoreboardObjective, system, TicksPerSecond, world } from "@minecraft/server";
import { ActionForm, FormValue, MessageForm, ModalForm, ModalFormFormReturnData } from "../_lib/spec/_module/util/form";
import { RawText } from "../_lib/spec/_module/util/raw_text";
import { MessageFormResponse } from "@minecraft/server-ui";

export class WelcomeHud{
    constructor(){
        world.afterEvents.playerSpawn.subscribe((event: PlayerSpawnAfterEvent)=>{
            if (world.getDynamicProperty('vxl_acm:init')) return;
            system.waitTicks(TicksPerSecond).then(()=>{
                 this.onReady(event.player);
            })
        })
    }

    private onReady(player: Player){
        const form = new MessageForm();
        form.setTitle(RawText.TRANSLATE('acm.lang.header'));
        form.setBody(RawText.MESSAGE(
            RawText.TRANSLATE('acm.welcome.on_ready.body_line0'),
            RawText.TEXT('\n\n'),
            RawText.TRANSLATE('acm.welcome.on_ready.body_line1'),
            RawText.TEXT('\n')
        ))
        form.setButtonOne('acm.welcome.on_ready.button.command');
        form.setButtonTwo('acm.welcome.on_ready.button.item');
        form.show(player).then((data: MessageFormResponse)=>{
            if (data.selection === 0) this.commandChoice(player);
            else if (data.selection === 1) this.itemChoice(player);
            else this.onReady(player);
        })
    }

    private itemChoice(player: Player){
        const form = new ActionForm();
        form.setTitle(RawText.TRANSLATE('acm.lang.header'));
        form.setBody(RawText.MESSAGE(
            RawText.TRANSLATE('acm.welcome.item_choice.body_line'),
            RawText.TEXT('\n')
        ))
        form.addButton('confirm', 'acm.welcome.button.confirm');
        form.showForm(player).then(()=>{
            this.tagChoice(player);
            player.dimension.spawnItem(new ItemStack('vxl_acm:tool'), player.location);
        })
    }

    private commandChoice(player: Player){
        const form = new ActionForm();
        form.setTitle(RawText.TRANSLATE('acm.lang.header'));
        form.setBody(RawText.MESSAGE(
            RawText.TRANSLATE('acm.welcome.command_choice.body_line_0'),
            RawText.TEXT('\n\n'),
            RawText.TRANSLATE('acm.welcome.command_choice.body_line_1'),
            RawText.TEXT('\n')
        ))
        form.addButton('confirm', 'acm.welcome.button.confirm');
        form.showForm(player).then(()=>{
            this.tagChoice(player);
        })
    }

    private tagChoice(player: Player) {
        const form = new MessageForm();
        form.setTitle(RawText.TRANSLATE('acm.lang.header'));
        form.setBody(RawText.MESSAGE(
            RawText.TRANSLATE('acm.welcome.tag_choice.body_line_0'),
            RawText.TEXT('\n\n'),
            RawText.TRANSLATE('acm.welcome.tag_choice.body_line_1')
        ))
        form.setButtonOne('acm.welcome.tag_choice.button.no');
        form.setButtonTwo('acm.welcome.tag_choice.button.yes');
        form.show(player).then((data: MessageFormResponse)=>{
            if (data.selection === 1) this.setTag(player);
            else if (data.selection === 0) {
                this.configFinished(player);
            }
        })
    }

    private setTag(player:Player) {
        const form = new ModalForm();
        form.setTitle(RawText.TRANSLATE('acm.lang.header'));
        form.addTextField('tag_value', RawText.TRANSLATE('acm.vxl_acm.tag_key'), RawText.TRANSLATE('acm.vxl_acm.tag_key_placeholder'))
        form.showForm(player).then((data: ModalFormFormReturnData)=>{
            if (data.canceled) {
                this.setTag(player);
                return;
            }
            const tagId: FormValue | undefined = data.indexMap?.get('tag_value');
            if (!tagId) throw Error(`Error reading tag ${tagId}`);
            const db = world.scoreboard.getObjective(`ACM:vxl_acm`) as ScoreboardObjective;
            let dataWasUpdated: boolean = false;
            for (const i of db.getParticipants()) {
                if (db.getScore(i) === 1) {
                    db.addScore(JSON.stringify(
                        {tag_key:`${tagId}`,use_tag:true}
                    ), 1);
                    db.removeParticipant(i);
                    dataWasUpdated = true;
                    break;
                }
            }
            if (!dataWasUpdated) {
                db.addScore(JSON.stringify(
                    {tag_key:`${tagId}`,use_tag:true}
                ), 1);
            }
            this.tagAsigned(player, tagId as string);
        })
    }
    private tagAsigned(player: Player, tagId: string){
        const form = new ActionForm();
        form.setTitle(RawText.TRANSLATE('acm.lang.header'));
        form.setBody(RawText.MESSAGE(
            RawText.TRANSLATE('acm.welcome.tag_asigned.body_line_0'),
            RawText.TEXT('\n\n'),
            RawText.TRANSLATE('acm.welcome.tag_asigned.body_line_1'),
            RawText.TEXT(`: ${tagId}`),
            RawText.TEXT('\n')
        ))
        form.addButton('confirm', 'acm.welcome.button.confirm');
        form.showForm(player).then(()=>{
            this.configFinished(player);
        })
    }

    private configFinished(player: Player){
        const form = new ActionForm();
        form.setTitle(RawText.TRANSLATE('acm.lang.header'));
        form.setBody(RawText.MESSAGE(
            RawText.TRANSLATE('acm.welcome.config_finished.body_line_0'),
            RawText.TEXT('\n\n'),
            RawText.TRANSLATE('acm.welcome.config_finished.body_line_1'),
            RawText.TEXT('\n\n'),
            RawText.TRANSLATE('acm.welcome.config_finished.body_line_2'),
            RawText.TEXT('\n'),
            RawText.TRANSLATE('acm.welcome.config_finished.body_line_3'),
            RawText.TEXT('\n'),
            RawText.TRANSLATE('acm.welcome.config_finished.body_line_4'),
            RawText.TEXT('\n')
        ))
        form.addButton('confirm', 'acm.welcome.button.confirm');
        form.showForm(player).then(()=>{
            world.setDynamicProperty('vxl_acm:init', true);
        });
    }
}