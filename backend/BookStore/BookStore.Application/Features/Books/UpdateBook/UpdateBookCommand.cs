using MediatR;
using BookStore.Application.Common;

namespace BookStore.Application.Features.Books.UpdateBook;

public record UpdateBookCommand(
    int Id,
    int GenreId,
    decimal Price,
    int? Stock
) : IRequest<Result<bool>>;
