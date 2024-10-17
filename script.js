let substitution = {};
let reverseSubstitution = {};
const key = "secureKey123";

// Function to calculate shift value from key
function getCaesarShiftFromKey(key) {
    let shiftValue = 0;
    for (let i = 0; i < key.length; i++) {
        shiftValue += key.charCodeAt(i);
    }
    return shiftValue % 26;
}

const shiftValue = getCaesarShiftFromKey(key);

// Function to create a deterministic seeded substitution cipher
function generateSeededSubstitution(seed) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let shuffled = alphabet.split('');
    const seedNumber = parseInt(seed);

    // Use a consistent approach to shuffle based on the seed
    for (let i = 0; i < shuffled.length; i++) {
        const swapIndex = (i + seedNumber + i * i) % shuffled.length; // Deterministic swap based on seed
        [shuffled[i], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i]];
    }

    for (let i = 0; i < alphabet.length; i++) {
        substitution[alphabet[i]] = shuffled[i];
        reverseSubstitution[shuffled[i]] = alphabet[i];
    }
}

// Function to encrypt the message
function cipher() {
    const input = document.getElementById('plainText').value;
    const seed = document.getElementById('seedValue').value;
    generateSeededSubstitution(seed); // Use the user-provided seed
    const encrypted = encode(input);
    const numberEncoded = convertToNumbers(encrypted);
    document.getElementById('cipherResult').innerText = numberEncoded;
}

// Function to encode the input message
function encode(input) {
    let encodedMessage = '';
    for (let char of input) {
        if (char >= 'A' && char <= 'Z') {
            encodedMessage += '*' + (substitution[char] || char);
        } else {
            encodedMessage += substitution[char] || char;
        }
    }

    let shiftedMessage = '';
    for (let char of encodedMessage) {
        let code = char.charCodeAt(0);
        if (char >= 'a' && char <= 'z') {
            code += shiftValue;
            if (code > 'z'.charCodeAt(0)) code -= 26;
        }
        shiftedMessage += (char >= '0' && char <= '9') ? char : String.fromCharCode(code);
    }

    return shiftedMessage;
}

// Function to convert encoded message to numbers
function convertToNumbers(input) {
    let numberEncodedMessage = '';
    for (let char of input) {
        numberEncodedMessage += char.charCodeAt(0).toString().padStart(3, '0');
    }
    return numberEncodedMessage;
}

// Function to decrypt the message
function decipher() {
    const input = document.getElementById('cipherText').value;
    const seed = document.getElementById('seedValue').value;
    generateSeededSubstitution(seed); // Use the user-provided seed
    const decodedString = convertFromNumbers(input.replace(/\s+/g, ''));
    const deciphered = decode(decodedString);
    document.getElementById('decipherResult').innerText = deciphered;
    setTimeout(() => {
        document.getElementById('decipherResult').innerText = '';
    }, 10000);
}

// Function to convert numbers back to characters
function convertFromNumbers(input) {
    let decodedMessage = '';
    for (let i = 0; i < input.length; i += 3) {
        const charCode = parseInt(input.substring(i, i + 3));
        decodedMessage += String.fromCharCode(charCode);
    }
    return decodedMessage;
}

// Function to decode the input
function decode(input) {
    let decodedMessage = '';
    for (let char of input) {
        let code = char.charCodeAt(0);
        if (char >= 'a' && char <= 'z') {
            code -= shiftValue;
            if (code < 'a'.charCodeAt(0)) code += 26;
        }
        decodedMessage += (char >= '0' && char <= '9') ? char : String.fromCharCode(code);
    }

    let finalDecodedMessage = '';
    let isCapital = false;
    for (let char of decodedMessage) {
        if (char === '*') {
            isCapital = true;
            continue;
        }
        let decodedChar = reverseSubstitution[char] || char;
        if (isCapital) {
            decodedChar = decodedChar.toUpperCase();
            isCapital = false;
        }
        finalDecodedMessage += decodedChar;
    }
    return finalDecodedMessage;
}

function copyToClipboard() {
    const cipherText = document.getElementById('cipherResult').innerText;
    navigator.clipboard.writeText(cipherText).then(() => {
        const resultArea = document.getElementById('cipherResult');
        resultArea.innerText = 'Numbers copied ✔️'; // Change the text to indicate success
        
        // Reset the text back to empty after 3 seconds
        setTimeout(() => {
            resultArea.innerText = ''; // Resetting the result area after 3 seconds
        }, 3000);
        
        // Clear the plain text input
        document.getElementById('plainText').value = '';
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Function to handle mouse down and mouse up on the eye icon
function toggleSeedVisibilityOnMouseHold() {
    const seedInput = document.getElementById('seedValue');
    const toggleIcon = document.querySelector('.password-toggle-icon i');

    // Show the seed value when mouse button is held down
    seedInput.type = 'text';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');

    // Set up mouseup event to hide the seed value when released
    const mouseUpHandler = () => {
        seedInput.type = 'password'; // Change to password to hide the seed
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');

        // Remove the mouseup event listener
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    // Add mouseup event listener
    document.addEventListener('mouseup', mouseUpHandler);
}

// Timer to keep the eye icon visible after losing focus
let timer;

document.getElementById('seedValue').addEventListener('focus', function() {
    const eyeButton = document.querySelector('.password-toggle-icon');
    eyeButton.classList.add('visible'); // Show the eye icon
    clearTimeout(timer); // Clear any existing timer
});

// Show the eye icon when there is input
document.getElementById('seedValue').addEventListener('input', function() {
    const eyeButton = document.querySelector('.password-toggle-icon');
    if (this.value.trim() !== '') {
        eyeButton.classList.add('visible'); // Show the eye icon when there's input
    } else {
        eyeButton.classList.remove('visible'); // Hide it if the input is empty
    }
});

// Add mouse down event listener for the eye icon
document.querySelector('.password-toggle-icon').addEventListener('mousedown', function(event) {
    // Prevent the input field from losing focus when clicking the eye icon
    event.preventDefault();
    toggleSeedVisibilityOnMouseHold();
});
