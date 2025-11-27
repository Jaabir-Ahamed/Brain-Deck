"use client"

import {
  Upload,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { BrainCircuit } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl"></div>
      </div>

      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between relative">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-black" />
              </div>
              <span className="text-lg sm:text-xl">
                BrainDeck
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
              <a
                href="#features"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-400 hover:text-white transition-colors"
              >
                How it Works
              </a>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                Log In
              </Link>
              <Link 
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 mb-6 sm:mb-8">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-xs sm:text-sm text-gray-300">
              AI-Powered Study Tool
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 px-2">
            Transform Your Study Materials into{" "}
            <span className="text-blue-500">Smart Decks</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
            Import your notes, PDFs, or any study material and
            let AI create personalized study decks instantly.
            Learn smarter, not harder with BrainDeck.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link 
              href="/auth/signup"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              Start Studying Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-20 max-w-2xl mx-auto px-4">
            <div>
              <div className="text-2xl sm:text-4xl text-blue-500 mb-1 sm:mb-2">
                10K+
              </div>
              <div className="text-xs sm:text-base text-gray-400">
                Decks Created
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl text-blue-500 mb-1 sm:mb-2">
                95%
              </div>
              <div className="text-xs sm:text-base text-gray-400">
                Success Rate
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl text-blue-500 mb-1 sm:mb-2">
                1000+
              </div>
              <div className="text-xs sm:text-base text-gray-400">
                Students
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
      >
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl mb-3 sm:mb-4">
            What BrainDeck has to Offer
          </h2>
          <p className="text-base sm:text-xl text-gray-400">
            Turn Every Study Session into Progress
          </p>
        </div>

        <div className="grid md:grid-cols-6 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8 hover:border-gray-700 transition-colors md:col-span-2">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <Upload className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">
              Import Your Material
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Upload PDFs, Word docs, PowerPoints, or paste your
              notes. BrainDeck will handle it for you.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8 hover:border-gray-700 transition-colors md:col-span-2">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">
              AI Generation
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Our AI analyzes your content and creates tailored
              flashcards that focus on key concepts and
              definitions.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8 hover:border-gray-700 transition-colors md:col-span-2">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">
              Smart Study
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Track your progress, review difficult cards, and
              master your material with your choice of studying.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8 hover:border-gray-700 transition-colors md:col-span-2 md:col-start-2">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">
              Smart Suggestions
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Get personalized study recommendations based on
              your study history and performance patterns.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8 hover:border-gray-700 transition-colors md:col-span-2">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">
              Progress Analytics
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Look back at your learning journey with detailed
              analytics and insights into your study
              performance.
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
      >
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl mb-3 sm:mb-4">
            How It Works
          </h2>
          <p className="text-base sm:text-xl text-gray-400">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl sm:text-2xl mx-auto mb-4 sm:mb-6">
              1
            </div>
            <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">
              Upload Your Files
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Upload your study materials or paste your
              notes directly into BrainDeck.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl sm:text-2xl mx-auto mb-4 sm:mb-6">
              2
            </div>
            <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">
              AI Generates Decks
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Our AI processes your content and generates
              comprehensive flashcard decks in seconds.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl sm:text-2xl mx-auto mb-4 sm:mb-6">
              3
            </div>
            <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">
              Start Studying
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Review your decks, track progress, and pass your
              exams with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-4xl mb-3 sm:mb-4">
            Ready to Transform Your Study Routine
          </h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90">
            Join hundreds of students who are learning smarter
            with BrainDeck
          </p>
          <Link 
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-800 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 justify-center">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-black" />
            </div>
            <span className="text-lg sm:text-xl">
              BrainDeck
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-400">
            AI-powered study deck generator for any Learner
          </p>

          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2025 BrainDeck. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

