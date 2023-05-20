import { useRef, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineContentCopy,
} from "react-icons/md";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { BsArrowReturnRight } from "react-icons/bs";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

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
  const [history, setHistory] = useState(false);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(idioms[0]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const prompt = `Translate this english text "${text}" to ${selectedLanguage.idiom}`;
    setHistory(false);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 1,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    setResponse(response.data.choices[0].text.replace(/\n|"|\.|!|\?/g, ""));

    setHistory(true);
    const translation = {
      input: text,
      output: response.data.choices[0].text.replace(/\n|"|\.|!|\?/g, ""),
      language: selectedLanguage.idiom,
    };
    setTranslationHistory((prevHistory) => [...prevHistory, translation]);

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

    fetch(
      `https://lexicala1.p.rapidapi.com/search-entries?text=${response.data.choices[0].text.toLowerCase()}&page=1&language=${
        selectedLanguage.code
      }`,
      {
        headers: {
          "X-RapidAPI-Key": import.meta.env.VITE_LEXICALA_API,
          "X-RapidAPI-Host": "lexicala1.p.rapidapi.com",
        },
      }
    )
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

  const swiper = useRef(null);

  const swipePrev = () => {
    if (swiper.current) {
      const currentScrollLeft = swiper.current.scrollLeft;
      const slideWidth = swiper.current.offsetWidth / 3;
      swiper.current.scrollLeft = currentScrollLeft - slideWidth;
    }
  };

  const swipeNext = () => {
    if (swiper.current) {
      const currentScrollLeft = swiper.current.scrollLeft;
      const slideWidth = swiper.current.offsetWidth / 3;
      swiper.current.scrollLeft = currentScrollLeft + slideWidth;
    }
  };

  return (
    <div className="homepage">
      <section className="content__above">
        <div className="blue__background"></div>
        <section
          className={
            dropdown ? "content__languages_open" : "content__languages"
          }
        >
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

        <form className="form">
          <div className="input">
            <div className="input__mobile">
              <button type="button">English</button>
              {idioms && (
                <button
                  className="language__selector__mobile"
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
            </div>
            <button type="button" className="button__desktop">
              English
            </button>

            <textarea
              ref={input}
              value={text}
              name="text"
              onChange={(event) => setText(event.target.value)}
            ></textarea>
            <div className="input__icons">
              <RiDeleteBin5Line onClick={clearInput} size={19} />
              <MdOutlineContentCopy onClick={copyInput} size={19} />
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
              <MdOutlineContentCopy onClick={copyRes} size={19} />
            </div>
          </div>
        </form>
      </section>

      <section className="content__below">
        <div className="grey__background"></div>
        <div className="content__below__container">
          {synonyms && (
            <div className="content__below__synonyms">
              <p>
                Synonyms of <b>{synonyms?.text}</b>
              </p>
              <i>{synonyms?.pos}</i>
              <ul>
                {synonyms?.tr.map((text) => (
                  <li
                    key={text?.text}
                    className="content__below__synonyms__list"
                  >
                    <b>{text?.text}</b>
                    <span> </span> <i>{text?.pos}</i>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {definitions && (
            <div className="content__below__definitions">
              <p>
                Definitions of <b>{definitions?.headword?.text}</b>{" "}
              </p>
              <p>
                <i>{definitions?.headword?.pronunciation?.value}</i>
              </p>
              <p>
                <i>{definitions?.headword?.pos}</i>
                {definitions?.headword?.gender ? (
                  <i>• {definitions?.headword?.gender}</i>
                ) : (
                  <i></i>
                )}
              </p>

              <ul>
                {definitions?.headword?.alternative_scripts?.map((text) => (
                  <li key={text?.text}>
                    <p>
                      {text?.text} <i>{text?.type}</i>
                    </p>
                  </li>
                ))}
              </ul>
              {definitions?.senses.map((text) => (
                <ul className="definitions">
                  <li key={text?.id}>
                    <p className="definitions__main">{text?.definition}</p>
                  </li>
                  <ul>
                    {text?.examples?.map((text) => (
                      <li key={text?.text}>
                        <p className="definitions__examples">
                          <BsArrowReturnRight />
                          {text?.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </ul>
              ))}
            </div>
          )}
        </div>
      </section>

      {history ? (
        <section className="content__history">
          <div className="content__history__title">
            <h2>Last translations</h2>
            <div>
              <IoIosArrowBack size={25} onClick={swipePrev} />
              <IoIosArrowForward size={25} onClick={swipeNext} />
            </div>
          </div>

          <div className="content__history__container" ref={swiper}>
            {translationHistory
              .slice(0)
              .reverse()
              .map((translation, index) => (
                <div key={index} className="history">
                  <p>{translation.input}</p>
                  <p>{translation.output}</p>
                </div>
              ))}
          </div>
        </section>
      ) : (
        <></>
      )}

      <footer>
        <hr className="footer__divider"></hr>
      </footer>
    </div>
  );
}

export default App;
