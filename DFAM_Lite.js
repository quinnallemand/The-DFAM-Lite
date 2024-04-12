//initializing WebAudioAPO and assigning the audio context to an object
const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();


//initializing HTML elements
const initialize_sound = document.getElementById("Initialize_Sound")
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const resetButton = document.getElementById("resetButton");
const oscTypeSwitch = document.getElementById("OSC_Type");
const oscTypeSwitch2 = document.getElementById("OSC2_Type");
const oscFreqSlider = document.getElementById("OSC_Freq");
const oscFreqSlider2 = document.getElementById("OSC2_Freq");
const tempoSlider = document.getElementById("tempoSlider");
const gainControl = document.getElementById("gainSlider");
const VCA_Control = document.getElementById("VCA_slider");
const VC0_Decay_Control = document.getElementById("VCO_Decay");
const VC0_Decay_AMT_Control = document.getElementById("VCO_Decay_AMT");
const filterFreqSlider = document.getElementById("frequencyControl");
const filterTypeSwitch = document.getElementById("filter_type");
const qControl = document.getElementById("qControl");
const pitchControl1 = document.getElementById("pitch_1");
const pitchControl2 = document.getElementById("pitch_2");
const pitchControl3 = document.getElementById("pitch_3");
const pitchControl4 = document.getElementById("pitch_4");
const pitchControl5 = document.getElementById("pitch_5");
const pitchControl6 = document.getElementById("pitch_6");
const pitchControl7 = document.getElementById("pitch_7");
const pitchControl8 = document.getElementById("pitch_8");

// assigns the "steps" of my sequencer to an object
const steps = document.querySelectorAll('.step');

//assigning values to global objects with default values so that these can be accessed and changed within my functions
let filter;
let oscillator = null;
let oscillator2 = null;
let attack = 10;
let decay = 200;
let intervalId;
let isPlaying = false;
let currentStep = 0;
let tempo = 120;
let interval;
let filterFrequency = 1000;
let oscFreq = 220;
let oscFreq2 = 220;
let VCO_Decay = 50;


//creating new oscillator node
oscillator = audioCtx.createOscillator();
oscillator2 = audioCtx.createOscillator();
//creating new filter node
filter = audioCtx.createBiquadFilter();
//creating ADSR nodes
const adsrNode1 = audioCtx.createGain();
const adsrNode2 = audioCtx.createGain();
const adsrNode3 = audioCtx.createGain();
const adsrNode4 = audioCtx.createGain();
const adsrNode5 = audioCtx.createGain();
const adsrNode6 = audioCtx.createGain();
const adsrNode7 = audioCtx.createGain();
const adsrNode8 = audioCtx.createGain();
//creating gain node
const gainNode = audioCtx.createGain();
//oscillator initial settings
oscillator.type = "square";
oscillator2.type = "square";
oscillator.frequency.setValueAtTime(parseFloat(oscFreq), audioCtx.currentTime);
oscillator2.frequency.setValueAtTime(parseFloat(oscFreq2), audioCtx.currentTime);

//filter initial settings
filter.type = 'lowpass'; // Use a low-pass filter
filter.frequency.setValueAtTime(parseFloat(filterFrequency), audioCtx.currentTime); // Set initial cutoff frequency to 1000 Hz
filter.Q.setValueAtTime(1, audioCtx.currentTime); // Set initial Q value to 1

//starting both oscillators
function initialize_button () {
oscillator.start();
oscillator2.start();
}

//set initial gain value for ADSR and Gain Nodes
adsrNode1.gain.value = 0. ;
adsrNode2.gain.value = 0. ;
adsrNode3.gain.value = 0. ;
adsrNode4.gain.value = 0. ;
adsrNode5.gain.value = 0. ;
adsrNode6.gain.value = 0. ;
adsrNode7.gain.value = 0. ;
adsrNode8.gain.value = 0. ; 

gainNode.gain.value = 0. ;
//connecting the Oscilator to the ADSR Note
oscillator.connect(adsrNode1);
oscillator.connect(adsrNode2);
oscillator.connect(adsrNode3);
oscillator.connect(adsrNode4);
oscillator.connect(adsrNode5);
oscillator.connect(adsrNode6);
oscillator.connect(adsrNode7);
oscillator.connect(adsrNode8);

