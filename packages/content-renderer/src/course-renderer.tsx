import {
  BookOpen,
  Clock,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react'
import type { Course, Article } from './types.js'
import { isPopulatedAuthor } from './utils/type-guards.js'
import { resolveMediaInfo } from './utils/media.js'
import { ArticleRenderer } from './article-renderer.js'

export interface CourseRendererProps {
  course: Course
  lessons?: Article[]
  currentLessonId?: string
  courseUrlPrefix?: string // e.g. '/courses'
  className?: string
}

export function CourseRenderer({
  course,
  lessons = [],
  currentLessonId,
  courseUrlPrefix = '/courses',
  className = '',
}: CourseRendererProps) {
  if (!course) {
    return null
  }

  // Sort lessons by pageNumber if available, or keep order
  const sortedLessons = [...lessons].sort((a, b) => {
    const pageA = a.courseMetadata?.pageNumber ?? a.pageNumber ?? 0
    const pageB = b.courseMetadata?.pageNumber ?? b.pageNumber ?? 0
    return pageA - pageB
  })

  // Determine current active lesson
  const currentLessonIndex = sortedLessons.findIndex(
    (l) => l.id === currentLessonId || l.slug === currentLessonId,
  )
  const currentLesson = currentLessonIndex > -1 ? sortedLessons[currentLessonIndex] : null

  const prevLesson = currentLessonIndex > 0 ? sortedLessons[currentLessonIndex - 1] : null
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < sortedLessons.length - 1
      ? sortedLessons[currentLessonIndex + 1]
      : null

  const coverMedia = resolveMediaInfo(course.coverImage, 'cover', course.title)
  const instructorName = isPopulatedAuthor(course.author) ? course.author.name : null
  const instructorDesignation = isPopulatedAuthor(course.author)
    ? course.author.designation
    : null

  return (
    <div className={`course-renderer max-w-7xl mx-auto px-4 py-8 md:py-12 ${className}`}>
      {/* Course Hero Banner */}
      <div className="mb-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-blue-700 dark:text-blue-300 border border-blue-200/50 uppercase tracking-wider text-[11px]">
                <GraduationCap className="h-3.5 w-3.5" />
                Course Curriculum
              </span>

              {course.difficulty && (
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-zinc-700 dark:text-zinc-300 capitalize text-xs">
                  {course.difficulty}
                </span>
              )}

              {course.status && (
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-emerald-700 dark:text-emerald-300 capitalize text-xs">
                  {course.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {course.title}
            </h1>

            {course.excerpt && (
              <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 font-sans max-w-3xl">
                {course.excerpt}
              </p>
            )}

            {instructorName && (
              <div className="mt-4 flex items-center gap-2.5 text-xs text-zinc-500">
                <User className="h-4 w-4" />
                <span>Instructor: </span>
                <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">
                  {instructorName}
                </strong>
                {instructorDesignation && <span>({instructorDesignation})</span>}
              </div>
            )}
          </div>

          {coverMedia.url && (
            <div className="w-full md:w-64 shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 aspect-video">
              <img
                src={coverMedia.url}
                alt={coverMedia.alt || course.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Course Layout Grid: Syllabus / Lesson Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Syllabus & Lessons */}
        <aside className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs sticky top-6">
          <div className="mb-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Syllabus ({sortedLessons.length} Lessons)
            </h2>
          </div>

          <ol className="space-y-1.5 text-sm">
            {sortedLessons.map((lesson, idx) => {
              const pageNum = lesson.courseMetadata?.pageNumber ?? lesson.pageNumber ?? idx + 1
              const isActive = lesson.id === currentLesson?.id
              const duration = lesson.courseMetadata?.lessonDuration

              return (
                <li key={lesson.id || idx}>
                  <a
                    href={`${courseUrlPrefix}/${course.slug}/${lesson.slug}`}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-500">
                        {pageNum}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </div>

                    {duration && (
                      <span className="shrink-0 flex items-center gap-1 text-[11px] text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {duration}m
                      </span>
                    )}
                  </a>
                </li>
              )
            })}
          </ol>
        </aside>

        {/* Right Area: Active Lesson Content */}
        <main className="lg:col-span-8">
          {currentLesson ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-10 shadow-xs">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-blue-600">
                Lesson {currentLesson.courseMetadata?.pageNumber ?? currentLesson.pageNumber ?? 1}
              </div>

              <ArticleRenderer
                article={currentLesson}
                showMetadataHeader={true}
                showCoverImage={true}
                showToc={true}
              />

              {/* Prev / Next Navigation Controls */}
              <div className="mt-12 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">
                {prevLesson ? (
                  <a
                    href={`${courseUrlPrefix}/${course.slug}/${prevLesson.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous: {prevLesson.title}</span>
                  </a>
                ) : (
                  <div />
                )}

                {nextLesson && (
                  <a
                    href={`${courseUrlPrefix}/${course.slug}/${nextLesson.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <span>Next: {nextLesson.title}</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-zinc-500">
              <BookOpen className="mx-auto h-10 w-10 text-zinc-400 mb-3" />
              <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                Select a lesson to begin
              </h3>
              <p className="mt-1 text-sm">
                Choose a chapter from the syllabus on the left to start reading the course material.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
