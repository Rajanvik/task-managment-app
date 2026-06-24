const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');

// Helper to check if sharp is installed, and run generation
async function generate() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Error: "sharp" library is required but not installed or not working correctly.');
    console.log('Please run: npm install -D sharp');
    process.exit(1);
  }

  const jobs = [
    {
      name: 'App Icon (icon.png)',
      input: path.join(ASSETS_DIR, 'icon.svg'),
      output: path.join(ASSETS_DIR, 'icon.png'),
      width: 1024,
      height: 1024,
    },
    {
      name: 'Android Adaptive Foreground (android-icon-foreground.png)',
      input: path.join(ASSETS_DIR, 'android-icon-foreground.svg'),
      output: path.join(ASSETS_DIR, 'android-icon-foreground.png'),
      width: 1024,
      height: 1024,
    },
    {
      name: 'Android Monochrome Icon (android-icon-monochrome.png)',
      input: path.join(ASSETS_DIR, 'android-icon-monochrome.svg'),
      output: path.join(ASSETS_DIR, 'android-icon-monochrome.png'),
      width: 1024,
      height: 1024,
    },
    {
      name: 'Web Favicon (favicon.png)',
      input: path.join(ASSETS_DIR, 'favicon.svg'),
      output: path.join(ASSETS_DIR, 'favicon.png'),
      width: 48,
      height: 48,
    },
  ];

  console.log('🚀 Starting PNG asset generation from SVGs...');
  
  for (const job of jobs) {
    if (!fs.existsSync(job.input)) {
      console.warn(`⚠️  Warning: Input file ${job.input} does not exist. Skipping.`);
      continue;
    }
    
    try {
      await sharp(job.input)
        .resize(job.width, job.height)
        .png()
        .toFile(job.output);
      console.log(`✅ Generated: ${job.name} -> ${path.basename(job.output)} (${job.width}x${job.height})`);
    } catch (err) {
      console.error(`❌ Error generating ${job.name}:`, err.message);
    }
  }

  console.log('🎉 Asset generation completed!');
}

generate();
