#!/usr/bin/env node

/**
 * A simple, zero-dependency command-line Pomodoro timer.
 * Usage:
 *   pomodoro-timer          (starts a 25-minute timer)
 *   pomodoro-timer [mins]   (starts a timer for [mins] minutes)
 */

// Base ASCII art for numbers (Height: 5, Width: 5). These will be scaled.
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
 * A utility function to center a block of text (string or array of strings) within the terminal width.
 * @param {string|string[]} content - The text content to center.
 * @param {number} terminalWidth - The total width of the terminal.
 * @returns {string} The centered text block as a single string.
 */
const centerContent = (content, terminalWidth) => {
  const lines = Array.isArray(content) ? content : content.split('\n');
  return lines.map(line => {
      const padding = ' '.repeat(Math.max(0, Math.floor((terminalWidth - line.length) / 2)));
      return `${padding}${line}`;
  }).join('\n');
};

/**
 * Scales a single base ASCII character art both horizontally and vertically.
 * @param {string[]} charArt - Array of strings for the base character (e.g., from ASCII_NUMBERS).
 * @param {number} scale - The integer factor to scale by (e.g., 2 means twice as big).
 * @returns {string[]} The scaled character art as an array of strings.
 */
const scaleAsciiCharacter = (charArt, scale) => {
  if (scale <= 1) {
    return charArt;
  }
  const scaledArt = [];
  for (const row of charArt) {
    // Scale horizontally by repeating each character `scale` times
    const scaledRow = row.split('').map(char => char.repeat(scale)).join('');
    // Scale vertically by adding the scaled row `scale` times
    for (let i = 0; i < scale; i++) {
      scaledArt.push(scaledRow);
    }
  }
  return scaledArt;
};

/**
 * Generates the complete, multi-row display for the timer by scaling and assembling ASCII characters.
 * @param {string} timeString - The "mm:ss" time string.
 * @param {number} scale - The integer factor to scale the characters by.
 * @returns {string[]} An array of strings, with each string being a row of the final timer display.
 */
const generateScaledTimerRows = (timeString, scale) => {
  // 1. Get scaled art for each character in the time string
  const scaledArtParts = timeString.split('').map(char => {
    const baseArt = ASCII_NUMBERS[char] || ASCII_NUMBERS[':'];
    return scaleAsciiCharacter(baseArt, scale);
  });
  
  const scaledCharHeight = scaledArtParts[0].length;
  const timerRows = [];
  const scaledSpace = ' '.repeat(scale * 2);

  // 2. Assemble the final rows by joining row parts with a separator.
  // This is more robust than concatenation and trimEnd() and prevents flickering.
  for (let i = 0; i < scaledCharHeight; i++) {
    const rowParts = scaledArtParts.map(part => part[i]);
    timerRows.push(rowParts.join(scaledSpace));
  }
  return timerRows;
};

/**
 * Clears the console and draws the centered, responsive progress bar and timer.
 * @param {number} progress - A float between 0 and 1.
 * @param {number} minutes - Remaining minutes.
 * @param {number} seconds - Remaining seconds.
 */
const drawDisplay = (progress, minutes, seconds) => {
  const terminalWidth = process.stdout.columns || 80;
  const terminalHeight = process.stdout.rows || 24;

  // 1. Clear the terminal screen and move cursor to top-left.
  process.stdout.write('\x1B[2J\x1B[0f');

  // 2. Construct the Progress Bar string.
  const barMargin = 4;
  const barWidth = Math.max(10, terminalWidth - (barMargin * 2) - 2); // -2 for brackets
  const filledWidth = Math.round(barWidth * progress);
  const emptyWidth = barWidth - filledWidth;
  const filledBar = '█'.repeat(filledWidth);
  const emptyBar = '░'.repeat(emptyWidth);
  const barContent = `[${filledBar}${emptyBar}]`;
  const centeredBar = centerContent(barContent, terminalWidth);

  // 3. Determine the scale for the timer based on terminal size.
  // A base timer "00:00" is 5 rows high and ~30 chars wide.
  const verticalScale = Math.floor((terminalHeight - 4) / 5); // 5 is base height, 4 is for bar and padding
  const horizontalScale = Math.floor(terminalWidth / 35); // 35 is a safe est. base width
  const scale = Math.max(1, Math.min(verticalScale, horizontalScale));

  // 4. Construct the large, scaled timer display.
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timerRows = generateScaledTimerRows(timeString, scale);
  const centeredTimer = centerContent(timerRows, terminalWidth);

  // 5. Combine and print the full display to the console.
  const fullDisplay = `${centeredBar}\n\n${centeredTimer}`;
  process.stdout.write(fullDisplay);
};

// Run the main function.
main();
