using MediatR;
using BookStore.Application.Common;

namespace BookStore.Application.Features.Books.UpdateBook;

public record UpdateBookCommand(
    int Id,
    decimal Price,
    int? Stock
) : IRequest<Result<bool>>;
