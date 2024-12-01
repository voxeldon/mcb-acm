# API Documentation

## Overview

The `AcmApi` class provides a framework for managing addon profiles and handling events in Minecraft Bedrock Edition. It includes features for subscribing to event signals, managing addon configurations, and interacting with dynamic properties and scoreboards.

---

## Enum: `AcmEventType`

Represents the types of events that can occur in the ACM API.

- **`DataChanged`**: Event triggered when data changes (`data_changed`).
- **`ExtensionTriggered`**: Event triggered by an addon extension (`extension_triggered`).

---

## Types

### `AcmEventData`

Represents the data structure for an ACM event.

| Property    | Type                       | Description                                            |
|-------------|----------------------------|--------------------------------------------------------|
| `type`      | `string`                   | The type of the event.                                 |
| `data`      | `Map<string, any>` (optional) | Additional data associated with the event.            |
| `player`    | `Player` (optional)        | The player associated with the event, if applicable.  |

---

### `AcmAfterEvent`

Callback type invoked after an ACM event occurs.

#### Parameters:
- **`event`**: The `AcmEventData` object containing event information.

---

### `AddonSettingTypeId`

Union type defining possible addon setting types:
- `'toggle'`
- `'slider'`
- `'dropdown'`
- `'text_field'`

---

## Interfaces

### `TextFieldSetting`

Configuration for a text field setting.

| Property        | Type     | Description                                    |
|------------------|----------|------------------------------------------------|
| `label`         | `string` | Label for the text field.                      |
| `placeholder`   | `string` | Placeholder text.                              |
| `defaultValue`  | `string` (optional) | Default value for the text field.    |

---

### `DropdownSetting`

Configuration for a dropdown setting.

| Property           | Type           | Description                                        |
|---------------------|----------------|----------------------------------------------------|
| `label`            | `string`      | Label for the dropdown.                           |
| `options`          | `string[]`    | List of available options.                        |
| `defaultValueIndex` | `number` (optional) | Index of the default selected option.       |

---

### `SliderSetting`

Configuration for a slider setting.

| Property       | Type      | Description                                      |
|-----------------|-----------|--------------------------------------------------|
| `label`        | `string`  | Label for the slider.                            |
| `min`          | `number`  | Minimum value of the slider.                     |
| `max`          | `number`  | Maximum value of the slider.                     |
| `step`         | `number`  | Increment steps for the slider.                  |
| `defaultValue` | `number` (optional) | Default value of the slider.           |

---

### `ToggleSetting`

Configuration for a toggle setting.

| Property       | Type      | Description                                     |
|-----------------|-----------|-------------------------------------------------|
| `label`        | `string`  | Label for the toggle.                           |
| `defaultValue` | `boolean` (optional) | Default value (default: `false`). |

---

### `AddonExtension`

Details about an addon extension.

| Property    | Type     | Description                                    |
|-------------|----------|------------------------------------------------|
| `eventId`   | `string` | Unique event identifier for the addon.         |
| `langKey`   | `string` (optional) | Language key for localization.       |
| `iconPath`  | `string` (optional) | Path to the addon icon.             |

---

### `AddonConfiguration`

Configuration for an addon.

| Property       | Type               | Description                                    |
|-----------------|--------------------|------------------------------------------------|
| `authorId`     | `string`           | Unique identifier of the author.              |
| `packId`       | `string`           | Unique identifier of the addon pack.          |
| `iconPath`     | `string` (optional)| Path to the addon icon (omit `textures/`).    |
| `addonSettings`| `AddonSetting[]` (optional) | Settings for the addon.           |
| `guideKeys`    | `string[]` (optional) | Guide keys for the addon.              |
| `extension`    | `AddonExtension` (optional) | Extension details.                   |

---

## Class: `AcmApi`

### Static Methods

#### `subscribe(callback: AcmAfterEvent): AcmAfterEvent`

Subscribes a callback function to the ACM event signal.

- **Parameters**:
  - `callback` (`AcmAfterEvent`): The function to be triggered by events.
- **Returns**:
  - The same callback function for potential reference.

---

#### `unsubscribe(callback: AcmAfterEvent): void`

Unsubscribes a callback function from the ACM event signal.

- **Parameters**:
  - `callback` (`AcmAfterEvent`): The callback function to be removed.

---

#### `generateAddonProfile(profile: AddonConfiguration): void`

Generates an addon profile and initializes event listeners.

- **Parameters**:
  - `profile` (`AddonConfiguration`): Configuration object for the addon.

---

#### `loadAddonData(profile: AddonConfiguration): Map<string, any>`

Loads data for a given addon profile.

- **Parameters**:
  - `profile` (`AddonConfiguration`): Configuration of the addon.
- **Returns**:
  - A `Map` containing addon data, or `undefined` if no data exists.

---

## Examples

### Subscribing to an Event
```typescript
AcmApi.subscribe((event) => {
    console.log(`Event Type: ${event.type}`);
    if (event.data) console.log(`Data: ${JSON.stringify(Array.from(event.data.entries()))}`);
});
```

### Generating an Addon Profile
```typescript
AcmApi.generateAddonProfile({
    authorId: "example_author",
    packId: "example_pack",
    addonSettings: [
        { label: "Enable Feature", defaultValue: true } as ToggleSetting
    ]
});
```

---

## Notes

- Ensure unique `authorId` and `packId` for each addon.
- For dynamic property usage, avoid name collisions in the global scope.
