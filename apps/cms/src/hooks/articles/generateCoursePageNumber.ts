import type { CollectionBeforeChangeHook } from 'payload'
import { allocateCourseLessonNumber } from '@/utilities/courseSequence'

/**
 * Assigns an atomic, concurrency-safe pageNumber to a course lesson upon publication.
 *
 * Enforces:
 * 1. Draft course articles DO NOT consume sequence numbers.
 * 2. On first publication, allocates the next sequential number in the parent course.
 * 3. Editing or republishing preserves the existing pageNumber.
 * 4. News and Blog articles are purged of course/pageNumber data.
 */
export const generateCoursePageNumber: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const articleType = data.articleType || originalDoc?.articleType || 'blog'

  // Non-course articles should never have course or pageNumber fields
  if (articleType !== 'course') {
    data.course = null
    data.pageNumber = null
    if (data.courseMetadata) {
      data.courseMetadata.course = null
      data.courseMetadata.pageNumber = null
    }
    return data
  }

  // If status is not published (e.g. saving draft), do not allocate page number
  const isPublishing = data._status === 'published'
  if (!isPublishing) {
    return data
  }

  const origMeta = (originalDoc as { courseMetadata?: { pageNumber?: number; course?: unknown } } | undefined)?.courseMetadata

  // Extract existing page number if previously allocated
  const existingNumber =
    data.pageNumber ??
    data.courseMetadata?.pageNumber ??
    originalDoc?.pageNumber ??
    origMeta?.pageNumber

  if (typeof existingNumber === 'number' && existingNumber > 0) {
    data.pageNumber = existingNumber
    if (data.courseMetadata) {
      data.courseMetadata.pageNumber = existingNumber
    }
    return data
  }

  // Extract course ID
  const rawCourse =
    data.course ||
    data.courseMetadata?.course ||
    originalDoc?.course ||
    origMeta?.course

  const courseId = typeof rawCourse === 'object' && rawCourse !== null
    ? (rawCourse as { id: string | number }).id
    : rawCourse

  if (!courseId) {
    throw new Error('Course lesson cannot be published without selecting a parent Course.')
  }

  // Atomically allocate the next lesson sequence number
  const assignedNumber = await allocateCourseLessonNumber({
    payload: req.payload,
    courseId,
    currentArticleId: originalDoc?.id,
    existingPageNumber: existingNumber,
  })

  data.pageNumber = assignedNumber
  data.course = courseId
  if (data.courseMetadata) {
    data.courseMetadata.pageNumber = assignedNumber
    data.courseMetadata.course = courseId
  }

  return data
}
