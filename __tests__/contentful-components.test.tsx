import Avatar from '@/app/avatar';
import CoverImage from '@/app/cover-image';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/contentful-image', () => {
  return function MockContentfulImage({
    alt,
    src,
  }: {
    alt: string;
    src: string;
  }) {
    return <img alt={alt} src={src} data-testid="contentful-image" />;
  };
});

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Contentful Components', () => {
  describe('Avatar Component', () => {
    it('should render avatar with name and picture', () => {
      const mockPicture = {
        url: 'https://images.ctfassets.net/test/avatar.jpg',
      };

      render(<Avatar name="John Doe" picture={mockPicture} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByAltText('John Doe')).toBeInTheDocument();
      expect(screen.getByAltText('John Doe')).toHaveAttribute(
        'src',
        mockPicture.url
      );
    });

    it('should render with different author names', () => {
      const mockPicture = {
        url: 'https://images.ctfassets.net/test/author2.jpg',
      };

      render(<Avatar name="Jane Smith" picture={mockPicture} />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should handle special characters in name', () => {
      const mockPicture = {
        url: 'https://images.ctfassets.net/test/author3.jpg',
      };

      render(<Avatar name="José María" picture={mockPicture} />);

      expect(screen.getByText('José María')).toBeInTheDocument();
    });
  });

  describe('CoverImage Component', () => {
    it('should render cover image with title', () => {
      render(
        <CoverImage
          title="Test Post Title"
          url="https://images.ctfassets.net/test/cover.jpg"
        />
      );

      expect(
        screen.getByAltText('Cover Image for Test Post Title')
      ).toBeInTheDocument();
      expect(
        screen.getByAltText('Cover Image for Test Post Title')
      ).toHaveAttribute('src', 'https://images.ctfassets.net/test/cover.jpg');
    });

    it('should render as a link when slug is provided', () => {
      render(
        <CoverImage
          title="Linked Post"
          url="https://images.ctfassets.net/test/linked.jpg"
          slug="linked-post"
        />
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/posts/linked-post');
    });

    it('should not render as a link when slug is not provided', () => {
      render(
        <CoverImage
          title="Non-linked Post"
          url="https://images.ctfassets.net/test/non-linked.jpg"
        />
      );

      expect(
        screen.queryByRole('link', { name: 'Non-linked Post' })
      ).not.toBeInTheDocument();
    });

    it('should handle long titles', () => {
      const longTitle =
        'This is a very long title that should still render correctly in the cover image component';

      render(
        <CoverImage
          title={longTitle}
          url="https://images.ctfassets.net/test/long-title.jpg"
        />
      );

      expect(
        screen.getByAltText(`Cover Image for ${longTitle}`)
      ).toBeInTheDocument();
    });
  });
});
