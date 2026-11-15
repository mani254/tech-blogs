import test, { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { extractTextFromLexical, extractTextFromSections } from '../src/utilities/contentExtraction.ts'
import { calculateWordCount } from '../src/utilities/wordCount.ts'
import { calculateReadingTime } from '../src/utilities/readingTime.ts'

describe('Reading Time and Word Count Tests', () => {
  it('extracts plain text from Lexical AST while excluding code blocks', () => {
    const lexicalAst = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Payload CMS v3 operates seamlessly with Next.js 15 App Router.' },
            ],
          },
          {
            type: 'code',
            children: [
              { type: 'text', text: 'const ignoreThisCodeSnippet = true; function calculate() { return 42; }' },
            ],
          },
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'This second paragraph must be counted.' },
            ],
          },
        ],
      },
    }

    const extractedText = extractTextFromLexical(lexicalAst, { excludeCode: true })
    assert.match(extractedText, /Payload CMS v3 operates seamlessly/)
    assert.match(extractedText, /This second paragraph must be counted/)
    assert.doesNotMatch(extractedText, /ignoreThisCodeSnippet/)
  })

  it('extracts text from multiple sections and mixed content blocks', () => {
    const sections = [
      {
        title: 'Section One: Architecture',
        anchorId: 'section-one-architecture',
        description: 'An introductory overview of the decoupled architecture.',
        content: [
          {
            blockType: 'richText',
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Microservices and modular monorepos provide scalability.' }],
                  },
                ],
              },
            },
          },
          {
            blockType: 'code',
            language: 'typescript',
            code: 'export const unused = 12345;',
          },
          {
            blockType: 'callout',
            variant: 'info',
            title: 'Key Architectural Takeaway',
            content: 'Always isolate database queries into clean repository patterns.',
          },
        ],
      },
      {
        title: 'Section Two: Performance Metrics',
        anchorId: 'section-two-performance-metrics',
        content: [
          {
            blockType: 'quote',
            quote: 'Simplicity is prerequisite for reliability.',
            attribution: 'Edsger W. Dijkstra',
          },
          {
            blockType: 'table',
            caption: 'Performance comparison',
            columns: [{ header: 'Metric' }, { header: 'Score' }],
            rows: [
              { cells: [{ value: 'TTFB' }, { value: '45ms' }] },
              { cells: [{ value: 'FCP' }, { value: '0.8s' }] },
            ],
          },
          {
            blockType: 'list',
            listType: 'bullet',
            items: [
              { text: 'Optimized hydration' },
              { text: 'Atomic mongo operations' },
            ],
          },
        ],
      },
    ]

    const fullText = extractTextFromSections(sections, { excludeCode: true })
    assert.match(fullText, /Section One: Architecture/)
    assert.match(fullText, /Key Architectural Takeaway/)
    assert.match(fullText, /Edsger W. Dijkstra/)
    assert.match(fullText, /TTFB/)
    assert.match(fullText, /Optimized hydration/)
    // Code block text must NOT be present
    assert.doesNotMatch(fullText, /unused = 12345/)
  })

  it('calculates word count accurately across whitespace patterns', () => {
    assert.equal(calculateWordCount(''), 0)
    assert.equal(calculateWordCount('   '), 0)
    assert.equal(calculateWordCount(null), 0)
    assert.equal(calculateWordCount('Hello world'), 2)
    assert.equal(calculateWordCount('  One   two   three   four   five  '), 5)
    assert.equal(
      calculateWordCount(
        'Building a distributed microservice mesh requires robust telemetry, observability, and decoupled asynchronous messaging.',
      ),
      13,
    )
  })

  it('calculates reading time with 200 wpm standard and 1-minute minimum', () => {
    assert.equal(calculateReadingTime(0), 0)
    assert.equal(calculateReadingTime(1), 1) // Minimum 1 min for non-empty content
    assert.equal(calculateReadingTime(150), 1) // 150 words @ 200 wpm = 1 min
    assert.equal(calculateReadingTime(200), 1) // Exactly 200 words = 1 min
    assert.equal(calculateReadingTime(201), 2) // 201 words = ceil(201/200) = 2 mins
    assert.equal(calculateReadingTime(400), 2) // 400 words = 2 mins
    assert.equal(calculateReadingTime(1000), 5) // 1000 words = 5 mins
  })
})
