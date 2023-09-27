const maxRuns = 10;
let runsCount = 0;

function corn() {
  if (runsCount >= maxRuns) {
    console.log("The function has run 10 times today. Exiting...");
    clearInterval(interval);
    return;
  }

  // Calculate a random time in milliseconds between 0 and 24 hours
  const randomTime = Math.floor(Math.random() * 24 * 60 * 60 * 1000);

  setTimeout(() => {
    console.log(`Running corn function (${runsCount + 1} of ${maxRuns})`);
    runsCount++;
  }, randomTime);
}

// Set an initial run
corn();

// Schedule subsequent runs using setInterval
const interval = setInterval(corn, 24 * 60 * 60 * 1000); // Repeat every 24 hours
