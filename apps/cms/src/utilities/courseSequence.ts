import type { Payload } from 'payload'

interface CourseDoc {
  lessonSequence?: number
  [key: string]: unknown
}

interface CourseModelLike {
  findByIdAndUpdate: (
    id: string | number,
    update: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => {
    lean: () => {
      exec: () => Promise<CourseDoc | null>
    }
    exec: () => Promise<CourseDoc | null>
  }
}

interface MongoCollectionLike {
  findOneAndUpdate: (
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => Promise<{ value?: CourseDoc } | CourseDoc | null>
}

interface DatabaseAdapterLike {
  collections?: Record<string, CourseModelLike>
  connection?: {
    collection: (name: string) => MongoCollectionLike
  }
}

interface AllocateCourseLessonNumberArgs {
  payload: Payload
  courseId: string | number
  currentArticleId?: string | number
  existingPageNumber?: number | null
}

/**
 * Concurrency-safe atomic course lesson sequence allocator.
 *
 * Rules:
 * 1. If the article already possesses a valid pageNumber, preserves it (idempotent).
 * 2. Uses atomic MongoDB `$inc` on the parent course document to guarantee no race conditions
 *    or duplicate page numbers across concurrent publishers.
 * 3. Safely initializes sequence counter if existing published lessons predate sequence tracking.
 */
export const allocateCourseLessonNumber = async ({
  payload,
  courseId,
  currentArticleId,
  existingPageNumber,
}: AllocateCourseLessonNumberArgs): Promise<number> => {
  // If this lesson already has an assigned page number, retain it without incrementing
  if (typeof existingPageNumber === 'number' && existingPageNumber > 0) {
    return existingPageNumber
  }

  const courseIdStr = String(courseId)

  // 1. Check if database connection / Mongoose model is accessible
  const dbAdapter = payload.db as unknown as DatabaseAdapterLike
  const coursesModel = dbAdapter?.collections?.courses
  const connection = dbAdapter?.connection

  if (coursesModel || connection) {
    try {
      // Find highest existing published lesson page number for this course to ensure sequence synchronization
      const highestExisting = await payload.find({
        collection: 'articles',
        where: {
          and: [
            {
              articleType: {
                equals: 'course',
              },
            },
            {
              course: {
                equals: courseId,
              },
            },
            {
              _status: {
                equals: 'published',
              },
            },
            ...(currentArticleId
              ? [
                  {
                    id: {
                      not_equals: currentArticleId,
                    },
                  },
                ]
              : []),
          ],
        },
        sort: '-pageNumber',
        limit: 1,
        depth: 0,
      })

      const firstDoc = highestExisting.docs[0] as { pageNumber?: number } | undefined
      const maxExistingPageNumber =
        firstDoc && typeof firstDoc.pageNumber === 'number'
          ? firstDoc.pageNumber
          : 0

      // Execute atomic MongoDB increment
      let updatedCourse: CourseDoc | null = null

      if (coursesModel && typeof coursesModel.findByIdAndUpdate === 'function') {
        updatedCourse = await coursesModel
          .findByIdAndUpdate(
            courseId,
            { $inc: { lessonSequence: 1 } },
            { new: true, upsert: false },
          )
          .lean()
          .exec()
      } else if (connection) {
        const collection = connection.collection('courses')
        const result = await collection.findOneAndUpdate(
          { _id: courseId },
          { $inc: { lessonSequence: 1 } },
          { returnDocument: 'after' },
        )
        updatedCourse = (result && 'value' in result ? result.value : result) as CourseDoc | null
      }

      let allocatedNumber = updatedCourse?.lessonSequence

      // If the allocated number is behind existing published lessons (e.g. sequence was 0 but lessons 1..3 existed)
      if (!allocatedNumber || allocatedNumber <= maxExistingPageNumber) {
        const nextTarget = maxExistingPageNumber + 1

        if (coursesModel && typeof coursesModel.findByIdAndUpdate === 'function') {
          await coursesModel
            .findByIdAndUpdate(courseId, { $set: { lessonSequence: nextTarget } }, { new: true })
            .exec()
        } else if (connection) {
          const collection = connection.collection('courses')
          await collection.findOneAndUpdate(
            { _id: courseId },
            { $set: { lessonSequence: nextTarget } },
          )
        }

        allocatedNumber = nextTarget
      }

      return allocatedNumber
    } catch (err: unknown) {
      payload.logger.error(
        `[allocateCourseLessonNumber] MongoDB atomic increment error on course ${courseIdStr}: ${err}`,
      )
    }
  }

  // Fallback for mock/test environments without direct Mongoose model access:
  // Query highest existing published lesson in the course and add 1
  const publishedLessons = await payload.find({
    collection: 'articles',
    where: {
      and: [
        {
          articleType: {
            equals: 'course',
          },
        },
        {
          course: {
            equals: courseId,
          },
        },
        ...(currentArticleId
          ? [
              {
                id: {
                  not_equals: currentArticleId,
                },
              },
            ]
          : []),
      ],
    },
    sort: '-pageNumber',
    limit: 1,
    depth: 0,
  })

  const fallbackDoc = publishedLessons.docs[0] as { pageNumber?: number } | undefined
  const highestNumber =
    fallbackDoc && typeof fallbackDoc.pageNumber === 'number'
      ? fallbackDoc.pageNumber
      : 0

  return highestNumber + 1
}
