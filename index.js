#!/usr/bin/env node

/**
 * A simple, zero-dependency command-line Pomodoro timer.
 * Usage:
 *   pomodoro-timer          (starts a 25-minute timer)
 *   pomodoro-timer [mins]   (starts a timer for [mins] minutes)
 */

// ASCII art for large numbers (Height: 5, Width: 5)
const ASCII_NUMBERS = {
  '0': [' ███ ', '█   █', '█ █ █', '█   █', ' ███ '],
  '1': ['  █  ', ' ██  ', '  █  ', '  █  ', ' ███ '],
  '2': [' ███ ', '█   █', '   █ ', '  █  ', '█████'],
  '3': ['████ ', '    █', '  ██ ', '    █', '████ '],
  '4': ['█   █', '█   █', '█████', '    █', '    █'],
  '5': ['█████', '█    ', '████ ', '    █', '████ '],
  '6': [' ███ ', '█    ', '████ ', '█   █', ' ███ '],
  '7': ['█████', '    █', '   █ ', '  █  ', '  █  '],
  '8': [' ███ ', '█   █', ' ███ ', '█   █', ' ███ '],
  '9': [' ███ ', '█   █', ' ████', '    █', ' ███ '],
  ':': ['     ', '  █  ', '     ', '  █  ', '     '],
};


const main = () => {
  // 1. Get duration from command-line arguments, default to 25 minutes.
  const args = process.argv.slice(2);
  let durationMinutes = parseInt(args[0], 10);

  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    if (args.length > 0 && args[0] !== undefined) {
      console.log(`Invalid duration: "${args[0]}". Using default of 25 minutes.`);
    }
    durationMinutes = 25;
  }

  const totalSeconds = durationMinutes * 60;
  let timeLeftInSeconds = totalSeconds;

  console.log(`Starting Pomodoro timer for ${durationMinutes} minutes. Press Ctrl+C to exit.`);
  
  const redraw = () => {
    const minutes = Math.floor(timeLeftInSeconds / 60);
    const seconds = timeLeftInSeconds % 60;
    const progress = totalSeconds > 0 ? (totalSeconds - timeLeftInSeconds) / totalSeconds : 0;
    drawDisplay(progress, minutes, seconds);
  };

  // Wait a moment before starting the timer to allow user to read the message.
  setTimeout(() => {
    // Hide cursor for a cleaner display.
    process.stdout.write('\x1B[?25l');

    // Gracefully handle Ctrl+C to exit the process.
    process.on('SIGINT', () => {
      // Show cursor, move to a new line, and exit cleanly.
      process.stdout.write('\x1B[?25h');
      process.stdout.write('\n\nTimer cancelled. Goodbye!\n');
      process.exit(0);
    });
    
    // Add a resize listener to make the display responsive.
    process.stdout.on('resize', redraw);

    // Set up the one-second interval for the timer.
    const timerInterval = setInterval(() => {
      if (timeLeftInSeconds <= 0) {
        clearInterval(timerInterval);
        process.stdout.removeListener('resize', redraw);
        // Show cursor again before printing final message.
        process.stdout.write('\x1B[?25h');
        // \x07 is the ASCII BEL character, which makes the terminal beep.
        process.stdout.write('\n\nTime\'s up! Take a break.\x07\n');
        process.exit(0);
      }
      
      timeLeftInSeconds--;
      redraw();

    }, 1000);

    // Initial draw
    redraw();
  }, 1000);
};

/**
 * Clears the console and draws the centered, responsive progress bar and timer.
 * @param {number} progress - A float between 0 and 1.
 * @param {number} minutes - Remaining minutes.
 * @param {number} seconds - Remaining seconds.
 */
const drawDisplay = (progress, minutes, seconds) => {
  const terminalWidth = process.stdout.columns || 80;

  // 1. Clear the terminal screen and move cursor to top-left.
  process.stdout.write('\x1B[2J\x1B[0f');

  // 2. Construct and center the Progress Bar.
  const barMargin = 4; // Margin on both left and right
  const barWidth = Math.max(10, terminalWidth - (barMargin * 2) - 2); // -2 for brackets
  const filledWidth = Math.round(barWidth * progress);
  const emptyWidth = barWidth - filledWidth;
  const filledBar = '█'.repeat(filledWidth);
  const emptyBar = '░'.repeat(emptyWidth);
  const barContent = `[${filledBar}${emptyBar}]`;
  const barPadding = ' '.repeat(Math.max(0, Math.floor((terminalWidth - barContent.length) / 2)));
  const progressBarString = `${barPadding}${barContent}\n\n`;

  // 3. Construct the large timer display from ASCII characters.
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const charHeight = ASCII_NUMBERS['0'].length;
  let timerRows = Array(charHeight).fill('');

  for (const char of timeString) {
    const ascii_char = ASCII_NUMBERS[char];
    if (ascii_char) {
      for (let i = 0; i < charHeight; i++) {
        // Add character row and a space for separation.
        timerRows[i] += ascii_char[i] + ' ';
      }
    }
  }

  // 4. Center the assembled ASCII timer rows.
  const timerContentWidth = timerRows[0] ? timerRows[0].length : 0;
  const timerPadding = ' '.repeat(Math.max(0, Math.floor((terminalWidth - timerContentWidth) / 2)));
  const centeredTimerRows = timerRows.map(row => `${timerPadding}${row}`);
  const largeTimerString = centeredTimerRows.join('\n');

  // 5. Combine and print the full display to the console.
  process.stdout.write(progressBarString + largeTimerString);
};

// Run the main function.
main();

