import {
  getAllPosts,
  getPostAndMorePosts,
  getPreviewPostBySlug,
} from '@/lib/api';

describe('Contentful API Integration', () => {
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

  describe('getAllPosts', () => {
    it('should fetch all published posts', async () => {
      const mockResponse = {
        data: {
          postCollection: {
            items: [
              {
                slug: 'test-post-1',
                title: 'Test Post 1',
                date: '2025-01-01',
                excerpt: 'Test excerpt 1',
              },
              {
                slug: 'test-post-2',
                title: 'Test Post 2',
                date: '2025-01-02',
                excerpt: 'Test excerpt 2',
              },
            ],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      });

      const posts = await getAllPosts(false);

      expect(posts).toHaveLength(2);
      expect(posts[0].slug).toBe('test-post-1');
      expect(posts[1].slug).toBe('test-post-2');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-space-id'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-access-token',
          }),
        })
      );
    });

    it('should fetch draft posts when in draft mode', async () => {
      const mockResponse = {
        data: {
          postCollection: {
            items: [
              {
                slug: 'draft-post',
                title: 'Draft Post',
                date: '2025-01-01',
                excerpt: 'Draft excerpt',
              },
            ],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      });

      const posts = await getAllPosts(true);

      expect(posts).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-preview-token',
          }),
        })
      );
    });

    it('should return empty array when no posts exist', async () => {
      const mockResponse = {
        data: {
          postCollection: {
            items: [],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      });

      const posts = await getAllPosts(false);

      expect(posts).toEqual([]);
    });

    it('should throw error when credentials are missing', async () => {
      delete process.env.CONTENTFUL_SPACE_ID;

      await expect(getAllPosts(false)).rejects.toThrow(
        'Contentful credentials not configured'
      );
    });

    it('should throw error on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      await expect(getAllPosts(false)).rejects.toThrow(
        'Contentful API error: 500'
      );
    });
  });

  describe('getPostAndMorePosts', () => {
    it('should fetch a post and related posts', async () => {
      const mockPostResponse = {
        data: {
          postCollection: {
            items: [
              {
                slug: 'main-post',
                title: 'Main Post',
                date: '2025-01-01',
                excerpt: 'Main post excerpt',
              },
            ],
          },
        },
      };

      const mockMorePostsResponse = {
        data: {
          postCollection: {
            items: [
              {
                slug: 'related-post-1',
                title: 'Related Post 1',
                date: '2025-01-02',
              },
              {
                slug: 'related-post-2',
                title: 'Related Post 2',
                date: '2025-01-03',
              },
            ],
          },
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'application/json',
          },
          json: async () => mockPostResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'application/json',
          },
          json: async () => mockMorePostsResponse,
        });

      const result = await getPostAndMorePosts('main-post', false);

      expect(result.post).toBeDefined();
      expect(result.post.slug).toBe('main-post');
      expect(result.morePosts).toHaveLength(2);
      expect(result.morePosts[0].slug).toBe('related-post-1');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should work in preview mode', async () => {
      const mockResponse = {
        data: {
          postCollection: {
            items: [
              {
                slug: 'preview-post',
                title: 'Preview Post',
              },
            ],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      });

      await getPostAndMorePosts('preview-post', true);

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

  describe('getPreviewPostBySlug', () => {
    it('should fetch a preview post by slug', async () => {
      const mockResponse = {
        data: {
          postCollection: {
            items: [
              {
                slug: 'preview-slug',
                title: 'Preview Title',
                date: '2025-01-01',
              },
            ],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
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

    it('should return undefined when post not found', async () => {
      const mockResponse = {
        data: {
          postCollection: {
            items: [],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      });

      const post = await getPreviewPostBySlug('non-existent-slug');

      expect(post).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle non-JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'text/html',
        },
        text: async () => '<html>Error page</html>',
      });

      await expect(getAllPosts(false)).rejects.toThrow(
        'Contentful API returned non-JSON response'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network failure')
      );

      await expect(getAllPosts(false)).rejects.toThrow('Network failure');
    });

    it('should handle malformed GraphQL response', async () => {
      const mockResponse = {
        data: null,
        errors: [
          {
            message: 'GraphQL error',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      });

      const posts = await getAllPosts(false);

      expect(posts).toEqual([]);
    });
  });
});
