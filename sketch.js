let shared;
let bgLayer;
let currentBrush = '1';

function preload() {
  partyConnect("wss://demoserver.p5party.org", "gradient_protocol_canvas", "gradient_protocol_canvas_111111111111" );
  shared = partyLoadShared("shared", { strokes: [] });
}

function setup() {
  // for emergency canvas clearing
  document.getElementById('admin').addEventListener('click', (e) => {
    console.log('˖𓍢ִ໋🌷͙֒✧˚ clearing canvas!')
      shared.strokes = [];
      return;
  });

  createCanvas(windowWidth, windowHeight);
  createBackground();

  document.querySelectorAll('.brush-option').forEach(option => {
    option.addEventListener('click', (e) => {
      const type = option.getAttribute('data-type');
      if (type === 'clear-all') {
        shared.strokes = [];
        return;
      }
      document.querySelectorAll('.brush-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      currentBrush = type;
    });
  });

  document.querySelector('.brush-option[data-type="1"]').classList.add('active');
}

function createBackground() {
  bgLayer = createGraphics(width, height);
  bgLayer.background(20, 20, 30);

  // Noise texture
  bgLayer.noStroke();
  for (let i = 0; i < 10000; i++) {
    bgLayer.fill(255, 10);
    bgLayer.ellipse(random(width), random(height), random(0.5, 1.5));
  }

  // Dot grid - #03071C at 70% opacity, larger dots
  bgLayer.stroke(3, 7, 28, 0.70 * 255);
  bgLayer.strokeWeight(3);
  let spacing = 30;
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      bgLayer.point(x, y);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createBackground();
}

function mousePressed() {
  shared.strokes.push([]);
}

function mouseDragged() {
  if (shared.strokes.length === 0) return;
  
  // Prevent drawing over UI elements (brush selector and controls)
  // Check if mouse is over any UI element
  const element = document.elementFromPoint(mouseX, mouseY);
  if (element && (element.classList.contains('brush-option') || element.tagName === 'INPUT' || element.tagName === 'LABEL' || element.closest('.controls'))) return;
  
  // Brush selector area
  if (mouseX < 100 && mouseY > height / 2 - 150 && mouseY < height / 2 + 150) return;
  
  const sizeSlider = document.getElementById('brush-size');
  const opacitySlider = document.getElementById('brush-opacity');
  const sizeMultiplier = sizeSlider ? sizeSlider.value / 10 : 1;
  // Opacity slider: 0-255, map to 0.1 - 1.0
  const opacityMultiplier = opacitySlider ? map(opacitySlider.value, 0, 255, 0.1, 1.0) : 1;
  
  const baseColor = getBrushColor();
  const newPoint = {
    x: mouseX,
    y: mouseY,
    color: [...baseColor.slice(0, 3), 255 * opacityMultiplier],
    size: (currentBrush === 'eraser' ? 30 : getBrushSize()) * sizeMultiplier,
    brushType: currentBrush,
    offset: random(0, TWO_PI),
  };
  
  // Store size and opacity in the point for rendering
  newPoint.size = (currentBrush === 'eraser' ? 30 : getBrushSize()) * sizeMultiplier;
  newPoint.opacity = opacityMultiplier;
  
  shared.strokes[shared.strokes.length - 1].push(newPoint);
}

function getBrushColor() {
  if (currentBrush === 'eraser') return [20, 20, 30];
  
  switch(currentBrush) {
    case '1': return [random(100, 255), random(100, 255), random(100, 255)];
    case '2': // Jewel tones
      const jewelTones = [[220, 20, 60], [0, 128, 128], [255, 215, 0], [75, 0, 130], [0, 255, 127]];
      return random(jewelTones);
    case '3': // Blue variants
      const blueVariants = [
        [random(0, 50), random(50, 150), random(150, 255)], // Darker blue
        [random(100, 200), random(150, 255), random(200, 255)], // Lighter blue
        [random(0, 100), random(150, 255), random(150, 200)], // Greener blue
        [random(100, 150), random(100, 150), random(200, 255)] // Purpler blue
      ];
      return random(blueVariants);
    case '4': // Pink/Sunset/Crimson variants
      const pinkVariants = [
        [255, 182, 193], // Light pink
        [255, 20, 147],  // Darker pink
        [255, 105, 180], // Hot pink
        [255, 140, 0],   // Orange-y
        [255, 69, 0],    // Sunset red-orange
        [220, 20, 60],   // Crimson
        [128, 0, 0],     // Maroon
        [238, 130, 238]  // Violet
      ];
      return random(pinkVariants);
    case '5': // Neon colors
      const neonColors = [[255, 0, 255], [0, 255, 255], [255, 255, 0], [0, 255, 0], [255, 100, 0]];
      return random(neonColors);
    case 'rainbow':
      colorMode(HSB, 360, 100, 100);
      const c = color(frameCount % 360, 100, 100);
      colorMode(RGB, 255);
      return [red(c), green(c), blue(c)];
    case 'spraypaint': return [200, 200, 200];
    default: return [255, 255, 255];
  }
}

function getBrushSize() {
  switch(currentBrush) {
    case '1': return 7.5;
    case '2': return 15;
    case '3': return 3.5;
    case '4': return 20;
    case '5': return 10;
    case 'rainbow': return 7.5;
    case 'spraypaint': return 30;
    default: return 10;
  }
}

function draw() {
  image(bgLayer, 0, 0);
  
  // Draw strokes
  if (!shared.strokes) return;

  for (let strokeArr of shared.strokes) {
    for (let i = 0; i < strokeArr.length; i++) {
      let p = strokeArr[i];
      
      if (p.brushType === 'eraser') {
        fill(20, 20, 30);
        noStroke();
        ellipse(p.x, p.y, p.size, p.size);
        continue;
      }

      let pulse = sin(frameCount * 0.05 + p.offset) * 5;
      let currentSize = p.size + pulse;
      
      fill(p.color[0], p.color[1], p.color[2], p.color[3]);
      noStroke();
      
      if (p.brushType === '1') {
        ellipse(p.x, p.y, currentSize, currentSize);
      } else if (p.brushType === '2') {
        rect(p.x - currentSize/2, p.y - currentSize/2, currentSize, currentSize);
      } else if (p.brushType === '3') {
        triangle(p.x, p.y - currentSize, p.x - currentSize, p.y + currentSize, p.x + currentSize, p.y + currentSize);
      } else if (p.brushType === '4') {
        ellipse(p.x, p.y, currentSize, currentSize/3);
      } else if (p.brushType === '5') {
        push();
        translate(p.x, p.y);
        rotate(frameCount * 0.1);
        rect(-currentSize/2, -currentSize/2, currentSize, currentSize, 5);
        pop();
      } else if (p.brushType === 'rainbow') {
        ellipse(p.x, p.y, currentSize, currentSize);
      } else if (p.brushType === 'spraypaint') {
        for (let j = 0; j < 10; j++) {
          let angle = random(TWO_PI);
          let dist = random(0, currentSize / 2);
          ellipse(p.x + cos(angle) * dist, p.y + sin(angle) * dist, 1, 1);
        }
      }

      if (i > 0 && p.brushType !== 'spraypaint') {
        let prev = strokeArr[i - 1];
        stroke(p.color[0], p.color[1], p.color[2], p.brushType === 'rainbow' ? p.color[3] : p.color[3] * 0.6);
        strokeWeight(p.brushType === 'rainbow' ? currentSize : sin(frameCount * 0.1 + p.offset) * 0.75 + 2.5);
        line(p.x, p.y, prev.x, prev.y);
      }
    }
  }

  // Draw custom cursor
  const sizeSlider = document.getElementById('brush-size');
  const sizeMultiplier = sizeSlider ? sizeSlider.value / 10 : 1;
  
  // Use a fixed size for the cursor, not the randomized one
  const getFixedBrushSize = () => {
    switch(currentBrush) {
      case '1': return 7.5;
      case '2': return 15;
      case '3': return 3.5;
      case '4': return 20;
      case '5': return 10;
      case 'rainbow': return 7.5;
      case 'spraypaint': return 30;
      default: return 10;
    }
  };
  
  const cursorSize = (currentBrush === 'eraser' ? 30 : getFixedBrushSize()) * sizeMultiplier;
  
  fill(255, 255, 255, 0.12 * 255);
  stroke(255, 255, 255, 0.45 * 255);
  strokeWeight(0.5);
  
  if (currentBrush === '1' || currentBrush === 'rainbow') {
    ellipse(mouseX, mouseY, cursorSize, cursorSize);
  } else if (currentBrush === '2') {
    rect(mouseX - cursorSize/2, mouseY - cursorSize/2, cursorSize, cursorSize);
  } else if (currentBrush === '3') {
    triangle(mouseX, mouseY - cursorSize, mouseX - cursorSize, mouseY + cursorSize, mouseX + cursorSize, mouseY + cursorSize);
  } else if (currentBrush === '4') {
    ellipse(mouseX, mouseY, cursorSize, cursorSize/3);
  } else if (currentBrush === '5') {
    rect(mouseX - cursorSize/2, mouseY - cursorSize/2, cursorSize, cursorSize, 5);
  } else if (currentBrush === 'spraypaint') {
    ellipse(mouseX, mouseY, cursorSize, cursorSize);
  } else if (currentBrush === 'eraser') {
    stroke(255, 255, 255, 0.45 * 255);
    strokeWeight(2);
    noFill();
    ellipse(mouseX, mouseY, cursorSize, cursorSize);
  }
}