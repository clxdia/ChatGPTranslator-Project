import { useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdLanguage,
  MdOutlineContentCopy,
} from "react-icons/md";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";

import "../src/styles/index.scss";

const idioms = [
  { idiom: "English", code: "en-en" },
  {
    idiom: "Spanish",
    code: "es-en",
  },
  {
    idiom: "French",
    code: "fr-en",
  },
  {
    idiom: "Chinese (Simplified)",
    code: "zh-en",
  },

  {
    idiom: "German",
    code: "de-en",
  },
  {
    idiom: "Japanese",
    code: "jp-en",
  },
  {
    idiom: "Korean",
    code: "kr-en",
  },
  {
    idiom: "Arabic",
    code: "ar-en",
  },
  {
    idiom: "Greek",
    code: "el-en",
  },
];

function App() {
  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const [response, setResponse] = useState("");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("");
  const [definition, setDefinition] = useState("");
  const [dropdown, openDropdown] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState(idioms[0]);

  async function handleSubmit(event) {
    event.preventDefault();

    // setText(event.target.text.value);
    // setLanguage(selectedLanguage.code);
    // setLanguage(event.target.language.value);
    // setLanguage(selectedLanguage.idiom);
    setLoading(true);
    const prompt = `Translate this italian text "${text}" to ${selectedLanguage.idiom}`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 1,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    setResponse(response.data.choices[0].text.replace(/\n/g, ""));
    setLoading(false);
    console.log(response.data.choices);

    // fetch(
    //   `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${
    //     import.meta.env.VITE_YANDEX_API
    //   }&lang=${language}&text=${response.data.choices[0].text}`
    // )
    //   .then((res) => {
    //     if (!res.ok) {
    //       throw Error("error");
    //     }
    //     return res.json();
    //   })
    //   .then((data) => {
    //     setDefinition(data?.def[0]);
    //     console.log(data?.def[0]);
    //   });
  }

  return (
    <div className="homepage">
      {dropdown && (
        <section className="content__languages">
          <ul>
            {idioms &&
              idioms.map((idiom) => (
                <li key={idiom.code}>
                  <button
                    onClick={() => setSelectedLanguage(idiom)}
                    value={idiom.idiom}
                  >
                    {idiom.idiom}
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="content__above">
        <form className="form">
          <div className="input">
            <button type="button">Italiano</button>
            <textarea
              value={text}
              name="text"
              onChange={(event) => setText(event.target.value)}
            ></textarea>
            <text className="input__icons">
              <MdOutlineContentCopy />
            </text>
          </div>

          <button type="submit" onClick={handleSubmit}>
            <HiOutlineSwitchHorizontal size={30} />
          </button>

          <div className="output">
            {idioms && (
              <button
                className="language__selector"
                onClick={() => openDropdown(!dropdown)}
                value={language}
                name="language"
                type="button"
                onChange={(event) => setLanguage(event.target.value)}
              >
                {selectedLanguage.idiom}{" "}
                {dropdown ? (
                  <MdKeyboardArrowUp size={20} />
                ) : (
                  <MdKeyboardArrowDown size={20} />
                )}
              </button>
            )}

            <textarea value={loading ? "Loading..." : response}></textarea>
            <div className="output__icons">
              <MdOutlineContentCopy />
            </div>
          </div>
        </form>
      </section>
      {/* <section className="content__below">
        <div className="content__below__definitions">
          {definition && <p>{definition?.text}</p>}
        </div>
        <div className="content__below__synonyms">
          <p>Definitions</p>
        </div>
      </section> */}
    </div>
  );
}

export default App;
