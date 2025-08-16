"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Shield,
  Users,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Bookmark,
  Award
} from "lucide-react";
import Link from "next/link";

interface LearningChapter {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  category: string;
  order: number;
  estimatedTime: number;
}

interface UserProgress {
  id: string;
  chapterId: string;
  completed: boolean;
  progress: number;
  timeSpent: number;
  lastAccessed: string;
  chapter: {
    id: string;
    title: string;
    slug: string;
    level: string;
    category: string;
  };
}

interface UserBadge {
  id: string;
  badgeType: string;
  badgeName: string;
  badgeDescription: string;
  earnedAt: string;
}

const levels = [
  { id: "BEGINNER", name: "Beginner", icon: BookOpen, color: "bg-green-500" },
  { id: "INTERMEDIATE", name: "Intermediate", icon: TrendingUp, color: "bg-blue-500" },
  { id: "ADVANCED", name: "Advanced", icon: Target, color: "bg-purple-500" },
  { id: "PROFESSIONAL", name: "Professional", icon: GraduationCap, color: "bg-orange-500" }
];

const categories = [
  { id: "BASICS", name: "Fundamentals", icon: BookOpen, description: "Core concepts and basics" },
  {
    id: "INVESTMENT",
    name: "Investment Strategies",
    icon: TrendingUp,
    description: "SIP, lumpsum, and portfolio management"
  },
  {
    id: "DISTRIBUTOR",
    name: "Distributor Guide",
    icon: Users,
    description: "MFD training and business models"
  },
  {
    id: "RESEARCH",
    name: "Research & Analysis",
    icon: Shield,
    description: "Advanced analysis and case studies"
  }
];

export default function LearningHubClient() {
  const [chapters, setChapters] = useState<LearningChapter[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchChapters = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedLevel) params.append("level", selectedLevel);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(`/api/learning/chapters?${params}`);
      const data = await response.json();
      setChapters(data);
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, selectedCategory]);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch("/api/learning/progress");
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    }
  }, []);

  const fetchBadges = useCallback(async () => {
    try {
      const response = await fetch("/api/learning/badges");
      if (response.ok) {
        const data = await response.json();
        setBadges(data);
      }
    } catch (error) {
      console.error("Failed to fetch badges:", error);
    }
  }, []);

  useEffect(() => {
    fetchChapters();
    fetchProgress();
    fetchBadges();
  }, [fetchChapters, fetchProgress, fetchBadges]);

  const getProgressForChapter = (chapterId: string) => {
    return progress.find((p) => p.chapterId === chapterId);
  };

  const getCompletedChapters = () => {
    return progress.filter((p) => p.completed).length;
  };

  const getTotalTimeSpent = () => {
    return progress.reduce((total, p) => total + p.timeSpent, 0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getLevelIcon = (level: string) => {
    const levelData = levels.find((l) => l.id === level);
    return levelData ? levelData.icon : BookOpen;
  };

  const getLevelColor = (level: string) => {
    const levelData = levels.find((l) => l.id === level);
    return levelData ? levelData.color : "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="w-12 h-12 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold">Mutual Fund University</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Master the art of mutual fund investing with our comprehensive curriculum. From
              beginner basics to professional strategies.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <BookOpen className="w-5 h-5 mr-2" />
                <span>100+ Chapters</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <Clock className="w-5 h-5 mr-2" />
                <span>50+ Hours Content</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <Trophy className="w-5 h-5 mr-2" />
                <span>Interactive Quizzes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{getCompletedChapters()}</div>
                  <div className="text-sm text-gray-600">Chapters Completed</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatTime(getTotalTimeSpent())}
                  </div>
                  <div className="text-sm text-gray-600">Time Spent Learning</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{badges.length}</div>
                  <div className="text-sm text-gray-600">Badges Earned</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {chapters.length > 0
                      ? Math.round((getCompletedChapters() / chapters.length) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant={selectedLevel === "" ? "default" : "outline"}
              onClick={() => setSelectedLevel("")}
              className="rounded-full"
            >
              All Levels
            </Button>
            {levels.map((level) => (
              <Button
                key={level.id}
                variant={selectedLevel === level.id ? "default" : "outline"}
                onClick={() => setSelectedLevel(level.id)}
                className="rounded-full"
              >
                <level.icon className="w-4 h-4 mr-2" />
                {level.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      Explore
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapters Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Curriculum</h2>
            <div className="text-sm text-gray-600">{chapters.length} chapters available</div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter, index) => {
                const chapterProgress = getProgressForChapter(chapter.id);
                const LevelIcon = getLevelIcon(chapter.level);

                return (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${getLevelColor(chapter.level)}`}
                            >
                              <LevelIcon className="w-4 h-4 text-white" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {chapter.level}
                            </Badge>
                          </div>
                          {chapterProgress?.completed && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {chapter.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {chapter.description}
                        </p>

                        {chapterProgress && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{Math.round(chapterProgress.progress)}%</span>
                            </div>
                            <Progress value={chapterProgress.progress} className="h-2" />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {chapter.estimatedTime} min
                          </div>
                          <Button size="sm" className="rounded-full" asChild>
                            <Link href={`/learning/chapter/${chapter.slug}`}>
                              {chapterProgress?.completed ? "Review" : "Start"}
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Recent Badges */}
      {badges.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Recent Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.slice(0, 6).map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">{badge.badgeName}</h3>
                      <p className="text-sm text-gray-600 mb-3">{badge.badgeDescription}</p>
                      <div className="text-xs text-gray-500">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
