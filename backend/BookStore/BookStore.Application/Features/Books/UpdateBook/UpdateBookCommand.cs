using MediatR;
using BookStore.Application.Common;

namespace BookStore.Application.Features.Books.UpdateBook;

public record UpdateBookCommand(
    int Id,
    string Title,
    string Author,
    string Isbn,
    int? PublishedYear,
    string? CoverUrl,
    string OpenLibraryKey,
    string? Description,
    int GenreId,
    decimal Price,
    int? Stock
) : IRequest<Result<bool>>;
