import { Player, ScoreboardIdentity, ScoreboardObjective, world } from "@minecraft/server";
import { ActionForm } from "../_lib/spec/_module/util/form";
import { AcmLog } from "../acm_api";

export class AcmLogHud{
    private player: Player;
    constructor(player: Player) {
        this.player = player;
        this.showLogForm();
    }
    private showLogForm(){
        const form = new ActionForm();
        form.setTitle('Addon Logs');
        form.setBody(this.getLogText());
        form.addButton('Exit', 'Exit');
        form.showForm(this.player);

    }
    private getLogText(): string {
        const db: ScoreboardObjective | undefined = world.scoreboard.getObjective('acm:logs');
        if (!db) return 'No logs found.';
        const logData: AcmLog[] = [];
        db.getParticipants().forEach((i: ScoreboardIdentity)=>{
            const data = JSON.parse(i.displayName) as AcmLog;
            if (data.logText.length > 0) logData.push(data);
        })
        const logStrings: string[] = [];
        logData.forEach((log: AcmLog)=>{
            logStrings.push(`§6ADDON: ${log.profileId.replace('ACM:', '')}§r\n${log.logText}\n`);
        })
        return logStrings.join('\n');
    }
}