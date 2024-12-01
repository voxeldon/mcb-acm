import { ScriptEventSource, system } from "@minecraft/server";
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
    static initialize(commands) {
        if (!CommandHandler.initialized) {
            CommandHandler.initialized = true;
            CommandHandler.commands = commands;
            system.afterEvents.scriptEventReceive.subscribe((event) => {
                if (event.sourceType === ScriptEventSource.Entity &&
                    event.sourceEntity?.typeId === 'minecraft:player') {
                    if (event.id.includes('help')) {
                        CommandHandler.helpCommand(event.sourceEntity);
                        return;
                    }
                    const inputId = event.id;
                    const command = commands.find(cmd => cmd.id === inputId);
                    if (command) {
                        command.callback({ args: event.message, player: event.sourceEntity });
                    }
                }
            });
        }
        else {
            throw Error('CommandHandler already initialized.');
        }
    }
    static helpCommand(player) {
        const strings = [];
        CommandHandler.commands.forEach((command) => {
            const description = command.description || 'Command has no description.';
            strings.push(`§l§6- ${command.id}§r§o\n${description}\n\n`);
        });
        strings.sort((a, b) => a.localeCompare(b));
        player.sendMessage(strings.join(''));
    }
}
CommandHandler.initialized = false;
CommandHandler.commands = [];
