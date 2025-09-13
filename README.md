# Pomodoro CLI Timer

A simple, zero-dependency command-line Pomodoro timer that runs directly in your terminal.

## Features

-   Customizable timer duration.
-   Real-time text-based progress bar.
-   Runs anywhere Node.js is installed.
-   No external dependencies.

## Prerequisites

You must have [Node.js](https://nodejs.org/) installed on your system (version 12.x or higher is recommended).

## Installation

1.  **Clone or Download:**
    Save the `index.js` and `package.json` files to a directory on your local machine.

2.  **Navigate to the Directory:**
    Open your terminal and `cd` into the directory where you saved the files.
    ```sh
    cd path/to/your/folder
    ```

3.  **Install Globally:**
    Run the following command to install the tool globally on your system. This will make the `pomodoro-timer` command available everywhere.
    ```sh
    npm install -g .
    ```
    *Note: You may need to use `sudo` on macOS or Linux if you encounter permission errors (`sudo npm install -g .`).*

## Usage

Once installed, you can run the timer from any directory in your terminal.

**Start a default 25-minute timer:**
```sh
pomodoro-timer
```

**Start a custom timer (e.g., 50 minutes):**
```sh
pomodoro-timer 50
```

**Output:**
The timer will display a progress bar and the remaining time, updating every second on the same line.
```
[██████████░░░░░░░░░░░░░░░░░░░░] 12:34 remaining
```

**Stopping the Timer:**
Press `Ctrl+C` at any time to stop the timer.

## Uninstallation

To remove the command from your system, run:
```sh
npm uninstall -g pomodoro-cli-timer
```

