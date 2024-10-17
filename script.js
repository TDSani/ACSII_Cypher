let substitution = {};
let reverseSubstitution = {};
const key = "secureKey123"; // Key used for Caesar shift

// Function to derive a Caesar shift value from a key
function getCaesarShiftFromKey(key) {
    let shiftValue = 0;
    for (let i = 0; i < key.length; i++) {
        shiftValue += key.charCodeAt(i);
    }
    return shiftValue % 26; // Keep shift value between 0 and 25
}

const shiftValue = getCaesarShiftFromKey(key);

// Function for seeded random number generator
function seededRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Function to generate a seeded substitution cipher
function generateSeededSubstitution(seed) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const shuffled = alphabet.split('').sort(() => seededRandom(seed) - 0.5).join('');

    for (let i = 0; i < alphabet.length; i++) {
        substitution[alphabet[i]] = shuffled[i];
        reverseSubstitution[shuffled[i]] = alphabet[i];
    }
}

function cipher() {
    const input = document.getElementById('plainText').value;
    const seed = parseInt(document.getElementById('seedValue').value); // Get seed from input
    generateSeededSubstitution(seed);  // Generate substitution cipher with the seed
    const encrypted = encode(input);
    const numberEncoded = convertToNumbers(encrypted);  // Converting to number encoding
    document.getElementById('cipherResult').innerText = numberEncoded;
}

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

        // Shift lowercase letters only (uppercase marked with *)
        if (char >= 'a' && char <= 'z') {
            code += shiftValue;
            if (code > 'z'.charCodeAt(0)) code -= 26;
        }

        shiftedMessage += (char >= '0' && char <= '9') ? char : String.fromCharCode(code);
    }

    return shiftedMessage;
}

// Function to convert the string to number encoding
function convertToNumbers(input) {
    let numberEncodedMessage = '';
    for (let char of input) {
        numberEncodedMessage += char.charCodeAt(0).toString().padStart(3, '0');  // ASCII with zero-padding
    }
    return numberEncodedMessage;
}

function decipher() {
    const input = document.getElementById('cipherText').value;
    const seed = parseInt(document.getElementById('seedValue').value); // Get seed from input
    generateSeededSubstitution(seed);  // Generate substitution cipher with the seed
    const decodedString = convertFromNumbers(input.replace(/\s+/g, ''));  // Remove line breaks
    const deciphered = decode(decodedString);
    document.getElementById('decipherResult').innerText = deciphered;

    // Auto clear the deciphered message after 5 seconds (5000 milliseconds)
    setTimeout(() => {
        document.getElementById('decipherResult').innerText = '';
    }, 5000);
}

// Function to convert the number encoded message back to string
function convertFromNumbers(input) {
    let decodedMessage = '';
    for (let i = 0; i < input.length; i += 3) {
        const charCode = parseInt(input.substring(i, i + 3));
        decodedMessage += String.fromCharCode(charCode);
    }
    return decodedMessage;
}

function decode(input) {
    let decodedMessage = '';

    // Reverse Caesar shift for lowercase letters
    for (let char of input) {
        let code = char.charCodeAt(0);

        if (char >= 'a' && char <= 'z') {
            code -= shiftValue;
            if (code < 'a'.charCodeAt(0)) code += 26;
        }

        decodedMessage += (char >= '0' && char <= '9') ? char : String.fromCharCode(code);
    }

    // Apply reverse substitution
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

// Function to copy the encrypted numbers to clipboard
function copyToClipboard() {
    const cipherText = document.getElementById('cipherResult').innerText;
    navigator.clipboard.writeText(cipherText).then(() => {
        alert('Encrypted numbers copied to clipboard!');

        // Clear the encrypted message and the input field after copying
        document.getElementById('cipherResult').innerText = ''; // Clear the displayed numbers
        document.getElementById('plainText').value = ''; // Clear the input field
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Function to toggle the visibility of the seed value
function toggleSeedVisibility() {
    const seedInput = document.getElementById('seedValue');
    const eyeButton = document.querySelector('.eye-button');

    if (seedInput.type === 'password') {
        seedInput.type = 'text';
        eyeButton.innerHTML = '👁️'; // Show eye icon
    } else {
        seedInput.type = 'password';
        eyeButton.innerHTML = '👁️'; // Hide eye icon
    }
}
