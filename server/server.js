import  express  from 'express'; // Backend handling Framework

import cors from 'cors';  //for cross orgin requests

import * as dotenv from 'dotenv'; // for secure environment variables


//import {Configuration, OpenAIApi} from 'openai';  // Wrappers by OpenAI to simplify the use of OpenAI api.

import OpenAI from 'openai';

dotenv.config();
// console.log(process.env.OPENAI_API_KEY);
//For starting the configuration of server and to use the dot env variables.


// configuration function - Accepts an object as the arguement and we pass into it our api key that is kept equal to process.env.OPENAI_API_KEY
const configuration = new OpenAI({
    apiKey : process.env.OPENAI_API_KEY,
});



// Create an instance of openAI api by writing and passing the configuration into it 
const openai = new OpenAI(configuration);

// Starting/Initalizing our application using express by saying
const app = express();

// Setting up middlewares 
// 1. cors - middleware used for requests b/w frontend and backend

// 2. Express.json - middleware used for passing data from frontend to backend in JSON format.

app.use(cors()); // Allows us to make cross origin requests , In this app its usage is to allow us to send the request from the client or the frontend to the server.

app.use(express.json());  // Allows us to pass the json from the frontend to the backend.

// Creation of Dummy root route to get data from the backend.

app.get('/', async(req , res) => {
    res.status(200).send({
        message: 'Hello from the CodeAPT'
    })
});


// Post function is used for the post the requested message by server side to the client side.

app.post('/', async (req, res) => {
    try {
      const prompt = req.body.prompt;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [{
            "role": "user",
            "content": `${prompt}`
          }],
        
        temperature: 0,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.7,
        presence_penalty: 0,
      });
    //   alert(response.choices[0].text)

      res.status(200).send({
        bot: response.choices[0].message.content.toString()
      });
    } catch (error) {
      console.error(error)
      res.status(500).send(error || 'Something went wrong');
    }
  })
  

app.listen(5000, () => console.log('Server running on port http://localhost:5000'));




 