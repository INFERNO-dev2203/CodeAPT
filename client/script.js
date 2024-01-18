import user from "./user.svg";
import bot from "./bot.svg";
import axios from "axios";

// Targeting form and storing it into variable form
const form = document.querySelector("form");

// Targeting chatContainer and storing it into variable chatContainer
const chatContainer = document.querySelector("#chat_container");

let loadInterval;  // variable - will be filled later

// Dot Loader function -  This function renders dot in the chat's reply while it is fetching data from the openAI api
function loader(element) {
    // text content ko khaali string ke equal set kardo
    element.textContent = '';

    //jab dot add karne hain toh ye loadInterval dot add karega aur fir jaise hi 3 se zyada dots honge toh textContent ko reset kardo to empty string
    loadInterval = setInterval(() => {
        element.textContent += '.';


        if (element.textContent === '....') {
            element.textContent = '';
        }
        //Ye kaam har 300 ms pr karna hai isliye setInterval ka use kiya hai.
    }, 300)
}

//TypeText Function - function to type the text one letter at a time
// This is required qki client expect karega ki AI uske question ka reply kar rha hai.. aur hum nhi chahte ki api jo answer de wo ekdum se appear ho jaaye screen par
function typeText(element, text) {
    let indexOfEachAnswerCharacter = 0;

    let intervalForEachAnswer = setInterval(() => {

        // This means if text's length is still greater than index of our answer this means AI is still typing therefore until this condition is true
        if(text.length > indexOfEachAnswerCharacter){

        // add the required character at specified index to element's inner HTML and then increment the index until above if condition is voilated
            element.innerHTML += text.charAt(indexOfEachAnswerCharacter);
            indexOfEachAnswerCharacter++;
        } else {
            // if we reached the end of text then clear the interval and this will happen for each answer.
            clearInterval(intervalForEachAnswer);
        }

    },20)
    
}

// Generate Unique ID function - This function generates unique ID for each message so that its easier for us to map each message in the furture if required
// In JS and many other programming languages we use current date and time to generate ID of messages as they are always unique.
function generateUniqueIDForEachMessage() {
    const timeStamp = Date.now(); // using date and time of message arrival.

    const randomNumber = Math.random(); // using a random number to make string more random 

    const hexadecimalString = randomNumber.toString(16);  // converting the generated random number to hexadecimal string.

    return `id-${timeStamp}-${hexadecimalString}`;
}

// Chat Stripe function - This function creates different stripes for AI's response as well as user's question
// When AI giving an answer in that case bot's image will be seen, to let users percieve that AI is typing the answer
// And when user has asked some question to AI then user image will be seen on the place of bot's image
function chatStripe(isAI, valueOfAnswer, uniqueID){
    return(
        `
        <div class = "wrapper ${isAI && 'ai'}">
            <div class = "chat">
                <div class = "profile">
                    <img
                        src = ${isAI ? bot : user}
                        alt = "${isAI ? "bot" : "user"}"
                    />
                </div>
                <div class = "message" id = ${uniqueID}>${valueOfAnswer}</div>
            </div>
        </div>
        `
    )
}

// Handle Submit function - As tha name suggests this function handles the functionality after the submit button is clicked.
// POINTS TO REMEMBER
// $ This will be an async function as we want to call it anytime, whenever submit btn is clicked.
// $ Since, we want to prevent the default behaviour of our browser that is reloading every time for a new response therefore with the event passed into async function we use perventDefault() function to prevent reloading.

const handleSubmit = async (e) => {
    e.preventDefault(); // As soon as the submit button is clicked, the page will be reloaded. 
    // Tothe loading, this preventDefault() method is us

    const data = new FormData(form); //Data will be fetched from the textarea and kept into this data variable.

    // Once question is asked to AI we and submit button is clicked the user want to see their question's chatstripe to appear
    // Therefore we add users chatstripe to chat container with the question or the prompt 
    // user's chatstripe 
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    // after getting the question reset the form 
    form.reset();

    // Now after user's chatstripe AI will reply in that case we need to render AI's answer, but before that we need to generate unique ID by using our generate unique id function
    const uniqueID = generateUniqueIDForEachMessage();

    // after generating unique ID add the chatstripe of AI's answer to the chat container 
    chatContainer.innerHTML += chatStripe(true, ' ', uniqueID);

    // The empty space provided between the single quotes will be filled by the AI's answer

    // There could be cases when AI's answer will be greater than the view size of chat container and in that case we need to add up the answer to height of view. 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // store the element by unique id into a variable called messageDiv that will be added to loader.
    const messageDiv = document.getElementById(uniqueID);

    loader(messageDiv);

    // fetching the data from server i.e bot is giving the response
    // const response = await fetch('http://localhost:5000',{
    //     method : 'POST',
    //     headers:{
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer $OPENAI_API_KEY`
    //     },
    //     body: JSON.stringify({
    //         prompt: data.get('prompt')
    //     })
    // })

    const response = await axios.post('https://codeapt-appetite-for-code.onrender.com', {
        prompt: data.get('prompt')
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer $OPENAI_API_KEY`
        }
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if(response.status === 200){
        const data = await response.data
        // console.log(data);
        const parsedData = data.bot.trim()  // Trims any extra spaces

        typeText(messageDiv, parsedData);

    } else {
        const err = await response.toString();

        messageDiv.innerHTML = 'Something went wrong!';
        console.log(err);
        alert(err);
        
    }
}

//This addEventListener() method is a higher order function that will call handleSubmit() function as soon as the submit button is clicked.
form.addEventListener('submit',handleSubmit);

















