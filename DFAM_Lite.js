
//initializing WebAudioAPO and assigning the audio context to an object
const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();


//initializing HTML elements
const initialize_sound = document.getElementById("Initialize_Sound")
const startButton = document.getElementById("startButton");
const startRecording = document.getElementById("startRecording")
const stopRecording = document.getElementById("stopRecording")
const resetButton = document.getElementById("resetButton");
const oscTypeSwitch = document.getElementById("OSC_Type");
const oscTypeSwitch2 = document.getElementById("OSC2_Type");
const oscFreqSlider = document.getElementById("OSC_Freq");
const oscFreqSlider2 = document.getElementById("OSC2_Freq");
const oscGainSlider1 = document.getElementById("osc1gainSlider")
const oscGainSlider2 = document.getElementById("osc2gainSlider")
const whiteNoise_gain_slider = document.getElementById("whiteNoise_gain_slider")
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
const velControl1 = document.getElementById("velocity_1")
const velControl2 = document.getElementById("velocity_2")
const velControl3 = document.getElementById("velocity_3")
const velControl4 = document.getElementById("velocity_4")
const velControl5 = document.getElementById("velocity_5")
const velControl6 = document.getElementById("velocity_6")
const velControl7 = document.getElementById("velocity_7")
const velControl8 = document.getElementById("velocity_8")
// assigns the "steps" of my sequencer to an object
const steps = document.querySelectorAll('.step');

//assigning values to global objects with default values so that these can be accessed and changed within my functions
let filter;
let oscillator = null;
let oscillator2 = null;
let audioOutput = null
let attack = 10;
let decay = 200;
let intervalId;
let isPlaying = false;
let currentStep = 0;
let tempo = 120;
let newTempo;
let addedTime
let interval;
let intervalDuration;
let filterFrequency = 1000;
let oscFreq = 220;
let oscFreq2 = 220;
let VCO_Decay = 50;
let mediaRecorder;
let chunks = [];
let noiseBuffer;
let whiteNoise;
let white_noise_gain;


//creating new oscillator node
oscillator = audioCtx.createOscillator();
oscillator2 = audioCtx.createOscillator();


const osc1Gain = audioCtx.createGain()
const osc2Gain = audioCtx.createGain()


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

//setting initial values of Osc Gain nodes
osc1Gain.gain.value = 1 ;
osc2Gain.gain.value = 1 ;


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

oscillator.connect(osc1Gain)
oscillator2.connect(osc2Gain)
whiteNoise = audioCtx.createBufferSource();
white_noise_gain = audioCtx.createGain();
white_noise_gain.gain.value = .5; // Set initial volume


//connecting the Oscilator to the ADSR Note
osc1Gain.connect(adsrNode1);
osc1Gain.connect(adsrNode2);
osc1Gain.connect(adsrNode3);
osc1Gain.connect(adsrNode4);
osc1Gain.connect(adsrNode5);
osc1Gain.connect(adsrNode6);
osc1Gain.connect(adsrNode7);
osc1Gain.connect(adsrNode8);

//connects oscillator 2 to the adsr nodes
/*
*the reason there are so many of these is because I wanted the decay to be able to to extend past the attack of the next note
*the only way to do that was to have multiple ADSR channels running simultaniously, that way while one of them decays the next one can start, uneffected.
*/
osc2Gain.connect(adsrNode1);
osc2Gain.connect(adsrNode2);
osc2Gain.connect(adsrNode3);
osc2Gain.connect(adsrNode4);
osc2Gain.connect(adsrNode5);
osc2Gain.connect(adsrNode6);
osc2Gain.connect(adsrNode7);
osc2Gain.connect(adsrNode8);




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

function initialize_button () {
    
    noiseBuffer = createWhiteNoiseBuffer();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.connect(white_noise_gain);
    white_noise_gain.connect(adsrNode1)
    white_noise_gain.connect(adsrNode2)
    white_noise_gain.connect(adsrNode3)
    white_noise_gain.connect(adsrNode4)
    white_noise_gain.connect(adsrNode5)
    white_noise_gain.connect(adsrNode6)
    white_noise_gain.connect(adsrNode7)
    white_noise_gain.connect(adsrNode8)

    whiteNoise.start();
    oscillator.start();
    oscillator2.start();
};

