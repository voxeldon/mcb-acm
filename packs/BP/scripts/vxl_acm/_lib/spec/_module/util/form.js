import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
const occupiedPlayers = new Set();
class ActionForm {
    constructor(title, body, buttons) {
        this.actionForm = new ActionFormData();
        this.buttonMap = new Map();
        this.buttons = [];
        this.titleText = 'undefined';
        this.bodyText = 'undefined';
        if (title)
            this.titleText = title;
        if (body)
            this.bodyText = body;
        if (buttons)
            this.buttons = buttons;
    }
    isOccupied(player) {
        return occupiedPlayers.has(player.id);
    }
    setTitle(title) {
        this.titleText = title;
    }
    setBody(body) {
        this.bodyText = body;
    }
    addButton(indexId, text, iconPath) {
        this.buttons.push({ indexId, text, iconPath });
    }
    async showForm(player) {
        this.actionForm.title(this.titleText);
        this.actionForm.body(this.bodyText);
        this.generateButtons();
        occupiedPlayers.add(player.id);
        const response = await this.actionForm.show(player).finally(() => {
            occupiedPlayers.delete(player.id);
        });
        const return_data = {
            canceled: response.canceled,
            cancelationReason: response?.cancelationReason,
            selection: response?.selection
        };
        if (response.selection !== null && response.selection !== undefined) {
            return_data.indexId = this.buttonMap.get(response.selection);
        }
        return return_data;
    }
    generateButtons() {
        let buttonIndex = 0;
        this.buttons.forEach(button => {
            if (button.iconPath) {
                this.actionForm.button(button.text, button.iconPath);
            }
            else {
                this.actionForm.button(button.text);
            }
            this.buttonMap.set(buttonIndex, button.indexId);
            buttonIndex++;
        });
    }
}
class ModalForm {
    constructor() {
        this.modalForm = new ModalFormData();
        this.widgitMap = new Map();
        this.indexMap = new Map();
        this.textFields = [];
        this.dropdowns = [];
        this.sliders = [];
        this.toggles = [];
    }
    isOccupied(player) {
        return occupiedPlayers.has(player.id);
    }
    setTitle(title) {
        this.modalForm.title(title);
    }
    addTextField(indexId, label, placeholder, defaultValue) {
        this.textFields.push({ indexId, label, placeholder, defaultValue });
    }
    addDropdown(indexId, label, options, defaultValueIndex) {
        this.dropdowns.push({ indexId, label, options, defaultValueIndex });
    }
    addSlider(indexId, label, min, max, step, defaultValue) {
        this.sliders.push({ indexId, label, min, max, step, defaultValue });
    }
    addToggle(indexId, label, defaultValue) {
        this.toggles.push({ indexId, label, defaultValue });
    }
    async showForm(player) {
        this.processWidgets();
        occupiedPlayers.add(player.id);
        const response = await this.modalForm.show(player).finally(() => {
            occupiedPlayers.delete(player.id);
        });
        ;
        const return_data = {
            canceled: response.canceled,
            cancelationReason: response.cancelationReason,
            formValues: response.formValues
        };
        if (response.formValues !== null && response.formValues !== undefined) {
            this.processValues(response.formValues);
            return_data.indexMap = this.indexMap;
        }
        return return_data;
    }
    processWidgets() {
        let widgitIndex = 0;
        for (const textFeild of this.textFields) {
            this.modalForm.textField(textFeild.label, textFeild.placeholder, textFeild?.defaultValue);
            this.widgitMap.set(widgitIndex, textFeild.indexId);
            widgitIndex += 1;
        }
        for (const dropdown of this.dropdowns) {
            this.modalForm.dropdown(dropdown.label, dropdown.options, dropdown?.defaultValueIndex);
            this.widgitMap.set(widgitIndex, dropdown.indexId);
            widgitIndex += 1;
        }
        for (const slider of this.sliders) {
            this.modalForm.slider(slider.label, slider.min, slider.max, slider.step, slider?.defaultValue);
            this.widgitMap.set(widgitIndex, slider.indexId);
            widgitIndex += 1;
        }
        for (const toggle of this.toggles) {
            this.modalForm.toggle(toggle.label, toggle?.defaultValue);
            this.widgitMap.set(widgitIndex, toggle.indexId);
            widgitIndex += 1;
        }
    }
    processValues(formValues) {
        let widgitIndex = 0;
        for (const i of formValues) {
            const value = i?.valueOf();
            const indexId = this.widgitMap.get(widgitIndex);
            if (indexId)
                this.indexMap.set(indexId, value);
            widgitIndex += 1;
        }
    }
}
class MessageForm {
    constructor() {
        this.messageForm = new MessageFormData();
    }
    isOccupied(player) {
        return occupiedPlayers.has(player.id);
    }
    setTitle(title) {
        this.messageForm.title(title);
    }
    setBody(body) {
        this.messageForm.body(body);
    }
    setButtonOne(button) {
        this.messageForm.button1(button);
    }
    setButtonTwo(button) {
        this.messageForm.button2(button);
    }
    async show(player) {
        occupiedPlayers.add(player.id);
        const response = await this.messageForm.show(player).finally(() => {
            occupiedPlayers.delete(player.id);
        });
        ;
        return response;
    }
}
export { ActionForm, ModalForm, MessageForm };