//connects oscillator 2 to the adsr nodes
/*
*the reason there are so many of these is because I wanted the decay to be able to to extend past the attack of the next note
*the only way to do that was to have multiple ADSR channels running simultaniously, that way while one of them decays the next one can start, uneffected.
*/
oscillator2.connect(adsrNode1);
oscillator2.connect(adsrNode2);
oscillator2.connect(adsrNode3);
oscillator2.connect(adsrNode4);
oscillator2.connect(adsrNode5);
oscillator2.connect(adsrNode6);
oscillator2.connect(adsrNode7);
oscillator2.connect(adsrNode8);
//connecting ADSR to filter Node
adsrNode1.connect(filter);
adsrNode2.connect(filter);
adsrNode3.connect(filter);
adsrNode4.connect(filter);
adsrNode5.connect(filter);
adsrNode6.connect(filter);
adsrNode7.connect(filter);
adsrNode8.connect(filter);
//connects the filter to the master gain
filter.connect(gainNode);
//connecting Gain to Output
gainNode.connect(audioCtx.destination);

function playStep() {
    // Remove active class from all steps
    steps.forEach(step => step.classList.remove('active'));
    // Highlight the current step
    steps[currentStep].classList.add('active');
    // Move to the next step
    currentStep = (currentStep + 1) % steps.length;
    //plays the start tone function every step
    startTone();
};
// initializes the sequence and assigns default tempo
function playSequencer(tempo) {
    const intervalDuration = 60000 / tempo;
    intervalId = setInterval(playStep, intervalDuration);
};
// Function to stop the sequencer
function stopSequencer() {
    clearInterval(intervalId);
    steps.forEach(step => step.classList.remove('active'));
};
//resets the Step back to the starting point
function resetSequencer() { 
    currentStep = 0;
};
//updates the frequency of our First Oscillator
function updateOscFreq1 () {
    oscFreq = parseInt(oscFreqSlider.value)
    oscillator.frequency.linearRampToValueAtTime(oscFreq, audioCtx.currentTime + 0.05)
    //placing the new value into our label in html
    document.getElementById("OSC_Freq_display").innerText = `${oscFreq} hz`
};
//updates the frequency of our Second Oscillator
function updateOscFreq2 () {
    oscFreq2 = parseInt(oscFreqSlider2.value)
    oscillator2.frequency.linearRampToValueAtTime(oscFreq2, audioCtx.currentTime + 0.05)
    document.getElementById("OSC2_Freq_display").innerText = `${oscFreq2} hz`
};
//enables us to switch between wav types of Oscillator 1 with our checkbox component in html
function toggleOscType1 () {
    if (oscTypeSwitch.checked) {
        oscillator.type = "triangle"
    } else {
        oscillator.type = "square"
    }
};
//enables us to switch between wav types of Oscillator 2 with our checkbox component in html
function toggleOscType2 () {
    if (oscTypeSwitch2.checked) {
        oscillator2.type = "triangle"
    } else {
        oscillator2.type = "square"
    }
};
//changes the our filter type with another checkbox component in html
function toggleFilterType () {
    if (filterTypeSwitch.checked) {
        filter.type = "highpass"
    } else {
        filter.type = "lowpass"
    }
};
//updates the tempo and continues the sequence for a "somewhat seamless" tempo change while the sequencer is playing
//while playing the sequencer if the change the tempo the sequence doesnt advance while you do it which is annoying
function updateTempo() {
    
    tempo = parseInt(tempoSlider.value);
   const intervalDuration = 60000 / tempo;

     clearInterval(intervalId)
    intervalId = setInterval(playStep, intervalDuration)

    document.getElementById("tempo_display").innerText = `${tempoSlider.value} BPM`
};
// updates our master gainNode value
function updateGain() {
    let sliderVal = parseFloat(gainControl.value)
    document.getElementById("gainDisplay").innerText = `${sliderVal} dBFS`
    let linAmp = 10**(sliderVal/20)
    gainNode.gain.linearRampToValueAtTime(linAmp, audioCtx.currentTime + 0.05);
};
//updates our VCA decay which is the overall decay I use to control the length of the sound
function updateDecay () {
    let sliderVal = parseFloat(VCA_Control.value)
    document.getElementById("VCA_display").innerText = `${sliderVal} ms`
};
//updates the frequency of our Filter Node
function updateFilterFrequency() {
    const sliderValue = parseFloat(filterFreqSlider.value);
    const frequency = sliderToFrequency(sliderValue);
    filter.frequency.setValueAtTime(frequency, audioCtx.currentTime + 0.05);
};
//this turns the values from the filter into something more smooth to counteract the exponential nature of frequency change as it gets higher in pitch
function sliderToFrequency(sliderValue) {
    // Convert slider value to frequency using logarithmic scaling
    const minExp = Math.log10(20); // Minimum frequency (20 Hz)
    const maxExp = Math.log10(20000); // Maximum frequency (20 kHz)
    const valueExp = minExp + ((maxExp - minExp) * sliderValue) / 100;
    return Math.pow(10,valueExp) ;
};
//updates the Q value of the filter node
function updateFilterQ() {
    const qValue = parseFloat(qControl.value);
    filter.Q.setValueAtTime(qValue, audioCtx.currentTime);
};
//this funtion is what controlls most of the processing of the program
const startTone = function() {

    /*converting the BPM to miliseconds then creating a ratio using the values 
    from the VCO DECAY Slider in order to effect the VCO DECAY within the constraints of the interval time*/
    tempo = parseInt(tempoSlider.value);
    const intervalDuration = 60000 / tempo;
    const miliToSeconds = intervalDuration / 1000
    const addedTime = miliToSeconds * parseFloat(VC0_Decay_Control.value)
    
    //system of soloing functions so that we can create different results depending on the "step" of our sequencer
    switch (currentStep) {
        case 1:
            // Action to be executed when the sequencer is at step 1
                //resets adsr 1 gain to 1
                 adsrNode1.gain.setValueAtTime( 1.0, audioCtx.currentTime)
                //this adds to the oscilator starting frequency by adding the value from the VCO AMT slider to the original Freq
                oscillator.frequency.setValueAtTime(oscFreq + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.setValueAtTime(oscFreq2 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                //allows the user to create new freqencies within the sequency by either adding or subtracting from the original frequency using the "Pitch" sliders
                const newOsc1Freq1 = oscFreq + parseInt(pitchControl1.value)
                const newOsc2Freq1 = oscFreq2 + parseInt(pitchControl1.value)
                //brings the frequency back down to the frequency specified in the oscilator frequency Slider and changes the time it returns using the VCO DECAY slider
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq1, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq1, audioCtx.currentTime + addedTime)
                //This code is repeated for each of the steps in the sequence being that there are multiple ADSR components as well as individual Pitch Sliders for each step
            break;
        case 2:
            // Action to be executed when the sequencer is at step 2
            adsrNode2.gain.setValueAtTime(
                1.0, 
                audioCtx.currentTime)

                oscillator.frequency.setValueAtTime(oscFreq + parseInt(VC0_Decay_AMT_Control.value),addedTime)
                oscillator2.frequency.setValueAtTime(oscFreq2 + parseInt(VC0_Decay_AMT_Control.value), addedTime)

                const newOsc1Freq2 = oscFreq + parseInt(pitchControl2.value)
                const newOsc2Freq2 = oscFreq2 + parseInt(pitchControl2.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq2, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq2, audioCtx.currentTime + addedTime)
            break;
        case 3:
            // Action to be executed when the sequencer is at step 3
            adsrNode3.gain.setValueAtTime(
                1.0, 
                audioCtx.currentTime)

                oscillator.frequency.setValueAtTime(oscFreq + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.setValueAtTime(oscFreq2 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                const newOsc1Freq3 = oscFreq + parseInt(pitchControl3.value)
                const newOsc2Freq3 = oscFreq2 + parseInt(pitchControl3.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq3, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq3, audioCtx.currentTime + addedTime)
            break;
        case 4:
            // Action to be executed when the sequencer is at step 4
            adsrNode4.gain.setValueAtTime(
                1.0, 
                audioCtx.currentTime)

                oscillator.frequency.setValueAtTime(oscFreq + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.setValueAtTime(oscFreq2 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                const newOsc1Freq4 = oscFreq + parseInt(pitchControl4.value)
                const newOsc2Freq4 = oscFreq2 + parseInt(pitchControl4.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq4, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq4, audioCtx.currentTime + addedTime)
            break;
        case 5:
            // Action to be executed when the sequencer is at step 5
            adsrNode5.gain.setValueAtTime(
                1.0, 
                audioCtx.currentTime)

                oscillator.frequency.setValueAtTime(oscFreq + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.setValueAtTime(oscFreq2 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                const newOsc1Freq5 = oscFreq + parseInt(pitchControl5.value)
                const newOsc2Freq5 = oscFreq2 + parseInt(pitchControl5.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq5, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq5, audioCtx.currentTime + addedTime)
            break;
        case 6:
            // Action to be executed when the sequencer is at step 6
            adsrNode6.gain.setValueAtTime(
                1.0, 
                audioCtx.currentTime)

                oscillator.frequency.setValueAtTime(oscFreq + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.setValueAtTime(oscFreq2 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                const newOsc1Freq6 = oscFreq + parseInt(pitchControl6.value)
                const newOsc2Freq6 = oscFreq2 + parseInt(pitchControl6.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq6, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq6, audioCtx.currentTime + addedTime)
            break;
        case 7:
            // Action to be executed when the sequencer is at step 7
            adsrNode7.gain.setValueAtTime(
                1.0, 
                audioCtx.currentTime)

                oscillator.frequency.setValueAtTime(oscFreq + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.setValueAtTime(oscFreq2 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                const newOsc1Freq7 = oscFreq + parseInt(pitchControl7.value)
                const newOsc2Freq7 = oscFreq2 + parseInt(pitchControl7.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq7, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq7, audioCtx.currentTime + addedTime)
            break;
        case 0:
            // Action to be executed when the sequencer is at step 8
            adsrNode8.gain.setValueAtTime(
                1.0, 
                audioCtx.currentTime)

                oscillator.frequency.setValueAtTime(oscFreq + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.setValueAtTime(oscFreq2 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                const newOsc1Freq8 = oscFreq + parseInt(pitchControl8.value)
                const newOsc2Freq8 = oscFreq2 + parseInt(pitchControl8.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq8, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq8, audioCtx.currentTime + addedTime)
            break;
        default:
            // Default action if the step index does not match any case

            break;
    }
    //This function plays the stopTone function every time a step is made in the sequence, this helps for short attacks and the percussive sound I want
    stopTone()
};
//this code for every note played ramps down the amplitudes of the note depending on the valude specified by the VCA Decay Slider
const stopTone = function() {
    const VCA_Value = parseFloat(VCA_Control.value)/1000 
    switch (currentStep) {
        case 1:
            // Action to be executed when the sequencer is at step 1
            adsrNode1.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + VCA_Value)
            break;
        case 2:
            // Action to be executed when the sequencer is at step 1
            adsrNode2.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + VCA_Value)
            break;
        case 3:
            // Action to be executed when the sequencer is at step 1
            adsrNode3.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + VCA_Value)
            break;
        case 4:
            // Action to be executed when the sequencer is at step 1
            adsrNode4.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + VCA_Value)
            break;
        case 5:
            // Action to be executed when the sequencer is at step 1
            adsrNode5.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + VCA_Value)
            break;
        case 6:
            // Action to be executed when the sequencer is at step 1
            adsrNode6.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + VCA_Value)
            break;
        case 7:
            // Action to be executed when the sequencer is at step 1
            adsrNode7.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + VCA_Value)
            break;
        case 0:
            // Action to be executed when the sequencer is at step 0
            adsrNode8.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + VCA_Value)
            break;
            // Add more cases for other steps as needed
            // Add more cases for other steps as needed
        // Add more cases for other steps as needed
        default:
            // Default action if the step index does not match any case
            console.log("Default action");
            break;
    }
};
// Event listeners
startButton.addEventListener('click', function () {
    const tempo = parseInt(tempoSlider.value);
    playSequencer(tempo);
});
  initialize_sound.addEventListener('click', initialize_button);
  stopButton.addEventListener('click', stopSequencer);
  resetButton.addEventListener('click', resetSequencer);
  tempoSlider.addEventListener('input', updateTempo);
  gainControl.addEventListener("input", updateGain);
  VCA_Control.addEventListener("input", updateDecay);
  filterFreqSlider.addEventListener("input", updateFilterFrequency);
  qControl.addEventListener("input", updateFilterQ);
  oscFreqSlider.addEventListener("input", updateOscFreq1);
  oscFreqSlider2.addEventListener("input", updateOscFreq2);
  oscTypeSwitch.addEventListener("change", toggleOscType1);
  oscTypeSwitch2.addEventListener("change", toggleOscType2);
  filterTypeSwitch.addEventListener("change", toggleFilterType);




