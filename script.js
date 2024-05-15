const wordInput = document.getElementById('wordInput');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultContainer');
const themeBtn = document.getElementById('themeBtn');
const themeText = document.getElementById('themeText');
const body = document.body;

// Check if the user has a preferred theme stored in localStorage
const preferredTheme = localStorage.getItem('theme');
if (preferredTheme === 'dark') {
  body.classList.add('dark-theme');
  themeText.textContent = 'Light';
} else {
  body.classList.add('light-theme');
  themeText.textContent = 'Dark';
}

// Event listeners
searchBtn.addEventListener('click', fetchDefinition);
wordInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    fetchDefinition();
  }
});
themeBtn.addEventListener('click', toggleTheme);

// Theme switching function
function toggleTheme() {
  body.classList.toggle('dark-theme');
  body.classList.toggle('light-theme');

  if (body.classList.contains('dark-theme')) {
    themeText.textContent = 'Light';
    localStorage.setItem('theme', 'dark');
  } else {
    themeText.textContent = 'Dark';
    localStorage.setItem('theme', 'light');
  }
}

// Fetch definition from API
function fetchDefinition() {
  const word = wordInput.value.trim();
  if (word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        resultContainer.innerHTML = ''; // Clear previous results
        if (data.title === 'No Definitions Found') {
          resultContainer.innerHTML = '<p>No definitions found for this word.</p>';
        } else {
          data.forEach(entry => {
            const wordHeader = document.createElement('div');
            wordHeader.classList.add('word-header');
            wordHeader.innerHTML = `
              <h2 class="word">${entry.word}</h2>
              <p class="phonetic">${entry.phonetics && entry.phonetics.find(phonetic => phonetic.text) ? entry.phonetics.find(phonetic => phonetic.text).text : 'N/A'}</p>
              ${entry.phonetics && entry.phonetics.some(phonetic => phonetic.audio) ? `<button class="audio-btn"><i class="fas fa-volume-up"></i></button>` : `<button class="audio-btn" disabled><i class="fas fa-volume-mute"></i></button>`}
            `;
            resultContainer.appendChild(wordHeader);

            const originElement = document.createElement('div');
            originElement.classList.add('origin');
            originElement.innerHTML = `
              <strong>Origin:</strong> <span class="origin-text">${entry.origin || 'N/A'}</span>
            `;
            resultContainer.appendChild(originElement);

            const meaningsContainer = document.createElement('div');
            meaningsContainer.classList.add('meanings');
            entry.meanings.forEach(meaning => {
              const meaningSection = document.createElement('div');
              meaningSection.classList.add('meaning');
              meaningSection.innerHTML = `
                <h3>${meaning.partOfSpeech}</h3>
                ${meaning.definitions.map(definition => `
                  <div class="definition">
                    <p><strong>Definition:</strong> ${definition.definition}</p>
                    ${definition.example ? `<p><strong>Example:</strong> ${definition.example}</p>` : ''}
                    ${definition.synonyms.length > 0 ? `<p><strong>Synonyms:</strong> ${definition.synonyms.join(', ')}</p>` : ''}
                    ${definition.antonyms.length > 0 ? `<p><strong>Antonyms:</strong> ${definition.antonyms.join(', ')}</p>` : ''}
                  </div>
                `).join('')}
              `;
              meaningsContainer.appendChild(meaningSection);
            });
            resultContainer.appendChild(meaningsContainer);

            const audioBtn = wordHeader.querySelector('.audio-btn');
            if (audioBtn) {
              const audioPhonetic = entry.phonetics.find(phonetic => phonetic.audio);
              if (audioPhonetic) {
                audioBtn.addEventListener('click', () => {
                  const audio = new Audio(audioPhonetic.audio);
                  audio.play();
                });
              } else {
                audioBtn.disabled = true;
              }
            }
          });
        }
      })
      .catch(error => {
        resultContainer.innerHTML = '<p>An error occurred while fetching the definition.</p>';
        console.error('Error:', error);
      });
  } else {
    resultContainer.innerHTML = '<p>Please enter a word.</p>';
  }
}