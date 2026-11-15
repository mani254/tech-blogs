import test, { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { allocateCourseLessonNumber } from '../src/utilities/courseSequence.ts'

describe('Course Lesson Numbering & Concurrency Sequence Tests', () => {
  it('assigns 1 to the first published lesson in a new course', async () => {
    let sequenceCounter = 0
    const mockPayload: any = {
      db: {
        collections: {
          courses: {
            findByIdAndUpdate: (_id: any, update: any) => ({
              lean: () => ({
                exec: async () => {
                  sequenceCounter += update.$inc?.lessonSequence || 0
                  return { lessonSequence: sequenceCounter }
                },
              }),
              exec: async () => {
                sequenceCounter += update.$inc?.lessonSequence || 0
                return { lessonSequence: sequenceCounter }
              },
            }),
          },
        },
      },
      find: async () => ({ docs: [] }),
      logger: { error: console.error },
    }

    const lesson1Number = await allocateCourseLessonNumber({
      payload: mockPayload,
      courseId: 'course-react-101',
    })

    assert.equal(lesson1Number, 1)
  })

  it('assigns 2 to the subsequent lesson in the same course', async () => {
    let sequenceCounter = 1
    const mockPayload: any = {
      db: {
        collections: {
          courses: {
            findByIdAndUpdate: (_id: any, update: any) => ({
              lean: () => ({
                exec: async () => {
                  sequenceCounter += update.$inc?.lessonSequence || 0
                  return { lessonSequence: sequenceCounter }
                },
              }),
              exec: async () => {
                sequenceCounter += update.$inc?.lessonSequence || 0
                return { lessonSequence: sequenceCounter }
              },
            }),
          },
        },
      },
      find: async () => ({ docs: [{ id: 'article-1', pageNumber: 1 }] }),
      logger: { error: console.error },
    }

    const lesson2Number = await allocateCourseLessonNumber({
      payload: mockPayload,
      courseId: 'course-react-101',
    })

    assert.equal(lesson2Number, 2)
  })

  it('maintains independent sequences across different courses', async () => {
    const courseCounters: Record<string, number> = {
      'course-react': 5,
      'course-rust': 0,
    }

    const mockPayload: any = {
      db: {
        collections: {
          courses: {
            findByIdAndUpdate: (id: string, update: any) => ({
              lean: () => ({
                exec: async () => {
                  courseCounters[id] = (courseCounters[id] || 0) + (update.$inc?.lessonSequence || 0)
                  return { lessonSequence: courseCounters[id] }
                },
              }),
              exec: async () => {
                courseCounters[id] = (courseCounters[id] || 0) + (update.$inc?.lessonSequence || 0)
                return { lessonSequence: courseCounters[id] }
              },
            }),
          },
        },
      },
      find: async ({ where }: any) => {
        const cId = where.and[1].course.equals
        if (cId === 'course-react') return { docs: [{ pageNumber: 5 }] }
        return { docs: [] }
      },
      logger: { error: console.error },
    }

    const nextReactLesson = await allocateCourseLessonNumber({
      payload: mockPayload,
      courseId: 'course-react',
    })
    const firstRustLesson = await allocateCourseLessonNumber({
      payload: mockPayload,
      courseId: 'course-rust',
    })

    assert.equal(nextReactLesson, 6)
    assert.equal(firstRustLesson, 1)
  })

  it('preserves existing pageNumber on edits and republishing (idempotency)', async () => {
    let mongoIncrementCalled = false
    const mockPayload: any = {
      db: {
        collections: {
          courses: {
            findByIdAndUpdate: () => {
              mongoIncrementCalled = true
              return { lean: () => ({ exec: async () => ({ lessonSequence: 99 }) }) }
            },
          },
        },
      },
      find: async () => ({ docs: [] }),
    }

    // Article already has pageNumber: 3
    const result = await allocateCourseLessonNumber({
      payload: mockPayload,
      courseId: 'course-1',
      existingPageNumber: 3,
    })

    assert.equal(result, 3)
    assert.equal(mongoIncrementCalled, false, 'Should not increment sequence for existing published lesson')
  })

  it('safely handles concurrent publication without producing duplicate sequence numbers', async () => {
    // Simulate atomic MongoDB sequence increments under concurrent requests
    let atomicMongoSequence = 10

    const mockPayload: any = {
      db: {
        collections: {
          courses: {
            findByIdAndUpdate: () => {
              // Simulate atomic returnDocument: 'after' with atomic counter increment
              atomicMongoSequence += 1
              const allocated = atomicMongoSequence
              return {
                lean: () => ({ exec: async () => ({ lessonSequence: allocated }) }),
                exec: async () => ({ lessonSequence: allocated }),
              }
            },
          },
        },
      },
      find: async () => ({ docs: [{ pageNumber: 10 }] }),
      logger: { error: console.error },
    }

    // Fire 5 concurrent publish actions
    const parallelPublishes = await Promise.all([
      allocateCourseLessonNumber({ payload: mockPayload, courseId: 'course-concurrent' }),
      allocateCourseLessonNumber({ payload: mockPayload, courseId: 'course-concurrent' }),
      allocateCourseLessonNumber({ payload: mockPayload, courseId: 'course-concurrent' }),
      allocateCourseLessonNumber({ payload: mockPayload, courseId: 'course-concurrent' }),
      allocateCourseLessonNumber({ payload: mockPayload, courseId: 'course-concurrent' }),
    ])

    // Verify all 5 numbers are distinct and sequential (11, 12, 13, 14, 15)
    const uniqueNumbers = new Set(parallelPublishes)
    assert.equal(uniqueNumbers.size, 5, 'Every concurrently published lesson must receive a distinct number')
    assert.deepEqual(parallelPublishes.sort((a, b) => a - b), [11, 12, 13, 14, 15])
  })

  it('synchronizes and initializes sequence when pre-existing lessons exist with gaps', async () => {
    // Existing published lessons exist (max pageNumber 7), but course sequence was uninitialized (0)
    let sequenceCounter = 0
    let sequenceInitializedTo: number | null = null

    const mockPayload: any = {
      db: {
        collections: {
          courses: {
            findByIdAndUpdate: (_id: any, update: any) => ({
              lean: () => ({
                exec: async () => {
                  if (update.$inc) sequenceCounter += update.$inc.lessonSequence
                  if (update.$set) {
                    sequenceCounter = update.$set.lessonSequence
                    sequenceInitializedTo = sequenceCounter
                  }
                  return { lessonSequence: sequenceCounter }
                },
              }),
              exec: async () => {
                if (update.$inc) sequenceCounter += update.$inc.lessonSequence
                if (update.$set) {
                  sequenceCounter = update.$set.lessonSequence
                  sequenceInitializedTo = sequenceCounter
                }
                return { lessonSequence: sequenceCounter }
              },
            }),
          },
        },
      },
      find: async () => ({ docs: [{ pageNumber: 7 }] }),
      logger: { error: console.error },
    }

    const assignedNumber = await allocateCourseLessonNumber({
      payload: mockPayload,
      courseId: 'legacy-course-with-gaps',
    })

    // Must jump past existing max 7 and assign 8
    assert.equal(assignedNumber, 8)
    assert.equal(sequenceInitializedTo, 8)
  })
})
