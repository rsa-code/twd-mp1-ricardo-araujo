import { Markdown } from '@/lib/markdown';
import { BLOCKS } from '@contentful/rich-text-types';
import { render, screen } from '@testing-library/react';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

describe('Contentful Rich Text Rendering', () => {
  describe('Basic Text Rendering', () => {
    it('should render simple paragraph', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.PARAGRAPH,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'This is a test paragraph',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
        links: {
          assets: {
            block: [],
          },
        },
      };

      render(<Markdown content={content} />);

      expect(screen.getByText('This is a test paragraph')).toBeInTheDocument();
    });

    it('should render multiple paragraphs', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.PARAGRAPH,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'First paragraph',
                  marks: [],
                  data: {},
                },
              ],
            },
            {
              nodeType: BLOCKS.PARAGRAPH,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Second paragraph',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
        links: {
          assets: {
            block: [],
          },
        },
      };

      render(<Markdown content={content} />);

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });
  });

  describe('Headings', () => {
    it('should render heading level 1', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.HEADING_1,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Main Heading',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
        links: {
          assets: {
            block: [],
          },
        },
      };

      render(<Markdown content={content} />);

      const heading = screen.getByText('Main Heading');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('should render heading level 2', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.HEADING_2,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Section Heading',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
        links: {
          assets: {
            block: [],
          },
        },
      };

      render(<Markdown content={content} />);

      const heading = screen.getByText('Section Heading');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });
  });

  describe('Lists', () => {
    it('should render unordered list', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.UL_LIST,
              data: {},
              content: [
                {
                  nodeType: BLOCKS.LIST_ITEM,
                  data: {},
                  content: [
                    {
                      nodeType: BLOCKS.PARAGRAPH,
                      data: {},
                      content: [
                        {
                          nodeType: 'text',
                          value: 'First item',
                          marks: [],
                          data: {},
                        },
                      ],
                    },
                  ],
                },
                {
                  nodeType: BLOCKS.LIST_ITEM,
                  data: {},
                  content: [
                    {
                      nodeType: BLOCKS.PARAGRAPH,
                      data: {},
                      content: [
                        {
                          nodeType: 'text',
                          value: 'Second item',
                          marks: [],
                          data: {},
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        links: {
          assets: {
            block: [],
          },
        },
      };

      render(<Markdown content={content} />);

      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText('Second item')).toBeInTheDocument();
    });

    it('should render ordered list', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.OL_LIST,
              data: {},
              content: [
                {
                  nodeType: BLOCKS.LIST_ITEM,
                  data: {},
                  content: [
                    {
                      nodeType: BLOCKS.PARAGRAPH,
                      data: {},
                      content: [
                        {
                          nodeType: 'text',
                          value: 'Step 1',
                          marks: [],
                          data: {},
                        },
                      ],
                    },
                  ],
                },
                {
                  nodeType: BLOCKS.LIST_ITEM,
                  data: {},
                  content: [
                    {
                      nodeType: BLOCKS.PARAGRAPH,
                      data: {},
                      content: [
                        {
                          nodeType: 'text',
                          value: 'Step 2',
                          marks: [],
                          data: {},
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        links: {
          assets: {
            block: [],
          },
        },
      };

      render(<Markdown content={content} />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });
  });

  describe('Embedded Assets', () => {
    it('should render embedded image asset', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.EMBEDDED_ASSET,
              data: {
                target: {
                  sys: {
                    id: 'asset-123',
                  },
                },
              },
              content: [],
            },
          ],
        },
        links: {
          assets: {
            block: [
              {
                sys: {
                  id: 'asset-123',
                },
                url: 'https://images.ctfassets.net/test/embedded-image.jpg',
                description: 'Test embedded image',
              },
            ],
          },
        },
      };

      render(<Markdown content={content} />);

      const image = screen.getByAltText('Test embedded image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        'src',
        'https://images.ctfassets.net/test/embedded-image.jpg'
      );
    });

    it('should handle missing asset gracefully', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.EMBEDDED_ASSET,
              data: {
                target: {
                  sys: {
                    id: 'non-existent-asset',
                  },
                },
              },
              content: [],
            },
          ],
        },
        links: {
          assets: {
            block: [],
          },
        },
      };

      const { container } = render(<Markdown content={content} />);

      expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('should render multiple embedded assets', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.EMBEDDED_ASSET,
              data: {
                target: {
                  sys: {
                    id: 'asset-1',
                  },
                },
              },
              content: [],
            },
            {
              nodeType: BLOCKS.EMBEDDED_ASSET,
              data: {
                target: {
                  sys: {
                    id: 'asset-2',
                  },
                },
              },
              content: [],
            },
          ],
        },
        links: {
          assets: {
            block: [
              {
                sys: {
                  id: 'asset-1',
                },
                url: 'https://images.ctfassets.net/test/image1.jpg',
                description: 'First image',
              },
              {
                sys: {
                  id: 'asset-2',
                },
                url: 'https://images.ctfassets.net/test/image2.jpg',
                description: 'Second image',
              },
            ],
          },
        },
      };

      render(<Markdown content={content} />);

      expect(screen.getByAltText('First image')).toBeInTheDocument();
      expect(screen.getByAltText('Second image')).toBeInTheDocument();
    });
  });

  describe('Complex Content', () => {
    it('should render mixed content types', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [
            {
              nodeType: BLOCKS.HEADING_1,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Article Title',
                  marks: [],
                  data: {},
                },
              ],
            },
            {
              nodeType: BLOCKS.PARAGRAPH,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Introduction paragraph',
                  marks: [],
                  data: {},
                },
              ],
            },
            {
              nodeType: BLOCKS.EMBEDDED_ASSET,
              data: {
                target: {
                  sys: {
                    id: 'asset-456',
                  },
                },
              },
              content: [],
            },
            {
              nodeType: BLOCKS.PARAGRAPH,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Conclusion paragraph',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
        links: {
          assets: {
            block: [
              {
                sys: {
                  id: 'asset-456',
                },
                url: 'https://images.ctfassets.net/test/article-image.jpg',
                description: 'Article image',
              },
            ],
          },
        },
      };

      render(<Markdown content={content} />);

      expect(screen.getByText('Article Title')).toBeInTheDocument();
      expect(screen.getByText('Introduction paragraph')).toBeInTheDocument();
      expect(screen.getByAltText('Article image')).toBeInTheDocument();
      expect(screen.getByText('Conclusion paragraph')).toBeInTheDocument();
    });
  });

  describe('Empty Content', () => {
    it('should handle empty document', () => {
      const content = {
        json: {
          nodeType: BLOCKS.DOCUMENT,
          data: {},
          content: [],
        },
        links: {
          assets: {
            block: [],
          },
        },
      };

      const { container } = render(<Markdown content={content} />);

      // Empty document should render nothing or an empty container
      expect(container.textContent).toBe('');
    });
  });
});
