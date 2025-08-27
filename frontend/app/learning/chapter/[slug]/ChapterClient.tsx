"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Share2,
  Download,
  Lightbulb,
  Target,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ChapterContent {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  level: string;
  category: string;
  order: number;
  estimatedTime: number;
  quizzes: Quiz[];
}

interface Quiz {
  id: string;
  question: string;
  options: string;
  order: number;
}

interface Section {
  id: string;
  title: string;
  content: string;
  type: string;
}

export default function ChapterClient({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [chapter, setChapter] = useState<ChapterContent | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResults, setQuizResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  const fetchChapter = useCallback(async () => {
    try {
      // Find chapter by slug
      const response = await fetch(`/api/learning/chapters`);
      const chapters = await response.json();
      const foundChapter = chapters.find((c: any) => c.slug === slug);

      if (foundChapter) {
        const chapterResponse = await fetch(`/api/learning/content/${foundChapter.id}`);
        const chapterData = await chapterResponse.json();
        setChapter(chapterData);

        // Parse content sections
        const contentData = JSON.parse(chapterData.content);
        setSections(contentData.sections || []);
      }
    } catch (error) {
      console.error("Failed to fetch chapter:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const saveProgress = useCallback(
    async (progressValue: number) => {
      if (!session?.user || !chapter) return;

      try {
        await fetch("/api/learning/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId: chapter.id,
            progress: progressValue,
            completed: progressValue >= 100,
            timeSpent
          })
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    },
    [session?.user, chapter, timeSpent]
  );

  useEffect(() => {
    fetchChapter();
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchChapter, startTime]);

  useEffect(() => {
    if (sections.length > 0) {
      const newProgress = ((currentSection + 1) / sections.length) * 100;
      setProgress(newProgress);
      saveProgress(newProgress);
    }
  }, [currentSection, sections.length, saveProgress]);

  const toggleBookmark = async () => {
    if (!session?.user || !chapter) return;

    try {
      if (isBookmarked) {
        // Remove bookmark
        await fetch(`/api/learning/bookmarks/${chapter.id}`, {
          method: "DELETE"
        });
        setIsBookmarked(false);
      } else {
        // Add bookmark
        await fetch("/api/learning/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId: chapter.id,
            note: bookmarkNote
          })
        });
        setIsBookmarked(true);
        setShowBookmarkDialog(false);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const submitQuizAnswer = async (quizId: string, answer: number) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/learning/quiz/${quizId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer })
      });

      const result = await response.json();
      setQuizResults((prev) => ({ ...prev, [quizId]: result }));
      setQuizAnswers((prev) => ({ ...prev, [quizId]: answer }));
    } catch (error) {
      console.error("Failed to submit quiz answer:", error);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return BookOpen;
      case "INTERMEDIATE":
        return TrendingUp;
      case "ADVANCED":
        return Target;
      default:
        return BookOpen;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-500";
      case "INTERMEDIATE":
        return "bg-blue-500";
      case "ADVANCED":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <Link href="/learning">
            <Button>Back to Learning Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  const LevelIcon = getLevelIcon(chapter.level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/learning">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{chapter.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${getLevelColor(chapter.level)}`}
                  >
                    <LevelIcon className="w-2 h-2 text-white" />
                  </div>
                  <span>{chapter.level}</span>
                  <span>•</span>
                  <span>{chapter.category}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{chapter.estimatedTime} min</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBookmarkDialog(true)}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Progress Bar */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>
                    Section {currentSection + 1} of {sections.length}
                  </span>
                  <span>
                    Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Current Section */}
            {sections[currentSection] && (
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                      {sections[currentSection].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {sections[currentSection].content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                Previous Section
              </Button>
              <Button
                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                disabled={currentSection === sections.length - 1}
              >
                Next Section
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </div>

            {/* Quizzes */}
            {chapter.quizzes && chapter.quizzes.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Knowledge Check</h2>
                {chapter.quizzes.map((quiz, index) => (
                  <Card key={quiz.id} className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 font-medium">{quiz.question}</p>
                      <div className="space-y-2">
                        {JSON.parse(quiz.options).map((option: string, optionIndex: number) => (
                          <Button
                            key={optionIndex}
                            variant={quizAnswers[quiz.id] === optionIndex ? "default" : "outline"}
                            className="w-full justify-start text-left"
                            onClick={() => submitQuizAnswer(quiz.id, optionIndex)}
                            disabled={quizResults[quiz.id]}
                          >
                            {option}
                            {quizResults[quiz.id] && <CheckCircle className="w-4 h-4 ml-auto" />}
                          </Button>
                        ))}
                      </div>
                      {quizResults[quiz.id] && (
                        <div
                          className={`mt-4 p-4 rounded-lg ${
                            quizResults[quiz.id].isCorrect
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <p
                            className={`font-medium ${
                              quizResults[quiz.id].isCorrect ? "text-green-800" : "text-red-800"
                            }`}
                          >
                            {quizResults[quiz.id].isCorrect ? "Correct!" : "Incorrect"}
                          </p>
                          {quizResults[quiz.id].explanation && (
                            <p className="text-sm mt-2">{quizResults[quiz.id].explanation}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Chapter Info */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Chapter Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{chapter.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <Badge variant="secondary">{chapter.level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{chapter.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Time:</span>
                      <span>{chapter.estimatedTime} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sections.map((section, index) => (
                      <Button
                        key={section.id}
                        variant={currentSection === index ? "default" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => setCurrentSection(index)}
                      >
                        <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                          {index + 1}
                        </span>
                        {section.title}
                        {currentSection === index && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmark Dialog */}
      {showBookmarkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Bookmark</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add a note (optional)"
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBookmarkDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={toggleBookmark}>Save Bookmark</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
