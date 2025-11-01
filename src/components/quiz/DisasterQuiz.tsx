"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, RefreshCw } from "lucide-react";

// No external deps: we use basic Tailwind transitions for subtle animations.

export type QuizCategory = "earthquake" | "tsunami" | "flood" | "wildfire" | "cyclone" | "storm";

type Question = {
  q: string;
  options: string[];
  answer: number; // index in options
  info?: string; // explanation
};

const QUIZ_BANK: Record<QuizCategory, Question[]> = {
  earthquake: [
    {
      q: "During an earthquake, what is the safest immediate action indoors?",
      options: ["Run outside immediately", "Drop, Cover, and Hold On", "Stand under a doorway", "Use the elevator"],
      answer: 1,
      info: "Drop to your hands and knees, cover your head and neck under sturdy furniture, and hold on until shaking stops.",
    },
    {
      q: "Where should you prepare an emergency kit to keep at home?",
      options: ["Only in the bedroom", "Only in the kitchen", "In an easy-to-grab location", "In the attic"],
      answer: 2,
      info: "Store kits where you can quickly access them; include water, food, flashlight, meds, and documents.",
    },
    {
      q: "Which item is most essential in an earthquake kit?",
      options: ["Candle", "Whistle", "Board games", "Paint"],
      answer: 1,
      info: "A whistle helps rescuers locate you if you're trapped.",
    },
  ],
  tsunami: [
    {
      q: "What is the strongest natural warning sign of a tsunami?",
      options: ["Heavy rain", "Rapid sea withdrawal", "Strong winds", "Cloudy sky"],
      answer: 1,
      info: "If the ocean suddenly recedes exposing the seabed, evacuate to higher ground immediately.",
    },
    {
      q: "Where should you go during a tsunami warning?",
      options: ["Beachfront to watch", "Underground parking", "High ground or inland", "Remain at sea level"],
      answer: 2,
    },
    {
      q: "After a tsunami wave passes, you should...",
      options: ["Return to shore immediately", "Wait for official all-clear", "Swim to safety", "Drive along the coast"],
      answer: 1,
    },
  ],
  flood: [
    { q: "What should you do when you see floodwater on the road?", options: ["Drive through", "Turn around, don't drown", "Speed up", "Stop in water"], answer: 1 },
    { q: "Where do you move during a flash flood?", options: ["Low ground", "Basement", "High ground", "Under bridges"], answer: 2 },
    { q: "Which is safe to drink?", options: ["Floodwater", "Boiled tap water", "River water", "Unknown bottled"], answer: 1 },
  ],
  wildfire: [
    { q: "To prepare your home for wildfires, create a...", options: ["Fuel ladder", "Defensible space", "Dense hedge", "Wood pile near wall"], answer: 1 },
    { q: "If trapped by wildfire smoke, you should...", options: ["Remove mask", "Seal indoors and filter air", "Open all windows", "Drive fast"], answer: 1 },
    { q: "Best mask for smoke?", options: ["Cloth", "Surgical", "N95/KN95", "No mask"], answer: 2 },
  ],
  cyclone: [
    { q: "Before a cyclone, you should...", options: ["Ignore warnings", "Secure loose objects", "Go boating", "Open windows"], answer: 1 },
    { q: "During cyclone warnings at coast, you should...", options: ["Go to beach", "Evacuate to shelters", "Camp outside", "Stay in car"], answer: 1 },
    { q: "Most dangerous cyclone hazard?", options: ["Mild rain", "Storm surge", "Clouds", "Cool air"], answer: 1 },
  ],
  storm: [
    { q: "If thunder roars, go...", options: ["Outdoors", "Under trees", "Indoors", "To water"], answer: 2 },
    { q: "Safest indoor place in severe storm?", options: ["Near windows", "Interior room", "Balcony", "Garage door"], answer: 1 },
    { q: "Electronics during lightning?", options: ["Unplug if safe", "Hold antenna", "Stand in shower", "Use corded phone"], answer: 0 },
  ],
};

