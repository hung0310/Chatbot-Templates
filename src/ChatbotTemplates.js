import React, { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import styles from "./ChatbotTemplates.module.scss";
import PropTypes from 'prop-types';

//animations
import wave from "./assets/animations/wave.json";
import wave_voice from "./assets/animations/wave_voice.json";

//images
import logoIcon from './assets/images/assistant.png';
import chatbotBg from './assets/images/background.svg';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faUpRightAndDownLeftFromCenter,
  faXmark,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";

import { faComments } from "@fortawesome/free-regular-svg-icons";

const ChatbotTemplates = ({
  LogoIcon,
  ChatbotIcon,
  Title,
  TitleColor,
  TitleBgColor,
  HolderInputText,
  BadgeNumber,
  BgColor,
  BgMaskColor,
  BgOpacity,
  BgMaskImg,
  MainColor,
  SubColor,
  AudioShow,
  initialMessages,
  apiEndpoint,
}) => {
  const [isShowChatbot, setIsShowChatbot] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);
  const chatbotRef = useRef(null);
  const messagesRef = useRef(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageClient, setMessageClient] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  // Formats response to Markdown
  const parseMarkdown = (text) => {
    let parsed = text;
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    parsed = parsed.replace(/\*([^\n*]+)(?:\n|$)/g, "<li>- $1</li>");
    if (parsed.includes("<li>")) {
      parsed = `<ul>${parsed}</ul>`;
    }
    return parsed;
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Calls the API endpoint
  const customApiCall = async (message) => {
    const updatedMessages = [...messages, { role: "user", content: message }];

    try {
      const timestamp = Date.now();

      const result = await fetch(
        apiEndpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatInput: updatedMessages, sessionId: timestamp }),
        }
      );

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || "API request failed");
      }

      const data = await result.json();
      const response = data?.output || "🤖 Không có phản hồi từ chatbot.";
      // console.log("Response_GooUp1: ", response);
      return response;
    } catch (error) {
      console.error("Error calling API:", error);
      return `🤖 Có lỗi xảy ra: ${error.message}`;
    }
  };

  // Adds processed response to messages
  const handleBotResponse = (response) => {
    const parsedResponse = parseMarkdown(response);
    setMessages((prevMessages) => {
      const filteredMessages = prevMessages.filter(
        (msg) => msg.role !== "assistant" || msg.content !== "🤖 ● ● ●  "
      );
      return [
        ...filteredMessages,
        { role: "assistant", content: parsedResponse },
      ];
    });
    setIsProcessing(false);
  };

  // Handles keyboard events
  const handleKeyDownMessage = (event) => {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        textareaRef.current.value += "";
      } else {
        event.preventDefault();
        if (messageClient) {
          textareaRef.current.value = "";
          handleSendMessage();
        }
      }
    }
  };

  // Handles message input change
  const handleChangeMessage = (event) => {
    const message_client = event.target.value;
    setMessageClient(message_client);
  };

  // Sends the message
  const handleSendMessage = async () => {
    textareaRef.current.value = "";
    if (messageClient.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: messageClient },
      ]);

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "🤖 ● ● ●  " },
      ]);
      setIsProcessing(true);

      const botResponse = await customApiCall(messageClient);
      handleBotResponse(botResponse);
      setMessageClient("");
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
    }
  };

  // Adjusts textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const adjustHeight = () => {
        textarea.style.height = "45";
        const minHeight = 45;
        const maxHeight = 100;
        const scrollHeight = textarea.scrollHeight;
        const newHeight = Math.max(
          minHeight,
          Math.min(scrollHeight, maxHeight)
        );
        textarea.style.height = `${newHeight}px`;
        console.log(
          "scrollHeight:",
          scrollHeight,
          "newHeight:",
          newHeight,
          "computedHeight:",
          textarea.offsetHeight
        );
      };

      textarea.style.height = "45px";
      adjustHeight();

      textarea.addEventListener("input", adjustHeight);

      return () => {
        textarea.removeEventListener("input", adjustHeight);
      };
    }
  }, [messageClient]);

  // Closes chatbot when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsShowChatbot(false);
        setIsExpanded(false);
      }
    };

    if (isShowChatbot) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShowChatbot]);

  // Toggles chatbot visibility
  const handleClickShowChatbot = () => {
    setIsShowChatbot(!isShowChatbot);
    console.log(isShowChatbot);
  };

  // Expands or collapses chatbot
  const handleClickExpand = () => {
    setIsExpanded(!isExpanded);
    const chatbot = chatbotRef.current;
    const offset = 85;

    if (!isExpanded) {
      const expandedWidth = window.innerWidth - offset * 2;
      const expandedHeight = window.innerHeight - offset;
      chatbot.style.width = `${expandedWidth}px`;
      chatbot.style.height = `${expandedHeight}px`;
    } else {
      chatbot.style.width = "350px";
      chatbot.style.height = "550px";
    }
  };

  // Closes chatbot
  const handleClickClose = () => {
    setIsShowChatbot(false);
  };

  // Starts microphone recording
  const handleClickMicro = () => {
    setIsRecording(true);
    if (!recognitionRef.current) {
      alert(
        "Trình duyệt của bạn không hỗ trợ Speech Recognition. Hãy sử dụng Chrome!"
      );
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Lỗi khi bật micro:", error);
      alert("Không thể bật micro. Vui lòng kiểm tra quyền hoặc thử lại!");
      setIsRecording(false);
    }
  };

  // Stops microphone recording
  const handleCloseMicro = () => {
    recognitionRef.current.stop();
    setIsRecording(false);
  };

  // Initializes speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "vi-VN";
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event) => {
          const recordedTranscript = event.results[0][0].transcript;
          setTranscript(recordedTranscript);
          setIsRecording(false);
          if (recordedTranscript && textareaRef.current) {
            textareaRef.current.value = recordedTranscript;
            setMessageClient(recordedTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Error:", event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  return (
    <>
      {isShowChatbot && (
        <div className={`${styles.overlay}`} onClick={handleClickClose}></div>
      )}

      <div className={styles.chatbot_ui}>
        <div className={styles.chatbot_ui_container}>
          <div
            className={styles.icon_open_chatbot}
            style={{ background: MainColor }}
            onClick={handleClickShowChatbot}
          >
            {BadgeNumber && <span className={`${styles.badge_number}`}>1</span>}
            <div
              className={styles.spiner}
              style={{ "--border-color": SubColor }}
            ></div>
            {ChatbotIcon ? (
              <img
                className={styles.logo_icon}
                src={ChatbotIcon}
                alt="logo GooUp1"
                width={30}
                height={30}
              />
            ) : (
              <FontAwesomeIcon
                icon={faComments}
                className={styles.ico_comments}
                style={{ color: SubColor }}
              />
            )}
          </div>

          {isShowChatbot && (
            <div
              className={styles.chatbot}
              style={{ backgroundColor: BgColor }}
              ref={chatbotRef}
            >
              <div className={styles.chatbot_container}>
                <div
                  className={styles.header_box}
                  style={{ background: TitleBgColor }}
                >
                  <div className={styles.intro}>
                    <img
                      className={styles.icon_header_box}
                      src={LogoIcon}
                      alt="GooUp1"
                      width={30}
                      height={30}
                    />
                    <span
                      className={styles.name_assistant}
                      style={{ color: TitleColor }}
                    >
                      {Title}
                    </span>
                    {isRecording && (
                      <div
                        className={`${styles.animation} `}
                        onClick={handleCloseMicro}
                      >
                        <Lottie
                          animationData={wave_voice}
                          loop={true}
                          autoplay={true}
                        />
                      </div>
                    )}
                  </div>

                  <div className={styles.float_func}>
                    <FontAwesomeIcon
                      className={styles.ico_zoom}
                      icon={faUpRightAndDownLeftFromCenter}
                      onClick={handleClickExpand}
                      style={{ color: TitleColor }}
                    />
                    <FontAwesomeIcon
                      className={`${styles.ico_close}`}
                      icon={faXmark}
                      onClick={handleClickClose}
                      style={{ color: TitleColor }}
                    />
                  </div>
                </div>
                <hr />
                <div
                  className={styles.content_container}
                  style={{
                    "--bg-color": BgMaskColor,
                    "--bg-opacity": BgOpacity,
                    "--mask-img": `url("${BgMaskImg.replace(
                      /url\((['"])?(.*?)\1\)/,
                      "$2"
                    )}")`,
                  }}
                >
                  <div
                    className={styles.chatbot_message_container}
                    style={{
                      scrollbarColor: MainColor,
                      "--scrollbar-thumb-color": MainColor,
                    }}
                  >
                    <div className={styles.box_message} ref={messagesRef}>
                      {messages.map((item, index) =>
                        item?.role === "assistant" ? (
                          <div
                            key={index}
                            className={`${styles.message_box} ${styles.message_box_assistant}`}
                          >
                            <div className={styles.message_container}>
                              <div
                                className={styles.message_content}
                                style={{ backgroundColor: MainColor }}
                              >
                                <p
                                  dangerouslySetInnerHTML={{
                                    __html: item?.content,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            key={index}
                            className={`${styles.message_box} ${styles.message_box_client}`}
                          >
                            <div className={styles.message_container}>
                              <div
                                className={styles.message_content}
                                style={{ backgroundColor: SubColor }}
                              >
                                <p>{item?.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className={styles.footer_box}>
                    <div className={styles.input_message_box}>
                      <textarea
                        ref={textareaRef}
                        placeholder={HolderInputText}
                        type="text"
                        className={styles.input_message}
                        onChange={handleChangeMessage}
                        onKeyDown={handleKeyDownMessage}
                        style={{ color: "#000000" }}
                      />
                      <div className={styles.float_box_func}>
                        {AudioShow &&
                          (isRecording ? (
                            <div
                              className={styles.animation}
                              onClick={handleCloseMicro}
                            >
                              <Lottie
                                animationData={wave}
                                loop={true}
                                autoplay={true}
                              />
                            </div>
                          ) : (
                            <FontAwesomeIcon
                              icon={faMicrophone}
                              className={styles.ico_micro}
                              onClick={handleClickMicro}
                              style={{ color: SubColor }}
                            />
                          ))}
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          className={styles.ico_send}
                          onClick={handleSendMessage}
                          style={{ color: SubColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

ChatbotTemplates.propTypes = {
  LogoIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  ChatbotIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.element]),
  Title: PropTypes.string,
  TitleColor: PropTypes.string,
  TitleBgColor: PropTypes.string,
  HolderInputText: PropTypes.string,
  BadgeNumber: PropTypes.bool,
  BgColor: PropTypes.string,
  BgMaskColor: PropTypes.string,
  BgOpacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  BgMaskImg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  MainColor: PropTypes.string,
  SubColor: PropTypes.string,
  AudioShow: PropTypes.bool,
  initialMessages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.oneOf(['assistant', 'user']),
      content: PropTypes.string,
    })
  ),
  apiEndpoint: PropTypes.string,
};

ChatbotTemplates.defaultProps = {
  LogoIcon: logoIcon,
  ChatbotIcon: null,
  Title: 'Assistant AI',
  TitleColor: 'white',
  TitleBgColor: 'linear-gradient(90deg, #00001C, #2A2A5F)',
  HolderInputText: 'Chat ngay để nhận trợ giúp!',
  BadgeNumber: true,
  BgColor: '#00001C',
  BgMaskColor: 'white',
  BgOpacity: '0.2',
  BgMaskImg: chatbotBg,
  MainColor: 'white',
  SubColor: '#f2620e',
  AudioShow: true,
  initialMessages: [
    {
      role: 'assistant',
      content: '🤖 Xin chào! Tôi là GooUp1_Bot, sẵn sàng trò chuyện với bạn!',
    },
    {
      role: 'user',
      content: 'Chào',
    },
  ],
  apiEndpoint: null,
};

export default ChatbotTemplates;