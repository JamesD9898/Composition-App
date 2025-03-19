document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  let TOTAL_MEASURES = 4; // Changed to let since we update it
  const BEATS_PER_MEASURE = 4;
  const SUBDIVISIONS_PER_BEAT = 4; // 16th notes
  const CELL_WIDTH = 25; // Width of each grid cell in px
  
  // C Major scale notes (from high to low)
  const NOTES = [
    'C6', 'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5',
    'C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4',
    'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3',
    'C3'
  ];
  
  // DOM elements
  const pianoKeysElement = document.querySelector('.piano-keys');
  const noteGridElement = document.querySelector('.note-grid');
  const measureNumbersElement = document.querySelector('.measure-numbers');
  const pianoRollScrollable = document.querySelector('.piano-roll-scrollable');
  
  // State
  const notes = []; // Will store note objects
  let currentTool = 'add'; // Changed default to add
  let isDragging = false;
  let activeDragNote = null;
  let dragStartX = 0;
  let dragType = ''; // 'move', 'resize-left', 'resize-right'
  
  // Initialize piano roll
  function init() {
    createPianoKeys();
    createMeasureNumbers();
    createNoteGrid();
    setupEventListeners();
  }
  
  // Create piano keys on the left side
  function createPianoKeys() {
    pianoKeysElement.innerHTML = '';
    
    NOTES.forEach(noteWithOctave => {
      const keyElement = document.createElement('div');
      const note = noteWithOctave.replace(/[0-9]/g, ''); // Remove octave number
      const isBlackKey = note.includes('#');
      
      keyElement.className = `piano-key ${isBlackKey ? 'black-key' : 'white-key'}`;
      keyElement.dataset.note = noteWithOctave;
      keyElement.textContent = noteWithOctave;
      pianoKeysElement.appendChild(keyElement);
    });
  }
  
  // Create measure numbers at the top
  function createMeasureNumbers() {
    measureNumbersElement.innerHTML = '';
    
    const beatWidth = CELL_WIDTH * SUBDIVISIONS_PER_BEAT;
    const measureWidth = beatWidth * BEATS_PER_MEASURE;
    
    for (let i = 1; i <= TOTAL_MEASURES; i++) {
      const measureElement = document.createElement('div');
      measureElement.className = 'measure-number';
      measureElement.textContent = i;
      measureElement.style.width = `${measureWidth}px`;
      measureNumbersElement.appendChild(measureElement);
    }
  }
  
  // Create the grid area for notes
  function createNoteGrid() {
    noteGridElement.innerHTML = '';
    
    const totalRows = NOTES.length;
    const totalCols = TOTAL_MEASURES * BEATS_PER_MEASURE * SUBDIVISIONS_PER_BEAT;
    
    // Set up the grid container
    noteGridElement.style.position = 'relative';
    noteGridElement.style.width = `${totalCols * CELL_WIDTH}px`;
    noteGridElement.style.height = `${totalRows * 25}px`;
    
    // Create grid cells
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalCols; col++) {
        const gridCell = document.createElement('div');
        gridCell.className = 'grid-cell';
        gridCell.dataset.row = row;
        gridCell.dataset.col = col;
        
        // Calculate position
        gridCell.style.position = 'absolute';
        gridCell.style.left = `${col * CELL_WIDTH}px`;
        gridCell.style.top = `${row * 25}px`;
        gridCell.style.width = `${CELL_WIDTH}px`;
        gridCell.style.height = '25px';
        
        // Mark white keys with lighter background
        if (!NOTES[row].includes('#')) {
          gridCell.classList.add('white-key-row');
        }
        
        // Add beat markers
        if (col % SUBDIVISIONS_PER_BEAT === 0) {
          gridCell.classList.add('beat-line');
        }
        
        // Add measure markers
        if (col % (BEATS_PER_MEASURE * SUBDIVISIONS_PER_BEAT) === 0) {
          gridCell.classList.add('measure-line');
        }
        
        noteGridElement.appendChild(gridCell);
      }
    }
  }
  
  // Update the number of measures and redraw
  function updateMeasures(newTotalMeasures) {
    TOTAL_MEASURES = newTotalMeasures;
    createMeasureNumbers();
    createNoteGrid();
  }
  
  // Create a new note on the grid
  function createNote(row, col, duration = 4) { // Default to quarter note (4 sixteenths)
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    
    // Position calculation
    const left = col * CELL_WIDTH;
    const top = row * 25; // 25px per row
    const width = duration * CELL_WIDTH;
    
    // Position the note
    noteElement.style.position = 'absolute';
    noteElement.style.left = `${left}px`;
    noteElement.style.top = `${top}px`;
    noteElement.style.width = `${width}px`;
    
    // Store note data
    const noteData = {
      id: Date.now(), // Unique ID
      element: noteElement,
      row,
      col,
      duration
    };
    notes.push(noteData);
    noteElement.dataset.noteId = noteData.id;
    
    // Add resize handles
    const leftResizeHandle = document.createElement('div');
    leftResizeHandle.className = 'resize-handle left-handle';
    
    const rightResizeHandle = document.createElement('div');
    rightResizeHandle.className = 'resize-handle right-handle';
    
    noteElement.appendChild(leftResizeHandle);
    noteElement.appendChild(rightResizeHandle);
    
    // Add to grid
    noteGridElement.appendChild(noteElement);
    
    return noteData;
  }
  
  // Delete a note
  function deleteNote(noteId) {
    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex !== -1) {
      noteGridElement.removeChild(notes[noteIndex].element);
      notes.splice(noteIndex, 1);
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Tool selection
    document.getElementById('add-note-btn').addEventListener('click', () => currentTool = 'add');
    document.getElementById('delete-note-btn').addEventListener('click', () => currentTool = 'delete');
    document.getElementById('select-btn').addEventListener('click', () => currentTool = 'select');
    
    // Note grid click handling
    noteGridElement.addEventListener('click', handleNoteGridClick);
    noteGridElement.addEventListener('mousedown', handleNoteGridMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Playback controls
    document.getElementById('play-btn').addEventListener('click', playSequence);
    document.getElementById('stop-btn').addEventListener('click', stopSequence);
  }
  
  function handleNoteGridClick(e) {
    if (e.target.classList.contains('grid-cell') && currentTool === 'add') {
      // Get row and column from dataset
      const row = parseInt(e.target.dataset.row);
      const col = parseInt(e.target.dataset.col);
      const duration = parseFloat(document.getElementById('note-length').value) * SUBDIVISIONS_PER_BEAT;
      
      createNote(row, col, duration);
    }
  }
  
  function handleNoteGridMouseDown(e) {
    if (e.target.classList.contains('note') || e.target.closest('.note')) {
      const noteElement = e.target.classList.contains('note') ? e.target : e.target.closest('.note');
      const noteId = parseInt(noteElement.dataset.noteId);
      const note = notes.find(n => n.id === noteId);
      
      if (currentTool === 'delete') {
        deleteNote(noteId);
        return;
      }
      
      isDragging = true;
      activeDragNote = note;
      
      // Determine drag type
      if (e.target.classList.contains('left-handle')) {
        dragType = 'resize-left';
      } else if (e.target.classList.contains('right-handle')) {
        dragType = 'resize-right';
      } else {
        dragType = 'move';
      }
      
      dragStartX = e.clientX;
      
      // Prevent default to avoid text selection while dragging
      e.preventDefault();
    }
  }
  
  function handleMouseMove(e) {
    if (!isDragging || !activeDragNote) return;
    
    const deltaX = e.clientX - dragStartX;
    const cellDelta = Math.round(deltaX / CELL_WIDTH);
    
    if (cellDelta === 0) return;
    
    if (dragType === 'move') {
      // Move the entire note
      const newCol = Math.max(0, activeDragNote.col + cellDelta);
      activeDragNote.col = newCol;
      activeDragNote.element.style.left = `${newCol * CELL_WIDTH}px`;
    } else if (dragType === 'resize-right') {
      // Resize from right edge (change duration)
      const newDuration = Math.max(1, activeDragNote.duration + cellDelta);
      activeDragNote.duration = newDuration;
      activeDragNote.element.style.width = `${newDuration * CELL_WIDTH}px`;
    } else if (dragType === 'resize-left') {
      // Resize from left edge (change start and duration)
      const maxLeftShift = activeDragNote.duration - 1;
      const actualShift = Math.max(-maxLeftShift, Math.min(cellDelta, activeDragNote.col));
      
      if (actualShift !== 0) {
        activeDragNote.col = activeDragNote.col - actualShift;
        activeDragNote.duration = activeDragNote.duration + actualShift;
        activeDragNote.element.style.left = `${activeDragNote.col * CELL_WIDTH}px`;
        activeDragNote.element.style.width = `${activeDragNote.duration * CELL_WIDTH}px`;
      }
    }
    
    dragStartX = e.clientX;
  }
  
  function handleMouseUp() {
    isDragging = false;
    activeDragNote = null;
  }
  
  // Playback functionality (placeholder)
  function playSequence() {
    console.log('Playing sequence...');
    // TODO: Implement actual audio playback
  }
  
  function stopSequence() {
    console.log('Stopping sequence...');
    // TODO: Implement actual audio stopping
  }
  
  // Initialize the piano roll
  init();
  
  // Expose public methods
  window.pianoRoll = {
    updateMeasures
  };
}); 