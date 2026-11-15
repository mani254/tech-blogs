import type { Block } from 'payload'

export const CodeBlock: Block = {
  slug: 'code',
  labels: {
    singular: 'Code Snippet',
    plural: 'Code Snippets',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: 'Snippet Title',
          type: 'text',
          admin: {
            width: '40%',
            placeholder: 'e.g. Example API Handler',
          },
        },
        {
          name: 'filename',
          label: 'File Name',
          type: 'text',
          admin: {
            width: '35%',
            placeholder: 'e.g. server.ts',
          },
        },
        {
          name: 'language',
          label: 'Language',
          type: 'select',
          required: true,
          defaultValue: 'typescript',
          options: [
            { label: 'TypeScript', value: 'typescript' },
            { label: 'JavaScript', value: 'javascript' },
            { label: 'Python', value: 'python' },
            { label: 'Rust', value: 'rust' },
            { label: 'Go', value: 'go' },
            { label: 'Bash / Shell', value: 'bash' },
            { label: 'JSON', value: 'json' },
            { label: 'HTML', value: 'html' },
            { label: 'CSS / SCSS', value: 'css' },
            { label: 'SQL', value: 'sql' },
            { label: 'Markdown', value: 'markdown' },
            { label: 'YAML', value: 'yaml' },
            { label: 'Dockerfile', value: 'dockerfile' },
            { label: 'C#', value: 'csharp' },
            { label: 'Java', value: 'java' },
            { label: 'C++', value: 'cpp' },
            { label: 'PHP', value: 'php' },
            { label: 'Other / Plain Text', value: 'plaintext' },
          ],
          admin: {
            width: '25%',
          },
        },
      ],
    },
    {
      name: 'code',
      label: 'Code',
      type: 'code',
      required: true,
      admin: {
        editorOptions: {
          lineNumbers: 'on',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showLineNumbers',
          label: 'Show Line Numbers',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'startingLineNumber',
          label: 'Starting Line Number',
          type: 'number',
          defaultValue: 1,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'highlightedLines',
          label: 'Highlight Lines (e.g. "1-3, 5")',
          type: 'text',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'enableCopy',
          label: 'Enable Copy Button',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '25%',
          },
        },
      ],
    },
  ],
}
