#!/usr/bin/env node

/**
 * A simple, zero-dependency command-line Pomodoro timer.
 * Usage:
 *   pomodoro-timer          (starts a 25-minute timer)
 *   pomodoro-timer [mins]   (starts a timer for [mins] minutes)
 */
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

  // Gracefully handle Ctrl+C to exit the process.
  process.on('SIGINT', () => {
    // Show cursor and move to a new line before exiting.
    process.stdout.write('\n');
    console.log('Timer cancelled. Goodbye!');
    process.exit(0);
  });
  
  // Set up the one-second interval for the timer.
  const timerInterval = setInterval(() => {
    timeLeftInSeconds--;
    
    // Re-draw the progress bar and time every second.
    const minutes = Math.floor(timeLeftInSeconds / 60);
    const seconds = timeLeftInSeconds % 60;
    const progress = (totalSeconds - timeLeftInSeconds) / totalSeconds;
    
    drawProgressBar(progress, minutes, seconds);

    // When the timer is done...
    if (timeLeftInSeconds <= 0) {
      clearInterval(timerInterval);
      // \x07 is the ASCII BEL character, which makes the terminal beep.
      process.stdout.write('\nTime\'s up! Take a break.\x07\n');
      process.exit(0);
    }
  }, 1000);

  // Initial draw
  drawProgressBar(0, durationMinutes, 0);
};

/**
 * Draws a progress bar to the console on a single line.
 * @param {number} progress - A float between 0 and 1.
 * @param {number} minutes - Remaining minutes.
 * @param {number} seconds - Remaining seconds.
 */
const drawProgressBar = (progress, minutes, seconds) => {
  const barWidth = 40;
  const filledWidth = Math.round(barWidth * progress);
  const emptyWidth = barWidth - filledWidth;
  
  const filledBar = '█'.repeat(filledWidth);
  const emptyBar = '░'.repeat(emptyWidth);
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Use carriage return `\r` to move the cursor to the beginning of the line
  // without creating a new line. This allows us to overwrite the previous output.
  process.stdout.write(`\r[${filledBar}${emptyBar}] ${timeString} remaining `);
};

// Run the main function.
main();

