// Web Audio API setup for hover sounds with fade-out
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundBuffers = {};
const gainNodes = {};

const soundFiles = {
  sound1: "assets/sounds/hover1.mp3",
  sound2: "assets/sounds/hover2.mp3",
  sound3: "assets/sounds/hover3.mp3",
  sound4: "assets/sounds/hover4.mp3",
  sound5: "assets/sounds/hover5.mp3",
  sound6: "assets/sounds/hover6.mp3"
};

async function loadSounds() {
  for (const [id, url] of Object.entries(soundFiles)) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    soundBuffers[id] = audioBuffer;
  }
}
loadSounds();

function playSound(id) {
  const buffer = soundBuffers[id];
  if (!buffer) return;

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(1, audioContext.currentTime);

  source.buffer = buffer;
  source.connect(gainNode).connect(audioContext.destination);
  source.start();

  gainNodes[id] = gainNode;
  source.onended = () => { gainNodes[id] = null; };
  return { source, gainNode };
}

function fadeOutSound(id) {
  const gainNode = gainNodes[id];
  if (gainNode) {
    const now = audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 1.5); // Longer fade-out
  }
}

// Handle hover and click on label-wrapper elements (flying objects)
document.querySelectorAll('.label-wrapper').forEach(label => {
  const flyingObject = label.querySelector('.flying-object');
  const soundId = flyingObject?.getAttribute('data-sound');
  const targetPage = flyingObject?.getAttribute('data-page');

  let soundInstance = null;

  // Sound on hover
  label.addEventListener('mouseenter', () => {
    soundInstance = playSound(soundId);
  });

  label.addEventListener('mouseleave', () => {
    fadeOutSound(soundId);
  });

  label.addEventListener('click', (e) => {
    e.stopPropagation();

    document.querySelectorAll('.page-layer').forEach(layer => {
      layer.classList.remove("visible");
      layer.classList.add("hidden");
    });

    if (targetPage === "journeys") {
      const journeys = document.getElementById("journeys");
      journeys.classList.remove("hidden");
      journeys.classList.add("visible");
    } else if (targetPage) {
      document.getElementById(targetPage).classList.remove("hidden");
      document.getElementById(targetPage).classList.add("visible");
    }
  });
});

// GROUNDS markers logic
document.querySelectorAll('.text-marker').forEach(marker => {
  marker.addEventListener('click', (e) => {
    e.stopPropagation();
    alert("Clicked on: " + marker.textContent.trim());
  });
});

document.getElementById("grounds").addEventListener("click", (e) => {
  if (!e.target.classList.contains("text-marker")) {
    showHomepage();
  }
});

// DREAMERS logic
const dreamersPage = document.getElementById("dreamers");
const artistContainer = dreamersPage.querySelector(".artist-columns");
const artistDetails = document.createElement("div");
artistDetails.classList.add("artist-details");
dreamersPage.appendChild(artistDetails);

document.querySelectorAll('.artist').forEach(artist => {
  artist.addEventListener('click', (e) => {
    e.stopPropagation();

    const name = artist.textContent.trim();
    document.querySelectorAll('.artist').forEach(a => a.style.display = 'none');

    if (name.includes("Rachel S.Y. Chen")) {
      artistDetails.innerHTML = `
  <div style="padding: 2rem; max-width: 800px; margin: auto; font-size: 1rem;">
    <h2>${name}</h2>
    <p><strong>Rachel S. Y. Chen</strong> is a sonic explorer... [content shortened]</p>
  </div>
`;
    } else {
      artistDetails.innerHTML = `<p style="padding:2rem;">No content yet for ${name}.</p>`;
    }

    artistDetails.style.display = 'block';
  });
});

dreamersPage.addEventListener("click", (e) => {
  const artistColumns = document.querySelector(".artist-columns");
  const artistDetails = document.querySelector(".artist-details");
  const clickedInside = artistColumns?.contains(e.target) || artistDetails?.contains(e.target);
  if (!clickedInside) {
    showHomepage();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") {
    showHomepage();
  }
});

function showHomepage() {
  document.querySelectorAll('.page-layer').forEach(layer => {
    layer.classList.remove("visible");
    layer.classList.add("hidden");
  });

  document.getElementById("homepage").classList.remove("hidden");
  document.getElementById("homepage").classList.add("visible");

  document.querySelectorAll('.artist').forEach(a => a.style.display = '');
  const artistDetails = document.querySelector(".artist-details");
  if (artistDetails) artistDetails.innerHTML = '';
}

const journeysHTML = document.createElement("div");
journeysHTML.id = "journeys";
journeysHTML.className = "page-layer hidden";
journeysHTML.innerHTML = `
  <div class="calendar-grounds-overlay">
    <div class="marker" data-city="newdelhi" style="top: 10%; left: 10%; opacity: 0.2;">NEW DELHI</div>
    <div class="marker" data-city="berlin" style="top: 20%; left: 60%; opacity: 0.2;">BERLIN</div>
    <div class="marker" data-city="lagos" style="top: 70%; left: 40%; opacity: 0.2;">LAGOS</div>
  </div>
  <div class="journeys-calendar" style="display: flex; flex-wrap: wrap; gap: 2rem; padding: 3rem; font-size: 0.95rem;">
    <div class="calendar-column">
      <div class="calendar-date" data-city="newdelhi"><strong>Oct 10–14:</strong> NEW DELHI</div>
      <div class="calendar-date" data-city="berlin"><strong>Oct 15–17:</strong> BERLIN</div>
    </div>
    <div class="calendar-column">
      <div class="calendar-date" data-city="lagos"><strong>Oct 18–21:</strong> LAGOS</div>
      <div class="calendar-date"><strong>Oct 22–24:</strong> TBD</div>
    </div>
    <div class="calendar-column">
      <div class="calendar-date"><strong>Oct 25–27:</strong> TBD</div>
      <div class="calendar-date"><strong>Oct 28–30:</strong> TBD</div>
    </div>
    <div class="calendar-column">
      <div class="calendar-date"><strong>Oct 31–Nov 2:</strong> TBD</div>
    </div>
  </div>
  <div class="calendar-detail" style="display: none; padding: 2rem; font-size: 1rem; max-width: 600px; margin: auto;">
    <!-- Dynamic content will appear here -->
  </div>
`;
document.body.appendChild(journeysHTML);

setTimeout(() => {
  const backgroundMap = document.querySelector(".calendar-grounds-overlay");
  const detailBox = document.querySelector(".calendar-detail");

  document.querySelectorAll(".calendar-date").forEach(dateEl => {
    dateEl.addEventListener("mouseenter", () => {
      const city = dateEl.getAttribute("data-city");
      if (backgroundMap) {
        backgroundMap.querySelectorAll(".marker").forEach(marker => {
          marker.style.opacity = marker.dataset.city === city ? 1 : 0.2;
        });
      }
    });

    dateEl.addEventListener("mouseleave", () => {
      if (backgroundMap) {
        backgroundMap.querySelectorAll(".marker").forEach(marker => {
          marker.style.opacity = 0.2;
        });
      }
    });

    dateEl.addEventListener("click", () => {
      const summary = dateEl.innerHTML;
      detailBox.innerHTML = `
        <h3>${summary}</h3>
        <p>Program details coming soon...</p>
      `;
      detailBox.style.display = 'block';
    });
  });
}, 500);
