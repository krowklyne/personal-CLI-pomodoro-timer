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

  let totalSeconds = durationMinutes * 60;
  let timeLeftInSeconds = totalSeconds;

  console.log(`Starting Pomodoro timer for ${durationMinutes} minutes. Press Ctrl+C to exit.`);
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
    
    // Set up the one-second interval for the timer.
    const timerInterval = setInterval(() => {
      timeLeftInSeconds--;
      
      const minutes = Math.floor(timeLeftInSeconds / 60);
      const seconds = timeLeftInSeconds % 60;
      const progress = (totalSeconds - timeLeftInSeconds) / totalSeconds;
      
      drawDisplay(progress, minutes, seconds);

      // When the timer is done...
      if (timeLeftInSeconds <= 0) {
        clearInterval(timerInterval);
        // Show cursor again before printing final message.
        process.stdout.write('\x1B[?25h');
        // \x07 is the ASCII BEL character, which makes the terminal beep.
        process.stdout.write('\n\nTime\'s up! Take a break.\x07\n');
        process.exit(0);
      }
    }, 1000);

    // Initial draw
    drawDisplay(0, durationMinutes, 0);
  }, 1000);
};

/**
 * Clears the console and draws the progress bar and large timer.
 * @param {number} progress - A float between 0 and 1.
 * @param {number} minutes - Remaining minutes.
 * @param {number} seconds - Remaining seconds.
 */
const drawDisplay = (progress, minutes, seconds) => {
  // 1. Clear the terminal screen and move cursor to top-left.
  process.stdout.write('\x1B[2J\x1B[0f');

  // 2. Construct and draw the Progress Bar.
  const barWidth = 40;
  const filledWidth = Math.round(barWidth * progress);
  const emptyWidth = barWidth - filledWidth;
  const filledBar = '█'.repeat(filledWidth);
  const emptyBar = '░'.repeat(emptyWidth);
  const progressBarString = `[${filledBar}${emptyBar}]\n\n`;

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
  const largeTimerString = timerRows.join('\n');

  // 4. Combine and print the full display to the console.
  process.stdout.write(progressBarString + largeTimerString);
};

// Run the main function.
main();

