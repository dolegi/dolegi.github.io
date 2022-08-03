const glyphs = document.querySelector('.glyphs');
let color = '#3e3e3e';
let fontFamily;
const webFonts = {
  Hack: 'https://cdnjs.cloudflare.com/ajax/libs/hack-font/3.003/web/fonts/hack-bold-subset.woff',
  FontAwesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.woff'
};
const fonts = {};

document.querySelectorAll('.fonts .font').forEach(el => el.addEventListener('click', selectFont))

function selectFont(event) {
  document.querySelectorAll('.fonts .font').forEach(el => el.classList.remove('selected'))
  event.target.classList.add('selected');
  const fontName = event.target.textContent;
  if (Object.keys(fonts).includes(fontName)) {
    showArrayBuffer(fonts[fontName], true);
    return;
  }

  showWebFont(webFonts[fontName])
}

function showWebFont(url) {
  fetch(url)
  .then(res => res.blob())
  .then(blob => {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      const ab = event.target.result;
      showArrayBuffer(ab, true, false);
    };
    fileReader.readAsArrayBuffer(blob);
  });
}

function showArrayBuffer(ab, displayFont, newFont = false) {
  let font;
  try {
    font = opentype.parse(ab);
  } catch (err) {
    font = { supported: false };
  }
  showFont(font, ab, displayFont);

  if (newFont) {
    const fontList = document.querySelectorAll('.fonts .font');
    fontList[fontList.length-1].addEventListener('click', selectFont)
    fontList.forEach(el => el.classList.remove('selected'))
    fontList[fontList.length-1].classList.add('selected')
  }
}

document.querySelector('.file-reader').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const arrayReader = new FileReader();
    arrayReader.readAsArrayBuffer(file);
    arrayReader.onload = function(event) {
      showArrayBuffer(event.target.result, true, true);

      localStorage.setItem(fontFamily, abToStr(event.target.result));
    }
  }
});

function showFont(font, ab, displayFont) {
  document.querySelector('.details').style.visibility = 'hidden';
  if (!font || !font.supported) {
    fontFamily = '"Helvetica Neue", Helvetica, Arial';
    glyphs.style.color = 'tomato';
    glyphs.style.fontFamily = fontFamily;
    glyphs.innerHTML = 'Invalid font file or unsupported format';
    return;
  }
  const charCodes = Object.values(font.glyphs.glyphs).filter(glyph => glyph.unicode !== undefined).map(g => g.unicode)
  fontFamily = Object.values(font.names.fontFamily)[0];

  const fontFace = new window.FontFace(fontFamily, ab);
  document.fonts.add(fontFace);

  if (displayFont) {
    const inner = charCodes.map(charCode => `<span class="glyph" data-unicode="${charCode}">${String.fromCharCode(charCode)}</span>`).join('\t');
    glyphs.innerHTML = inner;

    document.querySelectorAll('.glyph').forEach(g => {
      g.addEventListener('mousemove', showDetails);
      g.addEventListener('touchmove', showDetails);
    });

    glyphs.style.color = color;
    glyphs.style.fontFamily = fontFamily;
  }

  if (!Object.keys(fonts).includes(fontFamily) && !Object.keys(webFonts).includes(fontFamily)) {
    const li = document.createElement('li');
    li.classList.add('font');
    li.innerHTML = fontFamily;
    fonts[fontFamily] = ab;
    document.querySelector('.fonts').appendChild(li);
  }
  return fontFamily;
}

function showDetails(event) {
  const unicode = event.target.dataset.unicode;
  const details = document.querySelector('.details');
  const unicodeBox = details.querySelector('.unicode');
  const decimalBox = details.querySelector('.decimal');
  const htmlCodeBox = details.querySelector('.html');
  const charBox = details.querySelector('.char');

  details.style.visibility = 'hidden';
  details.classList.remove('trans');
  setTimeout(() => {
    details.style.visibility = 'visible';
    details.style.top = `${event.target.offsetTop-50}px`;
    details.style.left = `${event.target.offsetLeft-15}px`;
    unicodeBox.innerHTML = '0x' + ('0000' + parseInt(unicode).toString(16)).slice(-4);
    decimalBox.innerHTML = unicode;
    htmlCodeBox.innerHTML = `&amp;#${unicode};`;
    charBox.style.fontFamily = fontFamily;
    charBox.innerHTML = String.fromCharCode(unicode);

    details.classList.add('trans');

    details.addEventListener('mouseleave', () => details.style.visibility = 'hidden');
  }, 1);
}

function abToStr(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function strToAb(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

for (var i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  showArrayBuffer(strToAb(value), false, true);
}
document.querySelectorAll('.fonts .font').forEach(el => el.classList.remove('selected'))

document.querySelector('.url-input input').addEventListener('keypress', event => {
  if (event.charCode === 13) {
    showWebFont(event.target.value);
    event.target.value = '';
  }
});