function createWhiteNoiseBuffer() {
    const bufferSize = 2000 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // Generate random values between -1 and 1
    }

    return buffer;
};

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
    if (isPlaying==false) {
        const intervalDuration = 60000 / tempo;
    intervalId = setInterval(playStep, intervalDuration);
    isPlaying = true
    } else {
        clearInterval(intervalId);
        steps.forEach(step => step.classList.remove('active'));
        isPlaying = false
    }
};
// Function to stop the sequencer
// function stopSequencer() {
//     clearInterval(intervalId);
//     steps.forEach(step => step.classList.remove('active'));
// };
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

function updateOsc1Gain() {
    let sliderVal = parseFloat(oscGainSlider1.value)
    let linAmp = 10**(sliderVal/20)
    osc1Gain.gain.linearRampToValueAtTime(linAmp, audioCtx.currentTime + 0.05);
    console.log(linAmp)
};
function updateWhiteNoiseGain() {
    let sliderVal = parseFloat(whiteNoise_gain_slider.value)
    let linAmp = 10**(sliderVal/20)
    white_noise_gain.gain.linearRampToValueAtTime(linAmp, audioCtx.currentTime + 0.05);
    console.log(linAmp)
};
//updates the frequency of our Second Oscillator
function updateOscFreq2 () {
    oscFreq2 = parseInt(oscFreqSlider2.value)
    oscillator2.frequency.linearRampToValueAtTime(oscFreq2, audioCtx.currentTime + 0.05)
    document.getElementById("OSC2_Freq_display").innerText = `${oscFreq2} hz`
};

function updateOsc2Gain() {
    let sliderVal = parseFloat(oscGainSlider2.value)
    let linAmp = 10**(sliderVal/20)
    osc2Gain.gain.linearRampToValueAtTime(linAmp, audioCtx.currentTime + 0.05);
    console.log(linAmp)
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
    newTempo = parseInt(tempoSlider.value)

};
// updates our master gainNode value
function updateGain() {
    let sliderVal = parseFloat(gainControl.value)
    let linAmp = 10**(sliderVal/20)
    gainNode.gain.linearRampToValueAtTime(linAmp, audioCtx.currentTime + 0.05);
};
//updates our VCA decay which is the overall decay I use to control the length of the sound
function updateDecay () {
    let sliderVal = parseFloat(VCA_Control.value)
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
    if (tempo !== newTempo) {
    tempo = parseInt(tempoSlider.value);
    intervalDuration = 60000 / tempo;

     clearInterval(intervalId)
    intervalId = setInterval(playStep, intervalDuration)

    
}
    const miliToSeconds = intervalDuration / 1000
    addedTime = miliToSeconds * parseFloat(VC0_Decay_Control.value)
    //system of soloing functions so that we can create different results depending on the "step" of our sequencer
    switch (currentStep) {
        case 1:
            // Action to be executed when the sequencer is at step 1
                //resets adsr 1 gain to 1
                 adsrNode1.gain.setValueAtTime(
                    parseFloat(velControl1.value),
                     audioCtx.currentTime)
        
                //allows the user to create new freqencies within the sequency by either adding or subtracting from the original frequency using the "Pitch" sliders
                const newOsc1Freq1 = oscFreq * parseFloat(pitchControl1.value)
                const newOsc2Freq1 = oscFreq2 * parseFloat(pitchControl1.value)
                //brings the frequency back down to the frequency specified in the oscilator frequency Slider and changes the time it returns using the VCO DECAY slider
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq1 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq1 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq1, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq1, audioCtx.currentTime + addedTime)
                //This code is repeated for each of the steps in the sequence being that there are multiple ADSR components as well as individual Pitch Sliders for each step
            break;
        case 2:
            // Action to be executed when the sequencer is at step 2
            adsrNode2.gain.setValueAtTime(parseFloat(velControl2.value), audioCtx.currentTime)

              

                const newOsc1Freq2 = oscFreq * parseFloat(pitchControl2.value)
                const newOsc2Freq2 = oscFreq2 * parseFloat(pitchControl2.value)

                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq2 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq2 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq2, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq2, audioCtx.currentTime + addedTime)
            break;
        case 3:
            // Action to be executed when the sequencer is at step 3
            adsrNode3.gain.setValueAtTime(
                parseFloat(velControl3.value), 
                audioCtx.currentTime)

              

                const newOsc1Freq3 = oscFreq * parseFloat(pitchControl3.value)
                const newOsc2Freq3 = oscFreq2 * parseFloat(pitchControl3.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq3 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq3 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq3, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq3, audioCtx.currentTime + addedTime)
            break;
        case 4:
            // Action to be executed when the sequencer is at step 4
            adsrNode4.gain.setValueAtTime(
                parseFloat(velControl4.value), 
                audioCtx.currentTime)

                const newOsc1Freq4 = oscFreq * parseFloat(pitchControl4.value)
                const newOsc2Freq4 = oscFreq2 * parseFloat(pitchControl4.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq4 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq4 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq4, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq4, audioCtx.currentTime + addedTime)
            break;
        case 5:
            // Action to be executed when the sequencer is at step 5
            adsrNode5.gain.setValueAtTime(
                parseFloat(velControl5.value), 
                audioCtx.currentTime)

                const newOsc1Freq5 = oscFreq * parseFloat(pitchControl5.value)
                const newOsc2Freq5 = oscFreq2 * parseFloat(pitchControl5.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq5 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq5 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq5, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq5, audioCtx.currentTime + addedTime)
            break;
        case 6:
            // Action to be executed when the sequencer is at step 6
            adsrNode6.gain.setValueAtTime(
                parseFloat(velControl6.value), 
                audioCtx.currentTime)

                const newOsc1Freq6 = oscFreq * parseFloat(pitchControl6.value)
                const newOsc2Freq6 = oscFreq2 * parseFloat(pitchControl6.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq6 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq6 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq6, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq6, audioCtx.currentTime + addedTime)
            break;
        case 7:
            // Action to be executed when the sequencer is at step 7
            adsrNode7.gain.setValueAtTime(
                parseFloat(velControl7.value), 
                audioCtx.currentTime)

                const newOsc1Freq7 = oscFreq * parseFloat(pitchControl7.value)
                const newOsc2Freq7 = oscFreq2 * parseFloat(pitchControl7.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq7 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq7 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq7, audioCtx.currentTime + addedTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq7, audioCtx.currentTime + addedTime)
            break;
        case 0:
            // Action to be executed when the sequencer is at step 8
            adsrNode8.gain.setValueAtTime(
                parseFloat(velControl8.value), 
                audioCtx.currentTime)

                const newOsc1Freq8 = oscFreq * parseFloat(pitchControl8.value)
                const newOsc2Freq8 = oscFreq2 * parseFloat(pitchControl8.value)
                oscillator.frequency.linearRampToValueAtTime(newOsc1Freq8 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)
                oscillator2.frequency.linearRampToValueAtTime(newOsc2Freq8 + parseInt(VC0_Decay_AMT_Control.value), audioCtx.currentTime)

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
    const VCA_Value = ((60000/tempo) * parseFloat(VCA_Control.value))/1000 
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

