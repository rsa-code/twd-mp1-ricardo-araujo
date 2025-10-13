const POST_GRAPHQL_FIELDS = `
  slug
  title
  coverImage {
    url
  }
  date
  author {
    ... on Author {
      name
      picture {
        url
      }
    }
  }
  excerpt
  content {
    json
  }
`;

async function fetchGraphQL(query: string, preview = false): Promise<any> {
  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
      next: { tags: ['posts'] },
    } as RequestInit
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('Contentful API error:', response.status, text);
    throw new Error(`Contentful API error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error(
      'Expected JSON but got:',
      contentType,
      text.substring(0, 200)
    );
    throw new Error('Contentful API returned non-JSON response');
  }

  return response.json();
}

function extractPost(fetchResponse: any): any {
  return fetchResponse?.data?.postCollection?.items?.[0];
}

function extractPostEntries(fetchResponse: any): any[] {
  if (!fetchResponse?.data?.postCollection?.items) {
    console.error('Failed to fetch posts from Contentful:', fetchResponse);
    return [];
  }
  return fetchResponse.data.postCollection.items;
}

export async function getPreviewPostBySlug(slug: string | null): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      postCollection(where: { slug: "${slug}" }, preview: true, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    true
  );
  return extractPost(entry);
}

export async function getAllPosts(isDraftMode: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(
    `query {
      postCollection(where: { slug_exists: true }, order: date_DESC, preview: ${
        isDraftMode ? 'true' : 'false'
      }) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode
  );
  return extractPostEntries(entries);
}

export async function getPostAndMorePosts(
  slug: string,
  preview: boolean
): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      postCollection(where: { slug: "${slug}" }, preview: ${
        preview ? 'true' : 'false'
      }, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview
  );
  const entries = await fetchGraphQL(
    `query {
      postCollection(where: { slug_not_in: "${slug}" }, order: date_DESC, preview: ${
        preview ? 'true' : 'false'
      }, limit: 2) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview
  );
  return {
    post: extractPost(entry),
    morePosts: extractPostEntries(entries),
  };
}
