"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, CheckCircle, Play, Star } from "lucide-react";
import Link from "next/link";

interface Chapter {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  order: number;
  estimatedTime: number;
  category: string;
  tags: string[];
}

interface UserProgress {
  chapterId: string;
  completed: boolean;
  timeSpent: number;
  lastAccessed: string;
}

export default function LearningHubClient() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapters();
    fetchUserProgress();
  }, []);

  const fetchChapters = async () => {
    try {
      console.log("Fetching chapters...");
      const response = await fetch("/api/learning/chapters");
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Chapters data:", data);
        setChapters(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch chapters:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      console.log("Fetching user progress...");
      const response = await fetch("/api/learning/progress");
      console.log("Progress response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Progress data:", data);
        setUserProgress(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch progress:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    }
  };

  const getProgressForChapter = (chapterId: string) => {
    return userProgress.find(p => p.chapterId === chapterId);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER": return "bg-green-100 text-green-800";
      case "INTERMEDIATE": return "bg-yellow-100 text-yellow-800";
      case "ADVANCED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "BEGINNER": return "🌱";
      case "INTERMEDIATE": return "📈";
      case "ADVANCED": return "🚀";
      default: return "📚";
    }
  };

  const calculateOverallProgress = () => {
    if (chapters.length === 0) return 0;
    const completedChapters = userProgress.filter(p => p.completed).length;
    return Math.round((completedChapters / chapters.length) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Mutual Fund University
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Master the art of mutual fund investing with our comprehensive curriculum
        </p>
        
        {/* Progress Overview */}
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{calculateOverallProgress()}%</span>
                </div>
                <Progress value={calculateOverallProgress()} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-2xl text-green-600">
                    {userProgress.filter(p => p.completed).length}
                  </div>
                  <div className="text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-2xl text-blue-600">
                    {chapters.length - userProgress.filter(p => p.completed).length}
                  </div>
                  <div className="text-gray-600">Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chapters Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter) => {
          const progress = getProgressForChapter(chapter.id);
          const isCompleted = progress?.completed || false;
          const isStarted = progress?.lastAccessed;

          return (
            <Card 
              key={chapter.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                isCompleted ? 'border-green-200 bg-green-50' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{chapter.title}</CardTitle>
                    <p className="text-sm text-gray-600 mb-3">
                      {chapter.description}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelColor(chapter.level)}>
                        {getLevelIcon(chapter.level)} {chapter.level}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {chapter.estimatedTime} min
                      </div>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isStarted && !isCompleted && (
                    <div className="text-sm text-blue-600">
                      In Progress - Last accessed {new Date(progress!.lastAccessed).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Chapter {chapter.order}
                    </span>
                    <Link href={`/learning/chapter/${chapter.slug}`}>
                      <Button size="sm" variant={isCompleted ? "outline" : "default"}>
                        {isCompleted ? (
                          <>
                            <Star className="h-4 w-4 mr-1" />
                            Review
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            {isStarted ? "Continue" : "Start"}
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-2">
              Ready to start your investment journey?
            </h3>
            <p className="text-gray-600 mb-4">
              Begin with the basics and work your way up to advanced strategies.
            </p>
            <Link href={`/learning/chapter/${chapters[0]?.slug}`}>
              <Button size="lg">
                <Play className="h-5 w-5 mr-2" />
                Start Learning
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