function startRecordingbutton() {
    chunks = [];
    mediaRecorder = new MediaRecorder(getAudioStream());

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = function() {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.getElementById('downloadLink');
      downloadLink.href = url;
      downloadLink.download = 'DFAM_LITE_RECORDING.wav';
      downloadLink.style.display = 'block';
    };

    mediaRecorder.start();
    startRecording.disabled = true;
    stopRecording.disabled = false;
};

  function stopRecordingbutton() {
    mediaRecorder.stop();
    startRecording.disabled = false;
    stopRecording.disabled = true;
};

  function getAudioStream() {
    
    const destination = audioCtx.createMediaStreamDestination();
    gainNode.connect(destination)
    return destination.stream;
};

startRecording.addEventListener('click', startRecordingbutton);
stopRecording.addEventListener('click', stopRecordingbutton);
// Event listeners
startButton.addEventListener('click', function () {
    const tempo = parseInt(tempoSlider.value);
    playSequencer(tempo);
    this.classList.toggle("active")
});
  initialize_sound.addEventListener('click', initialize_button);
  resetButton.addEventListener('click', resetSequencer);
  tempoSlider.addEventListener('input', updateTempo);
  gainControl.addEventListener("input", updateGain);
  VCA_Control.addEventListener("input", updateDecay);
  filterFreqSlider.addEventListener("input", updateFilterFrequency);
  qControl.addEventListener("input", updateFilterQ);
  oscFreqSlider.addEventListener("input", updateOscFreq1);
  oscGainSlider1.addEventListener("input", updateOsc1Gain);
  oscFreqSlider2.addEventListener("input", updateOscFreq2);
  oscGainSlider2.addEventListener("input", updateOsc2Gain)
  oscTypeSwitch.addEventListener("change", toggleOscType1);
  oscTypeSwitch2.addEventListener("change", toggleOscType2);
  filterTypeSwitch.addEventListener("change", toggleFilterType);
  whiteNoise_gain_slider.addEventListener("input", updateWhiteNoiseGain)

  