const categories: { key: QuizCategory; label: string }[] = [
  { key: "earthquake", label: "Earthquake" },
  { key: "tsunami", label: "Tsunami" },
  { key: "flood", label: "Flood" },
  { key: "wildfire", label: "Wildfire" },
  { key: "cyclone", label: "Cyclone" },
  { key: "storm", label: "Storm" },
];

export function DisasterQuiz() {
  const [selected, setSelected] = useState<QuizCategory | null>("earthquake");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const questions = useMemo(() => (selected ? QUIZ_BANK[selected] : []), [selected]);
  const current = questions[index];
  const correctCount = answers.reduce((acc, a, i) => acc + (questions[i]?.answer === a ? 1 : 0), 0);
  const progress = questions.length ? Math.round(((index) / questions.length) * 100) : 0;

  const reset = (cat?: QuizCategory) => {
    setSelected(cat ?? selected);
    setIndex(0);
    setAnswers([]);
    setShowResult(false);
  };

  const choose = (optIndex: number) => {
    if (!current) return;
    const newAnswers = [...answers];
    newAnswers[index] = optIndex;
    setAnswers(newAnswers);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Button
            key={c.key}
            variant={selected === c.key ? "default" : "outline"}
            size="sm"
            onClick={() => reset(c.key)}
            className="transition-transform hover:scale-105"
          >
            {c.label}
          </Button>
        ))}
      </div>

      <Card className="p-6 overflow-hidden">
        {!showResult && current && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Question {index + 1} of {questions.length}</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20">{selected}</Badge>
            </div>

            <div className="w-full h-2 bg-muted rounded-full mb-6">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="transition-all duration-300">
              <p className="text-lg font-medium mb-4">{current.q}</p>
              <div className="grid gap-3">
                {current.options.map((opt, i) => {
                  const picked = answers[index] === i;
                  const isCorrect = current.answer === i;
                  return (
                    <button
                      key={i}
                      onClick={() => choose(i)}
                      className={`text-left px-4 py-3 border rounded-lg transition-all hover:shadow-sm ${
                        picked ? (isCorrect ? "border-green-500 bg-green-500/10" : "border-destructive bg-destructive/10") : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {picked && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {picked && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {typeof answers[index] === "number" && (
                <div className="mt-4 text-sm text-muted-foreground">
                  {current.info && <p className="leading-relaxed">ℹ️ {current.info}</p>}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {typeof answers[index] === "number" ? "Answer selected" : "Choose an option"}
                </div>
                <Button onClick={next} disabled={typeof answers[index] !== "number"}>
                  {index + 1 < questions.length ? "Next" : "See Results"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showResult && (
          <div className="transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-semibold">Your Results</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              You scored <span className="font-semibold text-foreground">{correctCount}</span> out of {questions.length} in the {selected} quiz.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {questions.map((q, i) => {
                const picked = answers[i];
                const ok = picked === q.answer;
                return (
                  <div key={i} className={`p-3 border rounded-lg ${ok ? "border-green-500/40 bg-green-500/5" : "border-destructive/40 bg-destructive/5"}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium pr-2">{q.q}</p>
                      {ok ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
                    </div>
                    {!ok && (
                      <p className="text-xs text-muted-foreground mt-2">Correct: {q.options[q.answer]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => reset()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Retry {selected}
              </Button>
              <Button variant="outline" onClick={() => reset("earthquake")}>Earthquake</Button>
              <Button variant="outline" onClick={() => reset("tsunami")}>Tsunami</Button>
              <Button variant="outline" onClick={() => reset("flood")}>Flood</Button>
              <Button variant="outline" onClick={() => reset("wildfire")}>Wildfire</Button>
              <Button variant="outline" onClick={() => reset("cyclone")}>Cyclone</Button>
              <Button variant="outline" onClick={() => reset("storm")}>Storm</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default DisasterQuiz;
