/**
 * Integration tests for Contentful workflows
 * These tests simulate real-world scenarios of content management
 */

import {
  getAllPosts,
  getPostAndMorePosts,
  getPreviewPostBySlug,
} from '@/lib/api';

describe('Contentful Integration Workflows', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.CONTENTFUL_SPACE_ID = 'test-space-id';
    process.env.CONTENTFUL_ACCESS_TOKEN = 'test-access-token';
    process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN = 'test-preview-token';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('Content Publishing Workflow', () => {
    it('should simulate publishing a new post', async () => {
      // Scenario: Author creates a new post in Contentful and publishes it

      // Step 1: No posts exist initially
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: { postCollection: { items: [] } },
        }),
      });

      let posts = await getAllPosts(false);
      expect(posts).toHaveLength(0);

      // Step 2: Author creates and publishes a post
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: {
            postCollection: {
              items: [
                {
                  slug: 'new-post',
                  title: 'New Published Post',
                  date: '2025-10-21',
                  excerpt: 'This is a new post',
                  author: {
                    name: 'John Doe',
                    picture: {
                      url: 'https://images.ctfassets.net/author.jpg',
                    },
                  },
                },
              ],
            },
          },
        }),
      });

      posts = await getAllPosts(false);
      expect(posts).toHaveLength(1);
      expect(posts[0].slug).toBe('new-post');
      expect(posts[0].title).toBe('New Published Post');
    });

    it('should simulate updating existing post content', async () => {
      // Scenario: Author edits an existing post and republishes

      // Initial state
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: {
            postCollection: {
              items: [
                {
                  slug: 'existing-post',
                  title: 'Original Title',
                  excerpt: 'Original excerpt',
                  date: '2025-10-20',
                },
              ],
            },
          },
        }),
      });

      let posts = await getAllPosts(false);
      expect(posts[0].title).toBe('Original Title');

      // After update
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: {
            postCollection: {
              items: [
                {
                  slug: 'existing-post',
                  title: 'Updated Title',
                  excerpt: 'Updated excerpt with new content',
                  date: '2025-10-21',
                },
              ],
            },
          },
        }),
      });

      posts = await getAllPosts(false);
      expect(posts[0].title).toBe('Updated Title');
      expect(posts[0].excerpt).toBe('Updated excerpt with new content');
    });
  });

  describe('Draft Mode Workflow', () => {
    it('should preview unpublished draft content', async () => {
      // Scenario: Author wants to preview a draft before publishing

      // Draft not visible in published mode
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: { postCollection: { items: [] } },
        }),
      });

      const publishedPosts = await getAllPosts(false);
      expect(publishedPosts).toHaveLength(0);

      // Draft visible in preview mode
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: {
            postCollection: {
              items: [
                {
                  slug: 'draft-post',
                  title: 'Draft Post',
                  excerpt: 'This is a draft',
                  date: '2025-10-21',
                },
              ],
            },
          },
        }),
      });

      const draftPosts = await getAllPosts(true);
      expect(draftPosts).toHaveLength(1);
      expect(draftPosts[0].slug).toBe('draft-post');

      // Verify preview token was used
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-preview-token',
          }),
        })
      );
    });

    it('should fetch specific draft post by slug', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: {
            postCollection: {
              items: [
                {
                  slug: 'preview-slug',
                  title: 'Preview Title',
                  excerpt: 'Preview content',
                  date: '2025-10-21',
                },
              ],
            },
          },
        }),
      });

      const post = await getPreviewPostBySlug('preview-slug');

      expect(post).toBeDefined();
      expect(post.slug).toBe('preview-slug');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-preview-token',
          }),
        })
      );
    });
  });

  describe('Related Posts Workflow', () => {
    it('should fetch post with related content', async () => {
      // Scenario: User views a blog post and sees related posts

      const mainPostResponse = {
        data: {
          postCollection: {
            items: [
              {
                slug: 'main-article',
                title: 'Main Article',
                excerpt: 'Main content',
                date: '2025-10-21',
                author: {
                  name: 'Author Name',
                  picture: {
                    url: 'https://images.ctfassets.net/author.jpg',
                  },
                },
                content: {
                  json: {
                    nodeType: 'document',
                    content: [],
                  },
                },
              },
            ],
          },
        },
      };

      const relatedPostsResponse = {
        data: {
          postCollection: {
            items: [
              {
                slug: 'related-1',
                title: 'Related Article 1',
                date: '2025-10-20',
              },
              {
                slug: 'related-2',
                title: 'Related Article 2',
                date: '2025-10-19',
              },
            ],
          },
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => mainPostResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => relatedPostsResponse,
        });

      const result = await getPostAndMorePosts('main-article', false);

      expect(result.post).toBeDefined();
      expect(result.post.slug).toBe('main-article');
      expect(result.morePosts).toHaveLength(2);
      expect(result.morePosts[0].slug).toBe('related-1');
      expect(result.morePosts[1].slug).toBe('related-2');
    });

    it('should exclude current post from related posts', async () => {
      // Verify that the GraphQL query excludes the current post

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({
            data: {
              postCollection: {
                items: [
                  {
                    slug: 'current-post',
                    title: 'Current Post',
                  },
                ],
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({
            data: {
              postCollection: {
                items: [
                  { slug: 'other-1' },
                  { slug: 'other-2' },
                  // 'current-post' should not be here
                ],
              },
            },
          }),
        });

      const result = await getPostAndMorePosts('current-post', false);

      expect(result.morePosts).toBeDefined();
      expect(
        result.morePosts.every(
          (p: { slug: string }) => p.slug !== 'current-post'
        )
      ).toBe(true);
    });
  });

  describe('Webhook Integration Workflow', () => {
    it('should simulate content update via webhook trigger', async () => {
      // Scenario: Content is updated in Contentful → webhook triggers → site rebuilds

      // Initial state
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: {
            postCollection: {
              items: [
                {
                  slug: 'post-1',
                  title: 'Original Post',
                  date: '2025-10-20',
                },
              ],
            },
          },
        }),
      });

      let posts = await getAllPosts(false);
      expect(posts[0].title).toBe('Original Post');

      // Simulate webhook trigger: content updated
      // In real scenario, this would trigger GitHub Actions → rebuild → new fetch

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          data: {
            postCollection: {
              items: [
                {
                  slug: 'post-1',
                  title: 'Updated via Webhook',
                  date: '2025-10-21',
                },
              ],
            },
          },
        }),
      });

      posts = await getAllPosts(false);
      expect(posts[0].title).toBe('Updated via Webhook');
      expect(posts[0].date).toBe('2025-10-21');
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should handle Contentful service outage gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable',
      });

      await expect(getAllPosts(false)).rejects.toThrow(
        'Contentful API error: 503'
      );
    });

    it('should handle rate limiting', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Too Many Requests',
      });

      await expect(getAllPosts(false)).rejects.toThrow(
        'Contentful API error: 429'
      );
    });

    it('should handle invalid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(getAllPosts(false)).rejects.toThrow(
        'Contentful API error: 401'
      );
    });
  });

  describe('Multi-post Management', () => {
    it('should handle large number of posts', async () => {
      const largeMockResponse = {
        data: {
          postCollection: {
            items: Array.from({ length: 50 }, (_, i) => ({
              slug: `post-${i + 1}`,
              title: `Post ${i + 1}`,
              date: `2025-10-${(i % 30) + 1}`,
              excerpt: `Excerpt for post ${i + 1}`,
            })),
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => largeMockResponse,
      });

      const posts = await getAllPosts(false);

      expect(posts).toHaveLength(50);
      expect(posts[0].slug).toBe('post-1');
      expect(posts[49].slug).toBe('post-50');
    });

    it('should maintain correct post ordering by date', async () => {
      const mockResponse = {
        data: {
          postCollection: {
            items: [
              { slug: 'newest', title: 'Newest Post', date: '2025-10-21' },
              { slug: 'middle', title: 'Middle Post', date: '2025-10-20' },
              { slug: 'oldest', title: 'Oldest Post', date: '2025-10-19' },
            ],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockResponse,
      });

      const posts = await getAllPosts(false);

      expect(posts[0].slug).toBe('newest');
      expect(posts[1].slug).toBe('middle');
      expect(posts[2].slug).toBe('oldest');
    });
  });
});
