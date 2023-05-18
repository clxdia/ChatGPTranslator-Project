import { useRef, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineContentCopy,
  MdOutlineContentPaste,
} from "react-icons/md";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { RiDeleteBin5Line } from "react-icons/ri";

import "../src/styles/index.scss";

const idioms = [
  { idiom: "Italian", code: "it" },
  {
    idiom: "Spanish",
    code: "es",
  },
  {
    idiom: "French",
    code: "fr",
  },
  {
    idiom: "Chinese (Simplified)",
    code: "zh",
  },

  {
    idiom: "German",
    code: "de",
  },
  {
    idiom: "Japanese",
    code: "ja",
  },
  {
    idiom: "Korean",
    code: "ko",
  },
  {
    idiom: "Arabic",
    code: "ar",
  },
  {
    idiom: "Greek",
    code: "el",
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
  const [definitions, setDefinitions] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [dropdown, openDropdown] = useState("");
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef(null);

  const [selectedLanguage, setSelectedLanguage] = useState(idioms[0]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const prompt = `Translate this english text "${text}" to ${selectedLanguage.idiom}`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 1,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    setResponse(response.data.choices[0].text.replace(/\n|"/g, ""));
    setLoading(false);

    fetch(
      `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${
        import.meta.env.VITE_YANDEX_API
      }&lang=en-en&text=${text}`
    )
      .then((res) => {
        if (!res.ok) {
          throw Error("error");
        }
        return res.json();
      })
      .then((data) => {
        setSynonyms(data?.def[0]);
      });

    const URL = `https://lexicala1.p.rapidapi.com/search-entries?text=${response.data.choices[0].text.toLowerCase()}&page=1&language=${
      selectedLanguage.code
    }`;

    fetch(URL, {
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_LEXICALA_API,
        "X-RapidAPI-Host": "lexicala1.p.rapidapi.com",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw Error("error");
        }
        return res.json();
      })
      .then((data) => {
        setDefinitions(data.results[0]);
      });
  }

  const copyInput = () => {
    navigator.clipboard.writeText(text);
  };

  const copyRes = () => {
    navigator.clipboard.writeText(response);
  };

  const input = useRef(null);

  const clearInput = () => {
    if (input.current) {
      input.current.value = "";
    }
  };

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
            <button type="button">English</button>
            <textarea
              ref={input}
              value={text}
              name="text"
              onChange={(event) => setText(event.target.value)}
            ></textarea>
            <div className="input__icons">
              <MdOutlineContentCopy onClick={copyInput} />
              <RiDeleteBin5Line onClick={clearInput} />
            </div>
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

            <textarea
              defaultValue={loading ? "Loading..." : response}
            ></textarea>
            <div className="output__icons">
              <MdOutlineContentCopy onClick={copyRes} />
            </div>
          </div>
        </form>
      </section>

      <section className="content__below">
        <div className="content__below__definitions">
          {synonyms && (
            <div>
              <p>
                Synonyms of <b>{synonyms?.text}</b>
              </p>
              <i>{synonyms?.pos}</i>
              <ul>
                {synonyms?.tr.map((text) => (
                  <li key={text?.text}>
                    <b>{text?.text}</b> <i>{text?.pos}</i>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {definitions && (
          <div className="content__below__synonyms">
            <p>Definitions of {definitions?.headword?.text}</p>
            <p>
              <i>{definitions?.headword?.pos}</i>{" "}
              {definitions?.headword?.gender}
            </p>
            <i>{definitions?.headword?.pronunciation?.value}</i>
            <ul>
              {definitions?.headword?.alternative_scripts?.map((text) => (
                <li key={text?.text}>
                  {text?.text} <span>{text?.type}</span>
                </li>
              ))}
            </ul>
            <ul>
              {definitions?.senses.map((text) => (
                <>
                  <li key={text?.id}>{text?.definition}</li>
                  <ul>
                    {text?.examples?.map((text) => (
                      <li key={text?.text}>{text?.text}</li>
                    ))}
                  </ul>
                </>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
