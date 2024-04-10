
const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

const startButton = document.getElementById("startButton")
const stopButton = document.getElementById("stopButton")
const resetButton = document.getElementById("resetButton")
const tempoSlider = document.getElementById("tempoSlider")
const gainControl = document.getElementById("gainSlider")
const decayControl = document.getElementById("decay_slider")
//setting current step
let currentStep = 0;
//making sure the sequencer starts "off"
let isPlaying = false;
//creating a variable for the intervals
let intervalId;

const steps = document.querySelectorAll('.step');

let oscillator = null;

let attack = 10;
let decay = 200;

// setting up gain nodes
const adsrNode = audioCtx.createGain()
const gainNode = audioCtx.createGain()
//set initial gain value for ADSR and Gain Nodes
adsrNode.gain.value = 0. //linear amplitude
gainNode.gain.value = 0. //linear amplitude
    //creating new oscillator node
oscillator = audioCtx.createOscillator()
    //connecting the Oscilator to the ADSR Note
oscillator.connect(adsrNode)
    //connecting ADSR to Gain Node
adsrNode.connect(gainNode)
    //connecting Gain to Output
gainNode.connect(audioCtx.destination)
    //oscillator initial settings
oscillator.type = "square"
oscillator.frequency.setValueAtTime(110, audioCtx.currentTime)
//start the oscillator
oscillator.start()

function playStep() {
    // Remove active class from all steps
    steps.forEach(step => step.classList.remove('active'));
    // Highlight the current step
    steps[currentStep].classList.add('active');
    // Perform actions for the current step (e.g., trigger sound)
    // Replace this with your own functionality
    // Move to the next step
    currentStep = (currentStep + 1) % steps.length;

    startTone();

    
  }

// Function to start the sequencer
function playSequencer(tempo) {
    const intervalDuration = 60000 / tempo;
    intervalId = setInterval(playStep, intervalDuration);
  }

// Function to stop the sequencer
function stopSequencer() {
    clearInterval(intervalId);
    steps.forEach(step => step.classList.remove('active'));
  }

  //resets the Step back to the starting point
function resetSequencer() { 
    currentStep = 0;
  }

  //This allow us to update the tempo
function updateTempo() {
    
    const tempoValue = tempoSlider;
    const tempo = parseInt(tempoValue.value);
    if (intervalId) {
      clearInterval(intervalId);
      playSequencer(tempo);
    }
    document.getElementById("tempo_display").innerText = `${tempoValue.value} BPM`
  }

function updateGain() {
    audioCtx.resume()
    let sliderVal = parseFloat(gainControl.value)
    document.getElementById("gainDisplay").innerText = `${sliderVal} dBFS`
    let linAmp = 10**(sliderVal/20)
    gainNode.gain.setValueAtTime(linAmp, audioCtx.currentTime);
}

const updateDecay= function() {
    let sliderVal = parseFloat(decayControl.value)
    document.getElementById("decay_display").innerText = `${sliderVal} ms`
}

const startTone = function() {
    console.log(adsrNode.gain)
    adsrNode.gain.setValueAtTime(
        1.0, 
        audioCtx.currentTime
    );
    stopTone()
 }

const stopTone = function() {
    console.log(adsrNode.gain)
    adsrNode.gain.linearRampToValueAtTime(
        0.0,
        audioCtx.currentTime + parseFloat(decayControl.value)/1000
    )
}

function mapValue(value, x1, y1, x2, y2) {
    return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
  }

// Event listeners for play and stop and reset buttons
startButton.addEventListener('click', () => {
    const tempo = parseInt(tempoSlider.value);
    playSequencer(tempo);
  });
  stopButton.addEventListener('click', stopSequencer);
  resetButton.addEventListener('click', resetSequencer);
  tempoSlider.addEventListener('input', updateTempo)
  gainControl.addEventListener("input", updateGain)
  decayControl.addEventListener("input", updateDecay)


