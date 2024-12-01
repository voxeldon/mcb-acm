import { Player, ScriptEventCommandMessageAfterEvent, ScriptEventSource, system } from "@minecraft/server";

export type CustomCommandAfterEvent = {player: Player, args: string }

export interface CustomCommand {
    id: string;
    description?: string;
    callback: (event: CustomCommandAfterEvent) => void;
}

/**
 * Initializes the command handler with the provided commands.
 * 
 * @param commands - An array of custom commands.
 * 
 * --- Example ---
 *  const helloWorldCommand: CustomCommand = {
 *      id: 'vxl:hello_world',
 *      callback: ((event: CustomCommandAfterEvent)=>{
 *          event.player.sendMessage('Hello World!')
 *      })
 *  }
 *  
 *  CommandHandler.initialize([helloWorldCommand]);
 */
export class CommandHandler {
    private static initialized: boolean = false;
    private static commands: CustomCommand[] = [];
    public static initialize(commands: CustomCommand[]) {
        if (!CommandHandler.initialized) {
            CommandHandler.initialized = true;
            CommandHandler.commands = commands;
            system.afterEvents.scriptEventReceive.subscribe((event: ScriptEventCommandMessageAfterEvent)=>{
                if (
                    event.sourceType === ScriptEventSource.Entity &&
                    event.sourceEntity?.typeId === 'minecraft:player'
                ) {
                    if (event.id.includes('help')) {
                        CommandHandler.helpCommand(event.sourceEntity as Player);
                        return;
                    }
                    const inputId: string = event.id;
                    const command = commands.find(cmd => cmd.id === inputId);
                    if (command) {
                        command.callback({args: event.message, player: event.sourceEntity as Player})
                    }
                }
            })
        } else {
            throw Error('CommandHandler already initialized.')
        }
    }
    private static helpCommand(player: Player){
        const strings: string[] = [];
        CommandHandler.commands.forEach((command)=>{
            const description: string = command.description || 'Command has no description.';
            strings.push(`§l§6- ${command.id}§r§o\n${description}\n\n`);
        })
        strings.sort((a, b) => a.localeCompare(b));
        player.sendMessage(strings.join(''));
    }
}