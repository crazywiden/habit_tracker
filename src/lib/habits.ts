export type Habit = {
  id: "dailyDiary" | "workout" | "reading" | "socialMediaCounter";
  name: string;
  type: "toggle" | "counter";
  emoji: string;
  color: string;
};

export const habits: Habit[] = [
  {
    id: "dailyDiary",
    name: "📝 Daily Diary",
    type: "toggle",
    emoji: "📝",
    color: "blue",
  },
  {
    id: "workout",
    name: "💪 Workout",
    type: "toggle",
    emoji: "💪",
    color: "emerald",
  },
  {
    id: "reading",
    name: "📚 Reading",
    type: "toggle",
    emoji: "📚",
    color: "purple",
  },
  {
    id: "socialMediaCounter",
    name: "🚫 Social Media Resistance",
    type: "counter",
    emoji: "#",
    color: "red",
  },
];
