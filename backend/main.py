import os
import json
import re
import wikipedia

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tavily import TavilyClient
from openai import OpenAI


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing")

if not TAVILY_API_KEY:
    raise ValueError("TAVILY_API_KEY is missing")


# ============================================================
# CLIENTS
# ============================================================

llm = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

tavily = TavilyClient(api_key=TAVILY_API_KEY)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(title="Helixa")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class QuestionRequest(BaseModel):
    question: str


# ============================================================
# TOOLS
# ============================================================

def wikipedia_query(query: str):
    """
    Search Wikipedia for factual information.
    """

    try:
        results = wikipedia.search(query)

        if not results:
            return {
                "success": False,
                "result": "No Wikipedia result found."
            }

        page = wikipedia.page(results[0], auto_suggest=False)

        return {
            "success": True,
            "title": page.title,
            "summary": page.summary[:4000],
            "url": page.url
        }

    except Exception as e:
        return {
            "success": False,
            "result": f"Wikipedia error: {str(e)}"
        }


def tavily_search(query: str):
    """
    Search the live web using Tavily.
    """

    try:
        response = tavily.search(
            query=query,
            search_depth="advanced",
            max_results=5
        )

        results = []

        for item in response.get("results", []):
            results.append({
                "title": item.get("title"),
                "url": item.get("url"),
                "content": item.get("content", "")[:1500]
            })

        return {
            "success": True,
            "results": results
        }

    except Exception as e:
        return {
            "success": False,
            "result": f"Tavily error: {str(e)}"
        }


def add_numbers(a: float, b: float):

    return {
        "success": True,
        "operation": "addition",
        "a": a,
        "b": b,
        "result": a + b
    }


def multiply_numbers(a: float, b: float):

    return {
        "success": True,
        "operation": "multiplication",
        "a": a,
        "b": b,
        "result": a * b
    }


# ============================================================
# TOOL DEFINITIONS FOR LLM
# ============================================================

TOOLS = [

    {
        "type": "function",
        "function": {
            "name": "WikipediaQueryRun",
            "description": "Search Wikipedia for factual and general knowledge.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The Wikipedia search query"
                    }
                },
                "required": ["query"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "TavilySearch",
            "description": "Search the live web for recent or current information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The live web search query"
                    }
                },
                "required": ["query"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "add",
            "description": "Add two numbers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {
                        "type": "number"
                    },
                    "b": {
                        "type": "number"
                    }
                },
                "required": ["a", "b"]
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "multiply",
            "description": "Multiply two numbers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {
                        "type": "number"
                    },
                    "b": {
                        "type": "number"
                    }
                },
                "required": ["a", "b"]
            }
        }
    }
]


# ============================================================
# TOOL EXECUTOR
# ============================================================

def execute_tool(name, arguments):

    if name == "WikipediaQueryRun":
        return wikipedia_query(arguments["query"])

    if name == "TavilySearch":
        return tavily_search(arguments["query"])

    if name == "add":
        return add_numbers(
            arguments["a"],
            arguments["b"]
        )

    if name == "multiply":
        return multiply_numbers(
            arguments["a"],
            arguments["b"]
        )

    return {
        "success": False,
        "result": f"Unknown tool: {name}"
    }


# ============================================================
# AGENT
# ============================================================

def run_agent(question: str):

    steps = []

    messages = [

        {
            "role": "system",
            "content": """
You are Helixa an intelligent tool-using AI agent.

Your job is to answer the user's question accurately.

Available tools:

1. WikipediaQueryRun
   Use for general factual knowledge.

2. TavilySearch
   Use for current, recent or live web information.

3. add
   Use for addition.

4. multiply
   Use for multiplication.

Rules:

- Decide whether a tool is necessary.
- Use tools when they improve accuracy.
- For current information, prefer TavilySearch.
- For simple calculations, use the math tools.
- After receiving tool results, analyze them and answer the user.
- Do not expose hidden chain-of-thought.
- Give concise and direct final answers.
"""
        },

        {
            "role": "user",
            "content": question
        }
    ]

    max_iterations = 6

    for iteration in range(max_iterations):

        response = llm.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.2
        )

        message = response.choices[0].message

        # ----------------------------------------------------
        # TOOL CALL
        # ----------------------------------------------------

        if message.tool_calls:

            messages.append(message)

            for tool_call in message.tool_calls:

                tool_name = tool_call.function.name

                try:
                    arguments = json.loads(
                        tool_call.function.arguments
                    )
                except:
                    arguments = {}

                steps.append({
                    "type": "tool",
                    "tool": tool_name,
                    "status": "running",
                    "arguments": arguments
                })

                result = execute_tool(
                    tool_name,
                    arguments
                )

                steps[-1]["status"] = "completed"

                # keep result reasonably small
                result_string = json.dumps(
                    result,
                    ensure_ascii=False
                )

                if len(result_string) > 8000:
                    result_string = result_string[:8000]

                steps[-1]["result"] = result

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result_string
                })

            continue

        # ----------------------------------------------------
        # FINAL ANSWER
        # ----------------------------------------------------

        answer = message.content or ""

        steps.append({
            "type": "final",
            "status": "completed"
        })

        return {
            "answer": answer,
            "steps": steps
        }

    return {
        "answer": "I could not complete the task within the allowed reasoning steps.",
        "steps": steps
    }


# ============================================================
# API ROUTE
# ============================================================

@app.post("/ask")
def ask_agent(request: QuestionRequest):

    question = request.question.strip()

    if not question:
        return {
            "answer": "Please enter a question.",
            "steps": []
        }

    return run_agent(question)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def home():

    return {
        "status": "online",
        "agent": "Halixa",
        "tools": [
            "WikipediaQueryRun",
            "TavilySearch",
            "add",
            "multiply"
        ]
    }