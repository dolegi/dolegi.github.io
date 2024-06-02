let canvas;
let context;
const textWidth = 12;
const textHeight = 20;
const drawingFont = '20px monospace';
let usedPositions = [];

document.addEventListener("DOMContentLoaded", function(event) { 
  canvas = document.querySelector('#paintMe');
  context = canvas.getContext('2d');
  let painting = false;
  const words= ['Lorem', 'ipsum', 'dolor', 'sit', 'ame', ', consectetur', 'adipiscing', 'eli', ', sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et',
    'dolore', 'magna', 'aliqu', '. Ut', 'enim', 'ad', 'minim', 'venia', ', quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
    'commodo', 'consequa', '. Duis', 'aute', 'rure', 'olor', 'n', 'eprehenderit', 'n', 'oluptate', 'elit', 'sse', 'illum', 'olore', 'eu', 'fugiat', 'nulla', 'pariatu',
    '. Excepteur','sint', 'occaecat', 'cupidatat', 'non', 'proiden', ', sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum.'];

  setSize();

  function getWord() {
    return words[Math.floor(Math.random() * words.length)];
  }

  function canDraw(newX, newY, length) {
    const x2 = newX + (textWidth*length);

    return !usedPositions.some(function(pos) {
      const r = pos.x;
      const r2 = pos.x + (textWidth*pos.length);

      return (newY === pos.y && ((newX <= r2) && (r <= x2)));
    });
  }

  function paint(x, y, word) {
    const offset = textWidth + (word.length * textWidth);
    const newX = (Math.round((x - textWidth) / offset) * offset);
    const newY = (Math.round((y - textHeight) / textHeight) * textHeight) + textHeight;

    if(canDraw(newX, newY, word.length)) {
      draw(word, newX, newY);
    }
  }

  function setSize() {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    context.lineWidth = 2;
    context.font = drawingFont;
  }

  function mouseDown(e) {
    e.preventDefault();
    painting = true;
    paint(e.pageX, e.pageY, getWord());
  }
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('touchstart', mouseDown);

  canvas.addEventListener('mousemove', function(e) {
    e.preventDefault();
    if (painting) paint(e.pageX, e.pageY, getWord());
  });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    const t = e.changedTouches[0]
    if (painting) paint(t.clientX, t.clientY, getWord());
  });

  function mouseUp(e) {
    e.preventDefault();
    painting = false;
  }
  canvas.addEventListener('mouseup', mouseUp);
  document.addEventListener('mouseleave', mouseUp);
  canvas.addEventListener('touchend', mouseUp);

  window.addEventListener('resize', setSize);

  function draw(word, paintX, paintY) {
    context.fillText(word, paintX, paintY);
    usedPositions.push({ x: paintX, y: paintY, length: word.length, word, time: new Date() });
  }

  (function loop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const timeNow = new Date();
    usedPositions = usedPositions.filter(pos => new Date() - pos.time < 1000);
    usedPositions.forEach(pos => {
      context.globalAlpha = 1 - ((timeNow - pos.time)/1000);
      context.fillText(pos.word, pos.x, pos.y);
    });

    requestAnimationFrame(loop); 
  })();

  (function randomAdd() {
    const card = document.querySelector('.inner').getBoundingClientRect();
      const randomX = Math.floor(Math.random() * window.innerWidth);
      const randomY = Math.floor(Math.random() * window.innerHeight);
      draw(getWord(), randomX, randomY);
    setTimeout(() => requestAnimationFrame(randomAdd), 600);
  });
});
