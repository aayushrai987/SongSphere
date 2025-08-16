document.addEventListener('DOMContentLoaded', () => {
    // --- Element Cache ---
    const elements = {
        searchForm: document.getElementById('searchForm'),
        searchInput: document.getElementById('searchInput'),
        resultsGrid: document.getElementById('resultsGrid'),
        loader: document.getElementById('loader'),
        noResults: document.getElementById('noResults'),
        resultsCount: document.getElementById('results-count'),
        resultsTitle: document.getElementById('results-title'),
        initialMessage: document.getElementById('initial-message'),
        nowPlayingBar: document.getElementById('nowPlayingBar'),
        nowPlayingArt: document.getElementById('nowPlayingArt'),
        nowPlayingTitle: document.getElementById('nowPlayingTitle'),
        nowPlayingArtist: document.getElementById('nowPlayingArtist'),
        audioPlayer: document.getElementById('audioPlayer'),
        errorModal: document.getElementById('errorModal'),
        errorTitle: document.getElementById('errorTitle'),
        errorMessage: document.getElementById('errorMessage'),
        closeErrorModal: document.getElementById('closeErrorModal'),
    };

    // --- Robustness Check ---
    for (const key in elements) {
        if (!elements[key]) {
            console.error(`Initialization failed: Element with ID '${key}' not found.`);
            document.body.innerHTML = '<div class="text-white text-center p-8">A critical error occurred. Could not initialize the application.</div>';
            return; 
        }
    }

    // --- API Search Function ---
    const searchMusic = async (term, isInitialSearch = false) => {
        elements.initialMessage.classList.add('hidden');
        elements.resultsGrid.innerHTML = '';
        elements.noResults.classList.add('hidden');
        elements.loader.classList.remove('hidden');
        
        elements.resultsTitle.textContent = 'Discover new music';
        elements.resultsCount.textContent = ''; // Clear previous counts

        try {
            const apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=52`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            displayResults(data.results);
        } catch (error) {
            console.error('Search failed:', error);
            showError('Search Failed', 'Could not fetch music data. Please check your connection and try again.');
            elements.resultsCount.textContent = '';
        } finally {
            elements.loader.classList.add('hidden');
        }
    };

    // --- Display Results Function ---
    const displayResults = (songs) => {
        if (songs.length === 0) {
            elements.noResults.classList.remove('hidden');
            elements.resultsCount.textContent = '';
            return;
        }
        elements.resultsCount.textContent = ''; // Ensure no count is displayed
        songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card bg-gray-800 rounded-lg overflow-hidden group flex flex-col justify-between';
            
            const spotifyQuery = encodeURIComponent(`${song.trackName} ${song.artistName}`);
            const youtubeQuery = encodeURIComponent(`${song.trackName} ${song.artistName}`);

            card.innerHTML = `
                <div class="cursor-pointer" data-action="play">
                    <div class="relative">
                        <img src="${song.artworkUrl100.replace('100x100bb', '400x400bb')}" alt="${song.trackName}" class="w-full h-auto aspect-square object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x400/1f2937/4b5563?text=Error';">
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                            <svg class="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>
                        </div>
                    </div>
                    <div class="p-3">
                        <p class="text-white font-semibold truncate text-sm">${song.trackName}</p>
                        <p class="text-gray-400 truncate text-xs">${song.artistName}</p>
                    </div>
                </div>
                <div class="p-2 flex items-center justify-center space-x-1">
                    <a href="${song.trackViewUrl}" target="_blank" rel="noopener noreferrer" class="platform-link flex-1 text-center bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-2 px-2 rounded-md transition-colors duration-300">Apple</a>
                    <a href="https://open.spotify.com/search/${spotifyQuery}" target="_blank" rel="noopener noreferrer" class="platform-link flex-1 text-center bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-2 rounded-md transition-colors duration-300">Spotify</a>
                    <a href="https://music.youtube.com/search?q=${youtubeQuery}" target="_blank" rel="noopener noreferrer" class="platform-link flex-1 text-center bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-2 rounded-md transition-colors duration-300">YouTube</a>
                </div>`;
            
            // Add event listener to the card itself to play the preview
            const playArea = card.querySelector('[data-action="play"]');
            if (playArea) {
                playArea.addEventListener('click', () => playSong(song));
            }

            elements.resultsGrid.appendChild(card);
        });
    };
    
    // --- Play Song Function ---
    const playSong = (songData) => {
        elements.nowPlayingArt.src = songData.artworkUrl100.replace('100x100bb', '400x400bb');
        elements.nowPlayingTitle.textContent = songData.trackName;
        elements.nowPlayingArtist.textContent = songData.artistName;
        elements.audioPlayer.src = songData.previewUrl;
        elements.audioPlayer.play().catch(e => {
            console.error("Audio play failed:", e);
            showError("Playback Error", "Could not play the audio preview.");
        });
        elements.nowPlayingBar.classList.remove('translate-y-full');
    };

    // --- Error Modal Logic ---
    const showError = (title, message) => {
        elements.errorTitle.textContent = title;
        elements.errorMessage.textContent = message;
        elements.errorModal.classList.remove('hidden');
    };

    // --- Event Listeners ---
    elements.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = elements.searchInput.value.trim();
        if (searchTerm) searchMusic(searchTerm);
    });
    
    elements.closeErrorModal.addEventListener('click', () => {
        elements.errorModal.classList.add('hidden');
    });
    
    // --- Initial Load ---
    searchMusic('Daft Punk', true);
});
