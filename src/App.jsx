import { useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import { MdKeyboardArrowDown } from "react-icons/md";

import "../src/styles/index.scss";

function App() {
  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const [response, setResponse] = useState("");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("italian");

  async function handleSubmit(event) {
    event.preventDefault();

    setText(event.target.text.value);
    setLanguage(event.target.language.value);

    const prompt = `Can you translate this italian text "${text}" to ${language}`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 1,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    setResponse(response.data.choices[0].text);
  }

  return (
    <div className="homepage">
      <div className="form">
        <form onSubmit={handleSubmit} className="form__container">
          <textarea
            value={text}
            name="text"
            onChange={(event) => setText(event.target.value)}
          ></textarea>
          <select
            value={language}
            name="language"
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="spanish">Spanish</option>
            <option value="italian">Italian</option>
          </select>
          <button type="submit">Translate</button>
          <textarea value={response}></textarea>
        </form>
      </div>
    </div>
  );
}

export default App;
