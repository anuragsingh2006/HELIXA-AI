import React, { useState } from "react";

import {
  Sparkles,
  Brain,
  Globe,
  BookOpen,
  Calculator,
  Plus,
  X,
  Send,
  CheckCircle2,
  Loader2,
  ArrowRight,
  RotateCcw,
  Bot,
  User,
  Zap,
  Activity,
  Search,
  ShieldCheck
} from "lucide-react";


const API_URL = "http://127.0.0.1:8000";


const availableTools = [

  {
    name: "WikipediaQueryRun",
    title: "Wikipedia",
    description: "Factual knowledge",
    icon: BookOpen
  },

  {
    name: "TavilySearch",
    title: "Tavily",
    description: "Live web search",
    icon: Globe
  },

  {
    name: "add",
    title: "Add",
    description: "Addition tool",
    icon: Plus
  },

  {
    name: "multiply",
    title: "Multiply",
    description: "Multiplication",
    icon: X
  },

  {
    name: "ChatGroq",
    title: "ChatGroq",
    description: "Llama 3.3 LLM",
    icon: Brain
  }

];


function App() {

  const [question, setQuestion] = useState("");

  const [answer, setAnswer] = useState("");

  const [steps, setSteps] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);


  async function askAgent(customQuestion = null) {

    const query = (
      customQuestion ?? question
    ).trim();


    if (!query || loading) {
      return;
    }


    setQuestion(query);

    setLoading(true);

    setAnswer("");

    setSteps([]);

    setError("");


    try {

      const response = await fetch(
        `${API_URL}/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            question: query
          })
        }
      );


      if (!response.ok) {

        throw new Error(
          `Backend returned ${response.status}`
        );

      }


      const data = await response.json();


      setAnswer(
        data.answer || "No answer received."
      );


      setSteps(
        data.steps || []
      );


      setHistory(previous => [

        {
          question: query,
          answer: data.answer || ""
        },

        ...previous

      ].slice(0, 6));


    } catch (err) {

      console.error(err);

      setError(
        "Could not connect to the AI Agent. Please make sure the FastAPI backend is running on port 8000."
      );

    } finally {

      setLoading(false);

    }

  }


  function submitQuestion(event) {

    event.preventDefault();

    askAgent();

  }


  function clearAgent() {

    setQuestion("");

    setAnswer("");

    setSteps([]);

    setError("");

  }


  function toolIcon(toolName) {

    if (toolName === "WikipediaQueryRun") {
      return <BookOpen size={17} />;
    }

    if (toolName === "TavilySearch") {
      return <Globe size={17} />;
    }

    if (toolName === "add") {
      return <Plus size={17} />;
    }

    if (toolName === "multiply") {
      return <X size={17} />;
    }

    return <Brain size={17} />;

  }


  return (

    <div className="app">


      {/* BACKGROUND */}

      <div className="background">

        <div className="glow glow-purple"></div>

        <div className="glow glow-blue"></div>

        <div className="glow glow-pink"></div>

        <div className="background-grid"></div>

      </div>


      {/* NAVBAR */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-logo">

            <Sparkles size={21} />

          </div>


          <div>

            <h2>
              Helixa<span>AI</span>
            </h2>

            <p>
              Autonomous Tool-Using Agent
            </p>

          </div>

        </div>


        <div className="online-status">

          <span className="online-dot"></span>

          SYSTEM ONLINE

        </div>

      </header>


      <main className="container">


        {/* HERO */}

        <section className="hero">

          <div className="hero-badge">

            <Sparkles size={14} />

            INTELLIGENT AI AGENT

          </div>


          <h1>

            Ask a question.

            <br />

            <span>Let AI do the work.</span>

          </h1>


          <p>

            A tool-using AI agent that understands your request,

            selects the right tool, observes its result and

            generates a final answer.

          </p>

        </section>


        {/* FLOW */}

        <section className="agent-flow">

          <div className="flow-item active">

            <div className="flow-icon">

              <User size={17} />

            </div>

            <span>QUESTION</span>

          </div>


          <div className="flow-arrow">
            <ArrowRight size={15} />
          </div>


          <div className="flow-item">

            <div className="flow-icon">

              <Brain size={17} />

            </div>

            <span>THINK</span>

          </div>


          <div className="flow-arrow">
            <ArrowRight size={15} />
          </div>


          <div className="flow-item">

            <div className="flow-icon">

              <Search size={17} />

            </div>

            <span>CALL TOOL</span>

          </div>


          <div className="flow-arrow">
            <ArrowRight size={15} />
          </div>


          <div className="flow-item">

            <div className="flow-icon">

              <Activity size={17} />

            </div>

            <span>OBSERVE</span>

          </div>


          <div className="flow-arrow">
            <ArrowRight size={15} />
          </div>


          <div className="flow-item">

            <div className="flow-icon">

              <Sparkles size={17} />

            </div>

            <span>ANSWER</span>

          </div>

        </section>


        {/* MAIN GRID */}

        <section className="dashboard-grid">


          {/* LEFT SIDE */}

          <div className="left-column">


            {/* QUESTION */}

            <div className="card question-card">

              <div className="card-header">

                <div>

                  <div className="label">
                    USER QUESTION
                  </div>

                  <h3>
                    What can I help you with?
                  </h3>

                </div>


                <div className="header-icon">

                  <Bot size={20} />

                </div>

              </div>


              <form
                onSubmit={submitQuestion}
              >

                <div className="input-wrapper">

                  <textarea

                    value={question}

                    onChange={event =>
                      setQuestion(
                        event.target.value
                      )
                    }

                    placeholder="Ask anything... Try: What is artificial intelligence?"

                    disabled={loading}

                  />

                  <div className="input-glow"></div>

                </div>


                <div className="input-footer">

                  <span>

                    <ShieldCheck size={13} />

                    Agent chooses tools automatically

                  </span>


                  <button
                    type="submit"
                    className="ask-button"
                    disabled={
                      loading ||
                      !question.trim()
                    }
                  >

                    {loading ? (

                      <>

                        <Loader2
                          size={17}
                          className="spin"
                        />

                        Processing

                      </>

                    ) : (

                      <>

                        Ask Agent

                        <Send size={16} />

                      </>

                    )}

                  </button>

                </div>

              </form>


              {/* QUICK QUESTIONS */}

              <div className="quick-title">

                QUICK START

              </div>


              <div className="quick-grid">


                <button
                  onClick={() =>
                    askAgent(
                      "What is Artificial Intelligence?"
                    )
                  }
                >

                  <BookOpen size={15} />

                  <span>
                    What is AI?
                  </span>

                </button>


                <button
                  onClick={() =>
                    askAgent(
                      "What is the latest news about artificial intelligence?"
                    )
                  }
                >

                  <Globe size={15} />

                  <span>
                    Latest AI news
                  </span>

                </button>


                <button
                  onClick={() =>
                    askAgent(
                      "What is 125 multiplied by 24?"
                    )
                  }
                >

                  <Calculator size={15} />

                  <span>
                    Calculate 125 × 24
                  </span>

                </button>


                <button
                  onClick={() =>
                    askAgent(
                      "What is 450 plus 375?"
                    )
                  }
                >

                  <Plus size={15} />

                  <span>
                    Calculate 450 + 375
                  </span>

                </button>

              </div>

            </div>


            {/* TOOLS */}

            <div className="card tools-card">

              <div className="card-header">

                <div>

                  <div className="label">
                    AVAILABLE TOOLS
                  </div>

                  <h3>
                    Agent Toolbox
                  </h3>

                </div>


                <span className="tool-number">
                  5 TOOLS
                </span>

              </div>


              <div className="tools-list">

                {availableTools.map(tool => {

                  const Icon = tool.icon;

                  return (

                    <div
                      className="tool"
                      key={tool.name}
                    >

                      <div className="tool-icon">

                        <Icon size={18} />

                      </div>


                      <div className="tool-info">

                        <strong>
                          {tool.title}
                        </strong>

                        <span>
                          {tool.description}
                        </span>

                      </div>


                      <div className="tool-status">

                        READY

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

          </div>


          {/* RIGHT SIDE */}

          <div className="right-column">


            {/* MONITOR */}

            <div className="card monitor-card">

              <div className="card-header">

                <div>

                  <div className="label">
                    AGENT MONITOR
                  </div>

                  <h3>
                    Execution Flow
                  </h3>

                </div>


                {loading && (

                  <div className="live">

                    <span></span>

                    LIVE

                  </div>

                )}

              </div>


              {/* EMPTY */}

              {!loading &&
                steps.length === 0 &&
                !answer && (

                <div className="empty-monitor">

                  <div className="brain-orb">

                    <Brain size={32} />

                  </div>

                  <h4>
                    Agent is ready
                  </h4>

                  <p>
                    Ask a question and watch the
                    agent select and execute tools.
                  </p>

                </div>

              )}


              {/* THINKING */}

              {loading && steps.length === 0 && (

                <div className="thinking-panel">

                  <div className="thinking-icon">

                    <Brain size={22} />

                  </div>


                  <div>

                    <strong>
                      Agent is thinking
                    </strong>

                    <p>
                      Analyzing your question and
                      selecting the right tool...
                    </p>

                  </div>


                  <div className="dots">

                    <span></span>
                    <span></span>
                    <span></span>

                  </div>

                </div>

              )}


              {/* EXECUTION */}

              <div className="execution-list">

                {steps.map(
                  (step, index) => (

                    <div
                      className="execution-step"
                      key={index}
                    >

                      <div className="execution-line"></div>


                      <div className="execution-icon">

                        {step.type === "tool"
                          ? toolIcon(step.tool)
                          : <CheckCircle2 size={17} />
                        }

                      </div>


                      <div className="execution-body">

                        <div className="execution-top">

                          <strong>

                            {step.type === "tool"
                              ? step.tool
                              : "Final Answer"
                            }

                          </strong>


                          <span className="done">

                            <CheckCircle2 size={12} />

                            COMPLETE

                          </span>

                        </div>


                        {step.type === "tool" && (

                          <>

                            <p>
                              Tool selected by agent
                            </p>


                            {step.arguments && (

                              <div className="arguments">

                                {Object.entries(
                                  step.arguments
                                ).map(
                                  ([key, value]) => (

                                    <span
                                      key={key}
                                    >

                                      <b>
                                        {key}
                                      </b>

                                      {String(value)}

                                    </span>

                                  )
                                )}

                              </div>

                            )}

                          </>

                        )}

                      </div>

                    </div>

                  )
                )}

              </div>


              {/* ANSWER */}

              {answer && (

                <div className="final-answer">

                  <div className="answer-header">

                    <div>

                      <Sparkles size={15} />

                      FINAL ANSWER

                    </div>

                    <span>
                      AI GENERATED
                    </span>

                  </div>


                  <p>
                    {answer}
                  </p>

                </div>

              )}


              {/* NEW QUESTION */}

              {(answer || steps.length > 0) && (

                <button
                  className="new-question"
                  onClick={clearAgent}
                >

                  <RotateCcw size={14} />

                  Start New Question

                </button>

              )}

            </div>


            {/* ERROR */}

            {error && (

              <div className="error-box">

                <span>⚠</span>

                <div>

                  <strong>
                    Connection Error
                  </strong>

                  <p>
                    {error}
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>


        {/* HISTORY */}

        {history.length > 0 && (

          <section className="history card">

            <div className="card-header">

              <div>

                <div className="label">
                  SESSION HISTORY
                </div>

                <h3>
                  Recent Questions
                </h3>

              </div>

            </div>


            <div className="history-list">

              {history.map(
                (item, index) => (

                  <button
                    key={index}
                    onClick={() =>
                      askAgent(
                        item.question
                      )
                    }
                  >

                    <User size={14} />

                    <span>
                      {item.question}
                    </span>

                    <ArrowRight size={14} />

                  </button>

                )
              )}

            </div>

          </section>

        )}

      </main>


      {/* FOOTER */}

      <footer>

        <div>

          <Sparkles size={13} />

          <strong>
            HelixaAI
          </strong>

        </div>


        <span>
          Groq • Llama 3.3 • Tavily • Wikipedia
        </span>

      </footer>

    </div>

  );

}


export default App;